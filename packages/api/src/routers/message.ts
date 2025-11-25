// packages/api/src/routers/message.ts
import { z } from "zod";
import { protectedProcedure, publicProcedure, router, t } from "..";

export const messageRouter = router({
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const unreadCount = await ctx.prisma.message.count({
      where: {
        toUserId: userId,
        isRead: false,
      },
    });

    return { unreadCount };
  }),

  getUnreadByConversation: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const conversations = await ctx.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        messages: {
          where: {
            toUserId: userId,
            isRead: false,
          },
          select: {
            id: true,
          },
        },
      },
    });

    const unreadByConversation: Record<string, number> = {};
    conversations.forEach((conv) => {
      unreadByConversation[conv.id] = conv.messages.length;
    });

    return unreadByConversation;
  }),

  markAsRead: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.userId;
      if (!userId) {
        throw new Error("Not authenticated");
      }

      await ctx.prisma.message.updateMany({
        where: {
          conversationId: input.conversationId,
          toUserId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return { success: true };
    }),

  list: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.userId;
      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Ensure the user is a participant in the conversation
      const conversation = await ctx.prisma.conversation.findUnique({
        where: {
          id: input.conversationId,
          participants: {
            some: {
              id: userId,
            },
          },
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found or you are not a participant.");
      }

      return ctx.prisma.message.findMany({
        where: {
          conversationId: input.conversationId,
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          toUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),

  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        toUserId: z.string(),
        body: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const fromUserId = ctx.session?.userId;
      if (!fromUserId) {
        throw new Error("Not authenticated");
      }

      // Ensure both users are participants in the conversation
      const conversation = await ctx.prisma.conversation.findUnique({
        where: {
          id: input.conversationId,
          participants: {
            every: {
              id: { in: [fromUserId, input.toUserId] },
            },
          },
        },
      });

      if (!conversation) {
        console.error(
          "Conversation not found or participants are invalid for conversationId:",
          input.conversationId,
          "fromUserId:",
          fromUserId,
          "toUserId:",
          input.toUserId
        );
        throw new Error("Conversation not found or participants are invalid.");
      }

      console.log("Attempting to create message in database...");
      const message = await ctx.prisma.message.create({
        data: {
          conversationId: input.conversationId,
          fromUserId: fromUserId,
          toUserId: input.toUserId,
          body: input.body,
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          toUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      console.log("Message successfully created in database:", message);

      // Update conversation updatedAt to bring it to the top of the list
      await ctx.prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });
      console.log(
        "Conversation updatedAt updated for conversationId:",
        input.conversationId
      );

      ctx.io.to(input.conversationId).emit("newMessage", message);

      return message;
    }),
});
