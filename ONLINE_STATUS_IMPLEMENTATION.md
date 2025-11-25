# Online/Offline Status System - Telegram Style

## Overview

Implemented a real-time presence tracking system similar to Telegram, showing when users are online, offline, or "last seen recently".

## Features Implemented

### 1. **Online Status Hook** (`apps/web/src/hooks/use-online-status.ts`)

Automatic presence tracking that:

- **Sets user online** when they open the app
- **Updates lastSeen** every 30 seconds
- **Detects user activity** (mouse, keyboard, touch, clicks)
- **Handles page visibility** (sets offline when tab is hidden)
- **Broadcasts status** via socket events
- **Cleans up** on unmount or page close

### 2. **Status Display Component** (`apps/web/src/components/UserOnlineStatus.tsx`)

Visual indicator showing:

- **Green pulsing dot + "online"** when user is active
- **"last seen recently"** if within 5 minutes
- **"last seen X ago"** for older timestamps
- **Configurable sizes** (sm, md, lg)
- **Optional text display** (can show just the dot)
- **Real-time updates** via socket events

### 3. **Messages Page Integration** (`apps/web/src/app/messages/page.tsx`)

Enhanced with:

- **Online status in conversation list** (under each user)
- **Online status in message header** (shows current chat partner's status)
- **Real-time status updates** when users go online/offline
- **Automatic presence tracking** for current user

### 4. **Dashboard Integration** (`apps/web/src/app/dashboard/dashboard.tsx`)

- Tracks user presence while on dashboard
- Broadcasts online status to other users

### 5. **Server Socket Events** (`apps/server/src/index.ts`)

Added socket handlers for:

- `userOnline` - Broadcasts when user comes online
- `userOffline` - Broadcasts when user goes offline

## How It Works

### Presence Detection Flow

```
1. User opens app
   ↓
2. useOnlineStatus hook activates
   ↓
3. Sets isOnline=true in database
   ↓
4. Emits "userOnline" socket event
   ↓
5. Server broadcasts to all clients
   ↓
6. Other users see green "online" status
   ↓
7. Every 30s: Updates lastSeen timestamp
   ↓
8. On activity: Resets inactivity timer
   ↓
9. User closes tab/goes inactive
   ↓
10. Sets isOnline=false
    ↓
11. Emits "userOffline" with lastSeen
    ↓
12. Other users see "last seen X ago"
```

### Status Display Logic

#### Online (Green Dot + "online")

- User's `isOnline` = true
- Shows pulsing green dot
- Text: "online"

#### Recently Active (Gray Dot + "last seen recently")

- User went offline within last 5 minutes
- Shows gray dot
- Text: "last seen recently"

#### Offline (Gray Dot + "last seen X ago")

- User offline for more than 5 minutes
- Shows gray dot
- Text: "last seen 2 hours ago" (dynamic)

## Visual Examples

### Conversation List

```
┌──────────────────────────────┐
│  Conversations        [New]  │
├──────────────────────────────┤
│  ┌────┐                      │
│  │ 👤 │  John Doe            │
│  │ 🟢 │  Hey, how are you... │
│  │    │  • online            │
│  └────┘                      │
├──────────────────────────────┤
│  ┌────┐                      │
│  │ 👤 │  Jane Smith          │
│  │    │  Thanks for the...   │
│  │    │  last seen recently  │
│  └────┘                      │
├──────────────────────────────┤
│  ┌────┐                      │
│  │ 👤 │  Bob Wilson          │
│  │    │  See you tomorrow    │
│  │    │  last seen 2h ago    │
│  └────┘                      │
└──────────────────────────────┘
```

### Message Header

```
┌──────────────────────────────────┐
│  ← 👤  John Doe                  │
│        • online                  │
├──────────────────────────────────┤
│                                  │
│  Messages appear here...         │
│                                  │
└──────────────────────────────────┘
```

## Component Usage

### Basic Usage

```typescript
import { UserOnlineStatus } from "@/components/UserOnlineStatus";

<UserOnlineStatus
  userId="user-123"
  isOnline={true}
  lastSeen={new Date()}
  showText={true}
  size="md"
/>;
```

### Props

| Prop     | Type             | Default  | Description             |
| -------- | ---------------- | -------- | ----------------------- |
| userId   | string           | required | User ID to track        |
| isOnline | boolean          | false    | Current online status   |
| lastSeen | Date/string/null | null     | Last activity timestamp |
| showText | boolean          | true     | Show text label         |
| size     | "sm"/"md"/"lg"   | "md"     | Component size          |

### Hook Usage

```typescript
import { useOnlineStatus } from "@/hooks/use-online-status";

function MyComponent() {
  const userId = session?.user?.id;

  // Automatically tracks presence
  useOnlineStatus(userId);

  return <div>Your component</div>;
}
```

## Activity Detection

The system tracks these user activities:

- **Mouse movement** - Any mouse motion
- **Keyboard input** - Any key press
- **Touch events** - Mobile touch interactions
- **Clicks** - Any click events
- **Page visibility** - Tab focus/blur

### Inactivity Handling

- User is marked offline after 5 minutes of no activity
- lastSeen is updated to the last activity timestamp
- Status automatically updates when user returns

## Socket Events

### Client → Server

```typescript
// User comes online
socket.emit("userOnline", userId);

// User goes offline
socket.emit("userOffline", {
  userId: "user-123",
  lastSeen: new Date(),
});
```

### Server → Clients

```typescript
// Broadcast to all clients
socket.on("userOnline", (userId) => {
  // Update UI to show user online
});

socket.on("userOffline", (data) => {
  // Update UI to show last seen
});
```

## Database Schema

Uses existing User model fields:

```prisma
model User {
  id        String    @id
  isOnline  Boolean   @default(false)
  lastSeen  DateTime?
  // ... other fields
}
```

## Performance Optimizations

1. **Throttled Updates**: lastSeen updates every 30s, not on every activity
2. **Efficient Queries**: Only updates necessary fields
3. **Socket Broadcasting**: Uses Socket.io rooms for efficient message delivery
4. **Client-side Caching**: Status cached locally, updated via socket events
5. **Cleanup**: Proper event listener cleanup prevents memory leaks

## Privacy Considerations

### Current Implementation

- All users can see each other's online status
- Last seen timestamp is visible to all

### Future Privacy Options (Optional)

```typescript
enum PrivacyLevel {
  EVERYONE, // Show to all users
  CONTACTS, // Show only to contacts
  NOBODY, // Hide status completely
}
```

## Testing Checklist

- [ ] Open app in two browsers with different users
- [ ] Verify User A sees User B as online
- [ ] Close User B's tab
- [ ] Verify User A sees "last seen recently"
- [ ] Wait 5+ minutes
- [ ] Verify User A sees "last seen X ago"
- [ ] User B returns
- [ ] Verify User A sees "online" immediately
- [ ] Test with tab switching (visibility API)
- [ ] Test with mobile touch events
- [ ] Test with multiple conversations
- [ ] Verify status updates in real-time

## Comparison with Telegram

| Feature              | Telegram        | Our Implementation   |
| -------------------- | --------------- | -------------------- |
| Online indicator     | ✅ Green dot    | ✅ Green pulsing dot |
| "last seen recently" | ✅ Within 5 min | ✅ Within 5 min      |
| "last seen X ago"    | ✅ Dynamic      | ✅ Dynamic           |
| Real-time updates    | ✅ Instant      | ✅ Socket.io         |
| Activity detection   | ✅ Yes          | ✅ Yes               |
| Privacy settings     | ✅ Yes          | ❌ Future feature    |
| Typing indicator     | ✅ Yes          | ❌ Future feature    |

## Files Created/Modified

**New Files:**

1. `apps/web/src/hooks/use-online-status.ts` - Presence tracking hook
2. `apps/web/src/components/UserOnlineStatus.tsx` - Status display component

**Modified Files:**

1. `apps/web/src/app/messages/page.tsx` - Added status indicators
2. `apps/web/src/app/dashboard/dashboard.tsx` - Added presence tracking
3. `apps/server/src/index.ts` - Added socket event handlers
4. `packages/api/src/routers/user.ts` - Already had updateUserStatus

## Future Enhancements

1. **Typing Indicator**: Show "typing..." when user is composing
2. **Privacy Settings**: Let users control who sees their status
3. **Custom Status**: Allow users to set custom status messages
4. **Do Not Disturb**: Mute notifications and hide online status
5. **Last Seen Precision**: "last seen at 2:30 PM" for recent activity
6. **Online Count**: Show "X users online" in groups
