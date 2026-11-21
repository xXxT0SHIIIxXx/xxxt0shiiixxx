const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const siteRoot = path.resolve(__dirname, "..");
const port = Number(process.argv[2]) || 8642;
const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".flac": "audio/flac"
};

function getFilePath(requestUrl){
    const urlPath = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
    const filePath = path.normalize(path.join(siteRoot, urlPath));
    if (!filePath.startsWith(siteRoot)) return null;
    return urlPath.endsWith("/") ? path.join(filePath, "index.html") : filePath;
}

function sendRange(response, filePath, stats, rangeHeader, headers){
    const [startText, endText] = rangeHeader.replace("bytes=", "").split("-");
    const start = Number(startText) || 0;
    const end = endText ? Math.min(Number(endText), stats.size - 1) : stats.size - 1;
    if (start >= stats.size || start > end){
        response.writeHead(416, { "Content-Range": "bytes */" + stats.size });
        return response.end();
    }
    response.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${stats.size}`, "Content-Length": end - start + 1 });
    fs.createReadStream(filePath, { start, end }).pipe(response);
}

function handleRequest(request, response){
    const filePath = getFilePath(request.url);
    if (!filePath) return response.writeHead(403).end();
    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) return response.writeHead(404).end("Not found");
        const headers = {
            "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
            "Accept-Ranges": "bytes",
            "Cache-Control": "no-cache"
        };
        if (request.headers.range) return sendRange(response, filePath, stats, request.headers.range, headers);
        response.writeHead(200, { ...headers, "Content-Length": stats.size });
        fs.createReadStream(filePath).pipe(response);
    });
}

http.createServer(handleRequest).listen(port, "127.0.0.1", () => {
    const siteUrl = `http://localhost:${port}/index.html`;
    console.log("Site running at " + siteUrl);
    console.log("Close this window to stop it.");
    exec(`start "" "${siteUrl}"`);
});
