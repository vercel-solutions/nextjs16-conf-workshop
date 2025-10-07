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
    ppr: true,
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
      stale: 60,
      revalidate: 120,
    },
    categories: {
      stale: 300,
      revalidate: 600,
    },
  },
};
```

2. Use cache profiles and tags:
```typescript
import {cacheLife, cacheTag} from 'next/cache';

export async function getCachedBlogPosts(category?: string) {
  "use cache";

  cacheLife('blogPosts');
  cacheTag('blog-posts');

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

### Task 5: Add Cache Invalidation

**Goal:** Implement on-demand cache invalidation via route handler.

Create a revalidation route handler at `src/app/api/revalidate/route.ts`:

```typescript
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get('tag');

  if (!tag) {
    return NextResponse.json(
      { error: 'Missing tag parameter' },
      { status: 400 }
    );
  }

  revalidateTag(tag);

  return NextResponse.json({
    revalidated: true,
    tag,
    now: Date.now()
  });
}
```

**Usage:**
- Visit `/api/revalidate?tag=blog-posts` to revalidate all blog posts
- Visit `/api/revalidate?tag=categories` to revalidate categories

## Verification Checklist

- [ ] Application runs without errors
- [ ] API calls are cached (check console logs)
- [ ] Category filtering works
- [ ] Cache invalidation works via `/api/revalidate?tag=...` route
- [ ] PPR is working (check Network tab)
- [ ] Page loads faster

## Bonus Tasks

- Create `/blog/[slug]/page.tsx` to display individual blog posts using `"use cache"`.
- Implement cache invalidation for individual blog posts and categories.
- Add a footer showing server time using the `connection` function.
- Deploy the application and verify everything works.

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- ["use cache" Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheLife Function](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [cacheTag Function](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [Partial Prerendering](https://nextjs.org/docs/app/getting-started/partial-prerendering)
- [Connection Function](https://nextjs.org/docs/app/api-reference/functions/connection)

---

**Happy coding!** 🚀
