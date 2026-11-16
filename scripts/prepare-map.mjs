import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo";
import branches from "../shared/branches.json" with { type: "json" };
const source = await readFile(".cache-map/countries.geojson");
const all = JSON.parse(source);
const features = all.features.filter(
  (f) =>
    f.properties.CONTINENT === "Africa" ||
    ["MUS", "SYC"].includes(f.properties.ISO_A3_EH),
);
const collection = { type: "FeatureCollection", features };
const projection = geoNaturalEarth1().fitExtent(
  [
    [18, 18],
    [622, 562],
  ],
  collection,
);
const path = geoPath(projection).digits(1);
const regions = {
  "Southern Africa": "Southern Africa",
  "Eastern Africa": "East Africa",
  "Western Africa": "West Africa",
  "Middle Africa": "Central Africa",
  "Northern Africa": "North Africa",
};
const countries = features
  .map((f) => ({
    code:
      f.properties.ISO_A3_EH !== "-99"
        ? f.properties.ISO_A3_EH
        : f.properties.ADM0_A3,
    name: f.properties.NAME_EN || f.properties.ADMIN,
    region: regions[f.properties.SUBREGION] || f.properties.SUBREGION,
    path: path(f),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
if (
  !countries.some((c) => c.code === "ZAF") ||
  countries.length < 54 ||
  countries.some((c) => !c.path)
)
  throw new Error("Unexpected Africa boundary data");
await mkdir("public/maps", { recursive: true });
await writeFile(
  "public/maps/africa.json",
  JSON.stringify({
    viewBox: "0 0 640 580",
    source: "Natural Earth 1:50m admin 0",
    sha256: createHash("sha256").update(source).digest("hex"),
    countries,
    branches: branches.map((branch) => {
      const feature = features.find(
        (f) => f.properties.ISO_A3_EH === branch.code,
      );
      const point = projection(branch.coordinates || geoCentroid(feature));
      return { ...branch, point, approximate: !branch.coordinates };
    }),
  }),
);
await writeFile(
  "shared/africa-countries.json",
  JSON.stringify(
    countries.map(({ code, name, region }) => ({ code, name, region })),
    null,
    2,
  ) + "\n",
);
console.log(
  `Generated ${countries.length} sourced country/territory outlines; no invented location coordinates.`,
);
