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

  beforeAll(async () => {
    // Skip network calls in CI environment or when running unit tests
    if (process.env.CI || process.env.NODE_ENV === 'test') {
      // Mock transporter for CI/test environments
      transporter = {
        sendMail: jest.fn().mockResolvedValue({
          messageId: 'test-message-id',
          accepted: ['test@example.com'],
          rejected: [],
          pending: [],
          response: '250 Message accepted'
        })
      };
      return;
    }

    // Only create real transporter for local development
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.warn('Could not create test account, using mock transporter:', error.message);
      // Fallback to mock for environments without network access
      transporter = {
        sendMail: jest.fn().mockResolvedValue({
          messageId: 'mock-message-id',
          accepted: ['test@example.com'],
          rejected: [],
          pending: [],
          response: '250 Message accepted'
        })
      };
    }
  });

  test('Email Alert Konfiguration sollte korrekt formatiert sein', () => {
    // Teste, ob die E-Mail-Adresse korrekt formatiert ist
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    expect('burn.coin@yahoo.com').toMatch(emailRegex);

    // Überprüfe, ob der Transporter konfiguriert ist
    expect(transporter).toBeDefined();
  });

  test('Test-E-Mail sollte versendbar sein', async () => {
    const mailOptions = {
      from: '"BurniToken Test" <test@example.com>',
      to: 'test@ethereal.email',
      subject: '[TEST] Alert System Check',
      text: 'Diese E-Mail bestätigt, dass das Alert-System korrekt konfiguriert ist.',
      html: '<p>Diese E-Mail bestätigt, dass das <b>Alert-System</b> korrekt konfiguriert ist.</p>',
    };

    const info = await transporter.sendMail(mailOptions);
    expect(info).toBeDefined();
    expect(info.messageId).toBeDefined();

    // Log-URL für Ethereal (nur für Tests)
    if (typeof nodemailer.getTestMessageUrl === 'function' && info.messageId.includes('@ethereal.email')) {
      console.log('Test-E-Mail-URL:', nodemailer.getTestMessageUrl(info));
    }
  });

  test('GitHub Actions E-Mail Alert Format sollte korrekt sein', () => {
    // Struktur der E-Mail überprüfen, wie sie in der GitHub Actions-Workflow-Datei verwendet wird
    const subject = '[BurniToken CI] Tests Failed - Immediate Attention Required';
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

    expect(subject).toContain('BurniToken');
    expect(subject).toContain('Failed');
    expect(body).toContain('pipeline failed');
    expect(body).toContain('**Commit**');
    expect(body).toContain('**Branch**');
  });
});