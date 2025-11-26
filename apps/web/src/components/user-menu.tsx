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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession(); // this is to get the session of the user from THE AUTH CLIENT using the useSession hook
  const { theme, setTheme } = useTheme();

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
              src={session.user.image || "/placeholder-avatar.jpg"}
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
                src={session.user.image || "/placeholder-avatar.jpg"}
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
          <Switch id="online-mode" checked={true} />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={"/profile" as any} className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Your profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-between cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          <div className="flex items-center">
            {theme === "dark" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
          </div>
          <Switch checked={theme === "dark"} />
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
