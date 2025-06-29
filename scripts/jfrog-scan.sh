#!/bin/bash
# JFrog Scan-Skript für BurniToken-Projekt
# Scannt Projektabhängigkeiten auf Sicherheitslücken

# Farben für die Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Prüfe, ob JFrog CLI installiert ist
if ! command -v jfrog &> /dev/null && ! [ -f "./jfrog.exe" ]; then
    echo -e "${RED}❌ JFrog CLI nicht gefunden. Bitte führen Sie zuerst das Setup-Skript aus.${NC}"
    exit 1
fi

# JFrog-Befehl basierend auf Betriebssystem festlegen
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    JFROG_CMD="./jfrog.exe"
else
    JFROG_CMD="jfrog"
fi

echo -e "${CYAN}🔍 Starte Sicherheits-Scan der Abhängigkeiten...${NC}"

# Führe den JFrog-Audit aus
$JFROG_CMD audit --fail=false

# Speichere Exit-Code
AUDIT_RESULT=$?

echo -e "\n${YELLOW}📊 Scan-Ergebnisse:${NC}"
if [ $AUDIT_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Keine kritischen Sicherheitsprobleme gefunden!${NC}"
else
    echo -e "${RED}⚠️ Sicherheitsprobleme wurden erkannt. Bitte überprüfen Sie die Ergebnisse oben.${NC}"
    echo -e "${YELLOW}Empfehlungen:${NC}"
    echo -e "- Aktualisieren Sie betroffene Abhängigkeiten, wenn möglich"
    echo -e "- Prüfen Sie, ob es Workarounds für nicht behebbare Probleme gibt"
    echo -e "- Dokumentieren Sie bekannte Probleme in Ihrem Sicherheitsplan"
fi

echo -e "\n${GREEN}🔒 Scan abgeschlossen!${NC}"
