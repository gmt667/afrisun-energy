import { Link } from "react-router-dom";
import { ProjectGallery } from "../ProjectGallery";
import {
  ArrowUpRight,
  Check,
  Sun,
  Target,
  Compass,
  Factory,
  Truck,
  Store,
  Globe,
} from "lucide-react";
import {
  PageHero,
  Eyebrow,
  Reveal,
  PartnershipCTA,
  Button,
} from "../components";
import { SEO } from "../seo";
import { goals, services, industries } from "../../shared/content";
import { EnquiryForm } from "../forms";
import { ImpactDashboard } from "../ImpactDashboard";
import { CaseStudies } from "../ImpactContent";
import { FrequentlyAskedQuestions } from "../FrequentlyAskedQuestions";
export function About() {
  return (
    <>
      <SEO title="About Us" />
      <PageHero
        label="About Afrisun"
        title="Connected by a brighter purpose."
        image
        text="A South African company with an ambition that reaches beyond the grid."
      />
      <section className="section">
        <div className="container editorial-grid">
          <Reveal>
            <Eyebrow>Who we are</Eyebrow>
            <h2>
              Access to energy.
              <br />
              <em>Access to possibility.</em>
            </h2>
          </Reveal>
          <div className="body-copy">
            <p className="lead">
              Afrisun Energy (Pty) Ltd is a South African registered company
              with the objective of powering Africa’s future.
            </p>
            <p>
              Across the continent, millions of people still live without
              reliable electricity. Only a small number of African countries
              have achieved universal access. This gap limits education, weakens
              healthcare, restricts income and leaves communities less secure.
            </p>
            <p>
              Afrisun was created to help close it. We work with the renewable
              energy sector to scale energy access, improving livelihoods,
              productivity, literacy, security, health and income across African
              countries.
            </p>
          </div>
        </div>
      </section>
      <section className="section off-white">
        <div className="container intro-grid">
          <img
            className="editorial-image"
            src="/images/solar-rooftop.webp"
            alt="Illustrative solar sector workers, not an Afrisun team or project"
            loading="lazy"
          />
          <Reveal>
            <Eyebrow>What we do</Eyebrow>
            <h2>
              A bridge between
              <br />
              <em>supply and opportunity.</em>
            </h2>
            <p>
              Afrisun is the bridge between manufacturers and distributors on
              one side and retailers on the other.
            </p>
            <div className="check-list">
              {[
                "Readily available products",
                "Flexible payment methods",
                "Dependable quality",
              ].map((t) => (
                <p key={t}>
                  <Check size={18} />
                  {t}
                </p>
              ))}
            </div>
            <Button to="/services" className="button-navy">
              Our Services
            </Button>
          </Reveal>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Eyebrow>Our direction</Eyebrow>
          <div className="three-grid principles">
            {[
              [
                Sun,
                "Our why",
                "Energy access is the foundation of development. When a household, school, clinic or small business gains access to clean power, children can study for longer, health services can improve, work becomes more productive and incomes can grow.",
              ],
              [
                Compass,
                "Our vision",
                "To be a leading partner in Africa’s renewable energy supply chain, where every African household, business and institution can access clean and reliable energy.",
              ],
              [
                Target,
                "Our mission",
                "To bridge the energy access gap by connecting manufacturers and distributors to retailers, making quality renewable energy products available, affordable and easy to access across Africa.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Sun;
              return (
                <Reveal key={String(title)}>
                  <I size={30} strokeWidth={1.4} />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section goals-section">
        <div className="container editorial-grid">
          <div>
            <Eyebrow light>Our goals</Eyebrow>
            <h2>
              Purpose becomes
              <br />
              <em>progress through action.</em>
            </h2>
          </div>
          <div>
            {goals.map((g, i) => (
              <Reveal className="goal" key={g}>
                <span>0{i + 1}</span>
                <p>{g}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <PartnershipCTA />
    </>
  );
}
export function Services() {
  return (
    <>
      <SEO title="Services" />
      <PageHero
        label="Our services"
        title="Stronger connections. Better energy access."
        text="Practical sourcing, supply coordination and commercial support for the renewable energy value chain."
      />
      <section className="section">
        <div className="container">
          <Eyebrow>How we help</Eyebrow>
          {services.map(([title, text], i) => (
            <Reveal className="service-row" key={title} id={`service-${i + 1}`}>
              <span className="service-number">0{i + 1}</span>
              <h2>{title}</h2>
              <div>
                <p>{text}</p>
                <Link
                  className="text-link"
                  to={`/contact?interest=${encodeURIComponent(title)}`}
                >
                  Discuss your requirements <ArrowUpRight size={17} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <div className="container">
        <p className="notice">
          Commercial terms are agreed individually. Product sourcing and supply
          coordination do not include installation, regulated lending or
          technical certification services.
        </p>
      </div>
      <PartnershipCTA />
    </>
  );
}
export function Industries() {
  return (
    <>
      <SEO title="Industries & Applications" />
      <PageHero
        label="Where energy makes a difference"
        title="Power for the way Africa lives and works."
        image
        text="Exploring the applications where renewable energy products can create everyday opportunity."
      />
      <section className="section">
        <div className="container">
          <p className="notice">
            These are target applications for renewable energy products, rather
            than a portfolio of completed Afrisun projects.
          </p>
          <div className="industry-grid">
            {industries.map(([title, heading, text, category], i) => (
              <Reveal className="industry-item" key={title}>
                <span className="item-number">0{i + 1}</span>
                <Eyebrow>{title}</Eyebrow>
                <h2>{heading}</h2>
                <p>{text}</p>
                <Link
                  className="text-link"
                  to={`/products?category=${category}`}
                >
                  Explore relevant products <ArrowUpRight size={17} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <PartnershipCTA />
    </>
  );
}
export function Sustainability() {
  return (
    <>
      <SEO title="Sustainability & Impact" />
      <PageHero
        label="Sustainability & impact"
        title="A more connected future is a more resilient one."
        image
        text="Energy access is a foundation for education, health, economic opportunity and community resilience."
      />
      <section className="section">
        <div className="container editorial-grid">
          <div>
            <Eyebrow>Lasting value</Eyebrow>
            <h2>
              Good supply chains.
              <br />
              <em>Greater opportunity.</em>
            </h2>
          </div>
          <div className="body-copy">
            <p className="lead">
              For renewable energy to make a difference, it needs to reach the
              people who can use it.
            </p>
            <p>
              By connecting reputable manufacturers and distributors with
              retailers, renewable energy supply chains can improve product
              availability and support last-mile access. Local retailers bring
              market knowledge and a closer connection to households, businesses
              and institutions.
            </p>
            <p>
              Afrisun’s role is to strengthen these connections through
              sourcing, supply coordination and commercial relationships. Our
              ambition is to support renewable energy adoption in ways that
              improve everyday life.
            </p>
            <p>
              Access also depends on practical commercial relationships. Payment
              arrangements and opportunities to collaborate with finance
              partners can be explored subject to agreement and eligibility. No
              financing approval, standard credit facility or lending service is
              promised by this website.
            </p>
          </div>
        </div>
      </section>
      <section className="section off-white">
        <div className="container">
          <Eyebrow>What access can enable</Eyebrow>
          <h2>
            One connection.
            <br />
            <em>Many possibilities.</em>
          </h2>
          <div className="three-grid impact-topics">
            {[
              [
                "Education",
                "Lighting can extend study time, while electricity can support digital learning and connectivity.",
              ],
              [
                "Healthcare",
                "Appropriately specified systems can support lighting, communications and essential care.",
              ],
              [
                "Economic opportunity",
                "Reliable energy can enable productive work, small enterprises and new income opportunities.",
              ],
              [
                "Community resilience",
                "Distributed renewable energy can widen the options available to underserved communities.",
              ],
              [
                "Household livelihoods",
                "Power can support everyday tasks, access to information and productive activities.",
              ],
              [
                "Community safety",
                "Well-designed lighting can support the use of shared spaces after dark.",
              ],
            ].map(([title, text]) => (
              <Reveal key={title}>
                <Sun size={25} />
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container editorial-grid">
          <div>
            <Eyebrow>Global alignment</Eyebrow>
            <h2>
              Our purpose.
              <br />
              <em>A shared ambition.</em>
            </h2>
            <p>
              These global initiatives describe the future we want to help
              advance. They do not represent official partnerships or
              endorsements of Afrisun.
            </p>
          </div>
          <div>
            <article className="global-goal">
              <span>SDG 7</span>
              <h3>Affordable and clean energy</h3>
              <p>
                The United Nations Sustainable Development Goal 7 calls for
                access to affordable, reliable, sustainable and modern energy
                for all.
              </p>
              <a
                className="text-link"
                href="https://sdgs.un.org/goals/goal7"
                target="_blank"
                rel="noreferrer"
              >
                Read the UN goal <ArrowUpRight size={17} />
              </a>
            </article>
            <article className="global-goal">
              <span>MISSION 300</span>
              <h3>Connecting 300 million by 2030</h3>
              <p>
                Led by the World Bank Group and African Development Bank Group,
                Mission 300 aims to bring electricity access to 300 million
                people in Africa by 2030.
              </p>
              <a
                className="text-link"
                href="https://www.worldbank.org/ext/en/energizingafrica/faq"
                target="_blank"
                rel="noreferrer"
              >
                Read about Mission 300 <ArrowUpRight size={17} />
              </a>
            </article>
          </div>
        </div>
      </section>
      <ProjectGallery />
      <ImpactDashboard />
      <PartnershipCTA />
    </>
  );
}
const partners = [
  {
    icon: Factory,
    title: "Manufacturers",
    text: "Reach renewable energy retail markets through purposeful supply-chain relationships.",
  },
  {
    icon: Truck,
    title: "Distributors",
    text: "Explore opportunities to strengthen product availability and distribution networks.",
  },
  {
    icon: Store,
    title: "Retailers",
    text: "Enquire about product sourcing, commercial arrangements and practical supply support.",
  },
  {
    icon: Globe,
    title: "Development partners",
    text: "Explore collaboration aligned with energy access and sustainable development.",
  },
];
export function Partners() {
  return (
    <>
      <SEO title="Partnerships" />
      <PageHero
        label="Grow through connection"
        title="A brighter future is a shared endeavour."
        text="Bring your expertise. Share our ambition. Let’s explore what we can make possible together."
      />
      <section className="section">
        <div className="container partner-grid">
          {partners.map((p) => (
            <Reveal className="partner-item" key={p.title}>
              <p.icon size={34} strokeWidth={1.4} />
              <h2>{p.title}</h2>
              <p>{p.text}</p>
              <a href="#partner-enquiry" className="text-link">
                Start a conversation <ArrowUpRight size={17} />
              </a>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section off-white" id="partner-enquiry">
        <div className="container editorial-grid">
          <div>
            <Eyebrow>Partner with Afrisun</Eyebrow>
            <h2>
              Let’s find
              <br />
              <em>common ground.</em>
            </h2>
            <p>
              Tell us about your organisation and the opportunity you see. Our
              team will review your enquiry.
            </p>
          </div>
          <EnquiryForm kind="partnership" />
        </div>
      </section>
      <CaseStudies />
      <FrequentlyAskedQuestions />
    </>
  );
}
