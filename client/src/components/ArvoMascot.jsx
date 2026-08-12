// Arvo mascot — uses the actual brand mascot image file.
export default function ArvoMascot({ className = '', width = 120 }) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`} aria-hidden="true">
      <img
        src="/branding/mascot.svg"
        alt=""
        width={width}
        style={{ height: 'auto' }}
      />
    </div>
  );
}
