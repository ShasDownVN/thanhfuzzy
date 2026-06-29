import { SignJWT, jwtVerify } from "jose";

const secretValue = process.env.JWT_SECRET ?? "development-only-secret-change-this-now";
const secret = new TextEncoder().encode(secretValue);

export async function createAccessToken(userId: string, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  if (!payload.sub) throw new Error("Token has no subject");
  return { userId: payload.sub, email: String(payload.email ?? "") };
}
