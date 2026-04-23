# Changelog

## [0.6.7] - 2026-04-23
### Changed
- Bumped the in-app version display to `v0.6.7`.
- Refined the update flow copy in the UI to better match the simplified Basic and Advanced import flow.

### Fixed
- Fixed the update-from-template process so renamed main groups and layout changes are recognized as updates instead of new groups.
- Improved main-group matching so layout updates land in the existing `main_catalog_groups` entry without disturbing subgroup order.

## [0.6.6] - 2026-04-18
### Added
- Prepared the UME v3.0 release notes and refreshed the template guidance in the editor docs.

### Changed
- Bumped the in-app version display to `v0.6.6`.
- Promoted the latest pattern editor polish, including the colored regex tags, to `main`.

## [0.6.5] - 2026-04-03
### Added
- Added support for Letterbox catalogs in AIOMetadata export.

### Changed
- Optimized the **Update From Existing Setup** UI to only display the "NEW" badge on main groups that are actually new, excluding existing groups with new content for better clarity.

## [0.6.4] - 2026-04-02
### Changed
- bug fixes and improvements

## [0.6.3] - 2026-04-02
### Changed
- Polished mobile dialog hierarchy across subgroup catalog picking, AIOMetadata export controls, and the import review flow for a calmer, more consistent UI.
- Simplified the **Advanced Update** review header by replacing the oversized updates bar with a compact count label.
- Refined AIOMetadata quick-select chips and restored the UME Sorting info copy from `Targets` back to `Groups`.

### Fixed
- Fixed the sticky subgroup catalog headers in the mobile `Select Catalog` popup so list rows no longer bleed through while scrolling.
- Fixed the AIOMetadata refresh/loading motion by replacing the broken generic spinner with a dedicated sync animation.

## [0.6.2] - 2026-04-02
### Changed
- Polished the mobile UI across dialogs, popups, guides, and editor panels for cleaner spacing and stronger visual hierarchy.
- Reworked the **Update From Existing Setup** mobile review flow with clearer stacked controls, cleaner row layouts, and a larger poster-image editor on phones.
- Smoothed popup positioning and compact dialog actions so small-screen controls feel more centered and less edge-hugging.

### Fixed
- Fixed false-positive image updates in **Update From Existing Setup** by comparing imported and existing subgroup image URLs correctly.
- Fixed cramped mobile CTA labels and dialog button wrapping, including the unsaved-changes confirmation flow.
- Fixed guide/documentation mobile scroll behavior so short guide content no longer shows unnecessary nested vertical scrolling.

## [0.6.1] - 2026-04-01
### Changed
- Reworked the **Update from Template** flow with a cleaner import review and better duplicate handling.
- Simplified **Export Catalogs** controls and AIOMetadata settings to reduce friction during export setup.
- Polished editor dialogs, spacing, and mobile interactions across the release candidate.

### Fixed
- Fixed AIOMetadata/template download edge cases in the chooser flow.
- Fixed release metadata and in-app versioning so the UI now consistently reports `v0.6.1`.
- Fixed release hygiene issues by aligning branding, documentation, and ignored local workspace files.

## [0.6.0] - 2026-03-28
### Added
- **AIOMetadata Export Panel** for generating ready-to-use catalog JSON directly from Omni catalogs.
- Support for exporting all linked catalogs, or only new catalogs missing from the AIOMetadata setup.
- Copy to clipboard and download to JSON actions for AIOMetadata exports.
- **Export overrides** for AIOMetadata at global, main group, subgroup, and catalog levels.
- Built-in **UME Sorting** template with recommended defaults.

### Improved
- AIOMetadata sync now supports manifest URLs, raw JSON, and JSON file uploads.
- Preference for the richer AIOMetadata config response in payload handling.
- Normalization and matching for **MDBList**, **Trakt**, and **Streaming** catalogs.
- Handling of Omni sections (Header, Top Row, Catalog, General) during export.
- Naming and structure generation from Omni groups for consistent catalog ordering.

### Editor & Validation
- Mismatch detection for catalogs linked in Omni but missing from synced AIOMetadata.
- Clearer warnings for affected main- and sub-groups.
- Synced-state detection isolates existing AIOMetadata catalogs from new exportable ones.

