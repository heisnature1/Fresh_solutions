"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Decorative 3D system: the content is intentionally present without JavaScript. */
export function HomeOrbit() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = gsap.timeline();
    timeline.from(".home-orbit-scene", { opacity: 0, scale: 0.8, rotation: -12, duration: 1.3, ease: "power3.out" })
      .from(".home-orbit-label", { opacity: 0, y: 18, stagger: 0.12, duration: 0.7 }, "-=0.6");
    gsap.to(".home-orbit-ring-one", { rotation: 360, duration: 35, repeat: -1, ease: "none" });
    gsap.to(".home-orbit-ring-two", { rotation: -360, duration: 45, repeat: -1, ease: "none" });
    gsap.to(".home-orbit-core", { y: -12, rotationY: 18, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".home-orbit-label", { y: -8, duration: 3, repeat: -1, yoyo: true, stagger: 0.5, ease: "sine.inOut" });
  }, { scope: root });

  return (
    <div ref={root} className="home-orbit" aria-hidden="true">
      <div className="home-orbit-scene">
        <div className="home-orbit-halo" />
        <div className="home-orbit-ring home-orbit-ring-one"><i /><i /></div>
        <div className="home-orbit-ring home-orbit-ring-two"><i /><i /></div>
        <div className="home-orbit-core"><div className="home-orbit-core-inner"><span>F</span><small>FRESH<br />SOLUTIONS</small></div></div>
        <div className="home-orbit-label home-orbit-label-one"><span className="home-label-dot" /> DIGITAL <b>01</b></div>
        <div className="home-orbit-label home-orbit-label-two"><span className="home-label-dot" /> ENGINEERING <b>02</b></div>
        <div className="home-orbit-label home-orbit-label-three"><span className="home-label-dot" /> REPAIRS <b>03</b></div>
      </div>
    </div>
  );
}
