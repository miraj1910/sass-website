import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      teamId: string | null;
      role: "ADMIN" | "MEMBER";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    teamId?: string | null;
    role?: "ADMIN" | "MEMBER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    teamId?: string | null;
    role?: "ADMIN" | "MEMBER";
  }
}
