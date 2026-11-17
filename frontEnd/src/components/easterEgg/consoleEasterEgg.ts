// F12 콘솔 이스터에그 (main.tsx에서 한 번 부른다)
const REPO_URL = "https://github.com/likelion-backendschool-11st/basic-project-3team";

export function printConsoleEasterEgg() {
  console.log(
    "%cDev in_",
    "background:#FFD43B;color:#111111;font-size:40px;font-weight:900;font-family:monospace;padding:4px 16px;border:2px solid #111111;",
  );
  console.log("✨ 축하합니다! 이 콘솔엔 빨간 에러가 없습니다. (아직은요)");
  console.log(`👀 코드가 궁금하면 깃허브에 다 공개돼 있어요 → ${REPO_URL}`);
}
