# Notification Bell - Visual Guide

## Dashboard View

### Before (No Unread Messages)

```
┌─────────────────────────────────────┐
│  Dashboard Header                   │
│  ┌────┐  ┌──────┐  🔔 (gray)       │
│  │ 👤 │  │Search│   250 Coins      │
│  └────┘  └──────┘   [Create Listing]│
└─────────────────────────────────────┘
```

### After (With Unread Messages)

```
┌─────────────────────────────────────┐
│  Dashboard Header                   │
│  ┌────┐  ┌──────┐  🔔 (green) ⓹    │
│  │ 👤 │  │Search│   250 Coins      │
│  └────┘  └──────┘   [Create Listing]│
└─────────────────────────────────────┘
         ↑              ↑
    Green bell    Red badge with count
```

## Messages Page View

### Conversation List (With Unread)

```
┌──────────────────────────────┐
│  Conversations        [New]  │
├──────────────────────────────┤
│  ┌────┐                      │
│  │ 👤 │  John Doe            │
│  │    │  Hey, how are you... │
│  │ ⓷ │  2 hours ago         │
│  └────┘                      │
├──────────────────────────────┤
│  ┌────┐                      │
│  │ 👤 │  Jane Smith          │
│  │    │  Thanks for the...   │
│  │ ⓵ │  5 minutes ago       │
│  └────┘                      │
├──────────────────────────────┤
│  ┌────┐                      │
│  │ 👤 │  Bob Wilson          │
│  │    │  See you tomorrow    │
│  └────┘  (no badge - read)   │
└──────────────────────────────┘
     ↑
Unread count badge under avatar
```

## Component Breakdown

### NotificationBell Component

```typescript
<button onClick={() => router.push("/messages")}>
  <Bell
    className={unreadCount > 0 ? "text-green-500" : "text-muted-foreground"}
    size={24}
  />
  {unreadCount > 0 && (
    <span className="badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
  )}
</button>
```

### Badge Styling

- **Position**: Absolute, top-right of bell icon
- **Color**: Red background (#ef4444)
- **Text**: White, bold, 12px
- **Shape**: Circular (rounded-full)
- **Size**: 20px × 20px
- **Content**: Number or "99+"

## User Interaction Flow

### Scenario 1: Receiving New Message

```
Step 1: User is on Dashboard
        🔔 (gray) - No notifications

Step 2: New message arrives
        Socket event: "newMessage"

Step 3: Bell updates
        🔔 (green) ⓵ - Shows notification

Step 4: User clicks bell
        → Navigates to /messages

Step 5: Messages page loads
        Shows unread badge under sender's avatar

Step 6: User opens conversation
        Messages automatically marked as read

Step 7: Bell updates
        🔔 (gray) - Back to normal
```

### Scenario 2: Multiple Conversations

```
Conversation A: 3 unread messages
Conversation B: 2 unread messages
Conversation C: 0 unread messages

Dashboard Bell: 🔔 (green) ⓹

Messages Page:
  👤 User A
   ⓷  ← Badge shows 3

  👤 User B
   ⓶  ← Badge shows 2

  👤 User C
      ← No badge (all read)
```

## Color Scheme

### Bell Icon States

| State      | Color | Hex Code | Class                 |
| ---------- | ----- | -------- | --------------------- |
| No unread  | Gray  | #6b7280  | text-muted-foreground |
| Has unread | Green | #22c55e  | text-green-500        |

### Badge

| Element    | Color | Hex Code | Class      |
| ---------- | ----- | -------- | ---------- |
| Background | Red   | #ef4444  | bg-red-500 |
| Text       | White | #ffffff  | text-white |

## Responsive Behavior

### Desktop (≥768px)

- Bell always visible in header
- Badge positioned top-right of bell
- Hover effect: opacity 80%

### Mobile (<768px)

- Bell visible in header
- Badge slightly smaller (18px × 18px)
- Touch-friendly click area

## Accessibility

- **ARIA Label**: "Notifications - X unread" (dynamic)
- **Keyboard Navigation**: Tab to focus, Enter to activate
- **Screen Reader**: Announces unread count
- **Color Contrast**: Meets WCAG AA standards
- **Focus Indicator**: Visible outline on focus

## Animation (Optional Enhancement)

```css
/* Pulse animation for new notifications */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.notification-badge {
  animation: pulse 2s infinite;
}
```
