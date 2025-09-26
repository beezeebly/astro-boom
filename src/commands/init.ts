import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProjectOptions {
  name: string;
  newsLabel: 'news' | 'blog' | 'articles';
  teamLabel: 'people' | 'team';
  analytics: 'plausible' | 'none';
}

export async function createProject(options: ProjectOptions) {
  const projectPath = path.join(process.cwd(), options.name);

  await fs.ensureDir(projectPath);

  await createPackageJson(projectPath, options.name);
  await createAstroConfig(projectPath);
  await createTailwindConfig(projectPath);
  await createNetlifyToml(projectPath);
  await createTsConfig(projectPath);
  await createContentCollections(projectPath, options.newsLabel, options.teamLabel);
  await createLayouts(projectPath, options.newsLabel, options.teamLabel);
  await createPages(projectPath, options.newsLabel, options.teamLabel);
  await createComponents(projectPath, options.newsLabel, options.teamLabel);
  await createAdminPanel(projectPath, options.newsLabel, options.teamLabel);
  await createPublicAssets(projectPath);
  await createGitignore(projectPath);

  if (options.analytics === 'plausible') {
    await addPlausibleAnalytics(projectPath);
  }
}

async function createPackageJson(projectPath: string, name: string) {
  const packageJson = {
    name,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "astro dev",
      build: "astro build && npx pagefind --source dist",
      preview: "astro preview",
      astro: "astro"
    },
    dependencies: {
      "@astrojs/mdx": "^2.0.0",
      "@astrojs/netlify": "^4.0.0",
      "@astrojs/tailwind": "^5.0.0",
      "astro": "^4.0.0",
      "tailwindcss": "^3.4.0"
    },
    devDependencies: {
      "@pagefind/default-ui": "^1.0.0",
      "pagefind": "^1.0.0",
      "@types/node": "^20.0.0"
    }
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
}

async function createAstroConfig(projectPath: string) {
  const config = `import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [mdx(), tailwind()],
  output: 'static',
  adapter: netlify()
});`;

  await fs.writeFile(path.join(projectPath, 'astro.config.mjs'), config);
}

async function createTailwindConfig(projectPath: string) {
  const config = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`;

  await fs.writeFile(path.join(projectPath, 'tailwind.config.mjs'), config);
}

async function createNetlifyToml(projectPath: string) {
  const config = `[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "@netlify/plugin-lighthouse"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[redirects]]
  from = "/admin"
  to = "/admin/index.html"
  status = 200`;

  await fs.writeFile(path.join(projectPath, 'netlify.toml'), config);
}

async function createTsConfig(projectPath: string) {
  const config = {
    extends: "astro/tsconfigs/strict",
    compilerOptions: {
      jsx: "react-jsx"
    }
  };

  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), config, { spaces: 2 });
}

async function createContentCollections(projectPath: string, newsLabel: string, teamLabel: string) {
  const contentPath = path.join(projectPath, 'src', 'content');
  await fs.ensureDir(contentPath);

  const config = `import { z, defineCollection } from 'astro:content';

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string(),
    author: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const eventsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    start: z.date(),
    end: z.date().optional(),
    location: z.string().optional(),
    description: z.string(),
    registrationUrl: z.string().optional(),
  }),
});

const peopleCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string().optional(),
    image: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  pages: pagesCollection,
  ${newsLabel}: newsCollection,
  events: eventsCollection,
  ${teamLabel}: peopleCollection,
};`;

  await fs.writeFile(path.join(contentPath, 'config.ts'), config);

  await fs.ensureDir(path.join(contentPath, 'pages'));
  await fs.ensureDir(path.join(contentPath, newsLabel));
  await fs.ensureDir(path.join(contentPath, 'events'));
  await fs.ensureDir(path.join(contentPath, teamLabel));

  const aboutContent = `---
title: "About Us"
description: "Learn more about our community"
---

# About Our Community

We are a vibrant community dedicated to making a positive impact in our local area.

## Our Mission

To bring people together and create positive change through community action and collaboration.

## Our Values

