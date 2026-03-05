export type Role = "GUEST" | "MEMBER" | "ANALYST" | "ADMIN";
export type IdeaSide = "LONG" | "SHORT";
export type IdeaStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: Role;
  reputation: number;
  createdAt: Date;
}

export interface Idea {
  id: string;
  title: string;
  ticker: string;
  exchange: string | null;
  thesis: string;
  catalysts: string | null;
  risks: string | null;
  targetPrice: number | null;
  entryPrice: number | null;
  timeframe: string | null;
  side: IdeaSide;
  status: IdeaStatus;
  score: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: Pick<User, "id" | "username" | "name" | "avatarUrl" | "reputation">;
  _count?: { votes: number; comments: number };
  userVote?: number | null; // +1, -1, or null
  isWatched?: boolean;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  ideaId: string;
  parentId: string | null;
  user: Pick<User, "id" | "username" | "name" | "avatarUrl">;
  replies?: Comment[];
}

export interface WatchlistEntry {
  id: string;
  note: string | null;
  addedAt: Date;
  idea: Idea;
}

// API response shapes
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form input types
export interface IdeaFormInput {
  title: string;
  ticker: string;
  exchange?: string;
  thesis: string;
  catalysts?: string;
  risks?: string;
  targetPrice?: number;
  entryPrice?: number;
  timeframe?: string;
  side: IdeaSide;
}
