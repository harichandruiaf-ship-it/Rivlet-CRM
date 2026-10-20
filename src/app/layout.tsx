import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { DropProvider } from '@/components/DropContext';
import NewDropModal from '@/components/NewDropModal';

export const metadata: Metadata = {
  title: 'Rivlet CRM — Activewear Operations & Growth',
  description: 'Lightweight, high-scale CRM for Rivlet Activewear — Athletes, Wholesale Studios, and VIP Relations.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa] text-[#09090b] flex antialiased">
        <ToastProvider>
          <DropProvider>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
              {children}
            </main>
            <NewDropModal />
          </DropProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