## [0.5.4] - 2026-03-26
### Improved
- **Performance Optimizations**: Internal refactoring and logic decoupling for a smoother editor experience and more responsive UI during active configuration updates.


## [0.5.3] - 2026-03-26
### Added
- **AIOMetadata Mismatch Detection**: Enhanced detection for linked catalogs in subgroups that are missing from synchronized AIOMetadata.
- **Improved Warning System**: Added subtle warning badges in the Group Manager for affected MainGroups and Subgroups to improve issue discoverability.
- **Contextual Warning Icons**: Warning triangles now appear directly next to the affected linked catalogs in the editor.
- **MDBList Ratings Support**: Expanded support for MDBList ratings and badges, including updated editor logic and test coverage.

### Improved
- **AIOMetadata UI**: Redesigned the warning box to visually separate it from the green sync status, providing clearer distinction between system status and configuration issues.
- **Refined Alerts**: Subgroups without linked catalogs now use localized warning indicators instead of global alerts to reduce dashboard noise.
- **Performance Optimization**: Fixed input lag when editing Poster Image URLs by decoupling the URL editor from the subgroup structure.
- **Autosave Behavior**: Optimized session saving to favor idle periods and tab changes, preventing lag during active typing.

### Changed
- **Data Integrity**: Removed legacy backup catalog data; the editor now strictly uses uploaded or synchronized AIOMetadata.
- **Architecture**: Centralized and unit-tested the AIOMetadata validation logic into a dedicated utility.

### Fixed
- **Input Responsiveness**: Resolved rendering bottlenecks in the URL editor for a smoother typing experience.
- **Release Stability**: Verified all systems via successful linting, type-checking, testing, and production build cycles.

## [0.5.2] - 2026-03-24
### Improved
- **UI/UX Polish**: Refined Welcome Screen CTA area, improved mobile spacing, and tuned button visual balance.
- **Subtle Styling**: Reworked light-mode `Docs` button with a subtler warm accent and softer glow for better harmony.
- **Streamlined Metadata Flow**: Combined AIOMetadata entries into a single entry with a new selection dialog for better clarity.
- **Metadata Dialog Cleanup**: Simplified selection modal, removed redundant text, and added concise update instructions.
- **Template Fetch Resilience**: Implemented `template-manifest.json` as primary discovery source with multi-level fallback (GitHub API → Baked-in URLs).
- **Fallback Coverage**: Added built-in backup URLs for all major UME templates to ensure availability during API downtime.

### Changed
- **Header Layout**: Reverted to original Omni header layout while retaining mobile spacing fixes for top controls.

### Fixed
- **Testing**: Added test coverage for manifest-first loading and API fallback scenarios.


## [0.5.1] - 2026-03-24
### Improved
- **Template Updates**: Enhanced subgroup matching during "Update from Template". Subgroups are now correctly identified as updates even if renamed, provided their contained catalogs match exactly.
- **Subgroup Management**: Prevented the creation of duplicate subgroups during template updates when only the name has changed.
- **Import Handling**: Added robust subgroup rename handling during imports, preserving subgroup order and existing assignments.
- **AIOMetadata Documentation**: Updated documentation copy to clarify the setup import process and catalog synchronization flow.

### Fixed
- **Update Consistency**: Maintained existing update behavior for name matches where catalogs or images have changed.

## [0.5.0] - 2026-03-23
### Added
- **Manager Switcher**: Integrated a welcome-page-only manager switcher to Omni Snapshot Manager, matching the Fusion pattern for seamless linking between Omni and Fusion with Omni marked as the current manager.

### Improved
- **Welcome Header**: Reworked header utilities to integrate the switcher, aligning the utility group to the main content width and refining spacing. Header utilities remain hidden during active editing.
- **Documentation Discoverability**: Moved the documentation shortcut out of the top-right utilities and placed it next to the primary template download action for better contextual discoverability.
- **Welcome Hero**: Refined presentation by increasing the clown logo size, tightening its spacing to the headline, and adding a subtle hover glow effect for enhanced interactivity.
- **Visual Polish**: Polished light and dark mode styling for the welcome screen, including calmer light-mode shadows/glows and improved visual consistency between the primary download CTA and the documentation shortcut.
- **Favicon**: Aligned browser tab icon size with Fusion Manager for a consistent cross-product experience.

## [0.4.8] - 2026-03-21
### Fixed
- **UI Layout**: Standardized toolbar spacing in `MainEditor` to prevent overlapping with content on large screens.

