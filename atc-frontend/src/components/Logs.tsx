import { useEffect, useRef, useState } from "react";
import type { LogEvent } from "../types";
import styles from "./Logs.module.css";

interface Props { logs: LogEvent[]; }

function getEventType(event: string): string {
  const e = event.toLowerCase();
  if (e.includes("error") || e.includes("failed"))                                    return "error";
  if (e.includes("emergency"))                                                         return "emergency";
  if (e.includes("departed") || e.includes("takeoff") || e.includes("takeoffroll"))   return "depart";
  if (e.includes("cleared for landing") || e.includes("touchdown"))                   return "land";
  if (e.includes("cleared for takeoff"))                                               return "depart";
  if (e.includes("gate") || e.includes("taxiway") || e.includes("docked"))            return "ground";
  if (e.includes("started") || e.includes("connected") || e.includes("complete"))     return "system";
  if (e.includes("stopped") || e.includes("abort") || e.includes("signal"))           return "warn";
  return "default";
}

const TYPE_META: Record<string, { tag: string; label: string }> = {
  error:     { tag: "ERR", label: "Error" },
  emergency: { tag: "SOS", label: "Emergency" },
  depart:    { tag: "DEP", label: "Departure" },
  land:      { tag: "ARR", label: "Arrival" },
  ground:    { tag: "GND", label: "Ground Ops" },
  system:    { tag: "SYS", label: "System" },
  warn:      { tag: "WRN", label: "Warning" },
  default:   { tag: "EVT", label: "Event" },
};

function Logs({ logs }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const isLive = logs.length > 0;

  return (
    <section ref={sectionRef} className={`${styles.logs} ${visible ? styles.logsVisible : ""}`}>
      {/* Terminal header bar */}
      <div className={styles.termBar}>
        <div className={styles.termDots} aria-hidden="true">
          <span className={styles.termDot} style={{ background: "#ef4444" }} />
          <span className={styles.termDot} style={{ background: "#f59e0b" }} />
          <span className={styles.termDot} style={{ background: "#10b981" }} />
        </div>
        <div className={styles.termTitle}>
          <span className={styles.eyebrow}>TELEMETRY</span>
          <h2 className={styles.title}>Event Stream</h2>
        </div>
        <div className={styles.termRight}>
          {logs.length > 0 && (
            <span className={styles.countBadge}>{logs.length} events</span>
          )}
          <span className={`${styles.liveIndicator} ${isLive ? styles.liveActive : ""}`}>
            <span className={styles.liveDot} aria-hidden="true" />
            LIVE
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.termDivider} aria-hidden="true" />

      {/* Stream */}
      <div className={styles.panel} ref={scrollRef}>
        {logs.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyPrompt} aria-hidden="true">$</span>
            <span>Awaiting signal...</span>
            <span className={styles.cursor} aria-hidden="true" />
          </div>
        ) : (
          <ul className={styles.list} aria-label="Event log">
            {logs.map((log, i) => {
              const type = getEventType(log.event);
              const { tag } = TYPE_META[type];
              const isLatest = i === logs.length - 1;

              return (
                <li
                  key={i}
                  className={`${styles.item} ${styles[`type-${type}`]} ${isLatest ? styles.itemLatest : ""}`}
                >
                  <span className={styles.lineNum}>{String(i + 1).padStart(3, "0")}</span>
                  <span className={styles.prefix} aria-label={`Type: ${type}`}>{tag}</span>
                  <span className={styles.event}>{log.event}</span>
                  <span className={styles.time}>
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Logs;