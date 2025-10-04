import Link from "next/link";

import {BlogPost} from "@/api";

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
        <article key={post.id} className="group relative flex flex-col space-y-2">
          <Link className="block" href={`/blog/${post.slug}`}>
            <div className="bg-card overflow-hidden rounded-lg border">
              <div className="bg-muted relative aspect-video overflow-hidden">
                <img
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  src={post.imageUrl}
                />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-primary font-medium">{post.category}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{post.readTime} min read</span>
                </div>
                <div className="space-y-2">
                  <h2 className="group-hover:text-primary line-clamp-2 text-xl font-semibold tracking-tight transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <img
                    alt={post.author.name}
                    className="h-8 w-8 rounded-full border"
                    src={post.author.avatar}
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
