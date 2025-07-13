import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BeerTaster - Seu Diário de Degustações',
  description: 'Registre, avalie e relembre cada cerveja que você experimenta. O seu sommelier de bolso.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
