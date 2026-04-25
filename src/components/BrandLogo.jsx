function BrandLogo({ compact = false }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`}>
      <img
        className={`brand-image ${compact ? "brand-image-compact" : ""}`}
        src="/icon.png"
        alt={compact ? "KAIROS" : "KAIROS Decision Intelligence"}
      />
    </div>
  );
}

export default BrandLogo;
