import { useEffect, useRef, useState } from "react";
import type { FlightSummary } from "../types";
import styles from "./Summary.module.css";

interface Props { summaryData: FlightSummary[]; }

function turnaroundMinutes(raw: string | undefined): number {
  return raw ? parseFloat(raw) : 0;
}

const MAX_MIN = 60;

function Summary({ summaryData }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  const lastSync = new Date().toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const totalFlights = summaryData.length;

const turnaroundValues = summaryData
  .map(f => turnaroundMinutes(f.totalTurnaroundTime))
  .filter(v => v > 0);

const avgTurnaround =
  turnaroundValues.length > 0
    ? (
        turnaroundValues.reduce((a, b) => a + b, 0) /
        turnaroundValues.length
      ).toFixed(1)
    : "0";

const fastestFlight =
  summaryData.length > 0
    ? [...summaryData].sort(
        (a, b) =>
          turnaroundMinutes(a.totalTurnaroundTime) -
          turnaroundMinutes(b.totalTurnaroundTime)
      )[0]
    : null;

const efficiency =
  turnaroundValues.length > 0
    ? Math.max(
        0,
        100 - Number(avgTurnaround) * 0.8
      ).toFixed(1)
    : "0";

  return (
    <section
      ref={sectionRef}
      className={`${styles.summary} ${visible ? styles.summaryVisible : ""}`}
    >
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>POST-SIMULATION</span>
          <h2 className={styles.heading}>Turnaround Manifest</h2>
        </div>
        {summaryData.length > 0 && (
          <div className={styles.headerMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaNum}>{summaryData.length}</span>
              <span className={styles.metaLabel}>processed</span>
            </div>
            <div className={styles.metaDivider} aria-hidden="true" />
            <div className={styles.metaItem}>
              <span className={styles.metaNum}>{lastSync}</span>
              <span className={styles.metaLabel}>last sync</span>
            </div>
          </div>
        )}
      </div>

      {summaryData.length > 0 && (
  <div className={styles.kpiGrid}>
    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>Flights Processed</span>
      <span className={styles.kpiValue}>{totalFlights}</span>
    </div>

    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>Average TAT</span>
      <span className={styles.kpiValue}>
        {avgTurnaround}m
      </span>
    </div>

    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>Fastest Flight</span>
      <span className={styles.kpiValue}>
        {fastestFlight?.flightId || "--"}
      </span>
    </div>

    <div className={styles.kpiCard}>
      <span className={styles.kpiLabel}>Efficiency</span>
      <span className={styles.kpiValue}>
        {efficiency}%
      </span>
    </div>
  </div>
)}

      {summaryData.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="0.75" opacity="0.3" strokeDasharray="4 4" />
              <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="0.75" opacity="0.2" />
              <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
              <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Awaiting simulation data</p>
          <p className={styles.emptyHint}>Run the simulation to generate turnaround data</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table} aria-label="Flight turnaround summary">
            <thead>
              <tr>
                <th className={styles.th} scope="col">Flight</th>
                <th className={styles.th} scope="col">Airline</th>
                <th className={styles.th} scope="col">Touchdown</th>
                <th className={styles.th} scope="col">Gate In</th>
                <th className={styles.th} scope="col">Gate Out</th>
                <th className={styles.th} scope="col">Takeoff</th>
                <th className={`${styles.th} ${styles.thAccent}`} scope="col">Turnaround</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((flight, idx) => {
                const mins = turnaroundMinutes(flight.totalTurnaroundTime);
                const pct  = Math.min((mins / MAX_MIN) * 100, 100);
                const isFast = mins > 0 && mins < 20;
                const isSlow = mins >= 40;

                return (
                  <tr key={idx} className={`${styles.row} ${visible ? styles.rowVisible : ""}`}
                    style={{ transitionDelay: `${idx * 40 + 100}ms` }}>
                    <td className={`${styles.td} ${styles.tdFlight}`}>{flight.flightId}</td>
                    <td className={styles.td}>{flight.airline}</td>
                    <td className={styles.td}>{flight.touchdownTime  || "—"}</td>
                    <td className={styles.td}>{flight.gateDockTime   || "—"}</td>
                    <td className={styles.td}>{flight.gateUndockTime || "—"}</td>
                    <td className={styles.td}>{flight.takeoffTime    || "—"}</td>
                    <td className={`${styles.td} ${styles.tdTurnaround}`}>
                      <span className={`${styles.turnaroundVal} ${
                        isFast ? styles.tFast : isSlow ? styles.tSlow : styles.tMid
                      }`}>
                        {flight.totalTurnaroundTime || "—"}
                      </span>
                      {mins > 0 && (
                        <div className={styles.bar} aria-hidden="true">
                          <div
                            className={`${styles.barFill} ${
                              isFast ? styles.bFast : isSlow ? styles.bSlow : styles.bMid
                            }`}
                            style={{ width: visible ? `${pct}%` : "0%" }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Summary;