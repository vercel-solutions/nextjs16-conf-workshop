import {faker} from "@faker-js/faker";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

const CATEGORIES = [
  {id: "1", name: "Technology", slug: "technology", description: "Latest in tech and innovation"},
  {id: "2", name: "Design", slug: "design", description: "UI/UX and creative design"},
  {
    id: "3",
    name: "Development",
    slug: "development",
    description: "Software development and programming",
  },
  {
    id: "4",
    name: "Business",
    slug: "business",
    description: "Business strategy and entrepreneurship",
  },
  {id: "5", name: "Marketing", slug: "marketing", description: "Digital marketing and growth"},
] as const;

faker.seed(123);

async function delay(ms: number = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateBlogPost(index: number, category?: string): BlogPost {
  faker.seed(123 + index);

  const selectedCategory = category ?? faker.helpers.arrayElement(CATEGORIES).slug;
  const categoryName = CATEGORIES.find((c) => c.slug === selectedCategory)?.name ?? "Technology";

  return {
    id: faker.string.uuid(),
    title: faker.helpers.fake(`{{company.catchPhrase}} in ${categoryName}`),
    slug: faker.helpers.slugify(faker.company.catchPhrase()).toLowerCase(),
    excerpt: faker.lorem.paragraph(2),
    content: faker.lorem.paragraphs(5, "\n\n"),
    category: selectedCategory,
    author: {
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
    },
    publishedAt: faker.date.recent({days: 30}).toISOString(),
    readTime: faker.number.int({min: 3, max: 12}),
    imageUrl: faker.image.urlPicsumPhotos({width: 800, height: 400}),
  };
}

export async function getBlogPosts(category?: string): Promise<BlogPost[]> {
  console.info(
    `[API] Fetching blog posts${category ? ` for category: ${category}` : ""} (250ms delay)`,
  );

  await delay(250);

  const postCount = 12;
  const posts: BlogPost[] = [];

  for (let i = 0; i < postCount; i++) {
    posts.push(generateBlogPost(i, category));
  }

  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getCategories(): Promise<Category[]> {
  console.info("[API] Fetching categories (250ms delay)");

  await delay(250);

  return CATEGORIES.map((category) => ({
    ...category,
    postCount: faker.number.int({min: 5, max: 20}),
  }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  console.info(`[API] Fetching blog post with slug: ${slug} (250ms delay)`);

  await delay(250);

  const hashCode = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  faker.seed(hashCode);

  return generateBlogPost(hashCode);
}
