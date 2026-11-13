// Generated from Stitch screen "Dev in_ 마이페이지 (17번)". Scoped to #page-mypage so it can't clash with other screens.
module.exports = {
  important: "#page-mypage",
  // 마이페이지 스타일을 함께 쓰는 다른 회원 프로필 화면(MemberProfile, #30)도 포함한다
  content: ["./src/pages/Mypage.tsx", "./src/pages/MemberProfile.tsx", "./src/components/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{},
};
