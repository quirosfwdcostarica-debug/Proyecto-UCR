"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavLoadingContextType {
  startLoading: () => void;
  stopLoading: () => void;
}

const NavLoadingContext = createContext<NavLoadingContextType>({
  startLoading: () => {},
  stopLoading: () => {},
});

export function useNavLoading() {
  return useContext(NavLoadingContext);
}

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track what the current pathname is so we can compare on click
  const currentPathRef = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);

  // Update the ref whenever path changes
  useEffect(() => {
    currentPathRef.current = pathname;
  }, [pathname, searchParams]);

  // When the route finishes changing, hide the loader
  useEffect(() => {
    if (isLoadingRef.current) {
      isLoadingRef.current = false;
      setLoading(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [pathname, searchParams]);

  const startLoading = useCallback(() => {
    isLoadingRef.current = true;
    setLoading(true);
    // Safety fallback: 4 seconds max
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isLoadingRef.current = false;
      setLoading(false);
    }, 4000);
  }, []);

  const stopLoading = useCallback(() => {
    isLoadingRef.current = false;
    setLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Intercept all anchor-tag clicks globally
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip: external links
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download")
      ) return;

      // Skip: hash-only anchors
      if (href.startsWith("#")) return;

      // Normalize the clicked href (strip query/hash to compare with pathname)
      let clickedPath = href.split("?")[0].split("#")[0];
      if (!clickedPath.startsWith("/")) return; // relative path edge case

      // Skip if navigating to the SAME page we're already on
      if (clickedPath === currentPathRef.current) return;

      startLoading();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startLoading]);

  return (
    <NavLoadingContext.Provider value={{ startLoading, stopLoading }}>
      {children}

      {/* Full-screen overlay */}
      <div
        aria-hidden={!loading}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(248, 250, 252, 0.92)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          transition: "opacity 0.25s ease, visibility 0.25s ease",
          opacity: loading ? 1 : 0,
          visibility: loading ? "visible" : "hidden",
          pointerEvents: loading ? "all" : "none",
        }}
      >
        <style>{`
          @keyframes ucr-nav-slide {
            0%   { left: 0%;   transform: translateY(-50%) translateX(0%); }
            50%  { left: 100%; transform: translateY(-50%) translateX(-100%); }
            100% { left: 0%;   transform: translateY(-50%) translateX(0%); }
          }
          .ucr-nav-track {
            position: relative;
            width: 320px;
            height: 88px;
          }
          .ucr-nav-line {
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 7px;
            border-radius: 9999px;
            background: linear-gradient(90deg, #00C0F3 0%, #02477B 100%);
            box-shadow: 0 2px 12px rgba(2, 71, 123, 0.25);
          }
          .ucr-nav-shield {
            position: absolute;
            top: 50%;
            width: 88px;
            height: 88px;
            animation: ucr-nav-slide 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.20));
          }
        `}</style>

        <p style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.25em",
          color: "#02477B",
          textTransform: "uppercase",
          marginBottom: "20px",
          opacity: 0.7,
        }}>
          FUNDACIÓN EXALUMNOS UCR
        </p>

        <div className="ucr-nav-track">
          <div className="ucr-nav-line" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/escudo-ucr.png"
            alt="Escudo UCR"
            className="ucr-nav-shield"
          />
        </div>

        <p style={{
          marginTop: "24px",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "#0f4c81",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: 0.65,
        }}>
          Cargando...
        </p>
      </div>
    </NavLoadingContext.Provider>
  );
}
