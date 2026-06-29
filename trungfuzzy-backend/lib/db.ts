import { promises as fs } from "node:fs";
import path from "node:path";
import type { UserRecord } from "./types";

const dbPath = path.join(process.cwd(), "data", "users.json");
let writeQueue = Promise.resolve();

export async function readUsers(): Promise<UserRecord[]> {
  try {
    const users = JSON.parse(await fs.readFile(dbPath, "utf8")) as UserRecord[];
    return users.map((user) => ({
      ...user,
      role: user.role ?? "customer",
      status: user.status ?? "active"
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function writeUsers(users: UserRecord[]) {
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    const temporaryPath = `${dbPath}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(users, null, 2), "utf8");
    await fs.rename(temporaryPath, dbPath);
  });
  return writeQueue;
}

export async function updateUser(
  userId: string,
  updater: (user: UserRecord) => UserRecord
): Promise<UserRecord | null> {
  const users = await readUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index < 0) return null;
  users[index] = updater(users[index]);
  await writeUsers(users);
  return users[index];
}
