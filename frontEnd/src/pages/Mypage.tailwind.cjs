// Generated from Stitch screen "Dev in_ 마이페이지 (17번)". Scoped to #page-mypage so it can't clash with other screens.
module.exports = {
  important: "#page-mypage",
  // 마이페이지 스타일을 함께 쓰는 공개 프로필 화면과 공통 프로필 컴포넌트도 포함한다 (#30)
  content: ["./src/pages/Mypage.tsx", "./src/pages/MemberProfile.tsx", "./src/components/ProfileDetails.tsx"],
  corePlugins: { preflight: false },
  plugins: [require("@tailwindcss/container-queries")],
  ...{},
};
