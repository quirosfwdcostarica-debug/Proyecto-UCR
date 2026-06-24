/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["'Outfit'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      colors: {
        // FWD Costa Rica brand colors (logo)
        fwd: {
          cyan:   "#00AEEF",  // Azul FWD
          purple: "#6B2D8B",  // Morado FWD
          yellow: "#F5C400",  // Amarillo FWD
          green:  "#00A651",  // Verde FWD
        },
        ucr: {
          // Colores oficiales de la web de la Fundación
          esmeralda: "#004C63",      // Color corporativo oscuro / azul profundo
          celeste: "#4BA5D9",        // Celeste/Azul cielo oficial del banner principal
          "celeste-oficial": "#4BA5D9",
          amarillo: "#FF9B18",       // Amarillo de acentos
          naranja: "#F34B26",        // Naranja-rojo de acción de la web
          "naranja-oficial": "#F34B26",
          blanco: "#FFFFFF",
          negro: "#141414",
          "gris-fondo": "#F8F8F8",   // Fondo de sección oficial
          "footer-bg": "#272829",    // Fondo gris oscuro del footer de la web
          "texto-oscuro": "#1A1A2E",  // Texto oscuro para secciones claras

          // Tints oficiales al 20%
          turquesa: "#004C63",
          "celeste-medium": "#006AD3",
          "turquesa-tint": "#CCDBE0",
          "celeste-tint": "#CCE1F6",
          "beige-tint": "#FFEBD1",
          "rosa-tint": "#FDDBCF",

          // Compatibilidad heredada mapeada a los colores oficiales
          azul1: "#004C63",
          "azul-1": "#004C63",
          azul2: "#004C63",
          "azul-2": "#004C63",
          gris1: "#F8F8F8",
          "gris-1": "#F8F8F8",
          gris2: "#666666",
          "gris-2": "#666666",
          gris3: "#232323",
          "gris-3": "#232323",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
