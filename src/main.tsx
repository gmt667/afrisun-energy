import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { MotionConfig } from "motion/react";
import {
  Header,
  Footer,
  ScrollTools,
  ErrorBoundary,
  PageHero,
  Button,
} from "./components";
import { SEO } from "./seo";
import "./styles.css";
import "./enhancements.css";
import "./brand-updates.css";
import { Newsletter, NewsletterAction } from "./Newsletter";
import { ScrollExperience } from "./ScrollExperience";
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() =>
  import("./pages/CompanyPages").then((m) => ({ default: m.About })),
);
const Services = lazy(() =>
  import("./pages/CompanyPages").then((m) => ({ default: m.Services })),
);
const Industries = lazy(() =>
  import("./pages/CompanyPages").then((m) => ({ default: m.Industries })),
);
const Sustainability = lazy(() =>
  import("./pages/CompanyPages").then((m) => ({ default: m.Sustainability })),
);
const Partners = lazy(() =>
  import("./pages/CompanyPages").then((m) => ({ default: m.Partners })),
);
const Catalogue = lazy(() =>
  import("./pages/Catalogue").then((m) => ({ default: m.Catalogue })),
);
const Detail = lazy(() =>
  import("./pages/Catalogue").then((m) => ({ default: m.Detail })),
);
const SiteSearch = lazy(() =>
  import("./pages/Catalogue").then((m) => ({ default: m.SiteSearch })),
);
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const Admin = lazy(() => import("./pages/Admin"));
const Story = lazy(() => import("./pages/Story"));
function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" key={pathname}>
        <Outlet />
      </main>
      <Newsletter />
      <Footer />
      <ScrollTools />
      <ScrollExperience />
    </>
  );
}
function NotFound() {
  return (
    <>
      <SEO title="Page not found" noindex />
      <PageHero
        label="404 — Off the beaten path"
        title="Let’s reconnect you."
        text="The page you’re looking for may have moved or doesn’t exist."
      />
      <div className="container section">
        <Button to="/" className="button-navy">
          Back to Home
        </Button>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="route-loading" role="status">
                <span />
                Loading Afrisun…
              </div>
            }
          >
            <Routes>
              <Route path="/admin/*" element={<Admin />} />
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="products" element={<Catalogue />} />
                <Route path="products/:slug" element={<Detail />} />
                <Route path="services" element={<Services />} />
                <Route path="industries" element={<Industries />} />
                <Route path="sustainability" element={<Sustainability />} />
                <Route path="insights" element={<Catalogue articles />} />
                <Route path="insights/:slug" element={<Detail article />} />
                <Route path="partners" element={<Partners />} />
                <Route path="stories/:slug" element={<Story />} />
                <Route
                  path="newsletter/:action"
                  element={<NewsletterAction />}
                />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<Legal />} />
                <Route path="cookies" element={<Legal cookies />} />
                <Route path="search" element={<SiteSearch />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
);
