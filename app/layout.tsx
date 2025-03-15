import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from '@/components/navbar';
import { Toaster } from 'sonner'; // Import Toaster

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Screenshot Service',
  description: 'Capture beautiful screenshots of any website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <Toaster /> {/* Add Toaster here to ensure toasts are shown */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
