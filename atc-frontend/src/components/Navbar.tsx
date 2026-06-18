import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(timer);
    };
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });

  const navigate = useNavigate();

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`} role="banner">
      <div className={styles.container}>

        {/* Brand */}
        <div className={styles.brand} 
         onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}>
          <div className={styles.logoMark} aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" className={styles.logoSvg}>
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className={styles.logoRingOuter} />
              <circle cx="16" cy="16" r="8"  stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <circle cx="16" cy="16" r="3"  fill="currentColor" />
              <line x1="16" y1="2" x2="16" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              <line x1="16" y1="22" x2="16" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              <line x1="2" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              <line x1="22" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>SkyNet<span className={styles.brandAccent}> ATC</span></span>
            <span className={styles.brandSub}>Air Traffic Management</span>
          </div>
        </div>

        {/* Center: live clock */}
        <div className={styles.centerCluster} aria-label="System time">
          <span className={styles.clockLabel}>UTC</span>
          <span className={styles.clock}>{timeStr}</span>
        </div>

        {/* Right cluster */}
        <div className={styles.right}>
          <div className={styles.stat}>
            <span className={styles.statNum}>1248</span>
            <span className={styles.statLabel}>active</span>
          </div>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.stat}>
            <span className={`${styles.statNum} ${styles.statGreen}`}>98.7%</span>
            <span className={styles.statLabel}>efficiency</span>
          </div>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.systemStatus}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>ONLINE</span>
          </div>
        </div>

      </div>

      {/* Progress line at bottom */}
      <div className={styles.progressLine} aria-hidden="true" />
    </nav>
  );
}

export default Navbar;