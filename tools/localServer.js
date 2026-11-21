const http = require("http");
const path = require("path");
const { exec } = require("child_process");
const { createStaticHandler } = require("./staticFiles");

const siteRoot = path.resolve(__dirname, "..");
const port = Number(process.argv[2]) || 8642;

http.createServer(createStaticHandler(siteRoot)).listen(port, "127.0.0.1", () => {
    const siteUrl = `http://localhost:${port}/index.html`;
    console.log("Site running at " + siteUrl);
    console.log("Close this window to stop it.");
    exec(`start "" "${siteUrl}"`);
});
