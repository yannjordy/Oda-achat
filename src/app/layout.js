import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';

export const metadata = {
  title: "ODA Market | La Marketplace du Cameroun 🇨🇲",
  description:
    "ODA Market — La marketplace N°1 au Cameroun. Achetez et vendez facilement à Douala, Yaoundé et partout au pays.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ODA Market",
  },
  icons: {
    icon: [{ url: "/images/oda.png", sizes: "192x192", type: "image/png" }],
    apple: "/images/oda.png",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
