import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    plan: v.union(v.literal("FREE"), v.literal("PRO"), v.literal("BUSINESS")),
    stripeCustomerId: v.optional(v.string()),
    postsThisMonth: v.number(),
    usageResetDate: v.number(), // timestamp
    telegramChatId: v.optional(v.string()),
    telegramEnabled: v.boolean(),
    telegramLinkedAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_telegramChatId", ["telegramChatId"]),

  brands: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    initials: v.string(),
    voice: v.string(),
    topics: v.array(v.string()),
  }).index("by_userId", ["userId"]),

  posts: defineTable({
    userId: v.id("users"),
    brandId: v.id("brands"),
    content: v.string(),
    platform: v.union(
      v.literal("INSTAGRAM"),
      v.literal("TWITTER"),
      v.literal("LINKEDIN"),
      v.literal("TIKTOK"),
      v.literal("FACEBOOK")
    ),
    imageUrl: v.optional(v.string()),
    voiceUrl: v.optional(v.string()),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("SCHEDULED"),
      v.literal("PUBLISHED")
    ),
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    aiGenerated: v.boolean(),
    aiModel: v.optional(v.string()),
    telegramSent: v.boolean(),
    telegramSentAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_brandId", ["brandId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_status_scheduledFor", ["status", "scheduledFor"]),

  emailCaptures: defineTable({
    email: v.string(),
    marketingConsent: v.boolean(),
    source: v.optional(v.string()),
    planInterest: v.optional(v.string()),
    capturedAt: v.number(),
  }).index("by_email", ["email"]),
});
