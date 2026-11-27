const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const nodemailer = require('nodemailer');

const routes = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/success.html', 'success.html'],
  ['/style.css', 'style.css'],
  ['/script.js', 'script.js'],
  ['/ganesh-chaturthi-background.jpeg', 'ganesh-chaturthi-background.jpeg']
]);

const contentTypes = {
  'index.html': 'text/html; charset=utf-8',
  'success.html': 'text/html; charset=utf-8',
  'style.css': 'text/css; charset=utf-8',
  'script.js': 'text/javascript; charset=utf-8',
  'ganesh-chaturthi-background.jpeg': 'image/jpeg'
};

const allowedDonationTypes = new Set(['One-time', 'Sponsor']);
const emailAttempts = new Map();
const emailRateLimitWindow = 15 * 60 * 1000;
const maxEmailsPerWindow = 5;
const maxRequestBodyBytes = 10 * 1024;
let mailTransporter;

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(body);
}

function createRequestError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let bodySize = 0;
    let tooLarge = false;
    const chunks = [];

    request.on('data', (chunk) => {
      bodySize += chunk.length;
      if (bodySize > maxRequestBodyBytes) {
        tooLarge = true;
        chunks.length = 0;
      } else if (!tooLarge) {
        chunks.push(chunk);
      }
    });

    request.on('end', () => {
      if (tooLarge) {
        reject(createRequestError(413, 'The request is too large.'));
        return;
      }

      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
          reject(createRequestError(400, 'Please send a valid JSON object.'));
          return;
        }
        resolve(payload);
      } catch {
        reject(createRequestError(400, 'Please send valid JSON.'));
      }
    });

    request.on('error', reject);
  });
}

function isRateLimited(request) {
  const forwardedFor = request.headers['x-forwarded-for'];
  const clientIp = typeof forwardedFor === 'string'
    ? forwardedFor.split(',')[0].trim()
    : request.socket.remoteAddress || 'unknown';
  const now = Date.now();

  for (const [ip, record] of emailAttempts) {
    if (record.expiresAt <= now) emailAttempts.delete(ip);
  }

  const record = emailAttempts.get(clientIp);
  if (!record) {
    emailAttempts.set(clientIp, {
      count: 1,
      expiresAt: now + emailRateLimitWindow
    });
    return false;
  }

  if (record.count >= maxEmailsPerWindow) return true;
  record.count += 1;
  return false;
}

async function handleConfirmationEmail(request, response) {
  const contentType = request.headers['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    sendJson(response, 415, { message: 'The request must use JSON.' });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { message: error.message });
    return;
  }

  const name = typeof payload.name === 'string'
    ? payload.name.trim().replace(/\s+/g, ' ')
    : '';
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const amount = Number(payload.amount);
  const type = payload.type;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !name ||
    name.length > 120 ||
    email.length > 254 ||
    !emailPattern.test(email) ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !allowedDonationTypes.has(type)
  ) {
    sendJson(response, 400, { message: 'Please check the donation details and try again.' });
    return;
  }

  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, '');
  if (!gmailUser || !gmailAppPassword) {
    sendJson(response, 503, {
      message: 'Email is not configured yet. Please contact the site owner.'
    });
    return;
  }

  if (isRateLimited(request)) {
    sendJson(response, 429, { message: 'Please wait before submitting another request.' });
    return;
  }

  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000
    });
  }

  try {
    const amountText = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    }).format(amount);

    await mailTransporter.sendMail({
      from: {
        name: 'Avighna Friends Association',
        address: gmailUser
      },
      to: email,
      subject: 'We received your donation details',
      text: [
        `Hello ${name},`,
        '',
        'Thank you for submitting your donation details for Ganesh Chaturthi Celebrations.',
        `Amount entered: ₹${amountText}`,
        `Donation type: ${type}`,
        '',
        'This email confirms receipt of your form submission only. Online payments are not processed through this website.',
        '',
        'Avighna Friends Association'
      ].join('\n')
    });
  } catch (error) {
    console.error('Gmail SMTP send failed:', {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command
    });
    sendJson(response, 502, {
      message: 'The confirmation email could not be sent. Please try again later.'
    });
    return;
  }

  sendJson(response, 200, { message: 'Confirmation email sent.' });
}

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = new URL(request.url, 'http://localhost').pathname;
  } catch {
    response.writeHead(400);
    response.end('Bad Request');
    return;
  }

  if (pathname === '/api/confirmation') {
    if (request.method !== 'POST') {
      sendJson(response, 405, { message: 'Method Not Allowed' });
      return;
    }

    handleConfirmationEmail(request, response);
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const fileName = routes.get(pathname);
  if (!fileName) {
    response.writeHead(404);
    response.end('Not Found');
    return;
  }

  fs.readFile(path.join(__dirname, fileName), (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        response.writeHead(404);
        response.end('Not Found');
        return;
      }

      console.error(`Failed to read ${fileName}:`, error);
      response.writeHead(500);
      response.end('Internal Server Error');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Length': content.length,
      'Content-Type': contentTypes[fileName],
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  });
});

const port = Number(process.env.PORT || 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

server.listen(port, () => {
  console.log(`Avighna Donation App listening on port ${port}`);
});
