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
- `unstable_cache` for caching static data used in dynamic pages
- `export const dynamic = 'force-dynamic'` for the blog page
- `export const dynamic = 'force-static'` for the homepage
- Mocked data with simulated API delays

Check the console to see API calls being logged.

## Migration Tasks

### Task 1: Enable Next.js 16 Features

Update to Next.js 16 and enable new caching features.

1. Update `package.json`:
```json
"next": "^16.0.0"
```

2. Configure `next.config.ts`:
```typescript
const nextConfig = {
  cacheComponents: true,
};
```

3. Run `pnpm install`

### Task 2: Home page

Migrate home page to use [`"use cache"`](https://nextjs.org/docs/app/api-reference/directives/use-cache) directive. Remember to keep the original [revalidation time](https://nextjs.org/docs/app/api-reference/functions/cacheLife) of 60 seconds.

### Task 3: Blog page

Migrate the blog page to use `"use cache"`. Currently the entire page is dynamic because results are dynamic. Find a way of making the categories and layout static while keeping the posts dynamic.

### Task 4: Blog post page

Create a fully static blog post page that uses [`cacheTag`](https://nextjs.org/docs/app/api-reference/functions/cacheTag) to set a tag with the blog post id.

### Task 5: Revalidate the cache

Create a secured route to revalidate the cache of at least the blog post page. Use [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag).

### Task 6: Add a dynamic featured posts section to blog post page

Add a dynamic section to the end of the blog post page to show the featured posts.

## Bonus Tasks

- Show the active category in the `category-filter` component.
- Create a custom cache profile in `next.config.ts` and use it.
- Deploy the application and verify everything works.

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- ["use cache" Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheLife Function](https://nextjs.org/docs/app/api-reference/functions/cacheLife)
- [cacheTag Function](https://nextjs.org/docs/app/api-reference/functions/cacheTag)

---

**Happy coding!** 🚀
