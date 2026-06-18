import { useEffect, useRef, useState } from "react";
import type { Flight } from "../types";
import styles from "./Dashboard.module.css";

interface Props {
  flights: Flight[];
}

function FlightCard({ f, i, visible }: { f: Flight; i: number; visible: boolean }) {
  const priorityKey = `priority-${String(f.priority || "normal").toLowerCase()}`;
  const isEmergency = String(f.priority).toLowerCase() === "emergency";
  const isVip       = String(f.priority).toLowerCase() === "vip";

  const scheduledTime = f.scheduledLanding
    ? new Date(f.scheduledLanding).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const scheduledDate = f.scheduledLanding
    ? new Date(f.scheduledLanding).toLocaleDateString([], { month: "short", day: "numeric" })
    : null;

  return (
    <article
      className={`
        ${styles.card}
        ${isEmergency ? styles.cardEmergency : ""}
        ${isVip ? styles.cardVip : ""}
        ${visible ? styles.cardVisible : ""}
      `}
      style={{ transitionDelay: `${i * 60}ms` }}
    >
      {/* Priority accent bar */}
      <div className={`${styles.accentBar} ${styles[`${priorityKey}Accent`]}`} aria-hidden="true" />

      {/* Card head */}
      <div className={styles.cardHead}>
        <div>
          <span className={styles.flightLabel}>FLIGHT</span>
          <div className={styles.flightIdRow}>
            <span className={styles.flightIcon} aria-hidden="true">✈</span>
            <h3 className={styles.flightId}>{f.flightId}</h3>
          </div>
        </div>
        <span className={`${styles.badge} ${styles[priorityKey]}`}>
          {String(f.priority).toUpperCase()}
        </span>
      </div>

      {/* Separator */}
      <div className={styles.sep} aria-hidden="true" />

      {/* Meta */}
      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>Airline</dt>
          <dd className={styles.metaValue}>{f.airline}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>Slot</dt>
          <dd className={styles.metaValue}>
            <span className={styles.timeMain}>{scheduledTime}</span>
            {scheduledDate && <span className={styles.timeDate}>{scheduledDate}</span>}
          </dd>
        </div>
      </dl>

      {/* Bottom status */}
      <div className={styles.cardBottom}>
        <span
          className={`${styles.signal} ${isEmergency ? styles.signalRed : isVip ? styles.signalAmber : ""}`}
          aria-hidden="true"
        />
        <span className={styles.bottomText}>TRACKING</span>
        <span className={styles.cardIndex}>#{String(i + 1).padStart(3, "0")}</span>
      </div>

      {/* Hover corner effect */}
      <div className={styles.cardCorner} aria-hidden="true" />
    </article>
  );
}

function Dashboard({ flights }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.dashboard} ${visible ? styles.dashboardVisible : ""}`}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>LIVE TRAFFIC</span>
          <h2 className={styles.title}>Flight Dashboard</h2>
        </div>
        <div className={styles.count}>
          <span className={styles.countNum}>{flights.length}</span>
          <span className={styles.countLabel}>tracked</span>
        </div>
      </div>

      {flights.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyRadar} aria-hidden="true">
            <span className={styles.emptyRadarSweep} />
          </div>
          <p className={styles.emptyTitle}>No flights in queue</p>
          <p className={styles.emptyHint}>Register a flight above to begin tracking</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {flights.map((f, i) => (
            <FlightCard key={i} f={f} i={i} visible={visible} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Dashboard;