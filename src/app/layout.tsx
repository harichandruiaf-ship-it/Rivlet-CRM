import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Rivlet CRM — Activewear Operations & Growth',
  description: 'Lightweight, high-scale CRM for Rivlet Activewear — Athletes, Wholesale Studios, and VIP Relations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fbfbfb] text-[#09090b] flex">
        <ToastProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
