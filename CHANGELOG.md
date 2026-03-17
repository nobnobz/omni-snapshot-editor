# Changelog

## [0.4.2] - 2026-03-17
### Added
- **AIOMetadata URL Import**: Support for importing catalogs directly via manifest URLs with integrated fetching.
- **Session Persistence**: Implemented `localStorage` persistence (`omni_editor_session`) with auto-save and state recovery.
- **Branding**: Restored enlarged logo dimensions across UI (140px landing, 64px sidebar, 48px mobile header).
- **UX**: New scroll-sync logic to maintain reading position during window resize and layout transitions.
- **UX**: Icon-only mobile FAB for a cleaner, non-overlapping navigation experience.

### Changed
- **AIOMetadata Integration**: Updated processing logic to support various export formats and improved catalog type extraction.
- **UI Branding**: Standardized to a completely static logo presentation for maximum sharpness and stability.
- **UI Consistency**: Unified toolbar button heights (h-10) and interaction states across all editor sections.

### Fixed
- **Export Robustness**: Improved JSON export by rigorously pruning deleted catalogs and synchronizing manifest states with legacy side-arrays.
- **UI Cleanup**: Removed all accidental rendering artifacts ("Riverside" text, blue focus boxes, and interpolation blur).
- **Layout**: Resolved bottom-padding and overlap issues on medium-sized tablet displays.

## [0.4.1] - 2026-03-16
### Added
- General Settings: New "Shelf Ordering" editor with drag-and-drop support.
- General Settings: New "Stream Element Selection" editor with visibility toggles and reordering.

### Fixed
- UI Smoothing: Resolved "jumping" behavior during drag-and-drop by implementing portal rendering and transition handling.
- UI Smoothing: Standardized container styling and item spacing for a more consistent user experience.


## [0.4.0] - 2026-03-16
### Added
- PWA: Updated iOS Home Screen icon with high-quality clown head design (180x180).

### Fixed
- Catalog Manager: Improved "Delete All" robustness by pruning deleted catalogs from all exported fields in the JSON.
- Catalog Manager: Enhanced visibility detection to correctly identify active "Header" and "Top Row" catalogs (marked as "Hidden" instead of "Orphaned").
- Infrastructure: Synchronized manifest-style catalog state with legacy side-arrays for enhanced compatibility across bot versions.

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
