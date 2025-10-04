# Next.js 16 Caching Migration Workshop

Welcome to the Next.js 16 workshop! In this hands-on session, you'll learn how to migrate from Next.js 15's caching approach to the new Next.js 16 cache components and directives.

## <� Workshop Overview

You'll be migrating a blog application from Next.js 15's `unstable_cache` and segment configuration (`export const dynamic`) to Next.js 16's new caching features:
- `"use cache"` directive
- Cache Components (`cacheComponents`)
- `cacheLife` configuration
- `cacheTag` for granular invalidation
- Partial Prerendering (PPR)

## =� Essential Documentation

Before starting, familiarize yourself with these key resources:
- [Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)
- ["use cache" Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheLife Configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheLife)
- [cacheTag Function](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [Partial Prerendering (PPR)](https://nextjs.org/docs/app/getting-started/partial-prerendering)

## =� Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Visit the application:**
   - Blog listing: http://localhost:3000/blog
   - Try filtering by category using the filter buttons

4. **Observe the current behavior:**
   - Open the console to see API calls being logged
   - Notice the 250ms delay on each request
   - The page is fully dynamic (`export const dynamic = 'force-dynamic'`)

## =� Migration Tasks

### Task 1: Enable Next.js 16 Features

**Objective:** Update to Next.js 16 and enable the new caching features.

1. Update `package.json` to use Next.js 16:
   ```json
   "next": "^16.0.0"
   ```

2. Enable cache components in `next.config.js`:
   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     experimental: {
       cacheComponents: true,
       ppr: true, // Enable Partial Prerendering
     },
   };
   
   export default nextConfig;
   ```

3. Run `npm install` to update dependencies.

### Task 2: Migrate API Functions to "use cache"

**Objective:** Replace `unstable_cache` with the new `"use cache"` directive.

1. In `app/api.ts`, remove the `unstable_cache` imports and implementations
2. Create cached functions using the `"use cache"` directive:

```typescript
// Before (Next.js 15)
import { unstable_cache } from 'next/cache';

export const getCachedBlogPosts = unstable_cache(
  async (category?: string) => getBlogPosts(category),
  ['blog-posts'],
  {
    revalidate: 60,
    tags: category ? [`blog-posts-${category}`] : ['blog-posts'],
  }
);

// After (Next.js 16)
export async function getCachedBlogPosts(category?: string) {
  "use cache";
  return getBlogPosts(category);
}
```

**=� Key Learning:** The `"use cache"` directive must be the first line in the function body. It automatically caches the function result.

### Task 3: Configure Cache Keys and Lifetime

**Objective:** Set up proper cache keys and lifetimes for different data.

1. Configure `cacheLife` in `next.config.js`:

```js
const nextConfig = {
  experimental: {
    cacheComponents: true,
    ppr: true,
  },
  cacheLife: {
    // Define cache profiles
    blogPosts: {
      stale: 60,      // Consider stale after 60 seconds
      revalidate: 120, // Revalidate after 120 seconds
    },
    categories: {
      stale: 300,     // Categories change less frequently
      revalidate: 600,
    },
  },
};
```

2. Update cached functions to use cache profiles:

```typescript
import { cacheTag } from 'next/cache';

export async function getCachedBlogPosts(category?: string) {
  "use cache";
  
  // Use cacheTag for granular invalidation
  if (category) {
    cacheTag(`blog-posts-${category}`);
  } else {
    cacheTag('blog-posts-all');
  }
  
  return getBlogPosts(category);
}
```

**� Gotcha:** Cache keys are automatically generated based on function arguments. Ensure your arguments are serializable!

### Task 4: Implement Partial Prerendering (PPR)

**Objective:** Enable PPR to prerender static parts while keeping dynamic parts interactive.

1. Remove `export const dynamic = 'force-dynamic'` from `app/blog/page.tsx`

2. Update the page component to leverage PPR:

```tsx
// app/blog/page.tsx
import { Suspense } from 'react';

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedCategory = params.category;
  
  // This part will be statically rendered
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
        <p className="text-gray-600">
          Discover our latest articles and insights
        </p>
      </header>

      {/* Categories can be statically rendered */}
      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoriesSection selectedCategory={selectedCategory} />
      </Suspense>

      {/* Blog posts are dynamic based on category */}
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogPostsList category={selectedCategory} />
      </Suspense>
    </div>
  );
}
```

**=� Key Learning:** PPR automatically determines which parts can be prerendered based on dynamic dependencies. Components without dynamic data are prerendered at build time.

### Task 5: Optimize Category Filter with Cache Components

**Objective:** Make the category filter a cache component that updates independently.

1. Create a cached categories component:

```tsx
// app/components/CachedCategories.tsx
import { getCategories } from '@/app/api';
import CategoryFilter from './CategoryFilter';

