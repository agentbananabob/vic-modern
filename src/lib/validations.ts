import { z } from "zod";

export const signUpSchema = z.object({
  email:    z.string().email("Invalid email"),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only"),
  password: z.string().min(8, "At least 8 characters"),
  name:     z.string().min(1).max(60).optional(),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const ideaSchema = z.object({
  title:       z.string().min(5).max(120),
  ticker:      z.string().min(1).max(10).toUpperCase(),
  exchange:    z.string().max(20).optional(),
  thesis:      z.string().min(100, "Thesis must be at least 100 characters"),
  catalysts:   z.string().optional(),
  risks:       z.string().optional(),
  targetPrice: z.number().positive().optional(),
  entryPrice:  z.number().positive().optional(),
  timeframe:   z.string().max(50).optional(),
  side:        z.enum(["LONG", "SHORT"]),
});

export const commentSchema = z.object({
  body:     z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

export const voteSchema = z.object({
  value: z.number().int().min(-1).max(1),
});

export type SignUpInput  = z.infer<typeof signUpSchema>;
export type LoginInput   = z.infer<typeof loginSchema>;
export type IdeaInput    = z.infer<typeof ideaSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type VoteInput    = z.infer<typeof voteSchema>;
