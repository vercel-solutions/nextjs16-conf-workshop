# Next.js 16 Caching Migration Workshop

Welcome to the Next.js 16 workshop! Learn how to migrate from Next.js 15 to Next.js 16's new caching features.

## Prerequisites

- Node.js 18+ installed
- Basic knowledge of Next.js App Router
- Understanding of React Server Components

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Visit http://localhost:3000/blog
```

## Current Implementation (Next.js 15)

The blog application currently uses:
- `unstable_cache` for caching in each page component
- `export const dynamic = 'force-dynamic'` for the blog page
- `export const dynamic = 'force-static'` for the homepage
- 250ms simulated API delays for testing

Check the console to see API calls being logged.

## Migration Tasks

### Task 1: Enable Next.js 16 Features

**Goal:** Update to Next.js 16 and enable new caching features.

1. Update `package.json`:
```json
"next": "^16.0.0"
```

2. Configure `next.config.ts`:
```typescript
const nextConfig = {
  experimental: {
    cacheComponents: true,
    ppr: true, // Partial Prerendering
  },
};
```

3. Run `pnpm install`

### Task 2: Migrate to "use cache" Directive

**Goal:** Replace `unstable_cache` with the new `"use cache"` directive.

Current code in pages:
```typescript
const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ["categories"],
  {
    revalidate: 300,
    tags: ["categories"],
  }
);

const getCachedBlogPosts = unstable_cache(
  async (category?: string) => getBlogPosts(category),
  ["blog-posts"],
  {
    revalidate: 60,
    tags: ["blog-posts"],
  },
);
```

Migrate to:
```typescript
import {cacheTag, cacheLife} from 'next/cache';

export async function getCachedBlogPosts(category?: string) {
  "use cache";

  cacheTag('blog-posts');
  cacheLife({
    revalidate: 60,
  });

  return getBlogPosts(category);
}

export async function getCachedCategories() {
  "use cache";

  cacheTag('categories');
  cacheLife({
    revalidate: 300,
  });

return getCategories();
}
```

**Note:**
- The `"use cache"` directive must be the first line in the function body
- Both `cacheTag` and `cacheLife` are imported with the `unstable_` prefix from 'next/cache'
- Tags allow for targeted cache invalidation using `revalidateTag()`
- `cacheLife` can accept inline configuration objects or reference named profiles from `next.config.ts`

### Task 3: Configure Cache Profiles

**Goal:** Set up cache lifetimes and tags.

1. Add cache profiles to `next.config.ts`:
```typescript
const nextConfig = {
  experimental: {
    cacheComponents: true,
    ppr: true,
  },
  cacheLife: {
    blogPosts: {
      stale: 60,      // 60 seconds
      revalidate: 120, // 120 seconds
    },
    categories: {
      stale: 300,     // 5 minutes
      revalidate: 600, // 10 minutes
    },
  },
};
```

2. Use cache profiles and tags:
```typescript
import {cacheLife} from 'next/cache';

export async function getCachedBlogPosts(category?: string) {
  "use cache";

  cacheLife('blogPosts');

  if (category) {
    cacheTag(`blog-posts-${category}`);
  } else {
    cacheTag('blog-posts-all');
  }

  return getBlogPosts(category);
}
```

### Task 4: Implement Partial Prerendering (PPR)

**Goal:** Enable PPR for better performance.

1. Remove `export const dynamic = 'force-dynamic'` from `src/app/blog/page.tsx`

2. Add Suspense boundaries:
```tsx
import { Suspense } from 'react';
import BlogPostsSkeleton from './components/blog-posts/skeleton';

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <header>
        <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
        <p className="text-muted-foreground">
          Discover our latest articles and insights
        </p>
      </header>

      <Suspense fallback={<div>Loading categories...</div>}>
        <CategorySection selectedCategory={params.category} />
      </Suspense>

      <Suspense fallback={<BlogPostsSkeleton />}>
        <BlogPostsSection category={params.category} />
      </Suspense>
    </div>
  );
}
```

### Task 5: Create Cache Components

**Goal:** Make components that manage their own caching.

```tsx
import {cacheTag, cacheLife} from 'next/cache';

export async function CachedCategories({ selectedCategory }: { selectedCategory?: string }) {
  "use cache";

  cacheLife('categories');
  cacheTag('categories');

  const categories = await getCategories();

  return (
    <CategoryFilter
      categories={categories}
      selectedCategory={selectedCategory}
    />
  );
}
```

### Task 6: Add Cache Invalidation

**Goal:** Implement on-demand cache invalidation.

1. Create server action:
```typescript
'use server';

import { revalidateTag } from 'next/cache';

export async function invalidateBlogCache(category?: string) {
  if (category) {
    revalidateTag(`blog-posts-${category}`);
  } else {
    revalidateTag('blog-posts-all');
  }
}
```

2. Add refresh button:
```tsx
'use client';

import { invalidateBlogCache } from '@/app/actions';

export function RefreshButton({ category }: { category?: string }) {
  return (
    <button
      onClick={() => invalidateBlogCache(category)}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Refresh Posts
    </button>
  );
}
```

## Verification Checklist

- [ ] Application runs without errors
- [ ] API calls are cached (check console logs)
- [ ] Category filtering works
- [ ] Cache invalidation works with refresh button
- [ ] PPR is working (check Network tab)
- [ ] Page loads faster

## Bonus Challenges

### Challenge 1: Migrate Homepage
The homepage uses `force-static` with local cache functions. Migrate it to use the new caching system.

### Challenge 2: Individual Blog Posts
Create `/blog/[slug]/page.tsx` with:
- Dynamic routing
- `generateStaticParams` for static generation
- Related posts section

## Stretch Goals

### Dynamic Footer with Connection API
Add a footer showing server time using the `connection` function:

```typescript
import { connection } from 'next/server';

export async function DynamicFooter() {
  await connection(); // Opts out of static rendering

  const currentTime = new Date().toLocaleString();

  return (
    <footer>
      <p>Server time: {currentTime}</p>
    </footer>
  );
}
```

### More Stretch Goals
- Real-time view counter
- User preference persistence
- A/B testing
- Geolocation-based content

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- ["use cache" Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheLife Function](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [cacheTag Function](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [Partial Prerendering](https://nextjs.org/docs/app/getting-started/partial-prerendering)
- [Connection Function](https://nextjs.org/docs/app/api-reference/functions/connection)

---

**Happy coding!** 🚀
