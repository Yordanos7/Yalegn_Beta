"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Package,
  Eye,
  Filter,
  Download,
  Search,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { OrderStatus } from "@my-better-t-app/db/prisma/generated/enums";
import { toast } from "sonner";

const AdminOrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: orders,
    isPending,
    error,
    refetch,
  } = trpc.order.getOrdersForAdmin.useQuery({
    page: currentPage,
    limit: 20,
    search: searchQuery,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const updateOrderStatusMutation =
    trpc.order.updateOrderStatusByAdmin.useMutation();

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status });
      toast.success(`Order status updated successfully`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to update order: ${err.message}`);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case OrderStatus.PAYMENT_RECEIVED:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case OrderStatus.DELIVERY_PENDING:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case OrderStatus.DELIVERED:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case OrderStatus.COMPLETED:
        return "bg-green-100 text-green-800 border-green-200";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING_PAYMENT:
        return <Clock className="h-4 w-4" />;
      case OrderStatus.PAYMENT_RECEIVED:
        return <CheckCircle className="h-4 w-4" />;
      case OrderStatus.DELIVERY_PENDING:
        return <Truck className="h-4 w-4" />;
      case OrderStatus.DELIVERED:
        return <Package className="h-4 w-4" />;
      case OrderStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" as="/admin">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage all marketplace orders
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, buyer, seller, or listing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={OrderStatus.PENDING_PAYMENT}>
                  Pending Payment
                </SelectItem>
                <SelectItem value={OrderStatus.PAYMENT_RECEIVED}>
                  Payment Received
                </SelectItem>
                <SelectItem value={OrderStatus.DELIVERY_PENDING}>
                  Delivery Pending
                </SelectItem>
                <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders ({orders?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading orders: {error.message}
            </div>
          ) : orders && orders.orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/marketplace/${order.listing.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          <div className="flex items-center gap-2">
                            {order.listing.images?.[0] && (
                              <img
                                src={order.listing.images[0]}
                                alt=""
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="truncate max-w-32">
                              {order.listing.title}
                            </span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={order.buyer.image} />
                            <AvatarFallback>
                              {order.buyer.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-24">
                            {order.buyer.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={order.seller.image} />
                            <AvatarFallback>
                              {order.seller.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-24">
                            {order.seller.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.currency} {order.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(
                            order.orderStatus
                          )} flex items-center gap-1 w-fit`}
                        >
                          {getStatusIcon(order.orderStatus)}
                          {order.orderStatus.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/orders/${order.id}` as any}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {order.orderStatus ===
                            OrderStatus.PENDING_PAYMENT && (
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
                              <CheckCircle className="h-4 w-4" />
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
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {orders && orders.total > 20 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {Math.ceil(orders.total / 20)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(orders.total / 20)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
