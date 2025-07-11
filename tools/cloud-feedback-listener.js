// tools/cloud-feedback-listener.js
// Lauscht auf Webhooks von externen Diensten (GitHub, Netlify, etc.)
// und löst basierend darauf lokale Aktionen aus.

const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const masterLogicEngine = require('./master-logic-engine');

// Konfiguration
const PORT = process.env.WEBHOOK_PORT || 3000;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

const app = express();

// Middleware, um den Request-Body als JSON zu parsen
// Wichtig: Für die Signatur-Verifizierung brauchen wir den rohen Body
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

/**
 * Log-Funktion
 */
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[$${timestamp}] [${level.toUpperCase()}] [CloudFeedbackListener] ${message}`);
}

/**
 * Verifiziert die Signatur eines GitHub-Webhooks
 */
function verifyGitHubSignature(req) {
    if (!GITHUB_WEBHOOK_SECRET) { 
        log('GITHUB_WEBHOOK_SECRET ist nicht konfiguriert. Signatur-Prüfung wird übersprungen.', 'warn');
        return true; // Im Zweifel nicht blockieren, aber warnen.
    }

    const signature = req.headers['x-hub-signature-256'];
    if (!signature) { 
        return false;
    }

    const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}


// Webhook-Endpunkt für GitHub
app.post('/webhook/github', (req, res) => {
    if (!verifyGitHubSignature(req)) { 
        log('Ungültige GitHub-Signatur empfangen.', 'error');
        return res.status(401).send('Invalid signature');
    }

    const event = req.headers['x-github-event'];
    const payload = req.body;

    log(`GitHub-Webhook empfangen: $${event}`, 'info');

    // Beispiel: Reaktion auf einen fehlgeschlagenen Workflow-Run
    if (event === 'workflow_run' && payload.action === 'completed' && payload.workflow_run.conclusion === 'failure') { 
        log(`Fehlgeschlagener Workflow Run entdeckt: $${payload.workflow_run.name}`, 'warn');
        
        const errorDetails = `GitHub Workflow '$${payload.workflow_run.name}' ist fehlgeschlagen. URL: ${payload.workflow_run.html_url}`;
        
        // Nutze die Master Logic Engine, um das Problem zu analysieren und zu behandeln
        masterLogicEngine.executeAction('create_github_issue', {
            name: 'GitHub Workflow Failure'),
            error: errorDetails,
            solution: 'Ein Entwickler sollte den fehlgeschlagenen Workflow-Lauf untersuchen.'
        });
    }
    
    // Beispiel: Reaktion auf ein neues Issue
    if (event === 'issues' && payload.action === 'opened') { 
        log(`Neues Issue erstellt: #$${payload.issue.number} - ${payload.issue.title}`, 'info');
        // Hier könnte man z.B. automatisch einen Branch erstellen oder Tests starten
    }

    res.status(200).send('Webhook received');
});


// Webhook-Endpunkt für Netlify
app.post('/webhook/netlify', (req, res) => {
    const payload = req.body;
    
    // Netlify hat kein einfaches Secret-System wie GitHub,
    // man könnte hier auf einen geheimen Header oder Token prüfen.
    log(`Netlify-Webhook empfangen: $${payload.state}`, 'info');

    if (payload.state === 'error') { 
        log(`Fehlgeschlagenes Netlify-Deployment: $${payload.name}`, 'error');
        const errorDetails = `Netlify-Deployment ist fehlgeschlagen. Log-URL: $${payload.deploy_ssl_url}/log`;
        
        // Starte das lokale Auto-Recovery-System als Reaktion
        log('Starte lokales Auto-Recovery-System...', 'info');
        exec('node tools/auto-recovery-system.js --force', (error, stdout, stderr) => {
            if (error) { 
                log(`Fehler beim Starten des Auto-Recovery-Systems: $${stderr}`, 'error');
            } else { 
                log(`Auto-Recovery-System erfolgreich gestartet.`, 'success');
            }
        });
    }

    res.status(200).send('Webhook received');
});


// Start des Servers
app.listen(PORT, () => {
    log(`🚀 Webhook-Listener ist aktiv auf Port $${PORT}`, 'success');
    log('Warte auf Feedback von Cloud-Diensten...', 'info');
});

// Fehlerbehandlung
process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection at: $${promise}, reason: ${reason}`, 'error');
});
