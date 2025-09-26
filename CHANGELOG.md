# Changelog

All notable changes to this project will be documented in this file.

## [0.0.4] - 2025-01-26

### Changed
- **BREAKING**: Replaced Decap CMS with Sveltia CMS for better performance and compatibility
  - Eliminates all React dependency conflicts
  - 3x smaller bundle size (< 500KB vs 1.5MB)
  - Faster content operations with GraphQL
  - Better mobile support
- Updated all dependencies to latest versions:
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