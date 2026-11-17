// #24: 없는 주소로 들어왔을 때 보여주는 404 화면 (REQ-MAIN-010)
import ErrorView from "../components/ErrorView";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { PAGE_BACKGROUND } from "../components/uiStyles";

export default function NotFound() {
  return (
    <div className={`min-h-screen flex flex-col justify-between antialiased ${PAGE_BACKGROUND}`}>
      <Header />
      <main className="flex-1 w-full max-w-devin-narrow mx-auto px-4 py-16">
        <ErrorView kind="notFound" />
      </main>
      <Footer />
    </div>
  );
}
