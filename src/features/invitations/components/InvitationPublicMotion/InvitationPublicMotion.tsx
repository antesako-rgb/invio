"use client";

import { useEffect, type ReactNode } from "react";
import { useAnimate } from "motion/react-mini";

interface InvitationPublicMotionProps {
  children: ReactNode;
}

/* ==========================================================================
   Public-only enhancement; server-rendered children stay visible by default.
========================================================================== */

export default function InvitationPublicMotion({ children }: InvitationPublicMotionProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const root = scope.current;
    if (!root || !window.IntersectionObserver) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<Element>();
    const running = new Map<Element, { cancel: () => void }>();
    const sections = root.querySelectorAll<HTMLElement>("[data-invitation-page]");

    // Do not fade out content already visible when hydration finishes.
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) seen.add(section);
    });

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (seen.has(entry.target)) continue;
        seen.add(entry.target);
        if (preference.matches || entry.target.contains(document.activeElement)) continue;

    const animation = animate(
  entry.target as HTMLElement,
  {
    opacity: [0, 1],
    transform: ["translateY(32px)", "translateY(0px)"],
  },
  {
    duration: .75,
    ease: [.22, 1, .36, 1],
  }
);
        running.set(entry.target, animation);
        void animation.then(() => {
          // Restore the original CSS, including the absence of a transform.
          animation.cancel();
          running.delete(entry.target);
        });
      }
    }, { threshold: 0 });

    sections.forEach(section => observer.observe(section));

    function reduceMotion() {
      if (!preference.matches) return;
      running.forEach(animation => animation.cancel());
      running.clear();
    }

    function revealFocusedSection(event: FocusEvent) {
      if (!(event.target instanceof Element)) return;
      const section = event.target.closest("[data-invitation-page]");
      if (!section) return;
      seen.add(section);
      observer.unobserve(section);
      running.get(section)?.cancel();
      running.delete(section);
    }

    preference.addEventListener("change", reduceMotion);
    root.addEventListener("focusin", revealFocusedSection);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", reduceMotion);
      root.removeEventListener("focusin", revealFocusedSection);
      running.forEach(animation => animation.cancel());
    };
  }, [scope, animate]);

  return <div ref={scope}>{children}</div>;
}
