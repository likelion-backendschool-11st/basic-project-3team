import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // docs/environment.md: 개발 환경에서는 /api 요청을 백엔드(8080)로 넘긴다. Refresh 쿠키도 같은 출처로 오가게 된다.
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
