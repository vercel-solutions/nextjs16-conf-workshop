import {getCachedBlogPosts, getCachedCategories} from "@/api";

import BlogPosts from "./components/blog-posts";
import CategoryFilter from "./components/category-filter";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{category?: string}>;
}) {
  const {category: selectedCategory} = await searchParams;

  const categories = await getCachedCategories();
  const posts = await getCachedBlogPosts(selectedCategory);

  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-8">
      <header>
        <h1 className="mb-4 text-4xl font-bold">Blog Posts</h1>
        <p className="text-muted-foreground">Discover our latest articles and insights</p>
      </header>

      <CategoryFilter categories={categories} selectedCategory={selectedCategory} />

      <BlogPosts posts={posts} />
    </div>
  );
}
