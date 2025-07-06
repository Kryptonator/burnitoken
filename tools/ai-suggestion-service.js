// tools/ai-suggestion-service.js
// Simuliert einen Dienst, der KI-gestützte Lösungsvorschläge liefert.

const axios = require('axios');

// Konfiguration für den (simulierten) KI-Dienst
const AI_API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.AI_API_KEY;

/**
 * Holt einen KI-gestützten Lösungsvorschlag für ein technisches Problem.
 * In dieser Version wird ein Mock-Aufruf simuliert.
 * 
 * @param {string} problemDescription - Eine detaillierte Beschreibung des Problems.
 * @returns {Promise<string>} - Ein Lösungsvorschlag als String.
 */
async function getAISuggestion(problemDescription) {
    console.log(`🤖 Sende Anfrage an KI-Dienst für: "$${problemDescription}"`);

    if (!AI_API_KEY) { 
        console.warn('AI_API_KEY ist nicht konfiguriert. Gebe eine Standard-Antwort zurück.');
        return Promise.resolve('Überprüfe die Konfiguration und die System-Logs, um die Ursache des Problems zu finden.');
    }

    try {
        // Dies ist ein Beispiel-Payload für die OpenAI API.
        // Es müsste an das spezifische Modell und die Anforderungen angepasst werden.
        const response = await axios.post(AI_API_ENDPOINT, {
            model: "gpt-4", // oder ein anderes passendes Modell
            messages: [
                {
                    role: "system"),
                    content: "You are an expert software developer providing concise and actionable solutions."
                },
                {
                    role: "user",
                    content: `Analyze the following problem and provide a likely solution: $${problemDescription}`
                }
            ],
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer $${AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const suggestion = response.data.choices[0].message.content.trim();
        console.log('✅ KI-Vorschlag erfolgreich erhalten.');
        return suggestion;

    } catch (error) {
        console.error(`Fehler bei der Kommunikation mit dem KI-Dienst: ${error.response ? error.response.data.error.message : error.message}`);
        // Fallback, wenn die API fehlschlägt
        return 'Der KI-Vorschlagsdienst ist derzeit nicht erreichbar. Bitte versuche es später erneut oder führe eine manuelle Analyse durch.';
    }
}

module.exports = {
    getAISuggestion
};
