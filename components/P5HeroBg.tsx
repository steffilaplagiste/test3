"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Hauteur du header/hero en px (sinon on déduit depuis le conteneur) */
  height?: number;
};

/**
 * Anneau de points (1024 nœuds) reliés par beginShape()
 * Dynamique de type "ressort" + petit kick aléatoire
 * Couleur du trait pilotée en RGB borné → tons orangés uniquement.
 */
export default function P5HeroBg({ height }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let p5Instance: any;
    let cancelled = false;

    const init = async () => {
      const p5mod = await import("p5");
      if (cancelled) return;
      const p5 = p5mod.default;

      const sketch = (s: any) => {
        // ---------- paramètres ----------
        const SIZE = 1024;
        const SIZ = SIZE - 1;
        const SI = SIZE - 2;
        const TENSION = 0.5;
        const SYMPATHY = 0.25;

        // couleurs (RGB borné pour rester orange)
        const R_MIN = 220, R_MAX = 255;
        const G_MIN = 90,  G_MAX = 170;
        const B_MIN = 0,   B_MAX = 60;
        let r = 240, g = 120, b = 20;
        let vr = 0, vg = 0, vb = 0;

        // états
        const px = new Array<number>(SIZE);
        const py = new Array<number>(SIZE);
        const vx = new Array<number>(SIZE).fill(0);
        const vy = new Array<number>(SIZE).fill(0);
        const ax = new Array<number>(SIZE).fill(0);
        const ay = new Array<number>(SIZE).fill(0);

        const buildRing = () => {
          const hw = s.width / 2;
          const hh = (height ??
            (hostRef.current?.offsetHeight
              ? hostRef.current.offsetHeight
              : 400)) / 2;

          const radius = Math.max(24, Math.min(hw, hh) * 0.98);
          for (let i = 0; i < SIZE; i++) {
            const angle = s.TAU * (i / SIZE);
            px[i] = hw + Math.cos(angle) * radius;
            py[i] = hh + Math.sin(angle) * radius;
          }
        };

        s.setup = () => {
          const h =
            height ??
            (hostRef.current?.offsetHeight
              ? hostRef.current.offsetHeight
              : 400);
          s.createCanvas(s.windowWidth, h);
          s.noFill();
          s.strokeWeight(0.5);
          s.pixelDensity(1); // perf
          try {
            // respecte prefers-reduced-motion
            s.frameRate(
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? 24
                : 60
            );
          } catch {}
          buildRing();
        };

        s.windowResized = () => {
          const h =
            height ??
            (hostRef.current?.offsetHeight
              ? hostRef.current.offsetHeight
              : 400);
          s.resizeCanvas(s.windowWidth, h);
          buildRing();
        };

        s.draw = () => {
          // Canvas transparent derrière le contenu
          s.background(255, 255, 255, 20)

          // ----- accélérations (ressort + "sympathie" des vitesses) -----
          for (let i = 1; i < SIZ; i++) {
            ax[i] =
              (px[i - 1] + px[i + 1] - 2 * px[i]) * TENSION +
              (vx[i - 1] + vx[i + 1] - 2 * vx[i]) * SYMPATHY;
            ay[i] =
              (py[i - 1] + py[i + 1] - 2 * py[i]) * TENSION +
              (vy[i - 1] + vy[i + 1] - 2 * vy[i]) * SYMPATHY;
          }
          ax[0] =
            (px[SIZ] + px[1] - 2 * px[0]) * TENSION +
            (vx[SIZ] + vx[1] - 2 * vx[0]) * SYMPATHY;
          ay[0] =
            (py[SIZ] + py[1] - 2 * py[0]) * TENSION +
            (vy[SIZ] + vy[1] - 2 * vy[0]) * SYMPATHY;
          ax[SIZ] =
            (px[SI] + px[0] - 2 * px[SIZ]) * TENSION +
            (vx[SI] + vx[0] - 2 * vx[SIZ]) * SYMPATHY;
          ay[SIZ] =
            (py[SI] + py[0] - 2 * py[SIZ]) * TENSION +
            (vy[SI] + vy[0] - 2 * vy[SIZ]) * SYMPATHY;

          // petit "kick" aléatoire vers le centre + bruit
          const rn = Math.floor(s.random(SIZE));
          const hw = s.width / 2;
          const hh = s.height / 2;
          ax[rn] = (hw - px[rn]) * 0.001 + s.randomGaussian() * 5;
          ay[rn] = (hh - py[rn]) * 0.001 + s.randomGaussian() * 5;

          // ----- intégration + léger damping -----
          for (let i = 0; i < SIZE; i++) {
            vx[i] += ax[i];
            vy[i] += ay[i];
            vx[i] *= 0.999;
            vy[i] *= 0.999;
            px[i] += vx[i];
            py[i] += vy[i];
            px[i] = s.constrain(px[i], 0, s.width);
            py[i] = s.constrain(py[i], 0, s.height);
          }

          // ----- marche aléatoire bornée en orange -----
          vr = vr * 0.995 + s.randomGaussian() * 0.04;
          vg = vg * 0.995 + s.randomGaussian() * 0.04;
          vb = vb * 0.995 + s.randomGaussian() * 0.04;

          r += vr;
          g += vg;
          b += vb;

          if ((r < R_MIN && vr < 0) || (r > R_MAX && vr > 0)) vr = -vr;
          if ((g < G_MIN && vg < 0) || (g > G_MAX && vg > 0)) vg = -vg;
          if ((b < B_MIN && vb < 0) || (b > B_MAX && vb > 0)) vb = -vb;

          r = s.constrain(r, R_MIN, R_MAX);
          g = s.constrain(g, G_MIN, G_MAX);
          b = s.constrain(b, B_MIN, B_MAX);

          s.stroke(r, g, b, 180); // alpha léger pour adoucir

          // ----- dessin du contour -----
          s.beginShape();
          for (let i = 0; i < SIZE; i++) {
            s.vertex(px[i], py[i]);
          }
          s.endShape();
        };
      };

      p5Instance = new p5(sketch, hostRef.current!);
    };

    init();

    return () => {
      cancelled = true;
      try {
        p5Instance?.remove();
      } catch {}
    };
  }, [height]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}

