import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { routes } from './routes'
import Login from './pages/Login'
import QuestionDetail from './pages/QuestionDetail'
import AuthProvider from './components/AuthProvider'

function ScreenIndex() {
  return (
    <main className="mx-auto max-w-3xl p-8 font-sans">
      <h1 className="mb-6 text-2xl font-black">Dev in_ 화면 목록</h1>
      <ul className="grid gap-2 sm:grid-cols-2">
        {routes.map((r) => (
          <li key={r.path}>
            <Link className="block rounded-lg border-2 border-black bg-white px-4 py-3 font-bold shadow-[3px_3px_0_#000] hover:bg-yellow-300" to={r.path}>
              {r.title.replace('Dev in_ ', '')}
              <span className="block font-mono text-xs font-normal text-gray-500">{r.path}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/screens" element={<ScreenIndex />} />
          {/* 질문 등록 후 이동하는 상세 페이지. 실제 내용 연결은 #26에서 한다. */}
          <Route path="/questions/:questionId" element={<QuestionDetail />} />
          {routes.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
