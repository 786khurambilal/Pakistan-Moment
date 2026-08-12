// Arvo logo — uses the actual brand SVG file (transparent background).
export default function ArvoLogo({ className = '', width = 120 }) {
  return (
    <a
      href="https://www.arvo.com.pk"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center ${className}`}
      aria-label="Arvo EdTech"
    >
      <img
        src="/branding/logo.svg"
        alt="Arvo"
        width={width}
        style={{ height: 'auto' }}
      />
    </a>
  );
}
