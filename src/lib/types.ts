// StoicBare — shared Firestore types. See DATABASE.md for the full schema.
// Timestamps are `number` (ms since epoch) in app code; Firestore converters
// translate to/from Firestore Timestamp. `createdAt` etc. are numbers everywhere.

export type DocStatus = "published" | "draft" | "pending" | "archived";
export type LikeTargetType = "quote" | "blog" | "author" | "comment";
export type UserRole = "reader" | "contributor" | "moderator" | "admin";

export type AuthorDoc = {
  id: string;
  slug: string;
  name: string;
  epithet: string;
  lifespan: string;
  bio: string;
  era: string | null;
  born: string | null;
  died: string | null;
  imageUrl: string | null;
  quoteCount: number;
  likeCount: number;
  viewCount: number;
  featured: boolean;
  status: "published" | "draft";
  searchKeywords: string[];
  createdAt: number;
  updatedAt: number;
};

export type QuoteDoc = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  topics: string[];
  source: string;
  sourceUrl: string | null;
  language: string;
  status: "published" | "draft" | "pending";
  likeCount: number;
  favoriteCount: number;
  viewCount: number;
  shareCount: number;
  copyCount: number;
  featured: boolean;
  createdBy: string | null;
  searchKeywords: string[];
  createdAt: number;
  updatedAt: number;
};

export type TopicDoc = {
  slug: string;
  name: string;
  description: string;
  quoteCount: number;
  likeCount: number;
  imageUrl: string | null;
  featured: boolean;
  createdAt: number;
};

export type BlogDoc = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  coverImageUrl: string | null;
  authorId: string;
  authorName: string;
  tags: string[];
  topics: string[];
  status: "draft" | "published" | "archived";
  likeCount: number;
  viewCount: number;
  commentCount: number;
  readMinutes: number;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type BlogCommentDoc = {
  id: string;
  blogId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  text: string;
  likeCount: number;
  status: "published" | "flagged" | "hidden";
  createdAt: number;
};

export type UserDoc = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  role: UserRole;
  provider: string;
  isBanned: boolean;
  stats: {
    likesGiven: number;
    favoritesCount: number;
    contributionsCount: number;
    commentsCount: number;
  };
  preferences: { newsletter: boolean; theme: string };
  createdAt: number;
  lastLoginAt: number;
};

export type LikeDoc = {
  id: string; // `${uid}_${targetType}_${targetId}`
  userId: string;
  targetType: LikeTargetType;
  targetId: string;
  createdAt: number;
};

export type FavoriteDoc = {
  id: string; // `${uid}_${quoteId}`
  userId: string;
  quoteId: string;
  createdAt: number;
};

export type UserCollection = {
  id: string;
  userId: string;
  name: string;
  description: string;
  quoteIds: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SubmissionDoc = {
  id: string;
  type: "quote" | "correction" | "blog";
  submittedBy: string;
  submittedByName: string;
  status: "pending" | "approved" | "rejected";
  payload: Record<string, unknown>;
  reviewNote: string | null;
  createdAt: number;
  reviewedAt: number | null;
  reviewedBy: string | null;
};

export function searchKeywords(...parts: string[]): string[] {
  const tokens = parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
  return [...new Set(tokens)];
}
