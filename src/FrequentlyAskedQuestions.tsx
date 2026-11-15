import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowUpRight } from "lucide-react";
import { Eyebrow, Markdown } from "./components";
import { useApi } from "./lib";
import { detailsOf } from "../shared/enhancements";
import type { Content } from "../shared/schemas";
const startingAnswers = [
  {
    title: "How do Afrisun’s flexible payment options work?",
    group: "Payment Terms",
    body: "Commercial payment arrangements are discussed individually, subject to agreement and eligibility. Contact Afrisun to confirm the options available for your organisation. No standard credit facility, approval or repayment term is promised on this website.",
  },
  {
    title: "Do payment options change costs or minimum order quantities?",
    group: "Payment Terms",
    body: "Product pricing, quantities and settlement arrangements must be confirmed in a written commercial agreement or quotation. Please discuss your requirements with our team before making a commitment.",
  },
  {
    title: "What information should a prospective retail partner provide?",
    group: "Partnership Criteria",
    body: "Share your organisation name, country, product interests and supply requirements through our partnership form. The team will review the enquiry and discuss the next steps. Submitting a form does not guarantee acceptance.",
  },
  {
    title: "How can manufacturers and distributors connect with Afrisun?",
    group: "Partnership Criteria",
    body: "We welcome enquiries from reputable renewable energy manufacturers and distributors. Tell us about your organisation and products so we can discuss sourcing and supply-chain opportunities. Specific product claims and affiliations are published only after verification.",
  },
  {
    title: "Which regions do you supply, and how long does onboarding take?",
    group: "Partnership Criteria",
    body: "Afrisun’s headquarters is in Sandton, South Africa. Our footprint map distinguishes approved presence from expansion plans. Delivery coverage, lead times and onboarding steps are confirmed individually; proposed markets are not a promise of current supply.",
  },
];
export function FrequentlyAskedQuestions() {
  const { data } = useApi<{ items: Content[] }>(
    "/api/content?kind=faq&limit=100",
    {
      items: [],
    },
  );
  const [filter, setFilter] = useState("All Questions");
  const approved = data.items.filter(
    (x) => x.status === "published" && x.verified && !x.demo,
  );
  const faqs = approved.length
    ? approved.map((x) => ({
        title: x.title,
        body: x.body,
        group: detailsOf(x).faq?.group || "Partnership Criteria",
      }))
    : startingAnswers;
  return (
    <section className="section faq-section">
      <div className="container faq-layout">
        <div>
          <Eyebrow>Frequently asked questions</Eyebrow>
          <h2>
            Clear answers.
            <br />
            <em>Better connections.</em>
          </h2>
          <p>
            Payment arrangements, supply relationships and the next steps toward
            a partnership.
          </p>
          <Link className="text-link" to="/contact">
            Speak with our Sandton team <ArrowUpRight size={17} />
          </Link>
        </div>
        <div>
          <div
            className="region-filters"
            role="group"
            aria-label="FAQ categories"
          >
            {["All Questions", "Payment Terms", "Partnership Criteria"].map(
              (category) => (
                <button
                  key={category}
                  aria-pressed={filter === category}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ),
            )}
          </div>
          <div className="faq-list">
            {faqs
              .filter((x) => filter === "All Questions" || x.group === filter)
              .map((faq) => (
                <details key={faq.title}>
                  <summary>
                    <span>
                      <small>{faq.group}</small>
                      {faq.title}
                    </span>
                    <Plus size={20} />
                  </summary>
                  <Markdown>{faq.body}</Markdown>
                </details>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
