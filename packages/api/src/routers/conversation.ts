import { includes, z } from "zod";
import { router, publicProcedure, protectedProcedure, t } from "..";
import { partial } from "zod/mini";
import { TRPCError } from "@trpc/server";
import type { AppRouter } from "../routers"; // Corrected import path

export const conversationRouter: AppRouter["conversation"] = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }
    return ctx.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // here it is limit the message to 1  but can be change
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),
  get: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.userId;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }
      const conversation = await ctx.prisma.conversation.findUnique({
        where: {
          id: input.conversationId,
          participants: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          messages: {
            // Assuming 'messages' is the correct relation name, not 'message'
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
      if (!conversation) {
        throw new Error("Conversation not found or access denied");
      }
      return conversation;
    }),
  create: protectedProcedure
    .input(
      z.object({
        participantIds: z.array(z.string()).min(1),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.userId;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }
      const allParticipantIds = [...new Set([...input.participantIds, userId])];
      const existingConversation = await ctx.prisma.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                every: {
                  id: { in: allParticipantIds },
                },
              },
            },
            {
              participants: {
                some: {
                  id: { in: allParticipantIds },
                },
              },
            },
          ],
        },
        include: {
          participants: {
            select: {
              id: true,
            },
          },
        },
      });
      if (
        existingConversation &&
        existingConversation.participants.length === allParticipantIds.length
      ) {
        return existingConversation;
      }
      return ctx.prisma.conversation.create({
        data: {
          title: input.title,
          participants: {
            connect: allParticipantIds.map((id) => ({ id })),
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),
});
