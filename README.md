# Omni Snapshot Manager

> [!NOTE]
> Dieses Projekt wurde gemeinschaftlich mit **Antigravity** (Google DeepMind) entwickelt.

[![Support](https://img.shields.io/badge/Support_my_work-Ko--fi-pink?style=flat-square&logo=ko-fi)](https://ko-fi.com/botbidraiser)

---

## Zweck der Anwendung

Der **Omni Snapshot Manager** ist ein Werkzeug zur Verwaltung und Bearbeitung von Omni-Konfigurationsdateien (Snapshots). Die App ermöglicht es, komplexe JSON-Strukturen über eine grafische Oberfläche anzupassen, ohne die Datei manuell in einem Texteditor bearbeiten zu müssen. 

Ziel ist es, die Fehlerquote bei der Konfiguration zu senken und die Verwaltung von Medien-Setups (Unified Media Experience) zu vereinfachen.

## Funktionen im Überblick

### 1. Konfigurations-Management
- **Import/Export**: Laden von Dateien via GitHub Raw-URL oder lokalem Datei-Upload. Speichern als formatierte JSON-Datei.
- **Referenzielle Integrität**: Beim Umbenennen von Gruppen werden alle zugehörigen Verweise (z. B. in Sortierlisten oder Bild-URLs) automatisch mit aktualisiert.
- **Bereinigung**: Deaktivierte Kataloge oder Gruppen werden beim Export vollständig aus der Datei entfernt, um die Konfiguration schlank zu halten.

### 2. Katalog-Verwaltung
- **Sortierung**: Visuelle Neuanordnung von Katalogen per Drag-and-Drop.
- **AIOMetadata-Integration**: Unterstützung für AIOMetadata-Templates zur korrekten Zuordnung von MDBList-IDs und Namen.
- **Pruning**: Automatisches Entfernen verwaister Einträge in den globalen Sortier-Arrays.

### 3. Muster & Tags (Regex)
- **Automatisierung**: Definition von Regex-Mustern zur automatischen Kategorisierung von Inhalten.
- **Visuelle Gestaltung**: Zuweisung von Layout-Eigenschaften (z. B. Deckkraft, Rahmenstärke, Farben) basierend auf Titeln oder Metadaten.

## Installation und Nutzung

### Lokal ausführen
1. Repository klonen.
2. Abhängigkeiten installieren: `npm install`.
3. Server starten: `npm run dev`.
4. Die Anwendung ist unter `http://localhost:3000` erreichbar.

### Workflow
1. Konfiguration laden (GitHub/Lokal).
2. Änderungen in den Bereichen "Catalogs", "Groups" oder "Patterns" vornehmen.
3. Die Integrität der Daten wird während der Bearbeitung im Hintergrund geprüft.
4. Exportierte JSON-Datei in Omni importieren.

---

## Unterstützung
Wenn dir dieses Tool hilft, kannst du die weitere Entwicklung hier unterstützen:
[Ko-fi Support Link](https://ko-fi.com/botbidraiser)
