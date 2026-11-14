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
        <p>Last updated: 14 November 2026</p>
        {cookies ? (
          <>
            <h2>Essential technology only</h2>
            <p>
              The public website does not use analytics, advertising or
              marketing cookies. Administrators use an essential, secure session
              cookie called <code>afrisun_session</code> to authenticate to the
              content management system. It expires after eight hours or on
              sign-out.
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
              You can block or delete cookies using browser settings. Blocking
              the essential administration cookie will prevent administrator
              sign-in. Public content does not require a cookie.
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
              If online forms are enabled, we collect the name, organisation,
              email address, phone number, enquiry details and, where relevant,
              delivery country, product interest and quantity that you supply.
              We record your acknowledgement of this notice and the time of
              submission. Please do not include identity documents, payment
              information, health information or other sensitive personal
              information.
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
              Enquiries are stored in the company’s configured database. When
              configured, a transactional email provider receives enquiry
              details to notify the company. Hosting, database and email
              providers may process data outside South Africa. Before launch,
              Afrisun must confirm its processors, hosting locations and
              appropriate safeguards under POPIA, including requirements for
              cross-border transfers.
            </p>
            <h2>Retention and protection</h2>
            <p>
              Access to enquiry records is restricted to authorised
              administrators. Afrisun must approve and implement its retention
              and deletion schedule before launch. Personal data should be kept
              only as long as necessary for the stated purpose, contractual
              obligations or applicable legal requirements.
            </p>
            <h2>Your rights and requests</h2>
            <p>
              You may request access, correction or deletion of your
              information, object to applicable processing or raise a concern by
              contacting <a href={`mailto:${company.email}`}>{company.email}</a>
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
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <br />
          <a href="tel:+27635483486">{company.phone}</a>
        </p>
      </article>
    </>
  );
}
