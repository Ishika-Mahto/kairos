import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-glow landing-glow-left" />
      <div className="landing-glow landing-glow-right" />

      <header className="landing-header">
        <BrandLogo compact />

        <div className="header-actions">
          <Link className="text-link" to="/login">
            Login
          </Link>
          <Link className="primary-button" to="/signup">
            Get Started
          </Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI-Powered Decision Intelligence</p>
          <h1>See the cost of delay before it becomes your reality.</h1>
          <p className="hero-text">
            KAIROS helps you forecast friction, track execution patterns, and
            act with clarity using a premium predictive workspace built for
            focused operators.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to="/signup">
              Create Account
            </Link>
            <Link className="secondary-button" to="/login">
              Enter Workspace
            </Link>
          </div>
        </div>

        <div className="hero-panel glass-panel">
          <div className="hero-panel-header">
            <span className="status-dot" />
            <p>Prediction Engine Active</p>
          </div>

          <div className="hero-grid">
            <div className="metric-card">
              <span>Decision Risk</span>
              <strong>82%</strong>
            </div>
            <div className="metric-card">
              <span>Focus Recovery</span>
              <strong>+31%</strong>
            </div>
            <div className="insight-card insight-card-highlight">
              <p>Future Self Signal</p>
              <h3>You are closest to action in the first five minutes.</h3>
            </div>
            <div className="insight-card">
              <p>Pattern Detected</p>
              <h3>Night-time hesitation compounds unfinished work.</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
