import { useState, useRef, useEffect } from "react";
import { startSim } from "../services/api";
import type { LogEvent } from "../types";
import styles from "./Controls.module.css";
import io, { Socket } from "socket.io-client";

interface Props {
  setLogs: React.Dispatch<React.SetStateAction<LogEvent[]>>;
  onStart?: () => void;
  onStop?: () => void;
  onSimulationComplete?: () => void;
}

let socket: Socket | null = null;

function Controls({ setLogs, onStart, onStop, onSimulationComplete }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (isRunning) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleStart = async () => {
    if (!socket) {
      const newSocket = io(import.meta.env.VITE_API_URL);
      socket = newSocket;

      newSocket.on("connect", async () => {
        setLogs(prev => [...prev, { event: "Connected to server", timestamp: new Date().toISOString() }]);
        try {
                await startSim(newSocket.id!);

      setLogs(prev => [
        ...prev,
        {
          event: "Simulation Started",
          timestamp: new Date().toISOString()
        }
      ]);

          setIsRunning(true);
          setIsLaunched(true);   

onStart?.();
        } catch {
          setLogs(prev => [...prev, { event: "Failed to start simulation", timestamp: new Date().toISOString() }]);
        }
      });

      newSocket.on("simulationComplete", () => {
        setLogs(prev => [...prev, { event: "Simulation completed successfully", timestamp: new Date().toISOString() }]);
        setIsRunning(false);
      setIsLaunched(false);
        onSimulationComplete?.();
      });
      newSocket.on("simulationStopped", () => {
        setLogs(prev => [...prev, { event: "Simulation stopped", timestamp: new Date().toISOString() }]);
        setIsRunning(false);
      setIsLaunched(false);
      });
      newSocket.on("simulationError", (data) => {
        setLogs(prev => [...prev, { event: `Simulation error: ${data.error}`, timestamp: new Date().toISOString() }]);
        setIsRunning(false);
        setIsLaunched(false);
      });

      const flightEvents: Record<string, (d: any) => string> = {
        clearedForLanding:  d => `${d.flightId} cleared for landing`,
        Touchdown:          d => `${d.flightId} touchdown on ${d.runway}`,
        enteredTaxiwayIn:   d => `${d.flightId} entered taxiway (inbound)`,
        gateAssigned:       d => `${d.flightId} docked at ${d.gate}`,
        gateReleased:       d => `${d.flightId} left ${d.gate}`,
        enteredTaxiwayOut:  d => `${d.flightId} entered taxiway (outbound)`,
        clearedForTakeoff:  d => `${d.flightId} cleared for takeoff on ${d.runway}`,
        takeoffroll:        d => `${d.flightId} takeoff roll on ${d.runway}`,
        flightDeparted:     d => `${d.flightId} departed`,
      };
      Object.entries(flightEvents).forEach(([event, msg]) => {
        newSocket.on(event, (data) => {
          setLogs(prev => [...prev, { event: msg(data), timestamp: data.timestamp }]);
        });
      });
    }
  };

const handleStop = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  setIsRunning(false);
  setIsLaunched(false);
  setElapsed(0);

  setLogs(prev => [
    ...prev,
    {
      event: "Simulation aborted by operator",
      timestamp: new Date().toISOString(),
    },
  ]);

  onStop?.();
};


  return (
    <section
      ref={sectionRef}
      className={`${styles.controls} ${visible ? styles.controlsVisible : ""} ${isRunning ? styles.running : ""}`}
    >
      {/* Ambient elements */}
      <div className={styles.glowOrb} aria-hidden="true" />
      <div className={`${styles.scanLine} ${isRunning ? styles.scanActive : ""}`} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Identity */}
        <div className={styles.identity}>
          <span className={styles.eyebrow}>MISSION CONTROL</span>
          <h3 className={styles.title}>Simulation Controls</h3>
          <p className={styles.subtitle}>
            AI-powered flight coordination &amp; real-time operational awareness
          </p>
        </div>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Right: status + timer + actions */}
        <div className={styles.right}>
          {/* Status row */}
          <div className={styles.statusRow}>
            <div className={`${styles.status} ${isRunning ? styles.statusActive : styles.statusIdle}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>{isRunning ? "Active" : "Standby"}</span>
            </div>
            {isRunning && (
              <div className={styles.timer}>
                <span className={styles.timerIcon} aria-hidden="true">⏱</span>
                <span className={styles.timerValue}>{formatElapsed(elapsed)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
          <button
  className={`${styles.launchBtn} ${
    isLaunched ? styles.launchBtnLaunched : ""
  }`}
  onClick={handleStart}
  disabled={isRunning}
  aria-label="Launch Simulation"
>
  <span className={styles.btnIconWrap} aria-hidden="true">
    <span className={styles.btnIconInner}>
      {isLaunched ? "✓" : "▶"}
    </span>
  </span>

  <span>
    {isLaunched ? "Launched" : "Launch"}
  </span>

  <span className={styles.btnShimmer} aria-hidden="true" />
</button>

            <button
              className={styles.abortBtn}
              onClick={handleStop}
              disabled={!isRunning}
              aria-label="Abort Mission"
            >
              <span className={styles.btnIconWrap} aria-hidden="true">
                <span className={styles.btnIconInner}>■</span>
              </span>
              <span>Abort</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Controls;