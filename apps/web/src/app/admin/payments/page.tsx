"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@my-better-t-app/db/prisma/generated/enums";
import Link from "next/link";
import { CheckCircle, XCircle, Eye, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminPaymentsPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const {
    data: orders,
    isPending,
    error,
    refetch,
  } = trpc.order.getOrdersForAdmin.useQuery(); // Assuming a new tRPC procedure for admin

  const updateOrderStatusMutation =
    trpc.order.updateOrderStatusByAdmin.useMutation();

  useEffect(() => {
    // Temporarily disable admin check for development
    // if (isLoading) return;
    // if (!session || session.user.role !== "ADMIN") {
    //   router.push("/login"); // Redirect non-admins
    // }
  }, [session, isLoading, router]);

  // Temporarily disable loading state for development
  // if (isLoading || !session || session.user.role !== "ADMIN") {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       Loading admin panel...
  //     </div>
  //   );
  // }

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status });
      toast.success(`Order ${orderId} status updated to ${status}`);
      refetch(); // Refresh orders
    } catch (err: any) {
      console.error("Error updating order status:", err);
      toast.error(
        `Failed to update order status: ${err.message || "Unknown error"}`
      );
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Admin Payment Approvals
          </CardTitle>
          <CardDescription>
            Manage and approve payments between buyers and sellers.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Pending Orders for Review</CardTitle>
          <CardDescription>
            Orders requiring admin action for payment approval or delivery
            confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <p>Loading orders...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error.message}</p>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Details</TableHead>
                  <TableHead>Delivery Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <Link
                        href={`/marketplace/${order.listing.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.listing.title}
                      </Link>
                    </TableCell>
                    <TableCell>{order.buyer.name}</TableCell>
                    <TableCell>{order.seller.name}</TableCell>
                    <TableCell>
                      {order.currency} {order.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`
                          ${
                            order.orderStatus === OrderStatus.PENDING_PAYMENT &&
                            "bg-orange-100 text-orange-800"
                          }
                          ${
                            order.orderStatus ===
                              OrderStatus.PAYMENT_RECEIVED &&
                            "bg-yellow-100 text-yellow-800"
                          }
                          ${
                            order.orderStatus ===
                              OrderStatus.DELIVERY_PENDING &&
                            "bg-blue-100 text-blue-800"
                          }
                          ${
                            order.orderStatus === OrderStatus.DELIVERED &&
                            "bg-purple-100 text-purple-800"
                          }
                          ${
                            order.orderStatus === OrderStatus.COMPLETED &&
                            "bg-green-100 text-green-800"
                          }
                          ${
                            order.orderStatus === OrderStatus.CANCELLED &&
                            "bg-red-100 text-red-800"
                          }
                        `}
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.paymentDetails ? (
                        <div className="text-sm">
                          <p>Acc: {order.paymentDetails.accountNumber}</p>
                          <p>Owner: {order.paymentDetails.accountOwner}</p>
                          <p>Bank: {order.paymentDetails.selectedBank}</p>
                          {order.paymentDetails.paymentSenderLink && (
                            <a
                              href={order.paymentDetails.paymentSenderLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              View Link <Eye className="ml-1 h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {order.deliveryProofUrl ? (
                        <a
                          href={order.deliveryProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          View Proof <Eye className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        {order.orderStatus === OrderStatus.PENDING_PAYMENT && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                OrderStatus.PAYMENT_RECEIVED
                              )
                            }
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            Payment
                          </Button>
                        )}
                        {order.orderStatus === OrderStatus.PAYMENT_RECEIVED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                OrderStatus.DELIVERY_PENDING
                              )
                            }
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <DollarSign className="mr-2 h-4 w-4" /> Release
                            Funds
                          </Button>
                        )}
                        {order.orderStatus === OrderStatus.DELIVERED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                OrderStatus.COMPLETED
                              )
                            }
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as
                            Completed
                          </Button>
                        )}
                        {(order.orderStatus === OrderStatus.PENDING_PAYMENT ||
                          order.orderStatus === OrderStatus.PAYMENT_RECEIVED ||
                          order.orderStatus ===
                            OrderStatus.DELIVERY_PENDING) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                OrderStatus.CANCELLED
                              )
                            }
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No pending orders for review.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
