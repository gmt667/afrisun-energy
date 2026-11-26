import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import { useApi, api } from "./lib";
import { newsletterSchema } from "../shared/newsletter";
import { SEO } from "./seo";
import { PageHero } from "./components";
import { company } from "../shared/content";
export function Newsletter() {
  const { data: config } = useApi("/api/config", { newsletterEnabled: false });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const values = new FormData(e.currentTarget);
    const topics =
      values.get("topic") === "industry"
        ? ["industry"]
        : values.get("topic") === "company"
          ? ["company"]
          : ["industry", "company"];
    const parsed = newsletterSchema.safeParse({
      email: values.get("email"),
      topics,
      consent: values.get("consent") === "on",
      website: values.get("website") || "",
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((x) => x.message).join(". "));
      return;
    }
    setBusy(true);
    try {
      const response = await api<{ message: string }>(
        "/api/newsletter/subscribe",
        { method: "POST", body: JSON.stringify(parsed.data) },
      );
      setResult(response.message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
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
          <p>
            Choose the industry insights and company updates you would like to
            receive.
          </p>
        </div>
        {result ? (
          <p className="newsletter-result" role="status">
            <CheckCircle size={25} />
            {result}
          </p>
        ) : (
          <form onSubmit={submit} className="newsletter-form">
            <div
              className="newsletter-topics"
              role="group"
              aria-label="Newsletter topics"
            >
              <label>
                <input type="radio" name="topic" value="all" defaultChecked />
                All Updates
              </label>
              <label>
                <input type="radio" name="topic" value="industry" />
                Industry Insights
              </label>
              <label>
                <input type="radio" name="topic" value="company" />
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
              <button
                type="submit"
                disabled={!config.newsletterEnabled || busy}
              >
                {busy ? "Requesting…" : "Subscribe"}
                <ArrowUpRight size={18} />
              </button>
            </div>
            <label className="consent">
              <input type="checkbox" name="consent" />
              <span>
                I agree to receive the updates selected above and have read the{" "}
                <Link to="/privacy">privacy notice</Link>. Confirm by email;
                unsubscribe at any time.
              </span>
            </label>
            <div className="honeypot" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            {!config.newsletterEnabled && (
              <p className="newsletter-note">
                Signup is awaiting activation.{" "}
                <a href={`mailto:${company.email}`}>Contact Afrisun</a> to
                discuss updates.
              </p>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
export function NewsletterAction() {
  const { action } = useParams();
  const [params] = useSearchParams();
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <SEO title="Newsletter preferences" noindex />
      <PageHero
        label="Afrisun updates"
        title={
          action === "unsubscribe"
            ? "Manage your connection."
            : "Confirm your connection."
        }
        text={
          action === "unsubscribe"
            ? "Choose below to unsubscribe from Afrisun email updates."
            : "Please confirm that you requested the selected Afrisun email updates."
        }
      />
      <div className="container section newsletter-confirm">
        {result ? (
          <p role="status">{result}</p>
        ) : (
          <>
            <button
              className="button button-navy"
              disabled={
                busy ||
                !["confirm", "unsubscribe"].includes(action || "") ||
                !params.get("token")
              }
              onClick={async () => {
                setBusy(true);
                try {
                  const response = await api<{ message: string }>(
                    `/api/newsletter/${action}`,
                    {
                      method: "POST",
                      body: JSON.stringify({ token: params.get("token") }),
                    },
                  );
                  setResult(response.message);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy
                ? "Updating…"
                : action === "unsubscribe"
                  ? "Unsubscribe"
                  : "Confirm Subscription"}
            </button>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
