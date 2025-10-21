import Link from "next/link";
import Image from "next/image";

import type {BlogPost} from "@/api";

export default function BlogPosts({posts}: {posts: BlogPost[]}) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article key={post.id} className="group relative flex h-full flex-col">
          <Link className="flex h-full flex-col" href={`/blog/${post.slug}`}>
            <div className="bg-card flex h-full flex-col overflow-hidden rounded-lg border">
              <div className="bg-muted relative aspect-video overflow-hidden">
                <Image
                  fill
                  alt={post.title}
                  className="h-full w-full transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={post.imageUrl}
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-primary font-medium">{post.category}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{post.readTime} min read</span>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <h2 className="group-hover:text-primary line-clamp-2 text-xl font-semibold tracking-tight transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
                </div>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <Image
                    alt={post.author.name}
                    className="h-8 w-8 rounded-full border"
                    height={32}
                    src={post.author.avatar}
                    width={32}
                  />
                  <div className="text-sm">
                    <p className="font-medium">{post.author.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}

export function BlogPostsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({length: 6}).map((_, index) => (
        <div key={index} className="bg-card overflow-hidden rounded-lg border">
          <div className="bg-muted aspect-video animate-pulse" />
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <div className="bg-muted h-6 animate-pulse rounded" />
              <div className="bg-muted h-6 animate-pulse rounded" />
            </div>
            <div className="bg-muted mb-1 h-4 animate-pulse rounded" />
            <div className="bg-muted mb-6 h-4 w-3/4 animate-pulse rounded" />
            <div className="flex items-center gap-3">
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
              <div>
                <div className="bg-muted mb-1 h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-3 w-20 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
