import './globals.css';
import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';
import PWAInstallModal from '@/components/ui/PWAInstallModal';
import PageTracker from '@/components/layout/PageTracker';

export const metadata = {
  title: "ODA Market | La Marketplace du Cameroun 🇨🇲",
  description:
    "ODA Market — La marketplace N°1 au Cameroun. Achetez et vendez facilement à Douala, Yaoundé et partout au pays.",
  manifest: "/manifest.json",
  applicationName: "ODA Market",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ODA Market",
  },
  formatDetection: {
    telephone: false,
  },
  appleMobileWebAppCapable: "yes",
  appleMobileWebAppStatusBarStyle: "black-translucent",
  icons: {
    icon: [
      { url: "/images/oda-logo.png", type: "image/svg+xml" },
      { url: "/images/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/images/oda-logo.png"],
    apple: [
      { url: "/images/icon-192x192.png", sizes: "192x192" },
      { url: "/images/icon-512x512.png", sizes: "512x512" },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'ODA Market',
    'msapplication-TileColor': '#0444f5',
    'msapplication-tap-highlight': 'no',
  },
};

export const viewport = {
  themeColor: "#D4920A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ODA Market" />
        <link rel="apple-touch-icon" sizes="192x192" href="/images/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/images/icon-512x512.png" />
        <link rel="icon" type="image/svg+xml" href="/images/oda-logo.svg" />
        <link rel="icon" href="/images/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D4920A" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="google-site-verification" content="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ODA Market",
              url: "https://odamarket.cm",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://odamarket.cm/achats?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              description: "La marketplace N°1 au Cameroun. Achetez et vendez facilement.",
              inLanguage: ["fr", "en"],
              address: { "@type": "PostalAddress", addressCountry: "CM" },
            }),
          }}
        />
      </head>
      <body>
        <PageTracker>
          {children}
          <ServiceWorkerRegistration />
          <PWAInstallModal />
        </PageTracker>
      </body>
    </html>
  );
}
