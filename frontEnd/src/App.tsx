import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { routes } from './routes'
import Login from './pages/Login'
import AuthProvider from './components/AuthProvider'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationProvider from './components/notification/NotificationProvider'
import NotFound from './pages/NotFound'
import MemberProfile from './pages/MemberProfile'

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
        {/* #70: 알림 상태·실시간 연결을 화면 이동과 상관없이 하나로 유지한다 */}
        <NotificationProvider>
          {/* #24: 화면 오류는 오류 화면으로, 없는 주소는 404 화면으로 보낸다 */}
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/screens" element={<ScreenIndex />} />
              <Route path="/members/:memberId" element={<MemberProfile />} />
              {routes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
