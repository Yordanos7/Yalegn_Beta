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
  const router = useRouter();
  const { session } = useSession();

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          <h1 className="text-3xl font-bold mb-6">Cart</h1>

          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <Card key={item.id} className="flex items-center p-4 shadow-sm">
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
