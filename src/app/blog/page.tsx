import {unstable_cache} from "next/cache";

import {getBlogPosts, getCategories} from "@/api";

import BlogPosts from "@/components/blog-posts";
import CategoryFilter from "@/components/category-filter";

export const dynamic = "force-dynamic";

const getCachedCategories = unstable_cache(async () => getCategories(), ["categories"], {
  revalidate: 300,
  tags: ["categories"],
});

const getCachedBlogPosts = unstable_cache(
  async (category?: string) => getBlogPosts(category),
  ["blog-posts"],
  {
    revalidate: 60,
    tags: ["blog-posts"],
  },
);

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{category?: string}>;
}) {
  const {category: selectedCategory} = await searchParams;

  const [categories, posts] = await Promise.all([
    getCachedCategories(),
    getCachedBlogPosts(selectedCategory),
  ]);

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
