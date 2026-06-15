const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8788);
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || ROOT;
const HTML_FILE = path.join(ROOT, "amazon-design-schedule.html");
const DATA_FILE = path.join(DATA_DIR, "schedule-data.json");

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seedFile = path.join(ROOT, "schedule-data.json");
    if (fs.existsSync(seedFile)) {
      fs.copyFileSync(seedFile, DATA_FILE);
    } else {
      fs.writeFileSync(DATA_FILE, "{}", "utf8");
    }
  }
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body), "utf8");
  res.writeHead(status, {
    "content-type": type,
    "content-length": payload.length,
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

ensureDataFile();

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      send(res, 204, "");
      return;
    }

    if ((req.url === "/" || req.url === "/index.html") && req.method === "GET") {
      send(res, 200, fs.readFileSync(HTML_FILE), "text/html; charset=utf-8");
      return;
    }

    if (req.url === "/api/schedule" && req.method === "GET") {
      ensureDataFile();
      send(res, 200, fs.readFileSync(DATA_FILE), "application/json; charset=utf-8");
      return;
    }

    if (req.url === "/api/schedule" && req.method === "POST") {
      const body = await readBody(req);
      JSON.parse(body);
      fs.writeFileSync(DATA_FILE, body, "utf8");
      send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
      return;
    }

    send(res, 404, "Not found");
  } catch (error) {
    send(res, 500, JSON.stringify({ ok: false, error: error.message }), "application/json; charset=utf-8");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Schedule app is running on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
