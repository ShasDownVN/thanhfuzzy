import { get, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";

const useBlob = process.env.VERCEL === "1" && Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function readJsonStore<T>(name: string, fallback: T): Promise<T> {
  if (useBlob) {
    const result = await get(`data/${name}`, { access: "private" });
    if (!result || result.statusCode !== 200) return fallback;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  }

  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), "data", name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonStore(name: string, value: unknown) {
  const body = JSON.stringify(value, null, 2);
  if (useBlob) {
    await put(`data/${name}`, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0
    });
    return;
  }

  const file = path.join(process.cwd(), "data", name);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, "utf8");
}
