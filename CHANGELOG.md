# Changelog

All notable changes to this project will be documented in this file.

## [0.3.6] - 2026-03-15
### Fixed
- Build Failure: Removed `any` types in favor of strict `CatalogFallback` mapping.
- Build Failure: Cleaned up unused imports and variables (`newFile`, `ChevronRight`).
- Build Failure: Fixed undeclared `finalId` reference in `UnifiedSubgroupEditor.tsx`.

## [0.3.5] - 2026-03-15

### Added
- Robust catalog fallback system with explicit types (movie, series, all, anime).
- Improved prefix detection logic (supporting `all:` prefix).

### Fixed
- Issue where `all:` catalogs were incorrectly matched as `series:`.
- Sidebar label shrinking on medium-sized screens.
- Missing imports in CatalogEditor.

## [0.3.4] - 2026-03-15

### Added
- Automated changelog setup with Release Drafter.
- Improved UI responsiveness and layout consistency.
- Corrected installation links in documentation.
