// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "School Management Dashboard",
  description: "A modern school management dashboard for staff.",
};

// Converts a #RRGGBB hex colour into "H S% L%" for our HSL-based CSS variables.
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pull the school's brand colours so the whole UI re-themes without a rebuild
  // (Settings → School, Stage 11). Falls back gracefully if not configured yet.
  const settings = await prisma.schoolSettings.findFirst().catch(() => null);
  const brandOverride = settings?.primaryColour ? hexToHsl(settings.primaryColour) : null;
  const accentOverride = settings?.secondaryColour ? hexToHsl(settings.secondaryColour) : null;

  return (
    <html lang="en-GB" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        {(brandOverride || accentOverride) && (
          <style
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `:root { ${brandOverride ? `--brand: ${brandOverride};` : ""} ${
                accentOverride ? `--accent: ${accentOverride};` : ""
              } }`,
            }}
          />
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
