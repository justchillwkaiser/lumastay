// OG image generator (plan 3 task 12 step 3): 1200×630 primary bg +
// "LUMASTAY" + "ARCHITECTURAL PERMANENCE." white text → public/og.png.
// Run: npx tsx scripts/gen-og.ts

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#18241b"/>
  <text x="600" y="290" font-family="Inter, Arial, sans-serif" font-size="96"
    font-weight="700" letter-spacing="14" fill="#ffffff" text-anchor="middle">LUMASTAY</text>
  <text x="600" y="380" font-family="Inter, Arial, sans-serif" font-size="30"
    font-weight="400" letter-spacing="6" fill="#bccabd" text-anchor="middle">ARCHITECTURAL PERMANENCE.</text>
  <rect x="540" y="440" width="120" height="2" fill="#bccabd"/>
</svg>`;

async function main() {
  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(root, "public", "og.png"));
  console.log("wrote public/og.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
