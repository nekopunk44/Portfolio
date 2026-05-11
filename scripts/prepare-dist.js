const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, target);
    } else {
      fs.copyFileSync(source, target);
    }
  }
};

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));
fs.copyFileSync(path.join(root, "robots.txt"), path.join(dist, "robots.txt"));
copyDir(path.join(root, "assets"), path.join(dist, "assets"));
copyDir(path.join(root, "scripts", "compiled"), path.join(dist, "scripts", "compiled"));
copyDir(path.join(root, "styles", "compiled"), path.join(dist, "styles", "compiled"));

console.log("Prepared Cloudflare static assets in ./dist");
