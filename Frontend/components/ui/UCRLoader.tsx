"use client";

interface UCRLoaderProps {
  message?: string;
}

export function UCRLoader({ message = "Cargando..." }: UCRLoaderProps) {
  return (
    <>
      <style>{`
        @keyframes ucr-slide {
          0%   { left: 0%;   transform: translateY(-50%) translateX(0%); }
          50%  { left: 100%; transform: translateY(-50%) translateX(-100%); }
          100% { left: 0%;   transform: translateY(-50%) translateX(0%); }
        }

        @keyframes ucr-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ucr-loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          animation: ucr-fade-in 0.3s ease both;
        }

        .ucr-loader-track {
          position: relative;
          width: 380px;
          height: 120px;
          display: flex;
          align-items: center;
        }

        .ucr-loader-line {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 8px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #00C0F3 0%, #02477B 100%);
          box-shadow: 0 2px 16px rgba(0, 192, 243, 0.35);
        }

        .ucr-loader-shield {
          position: absolute;
          top: 50%;
          width: 120px;
          height: 120px;
          animation: ucr-slide 2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.22));
          pointer-events: none;
        }

        .ucr-loader-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #02477B;
          text-transform: uppercase;
          opacity: 0.75;
          margin-top: 8px;
        }
      `}</style>

      <div className="ucr-loader-wrapper" role="status" aria-label={message}>
        <div className="ucr-loader-track">
          <div className="ucr-loader-line" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/escudo-ucr.png"
            alt="Escudo UCR"
            className="ucr-loader-shield"
          />
        </div>
        <p className="ucr-loader-label">{message}</p>
      </div>
    </>
  );
}
