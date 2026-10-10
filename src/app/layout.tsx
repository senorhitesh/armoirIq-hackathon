import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScaleFlow IQ | Governed Multi-Agent Ad Workspace (ArmorIQ)',
  description: 'Collaborative AI ad workspace where agency teams plan, draft, score, schedule, and iterate with AI agents, with cryptographic intent verification and policy enforcement by ArmorIQ.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-50/70 text-slate-900 antialiased font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-500/20 selection:text-blue-900">
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Light Ambient Glows */}
          <div className="absolute top-[-5%] left-[20%] w-[550px] h-[550px] bg-blue-100/50 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[150px] pointer-events-none" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
