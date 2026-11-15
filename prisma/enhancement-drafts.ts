import { contentSchema } from "../shared/schemas.js";
export const enhancementDrafts = [
  ...[
    ["HelioGrid Solar", "PV Manufacturer"],
    ["VoltSphere Storage", "Lithium Systems"],
    ["SunPeak Inverters", "Power Electronics"],
    ["Karoo Microgrid", "Regional Distributor"],
    ["Zambezi Clean Power", "Retail Partner"],
    ["NovaCell Modules", "PV Manufacturer"],
    ["SADC Energy Retail", "Retail Network"],
    ["Equatorial Supply", "Logistics & Distribution"],
  ].map(([title, role]) =>
    contentSchema.parse({
      kind: "network-partner",
      slug: title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-"),
      title,
      description:
        "Illustrative partner ecosystem only. Not a verified Afrisun relationship.",
      demo: true,
      details: { network: { role, namePermission: false } },
    }),
  ),
  ...[
    [
      "karoo-field-story",
      "Karoo Solar & Hardware",
      "Upington, South Africa",
      105,
      "Solar Hardware Retail · 2.4x expanded SKU depth",
      "",
    ],
    [
      "zambezi-field-story",
      "Zambezi Clean Power",
      "Kitwe & Lusaka, Zambia",
      128,
      "Commercial & Agro-Solar · 1.6 MW deployed across Copperbelt",
      "",
    ],
    [
      "nyasa-field-story",
      "Nyasa Clean Energy Depot",
      "Lilongwe, Malawi",
      114,
      "Clinic & Community Power · 24/7 clinic refrigeration uptime",
      "Grace Phiri, General Manager",
    ],
    [
      "pwani-field-story",
      "Pwani Solar Distributors",
      "Dar es Salaam & Morogoro, Tanzania",
      98,
      "Productive-Use Cold Chain · 38% post-harvest spoilage reduction",
      "",
    ],
  ].map(([slug, title, location, durationSeconds, description, attribution]) =>
    contentSchema.parse({
      kind: "video-story",
      slug,
      title,
      description,
      body:
        "ILLUSTRATIVE VIDEO BRIEF ONLY. No actual clip, captions, transcript, partner identity permission or measured result evidence has been supplied. Do not publish. " +
        (slug === "nyasa-field-story"
          ? "Supplied proposed quotation: “Rural clinics in central Malawi needed dependable overnight storage for vaccine cold storage and maternity lighting.”"
          : ""),
      demo: true,
      details: {
        video: {
          location,
          durationSeconds,
          attribution,
          mediaPermission: false,
        },
      },
    }),
  ),
  contentSchema.parse({
    kind: "faq",
    slug: "proposed-payment-terms",
    title:
      "How do Afrisun’s flexible payment terms work for renewable energy retailers?",
    body: "UNCONFIRMED PROPOSED COPY. The supplied description mentions staged settlement schedules and structured trade credit based on history, volume and product mix. These terms are not approved company offerings. The public FAQ uses the approved subject-to-agreement wording instead.",
    demo: true,
    details: { faq: { group: "Payment Terms" } },
  }),
];
