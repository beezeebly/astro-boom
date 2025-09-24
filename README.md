# Astro Boom! 💥

A powerful command-line tool to quickly scaffold modern static websites with Astro, Tailwind CSS, Decap CMS, and automatic deployment to Netlify.

## Features

🚀 **Modern Stack**
- **Astro** - Lightning-fast static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **MDX** - Markdown with JSX components
- **Decap CMS** (formerly Netlify CMS) - Git-based content management
- **Pagefind** - Static search that works offline
- **Netlify Forms** - Serverless form handling
- **Plausible Analytics** - Privacy-first analytics

📦 **Out of the Box**
- Pre-configured content collections (Pages, News, Events, People)
- Responsive navigation and footer
- Contact and volunteer forms
- Event management with date filtering
- SEO-friendly structure
- Accessibility-first approach
- 90-100 Lighthouse score

🎨 **Beautiful CLI**
- Interactive setup with Ink (React for CLIs)
- Progress indicators and error handling
- GitHub repository creation
- Automatic Netlify deployment

## Installation

```bash
npm install -g astro-boom
```

Or use directly with npx (recommended):

```bash
npx astro-boom
```

## Usage

Run the CLI and follow the interactive prompts:

```bash
astro-boom
```

Or use with npm/yarn create commands:

```bash
# npm
npm create astro-boom@latest

# yarn
yarn create astro-boom

# pnpm
pnpm create astro-boom
```

The CLI will ask you:
1. **Project name** - Your site's directory name
2. **GitHub repository** - Optionally create a private GitHub repo
3. **Netlify deployment** - Optionally deploy to Netlify
4. **Analytics** - Choose between Plausible or none

## Project Structure

```
your-site/
├── src/
│   ├── content/          # Content collections
│   │   ├── pages/        # Static pages
│   │   ├── news/         # News articles
│   │   ├── events/       # Events
│   │   └── people/       # Team members
│   ├── layouts/          # Page layouts
│   ├── components/       # Reusable components
│   └── pages/           # Astro pages
├── public/
│   ├── admin/           # Decap CMS admin panel
│   └── uploads/         # Media uploads
├── astro.config.mjs     # Astro configuration
├── tailwind.config.mjs  # Tailwind configuration
└── netlify.toml         # Netlify configuration
```

## Content Management

Access the CMS at `/admin` after deploying to Netlify:

1. Enable Identity in Netlify dashboard
2. Set up Git Gateway
3. Invite users or enable registration
4. Start editing content through the web interface

## Development

After creating your site:

```bash
cd your-site
npm install
npm run dev
```

Visit `http://localhost:4321` to see your site.

## Building and Deployment

### Build locally
```bash
npm run build
```

### Deploy to Netlify

#### Option 1: Through CLI (if Netlify CLI is installed)
```bash
netlify deploy --dir=dist --prod
```

#### Option 2: Through Netlify Dashboard
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

## Customization

### Colors and Typography
Edit `tailwind.config.mjs` to customize colors and fonts:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    },
    fontFamily: {
      sans: ['YourFont', 'system-ui', 'sans-serif'],
    },
  },
}
```

### Add New Content Types
1. Define collection in `/src/content/config.ts`
2. Add to CMS config in `/public/admin/config.yml`
3. Create display components

### Forms
Add new Netlify Forms by including the data attribute:

```html
<form name="volunteer" method="POST" data-netlify="true">
  <!-- Your form fields -->
</form>
```

## Environment Variables

For Plausible Analytics, update the domain in `BaseLayout.astro`:

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Requirements

- Node.js 18+
- npm or yarn
- Git (for GitHub integration)
- GitHub CLI (optional, for repo creation)
- Netlify CLI (optional, for deployment)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Beez Fedia

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/beezeebly/astro-boom).

---

💥 **Boom!** Built with ❤️ by Beez Fedia