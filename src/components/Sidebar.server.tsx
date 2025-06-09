import Sidebar from "@/components/Sidebar";
import { getPostsByCategory } from "@/lib/getPostsByCategory";

export default async function SidebarServer() {
  const data = getPostsByCategory();
  return <Sidebar data={data} />;
}
