import {unstable_cache} from "next/cache";

import {getBlogPosts, getCategories} from "@/api";

import BlogPosts from "@/components/blog-posts";
import CategoryFilter from "@/components/category-filter";

export const dynamic = "force-dynamic";

const getCachedCategories = unstable_cache(async () => getCategories(), [], {
  revalidate: 3600,
  tags: ["categories"],
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{category?: string}>;
}) {
  const {category} = await searchParams;
  const [categories, posts] = await Promise.all([getCachedCategories(), getBlogPosts(category)]);

  return (
    <div className="container mx-auto flex flex-col gap-8 px-4 py-8">
      <header>
        <h1 className="mb-4 text-4xl font-bold">Blog Posts</h1>
        <p className="text-muted-foreground">Discover our latest articles and insights</p>
      </header>

      <CategoryFilter categories={categories} />

      <BlogPosts posts={posts} />
    </div>
  );
}
