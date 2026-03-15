# Changelog

## [0.3.9] - 2026-03-15
### Added
- Catalog Manager: Added "Orphaned" catalog detection to identify stale entries in side-arrays.
- Catalog Manager: Added "Delete All" button for bulk removal of disabled and orphaned catalogs.
- UI: Implemented a custom premium-styled confirmation dialog for bulk deletion.

### Fixed
- Catalog Manager: Resolved bug where hidden catalogs with Top Row active were incorrectly shown as "Enabled".
- UI: Fixed hover contrast on the "Delete All" button for better readability.

## [0.3.8] - 2026-03-15
### Added
- PWA: Added exclusive iOS Home Screen icon based on user-provided clown image.
- PWA: Updated `apple-touch-icon` metadata while preserving browser tab icons.

All notable changes to this project will be documented in this file.

## [0.3.7] - 2026-03-15
### Fixed
- Build Failure: Removed remaining `any` types in `ConfigContext.tsx` and `MainEditor.tsx`.
- UI: Fixed version display typo (double 'v').

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