export async function CachedCategories({ 
  selectedCategory 
}: { 
  selectedCategory?: string 
}) {
  "use cache";
  
  const categories = await getCategories();
  
  return (
    <CategoryFilter 
      categories={categories} 
      selectedCategory={selectedCategory} 
    />
  );
}
```

2. Use cache profiles for different cache strategies:

```typescript
export async function getCachedBlogPosts(category?: string) {
  "use cache";
  // Specify cache profile
  "cache-life: blogPosts";
  
  return getBlogPosts(category);
}

export async function getCachedCategories() {
  "use cache";
  "cache-life: categories";
  
  return getCategories();
}
```

### Task 6: Add Cache Invalidation

**Objective:** Implement cache invalidation for data updates.

1. Create a server action to invalidate cache:

```typescript
// app/actions.ts
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

2. Add a refresh button to test invalidation:

```tsx
// app/components/RefreshButton.tsx
'use client';

import { invalidateBlogCache } from '@/app/actions';

export function RefreshButton({ category }: { category?: string }) {
  return (
    <button
      onClick={() => invalidateBlogCache(category)}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Refresh Posts
    </button>
  );
}
```

## <� Verification Checklist

After completing the migration, verify:

- [ ] The application runs without errors
- [ ] API calls are cached (check console logs)
- [ ] Category filtering works correctly
- [ ] Cache invalidation works when using the refresh button
- [ ] PPR is working (check the Network tab for prerendered HTML)
- [ ] The page loads faster due to caching

## > Common Gotchas and Solutions

### 1. "use cache" Placement
```typescript
// L Wrong - directive not first line
export async function getData() {
  console.log('Getting data');
  "use cache"; // Too late!
  return data;
}

//  Correct
export async function getData() {
  "use cache";
  console.log('Getting data');
  return data;
}
```

### 2. Non-Serializable Arguments
```typescript
// L Wrong - Date object can't be serialized
export async function getPosts(date: Date) {
  "use cache";
  return posts;
}

//  Correct - Use string or number
export async function getPosts(dateString: string) {
  "use cache";
  const date = new Date(dateString);
  return posts;
}
```

### 3. Cache Key Collisions
```typescript
// L Potential collision
export async function getData(id?: string) {
  "use cache";
  // undefined and null might cause issues
  return data;
}

//  Better - Explicit default
export async function getData(id: string = 'default') {
  "use cache";
  return data;
}
```

### 4. Missing Suspense Boundaries
```tsx
// L No loading state
export default async function Page() {
  const data = await getCachedData();
  return <div>{data}</div>;
}

//  With proper loading state
export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent />
    </Suspense>
  );
}
```

## =� Performance Comparison

After migration, you should observe:

| Metric | Next.js 15 | Next.js 16 | Improvement |
|--------|------------|------------|-------------|
| Initial Load | ~500ms | ~200ms | 60% faster |
| Category Switch | 250ms | ~50ms | 80% faster |
| Cached Requests | 250ms | 0ms | 100% faster |
| Build Size | Baseline | -5% | Smaller |

## = Debugging Tips

1. **Enable cache debugging:**
   ```js
   // next.config.js
   const nextConfig = {
     logging: {
       fetches: {
         fullUrl: true,
       },
     },
   };
   ```

2. **Check cache headers:**
   - Open DevTools Network tab
   - Look for `x-cache` headers
   - `HIT` = served from cache
   - `MISS` = cache miss, fetching fresh data

3. **Monitor cache behavior:**
   ```typescript
   export async function getData() {
     "use cache";
     console.log(`[CACHE] Getting data at ${new Date().toISOString()}`);
     return data;
   }
   ```

## =� Production Considerations

1. **Set appropriate cache lifetimes:**
   - Consider your data freshness requirements
   - Balance between performance and data accuracy

2. **Plan invalidation strategies:**
   - Use webhooks for real-time updates
   - Implement scheduled revalidation for less critical data

3. **Monitor cache hit rates:**
   - Use analytics to track cache performance
   - Adjust cache strategies based on usage patterns

## <� Bonus Challenges

1. **Implement search functionality** with cached results
2. **Add pagination** with proper cache keys
3. **Create a cache dashboard** showing hit/miss rates
4. **Implement optimistic updates** with cache invalidation
5. **Add ISR (Incremental Static Regeneration)** for individual blog posts

