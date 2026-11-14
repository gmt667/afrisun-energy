// User-supplied illustrative copy. These records are private demonstrations, never verified facts.
export const proposedContent = [
  ...[
    [
      "households-powered",
      "42,500+ households powered",
      "Homes connected to reliable solar lighting and household power",
      "17%",
    ],
    [
      "clean-capacity",
      "18.4 MW of energy installed",
      "Cumulative solar PV and lithium storage capacity deployed",
      "15%",
    ],
    [
      "retail-partners",
      "310+ retail & distribution partners",
      "Active regional stockists enabled with flexible payment terms",
      "21%",
    ],
    [
      "community-institutions",
      "640+ clinics, schools & SMEs",
      "Community institutions powered for longer study, care and income",
      "15%",
    ],
  ].map(([slug, title, description, progress]) => ({
    kind: "metric",
    slug,
    title,
    description,
    category: "2030 Mission 300 horizon",
    body: `ILLUSTRATIVE PROGRAMME TRACKING ONLY. Not verified Afrisun impact. Proposed 2030 milestone progress: ${progress}. No baseline, target denominator, measurement date or methodology has been supplied. Verification and company approval required before publication.`,
  })),
  ...[
    [
      "south-africa",
      "South Africa",
      "Sandton (HQ) & Polokwane",
      "Southern Africa",
    ],
    ["zambia", "Zambia", "Lusaka & Copperbelt", "Southern Africa"],
    ["malawi", "Malawi", "Lilongwe & Blantyre", "Southern Africa"],
    ["tanzania", "Tanzania", "Dar es Salaam & Dodoma", "East Africa"],
    ["mozambique", "Mozambique", "Maputo & Beira", "Southern Africa"],
    ["zimbabwe", "Zimbabwe", "Harare & Bulawayo", "Southern Africa"],
    ["botswana", "Botswana", "Gaborone", "Southern Africa"],
    ["namibia", "Namibia", "Windhoek", "Southern Africa"],
    ["kenya", "Kenya", "Nairobi", "East Africa"],
    ["nigeria", "Nigeria", "Lagos", "West Africa"],
  ].map(([slug, title, description, category]) => ({
    kind: "market",
    slug,
    title,
    description,
    category,
    body:
      slug === "south-africa"
        ? "PROPOSED UNVERIFIED FOOTPRINT COPY. Only the Sandton headquarters is approved. Polokwane, central warehousing, flexible trade settlement, 160+ retail partners, full solar PV/hybrid inverter/LiFePO4 inventory and national coverage all require evidence before publication."
        : "PROPOSED UNVERIFIED FOOTPRINT COPY. Active retail partnerships, distribution hubs and cross-border operations in this market have not been verified. Obtain company approval and supporting evidence before publication.",
  })),
  {
    kind: "case-study",
    slug: "karoo-solar-hardware",
    title: "Karoo Solar & Hardware",
    description: "Expanding retail SKU depth without straining working capital",
    category: "Northern Cape, South Africa",
    body: "ILLUSTRATIVE CASE STUDY — NOT A VERIFIED AFRISUN CUSTOMER.\n\n“Before working with Afrisun, upfront stock deposits forced us to limit inventory to basic lighting kits. Staged payment terms let us keep hybrid inverters and lithium batteries on the floor ahead of seasonal demand.”\n\nPieter van der Merwe · Managing Partner\n\nProposed case study: structured 30-day trade settlement broadened stock from 4 entry lighting kits to 14 solar and storage SKUs. Supplied display figure: 2.4x active SKU range (inconsistent with 4 to 14; requires correction). All terms, identities, permission to quote and figures need verification.",
  },
  {
    kind: "case-study",
    slug: "limpopo-clean-energy",
    title: "Limpopo Clean Energy Retail",
    description: "Eliminating backorders across 18 sub-dealer outlets",
    category: "Polokwane, South Africa",
    body: "ILLUSTRATIVE CASE STUDY — NOT A VERIFIED AFRISUN CUSTOMER.\n\n“Customers walk away the moment a retailer cannot confirm stock. Afrisun’s replenishment reliability meant our network fulfilled every clinic and small-business solar order on schedule this year.”\n\nNomsa Baloyi · Branch Operations Lead\n\nProposed claims: 98% on-time fulfilment, 18 dealer outlets supplied, continuous availability of monocrystalline PV and solar home systems. Quote implies every order was on schedule while the metric says 98%; reconcile and obtain evidence and written permissions before publication.",
  },
  {
    kind: "case-study",
    slug: "zambezi-clean-power",
    title: "Zambezi Clean Power",
    description: "Scaling productive-use solar with verified warranties",
    category: "Lusaka & Copperbelt, Zambia",
    body: "ILLUSTRATIVE CASE STUDY — NOT A VERIFIED AFRISUN CUSTOMER.\n\n“Quality vetting matters as much as price. Knowing every panel and inverter batch is pre-verified gives our commercial buyers confidence and keeps warranty claims near zero.”\n\nChanda Mwamba · Procurement Director\n\nProposed claims: 1.6 MW retail volume deployed and less than 1% warranty returns. Cross-border coordination, supplier vetting, warranties, identities, calculation method, time period and permission to quote require verification. Do not present Afrisun as an installation or certification contractor.",
  },
  ...[
    [
      "africa-transmission-gap",
      "Is Africa’s transmission gap a project or a money problem? – Experts weigh in",
      "Utility master plans are full of transmission lines but what they lack is the commercial groundwork that lets a lender say yes.",
      "Finance & Policy",
      "13 November 2026",
    ],
    [
      "walo-storage",
      "West Africa’s first solar plus battery project: Walo Storage",
      "A supplied sector headline about solar photovoltaic generation integrated with battery storage in Senegal.",
      "Solar & Storage",
      "13 November 2026",
    ],
    [
      "powerstack-3",
      "Sungrow unveils Powerstack 3.0, unlocking new era for C&I with scene-in-one integration",
      "Shifting from all-in-one physical integration to system configurations designed around specific application needs.",
      "Solar & Storage",
      "12 November 2026",
    ],
  ].map(([slug, title, description, category, date]) => ({
    kind: "article",
    slug,
    title,
    description,
    category,
    body: `PROPOSED EXTERNAL HEADLINE. Supplied attribution: ESI Africa, ${date}. Exact source URL, publication date and reuse permissions have not been verified. Link to the original source and write an approved original summary before publication. This is not Afrisun company news.`,
  })),
];
