import { Link } from "react-router-dom";

function AuthCard({
  title,
  subtitle,
  fields,
  values,
  errors,
  loading,
  submitLabel,
  onChange,
  onSubmit,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  serverError,
}) {
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-orbit auth-orbit-large" />
        <div className="auth-orbit auth-orbit-small" />
        <div className="hero-badge">AI Decision Layer</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <form className="auth-card glass-panel" onSubmit={onSubmit}>
        <div>
          <p className="eyebrow">Secure Access</p>
          <h2>{title}</h2>
        </div>

        {fields.map((field) => (
          <label key={field.name} className="field-group">
            <span>{field.label}</span>
            <input
              type={field.type}
              name={field.name}
              value={values[field.name]}
              onChange={onChange}
              placeholder={field.placeholder}
              className={errors[field.name] ? "input-error" : ""}
            />
            {errors[field.name] ? <small>{errors[field.name]}</small> : null}
          </label>
        ))}

        {serverError ? <div className="form-error">{serverError}</div> : null}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Processing..." : submitLabel}
        </button>

        <p className="auth-footer">
          {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
        </p>
      </form>
    </div>
  );
}

export default AuthCard;
