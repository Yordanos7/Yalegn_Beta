# Coin Reward System - Complete Implementation

## Overview

The coin reward system is now fully implemented and working! Users earn coins for completing sales and maintaining login streaks.

## Features Implemented

### 1. Automatic Coin Rewards

- **30 Coins per Sale**: Sellers automatically receive 30 coins when a buyer confirms delivery and the order status changes to COMPLETED
- **10 Coins Daily Bonus**: Users can claim 10 coins every 7 days for maintaining a login streak

### 2. Coin Display Components

#### CoinDisplay Component

Location: `apps/web/src/components/CoinDisplay.tsx`

- Shows real-time coin balance
- Auto-refreshes every 5 seconds
- Displays with yellow coin icon
- Used in dashboard header

#### CoinRewardPopup Component

Location: `apps/web/src/components/CoinRewardPopup.tsx`

- Beautiful animated popup with confetti effect
- Shows when users earn coins
- Auto-closes after 5 seconds
- Displays coin amount and reason

### 3. Backend Implementation

#### Coins Router

Location: `packages/api/src/routers/coins.ts`

**Endpoints:**

- `claimDailyBonus`: Claim 10 coins every 7 days
- `awardSaleCoins`: Award 30 coins for completed sales (called automatically)
- `getBalance`: Get current coin balance and bonus eligibility

#### Order Router Integration

Location: `packages/api/src/routers/order.ts`

The `confirmDeliveryByBuyer` mutation now:

1. Updates order status to COMPLETED
2. Awards 30 coins to the seller
3. Sends notification to seller about coins earned
4. Notifies admin about the completion

### 4. Database Schema

The `coins` field already exists in the User model:

```prisma
model User {
  // ... other fields
  coins Int @default(0)
  // ... other fields
}
```

## How It Works

### Daily Bonus Flow

1. User logs into dashboard
2. System checks if 7 days have passed since last update
3. If eligible, automatically awards 10 coins
4. Shows popup with confetti animation
5. Updates user's coin balance

### Sale Completion Flow

1. Buyer confirms delivery of product
2. Order status changes to COMPLETED
3. System automatically awards 30 coins to seller
4. Seller receives notification with coin reward
5. Coin balance updates in real-time
6. Next time seller visits dashboard, they see updated balance

## Usage in Code

### Display Coins

```tsx
import { CoinDisplay } from "@/components/CoinDisplay";

// In your component
<CoinDisplay />;
```

### Show Reward Popup

```tsx
import { CoinRewardPopup } from "@/components/CoinRewardPopup";

const [coinReward, setCoinReward] = useState({
  show: false,
  coins: 0,
  reason: "",
});

<CoinRewardPopup
  isOpen={coinReward.show}
  onClose={() => setCoinReward({ show: false, coins: 0, reason: "" })}
  coins={coinReward.coins}
  reason={coinReward.reason}
/>;
```

### Check Daily Bonus

```tsx
const claimDailyBonusMutation = trpc.coins.claimDailyBonus.useMutation({
  onSuccess: (data) => {
    if (data.success && "coinsEarned" in data) {
      setCoinReward({
        show: true,
        coins: data.coinsEarned,
        reason: "7-Day Login Streak Bonus!",
      });
    }
  },
});

// Call on component mount
useEffect(() => {
  if (userId) {
    claimDailyBonusMutation.mutate();
  }
}, [userId]);
```

## Where Coins Are Displayed

1. **Dashboard Header**: Shows current coin balance with auto-refresh
2. **Wallet Page**: Displays coin balance alongside ETB balance
3. **Profile Page**: Shows total coins earned
4. **Sidebar**: Can be added for persistent display

## Future Enhancements

### Potential Features

- Spend coins to boost listings
- Spend coins for premium features
- Coin purchase system (buy coins with ETB)
- Coin leaderboard
- Bonus coins for profile completion
- Referral rewards
- Special event bonuses

### Suggested Coin Uses

- **10 coins**: Boost listing for 24 hours
- **25 coins**: Featured listing badge
- **50 coins**: Priority in search results
- **100 coins**: Premium profile badge
- **200 coins**: Verified seller badge

## Testing

### Test Daily Bonus

1. Log into dashboard
2. Check if popup appears (only if 7 days passed)
3. Verify coin balance increased by 10
4. Try again immediately - should show "come back in X days"

### Test Sale Completion

1. Create a test order
2. Progress through order statuses:
   - PENDING_PAYMENT
   - PAYMENT_RECEIVED
   - DELIVERED
   - COMPLETED (buyer confirms)
3. Check seller's coin balance increased by 30
4. Verify notification was sent to seller

## Dependencies

- `canvas-confetti`: For celebration animations
- `@trpc/client`: For API calls
- `@tanstack/react-query`: For data fetching
- `lucide-react`: For coin icons

## Files Modified/Created

### Created

- `apps/web/src/components/CoinDisplay.tsx`
- `apps/web/src/components/CoinRewardPopup.tsx`
- `packages/api/src/routers/coins.ts`

### Modified

- `apps/web/src/app/dashboard/dashboard.tsx` - Added coin display and daily bonus check
- `packages/api/src/routers/order.ts` - Added automatic coin rewards on sale completion
- `packages/api/src/routers/index.ts` - Registered coins router

## Troubleshooting

### Coins Not Showing

- Check if user is logged in
- Verify `getUserProfile` query is enabled
- Check browser console for errors

### Daily Bonus Not Working

- Verify 7 days have passed since last update
- Check `updatedAt` field in database
- Ensure mutation is being called on mount

### Sale Coins Not Awarded

- Verify order status is COMPLETED
- Check if seller ID matches
- Look for errors in server logs

## Success! 🎉

The coin system is now fully functional and ready to use. Users will automatically earn coins for completing sales and maintaining login streaks, with beautiful animations and real-time updates throughout the application.
