import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Search,
  Menu,
  X,
  Sun,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { company, navigation, categories } from "../shared/content";
import { detailsOf } from "../shared/enhancements";
import { useApi } from "./lib";
import type { Content } from "../shared/schemas";

export function Logo() {
  return (
    <Link to="/" aria-label="Afrisun Energy home" className="logo">
      <span className="logo-mark">
        <Sun size={32} strokeWidth={1.6} />
      </span>
      <span>
        AFRISUN<span className="logo-energy">ENERGY</span>
      </span>
    </Link>
  );
}
export function Button({
  children,
  to,
  className = "",
  outline = false,
}: {
  children: ReactNode;
  to: string;
  className?: string;
  outline?: boolean;
}) {
  return (
    <Link
      className={`button ${outline ? "button-outline" : ""} ${className}`}
      to={to}
    >
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function Reveal({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      id={id}
      className={className}
      initial={false}
      whileInView={reduced ? {} : { y: [18, 0], opacity: [0.65, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: [0.2, 0.65, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`eyebrow ${light ? "light" : ""}`}>
      <span />
      {children}
    </p>
  );
}
export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setOpen(false);
    setDropdown(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDropdown(false);
        menuButton.current?.focus();
      }
      if (open && e.key === "Tab") {
        const items = ref.current?.querySelectorAll<HTMLElement>("a,button");
        const visible = Array.from(items || []).filter(
          (x) => x.offsetParent !== null,
        );
        const first = visible[0],
          last = visible.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <header
      ref={ref}
      className={`site-header ${pathname === "/" && !scrolled && !open ? "over-hero" : ""} ${scrolled ? "scrolled" : ""}`}
    >
      <div className="header-inner">
        <Logo />
        <nav
          aria-label="Main navigation"
          className={open ? "navigation is-open" : "navigation"}
        >
          {navigation.map(([name, to]) =>
            to === "/products" ? (
              <div className="nav-products" key={to}>
                <NavLink to={to}>Products</NavLink>
                <button
                  aria-expanded={dropdown}
                  aria-controls="product-menu"
                  aria-label="Product categories"
                  onClick={() => setDropdown(!dropdown)}
                >
                  <ChevronDown size={13} />
                </button>
                {dropdown && (
                  <div className="product-menu" id="product-menu">
                    {categories.map((c) => (
                      <Link key={c.slug} to={`/products?category=${c.slug}`}>
                        {c.name}
                        <ArrowUpRight size={14} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={to} to={to} end={to === "/"}>
                {name}
              </NavLink>
            ),
          )}
          <Button to="/partners" className="nav-cta">
            Partner With Us
          </Button>
        </nav>
        <Link to="/search" className="search-link" aria-label="Search website">
          <Search size={20} />
        </Link>
        <button
          ref={menuButton}
          className="menu-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            Connecting energy.
            <br />
            Creating opportunity.
          </p>
          <span>Powering Africa’s Future</span>
        </div>
        <div>
          <h3>Company</h3>
          {navigation
            .filter((x) =>
              ["/", "/about", "/sustainability", "/partners"].includes(x[1]),
            )
            .map((x) => (
              <Link to={x[1]} key={x[1]}>
                {x[0]}
              </Link>
            ))}
        </div>
        <div>
          <h3>Explore</h3>
          {navigation
            .filter((x) =>
              ["/products", "/services", "/industries", "/insights"].includes(
                x[1],
              ),
            )
            .map((x) => (
              <Link to={x[1]} key={x[1]}>
                {x[0]}
              </Link>
            ))}
        </div>
        <div className="footer-contact">
          <h3>Let’s connect</h3>
          <p>
            <MapPin size={15} />
            Sandton, South Africa
          </p>
          <a href="tel:+27635483486">
            <Phone size={15} />
            {company.phone}
          </a>
          <a href={`mailto:${company.email}`}>
            <Mail size={15} />
            {company.email}
          </a>
          <Link to="/contact">
            View office details <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © 2026 Afrisun Energy (Pty) Ltd. All rights reserved.
          <br />
          Registration Number: {company.registration}
        </span>
        <div>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
export function PageHero({
  label,
  title,
  text,
  image = false,
}: {
  label: string;
  title: string;
  text?: string;
  image?: boolean;
}) {
  return (
    <section className={`page-hero ${image ? "page-hero-image" : ""}`}>
      {image && (
        <img
          src="/images/solar-aerial.webp"
          alt="Illustrative aerial view of a solar array"
          fetchPriority="high"
        />
      )}
      <div className="container">
        <Eyebrow light={image}>{label}</Eyebrow>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    </section>
  );
}
export function PartnershipCTA() {
  return (
    <section className="partnership-cta">
      <div className="container">
        <Reveal>
          <Eyebrow light>A shared ambition</Eyebrow>
          <h2>
            Let’s power Africa’s
            <br />
            <em>future. Together.</em>
          </h2>
          <p>
            Whether you are a manufacturer, distributor, retailer or development
            partner, we would like to hear from you.
          </p>
          <div className="actions">
            <Button to="/partners">Become a Partner</Button>
            <Button to="/contact" outline>
              Contact Afrisun
            </Button>
          </div>
        </Reveal>
        <Sun className="cta-sun" strokeWidth={0.5} />
      </div>
    </section>
  );
}
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              {...(href?.startsWith("http")
                ? { rel: "noopener noreferrer", target: "_blank" }
                : {})}
            >
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
export function ContentCard({ item }: { item: Content }) {
  const article = item.kind === "article";
  return (
    <Link
      className="content-card"
      to={`/${article ? "insights" : "products"}/${item.slug}`}
    >
      <div className="content-image">
        {item.image ? (
          <img src={item.image} alt={item.imageAlt} loading="lazy" />
        ) : (
          <div className="image-placeholder">
            <Sun size={60} strokeWidth={1} />
            <span>{article ? "Afrisun Insights" : "Product information"}</span>
          </div>
        )}
        <span className="card-arrow">
          <ArrowUpRight />
        </span>
      </div>
      <p className="eyebrow">
        {article ? item.category : item.brand || "Product catalogue"}
      </p>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <small>
        {article &&
          detailsOf(item).news &&
          `${detailsOf(item).news?.source} · `}
        {article && item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("en-ZA")
          : item.availability === "available"
            ? "Available"
            : "Enquire about availability"}
      </small>
    </Link>
  );
}
export function LatestInsights() {
  const { data, error } = useApi<{ items: Content[] }>(
    "/api/content?kind=article",
    { items: [] },
  );
  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>Perspectives & possibilities</Eyebrow>
            <h2>
              Energy. Ideas. <em>Progress.</em>
            </h2>
          </div>
          <Link className="text-link" to="/insights">
            All insights <ArrowUpRight size={18} />
          </Link>
        </div>
        {error ? (
          <Notice
            title="Insights are temporarily unavailable"
            text="Please try again shortly."
          />
        ) : data.items.length ? (
          <div className="three-grid">
            {data.items.slice(0, 3).map((x) => (
              <ContentCard key={x.id} item={x} />
            ))}
          </div>
        ) : (
          <div className="editorial-empty">
            <span>THE CONVERSATION STARTS HERE</span>
            <h3>A clearer view of Africa’s energy future.</h3>
            <p>
              Our insights will explore renewable energy, product knowledge and
              the supply chains connecting opportunity. Articles will appear
              here as they are published.
            </p>
            <Link className="text-link" to="/sustainability">
              Explore our approach to energy access <ArrowUpRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
export function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="notice" role="status">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function ScrollTools() {
  const { pathname, hash } = useLocation();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = hash
        ? document.getElementById(decodeURIComponent(hash.slice(1)))
        : null;
      if (target) target.scrollIntoView({ behavior: "instant" });
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? window.scrollY / height : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <div
        className="reading-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      {progress > 0.15 && (
        <button
          className="back-top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            })
          }
          aria-label="Back to top"
        >
          <ArrowUp size={19} />
        </button>
      )}
    </>
  );
}
export function ScrollHint() {
  return (
    <a className="scroll-hint" href="#introduction">
      <span>SCROLL TO EXPLORE</span>
      <ArrowDown size={17} />
    </a>
  );
}
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="container section">
        <h1>Something went wrong.</h1>
        <p>Please reload the page or contact Afrisun directly.</p>
        <a className="button" href="/">
          Return home
        </a>
      </main>
    ) : (
      this.props.children
    );
  }
}
