import GameCardList from "@/components/layout/GameCardList";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 text-center p-8">
      <h1 className="text-4xl font-bold mb-4">
        TechBook에 오신 것을 환영합니다
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        학습한 내용과 관심사를 업로드합니다.
      </p>
      <div className="flex flex-col gap-20">
        <div className="flex flex-1 w-full justify-center space-x-4">
          <Link href="/posts">
            <div className="px-6 py-3 bg-green-400 text-white rounded-lg hover:bg-green-500 transition-colors">
              기술 문서 보러가기
            </div>
          </Link>
          <Link href="/games">
            <div className="px-6 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
              게임 문서 보러가기
            </div>
          </Link>
        </div>
        <div className="flex-1">
          <GameCardList />
        </div>
      </div>
    </main>
  );
}
