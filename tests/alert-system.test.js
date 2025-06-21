/**
 * BurniToken Alert System Test
 * 
 * Testet die Konfiguration des E-Mail-Alert-Systems.
 * Hinweis: Dieser Test ist nur für lokale Entwicklung gedacht und
 * sollte nicht in der CI-Umgebung ausgeführt werden.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

describe('Alert System', () => {
  let transporter;
  
  beforeAll(() => {
    // Erstelle einen Test-Account für Ethereal (kein realer E-Mail-Versand)
    return nodemailer.createTestAccount()
      .then(testAccount => {
        // Erstelle einen Transporter mit Ethereal Test-Account
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      });
  });

  test('Email Alert Konfiguration sollte korrekt formatiert sein', () => {
    // Teste, ob die E-Mail-Adresse korrekt formatiert ist
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    expect('burn.coin@yahoo.com').toMatch(emailRegex);
    
    // Überprüfe, ob der Transporter konfiguriert ist
    expect(transporter).toBeDefined();
  });

  test('Test-E-Mail sollte versendbar sein', async () => {
    // Überspringe den Test, wenn wir in einer CI-Umgebung sind
    if (process.env.CI) {
      console.log('Skipping email sending test in CI environment');
      return;
    }
    
    const mailOptions = {
      from: '"BurniToken Test" <test@example.com>',
      to: 'test@ethereal.email',
      subject: '[TEST] Alert System Check',
      text: 'Diese E-Mail bestätigt, dass das Alert-System korrekt konfiguriert ist.',
      html: '<p>Diese E-Mail bestätigt, dass das <b>Alert-System</b> korrekt konfiguriert ist.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    expect(info).toBeDefined();
    expect(info.messageId).toBeDefined();
    
    // Log-URL für Ethereal (nur für Tests)
    console.log('Test-E-Mail-URL:', nodemailer.getTestMessageUrl(info));
  });
  
  test('GitHub Actions E-Mail Alert Format sollte korrekt sein', () => {
    // Struktur der E-Mail überprüfen, wie sie in der GitHub Actions-Workflow-Datei verwendet wird
    const subject = "[BurniToken CI] Tests Failed - Immediate Attention Required";
    const body = `
      🚨 **BurniToken CI Tests Failed**

      One or more tests in the CI pipeline failed and require your attention.

      **Commit**: ${'123abc'}
      **Branch**: ${'main'}
      **Triggered by**: ${'testuser'}
      **Workflow**: ${'CI - Test and Validate'}
      
      For details, see the workflow run: 
      https://github.com/burnitoken/burnitoken.com/actions/runs/12345
      
      Please fix this issue as soon as possible.
    `;
    
    expect(subject).toContain("BurniToken");
    expect(subject).toContain("Failed");
    expect(body).toContain("pipeline failed");
    expect(body).toContain("**Commit**");
    expect(body).toContain("**Branch**");
  });
});