- **Inclusivity**: Everyone is welcome
- **Sustainability**: Building for the future
- **Collaboration**: Working together
- **Transparency**: Open and honest communication`;

  await fs.writeFile(path.join(contentPath, 'pages', 'about.md'), aboutContent);
}

async function createLayouts(projectPath: string, newsLabel: string, teamLabel: string) {
  const layoutPath = path.join(projectPath, 'src', 'layouts');
  await fs.ensureDir(layoutPath);

  // Capitalize first letter for display
  const newsTitle = newsLabel.charAt(0).toUpperCase() + newsLabel.slice(1);
  const teamTitle = teamLabel.charAt(0).toUpperCase() + teamLabel.slice(1);

  const baseLayout = `---
export interface Props {
  title: string;
  description?: string;
}

const { title, description = 'A modern community website' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
  </head>
  <body class="min-h-screen bg-white text-gray-900">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a href="/" class="text-xl font-bold text-primary">Community Site</a>
          </div>
          <div class="flex items-center space-x-8">
            <a href="/about" class="text-gray-700 hover:text-primary">About</a>
            <a href="/${newsLabel}" class="text-gray-700 hover:text-primary">${newsTitle}</a>
            <a href="/events" class="text-gray-700 hover:text-primary">Events</a>
            <a href="/${teamLabel}" class="text-gray-700 hover:text-primary">${teamTitle}</a>
            <a href="/contact" class="text-gray-700 hover:text-primary">Contact</a>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <slot />
    </main>

    <footer class="bg-gray-100 mt-20">
      <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">About Us</h3>
            <p class="text-gray-600">Building community through collaboration and action.</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li><a href="/about" class="text-gray-600 hover:text-primary">About</a></li>
              <li><a href="/${newsLabel}" class="text-gray-600 hover:text-primary">${newsTitle}</a></li>
              <li><a href="/events" class="text-gray-600 hover:text-primary">Events</a></li>
              <li><a href="/${teamLabel}" class="text-gray-600 hover:text-primary">${teamTitle}</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Connect</h3>
            <p class="text-gray-600">Follow us on social media</p>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Community Site. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <script src="/pagefind/pagefind-ui.js" is:inline></script>
    <script is:inline>
      window.addEventListener('DOMContentLoaded', () => {
        new PagefindUI({ element: "#search" });
      });
    </script>
  </body>
</html>`;

  await fs.writeFile(path.join(layoutPath, 'BaseLayout.astro'), baseLayout);
}

async function createPages(projectPath: string, newsLabel: string, teamLabel: string) {
  // Capitalize first letter for display
  const newsTitle = newsLabel.charAt(0).toUpperCase() + newsLabel.slice(1);
  const teamTitle = teamLabel.charAt(0).toUpperCase() + teamLabel.slice(1);
  const newsPlural = newsLabel === 'blog' ? 'posts' : newsLabel === 'articles' ? 'articles' : 'articles';
  const pagesPath = path.join(projectPath, 'src', 'pages');
  await fs.ensureDir(pagesPath);

  const indexPage = `---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import Features from '../components/Features.astro';
import LatestNews from '../components/LatestNews.astro';
import UpcomingEvents from '../components/UpcomingEvents.astro';
---

<BaseLayout title="Welcome - Community Site">
  <Hero />
  <Features />

  <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <LatestNews />
      <UpcomingEvents />
    </div>
  </div>

  <section class="bg-primary text-white py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl font-bold mb-4">Get Involved</h2>
      <p class="text-xl mb-8">Join our community and make a difference</p>
      <div class="flex justify-center space-x-4">
        <a href="/volunteer" class="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
          Volunteer
        </a>
        <a href="/contact" class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary">
          Contact Us
        </a>
      </div>
    </div>
  </section>

  <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div id="search"></div>
  </div>
</BaseLayout>`;

  await fs.writeFile(path.join(pagesPath, 'index.astro'), indexPage);

  const contactPage = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Contact Us">
  <div class="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold mb-8">Contact Us</h1>

    <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" class="space-y-6">
      <input type="hidden" name="form-name" value="contact" />
      <p hidden>
        <label>Don't fill this out: <input name="bot-field" /></label>
      </p>

      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" name="name" id="name" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" id="email" required
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
      </div>

      <div>
        <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
        <textarea name="message" id="message" rows="5" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"></textarea>
      </div>

      <button type="submit"
              class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
        Send Message
      </button>
    </form>
  </div>
</BaseLayout>`;

  await fs.writeFile(path.join(pagesPath, 'contact.astro'), contactPage);

  // Create news list page
  const newsListPage = `---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const newsEntries = await getCollection('${newsLabel}');
const sortedNews = newsEntries
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<BaseLayout title="${newsTitle}">
  <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold mb-8">${newsTitle}</h1>

    {sortedNews.length > 0 ? (
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNews.map((entry) => (
          <article class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            {entry.data.image && (
              <img src={entry.data.image} alt={entry.data.title}
                   class="w-full h-48 object-cover rounded-lg mb-4" />
            )}
            <h2 class="text-xl font-semibold mb-2">
              <a href={'/${newsLabel}/' + entry.slug} class="hover:text-primary">
                {entry.data.title}
              </a>
            </h2>
            <time class="text-sm text-gray-500">
              {entry.data.date.toLocaleDateString()}
            </time>
            {entry.data.author && (
              <p class="text-sm text-gray-600 mt-1">By {entry.data.author}</p>
            )}
            <p class="text-gray-600 mt-3">{entry.data.summary}</p>
            <a href={'/${newsLabel}/' + entry.slug} class="text-primary hover:underline mt-3 inline-block">
              Read more →
            </a>
          </article>
        ))}
      </div>
    ) : (
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg mb-4">No ${newsPlural} have been published yet.</p>
        <p class="text-gray-500">Check back soon for updates!</p>
      </div>
    )}
  </div>
</BaseLayout>`;

  await fs.writeFile(path.join(pagesPath, `${newsLabel}.astro`), newsListPage);

  // Create events list page
  const eventsListPage = `---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const events = await getCollection('events');
const now = new Date();

const upcomingEvents = events
  .filter(event => event.data.start > now)
  .sort((a, b) => a.data.start.getTime() - b.data.start.getTime());

const pastEvents = events
  .filter(event => event.data.start <= now)
  .sort((a, b) => b.data.start.getTime() - a.data.start.getTime());
---

<BaseLayout title="Events">
  <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold mb-8">Events</h1>

    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Upcoming Events</h2>
      {upcomingEvents.length > 0 ? (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingEvents.map((event) => (
            <div class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 class="text-xl font-semibold mb-2">
                <a href={'/events/' + event.slug} class="hover:text-primary">
                  {event.data.title}
                </a>
              </h3>
              <div class="text-sm text-gray-600 mb-3">
                <p>📅 {event.data.start.toLocaleDateString()} at {event.data.start.toLocaleTimeString()}</p>
                {event.data.location && (
                  <p>📍 {event.data.location}</p>
                )}
              </div>
              <p class="text-gray-600 mb-4">{event.data.description}</p>
              {event.data.registrationUrl && (
                <a href={event.data.registrationUrl} target="_blank" rel="noopener noreferrer"
                   class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  Register Now
                </a>
              )}
              <a href={'/events/' + event.slug} class="text-primary hover:underline ml-4 inline-block">
                Learn more →
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div class="bg-gray-50 rounded-lg p-8 text-center">
          <p class="text-gray-600 text-lg mb-2">No upcoming events scheduled at this time.</p>
          <p class="text-gray-500">Check back soon for new events!</p>
        </div>
      )}
    </div>

    {pastEvents.length > 0 && (
      <div>
        <h2 class="text-2xl font-semibold mb-6">Past Events</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastEvents.slice(0, 4).map((event) => (
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-xl font-semibold mb-2">
                <a href={'/events/' + event.slug} class="hover:text-primary">
                  {event.data.title}
                </a>
              </h3>
              <p class="text-sm text-gray-500 mb-2">
                {event.data.start.toLocaleDateString()}
              </p>
              <p class="text-gray-600">{event.data.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</BaseLayout>`;

  await fs.writeFile(path.join(pagesPath, 'events.astro'), eventsListPage);

  // Create people list page
  const peopleListPage = `---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const people = await getCollection('${teamLabel}');
const sortedPeople = people.sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout title="Our ${teamTitle}">
  <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold mb-8">Our ${teamTitle}</h1>

    {sortedPeople.length > 0 ? (
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPeople.map((person) => (
          <div class="text-center">
            {person.data.image ? (
              <img src={person.data.image} alt={person.data.name}
                   class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
            ) : (
              <div class="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                <span class="text-3xl text-gray-500">👤</span>
              </div>
            )}
            <h3 class="text-xl font-semibold">{person.data.name}</h3>
            <p class="text-primary mb-2">{person.data.role}</p>
            {person.data.bio && (
              <p class="text-gray-600">{person.data.bio}</p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div class="text-center py-12">
        <p class="text-gray-600 text-lg mb-4">${teamTitle} information coming soon.</p>
        <p class="text-gray-500">We're working on updating our ${teamLabel} page.</p>
      </div>
    )}
  </div>
</BaseLayout>`;

  await fs.writeFile(path.join(pagesPath, `${teamLabel}.astro`), peopleListPage);

  // Create dynamic news pages directory
  const newsPath = path.join(pagesPath, newsLabel);
  await fs.ensureDir(newsPath);

  const newsDetailPage = `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const newsEntries = await getCollection('${newsLabel}');
  return newsEntries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<BaseLayout title={entry.data.title}>
  <article class="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">{entry.data.title}</h1>
      <div class="text-gray-600">
        <time>{entry.data.date.toLocaleDateString()}</time>
        {entry.data.author && (
          <span> • By {entry.data.author}</span>
        )}
      </div>
    </header>

    {entry.data.image && (
      <img src={entry.data.image} alt={entry.data.title}
           class="w-full rounded-lg mb-8" />
    )}

    <div class="prose prose-lg max-w-none">
      <p class="lead text-xl text-gray-700 mb-6">{entry.data.summary}</p>
      <Content />
    </div>

    <div class="mt-12 pt-8 border-t">
      <a href="/${newsLabel}" class="text-primary hover:underline">← Back to all ${newsLabel}</a>
    </div>
  </article>
</BaseLayout>`;

  await fs.writeFile(path.join(newsPath, '[slug].astro'), newsDetailPage);

  // Create dynamic events pages directory
  const eventsPath = path.join(pagesPath, 'events');
  await fs.ensureDir(eventsPath);

  const eventDetailPage = `---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const events = await getCollection('events');
  return events.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<BaseLayout title={entry.data.title}>
  <article class="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">{entry.data.title}</h1>
      <div class="bg-gray-50 rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold text-gray-700 mb-2">Date & Time</h3>
            <p>📅 {entry.data.start.toLocaleDateString()}</p>
            <p>🕐 {entry.data.start.toLocaleTimeString()}</p>
            {entry.data.end && (
              <p>Until {entry.data.end.toLocaleTimeString()}</p>
            )}
          </div>
          {entry.data.location && (
            <div>
              <h3 class="font-semibold text-gray-700 mb-2">Location</h3>
              <p>📍 {entry.data.location}</p>
            </div>
          )}
        </div>
        {entry.data.registrationUrl && (
          <div class="mt-6">
            <a href={entry.data.registrationUrl} target="_blank" rel="noopener noreferrer"
               class="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-block">
              Register for this Event
            </a>
          </div>
        )}
      </div>
    </header>

    <div class="prose prose-lg max-w-none">
      <p class="lead text-xl text-gray-700 mb-6">{entry.data.description}</p>
      <Content />
    </div>

    <div class="mt-12 pt-8 border-t">
      <a href="/events" class="text-primary hover:underline">← Back to all events</a>
    </div>
  </article>
</BaseLayout>`;

  await fs.writeFile(path.join(eventsPath, '[slug].astro'), eventDetailPage);
}

