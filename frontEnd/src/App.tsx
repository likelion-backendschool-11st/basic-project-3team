import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { routes } from './routes'
import Login from './pages/Login'
import AuthProvider from './components/AuthProvider'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationProvider from './components/notification/NotificationProvider'
import NotFound from './pages/NotFound'
import Ranking from './pages/Ranking'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import RequireAuth from './components/RequireAuth'
import LoginPromptProvider from './components/LoginPromptProvider'

// 로그인하지 않아도 볼 수 있는 화면. 나머지(질문 작성·마이페이지·관리자 등)는 로그인 화면으로 보낸다.
const PUBLIC_PATHS = new Set([
  '/login',
  '/signup',
  '/find-id',
  '/find-password',
  '/questions',
  '/question-detail',
  '/search-results',
])

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoginPromptProvider>
          {/* #70: 알림 상태·실시간 연결을 화면 이동과 상관없이 하나로 유지한다 */}
          <NotificationProvider>
            {/* #24: 화면 오류는 오류 화면으로, 없는 주소는 404 화면으로 보낸다 */}
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Login />} />
                {/* #64: Stitch 시안이 없는 화면이라 routes.ts(자동 생성)가 아닌 여기에 둔다 */}
                <Route path="/ranking" element={<Ranking />} />
                {/* #158: 이용약관·개인정보처리방침 (Stitch 시안 없음) */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                {routes.map(({ path, Component }) => (
                  <Route
                    key={path}
                    path={path}
                    element={PUBLIC_PATHS.has(path) ? <Component /> : <RequireAuth><Component /></RequireAuth>}
                  />
                ))}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </NotificationProvider>
        </LoginPromptProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
