// Netlify Function für ein einfaches Kontaktformular
// Endpunkt: /.netlify/functions/contact-form

exports.handler = async (event, context) => {
  // CORS-Header für Cross-Origin-Anfragen
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONS-Anfrage für CORS-Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Nur POST-Anfragen zulassen
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Daten aus der Anfrage parsen
    const data = JSON.parse(event.body);
    const { name, email, message } = data;

    // Einfache Validierung
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Hier würde normalerweise der Code für den E-Mail-Versand stehen
    // z.B. mit Netlify-Integrationen oder externen Services wie SendGrid
    console.log('Kontaktanfrage erhalten:', { name, email, message });

    // Erfolgreiche Antwort
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Ihre Nachricht wurde erfolgreich gesendet!',
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server error',
        message: error.toString(),
      }),
    };
  }
};
