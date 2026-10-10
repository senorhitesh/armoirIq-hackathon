import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdLoop | Governed Multi-Agent Ad Workspace (ArmorIQ)',
  description: 'Collaborative AI ad workspace where agency teams plan, draft, score, schedule, and iterate with AI agents, with cryptographic intent verification and policy enforcement by ArmorIQ.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Subtle Cyber Glow Orbs */}
          <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[10%] w-[550px] h-[550px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[130px] pointer-events-none" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