## =� Discussion Topics

- When would you choose `"use cache"` over traditional caching methods?
- How does PPR improve user experience compared to SSR/SSG?
- What are the trade-offs between cache duration and data freshness?
- How would you implement cache warming strategies?

## =� Additional Resources

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16)
- [Caching Best Practices](https://nextjs.org/docs/app/building-your-application/caching)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Web Vitals and Performance](https://web.dev/vitals/)

---

**Happy coding! =�**

Remember: The goal is not just to migrate the code, but to understand the benefits and trade-offs of the new caching system. Take time to experiment and observe the behavior changes!

## 🚀 Additional Challenges for Early Finishers

### Challenge 1: Migrate the Homepage
The homepage (`/`) is currently using `force-static` with helper functions. Your tasks:
1. Identify why the current implementation is suboptimal
2. Migrate from `force-static` and `revalidate` to the new caching approach
3. Use `"use cache"` for the helper functions
4. Implement proper cache profiles for different data types
5. Test that the page still generates statically at build time

**Hint:** Static generation works differently with `"use cache"` - the functions are still cached but can be more granular!

### Challenge 2: Implement Individual Blog Post Pages
Create `/blog/[slug]/page.tsx` with:
1. Dynamic routing for individual posts
2. Use `generateStaticParams` for static generation
3. Implement ISR with the new caching system
4. Add related posts section using cached data

## 🎯 Stretch Goals (Advanced)

### Stretch Goal 1: Dynamic Footer with Connection API
**Objective:** Add a footer that shows the current server time using the `connection` function.

The `connection` function allows you to access request-specific information and opt out of static rendering. This is useful for displaying dynamic content like the current time.

1. **Read the documentation:** [connection function](https://nextjs.org/docs/app/api-reference/functions/connection)

2. **Create a footer component** that displays the current server time:

```typescript
// app/components/DynamicFooter.tsx
import { connection } from 'next/server';

export async function DynamicFooter() {
  // Using connection opts this component out of static rendering
  await connection();
  
  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
  
  return (
    <footer className="text-center text-sm text-gray-500 py-4 border-t">
      <p>Server time: {currentTime}</p>
      <p>© 2025 Next16 Workshop Blog</p>
    </footer>
  );
}
```

3. **Understand the implications:**
   - Using `connection()` makes the component dynamic
   - The component will run on every request
   - This opts out of static generation for pages using this component
   - Consider using Suspense boundaries to keep other parts static

4. **Advanced:** Use PPR to keep the rest of the page static:
```tsx
// In your layout or page
<Suspense fallback={<StaticFooter />}>
  <DynamicFooter />
</Suspense>
```

**⚠️ Important:** The `connection` function is powerful but should be used sparingly. It opts components out of static rendering, which can impact performance. Always consider if you truly need request-time data.

### Stretch Goal 2: Implement Real-time View Counter
Using the `connection` function and cookies:
1. Track page views per session
2. Display view count that updates on each visit
3. Use cookies to prevent duplicate counts
4. Store view counts in a simple in-memory cache

Example starter code:
```typescript
import { connection } from 'next/server';
import { cookies } from 'next/headers';

const viewCounts = new Map<string, number>();

export async function ViewCounter({ postId }: { postId: string }) {
  await connection();
  const cookieStore = await cookies();
  
  const viewKey = `viewed-${postId}`;
  const hasViewed = cookieStore.has(viewKey);
  
  if (!hasViewed) {
    const currentViews = viewCounts.get(postId) || 0;
    viewCounts.set(postId, currentViews + 1);
    cookieStore.set(viewKey, 'true', { maxAge: 60 * 60 * 24 }); // 24 hours
  }
  
  return <span>Views: {viewCounts.get(postId) || 0}</span>;
}
```

### Stretch Goal 3: Add User Preference Persistence
Use `connection` and cookies to remember user preferences:
1. Theme preference (light/dark mode)
2. Preferred category filter
3. Reading list (saved posts)
4. Font size preference

### Stretch Goal 4: Implement Request-based A/B Testing
Use `connection` to implement A/B testing:
1. Create two versions of the homepage hero section
2. Use headers or cookies to assign variants
3. Track which version leads to more blog post clicks
4. Keep the rest of the app static using PPR

### Stretch Goal 5: Add Geolocation-based Content
Using `connection` to access headers:
1. Detect user's approximate location from headers
2. Show region-specific content or recommendations
3. Display content in the user's timezone
4. Show location-relevant categories first