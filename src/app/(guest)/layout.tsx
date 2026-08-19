import { TopNavBar } from "@/components/guest/TopNavBar";
import { Footer } from "@/components/guest/Footer";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
