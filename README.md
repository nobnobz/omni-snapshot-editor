# Omni Snapshot Manager

> [!NOTE]
> Dieses Projekt wurde gemeinschaftlich mit **Antigravity** (Google DeepMind) entwickelt.

[![Live Web App](https://img.shields.io/badge/Live_Version-GitHub_Pages-blue?style=flat-square&logo=github)](https://nobnobz.github.io/omni-snapshot-editor/)
[![Support](https://img.shields.io/badge/Support_my_work-Ko--fi-pink?style=flat-square&logo=ko-fi)](https://ko-fi.com/botbidraiser)

---

## Zweck der Anwendung

Der **Omni Snapshot Manager** ist ein Werkzeug zur Verwaltung und Bearbeitung von Omni-Konfigurationsdateien (Snapshots). Er dient als begleitendes Tool für das [**Unified Media Experience (UME)**](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser) Projekt.

Die Anwendung ermöglicht es, komplexe JSON-Strukturen über eine grafische Oberfläche anzupassen, ohne die Datei manuell in einem Texteditor bearbeiten zu müssen. Ziel ist es, die Fehlerquote bei der Konfiguration zu senken und die Verwaltung von UME-Setups zu vereinfachen.

### 🌐 Live Version
Die Anwendung steht als Web-App zur Verfügung und erfordert keine lokale Installation:
👉 **[Omni Snapshot Manager (Live)](https://nobnobz.github.io/omni-snapshot-editor/)**

---

## Funktionen im Überblick

### 1. Konfigurations-Management
- **Import/Export**: Laden von Dateien via GitHub Raw-URL oder lokalem Datei-Upload. Speichern als formatierte JSON-Datei.
- **Referenzielle Integrität**: Beim Umbenennen von Gruppen werden alle zugehörigen Verweise (z. B. in Sortierlisten oder Bild-URLs) automatisch mit aktualisiert.
- **Bereinigung**: Deaktivierte Kataloge oder Gruppen werden beim Export vollständig aus der Datei entfernt.

### 2. Katalog-Verwaltung
- **Sortierung**: Visuelle Neuanordnung von Katalogen per Drag-and-Drop.
- **AIOMetadata-Integration**: Unterstützung für AIOMetadata-Templates zur korrekten Zuordnung von MDBList-IDs und Namen.
- **Pruning**: Automatisches Entfernen verwaister Einträge in den globalen Sortier-Arrays.

### 3. Muster & Tags (Regex)
- **Automatisierung**: Definition von Regex-Mustern zur automatischen Kategorisierung von Inhalten.
- **Visuelle Gestaltung**: Zuweisung von Layout-Eigenschaften (z. B. Deckkraft, Rahmenstärke, Farben) basierend auf Titeln oder Metadaten.

---

## Installation und Nutzung

### Nutzung im Browser (Empfohlen)
Verwende einfach die **[Live-Version auf GitHub Pages](https://nobnobz.github.io/omni-snapshot-editor/)**, um deine Konfigurationen direkt im Browser zu bearbeiten.

### Lokale Entwicklung
Solltest du das Projekt lokal ausführen wollen:
1. Repository klonen.
2. Abhängigkeiten installieren: `npm install`.
3. Server starten: `npm run dev`.
4. Erreichbar unter `http://localhost:3000`.

---

## Verknüpfte Projekte
- **[Unified Media Experience (UME)](https://github.com/nobnobz/Omni-Template-Bot-Bid-Raiser)**: Das Hauptprojekt für optimierte Omni-Templates.

---

## Unterstützung
Wenn dir dieses Tool hilft, kannst du die weitere Entwicklung hier unterstützen:
[Ko-fi Support Link](https://ko-fi.com/botbidraiser)
