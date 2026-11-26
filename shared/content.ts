export const company = {
  name: "Afrisun Energy (Pty) Ltd",
  tagline: "Powering Africa’s Future",
  email: "mfumu@afrisunenergy.co.za",
  emails: [
    "mfumu@afrisunenergy.co.za",
    "anne@afrisunenergy.co.za",
    "bester@afrisunenergy.co.za",
    "admin@afrisunenergy.co.za",
  ],
  phone: "+27 63 508 6630",
  whatsappNumbers: [
    "+27 63 508 6630",
    "+265 993 86 95 53",
    "+265 882 27 22 97",
  ],
  address: "1 Lawnmarket Road, Morningside Villas, Sandton, 2196, South Africa",
  registration: "2026/231724/07",
};
export const socialLinks = [
  {
    name: "WhatsApp",
    url: "https://wa.me/27635086630",
    icon: "whatsapp.svg",
    label: "Chat with Afrisun Energy on WhatsApp",
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/18oTFEf5em/",
    icon: "facebook.png",
    label: "Afrisun Energy on Facebook",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@afrisun.energy1",
    icon: "tiktok.ico",
    label: "Afrisun Energy on TikTok",
  },
  {
    name: "X",
    url: "https://x.com/AfrisunEnergy",
    icon: "x.svg",
    label: "Afrisun Energy on X",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/afrisun.solar.energy/",
    icon: "instagram-app.png",
    label: "Afrisun Energy on Instagram",
  },
  {
    name: "LinkedIn search",
    url: "https://www.linkedin.com/search/results/companies/?keywords=Afrisun%20Energy",
    icon: "linkedin.png",
    label: "Search for Afrisun Energy companies on LinkedIn",
  },
] as const;
export const categories = [
  {
    slug: "solar-panels",
    name: "Solar panels",
    description:
      "Monocrystalline, bifacial and high-efficiency photovoltaic modules.",
    icon: "Sun",
    image: "/images/projects/school-solar.webp",
  },
  {
    slug: "inverters",
    name: "Solar inverters",
    description: "Hybrid, off-grid and grid-tied conversion systems.",
    icon: "Zap",
    image: "/images/projects/three-phase-inverter.webp",
  },
  {
    slug: "energy-storage",
    name: "Energy storage",
    description:
      "Lithium battery systems for residential and commercial applications.",
    icon: "Battery",
    image: "/images/projects/school-inverter.webp",
  },
  {
    slug: "solar-lighting",
    name: "Solar lighting",
    description: "Streetlights, floodlights and home lighting kits.",
    icon: "Lightbulb",
    image: "/images/products/solar-lighting.webp",
  },
  {
    slug: "water-pumping",
    name: "Solar water pumping",
    description: "Solar pumps and controllers for water access and irrigation.",
    icon: "Droplets",
    image: "/images/products/water-pumping.webp",
  },
  {
    slug: "accessories",
    name: "Accessories",
    description:
      "Mounting, charge controllers, cables and protection equipment.",
    icon: "Cable",
    image: "/images/solar-rooftop.webp",
  },
] as const;
export const services = [
  [
    "Renewable energy product sourcing",
    "Connecting retailers with suitable renewable energy products from reputable manufacturers and distributors. Tell us about your market, application and product requirements.",
  ],
  [
    "Wholesale supply coordination",
    "Supporting product availability through supply-chain relationships. We coordinate commercial requirements between suppliers and retailers.",
  ],
  [
    "Retailer supply support",
    "Helping retailers access products needed to serve their markets, with a focus on dependable quality and clear communication.",
  ],
  [
    "Flexible commercial payment arrangements",
    "Exploring commercial payment options suited to renewable energy retail, subject to individual agreement and eligibility. Terms are confirmed before any commitment.",
  ],
  [
    "Manufacturer & distributor market access",
    "Connecting suppliers with renewable energy retail channels and exploring opportunities to meet local market needs.",
  ],
  [
    "Strategic supply-chain partnerships",
    "Building lasting commercial relationships between manufacturers, distributors and retailers to improve energy access.",
  ],
] as const;
export const industries = [
  [
    "Residential households",
    "Reliable power for everyday life",
    "Renewable energy products can support lighting, household appliances and connectivity, helping families make more of each day.",
    "energy-storage",
  ],
  [
    "Commercial businesses",
    "Energy that keeps business moving",
    "Solar and storage products can support business continuity, productive working hours and the energy needs of small and growing enterprises.",
    "inverters",
  ],
  [
    "Agriculture & irrigation",
    "Powering productive land",
    "Solar water pumping and suitable energy systems can support irrigation, water access and agricultural productivity.",
    "water-pumping",
  ],
  [
    "Healthcare facilities",
    "Supporting essential care",
    "Appropriately specified renewable energy systems can help support lighting, communications and essential services at healthcare facilities.",
    "energy-storage",
  ],
  [
    "Schools & education",
    "More possibilities for learning",
    "Access to lighting and power can extend study time and support digital learning in schools and educational institutions.",
    "solar-lighting",
  ],
  [
    "Community infrastructure",
    "Stronger, more resilient communities",
    "Solar lighting and distributed energy products can support shared spaces, communications and community services.",
    "solar-lighting",
  ],
  [
    "Off-grid & rural access",
    "Reaching beyond the grid",
    "Renewable energy products can bring practical power options to households and enterprises where grid access is limited.",
    "solar-panels",
  ],
] as const;
export const goals = [
  "Make quality renewable energy products readily available to retailers across Africa.",
  "Offer flexible payment options that lower barriers to stocking and selling clean energy.",
  "Build strong, lasting partnerships with trusted manufacturers, distributors and retailers.",
  "Contribute measurably to SDG 7 and Mission 300 by expanding energy access.",
  "Improve livelihoods through better health, education, security, productivity and income.",
];
export const insightTopics = [
  { slug: "solar-storage", label: "Solar & Storage" },
  { slug: "finance-policy", label: "Finance & Policy" },
  { slug: "grid-energy-access", label: "Grid & Energy Access" },
];
export const articleCategories = [
  "Solar & Storage",
  "Finance & Policy",
  "Grid & Energy Access",
  "Renewable Energy News",
  "Solar Technology",
  "Energy Access in Africa",
  "Industry Insights",
  "Product Knowledge",
  "Sustainability",
  "Company Updates",
];
export const navigation = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Products", "/products"],
  ["Services", "/services"],
  ["Industries", "/industries"],
  ["Sustainability", "/sustainability"],
  ["Insights", "/insights"],
  ["Partnerships", "/partners"],
  ["Contact Us", "/contact"],
] as const;
