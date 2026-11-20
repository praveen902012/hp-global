import { Home } from "../../views/Home";
import { blogs as builtInBlogs } from "../../data/blogData";
import { getAllBlogs } from "../../lib/server/blogs";

export const dynamic = "force-dynamic";

async function getLatestBlogs() {
  try {
    return (await getAllBlogs()).slice(0, 3);
  } catch (error) {
    console.error("Failed to load latest blogs for home page", error);
    return builtInBlogs.slice(0, 3);
  }
}

export default async function Page() {
  return <Home latestBlogs={await getLatestBlogs()} />;
}
