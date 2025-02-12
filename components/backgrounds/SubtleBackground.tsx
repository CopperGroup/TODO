export default function SubtleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 800 800"
        opacity="0.05"
      >
        <defs>
          <linearGradient id="coppergroup" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(102, 46, 0, 1)" />
            <stop offset="25%" stopColor="rgba(212, 120, 0, 0.9)" />
            <stop offset="50%" stopColor="rgba(255, 179, 102, 0.7)" />
            <stop offset="75%" stopColor="rgba(212, 120, 0, 0.9)" />
            <stop offset="100%" stopColor="rgba(102, 46, 0, 1)" />
          </linearGradient>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
          </filter>
        </defs>
        <g filter="url(#blur)">
          <circle cx="400" cy="400" r="300" fill="url(#coppergroup)" />
        </g>
      </svg>
    </div>
  )
}

