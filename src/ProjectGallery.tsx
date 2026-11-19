import { Eyebrow } from "./components";

const photos = [
  [
    "school-solar",
    "Solar power for learning",
    "Solar panels installed on a school block beneath a mountain landscape",
  ],
  [
    "classroom-lighting",
    "Learning beyond daylight",
    "Students working at desks in a classroom with electric lighting",
  ],
  [
    "school-inverter",
    "The equipment behind access",
    "Wall-mounted inverter and protection equipment above a battery cabinet",
  ],
  [
    "three-phase-inverter",
    "Installation in progress",
    "Two technicians working on a three-phase inverter installation",
  ],
  [
    "school-daytime",
    "Community spaces",
    "Solar panels on a community building with a shaded entrance",
  ],
  [
    "thuchira-aerial",
    "Thuchira from above",
    "Aerial view of Thuchira from the supplied project archive",
  ],
  [
    "mombezi-aerial",
    "Mombezi from above",
    "Aerial view of Mombezi from the supplied project archive",
  ],
  [
    "rice-milling",
    "Energy for enterprise",
    "Rice milling installation from the supplied project archive",
  ],
  [
    "health-centre",
    "Power for essential services",
    "Kapiri Health Centre installation from the supplied project archive",
  ],
  [
    "water-pump",
    "Supporting water access",
    "Phata water pump from the supplied project archive",
  ],
];

export function ProjectGallery() {
  return (
    <section
      className="section project-gallery"
      aria-labelledby="project-gallery-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <Eyebrow>Energy in everyday life</Eyebrow>
            <h2 id="project-gallery-title">
              A closer look at <em>possibility.</em>
            </h2>
          </div>
          <p>
            From school buildings to essential equipment. Explore the
            photographs shared with Afrisun.
          </p>
        </div>
        <div className="project-photo-grid">
          {photos.map(([file, title, alt]) => (
            <figure key={file}>
              <a
                href={`/images/projects/${file}.webp`}
                target="_blank"
                rel="noreferrer"
                aria-label={`View full photograph: ${title}`}
              >
                <img
                  src={`/images/projects/${file}.webp`}
                  alt={alt}
                  loading="lazy"
                  width="900"
                  height="600"
                />
              </a>
              <figcaption>{title}</figcaption>
            </figure>
          ))}
        </div>
        <p className="fine-print">
          Photographs supplied for this website. Installation and location
          images do not indicate current product availability.
        </p>
        <figure className="regional-photo">
          <img
            src="/images/projects/cape-town.webp"
            alt="Mountain cliffs and the Atlantic coastline in Cape Town, South Africa"
            loading="lazy"
            width="1400"
            height="600"
          />
          <figcaption>
            Rooted in South Africa. Looking across the continent.{" "}
            <a
              href="https://www.pexels.com/photo/high-angle-shot-of-mountain-2327372/"
              target="_blank"
              rel="noreferrer"
            >
              Cape Town landscape · Pexels
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
