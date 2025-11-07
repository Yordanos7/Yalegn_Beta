"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart,
  Search,
  User,
  Star,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Banknote,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/context/CartContext"; // Import useCart
import { trpc } from "@/utils/trpc"; // Import trpc
import { useRouter } from "next/navigation"; // Import useRouter
import { useSession } from "@/hooks/use-session"; // Import useSession
import { toast } from "sonner"; // Import toast
import {
  OrderStatus,
  Currency,
} from "@my-better-t-app/db/prisma/generated/enums"; // Import OrderStatus and Currency enum
import { CheckCircle } from "lucide-react"; // Import CheckCircle icon
import { ReviewForm } from "@/components/review-form"; // Import ReviewForm

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart(); // Use cart context
  const [discountCode, setDiscountCode] = useState("");
  const [saveForLater, setSaveForLater] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountOwner, setAccountOwner] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [paymentSenderLink, setPaymentSenderLink] = useState(""); // New state for payment sender link
  const [timeLeft, setTimeLeft] = useState(3 * 24 * 60 * 60); // 3 days in seconds
  const createOrderMutation = trpc.order.createOrder.useMutation();
  const confirmDeliveryMutation =
    trpc.order.confirmDeliveryByBuyer.useMutation(); // New mutation
  const router = useRouter();
  const { session } = useSession();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewOrderDetails, setReviewOrderDetails] = useState<{
    orderId: string;
    listingId: string;
    sellerId: string;
  } | null>(null);

  // Fetch orders for the current buyer
  const {
    data: buyerOrders,
    isPending: isBuyerOrdersPending,
    error: buyerOrdersError,
    refetch: refetchBuyerOrders,
  } = trpc.order.getOrdersForBuyer.useQuery(
    undefined, // No input needed for getOrdersForBuyer
    {
      enabled: !!session?.user?.id, // Only run query if user is logged in
    }
  );

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Refetch buyer orders when the component mounts or session changes
  useEffect(() => {
    if (session?.user?.id) {
      refetchBuyerOrders();
    }
  }, [session?.user?.id, refetchBuyerOrders]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Contact support";
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  const handleSendPaymentData = async () => {
    // Here you would send the payment data to the admin
    console.log({
      accountNumber,
      accountOwner,
      selectedBank,
      paymentSenderLink, // Include new field
      cartItems,
      total,
    });

    if (!session?.user?.id) {
      toast.error("You must be logged in to place an order.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      // Assuming all items in the cart are from the same listing for simplicity
      // In a real app, you'd iterate or handle multiple listings per order
      const firstItem = cartItems[0];
      const order = await createOrderMutation.mutateAsync({
        listingId: firstItem.id,
        quantity: firstItem.quantity,
        totalPrice: total,
        currency: "ETB", // Assuming ETB for now, should be dynamic from listing
        paymentDetails: {
          accountNumber,
          accountOwner,
          selectedBank,
          paymentSenderLink,
        },
      });

      toast.success("Order placed successfully! Waiting for admin approval.");
      // Clear the cart after successful order creation
      clearCart();
      // Redirect to a confirmation page or dashboard
      router.push("/dashboard"); // Or a specific order confirmation page
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const handleConfirmDelivery = async (
    orderId: string,
    listingId: string,
    sellerId: string
  ) => {
    try {
      await confirmDeliveryMutation.mutateAsync({ orderId });
      toast.success("Delivery confirmed successfully!");
      refetchBuyerOrders(); // Refetch orders to update status
      setReviewOrderDetails({ orderId, listingId, sellerId });
      setShowReviewForm(true);
    } catch (err: any) {
      console.error("Error confirming delivery:", err);
      toast.error(
        `Failed to confirm delivery: ${err.message || "Unknown error"}`
      );
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setReviewOrderDetails(null);
    refetchBuyerOrders(); // Refresh orders to show review status
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setReviewOrderDetails(null);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const serviceFee = 150.0; // Example fixed service fee
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}

      {/* Main Content */}
      <main className="container mx-auto p-8 grid grid-cols-3 gap-8">
        {/* Left Column: Cart Items */}
        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-6">Your Cart & Orders</h1>

          {/* Cart Items Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Cart Items</h2>
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-gray-600">Your cart is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <Card
                    key={item.id}
                    className="flex items-center p-4 shadow-sm"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{item.name}</h2>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < Math.floor(item.rating)
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }
                            size={16}
                            fill={
                              i < Math.floor(item.rating)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        ))}
                        <span className="ml-2">{item.provider}</span>
                      </div>
                      {item.type === "service" && item.isInstant && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Instant
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mr-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <p className="text-lg font-semibold">
                      ETB {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </Card>
                ))
              )}
            </div>

            {/* Discount Code */}
            <div className="flex items-center mt-6 space-x-2">
              <Input
                type="text"
                placeholder="Enter discount code"
                className="flex-1 border-gray-300 rounded-md p-2"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <Button className="bg-[#E0B44B] hover:bg-[#D0A43B] text-white font-semibold rounded-md px-6 py-2">
                Apply
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="save-for-later"
                  checked={saveForLater}
                  onCheckedChange={setSaveForLater}
                />
                <Label htmlFor="save-for-later">Save for later</Label>
              </div>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={16} className="mr-2" />
                Continue shopping
              </Button>
            </div>
          </section>

          {/* Buyer Orders Section */}
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
            {isBuyerOrdersPending ? (
              <p className="text-gray-600">Loading your orders...</p>
            ) : buyerOrdersError ? (
              <p className="text-red-500">
                Error loading orders: {buyerOrdersError.message}
              </p>
            ) : buyerOrders && buyerOrders.length > 0 ? (
              <div className="space-y-4">
                {buyerOrders.map((order) => (
                  <Card key={order.id} className="p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            order.listing.images[0] || "/placeholder-image.jpg"
                          }
                          alt={order.listing.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-semibold text-lg">
                            {order.listing.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {order.quantity} | Total: {order.currency}{" "}
                            {order.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                            ${
                              order.orderStatus === OrderStatus.COMPLETED &&
                              "bg-green-100 text-green-800"
                            }
                            ${
                              order.orderStatus === OrderStatus.DELIVERED &&
                              "bg-blue-100 text-blue-800"
                            }
                            ${
                              order.orderStatus ===
                                OrderStatus.PAYMENT_RECEIVED &&
                              "bg-yellow-100 text-yellow-800"
                            }
                            ${
                              order.orderStatus ===
                                OrderStatus.PENDING_PAYMENT &&
                              "bg-orange-100 text-orange-800"
                            }
                            ${
                              order.orderStatus === OrderStatus.CANCELLED &&
                              "bg-red-100 text-red-800"
                            }
                          `}
                        >
                          {order.orderStatus.replace(/_/g, " ")}
                        </span>
                        {order.orderStatus === OrderStatus.DELIVERED && (
                          <Button
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              handleConfirmDelivery(
                                order.id,
                                order.listing.id,
                                order.seller.id
                              )
                            }
                            disabled={confirmDeliveryMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {confirmDeliveryMutation.isPending
                              ? "Confirming..."
                              : "Confirm Delivery"}
                          </Button>
                        )}
                        {order.orderStatus === OrderStatus.COMPLETED &&
                          reviewOrderDetails?.orderId === order.id &&
                          showReviewForm && (
                            <div className="mt-4 p-4 border rounded-md bg-gray-50">
                              <h3 className="text-lg font-semibold mb-2">
                                Rate Your Experience
                              </h3>
                              <ReviewForm
                                aboutId={reviewOrderDetails.sellerId}
                                listingId={reviewOrderDetails.listingId}
                                onReviewSubmitted={handleReviewSubmitted}
                                onCancel={handleCancelReview}
                              />
                            </div>
                          )}
                        {order.deliveryProofUrl && (
                          <a
                            href={order.deliveryProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm mt-1"
                          >
                            View Delivery Proof
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You have no past orders.</p>
            )}
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <Card className="col-span-1 p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>ETB {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>ETB {serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span>ETB {total.toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full bg-[#E0B44B] hover:bg-[#D0A43B] text-white font-semibold rounded-md py-3">
            Proceed to payment
          </Button>

          {/* Payment Details Form */}
          <div className="mt-8 p-4 border rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Banknote size={20} className="mr-2" /> Payment Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="account-owner">Account Owner</Label>
                <Input
                  id="account-owner"
                  type="text"
                  placeholder="Enter account owner name"
                  value={accountOwner}
                  onChange={(e) => setAccountOwner(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="bank-selection">Select Bank</Label>
                <Select onValueChange={setSelectedBank} value={selectedBank}>
                  <SelectTrigger id="bank-selection">
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBE">
                      Commercial Bank of Ethiopia (CBE)
                    </SelectItem>
                    <SelectItem value="Awash">Awash Bank</SelectItem>
                    <SelectItem value="Abyssinia">Bank of Abyssinia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment-sender-link">
                  Payment Sender Link / Transaction ID
                </Label>
                <Input
                  id="payment-sender-link"
                  type="text"
                  placeholder="Enter transaction ID or sender link"
                  value={paymentSenderLink}
                  onChange={(e) => setPaymentSenderLink(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-3"
                onClick={handleSendPaymentData}
                disabled={
                  !accountNumber ||
                  !accountOwner ||
                  !selectedBank ||
                  !paymentSenderLink
                }
              >
                Send Payment Data to Admin
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold text-red-500">Important:</span>{" "}
                Please keep a record of your payment documentation (e.g.,
                receipt, screenshot) for your reference. This will be crucial if
                you need to{" "}
                <Link
                  href={"/support" as any}
                  className="text-blue-600 hover:underline"
                >
                  contact support
                </Link>{" "}
                regarding your payment or delivery.
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mt-8 p-4 border rounded-md shadow-sm text-center">
            <h3 className="text-lg font-semibold mb-2">
              Payment Approval Time Left
            </h3>
            <div className="text-2xl font-bold text-[#E0B44B] mb-2">
              {formatTime(timeLeft)}
            </div>
            {timeLeft > 0 ? (
              <Progress
                value={(timeLeft / (3 * 24 * 60 * 60)) * 100}
                className="w-full"
              />
            ) : (
              <p className="text-red-500 font-semibold">
                Please contact support regarding your payment.
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
