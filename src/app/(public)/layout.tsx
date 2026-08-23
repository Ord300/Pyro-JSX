import { PublicNavbar } from "@/src/components/layout/PublicNavbar";
import { Footer } from "@/src/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-dark-background text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}