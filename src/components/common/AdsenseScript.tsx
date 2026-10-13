import { ADSENSE_SCRIPT_SRC } from "@/lib/adsense";

// 서버 컴포넌트에서 일반 <script async>로 렌더링해 초기 HTML <head>에 포함시킨다.
// (next/script afterInteractive는 정적 생성된 홈 HTML에 태그가 남지 않아 심사 크롤러가 코드를 못 볼 수 있다.)
export default function AdsenseScript() {
  return <script async src={ADSENSE_SCRIPT_SRC} crossOrigin="anonymous" />;
}
