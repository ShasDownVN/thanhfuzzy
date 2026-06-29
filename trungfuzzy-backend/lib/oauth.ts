import { randomUUID } from "node:crypto";
import { readUsers, writeUsers } from "./db";
import { publicUser, type UserRecord } from "./types";

export type OAuthProvider = "google" | "facebook";

export function oauthConfig(provider: OAuthProvider) {
  const baseUrl = process.env.BACKEND_URL ?? "http://localhost:3001";
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      scope: "openid email profile",
      redirectUri: `${baseUrl}/api/auth/oauth/google/callback`
    };
  }
  return {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    authorizationUrl: "https://www.facebook.com/v22.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v22.0/oauth/access_token",
    userUrl: "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)",
    scope: "email,public_profile",
    redirectUri: `${baseUrl}/api/auth/oauth/facebook/callback`
  };
}

export async function upsertOAuthUser(profile: {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
  avatar: string;
}) {
  const users = await readUsers();
  let user = users.find((item) => item.email === profile.email.toLowerCase());
  const now = new Date().toISOString();
  if (!user) {
    user = {
      id: randomUUID(),
      email: profile.email.toLowerCase(),
      passwordHash: `OAUTH:${profile.provider}:${profile.providerId}`,
      fullName: profile.name,
      phone: "",
      birthDate: "",
      avatar: profile.avatar,
      role: "customer",
      status: "active",
      addresses: [],
      createdAt: now,
      updatedAt: now
    } satisfies UserRecord;
    users.push(user);
  } else {
    user = { ...user, fullName: user.fullName || profile.name, avatar: profile.avatar || user.avatar, updatedAt: now };
    users[users.findIndex((item) => item.id === user!.id)] = user;
  }
  await writeUsers(users);
  return publicUser(user);
}