async function createComponents(projectPath: string, newsLabel: string, teamLabel: string) {
  const componentsPath = path.join(projectPath, 'src', 'components');
  await fs.ensureDir(componentsPath);

  // Capitalize first letter for display
  const newsTitle = newsLabel.charAt(0).toUpperCase() + newsLabel.slice(1);

  const heroComponent = `---
---

<section class="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-5xl font-bold text-gray-900 mb-6">
        Welcome to Our Community
      </h1>
      <p class="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
        Building a better future together through collaboration, innovation, and community action.
      </p>
      <div class="flex justify-center space-x-4">
        <a href="/about" class="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Learn More
        </a>
        <a href="/events" class="bg-white text-primary px-8 py-3 rounded-lg font-semibold border-2 border-primary hover:bg-gray-50">
          View Events
        </a>
      </div>
    </div>
  </div>
</section>`;

  await fs.writeFile(path.join(componentsPath, 'Hero.astro'), heroComponent);

  const featuresComponent = `---
const features = [
  {
    title: "Community Events",
    description: "Regular events bringing people together",
    icon: "📅"
  },
  {
    title: "Volunteer Opportunities",
    description: "Make a difference in your community",
    icon: "🤝"
  },
  {
    title: "Resources & Support",
    description: "Access helpful resources and get support",
    icon: "📚"
  }
];
---

<section class="py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-900">What We Do</h2>
      <p class="mt-4 text-lg text-gray-600">Supporting our community in meaningful ways</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div class="text-4xl mb-4">{feature.icon}</div>
          <h3 class="text-xl font-semibold mb-2">{feature.title}</h3>
          <p class="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>`;

  await fs.writeFile(path.join(componentsPath, 'Features.astro'), featuresComponent);

  const latestNewsComponent = `---
import { getCollection } from 'astro:content';

const newsEntries = await getCollection('${newsLabel}');
const latestNews = newsEntries
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 3);
---

<div>
  <h2 class="text-2xl font-bold mb-6">Latest ${newsTitle}</h2>
  {latestNews.length > 0 ? (
    <div class="space-y-4">
      {latestNews.map((entry) => (
        <article class="border-l-4 border-primary pl-4">
          <h3 class="font-semibold text-lg">
            <a href={'/${newsLabel}/' + entry.slug} class="hover:text-primary">
              {entry.data.title}
            </a>
          </h3>
          <time class="text-sm text-gray-500">
            {entry.data.date.toLocaleDateString()}
          </time>
          <p class="text-gray-600 mt-1">{entry.data.summary}</p>
        </article>
      ))}
    </div>
  ) : (
    <p class="text-gray-600">No ${newsLabel} yet.</p>
  )}
</div>`;

  await fs.writeFile(path.join(componentsPath, 'LatestNews.astro'), latestNewsComponent);

  const upcomingEventsComponent = `---
import { getCollection } from 'astro:content';

const events = await getCollection('events');
const upcomingEvents = events
  .filter(event => event.data.start > new Date())
  .sort((a, b) => a.data.start.getTime() - b.data.start.getTime())
  .slice(0, 3);
---

<div>
  <h2 class="text-2xl font-bold mb-6">Upcoming Events</h2>
  {upcomingEvents.length > 0 ? (
    <div class="space-y-4">
      {upcomingEvents.map((event) => (
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-semibold text-lg">
            <a href={'/events/' + event.slug} class="hover:text-primary">
              {event.data.title}
            </a>
          </h3>
          <p class="text-sm text-gray-600">
            {event.data.start.toLocaleDateString()} at {event.data.start.toLocaleTimeString()}
          </p>
          {event.data.location && (
            <p class="text-sm text-gray-500">📍 {event.data.location}</p>
          )}
          <p class="text-gray-600 mt-2">{event.data.description}</p>
        </div>
      ))}
    </div>
  ) : (
    <p class="text-gray-600">No upcoming events scheduled.</p>
  )}
</div>`;

  await fs.writeFile(path.join(componentsPath, 'UpcomingEvents.astro'), upcomingEventsComponent);
}

