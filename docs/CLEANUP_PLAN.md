# 🧹 Repository Aufräumplan

## 📊 AKTUELLE SITUATION
- **Root-Verzeichnis**: 200+ Dateien (völlig überladen!)
- **Backup-Dateien**: 15+ HTML-Backups
- **Temporäre Skripte**: 50+ PS1/JS Dateien
- **Dokumentation**: 80+ redundante MD-Dateien
- **Tests**: Verstreut im Root-Verzeichnis

## 🎯 AUFRÄUMZIELE
1. **Struktur**: Klare Ordnerorganisation
2. **Backup-Bereinigung**: Nur aktuelle Backups behalten
3. **Script-Konsolidierung**: Produktive Skripte vs. temporäre
4. **Dokumentation**: Zentrale, aktuelle Dokumentation
5. **Test-Organisation**: Alle Tests in tests/ Ordner

## 📁 NEUE STRUKTUR
```
/
├── .github/          # GitHub Actions & Templates
├── .vscode/          # VS Code Konfiguration
├── assets/           # CSS, JS, Images
├── tests/            # Alle Test-Dateien
├── scripts/          # Produktive Skripte
├── backups/          # Wichtige Backups
├── docs/             # Zentrale Dokumentation
├── config/           # Konfigurationsdateien
└── [Core Files]      # index.html, package.json, etc.
```

## 🚮 ZU LÖSCHEN
- Veraltete Backup-Dateien (älter als 7 Tage)
- Temporäre PS1/JS Skripte
- Redundante MD-Dokumentation
- Leere/Test-JSON-Dateien
- Duplicate/Old Configuration Files

## ✅ ZU BEHALTEN
- Aktuelle index.html + neueste Backups
- package.json, jest.config.js, lighthouse.config.js
- .github/workflows/ (CI/CD)
- assets/ Ordner komplett
- tests/ Ordner komplett
- Core-Konfigurationsdateien (.gitignore, etc.)
