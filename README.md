# Omni Snapshot Manager

> [!NOTE]
> This project was developed with **Antigravity**.

## Summary

The **Omni Snapshot Manager** is a tool for managing and editing Omni configuration files (snapshots). It serves as a companion tool for the [**Unified Media Experience (UME)**](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser) project, but you can also build your own setup with it.

The application lets you adjust Omni snapshot JSON structures through a graphical interface, eliminating the need to edit files directly in Omni or in a text editor. The goal is to reduce configuration errors and simplify the management of Omni setups.

### Website
The application is available as a web app and requires no local installation:
👉 **[Omni Snapshot Manager (Live)](https://nobnobz.github.io/omni-snapshot-editor/)**

---

## Features at a Glance

### 1. Hierarchical Group Management
- **Main & Subgroup Logic**: Manage parent-child relationships with full visual control.
- **Dynamic Layout Toggles**: Switch between **Poster**, **Square**, and **Landscape** view modes on a per-group basis.
- **Template Sync**: "Update from Template" allows you to merge new groups from an external setup while preserving personal customizations.
- **Bulk Reordering**: Drag-and-drop support for reorganizing catalogs and groups instantly.

### 2. Catalog & Visibility Control
- **Shelf Visibility**: Detailed control over which catalogs appear on the home screen.
- **Top Row Promotion**: Feature specific catalogs in the ranked "Top Row" (with an option to keep them hidden from the main shelf).
- **Header Feature**: Assign catalogs to be displayed as large, high-impact headers at the very top of the app.
- **Runtime Randomization**: Enable shuffling to provide a fresh content experience every time Omni loads.
- **Condensed Layouts**: Support for small-poster layouts in specific catalogs to maximize screen space.

### 3. Advanced Regex & Patterns
- **Regex Tagging**: Define patterns to automatically tag content based on titles or metadata.
- **Dynamic Styling**: Override interface properties—such as opacity, border thickness, and color—dynamically for your patterns.
- **Pattern-based Images**: Assign custom icons to your regex rules.
### 4. Seamless Integrations
- **AIOMetadata Mapping**: Full support for AIOMetadata export files to map MDBList IDs back to human-readable names.
- **Universal Import**: Fetch configurations directly from GitHub Raw URLs or upload local `.json` snapshots.
- **Sectional Export**: Export only specific parts of your config (e.g., only your custom Patterns or certain Groups) for modular use.

---

## Installation and Usage

### Usage in Browser (Recommended)
Simply use the **[Live Version on GitHub Pages](https://nobnobz.github.io/omni-snapshot-editor/)** to edit your configurations directly in your browser.

### Local Development
Should you want to run the project locally:
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start the server: `npm run dev`.
4. Accessible at `http://localhost:3000`.

---

## Linked Projects
- My Omni templates: **[Unified Media Experience (UME)](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser)**

---

## Editor UI Conventions
- Use `src/components/editor/ui/style-contract.ts` for shared editor classes (`dialogContent`, actions, tone-based badges/notices).
- Prefer semantic tone classes (`editor-tone-info|success|warning|danger`) over hard-coded feature colors.
- Keep editor typography on the shared scale: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`.
- Form fields should stay `text-base` on mobile and only downscale to `sm:text-sm`.
- Use `Button` for interactive controls; native `<button>` is reserved for drag handles and explicit full-row toggle interactions.

---

## 💖 Support the Project
If this tool makes your Omni management easier, please consider supporting the continued development.

[<img src="https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/670f5a02fcf48af59c591185_support_me_on_kofi_dark.png" width="230" alt="Support my work at Ko-fi">](https://ko-fi.com/botbidraiser)

---
