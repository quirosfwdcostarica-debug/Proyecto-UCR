import React from "react";
import "./globals.css";
import { C, FONT_BODY } from "@/lib/theme";
import DemoSwitcher from "@/components/DemoSwitcher";

export const metadata = {
  title: "Alumni UCR · Fundación Exalumnos de la UCR",
  description: "Conectamos exalumnos UCR con estudiantes que transforman el futuro.",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700;800&family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: FONT_BODY, color: C.ink, background: C.bg, minHeight: "100vh", margin: 0 }}>
        {children}
        <DemoSwitcher />
      </body>
    </html>
  );
}
