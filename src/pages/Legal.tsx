import { PageHero } from "../components";
import { SEO } from "../seo";
import { company } from "../../shared/content";
export default function Legal({ cookies = false }: { cookies?: boolean }) {
  return (
    <>
      <SEO title={cookies ? "Cookie Policy" : "Privacy Policy"} />
      <PageHero
        label="Your information matters"
        title={cookies ? "Cookie information." : "Privacy notice."}
        text="Prepared for Afrisun Energy’s South African operations. This notice requires company and legal review before public launch."
      />
      <article className="container legal-copy section">
        <p>Last updated: 26 November 2026</p>
        {cookies ? (
          <>
            <h2>Essential technology only</h2>
            <p>
              This static website does not use analytics, advertising,
              marketing, login or session cookies.
            </p>
            <h2>External services</h2>
            <p>
              An interactive OpenStreetMap area map loads only when you choose
              “Load area map”. Loading it shares connection information,
              including your IP address, with the provider. External links are
              subject to the destination’s privacy and cookie policies.
            </p>
            <h2>Your choices</h2>
            <p>
              You can control cookies and local storage through your browser
              settings. The public pages do not require an account.
            </p>
            <h2>Future changes</h2>
            <p>
              Non-essential analytics or marketing technologies must remain
              disabled until the appropriate consent mechanism and updated
              notice are implemented.
            </p>
          </>
        ) : (
          <>
            <h2>Who is responsible</h2>
            <p>
              {company.name}, registration {company.registration}, is
              responsible for information submitted through this website. Our
              office is at {company.address}.
            </p>
            <h2>Information we collect</h2>
            <p>
              The website does not transmit or store form entries. Selecting
              “Prepare Email” opens your email application with the details you
              entered. Afrisun receives those details only if you review and
              send that email. Your email provider processes the message under
              its own terms. Please do not include identity documents, payment
              information, health information or other sensitive personal
              information.
            </p>
            <h2>Optional newsletter updates</h2>
            <p>
              The updates section prepares an email request in your email
              application. You are not subscribed unless Afrisun receives and
              separately confirms your request. The website keeps no mailing
              list.
            </p>
            <h2>Why we use it</h2>
            <p>
              We use enquiry details to respond to your request, discuss
              potential commercial relationships and manage follow-up. We do not
              use your enquiry as consent for unrelated marketing. Security
              controls use limited connection data to help prevent abuse.
            </p>
            <h2>Storage and service providers</h2>
            <p>
              The site is delivered as static files. Its hosting provider may
              process routine connection information. If you send an email,
              your email provider and Afrisun’s mail provider process that
              message. Loading the optional area map also shares connection
              information with OpenStreetMap. Afrisun should confirm provider
              locations and any cross-border safeguards before launch.
            </p>
            <h2>Retention and protection</h2>
            <p>
              The static website does not retain submitted details. Afrisun is
              responsible for protecting and deleting messages it receives
              under its approved retention schedule.
            </p>
            <h2>Your rights and requests</h2>
            <p>
              You may request access, correction or deletion of your
              information, object to applicable processing or raise a concern by
              contacting {company.emails.map((email, index) => (
                <span key={email}>
                  {index > 0 && ", "}
                  <a href={`mailto:${email}`}>{email}</a>
                </span>
              ))}
              . We may need to verify your identity before acting on a request.
              You may also contact South Africa’s Information Regulator at{" "}
              <a
                href="https://inforegulator.org.za/"
                target="_blank"
                rel="noreferrer"
              >
                inforegulator.org.za
              </a>
              .
            </p>
            <h2>Before public launch</h2>
            <p>
              The company must confirm its Information Officer, processing
              grounds, retention periods, service providers, incident response
              procedure and rights-request process. This draft does not
              constitute legal advice or a claim of POPIA compliance.
            </p>
          </>
        )}
        <h2>Contact</h2>
        <p>
          {company.emails.map((email) => (
            <span key={email}>
              <a href={`mailto:${email}`}>{email}</a>
              <br />
            </span>
          ))}
          <a href="tel:+27635483486">{company.phone}</a>
        </p>
      </article>
    </>
  );
}
