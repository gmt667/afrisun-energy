# Premium enhancements

This work extends the existing React/Vite/Express architecture. Existing routes, users, sessions and content are retained. No production deployment is part of this branch.

## Content model and approval

Migration `20261114010000_content_enhancements` adds a `details` JSON field and approval identity/time columns to `Content`, plus a separate `NewsletterSubscriber` table. It does not delete, rewrite or unpublish existing records. Apply through `npm run db:migrate` after taking a database backup. No reset or destructive migration is needed.

Existing verified publications remain readable without retroactive approval metadata. New and edited structured content must pass the updated validation before publication. Editors create drafts and submit `review` records. Only administrators can verify or publish; editors cannot alter already-approved/public content. An administrator must explicitly unpublish and clear verification before an editor can revise it. This protects live content but is not a parallel revision/version-history system.

Evidence and reviewer identity/time remain private. Public API responses strip them. Approval, review submission, uploads, access changes and exports remain audited.

## Impact

Each metric records an impact area, verified value, count or MW/MWh unit, as-of date, public measurement methodology and private evidence. Optional company targets require a positive denominator and target year. Progress percentages derive from the actual value/target; supplied illustrative percentages do not imply invented target denominators. Company targets are labelled separately from Mission 300.

Animated values expose a stable screen-reader value, respect reduced motion and do not announce each animation frame. Missing metrics use editorial statements about intended impact. The supplied 42,500 / 18.4 MW / 310 / 640 values remain demonstration drafts.

## Africa map

`public/maps/africa.json` contains 56 country/territory outlines generated from Natural Earth 1:50m admin-0 GeoJSON. Mauritius and Seychelles are explicitly included because Natural Earth classifies their continent as “Seven seas” while their subregion is Eastern Africa. Statistical region filters use the source's subregions (for example Zambia is in Eastern Africa in this classification). Disputed outlines follow the source and do not imply a geopolitical position.

The map uses real boundaries projected with D3's Natural Earth projection **at preparation time**. D3 is a development dependency; no mapping library or live map service is downloaded by visitors. The committed JSON contains the source SHA-256. `shared/africa-countries.json` contains country metadata for validation and administration.

To regenerate, download `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson` into `.cache-map/countries.geojson`, then run `node scripts/prepare-map.mjs`. The original cached download is ignored. Natural Earth data is public domain: https://www.naturalearthdata.com/about/terms-of-use/ .

The company branch network was supplied and approved by the user on 15 November 2026: South Africa (Sandton headquarters), Malawi (Lilongwe and Blantyre), Zambia (Lusaka), Mozambique, Tanzania, Kenya and Nigeria. `shared/branches.json` stores this network independently of optional CMS market records. Animated connection curves originate in South Africa. Named-city coordinates are approximate city centres; other countries use projected geographic centroids and do not imply an office address. Lines represent company connections, not shipping routes. Regenerate map data with `node scripts/prepare-map.mjs` after changing the branch file.

Additional CMS market records require verification/publication. Headquarters, branches, distribution, retail and planned expansion retain distinct labels; plans remain explicitly labelled. Country controls provide touch access and SVG controls support Enter, Space and arrow-key navigation. Region filters also filter the branch connections and can legitimately show no presence.

## Branding and scroll motion

The header, footer and admin use the supplied corporate logo. Section headings, content grids, editorial imagery and the map enter with staggered scroll reveals. Connections draw as the map enters view. Content remains readable without animation; reduced-motion preferences disable scroll reveals and decorative pin/scroll-cue animation. Product pages include a responsive photographic category gallery; no stock, pricing or manufacturer partnership is fabricated.

## Stories, testimonials and videos

Case studies support structured challenge/contribution/results, approved testimonial attribution, related services and numerical claims. Claims validate percentages and value/baseline/multiplier arithmetic. Data truth, timeframe, methodology and permission still require human review. Case-study details use `/stories/:slug`, are server-rendered and appear in the sitemap only when public.

Video stories require a real MP4, English WebVTT captions, transcript, location, approved attribution and written media permission. Uploads accept MP4 up to 50 MB, VTT up to 1 MB, and existing images/PDFs up to 10 MB. MP4 headers and VTT signatures are checked; full malware scanning, codec compatibility, video transcoding and review of spoken claims remain production operator responsibilities. Videos use native controls, no autoplay and `preload="none"`. Larger videos should use a reviewed streaming/object-storage integration rather than raising memory-buffered upload limits.

The carousel starts with auto-rotation off. Users can enable it. Rotation pauses on hover, keyboard focus, video playback, hidden tabs and reduced-motion preference; choosing a story disables rotation. Native controls, captions and expandable transcripts remain available. No supplied fictional story is playable or published without actual media and approval.

The partner-network strip moves right to left and has pause/resume controls, pause on hover/focus and a static wrapped reduced-motion presentation. Only approved named partners with explicit naming permission appear. Otherwise it shows **sector roles**, not fictional companies. The visual duplicate used for looping is hidden from assistive technology.

## External news and FAQ

External references retain the existing article routes, publishing schedule, search, categories, related content and SEO. New source fields store publisher, source date, HTTPS URL and acknowledgements that the link was checked and the writing is original. URLs reject unsafe schemes, credentials, IP literals and local/reserved hosts. The server does **not fetch arbitrary URLs**, avoiding an SSRF surface. Link reachability, exact title/date and copyright review are checked by the approving editor, not certified by an automated HEAD request.

Source references link prominently to the original publication. No supplied ESI headline is auto-published. Topic filters include Solar & Storage, Finance & Policy, and Grid & Energy Access. Approved FAQs can replace the conservative starting answers. Those starting answers promise no standard trade credit, financing approval, order minimum, geographical coverage or onboarding deadline.

## Newsletter

`NEWSLETTER_ENABLED=false` is the default. Enabling requires a working database, `RESEND_API_KEY`, verified `EMAIL_FROM` and correct HTTPS `SITE_URL`. Signup stores topics and explicit consent, then sends a 24-hour confirmation link. Addresses remain pending until a single-use confirmation token is accepted. Tokens are stored only as SHA-256 hashes. Unsubscribe accepts a separate high-entropy token. No public registration response reveals whether an address was already subscribed.

Already-confirmed subscribers are not silently moved back to pending or resubscribed by someone entering their address. Topic changes currently require unsubscribing and signing up again. Provider failure leaves the address pending and returns an error, never a subscribed success. No campaigns, scheduled newsletters or bulk sending are implemented. Administrators can inspect status/topics; only confirmed addresses may be used by a separately reviewed mailing workflow. Include an unsubscribe link in every future email. Approve retention and privacy practices before activation.

## Verification

`npm run test:database` now runs both the original integration checks and the enhancement checks against the same explicit disposable `TEST_DATABASE_URL`. Email delivery is mocked in enhancement tests; no company/customer emails are sent. Browser fixtures are synthetic and confined to tests. Automated accessibility checks cover the new public sections, supplemented by keyboard, motion and overflow checks at 320, 375, 768, 1024, 1440 and 1920 pixels. See the current verification record for executed results and environmental limitations.