## [0.4.7] - 2026-03-21
### Fixed
- **Main Group Ordering**: Implemented automated sanitization and synchronization of `main_group_order` to ensure consistency with existing groups.

### Improved
- **Configuration Validation**: Integrated automatic validation and fixing of configuration values during the decoding phase via `ConfigContext`, enhancing overall data integrity.

## [0.4.6] - 2026-03-20
### Fixed
- **Catalog Export**: Refined export semantics for empty catalog selections. `selected_catalogs` is now explicitly exported as a real empty array (`[]`) and included in `includedKeys` to preserve state across sessions.
- **Template Updates**: Fixed `Update From Template` to ensure it only affects the Group Manager, preventing unintended activation of large numbers of catalogs in the Catalog Manager.
- **Catalog Deletion**: Resolved an issue where deleting catalogs would unintentionally mutate Group Manager subgroup links. Deletion now strictly cleans manager-side entries.

### Improved
- **Update Flow**: Reworked the `Update From Existing Setup` UI for better clarity, adding search functionality for groups, reducing redundant controls, and implementing sticky headers.
- **Granular Imports**: Enhanced Main Group imports to allow explicit selection of linked subgroups instead of implicit full-group imports.
- **UI Consistency**: Standardized `Unassigned Subgroups` interaction with the same chevron-based expand/collapse behavior used throughout the editor.

## [0.4.5] - 2026-03-20
### Fixed
- **iCloud Sync**: Resolved an issue where disabled catalogs were incorrectly re-enabled during synchronization.

## [0.4.4] - 2026-03-19
### Changed
- **AIOMetadata Sync**: Refined the success card to be more compact and privacy-conscious by hiding the source URL.
- **AIOMetadata UI**: Improved mobile actions with compact header icon buttons and aligned import notices to a consistent emerald tone.
- **AIOMetadata UX**: Simplified synced-state layout with tighter spacing and clearer visual hierarchy.
- **Group Manager**: Optimized mobile toolbar by reducing visual weight and switching to a compact three-button action row (New, Add, Update).
- **Group Manager**: Reduced mobile control heights and search field dimensions to preserve vertical space.
- **Subgroup Selection**: Updated "Add to Existing Group" modal to filter out placeholder/template entries ([Discover], ❗ labels).
- **Subgroup Selection**: Adjusted modal footer to only count visible entries in the selection total.
- **Copy**: Tightened AIOMetadata import guidance for better readability.

## [0.4.3] - 2026-03-19
### Added
- **Dynamic Template Discovery**: Implemented GitHub repository tree traversal for real-time UME template discovery, replacing static manifests.
- **Export Consolidation**: New export logic via `export-config.ts` ensuring semantic consistency between `values`- and `config`-based Omni snapshots.
- **Group Manager Search**: Added localized search/filter functionality for Main Groups and Subgroup sections.
- **Granular Updates**: Implemented separate import toggles for Catalog updates and Image updates during Subgroup synchronization.
- **Template Infrastructure**: Unified template management via a new manifest helper module for consistent logic across loaders, guides, and downloads.
- **Tab Bar Identity**: Integrated a custom high-quality clown icon for browser tabs with Safari cache-busting compatibility.

### Changed
- **Home Screen Overhaul**: Refined template selection to use URL-based matching and category-based download lists for improved reliability.
- **UI Refinements**: Optimized Group Manager toolbar responsiveness and enhanced Main Group card layouts.
- **Interaction Model**: Switched from single to multiple-open support for accordion sections in the Group Manager.
- **Catalog Management**: Improved re-activation behavior to preserve `showInHome` settings from the original manifest state.

### Fixed
- **Discovery Reliability**: Fixed a critical issue where `catalogs-only` templates weren't consistently identified from GitHub.
- **Data Integrity**: Ensured Config-Root exports preserve critical fields like `mdblist_enabled_ratings`.
- **Legacy Compatibility**: Automated backfilling of default values for `shelf_order`, `disabled_shelves`, and stream button settings in older configurations.
- **Stability**: Hardened guide and download flows against empty or missing URLs; cleared all pending Hook and TypeScript type warnings.

### Technical
- Cleaned up ESLint warnings and TypeScript type errors.
- Verified successful production build and passing test suite.

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
