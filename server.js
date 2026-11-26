const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const routes = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/success.html', 'success.html'],
  ['/style.css', 'style.css'],
  ['/script.js', 'script.js']
]);

const contentTypes = {
  'index.html': 'text/html; charset=utf-8',
  'success.html': 'text/html; charset=utf-8',
  'style.css': 'text/css; charset=utf-8',
  'script.js': 'text/javascript; charset=utf-8'
};

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    pathname = new URL(request.url, 'http://localhost').pathname;
  } catch {
    response.writeHead(400);
    response.end('Bad Request');
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
