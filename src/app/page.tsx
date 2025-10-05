export const dynamic = "force-static";

export const revalidate = 3600;

import Link from "next/link";
import {unstable_cache} from "next/cache";

import {type BlogPost, getBlogPosts, getCategories} from "@/api";

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

async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getCachedBlogPosts();

  return allPosts.slice(0, 3);
}

async function getPopularCategories() {
  const categories = await getCachedCategories();

  return categories.sort((a, b) => b.postCount - a.postCount).slice(0, 3);
}

async function getBlogStats() {
  const [posts, categories] = await Promise.all([getCachedBlogPosts(), getCachedCategories()]);

  return {
    totalPosts: posts.length,
    totalCategories: categories.length,
    avgReadTime: Math.round(posts.reduce((acc, post) => acc + post.readTime, 0) / posts.length),
  };
}

export default async function HomePage() {
  const [featuredPosts, popularCategories, stats] = await Promise.all([
    getFeaturedPosts(),
    getPopularCategories(),
    getBlogStats(),
  ]);

  return (
    <main className="space-y-16">
      <section className="bg-card rounded-xl border px-6 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Welcome to Our Blog
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg sm:text-xl">
          Discover insights on technology, design, and development
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors"
            href="/blog"
          >
            Browse All Posts
          </Link>
          <Link
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors"
            href="/blog?category=technology"
          >
            Tech Articles
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-lg border p-6 text-center">
          <div className="text-3xl font-bold">{stats.totalPosts}</div>
          <div className="text-muted-foreground mt-2 text-sm">Total Posts</div>
        </div>
        <div className="bg-card rounded-lg border p-6 text-center">
          <div className="text-3xl font-bold">{stats.totalCategories}</div>
          <div className="text-muted-foreground mt-2 text-sm">Categories</div>
        </div>
        <div className="bg-card rounded-lg border p-6 text-center">
          <div className="text-3xl font-bold">{stats.avgReadTime} min</div>
          <div className="text-muted-foreground mt-2 text-sm">Avg Read Time</div>
        </div>
      </section>

      <section>
        <h2 className="mb-8 text-3xl font-bold tracking-tight">Featured Posts</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-card hover:bg-muted/50 rounded-lg border transition-colors"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="bg-muted relative aspect-video overflow-hidden rounded-t-lg">
                  <img
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    src={post.imageUrl}
                  />
                  <div className="bg-primary text-primary-foreground absolute top-3 right-3 rounded-md px-2 py-1 text-xs font-semibold">
                    Featured
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2 text-xs">
                    <span className="bg-muted rounded-md px-2 py-1 font-medium">
                      {post.category}
                    </span>
                    <span className="text-muted-foreground">{post.readTime} min read</span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{post.title}</h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-8 text-3xl font-bold tracking-tight">Popular Categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularCategories.map((category) => (
            <Link
              key={category.id}
              className="group bg-card hover:bg-muted/50 block rounded-lg border p-6 transition-colors"
              href={`/blog?category=${category.slug}`}
            >
              <h3 className="mb-2 text-xl font-semibold">{category.name}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.postCount} posts</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 rounded-xl border px-6 py-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">Stay Updated</h2>
        <p className="text-muted-foreground mb-8">Get the latest posts delivered to your inbox</p>
        <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            disabled
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-10 flex-1 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter your email"
            type="email"
          />
          <button
            disabled
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
            type="submit"
          >
            Subscribe
          </button>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">(Newsletter feature coming soon)</p>
      </section>
    </main>
  );
}
