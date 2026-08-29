import { BlogIndex } from "../../../views/Blog/BlogIndex";
import { getAllBlogs } from "../../../lib/server/blogs";

export const dynamic = "force-dynamic";

export default async function Page() {
  const blogs = await getAllBlogs();
  return <BlogIndex blogs={blogs} />;
}
