import Header from "./Header";
import Footer from "./Footer";

export default function Shell({ children, overlay = false }: { children: React.ReactNode; overlay?: boolean }) {
  return (
    <>
      <Header overlay={overlay} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
