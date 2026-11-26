import { Footprint, CaseStudies } from "../ImpactContent";
import { ProjectGallery } from "../ProjectGallery";
import { ImpactDashboard } from "../ImpactDashboard";
import { PartnerTicker } from "../PartnerTicker";
import { VideoStories } from "../VideoStories";
import { FrequentlyAskedQuestions } from "../FrequentlyAskedQuestions";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  PackageCheck,
  Handshake,
  ShieldCheck,
  Factory,
  Truck,
  Store,
  Users,
  Sun,
  Battery,
  Zap,
  GraduationCap,
  HeartPulse,
  Sprout,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  Button,
  Eyebrow,
  Reveal,
  PartnershipCTA,
  LatestInsights,
  ScrollHint,
  ContentCard,
} from "../components";
import type { Content } from "../../shared/schemas";
import { SEO } from "../seo";
import { categories } from "../../shared/content";
const advantages = [
  {
    icon: PackageCheck,
    title: "Readily available products",
    text: "Dependable supply that helps retailers meet demand and keep their customers moving forward.",
  },
  {
    icon: Handshake,
    title: "Flexible payment options",
    text: "Commercial arrangements built around the realities of renewable energy retail.",
  },
  {
    icon: ShieldCheck,
    title: "Quality you can trust",
    text: "Careful sourcing from reputable manufacturers, with dependable quality at the heart of every relationship.",
  },
];
const chain = [
  { icon: Factory, name: "Manufacturers", label: "Innovation & production" },
  { icon: Truck, name: "Distributors", label: "Supply & distribution" },
  { icon: Sun, name: "Afrisun", label: "Connection & coordination" },
  { icon: Store, name: "Retailers", label: "Local market access" },
  { icon: Users, name: "End users", label: "Everyday opportunity" },
];
const homeContent = (): {
  hero?: Content;
  intro?: Content;
  featured: Content[];
} => ({ featured: [] });
export default function Home() {
  const reduced = useReducedMotion();
  const { hero, intro, featured } = homeContent();
  return (
    <>
      <SEO title="Powering Africa’s Future" />
      <section className="hero">
        <img
          className="hero-image"
          src="/images/solar-aerial.webp"
          alt="Illustrative solar array surrounded by green land and waterways"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="container hero-content">
          <motion.div
            initial={false}
            animate={reduced ? {} : { opacity: [0.5, 1], y: [18, 0] }}
            transition={{ duration: 0.8 }}
          >
            <Eyebrow light>
              Connected by purpose. Powered by possibility.
            </Eyebrow>
            <h1>
              {hero ? (
                hero.title
              ) : (
                <>
                  POWERING
                  <br />
                  AFRICA’S <span>FUTURE.</span>
                </>
              )}
            </h1>
            <p>
              {hero?.description ||
                "Connecting leading renewable energy manufacturers to the retailers who bring clean energy to African homes, businesses and communities."}
            </p>
            <div className="actions">
              <Button to="/products">Explore Our Solutions</Button>
              <Button to="/partners" outline>
                Partner With Us
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="container hero-bottom">
          <ScrollHint />
          <span>
            01 <span className="hero-line" /> ENERGY THAT CONNECTS US
          </span>
          <span className="hero-location">SOUTH AFRICA · AFRICAN AMBITION</span>
        </div>
        <div className="hero-side">THE FUTURE IS RENEWABLE</div>
      </section>
      <div className="mission-strip">
        <div className="container">
          <span>
            Better connections.
            <br />
            <strong>Greater possibilities.</strong>
          </span>
          <p>Renewable energy sourcing</p>
          <span className="strip-plus">+</span>
          <p>Retailer supply support</p>
          <span className="strip-plus">+</span>
          <p>Lasting partnerships</p>
          <Link to="/services" aria-label="Explore services">
            <ArrowUpRight />
          </Link>
        </div>
      </div>
      <section className="section intro" id="introduction">
        <div className="container intro-grid">
          <Reveal>
            <Eyebrow>Our purpose</Eyebrow>
            <h2>
              {intro ? (
                intro.title
              ) : (
                <>
                  Bridging Africa’s
                  <br />
                  <em>energy access gap.</em>
                </>
              )}
            </h2>
            <p className="lead">A brighter future begins with access.</p>
            <p>
              {intro?.description ||
                "Afrisun Energy is a South African company working to close Africa’s energy access gap. We make quality renewable energy products readily available, with flexible payment options, so that more Africans can access clean, reliable and affordable power."}
            </p>
            <Link to="/about" className="text-link">
              Discover Afrisun <ArrowUpRight size={18} />
            </Link>
            <div className="intro-caption">
              <span className="mini-sun">
                <Sun />
              </span>
              <span>
                Rooted in South Africa.
                <br />
                <strong>Driven by Africa’s potential.</strong>
              </span>
            </div>
          </Reveal>
          <Reveal className="intro-visual">
            <img
              src="/images/solar-rooftop.webp"
              alt="Illustrative renewable energy workers alongside rooftop solar panels; not an Afrisun project"
              loading="lazy"
            />
            <div className="image-note">
              <span>OUR ROLE</span>
              <p>
                The connection between
                <br />
                great products and
                <br />
                <strong>greater access.</strong>
              </p>
              <ArrowUpRight size={30} />
            </div>
            <small>Sector reference imagery · not an Afrisun project</small>
          </Reveal>
        </div>
      </section>
      <section className="advantages section">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>The Afrisun advantage</Eyebrow>
              <h2>
                Built around <em>what matters.</em>
              </h2>
            </div>
            <p>
              Practical support for the people
              <br />
              bringing clean energy to market.
            </p>
          </div>
          <div className="three-grid">
            {advantages.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.1} className="advantage">
                <span className="item-number">0{i + 1}</span>
                <a.icon size={34} strokeWidth={1.3} />
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="supply-section section">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow light>One connected ecosystem</Eyebrow>
              <h2>
                From possibility
                <br />
                to <em>everyday power.</em>
              </h2>
            </div>
            <p>
              We connect the supply chain so
              <br />
              opportunity can travel further.
            </p>
          </div>
          <div className="supply-chain">
            {chain.map((c, i) => (
              <Reveal
                delay={i * 0.13}
                className={`chain-node ${i === 2 ? "afrisun-node" : ""}`}
                key={c.name}
              >
                <div>
                  <c.icon size={30} strokeWidth={1.4} />
                  {i < 4 && <ArrowRight className="chain-arrow" size={20} />}
                </div>
                <h3>{c.name}</h3>
                <p>{c.label}</p>
              </Reveal>
            ))}
          </div>
          <p className="supply-note">
            Afrisun is a commercial and supply-chain bridge. This illustration
            shows relationships, rather than the physical route of every
            transaction.
          </p>
          <Link className="text-link" to="/services">
            How we support your business <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section products-showcase">
        <div className="container">
          <div className="section-heading">
            <div>
              <Eyebrow>Explore the possibilities</Eyebrow>
              <h2>
                The building blocks
                <br />
                of a <em>cleaner future.</em>
              </h2>
            </div>
            <Button to="/products" className="button-navy">
              Explore Products
            </Button>
          </div>
          <div className="product-category-grid">
            {categories.slice(0, 3).map((c, i) => {
              const Icon = [Sun, Zap, Battery][i];
              return (
                <Reveal key={c.slug} delay={i * 0.1}>
                  <Link
                    to={`/products?category=${c.slug}`}
                    className={`category-card category-card-${i}`}
                  >
                    <img
                      src={c.image}
                      alt={`${c.name} — illustrative product category`}
                      loading="lazy"
                    />
                    <div className="category-top">
                      <Icon size={30} strokeWidth={1.3} />
                      <span>0{i + 1}</span>
                    </div>
                    <div className="category-bottom">
                      <h3>{c.name}</h3>
                      <p>{c.description}</p>
                      <span className="circle-arrow">
                        <ArrowUpRight size={20} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <p className="fine-print">
            Proposed product categories. Specific products, brands and
            availability will be published following verification.
          </p>
          {featured.length > 0 && (
            <div className="three-grid featured-products">
              {featured.slice(0, 3).map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
          <div className="other-categories">
            {categories.slice(3).map((c) => (
              <Link key={c.slug} to={`/products?category=${c.slug}`}>
                {c.name}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="impact-section">
        <div className="impact-photo">
          <img
            src="/images/projects/classroom-lighting.webp"
            alt="Students studying in an electrically lit classroom"
            loading="lazy"
          />
          <div>
            <Eyebrow light>Energy is just the beginning</Eyebrow>
            <h2>
              Power changes
              <br />
              <em>what’s possible.</em>
            </h2>
          </div>
        </div>
        <div className="impact-copy">
          <Reveal>
            <Eyebrow>Beyond the connection</Eyebrow>
            <h2>
              More than energy.
              <br />
              <em>Opportunity.</em>
            </h2>
            <p>
              When a household, school, clinic or small business gains access to
              clean power, the benefits reach far beyond a light switching on.
            </p>
            <div className="impact-list">
              {[
                [GraduationCap, "Longer hours for learning"],
                [HeartPulse, "Stronger healthcare services"],
                [Store, "More productive small businesses"],
                [Sprout, "More resilient communities"],
              ].map(([Icon, text]) => {
                const I = Icon as typeof Sun;
                return (
                  <div key={String(text)}>
                    <I size={22} strokeWidth={1.5} />
                    <span>{String(text)}</span>
                  </div>
                );
              })}
            </div>
            <Link className="text-link" to="/sustainability">
              Our sustainability focus <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="alignment section">
        <div className="container alignment-grid">
          <div>
            <Eyebrow>Part of a bigger picture</Eyebrow>
            <h2>
              A shared vision for
              <br />
              <em>an energised Africa.</em>
            </h2>
            <p>
              Our purpose supports global ambitions for affordable, reliable and
              sustainable energy access.
            </p>
          </div>
          <div className="alignment-items">
            <a
              href="https://sdgs.un.org/goals/goal7"
              target="_blank"
              rel="noreferrer"
              className="alignment-item"
            >
              <span className="sdg-number">
                07
                <Sun size={25} />
              </span>
              <div>
                <h3>Affordable & clean energy</h3>
                <p>
                  Aligned with the ambition of UN Sustainable Development Goal
                  7.
                </p>
              </div>
              <ArrowUpRight />
            </a>
            <a
              href="https://www.worldbank.org/ext/en/energizingafrica/faq"
              target="_blank"
              rel="noreferrer"
              className="alignment-item"
            >
              <span className="mission-number">
                300<span>MISSION</span>
              </span>
              <div>
                <h3>A continent of possibility</h3>
                <p>
                  Mission 300 aims to connect 300 million Africans to
                  electricity by 2030.
                </p>
              </div>
              <ArrowUpRight />
            </a>
            <small>
              Alignment of purpose does not imply official partnership,
              affiliation or institutional endorsement.
            </small>
          </div>
        </div>
      </section>
      <ProjectGallery />
      <ImpactDashboard />
      <Footprint />
      <PartnerTicker />
      <CaseStudies />
      <VideoStories />
      <FrequentlyAskedQuestions />
      <LatestInsights />
      <PartnershipCTA />
    </>
  );
}
