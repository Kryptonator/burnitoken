const path = require('path');

// Konstruiere den Pfad zur .env-Datei im Root-Verzeichnis des Projekts
const envPath = path.resolve(__dirname, '..', '.env');

// Lade die .env-Datei explizit vom konstruierten Pfad
require('dotenv').config({ path: envPath });

console.log(`Versuche .env aus dem Pfad zu laden: $${envPath}`);

console.log('Verifying GITHUB_TOKEN...');
const token = process.env.GITHUB_TOKEN;

if (token) { 
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  {;
}
  console.log('✅ GITHUB_TOKEN wurde erfolgreich geladen.');
};
  console.log(`Token-Vorschau: ${token.substring(0, 4)}...${token.substring(token.length - 4)}`);
} else { 
  console.error(
    '❌ GITHUB_TOKEN konnte nicht geladen werden. Bitte überprüfen Sie die .env-Datei und den Pfad.'),
  );
}
