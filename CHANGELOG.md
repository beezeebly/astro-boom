# Changelog

All notable changes to this project will be documented in this file.

## [0.0.5] - 2025-01-27

### Added
- Interactive prompt to auto-install dependencies and start dev server after project creation
- `--auto` flag for non-interactive mode to automatically set up and run projects
- Improved next steps display with color-coded instructions

### Changed
- Updated all generated project dependencies to latest versions:
  - Astro: 4.0.0 → 5.14.1 (major upgrade)
  - Tailwind CSS: 3.4.0 → 4.1.13 (major upgrade with CSS-based config)
  - @astrojs/mdx: 2.0.0 → 4.3.6
  - @astrojs/netlify: 4.0.0 → 6.5.11
  - pagefind: 1.0.0 → 1.4.0
  - @types/node: 20.0.0 → 24.5.2
- Migrated from Tailwind CSS v3 JavaScript config to v4 CSS-based configuration
- Replaced @astrojs/tailwind integration with @tailwindcss/vite plugin
- Fixed Spinner import for better compatibility

### Fixed
- Resolved React/Ink compatibility issues with ink-spinner
- Fixed Tailwind v4 custom utility syntax
- Improved error handling in auto-setup flow

## [0.0.4] - 2025-01-26

### Added
- Interactive option to automatically install dependencies and start dev server after project creation
- `--auto` flag for non-interactive mode to auto-install and run dev server
- Clear next steps display after project creation

### Changed
- **BREAKING**: Updated all template dependencies to latest versions:
  - Astro: 4.0.0 → 5.14.1
  - Tailwind CSS: 3.4.0 → 4.1.13 (migrated to CSS-based config)
  - @astrojs/mdx: 2.0.0 → 4.3.6
  - @astrojs/netlify: 4.0.0 → 6.5.11
  - pagefind: 1.0.0 → 1.4.0
- **BREAKING**: Replaced Decap CMS with Sveltia CMS for better performance and compatibility
  - Eliminates all React dependency conflicts
  - 3x smaller bundle size (< 500KB vs 1.5MB)
  - Faster content operations with GraphQL
  - Better mobile support
- **BREAKING**: Migrated to Tailwind CSS v4 with CSS-based configuration
  - Removed @astrojs/tailwind integration
  - Added @tailwindcss/vite plugin
  - Custom colors now use CSS variables and @utility directives
- Updated all CLI dependencies to latest versions:
  - chalk: 5.3.0 → 5.6.2
  - commander: 11.1.0 → 14.0.1
  - execa: 8.0.1 → 9.6.0
  - ink: 4.4.1 → 6.3.1
  - ink-select-input: 5.0.0 → 6.2.0 (fixes lodash.isequal deprecation)
  - ink-text-input: 5.0.1 → 6.0.0
  - ora: 7.0.1 → 9.0.0
  - react: 18.3.1 → 19.1.1
  - @types/node: 20.19.17 → 24.5.2
  - @types/react: 18.3.24 → 19.1.14
- Updated npm version badge to use shields.io for real-time updates

### Fixed
- Added help flag handling to prevent Ink initialization errors
- Fixed npm deprecation warnings for lodash.isequal
- Resolved all peer dependency conflicts in generated projects

## [0.0.3] - 2025-01-25

### Added
- Customizable collection names (News/Blog/Articles and People/Team)
- List and detail pages for all collections

## [0.0.2] - Previous release

### Added
- Initial Astro Boom functionality
- Astro + Tailwind + Decap CMS integration
- Interactive CLI with Ink
- GitHub and Netlify integration

## [0.0.1] - Initial release

### Added
- Basic project scaffolding
- Core template structure