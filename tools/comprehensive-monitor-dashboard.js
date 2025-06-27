const fs = require('fs');
const path = require('path');

const STATUS_FILES = {
  master: 'master-task-status.json',
  extensions: 'extension-status.json',
  website: 'website-status.json',
  deployment: 'deployment-status.json',
  gsc: 'gsc-integration-status.json',
  ai: 'ai-status.json',
  security: 'dependency-security-status.json',
};

const readStatusFile = (fileName) => {
  try {
    const filePath = path.join(__dirname, fileName);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
    return { status: 'File not found', lastCheck: new Date().toISOString() };
  } catch (error) {
    return {
      status: 'Error reading file',
      error: error.message,
      lastCheck: new Date().toISOString(),
    };
  }
};

const getStatusClass = (status) => {
  if (typeof status !== 'string') return 'status-unknown';
  switch (status.toLowerCase()) {
    case 'ok':
    case 'success':
    case 'running':
    case 'online':
    case 'stable':
      return 'status-ok';
    case 'error':
    case 'failed':
    case 'offline':
    case 'unstable':
      return 'status-error';
    default:
      return 'status-warning';
  }
};

const generateHTMLDashboard = (status) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comprehensive Monitoring Dashboard</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f9; color: #333; }
            .container { max-width: 1200px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            h1 { text-align: center; color: #2c3e50; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .service { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; transition: all 0.3s ease; }
            .service:hover { transform: translateY(-5px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .service-title { font-size: 1.3em; font-weight: 600; color: #34495e; margin-bottom: 10px; }
            .status { padding: 5px 10px; border-radius: 5px; color: #fff; font-weight: bold; text-transform: uppercase; font-size: 0.9em; }
            .status-ok { background-color: #27ae60; }
            .status-error { background-color: #c0392b; }
            .status-warning { background-color: #f39c12; }
            .status-unknown { background-color: #7f8c8d; }
            .timestamp { font-size: 0.8em; color: #7f8c8d; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Comprehensive Monitoring Dashboard</h1>
            <div class="grid">
                <div class="service">
                    <div class="service-title">Master Task Manager</div>
                    <div class="status ${getStatusClass(status.master.status)}">${status.master.status}</div>
                    <div class="timestamp">Last Run: ${new Date(status.master.lastRun).toLocaleString()}</div>
                </div>
                <div class="service">
                    <div class="service-title">Extension Health</div>
                    <div class="status ${getStatusClass(status.extensions.status)}">${status.extensions.status}</div>
                    <div class="timestamp">Last Check: ${new Date(status.extensions.lastCheck).toLocaleString()}</div>
                </div>
                <div class="service">
                    <div class="service-title">Website Health</div>
                    <div class="status ${getStatusClass(status.website.status)}">${status.website.status}</div>
                    <div class="timestamp">Last Check: ${new Date(status.website.lastCheck).toLocaleString()}</div>
                </div>
                <div class="service">
                    <div class="service-title">Deployment Status</div>
                    <div class="status ${getStatusClass(status.deployment.status)}">${status.deployment.status}</div>
                    <div class="timestamp">Last Check: ${new Date(status.deployment.lastCheck).toLocaleString()}</div>
                </div>
                 <div class="service">
                    <div class="service-title">GSC Integration</div>
                    <div class="status ${getStatusClass(status.gsc.status)}">${status.gsc.status}</div>
                    <div class="timestamp">Last Check: ${new Date(status.gsc.lastCheck).toLocaleString()}</div>
                </div>
                 <div class="service">
                    <div class="service-title">AI Services</div>
                    <div class="status ${getStatusClass(status.ai.status)}">${status.ai.status}</div>
                    <div class="timestamp">Last Check: ${new Date(status.ai.lastCheck).toLocaleString()}</div>
                </div>
                 <div class="service">
                    <div class="service-title">Dependency Security</div>
                    <div class="status ${getStatusClass(status.security.status)}">${status.security.status}</div>
                    <div class="timestamp">Last Check: ${new Date(status.security.lastCheck).toLocaleString()}</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const main = () => {
  const status = {
    master: readStatusFile(STATUS_FILES.master),
    extensions: readStatusFile(STATUS_FILES.extensions),
    website: readStatusFile(STATUS_FILES.website),
    deployment: readStatusFile(STATUS_FILES.deployment),
    gsc: readStatusFile(STATUS_FILES.gsc),
    ai: readStatusFile(STATUS_FILES.ai),
    security: readStatusFile(STATUS_FILES.security),
  };

  const html = generateHTMLDashboard(status);
  const dashboardPath = path.join(__dirname, '..', 'monitoring-dashboard.html');
  fs.writeFileSync(dashboardPath, html);
  console.log(`✅ Dashboard successfully generated at ${dashboardPath}`);
};

main();
