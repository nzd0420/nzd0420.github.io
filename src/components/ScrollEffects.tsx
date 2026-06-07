import { useEffect } from "react";

const sceneBySection: Record<string, "hero" | "people" | "night"> = {
  top: "hero",
  about: "people",
  projects: "hero",
  playground: "night",
  notes: "night",
  contact: "people"
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function ScrollEffects() {
  useEffect(() => {
    let frame = 0;

    const getTargets = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>(".hero-section, .content-section")
      );

    const updateScene = () => {
      const targets = getTargets();
      const viewportCenter = window.scrollY + window.innerHeight / 2;
      const currentTarget = targets.reduce<HTMLElement | null>((best, target) => {
        if (!best) {
          return target;
        }

        const targetCenter = target.offsetTop + target.offsetHeight / 2;
        const bestCenter = best.offsetTop + best.offsetHeight / 2;
        return Math.abs(targetCenter - viewportCenter) <
          Math.abs(bestCenter - viewportCenter)
          ? target
          : best;
      }, null);

      if (currentTarget) {
        const id = currentTarget.id || "top";
        document.documentElement.dataset.scene = sceneBySection[id] ?? "hero";
      }
    };

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight || 1;
      const coverProgress = clamp(window.scrollY / (viewport * 1.4));
      const backdropDim = 0.3 + coverProgress * 0.26;
      const backdropScale = 1.02 + coverProgress * 0.025;
      const backdropBlur = coverProgress * 5;

      document.documentElement.style.setProperty(
        "--backdrop-dim",
        backdropDim.toFixed(3)
      );
      document.documentElement.style.setProperty(
        "--backdrop-scale",
        backdropScale.toFixed(3)
      );
      document.documentElement.style.setProperty(
        "--backdrop-blur",
        `${backdropBlur.toFixed(2)}px`
      );
      updateScene();
    };

    const requestUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "is-active",
            entry.isIntersecting && entry.intersectionRatio > 0.36
          );
        });
      },
      { threshold: [0.18, 0.36, 0.58, 0.74] }
    );

    const targets = getTargets();
    targets.forEach((target) => observer.observe(target));
    document.documentElement.classList.add("motion-ready");
    document.documentElement.dataset.scene = "hero";

    update();
    const hashRestoreTimer = window.setTimeout(() => {
      const targetId = decodeURIComponent(window.location.hash.slice(1));
      const target = targetId ? document.getElementById(targetId) : null;

      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        update();
      }
    }, 60);

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
      delete document.documentElement.dataset.scene;
      window.clearTimeout(hashRestoreTimer);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return null;
}
