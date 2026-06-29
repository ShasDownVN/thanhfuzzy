import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { oauthConfig, type OAuthProvider } from "../../../../../lib/oauth";

type Context = { params: Promise<{ provider: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const { provider: value } = await context.params;
  if (value !== "google" && value !== "facebook") {
    return NextResponse.json({ message: "OAuth provider is not supported." }, { status: 404 });
  }
  const provider = value as OAuthProvider;
  const config = oauthConfig(provider);
  if (!config.clientId || !config.clientSecret) {
    return NextResponse.json({ message: `${provider} OAuth credentials are not configured.` }, { status: 503 });
  }

  const state = randomBytes(24).toString("hex");
  const url = new URL(config.authorizationUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);
  if (provider === "google") url.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(url);
  response.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/"
  });
  return response;
}
