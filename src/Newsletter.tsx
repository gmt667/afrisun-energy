import type { FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { company } from "../shared/content";

export function Newsletter() {
  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const subject = "Afrisun Energy updates";
    const body = [
      `Email address: ${values.get("email")}`,
      `Updates requested: ${values.get("topic")}`,
      "I have read the privacy notice and agree to receive these updates.",
    ].join("\n");
    window.open(
      `mailto:${company.email}?${new URLSearchParams({ subject, body })}`,
      "_self",
    );
  }

  return (
    <section
      className="newsletter-section"
      aria-labelledby="newsletter-heading"
    >
      <div className="container newsletter-layout">
        <div>
          <p className="eyebrow">Newsletter & updates</p>
          <h2 id="newsletter-heading">
            A clearer view of
            <br />
            Africa’s energy future.
          </h2>
          <p>Choose the industry insights and company updates you would like to receive.</p>
        </div>
        <form onSubmit={prepareEmail} className="newsletter-form">
          <div
            className="newsletter-topics"
            role="group"
            aria-label="Newsletter topics"
          >
            <label>
              <input type="radio" name="topic" value="All updates" defaultChecked />
              All Updates
            </label>
            <label>
              <input type="radio" name="topic" value="Industry insights" />
              Industry Insights
            </label>
            <label>
              <input type="radio" name="topic" value="Company updates" />
              Company Updates
            </label>
          </div>
          <div className="newsletter-email">
            <label>
              <span className="sr-only">Work email address</span>
              <input
                name="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                required
              />
            </label>
            <button type="submit">
              Prepare Email
              <ArrowUpRight size={18} />
            </button>
          </div>
          <label className="consent">
            <input type="checkbox" required />
            <span>
              I agree to receive the updates selected above and have read the{" "}
              <Link to="/privacy">privacy notice</Link>.
            </span>
          </label>
          <p className="newsletter-note">
            This static site opens your email app with a prepared request. Review
            and send it there to contact Afrisun.
          </p>
        </form>
      </div>
    </section>
  );
}
