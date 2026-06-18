import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Hero.module.css";

// Animated counter hook
function useCounter(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

export default function Hero() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const radarRef   = useRef<HTMLDivElement>(null);
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const flights    = useCounter(1248, 2200, visible);
  const efficiency = useCounter(987,  2400, visible);
  const runways    = useCounter(42,   1800, visible);

  // Intersection observer to trigger counters
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Parallax + mouse tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      if (!radarRef.current || !heroLeftRef.current) return;
      const { innerWidth: W, innerHeight: H } = window;
      const nx = (e.clientX / W - 0.5) * 2;   // -1 to 1
      const ny = (e.clientY / H - 0.5) * 2;

      // Subtle tilt on radar
      radarRef.current.style.transform = `
        perspective(800px)
        rotateY(${nx * 5}deg)
        rotateX(${-ny * 4}deg)
        translateZ(0)
      `;
      // Subtle parallax on copy
      heroLeftRef.current.style.transform = `translate(${nx * -8}px, ${ny * -5}px)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Magnetic button
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onLeave = () => { btn.style.transform = ""; };
    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    return () => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Radar blip data
  const blips = [
    { top: "22%", left: "32%", delay: "0s" },
    { top: "54%", right: "18%", delay: "1s" },
    { bottom: "28%", left: "50%", delay: "2s" },
    { top: "38%", left: "62%", delay: "0.5s" },
    { bottom: "40%", left: "22%", delay: "1.5s" },
  ];

  return (
    <section
      className={styles.hero}
      ref={sectionRef}
      style={{ "--scroll-y": `${scrollY}px` } as React.CSSProperties}
    >
      {/* Background grid with parallax */}
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGradient} aria-hidden="true" />

      {/* Horizontal scan lines */}
      <div className={styles.scanLines} aria-hidden="true" />

      {/* Corner brackets (decorative) */}
      <div className={styles.cornerTL} aria-hidden="true" />
      <div className={styles.cornerTR} aria-hidden="true" />
      <div className={styles.cornerBL} aria-hidden="true" />
      <div className={styles.cornerBR} aria-hidden="true" />

      {/* ─── LEFT COPY ─── */}
      <div className={`${styles.left} ${visible ? styles.leftVisible : ""}`} ref={heroLeftRef}>

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          NEXT-GEN AIR TRAFFIC MANAGEMENT
        </div>

        <h1 className={styles.h1}>
          <span className={styles.h1Line1}>Command</span>
          <span className={styles.h1Line2}>The Sky</span>
          <span className={styles.h1Accent}>Network</span>
        </h1>

        <p className={styles.sub}>
          AI-powered flight coordination, intelligent turnaround
          optimization and real-time operational awareness —
          built for the next generation of air traffic control.
        </p>

        {/* CTA */}
        <div className={styles.actions}>
          <button
            ref={btnRef}
            className={styles.launchBtn}
            onClick={() => navigate("/simulation")}
          >
            <span className={styles.btnInner}>
              <span className={styles.btnIcon}>▶</span>
              Launch Simulator
            </span>
            <span className={styles.btnGlow} aria-hidden="true" />
          </button>

          <div className={styles.statusPill}>
            <span className={styles.statusPillDot} />
            <span>System Online</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
          <span className={styles.scrollLabel}>SCROLL</span>
        </div>
      </div>

      {/* ─── RIGHT RADAR ─── */}
      <div className={styles.right}>
        <div
          className={`${styles.radarWrap} ${visible ? styles.radarVisible : ""}`}
          ref={radarRef}
        >
          {/* Rings */}
          {[0, 16, 32, 48].map((pct, i) => (
            <div key={i} className={styles.ring}
              style={{ inset: `${pct}%`, animationDelay: `${i * 0.5}s` }} />
          ))}

          {/* Crosshairs */}
          <div className={styles.crossH} />
          <div className={styles.crossV} />

          {/* Degree markers */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <div key={deg} className={styles.degreeMark}
              style={{ transform: `rotate(${deg}deg)` }} />
          ))}

          {/* Sweep */}
          <div className={styles.sweep} />
          <div className={styles.sweepTrail} />

          {/* Blips */}
          {blips.map((b, i) => (
            <div key={i} className={styles.blip} style={b as React.CSSProperties}>
              <span className={styles.blipDot} />
              <span className={styles.blipRing} style={{ animationDelay: b.delay }} />
              <span className={styles.blipId}>F{String(i + 101).padStart(3, "0")}</span>
            </div>
          ))}

          {/* Center dot */}
          <div className={styles.radarCenter} />

          {/* Border glow ring */}
          <div className={styles.radarBorderGlow} />
        </div>

        {/* Stats below radar */}
        <div className={`${styles.stats} ${visible ? styles.statsVisible : ""}`}>
          <div className={styles.statCard}>
            <div className={styles.statBarBg}>
              <div className={styles.statBarFill} style={{ width: visible ? "78%" : "0%" }} />
            </div>
            <span className={styles.statNum}>
              {flights.toLocaleString()}
            </span>
            <span className={styles.statLabel}>Flights Active</span>
          </div>

          <div className={styles.statDivider} aria-hidden="true" />

          <div className={styles.statCard}>
            <div className={styles.statBarBg}>
              <div className={`${styles.statBarFill} ${styles.statBarGreen}`}
                style={{ width: visible ? "98.7%" : "0%" }} />
            </div>
            <span className={styles.statNum}>
              {(efficiency / 10).toFixed(1)}%
            </span>
            <span className={styles.statLabel}>Efficiency</span>
          </div>

          <div className={styles.statDivider} aria-hidden="true" />

          <div className={styles.statCard}>
            <div className={styles.statBarBg}>
              <div className={`${styles.statBarFill} ${styles.statBarAmber}`}
                style={{ width: visible ? "60%" : "0%" }} />
            </div>
            <span className={styles.statNum}>{runways}</span>
            <span className={styles.statLabel}>Runways</span>
          </div>
        </div>
      </div>
    </section>
  );
}