import "better-auth";

declare module "better-auth" {
  interface User {
    displayName: string;
    avatarUrl: string;
  }
}
