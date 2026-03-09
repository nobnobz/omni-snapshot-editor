# 🌌 Omni Snapshot Manager

**The Ultimate Architect for your Unified Media Experience (UME).**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/nobnobz/omni-snapshot-editor/graphs/commit-activity)

---

## 💡 The Vision: What is Omni Snapshot Manager?

Managing a complex **Omni** configuration manually by editing thousands of lines of JSON is prone to errors, broken references, and frustration. **Omni Snapshot Manager** is a premium, client-side web application designed to bridge the gap between technical complexity and creative freedom.

It provides a visual, high-performance interface to build the **Unified Media Experience (UME)**—a philosophy that centers on a clean, consistent, and highly personalized media setup across all your devices.

### 🎯 Sense and Purpose
- **Eliminate JSON Errors**: No more missing commas or broken internal links.
- **Visual Mastery**: See your groups, subgroups, and catalogs in a structured layout.
- **Atomic Renames**: Change a group name once; the manager updates all references instantly.
- **Portability**: Load from any GitHub repository or local file in seconds.

---

## ✨ Core Features & Deep Dive

### 🏗️ Advanced Hierarchy Management
The application understands the nested nature of Omni configurations:
- **Main Groups**: The top-level architectural pillars of your setup.
- **Subgroups**: Logical clusters for specific content types (e.g., "Trending Movies", "Sports").
- **Catalogs**: The individual feeds of metadata provided by **AIOMetadata**.

### 🔗 AIOMetadata Referential Integrity
Omni relies on **MDBList IDs** for catalogs. The Manager features a built-in fallback system:
- **Fallback Mapping**: Even if identities are missing locally, the manager uses a pre-seeded UME database to ensure correct naming during editing.
- **Custom Integration**: Easily upload your own AIOMetadata export to map custom catalogs instantly.

### 🏷️ Regex Pattern & Tagging Engine
The most powerful tool for content organization.
- **Dynamic Tagging**: Define regex patterns to automatically categorize content based on metadata titles.
- **Styling Controls**: Assign specific visual tags and layouts based on content patterns.
- **Bulk Pruning**: Cleanly remove unused patterns or tags with one click.

### 🛡️ Smart Referential Integrity
This is the "Safety Net" of the application. Unlike raw text editors, our mutations are **Atomic**:
1. **Trace & Replace**: Renaming a group identifier triggers a cascade that updates occurrences in `catalog_groups`, `ordering_arrays`, and `image_urls`.
2. **Merge Protection**: If you rename a group to a name that already exists, the manager offers a smart merge, combining catalog lists without duplicates.
3. **Array Validation**: Every export runs a validation pass to remove "dangling" references (ordering entries for items that no longer exist).

---

## 📊 Manual JSON vs. Omni Snapshot Manager

| Feature | Manual Editing | Omni Snapshot Manager |
| :--- | :---: | :---: |
| **Renaming Groups** | ❌ Risky (find/replace fails) | ✅ Atomic Cascade |
| **Catalog Reordering** | ❌ Manual ID shuffling | ✅ Drag & Drop |
| **Broken References** | ❌ Common | ✅ Automatically Pruned |
| **Base64 Encoding** | ❌ Manual step | ✅ Seamless Round-trip |
| **Structure Validation** | ❌ Manual | ✅ Auto-validated on Export |

---

## 🚀 Installation & Getting Started

### For Developers
1. **Clone & Install**
   ```bash
   git clone https://github.com/nobnobz/omni-snapshot-editor.git
   cd omni-snapshot-editor
   npm install
   ```
2. **Launch Development Environment**
   ```bash
   npm run dev
   ```
3. **Access the Manager**
   Open [http://localhost:3000](http://localhost:3000).

### For End Users
You can use the live deployment to manage your setups.
1. **Load**: Paste your GitHub Raw URL or drop your `.json` backup.
2. **Architect**: Use the sidebars to manage your Groups and Catalogs.
3. **Export**: Click **Download JSON** for a clean, optimized backup ready for Omni.

---

## 🎨 Design Philosophy
Omni Snapshot Manager isn't just a tool; it's part of the experience. It utilizes:
- **Glassmorphism**: A sleek, dark interface with subtle transparency.
- **Inter font-family**: Premium typography for maximum readability.
- **Micro-animations**: Smooth transitions and hover effects that make editing feel alive.

---

## 📝 Credits & Acknowledgements
- **Unified Media Experience (UME)**: Design and philosophy by [nobnobz](https://github.com/nobnobz).
- **Core Engine**: Built with React, Next.js, and Lucide Icons.

*Built with passion for the Omni community. 🚀*
