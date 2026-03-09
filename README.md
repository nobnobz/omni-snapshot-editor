# Omni Snapshot Manager

> [!NOTE]
> This project was developed in collaboration with **Antigravity** (Google DeepMind).

[![Live Web App](https://img.shields.io/badge/Live_Version-GitHub_Pages-blue?style=flat-square&logo=github)](https://nobnobz.github.io/omni-snapshot-editor/)
[![Support](https://img.shields.io/badge/Support_my_work-Ko--fi-pink?style=flat-square&logo=ko-fi)](https://ko-fi.com/botbidraiser)

---

## Purpose of the Application

The **Omni Snapshot Manager** is a tool for managing and editing Omni configuration files (Snapshots). It serves as a companion tool for the [**Unified Media Experience (UME)**](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser) project.

The application allows for adjusting complex JSON structures via a graphical interface, eliminating the need to edit the file manually in a text editor. The goal is to reduce configuration errors and simplify the management of UME setups.

### 🌐 Live Version
The application is available as a web app and requires no local installation:
👉 **[Omni Snapshot Manager (Live)](https://nobnobz.github.io/omni-snapshot-editor/)**

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
- **[Unified Media Experience (UME)](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser)**: The main project for optimized Omni templates.

---

## Support
If this tool helps you, you can support further development here:
[Ko-fi Support Link](https://ko-fi.com/botbidraiser)
