import { getPostsByCategory } from "@/lib/getPostsByCategory";
import ClientHome from "@/components/ClientHome";

export default function Home() {
  const postsByCategory = getPostsByCategory(); // 서버에서 동기적으로 호출

  return <ClientHome data={postsByCategory} />;
}
