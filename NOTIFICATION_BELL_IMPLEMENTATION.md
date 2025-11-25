# Notification Bell Implementation - Complete Guide

## Overview

Implemented a fully functional notification bell system with real-time updates, unread message counts, and navigation to messages page.

## Features Implemented

### 1. **Backend API Endpoints** (`packages/api/src/routers/message.ts`)

Added three new endpoints to the message router:

- **`getUnreadCount`**: Returns total unread message count for current user
- **`getUnreadByConversation`**: Returns unread count per conversation
- **`markAsRead`**: Marks all messages in a conversation as read

### 2. **Notification Bell Component** (`apps/web/src/components/NotificationBell.tsx`)

Created a new component with:

- **Green bell icon** when there are unread messages
- **Red badge** showing unread count (displays "99+" for counts over 99)
- **Click navigation** to `/messages` page
- **Real-time updates** via socket events
- **Auto-refresh** every 30 seconds

### 3. **Dashboard Integration** (`apps/web/src/app/dashboard/dashboard.tsx`)

- Replaced static Bell icon with NotificationBell component
- Cleaned up unused imports

### 4. **Messages Page Enhancement** (`apps/web/src/app/messages/page.tsx`)

Added:

- **Unread count badge** under each conversation avatar
- **Auto mark as read** when conversation is opened
- **Real-time unread count updates** via socket events
- Badge displays "99+" for counts over 99

### 5. **User Status Tracking** (`packages/api/src/routers/user.ts`)

Added `updateUserStatus` mutation to track:

- User online/offline status
- Last seen timestamp

## How It Works

### Flow Diagram

```
1. User receives new message
   ↓
2. Socket emits "newMessage" event
   ↓
3. NotificationBell refetches unread count
   ↓
4. Bell turns green + shows badge
   ↓
5. User clicks bell → navigates to /messages
   ↓
6. Messages page shows unread counts under avatars
   ↓
7. User opens conversation
   ↓
8. Messages marked as read automatically
   ↓
9. Unread counts update in real-time
```

### Real-time Updates

- **Socket Events**: Listens to "newMessage" events
- **Auto-refresh**: Polls every 30 seconds as backup
- **Instant Updates**: Marks messages as read when conversation opens

### Visual Indicators

1. **Bell Icon Color**:

   - Gray (muted-foreground): No unread messages
   - Green: Has unread messages

2. **Badge**:

   - Red circular badge with white text
   - Shows exact count (1-99)
   - Shows "99+" for counts ≥ 100

3. **Conversation List**:
   - Red badge under avatar showing unread count per conversation
   - Only visible when there are unread messages

## Database Schema

Uses existing `Message` model with `isRead` field:

```prisma
model Message {
  id             String       @id @default(cuid())
  conversationId String
  fromUserId     String
  toUserId       String
  body           String
  isRead         Boolean      @default(false)  // ← Used for tracking
  createdAt      DateTime     @default(now())
  // ... relations
}
```

## API Usage Examples

### Get Unread Count

```typescript
const { data } = trpc.message.getUnreadCount.useQuery();
// Returns: { unreadCount: 5 }
```

### Get Unread by Conversation

```typescript
const { data } = trpc.message.getUnreadByConversation.useQuery();
// Returns: { "conv-id-1": 3, "conv-id-2": 2 }
```

### Mark as Read

```typescript
markAsReadMutation.mutate({ conversationId: "conv-id-1" });
```

## Testing Checklist

- [ ] Send message from User A to User B
- [ ] Verify User B sees green bell with badge
- [ ] Verify badge shows correct count
- [ ] Click bell and verify navigation to /messages
- [ ] Verify unread count appears under avatar
- [ ] Open conversation and verify messages marked as read
- [ ] Verify bell returns to gray when no unread messages
- [ ] Test with multiple conversations
- [ ] Test with 100+ unread messages (shows "99+")
- [ ] Verify real-time updates when receiving new messages

## Files Modified

1. `packages/api/src/routers/message.ts` - Added 3 new endpoints
2. `packages/api/src/routers/user.ts` - Added updateUserStatus mutation
3. `apps/web/src/components/NotificationBell.tsx` - New component
4. `apps/web/src/app/dashboard/dashboard.tsx` - Integrated bell component
5. `apps/web/src/app/messages/page.tsx` - Added unread badges and auto-mark-read

## Performance Considerations

- **Efficient Queries**: Only counts unread messages, doesn't fetch full message data
- **Indexed Fields**: Uses indexed `toUserId` and `isRead` fields
- **Batch Updates**: `markAsRead` uses `updateMany` for efficiency
- **Smart Refetching**: Only refetches when needed (socket events + 30s interval)

## Future Enhancements (Optional)

1. **Push Notifications**: Browser notifications for new messages
2. **Sound Alerts**: Audio notification on new message
3. **Notification Dropdown**: Show recent messages in dropdown
4. **Mark All as Read**: Bulk action to clear all notifications
5. **Notification Preferences**: User settings for notification behavior
