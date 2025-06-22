=== GSC Tools Test & Fix (2025-06-22T15:02:37.964Z) ===
🚀 GSC Tools Test & Fix Utility wird gestartet...
Zeitpunkt: 2025-06-22T15:02:37.971Z
Prüfe GSC-Tools...

🧪 Teste 'gsc-status-check'...
✅ Test für 'gsc-status-check' erfolgreich

🧪 Teste 'gsc-keywords-report'...
✅ Test für 'gsc-keywords-report' erfolgreich

🧪 Teste 'gsc-crawl-stats'...
❌ Fehler beim Testen von 'gsc-crawl-stats': Command failed: node C:\Users\micha\OneDrive\Dokumente\burnitoken.com\tools\gsc-crawl-stats.js --test
C:\Users\micha\OneDrive\Dokumente\burnitoken.com\tools\gsc-crawl-stats.js:5
const { google } = require(\"googleapis\");
                           ^

SyntaxError: Invalid or unexpected token
    at wrapSafe (node:internal/modules/cjs/loader:1662:18)
    at Module._compile (node:internal/modules/cjs/loader:1704:20)
    at Object..js (node:internal/modules/cjs/loader:1895:10)
    at Module.load (node:internal/modules/cjs/loader:1465:32)
    at Function._load (node:internal/modules/cjs/loader:1282:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.16.0

ℹ️ Kein passender Standard-Fix für gsc-crawl-stats gefunden
🧪 Teste 'gsc-performance-data'...
✅ Test für 'gsc-performance-data' erfolgreich

🧪 Teste 'gsc-quick-test'...
✅ Test für 'gsc-quick-test' erfolgreich


📊 ERGEBNIS-ÜBERSICHT:
===================
✅ gsc-status-check: ok
✅ gsc-keywords-report: ok
❌ gsc-crawl-stats: unknown_error
✅ gsc-performance-data: ok
✅ gsc-quick-test: ok
❌ gsc-auth-check: unknown
❌ gsc-integration-monitor: unknown

📝 LEITFADEN FÜR MANUELLE FIXES:
============================

📌 Tool: gsc-crawl-stats
   Status: unknown_error
   Fehler: Command failed: node C:\Users\micha\OneDrive\Dokumente\burnitoken.com\tools\gsc-crawl-stats.js --test
C:\Users\micha\OneDrive\Dokumente\burnitoken.com\tools\gsc-crawl-stats.js:5
const { google } = require(\"googleapis\");
                           ^

SyntaxError: Invalid or unexpected token
    at wrapSafe (node:internal/modules/cjs/loader:1662:18)
    at Module._compile (node:internal/modules/cjs/loader:1704:20)
    at Object..js (node:internal/modules/cjs/loader:1895:10)
    at Module.load (node:internal/modules/cjs/loader:1465:32)
    at Function._load (node:internal/modules/cjs/loader:1282:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.16.0

   Empfehlung: Code überprüfen und Fehler manuell beheben.

📋 ZUSAMMENFASSUNG DER EMPFOHLENEN AKTIONEN:
========================================

🧰 Manuelle Code-Überprüfung für:
- gsc-crawl-stats
