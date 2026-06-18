import { useState, useEffect, useRef } from "react";
import { addFlight } from "../services/api";
import type { Flight } from "../types";
import styles from "./FlightForm.module.css";

interface Props {
  onFlightAdded?: () => void;
}

function FlightForm({ onFlightAdded }: Props) {
  const [flight, setFlight] = useState<Partial<Flight>>({
    flightId: "", airline: "", arrivalTime: "",
    priority: "normal" as any, status: "scheduled" as any,
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sectionRef = useRef<HTMLFormElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFlight(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!flight.flightId)   errs.flightId   = "Flight ID is required";
    if (!flight.airline)    errs.airline    = "Airline is required";
    if (!flight.arrivalTime) errs.arrivalTime = "Landing slot is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setSubmitting(true);
      await addFlight({
        flightId: flight.flightId!,
        airline: flight.airline!,
        priority: flight.priority!,
        scheduledLanding: new Date(flight.arrivalTime!).toISOString(),
      } as any);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
      setFlight({ flightId: "", airline: "", arrivalTime: "", priority: "normal" as any, status: "scheduled" as any });
      onFlightAdded?.();
    } catch {
      setErrors({ flightId: "Server error — please try again" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={sectionRef}
      className={`${styles.form} ${visible ? styles.formVisible : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.glowOrb} aria-hidden="true" />

      <div className={styles.formHeader}>
        <span className={styles.eyebrow}>FLIGHT INTAKE</span>
        <h2 className={styles.formTitle}>Register Flight</h2>
      </div>

      <div className={styles.fieldsGrid}>
        {/* Flight ID */}
        <div className={`${styles.field} ${errors.flightId ? styles.fieldError : ""}`}>
          <label htmlFor="flightId" className={styles.fieldLabel}>
            <span className={styles.labelLine} aria-hidden="true" />
            Flight ID
          </label>
          <input
            id="flightId" name="flightId" type="text"
            value={flight.flightId || ""} onChange={handleChange}
            placeholder="AI-302" autoComplete="off" spellCheck={false}
            aria-invalid={!!errors.flightId}
          />
          {errors.flightId && <p className={styles.error} role="alert">{errors.flightId}</p>}
        </div>

        {/* Airline */}
        <div className={`${styles.field} ${errors.airline ? styles.fieldError : ""}`}>
          <label htmlFor="airline" className={styles.fieldLabel}>
            <span className={styles.labelLine} aria-hidden="true" />
            Airline
          </label>
          <input
            id="airline" name="airline" type="text"
            value={flight.airline || ""} onChange={handleChange}
            placeholder="Air India" autoComplete="off" spellCheck={false}
            aria-invalid={!!errors.airline}
          />
          {errors.airline && <p className={styles.error} role="alert">{errors.airline}</p>}
        </div>

        {/* Arrival time */}
        <div className={`${styles.field} ${errors.arrivalTime ? styles.fieldError : ""}`}>
          <label htmlFor="arrivalTime" className={styles.fieldLabel}>
            <span className={styles.labelLine} aria-hidden="true" />
            Landing Slot
          </label>
          <input
            id="arrivalTime" name="arrivalTime" type="datetime-local"
            value={flight.arrivalTime || ""} onChange={handleChange}
            aria-invalid={!!errors.arrivalTime}
          />
          {errors.arrivalTime && <p className={styles.error} role="alert">{errors.arrivalTime}</p>}
        </div>

        {/* Priority */}
        <div className={styles.field}>
          <label htmlFor="priority" className={styles.fieldLabel}>
            <span className={styles.labelLine} aria-hidden="true" />
            Priority
          </label>
          <div className={styles.selectWrap}>
            <select id="priority" name="priority" value={(flight.priority as string) || "normal"} onChange={handleChange}>
              <option value="normal">Normal</option>
              <option value="vip">VIP</option>
              <option value="emergency">Emergency</option>
            </select>
            <span className={styles.selectChevron} aria-hidden="true">
              <svg viewBox="0 0 12 8" fill="none" width="10" height="7">
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting} className={submitted ? styles.btnSuccess : ""} aria-live="polite">
          <span className={styles.btnContent}>
            {submitted ? (
              <><span className={styles.btnCheckIcon}>✓</span> Flight Registered</>
            ) : isSubmitting ? (
              <><span className={styles.spinner} aria-hidden="true" /> Registering...</>
            ) : (
              <><span className={styles.btnPlusIcon} aria-hidden="true">+</span> Register Flight</>
            )}
          </span>
          <span className={styles.btnShimmer} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

export default FlightForm;