async function createAdminPanel(projectPath: string, newsLabel: string, teamLabel: string) {
  const adminPath = path.join(projectPath, 'public', 'admin');
  await fs.ensureDir(adminPath);

  // Capitalize first letter for display
  const newsTitle = newsLabel.charAt(0).toUpperCase() + newsLabel.slice(1);
  const teamTitle = teamLabel.charAt(0).toUpperCase() + teamLabel.slice(1);

  const adminHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
    <link href="https://unpkg.com/sveltia-cms@^0.39.0/dist/sveltia-cms.css" rel="stylesheet" />
  </head>
  <body>
    <script src="https://unpkg.com/sveltia-cms@^0.39.0/dist/sveltia-cms.js" type="module"></script>
    <script>
      // Initialize Sveltia CMS
      window.CMS.init();
    </script>
  </body>
</html>`;

  await fs.writeFile(path.join(adminPath, 'index.html'), adminHtml);

  const adminConfig = `backend:
  name: git-gateway
  branch: main

media_folder: "public/uploads"
public_folder: "/uploads"

collections:
  - name: "pages"
    label: "Pages"
    folder: "src/content/pages"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Description", name: "description", widget: "text", required: false }
      - { label: "Draft", name: "draft", widget: "boolean", default: false }
      - { label: "Body", name: "body", widget: "markdown" }

  - name: "${newsLabel}"
    label: "${newsTitle}"
    folder: "src/content/${newsLabel}"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Summary", name: "summary", widget: "text" }
      - { label: "Author", name: "author", widget: "string", required: false }
      - { label: "Featured Image", name: "image", widget: "image", required: false }
      - { label: "Draft", name: "draft", widget: "boolean", default: false }
      - { label: "Body", name: "body", widget: "markdown" }

  - name: "events"
    label: "Events"
    folder: "src/content/events"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Start Date/Time", name: "start", widget: "datetime" }
      - { label: "End Date/Time", name: "end", widget: "datetime", required: false }
      - { label: "Location", name: "location", widget: "string", required: false }
      - { label: "Description", name: "description", widget: "text" }
      - { label: "Registration URL", name: "registrationUrl", widget: "string", required: false }
      - { label: "Body", name: "body", widget: "markdown" }

  - name: "${teamLabel}"
    label: "${teamTitle}"
    folder: "src/content/${teamLabel}"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Name", name: "name", widget: "string" }
      - { label: "Role", name: "role", widget: "string" }
      - { label: "Bio", name: "bio", widget: "text", required: false }
      - { label: "Photo", name: "image", widget: "image", required: false }
      - { label: "Order", name: "order", widget: "number", default: 0 }
      - { label: "Body", name: "body", widget: "markdown", required: false }`;

  await fs.writeFile(path.join(adminPath, 'config.yml'), adminConfig);
}

async function createPublicAssets(projectPath: string) {
  const publicPath = path.join(projectPath, 'public');
  await fs.ensureDir(publicPath);
  await fs.ensureDir(path.join(publicPath, 'uploads'));

  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#2563eb"/>
  <text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="50" font-weight="bold">C</text>
</svg>`;

  await fs.writeFile(path.join(publicPath, 'favicon.svg'), favicon);
}

async function createGitignore(projectPath: string) {
  const gitignore = `# dependencies
node_modules/

# build output
dist/
.output/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production

# macOS
.DS_Store

# editor
.vscode/
.idea/

# misc
.netlify/`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
}

async function addPlausibleAnalytics(projectPath: string) {
  const layoutPath = path.join(projectPath, 'src', 'layouts', 'BaseLayout.astro');
  const layoutContent = await fs.readFile(layoutPath, 'utf-8');

  const plausibleScript = `    <script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>`;

  const updatedLayout = layoutContent.replace(
    '</head>',
    `${plausibleScript}\n  </head>`
  );

  await fs.writeFile(layoutPath, updatedLayout);
}