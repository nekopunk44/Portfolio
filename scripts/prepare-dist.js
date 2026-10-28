const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  }
};

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of ["index.html", "robots.txt", "favicon.ico", "favicon.svg", "apple-touch-icon.png", "og.jpg", "sitemap.xml"]) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}
for (const dir of ["img", "media", "models", "resume"]) {
  copyDir(path.join(root, dir), path.join(dist, dir));
}

console.log("Prepared Cloudflare static assets in ./dist");
