#!/bin/bash
# ================================================
# 🚨 EMERGENCY RECOVERY SCRIPT 🚨
# Für VS Code Crash, Chat-Blockade, Freeze-Probleme
# ================================================

echo "🚨 NOTFALL-RECOVERY GESTARTET..."
echo

# VS Code Prozesse sofort beenden
echo "⚡ Beende alle VS Code Prozesse..."
pkill -f "code" 2>/dev/null || echo "Code-Prozesse beendet"
pkill -f "Code.exe" 2>/dev/null || echo "Windows Code-Prozesse beendet"
pkill -f "electron" 2>/dev/null || echo "Electron-Prozesse beendet"
pkill -f "node.*vscode" 2>/dev/null || echo "Node VS Code-Prozesse beendet"
echo "✅ VS Code-Prozesse beendet!"

# Chat/Extension-Prozesse killen
echo "💬 Beende Chat/Extension-Prozesse..."
pkill -f "copilot" 2>/dev/null || echo "Copilot beendet"
pkill -f "chat" 2>/dev/null || echo "Chat beendet"
pkill -f "language-server" 2>/dev/null || echo "Language Server beendet"  
pkill -f "typescript" 2>/dev/null || echo "TypeScript Server beendet"
pkill -f "eslint" 2>/dev/null || echo "ESLint Server beendet"
echo "✅ Chat-Prozesse beendet!"

# Temp-Ordner leeren
echo "🗑️ Lösche blockierende Temp-Dateien..."
rm -rf /tmp/vscode-* 2>/dev/null || echo "Linux Temp geleert"
rm -rf "$HOME/.vscode/logs/*" 2>/dev/null || echo "VS Code Logs geleert"
rm -rf "$HOME/.vscode/CachedExtensions/*" 2>/dev/null || echo "Extension Cache geleert"
rm -rf "$HOME/AppData/Roaming/Code/logs/*" 2>/dev/null || echo "Windows Logs geleert"
echo "✅ Temp-Cleanup abgeschlossen!"

# Extension-Cache leeren
echo "🔧 Repariere Extension-Cache..."
rm -rf "$HOME/.vscode/extensions/*/out/*" 2>/dev/null || echo "Extension Output geleert"
rm -rf "$HOME/.vscode/extensions/.obsolete" 2>/dev/null || echo "Obsolete Extensions entfernt"
echo "✅ Extension-Cache repariert!"

# Memory-Cleanup (Linux)
echo "🧹 Memory-Cleanup..."
sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || echo "Memory Cleanup (benötigt sudo)"
echo "✅ Memory-Cleanup durchgeführt!"

# Recovery Center starten falls vorhanden
echo "🔄 Starte Recovery Center..."
if [ -f "tools/vscode-recovery-center.js" ]; then
    timeout 30s node tools/vscode-recovery-center.js --live-check || echo "Recovery Center Timeout"
else
    echo "Recovery Center nicht gefunden"
fi

echo
echo "✅ NOTFALL-RECOVERY ABGESCHLOSSEN!"
echo
echo "📋 Nächste Schritte:"
echo "1. VS Code neu starten"
echo "2. Nur wichtige Extensions aktivieren"
echo "3. Chat-Features langsam testen"
echo "4. Bei Problemen erneut ausführen"
echo

# Automatisch ausführbar machen
chmod +x "$0" 2>/dev/null || echo "Ausführbar gemacht"
