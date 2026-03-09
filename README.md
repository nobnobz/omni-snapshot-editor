# Omni Snapshot Manager

> [!NOTE]
> This project was developed with **Antigravity**.

## Summary

The **Omni Snapshot Manager** is a tool for managing and editing Omni configuration files (Snapshots). It serves as a companion tool for the [**Unified Media Experience (UME)**](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser) project but you can also build your complete own setup with it.

The application allows for adjusting the JSON structures of the Omni Snapshosts via a graphical interface, eliminating the need to edit the file in Omni or manually in a text editor. The goal is to reduce configuration errors and simplify the management of Omni setups.

### Website
The application is available as a web app and requires no local installation:
👉 **[Omni Snapshot Manager (Live)](https://nobnobz.github.io/omni-snapshot-editor/)**

---

## 💖 Support the Project
If this tool makes your Omni management easier, please consider supporting the continued development.

[<img src="https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/670f5a02fcf48af59c591185_support_me_on_kofi_dark.png" width="230" alt="Support my work at Ko-fi">](https://ko-fi.com/botbidraiser)

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
- **Pattern-based Images**: Assign custom icons to your regex
- 
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


# Omni Snapshot Manager



[<img src="https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/670f5a02fcf48af59c591185_support_me_on_kofi_dark.png" width="230" alt="Support my work at Ko-fi">](https://ko-fi.com/botbidraiser)

[![Live Web App](https://img.shields.io/badge/Live_Version-GitHub_Pages-blue?style=flat-square&logo=github)](https://nobnobz.github.io/omni-snapshot-editor/)

---

## Purpose of the Application

The **Omni Snapshot Manager** is a technical utility designed for managing and editing Omni configuration files (Snapshots). It acts as the official companion for the [**Unified Media Experience (UME)**](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser) ecosystem, but also allows users to build and maintain their own setups from scratch.

By providing a professional visual interface for complex JSON structures, the manager eliminates manual editing errors and provides advanced automation for maintaining large-scale media collections.

### 🌐 Live Version
The application is available as a web app and requires no local installation:
👉 **[Omni Snapshot Manager (Live)](https://nobnobz.github.io/omni-snapshot-editor/)**

---

## Features at a Glance

### 1. Data Integrity & Automation
- **Smart Referential Integrity**: Automatically updates all secondary references (sorting arrays, image pointers, metadata links) when a group or ID is renamed.
- **Automatic Pruning**: Detects and removes orphaned entries (zombie IDs) from global sorting arrays during every export.
- **Safe Export**: Cleans up disabled catalogs or main groups to keep the JSON file size optimized and the app performance high.

### 2. Hierarchical Group Management
- **Main & Subgroup Logic**: Manage parent-child relationships with full visual control.
- **Dynamic Layout Toggles**: Switch between **Poster**, **Square**, and **Landscape** view modes on a per-group basis.
- **Template Sync**: "Update from Template" allows you to merge new groups from an external setup while preserving personal customizations.
- **Bulk Reordering**: Drag-and-drop support for reorganizing catalogs and groups instantly.

### 3. Catalog & Visibility Control
- **Shelf Visibility**: Detailed control over which catalogs appear on the home screen.
- **Top Row Promotion**: Feature specific catalogs in the ranked "Top Row" (with an option to keep them hidden from the main shelf).
- **Header Feature**: Assign catalogs to be displayed as large, high-impact headers at the very top of the app.
- **Runtime Randomization**: Enable shuffling to provide a fresh content experience every time Omni loads.
- **Condensed Layouts**: Support for small-poster layouts in specific catalogs to maximize screen space.

### 4. Advanced Regex & Patterns
- **Regex Tagging**: Define sophisticated regular expressions to automatically tag and categorize content based on titles or metadata.
- **Dynamic Styling**: Override interface properties—such as opacity, border thickness, and color—dynamically based on patterns.
- **Pattern-based Images**: Automatically assign custom background images or icons to content matching specific rules.

### 5. Seamless Integrations
- **AIOMetadata Mapping**: Full support for AIOMetadata export files to map MDBList IDs back to human-readable names.
- **Universal Import**: Fetch configurations directly from GitHub Raw URLs or upload local `.json` snapshots.
- **Sectional Export**: Export only specific parts of your config (e.g., only your custom Patterns or certain Groups) for modular use.

---

## Installation and Usage

### Usage in Browser (Recommended)
Access the **[Live Version on GitHub Pages](https://nobnobz.github.io/omni-snapshot-editor/)** to manage your configurations directly without local setup.

### Local Development
To run the project locally for development or private use:
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.
4. The editor is now accessible at `http://localhost:3000`.

---

## Technical Concept
The editor uses a **Referential Integrity Engine** that treats the JSON snapshot not just as text, but as a relational database. Every mutation to a core ID (like a subgroup name) triggers a recursive search-and-replace across all associated arrays (like `sortedItems` or `groupLinks`), ensuring that the resulting config file remains 100% valid and error-free for the Omni app.

---

## Linked Projects
- **[Unified Media Experience (UME)](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser)**: The core repository for optimized Omni templates.

---

## 💖 Support the Project
If this tool makes your Omni management easier, consider supporting the continued development and hosting.

*Every contribution helps keep this tool free and open for the community!*
