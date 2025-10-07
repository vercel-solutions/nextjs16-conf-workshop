"use client";

import Link from "next/link";

import {Category} from "@/api";

export default function CategoryFilter({
  categories,
  selectedCategory,
}: {
  categories: Category[];
  selectedCategory?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          !selectedCategory
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
        href="/blog"
      >
        All Posts
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedCategory === category.slug
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          href={`/blog?category=${category.slug}`}
        >
          {category.name}
          <span className="ml-1 opacity-70">({category.postCount})</span>
        </Link>
      ))}
    </div>
  );
}
