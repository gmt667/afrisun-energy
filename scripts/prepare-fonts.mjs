import { mkdir, writeFile } from "node:fs/promises";
import https from "node:https";
const fetch = async (url, options = {}) =>
  new Promise((resolve, reject) => {
    https
      .get(
        url,
        { family: 4, headers: options.headers, timeout: 60000 },
        (r) => {
          if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
            resolve(fetch(r.headers.location, options));
            r.resume();
            return;
          }
          const chunks = [];
          r.on("data", (c) => chunks.push(c));
          r.on("end", () => {
            const b = Buffer.concat(chunks);
            resolve({
              ok: r.statusCode === 200,
              status: r.statusCode,
              text: async () => b.toString(),
              arrayBuffer: async () => b,
            });
          });
        },
      )
      .on("error", reject)
      .on("timeout", function () {
        this.destroy(new Error("Download timed out"));
      });
  });
await mkdir("public/fonts", { recursive: true });
const response = await fetch(
  "https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Manrope:wght@400..800&display=swap",
  {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    },
  },
);
if (!response.ok)
  throw new Error(`Font CSS request failed: ${response.status}`);
let css = await response.text();
// The approved website is English; retain the Latin variable-font subsets only.
css = css
  .split("/* latin */")
  .slice(1)
  .map((block) => block.split("/*")[0])
  .join("\n");
if (!css) throw new Error("Latin font subsets were not returned");
const urls = [
  ...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((x) => x[1])),
];
for (const [index, url] of urls.entries()) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Font download failed");
  const ext = url.split(".").at(-1);
  const filename = `font-${index}.${ext}`;
  await writeFile(
    `public/fonts/${filename}`,
    Buffer.from(await r.arrayBuffer()),
  );
  css = css.replaceAll(url, `/fonts/${filename}`);
}
for (const family of ["manrope", "inter"]) {
  const r = await fetch(
    `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`,
  );
  if (!r.ok) throw new Error("Font licence download failed");
  await writeFile(`public/fonts/${family}-OFL.txt`, await r.text());
}
await writeFile("src/fonts.css", css);
console.log(
  `Downloaded ${urls.length} self-hosted font files and their licences.`,
);
