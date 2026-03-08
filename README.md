# Omni Config Editor

A modern, client-side, English-language web application built with Next.js, shadcn/ui, and Tailwind CSS to edit complex Omni JSON configurations directly from GitHub or Local Files.

## Features

- **GitHub Integration**: Load JSON files directly via their GitHub raw URL. Supports Personal Access Tokens for private repositories.
- **Local Fallback**: Easily drag-and-drop or upload a `.json` file from your device.
- **Client-Side Processing**: Fast and secure. All parsing, Base64 decoding (`_data` fields), editing, and re-encoding happens in your browser.
- **Bespoke Catalog Manager**: A dedicated section to enable/disable, sort (A-Z, Z-A), and drag-and-drop reorder catalogs. Disabled catalogs are intelligently pruned from ordering arrays globally on export.
- **Generic Schema Renderer**: Infers field types automatically (strings, booleans, objects, arrays) and provides clean UI controls for nested components.
- **Disable/Remove Feature**: Toggle any key off to have it cleanly stripped from the exported JSON object. 
- **Export & Download**: One-click download with a formatted, timestamped filename (`omni-config-YYYY-MM-DD-HHMM.json`), plus raw JSON preview and clipboard copy actions.

## Stack
- Next.js 15 (React 19)
- Tailwind CSS
- shadcn/ui components
- @dnd-kit (for robust drag-and-drop)
- lucide-react (for crisp iconography)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Development Server**
   ```bash
   npm run dev
   ```
   
3. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide
1. On the landing page, paste your **GitHub Raw URL** (e.g., `https://raw.githubusercontent.com/...`). If the repository is private, paste your PAT in the token field. Alternatively, use the upload area to drop a local JSON file.
2. The application parses the config and decrypts necessary configuration states.
3. Use the **Left Sidebar** to navigate configuration domains (Catalogs, Ordering, Patterns, Player).
4. Use the global search box to locate specific setting keys instantly.
5. In the **Catalogs** panel, click and drag the grip icon to reorder catalogs, or toggle them to remove them from final output.
6. Once satisfied, click  **Raw JSON Preview** to verify the payload, or click **Download JSON** to save the sanitized configuration locally. 

Built automatically by Antigravity 🚀

## Consistency Model & Referential Integrity
This application strictly enforces zero dangling references and no orphan duplicates during exports. GUI edits are protected by atomic referential functions (`src/lib/mutations.ts`):

1. **Atomic Renames**: Renaming a Catalog Group string identifier automatically traces and updates occurrences in `catalog_groups`, `catalog_group_order`, `subgroup_order`, `main_catalog_groups.subgroupNames`, and image URLs.
2. **Merge Warnings**: If a group is renamed to a pre-existing target, users are confronted with a "Merge Groups" modal warning. Approving this cleanly merges catalog arrays uniquely.
3. **Deep Pruning on Disable**: Disabling any node or group recursively wipes occurrences of that identifier from the entire configuration rather than marking false, ensuring clean presence/absence JSON validation.
4. **Validation Pass**: Right before `export`, all arrays are deduplicated, and ordering arrays are strictly filtered to remove string indicators that don't exist as actual group definitions.
5. **Base64 Round-Tripping**: All `_data` payloads are seamlessly decoded for editing and tightly re-encoded while preserving data shapes.
