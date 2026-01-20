import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Get Telegram connection status
export const getStatus = query({
  args: {
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (!user) {
      return null;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    return {
      configured: !!botToken,
      connected: !!user.telegramChatId,
      enabled: user.telegramEnabled,
      linkedAt: user.telegramLinkedAt,
    };
  },
});

// Generate connect link
export const connect = action({
  args: {
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error("Telegram is not configured");
    }

    // Get bot info
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`
    );
    const data = (await response.json()) as {
      ok: boolean;
      result?: { username: string; first_name: string };
    };

    if (!data.ok || !data.result) {
      throw new Error("Failed to get bot info");
    }

    // Generate a secure link token (base64 encoded user ID with timestamp)
    const payload = `${userClerkId}:${Date.now()}`;
    const token = Buffer.from(payload).toString("base64url");

    // Build the Telegram deep link
    const connectLink = `https://t.me/${data.result.username}?start=${token}`;

    return {
      connectLink,
      botUsername: data.result.username,
      expiresIn: "24 hours",
    };
  },
});

// Disconnect Telegram
export const disconnect = mutation({
  args: {
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      telegramChatId: undefined,
      telegramEnabled: false,
      telegramLinkedAt: undefined,
    });

    return { success: true };
  },
});

// Internal: Disconnect by telegram chat ID (from webhook)
export const disconnectByWebhook = internalMutation({
  args: { telegramChatId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_telegramChatId", (q) =>
        q.eq("telegramChatId", args.telegramChatId)
      )
      .unique();

    if (!user) {
      return { success: false };
    }

    await ctx.db.patch(user._id, {
      telegramChatId: undefined,
      telegramEnabled: false,
      telegramLinkedAt: undefined,
    });

    return { success: true };
  },
});

// Toggle Telegram notifications
export const toggle = mutation({
  args: {
    enabled: v.boolean(),
    clerkId: v.optional(v.string()), // Fallback for auth
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userClerkId = identity?.subject || args.clerkId;

    if (!userClerkId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userClerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.telegramChatId) {
      throw new Error("Telegram not connected");
    }

    await ctx.db.patch(user._id, {
      telegramEnabled: args.enabled,
    });

    return { success: true, enabled: args.enabled };
  },
});

// Internal: Link Telegram account (from webhook /start command)
export const linkAccount = internalMutation({
  args: {
    clerkId: v.string(),
    telegramChatId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Check if this chat ID is already linked to another user
    const existingLink = await ctx.db
      .query("users")
      .withIndex("by_telegramChatId", (q) =>
        q.eq("telegramChatId", args.telegramChatId)
      )
      .unique();

    if (existingLink && existingLink._id !== user._id) {
      // Unlink from previous user
      await ctx.db.patch(existingLink._id, {
        telegramChatId: undefined,
        telegramEnabled: false,
        telegramLinkedAt: undefined,
      });
    }

    // Link to new user
    await ctx.db.patch(user._id, {
      telegramChatId: args.telegramChatId,
      telegramEnabled: true,
      telegramLinkedAt: Date.now(),
    });

    return { success: true };
  },
});

// Send post to Telegram (action for external API call)
export const sendPost = action({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error("Telegram is not configured");
    }

    // Get user
    const user = await ctx.runQuery(api.users.getMe);
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's telegram info from database
    const fullUser = await ctx.runQuery(internal.internal.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!fullUser?.telegramChatId || !fullUser?.telegramEnabled) {
      throw new Error("Telegram not enabled");
    }

    // Get post
    const post = await ctx.runQuery(api.posts.getById, { id: args.postId });
    if (!post) {
      throw new Error("Post not found");
    }

    // Format message
    const message = `
📱 *${post.platform}* | ${post.brand?.name || "Unknown Brand"}

${escapeMarkdown(post.content)}

━━━━━━━━━━━━━━━━━━━━
✨ Ready to post! Copy the text above.
`.trim();

    // Send message
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: fullUser.telegramChatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const data = (await response.json()) as {
      ok: boolean;
      description?: string;
    };

    if (!data.ok) {
      throw new Error(data.description || "Failed to send message");
    }

    return { success: true };
  },
});

// Helper to escape Markdown special characters
function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}
