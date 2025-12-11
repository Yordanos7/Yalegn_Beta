"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

interface CartBadgeProps {
  variant?: "ghost" | "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

const CartBadge = ({
  variant = "ghost",
  size = "icon",
  className = "",
  showLabel = false,
}: CartBadgeProps) => {
  const { cartItems } = useCart();

  // Calculate total items in cart
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (showLabel) {
    return (
      <Link
        href="/cart"
        className={`flex items-center text-foreground hover:text-primary transition-colors font-medium py-2 relative ${className}`}
      >
        <div className="relative mr-3">
          <ShoppingCart size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] animate-pulse">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </div>
        Cart
      </Link>
    );
  }

  return (
    <Link href="/cart" className="relative">
      <Button variant={variant} size={size} className={className}>
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default CartBadge;
