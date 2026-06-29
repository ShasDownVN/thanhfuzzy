import { NextRequest, NextResponse } from "next/server";
import { createAccessToken } from "../../../../../../lib/jwt";
import { oauthConfig, type OAuthProvider, upsertOAuthUser } from "../../../../../../lib/oauth";

type Context = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { provider: value } = await context.params;
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  if (value !== "google" && value !== "facebook") return NextResponse.redirect(`${frontendUrl}/login?oauth=unsupported`);
  const provider = value as OAuthProvider;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get(`oauth_state_${provider}`)?.value;
  if (!code || !state || state !== savedState) return NextResponse.redirect(`${frontendUrl}/login?oauth=invalid-state`);

  try {
    const config = oauthConfig(provider);
    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        redirect_uri: config.redirectUri,
        code,
        grant_type: "authorization_code"
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) throw new Error("OAuth token exchange failed");

    const profileResponse = await fetch(config.userUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.email) throw new Error("OAuth profile has no email");

    const user = await upsertOAuthUser({
      provider,
      providerId: String(profile.sub ?? profile.id),
      email: profile.email,
      name: profile.name ?? profile.email,
      avatar: profile.picture?.data?.url ?? profile.picture ?? ""
    });
    const token = await createAccessToken(user.id, user.email);
    return NextResponse.redirect(`${frontendUrl}/oauth/callback#token=${encodeURIComponent(token)}`);
  } catch {
    return NextResponse.redirect(`${frontendUrl}/login?oauth=failed`);
  }
}
