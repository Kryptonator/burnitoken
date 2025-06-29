# Google Search Console Sitemap-Fehlerbehebung

## Problem: "Ungültige Sitemap-Adresse"

Wenn Sie die Meldung "Ungültige Sitemap-Adresse" in der Google Search Console erhalten, folgen Sie diesen Schritten, um das Problem zu beheben:

## Lösungsansätze für die Google Search Console

1. **Verwenden Sie die vollständige URL:**
   - Verwenden Sie beim Hinzufügen der Sitemap die vollständige URL: `https://burnitoken.website/sitemap.xml`
   - Nicht nur `sitemap.xml` eingeben

2. **Alternative Sitemap-Formate testen:**
   - Wir haben mehrere Sitemap-Varianten erstellt:
     - Standard: `https://burnitoken.website/sitemap.xml`
     - Vereinfacht: `https://burnitoken.website/sitemap-basic.xml`
     - Sitemap-Index: `https://burnitoken.website/sitemapindex.xml`
   - Versuchen Sie, jede dieser Varianten in der Google Search Console einzureichen

3. **Überprüfen der DNS-Propagation:**
   - Es kann bis zu 48 Stunden dauern, bis DNS-Änderungen vollständig propagiert sind
   - Prüfen Sie, ob die Domain korrekt auf den Netlify-Server zeigt

4. **SSL/HTTPS verifizieren:**
   - Stellen Sie sicher, dass das SSL-Zertifikat korrekt eingerichtet ist
   - Dies ist besonders wichtig für die Search Console-Validierung

## Anleitung für die erneute Einreichung

1. Gehen Sie zu [Google Search Console](https://search.google.com/search-console)
2. Wählen Sie Ihre Property (burnitoken.website)
3. Klicken Sie im linken Menü auf "Sitemaps"
4. Entfernen Sie ggf. vorhandene fehlerhafte Einträge
5. Klicken Sie auf "Neue Sitemap hinzufügen"
6. Geben Sie eine der folgenden vollständigen URLs ein:
   - `https://burnitoken.website/sitemap.xml`
   - `https://burnitoken.website/sitemap-basic.xml`
   - `https://burnitoken.website/sitemapindex.xml`
7. Klicken Sie auf "Absenden"
8. Warten Sie 24-48 Stunden auf die Verarbeitung

## Überprüfen der Sitemap-Erreichbarkeit

Sie können selbst testen, ob die Sitemap online erreichbar ist:

1. Öffnen Sie einen Browser und rufen Sie die URL direkt auf: 
   `https://burnitoken.website/sitemap.xml`

2. Nutzen Sie den Google Mobile-Friendly Test, um zu prüfen, ob Google auf die Sitemap zugreifen kann:
   `https://search.google.com/test/mobile-friendly?url=https://burnitoken.website/sitemap.xml`

3. Nutzen Sie die URL-Überprüfung in der Search Console:
   - Geben Sie `https://burnitoken.website/sitemap.xml` ein
   - Prüfen Sie die Erreichbarkeit und Indexierbarkeit

## Bei anhaltenden Problemen

- Überprüfen Sie die Netlify-Deployment-Logs auf Fehler
- Stellen Sie sicher, dass alle Dateien korrekt hochgeladen wurden
- Testen Sie die Sitemap mit verschiedenen Tools wie [XML-Sitemaps.com](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
