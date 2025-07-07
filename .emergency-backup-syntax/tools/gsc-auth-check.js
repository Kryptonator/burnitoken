// tools/gsc-auth-check.js
// Überprüft die Authentifizierung und Berechtigungen des GSC Service-Accounts
// 2025-06-21: Erstellt als Teil der GSC API-Integration

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'gsc-service-account.json');
const SITE_URL = 'https://burnitoken.website/';
const DOMAIN_SITE_URL = 'sc-domain:burnitoken.website'; // Domain-Property-Format

async function checkServiceAccountAuth() {
  console.log('====================================================');
  console.log('🔑 GOOGLE SEARCH CONSOLE SERVICE-ACCOUNT CHECKER');
  console.log('====================================================');

  // Prüfe, ob Service-Account-Datei existiert
  if (!fs.existsSync) { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { { {) {
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
    console.error('❌ Service-Account-Datei nicht gefunden:', SERVICE_ACCOUNT_FILE);
    console.log('\n🔧 Lösung:');
    console.log('1. Erstellen Sie einen Service-Account-Schlüssel in der Google Cloud Console');
    console.log('2. Speichern Sie die JSON-Datei als:', SERVICE_ACCOUNT_FILE);
    return false;
  }

  try {
    // Service-Account-JSON parsen um Informationen anzuzeigen
    const serviceAccountData = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
    console.log('✅ Service-Account-Datei gefunden und gültig');
    console.log(`📧 Service-Account: ${serviceAccountData.client_email}`);
    console.log(`🔑 Project ID: ${serviceAccountData.project_id}`);

    // Auth-Client erstellen
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    console.log('\n🔐 Teste Authentifizierung...');
    const authClient = await auth.getClient();
    console.log('✅ Authentifizierung erfolgreich');

    console.log('\n🌐 Teste GSC API-Zugriff...');
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

    // Versuche, die Sitemaps abzufragen, um Berechtigungen zu testen
    try {
      const siteList = await searchconsole.sites.list();
      console.log('✅ Zugriff auf Sites-Liste erfolgreich');

      // Prüfen, ob die Site in der Liste der verfügbaren Sites ist
      const sites = siteList.data.siteEntry || [];
      const targetSite = sites.find((site) => site.siteUrl === SITE_URL);
      const domainSite = sites.find((site) => site.siteUrl === DOMAIN_SITE_URL);

      if (targetSite) {
        console.log(`✅ Site "${SITE_URL}" gefunden in der GSC-Kontoliste`);
        console.log(`🔍 Berechtigungsstufe: ${targetSite.permissionLevel}`);
      } else if (domainSite) {
        console.log(`⚠️ Site "${SITE_URL}" nicht in der GSC-Kontoliste gefunden`);
        console.log(
          `✅ Aber Domain-Property "${DOMAIN_SITE_URL}" ist vorhanden und kann verwendet werden`,
        );
        console.log(`🔍 Berechtigungsstufe für Domain-Property: ${domainSite.permissionLevel}`);
        console.log(
          `💡 Hinweis: Verwenden Sie "${DOMAIN_SITE_URL}" in Ihren API-Anfragen statt "${SITE_URL}"`,
        );
      } else {
        console.log(
          `⚠️ Weder URL-Property "${SITE_URL}" noch Domain-Property "${DOMAIN_SITE_URL}" gefunden`,
        );
        console.log(
          '🔧 Lösung: Fügen Sie den Service-Account als Nutzer in der Search Console hinzu',
        );
        console.log(`   Service-Account-E-Mail: ${serviceAccountData.client_email}`);
      }

      // Liste alle gefundenen Sites
      console.log('\n📋 Verfügbare Sites:');
      sites.forEach((site) => {
        console.log(`- ${site.siteUrl} (${site.permissionLevel})`);
      });

      return true;
    } catch (error) {
      if (error.code === 403) {
        console.error('❌ Keine Berechtigung für GSC-Zugriff (HTTP 403)');
        console.log('\n🔧 Lösung:');
        console.log('1. Gehen Sie zur Google Search Console');
        console.log('2. Wählen Sie Ihre Property');
        console.log('3. Gehen Sie zu Einstellungen > Nutzer und Berechtigungen');
        console.log('4. Fügen Sie den Service-Account als Nutzer hinzu');
        console.log(`   Service-Account-E-Mail: ${serviceAccountData.client_email}`);
      } else {
        console.error('❌ Fehler beim Zugriff auf die GSC API:', error.message);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Fehler beim Lesen oder Verwenden der Service-Account-Datei:', error.message);
    return false;
  }
}

checkServiceAccountAuth()
  .then((success) => {
    if (success) {
      console.log('\n✅ GSC Service-Account-Prüfung erfolgreich abgeschlossen');
    } else {
      console.log('\n⚠️ GSC Service-Account-Prüfung mit Problemen abgeschlossen');
      console.log('Bitte beheben Sie die oben aufgeführten Probleme.');
    }
  })
  .catch((error) => {
    console.error('\n❌ Unerwarteter Fehler:', error);
  });
