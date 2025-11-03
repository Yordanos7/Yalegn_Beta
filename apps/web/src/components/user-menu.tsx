import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // this are components that is for avatar i love there be mojularity
import { Switch } from "@/components/ui/switch"; // this is for toggle switch of the user menu
import { Label } from "@/components/ui/label";
import {
  User,
  BarChart,
  CreditCard,
  Link as LinkIcon,
  Settings,
  LogOut,
  Sun,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession(); // this is to get the session of the user from THE AUTH CLIENT using the useSession hook

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session?.user) {
    return (
      <>
        <Link href="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link href="/signup">
          <Button variant="default" size="lg">
            Sign Up
          </Button>
        </Link>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full flex items-center justify-center"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                session.user.profileImage ||
                session.user.image ||
                "/placeholder-avatar.jpg"
              }
              alt={session.user.name || "User"}
            />
            <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-card" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={
                  session.user.profileImage ||
                  session.user.image ||
                  "/placeholder-avatar.jpg"
                }
                alt={session.user.name || "User"}
              />
              <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
              {/* Placeholder for role, assuming 'Freelancer' for now */}
              <p className="text-xs leading-none text-muted-foreground">
                Freelancer
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-between">
          <Label htmlFor="online-mode" className="cursor-pointer">
            Online for messages
          </Label>
          <Switch id="online-mode" checked={true} />{" "}
          {/* Placeholder for actual state */}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={"/profile" as any} className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Your profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/stats" as any} className="flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            <span>Stats and trends</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/membership" as any} className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Membership plan</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/connects" as any} className="flex items-center">
            <LinkIcon className="mr-2 h-4 w-4" />
            <span>Connects</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            <span>Theme: Light</span>
          </div>
          <ModeToggle />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={"/settings" as any} className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start text-destructive hover:text-destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/");
                  },
                },
              });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
