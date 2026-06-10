import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bodega 24 | Licores a domicilio",
  description:
    "Licores, vinos y cervezas seleccionados con entrega en Facatativá.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
