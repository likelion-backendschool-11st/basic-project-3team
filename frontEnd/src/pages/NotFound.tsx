// #24: 없는 주소로 들어왔을 때 보여주는 404 화면 (REQ-MAIN-010)
import ErrorView from "../components/ErrorView";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col justify-between antialiased"
      style={{
        backgroundColor: "rgb(255, 253, 245)",
        backgroundImage: "radial-gradient(rgb(217, 212, 195) 1.2px, transparent 1.2px)",
        backgroundSize: "18px 18px",
      }}
    >
      <Header />
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-16">
        <ErrorView kind="notFound" />
      </main>
      <Footer />
    </div>
  );
}
