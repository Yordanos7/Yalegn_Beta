import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import prisma from "@my-better-t-app/db";
import { OrderStatus } from "@my-better-t-app/db/prisma/generated/enums"; // Import OrderStatus enum

export const orderRouter = router({
  createOrder: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        quantity: z.number().min(1),
        totalPrice: z.number().min(0),
        currency: z.enum(["ETB", "USD"]),
        paymentDetails: z.object({
          accountNumber: z.string(),
          accountOwner: z.string(),
          selectedBank: z.string(),
          paymentSenderLink: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session;

      const listing = await prisma.listing.findUnique({
        where: { id: input.listingId },
        select: { providerId: true },
      });

      if (!listing) {
        throw new Error("Listing not found.");
      }

      const order = await prisma.order.create({
        data: {
          buyerId: userId,
          listingId: input.listingId,
          sellerId: listing.providerId,
          quantity: input.quantity,
          totalPrice: input.totalPrice,
          currency: input.currency,
          paymentDetails: input.paymentDetails,
          orderStatus: OrderStatus.PENDING_PAYMENT,
        },
      });

      return order;
    }),

  getOrdersForSeller: protectedProcedure
    .input(
      z.object({
        listingId: z.string().optional(), // Make listingId optional
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session;

      const orders = await prisma.order.findMany({
        where: {
          sellerId: userId,
          ...(input.listingId && { listingId: input.listingId }), // Conditionally filter by listingId
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
              currency: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true, // Include email for buyer notification
              phone: true, // Include phone for buyer notification
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Ensure paymentDetails is always an object, even if it's an empty one
      // Explicitly cast paymentDetails to the expected type for frontend consumption
      const ordersWithTypedPaymentDetails = orders.map((order) => ({
        ...order,
        paymentDetails: order.paymentDetails as {
          accountNumber: string;
          accountOwner: string;
          selectedBank: string;
          paymentSenderLink: string;
        },
      }));

      return ordersWithTypedPaymentDetails;
    }),

  getOrderById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.session;

      const order = await prisma.order.findUnique({
        where: { id: input.id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
              price: true,
              currency: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      // Ensure only buyer or seller can view the order
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new Error("Unauthorized access to order.");
      }

      return order;
    }),

  uploadDeliveryProof: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        deliveryProofUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session;

      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        select: { sellerId: true, orderStatus: true, buyerId: true }, // Include buyerId
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      if (order.sellerId !== userId) {
        throw new Error(
          "Unauthorized: Only the seller can upload delivery proof."
        );
      }

      if (
        order.orderStatus !== OrderStatus.PAYMENT_RECEIVED &&
        order.orderStatus !== OrderStatus.DELIVERY_PENDING
      ) {
        throw new Error(
          "Delivery proof can only be uploaded for orders with 'PAYMENT_RECEIVED' or 'DELIVERY_PENDING' status."
        );
      }

      const updatedOrder = await prisma.order.update({
        where: { id: input.orderId },
        data: {
          deliveryProofUrl: input.deliveryProofUrl,
          orderStatus: OrderStatus.DELIVERED, // Mark as delivered after proof upload
        },
      });

      // Notify admin about the delivery proof upload
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: "SYSTEM", // Or a more specific type like "ORDER_UPDATE"
            title: "Delivery Proof Uploaded",
            body: `Seller ${userId} uploaded delivery proof for order ${input.orderId}. Status updated to DELIVERED.`,
            payload: {
              orderId: input.orderId,
              sellerId: userId,
              deliveryProofUrl: input.deliveryProofUrl,
            },
          },
        });
      }

      // Notify the buyer about the delivery proof upload
      const buyer = await prisma.user.findUnique({
        where: { id: order.buyerId },
        select: { id: true },
      });

      if (buyer) {
        await prisma.notification.create({
          data: {
            userId: buyer.id,
            type: "SYSTEM", // Or a more specific type like "ORDER_UPDATE"
            title: "Your Order Has Been Shipped!",
            body: `Your order ${input.orderId} has been shipped by the seller. Delivery proof has been uploaded.`,
            payload: {
              orderId: input.orderId,
              sellerId: userId,
              deliveryProofUrl: input.deliveryProofUrl,
            },
          },
        });
      }

      return updatedOrder;
    }),

  updateOrderStatusByAdmin: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.nativeEnum(OrderStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.session;

      // Check if the user is an admin (assuming role is available in session or can be fetched)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Only admins can update order status.");
      }

      const updatedOrder = await prisma.order.update({
        where: { id: input.orderId },
        data: {
          orderStatus: input.status,
        },
      });

      return updatedOrder;
    }),
});
