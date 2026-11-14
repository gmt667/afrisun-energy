import sharp from "sharp";
import { mkdir } from "node:fs/promises";
await mkdir("public/images", { recursive: true });
await sharp("public/images/solar-aerial-original.png")
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 86 })
  .toFile("public/images/solar-aerial.webp");
await sharp("public/images/solar-rooftop-original.png")
  .resize({ width: 1100, withoutEnlargement: true })
  .webp({ quality: 84 })
  .toFile("public/images/solar-rooftop.webp");
// Alternate crop of supplied sector imagery; a visual placeholder, never a product record.
await sharp("public/images/solar-rooftop-original.png")
  .extract({ left: 0, top: 320, width: 760, height: 500 })
  .resize(1000)
  .webp({ quality: 84 })
  .toFile("public/images/solar-detail.webp");
console.log("Local, optimised illustrative imagery prepared.");
