# Omni Snapshot Manager

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

### 1. Configuration Management
- **Import/Export**: Load files via GitHub Raw-URL or local file upload. Save as a formatted JSON file.
- **Referential Integrity**: When renaming groups, all associated references (e.g., in sorting lists or image URLs) are automatically updated.
- **Cleanup**: Disabled catalogs or groups are completely removed from the file during export to keep the configuration lean.

### 2. Catalog Management
- **Sorting**: Visual rearrangement of catalogs via drag-and-drop.
- **AIOMetadata Integration**: Support for AIOMetadata templates to correctly map MDBList IDs and names.
- **Pruning**: Automatic removal of orphaned entries in global sorting arrays.

### 3. Patterns & Tags (Regex)
- **Automation**: Define regex patterns for automatic content categorization.
- **Visual Design**: Assign layout properties (e.g., opacity, border thickness, colors) based on titles or metadata.

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
- **[Unified Media Experience (UME)](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser)**: My Omni templates.

---
