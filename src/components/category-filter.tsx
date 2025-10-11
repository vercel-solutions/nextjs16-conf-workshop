import Link from "next/link";

import type {Category} from "@/api";

export default function CategoryFilter({categories}: {categories: Category[]}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors" href="/blog">
        All Posts ({categories.reduce((sum, cat) => sum + cat.postCount, 0)})
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          href={`/blog?category=${category.slug}`}
        >
          {category.name} ({category.postCount})
        </Link>
      ))}
    </div>
  );
}
