import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
const out = "public/images/projects";
await mkdir(out, { recursive: true });
const supplied = "C:/Users/GMT/Downloads/";
const photos = [
  [supplied + "IMG_20250925_110615_914 (1).jpg", "school-inverter"],
  [supplied + "Electrified School Block 1.jpg", "school-solar"],
  [supplied + "20251028_193305.jpg", "classroom-lighting"],
  [supplied + "20251028_095908.jpg", "school-daytime"],
  [out + "/Thuchira MBG-Aerial view.jpg", "thuchira-aerial"],
  [out + "/Mombezi MBG-Aerial view.jpg", "mombezi-aerial"],
  [out + "/Lifuwu Rice Milling.jpg", "rice-milling"],
  [out + "/Kapiri Health Centre EH 1.JPG", "health-centre"],
  [out + "/Phata pump-21.05.2024.jpg", "water-pump"],
  [out + "/cape-town-source.jpg", "cape-town"],
];
for (const [source, name] of photos) {
  await sharp(source)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(`${out}/${name}.webp`);
}
// Canon RAW files contain a camera-generated JPEG preview. Preserve its pixels.
const raw = await readFile(supplied + "3 phase Inverter installation.CR2");
let preview;
for (let start = 0; start < raw.length - 2; start++) {
  if (raw[start] !== 255 || raw[start + 1] !== 216 || raw[start + 2] !== 255)
    continue;
  const end = raw.indexOf(Buffer.from([255, 217]), start + 3);
  if (end < 0) continue;
  const candidate = raw.subarray(start, end + 2);
  try {
    const meta = await sharp(candidate).metadata();
    if (meta.width > 500 && (!preview || candidate.length > preview.length))
      preview = candidate;
  } catch {
    /* Ignore non-preview markers in the RAW sensor payload. */
  }
}
if (!preview) throw new Error("No usable camera JPEG preview found");
await sharp(preview)
  .rotate()
  .resize({ width: 1800, withoutEnlargement: true })
  .webp({ quality: 84 })
  .toFile(`${out}/three-phase-inverter.webp`);
console.log("Prepared 11 project and reference photos.");
