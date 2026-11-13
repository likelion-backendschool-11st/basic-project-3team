import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// docs/api.md 1장 공통 응답 형식
export interface ApiResponse<T> {
  success: boolean;
  code: string | null;
  message: string | null;
  data: T;
}

export interface LoginResult {
  accessToken: string;
  memberId: number;
  nickname: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
}

// docs/auth.md: Access Token은 메모리에만 저장한다 (localStorage 금지). 새로고침하면 사라지고 reissue로 복구한다.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 재발급은 동시에 한 번만 보낸다. Refresh Token은 쓸 때마다 교체되므로 두 번 보내면 두 번째 요청이 실패한다.
let reissuePromise: Promise<LoginResult> | null = null;

export function reissue(): Promise<LoginResult> {
  if (!reissuePromise) {
    reissuePromise = axios
      .post<ApiResponse<LoginResult>>("/api/auth/reissue", null, { withCredentials: true })
      .then(({ data }) => {
        setAccessToken(data.data.accessToken);
        return data.data;
      })
      .finally(() => {
        reissuePromise = null;
      });
  }
  return reissuePromise;
}

// 재발급까지 실패했을 때 실행할 처리 (AuthProvider가 로그아웃 상태로 바꾸고 로그인 화면으로 보낸다).
let onSessionExpired: () => void = () => {};

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

type RetriableConfig = InternalAxiosRequestConfig & { retried?: boolean };

// 401 TOKEN_EXPIRED면 재발급 후 원래 요청을 한 번 다시 보낸다.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const config = error.config as RetriableConfig | undefined;
    if (error.response?.status !== 401 || error.response.data?.code !== "TOKEN_EXPIRED" || !config || config.retried) {
      throw error;
    }
    config.retried = true;
    try {
      await reissue();
    } catch {
      setAccessToken(null);
      onSessionExpired();
      throw error;
    }
    return api(config);
  },
);

// 서버가 보낸 에러 메시지를 꺼낸다. 없으면 기본 문구.
export function getErrorMessage(error: unknown, fallback = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.") {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}

export function getErrorCode(error: unknown): string | null {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.code ?? null;
  }
  return null;
}

export interface FieldError {
  field: string;
  reason: string;
}

// 400 INVALID_INPUT의 필드별 에러 목록 (docs/api.md 1장)
export function getFieldErrors(error: unknown): FieldError[] {
  if (axios.isAxiosError<ApiResponse<{ errors?: FieldError[] } | null>>(error)) {
    return error.response?.data?.data?.errors ?? [];
  }
  return [];
}
