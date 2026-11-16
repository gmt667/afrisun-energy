import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollExperience() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("scroll-entered");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    const elements = document.querySelectorAll(
      "main .section-heading, main .intro-grid > *, main .supply-step, main .impact-photo, main .alignment-grid > *, main .africa-layout, main .three-grid > *, main .category-gallery > *, main .faq-section h2",
    );
    elements.forEach((element, index) => {
      (element as HTMLElement).style.setProperty(
        "--scroll-delay",
        `${(index % 3) * 85}ms`,
      );
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
