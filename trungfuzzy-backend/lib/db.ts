import type { UserRecord } from "./types";
import { readJsonStore, writeJsonStore } from "./json-store";

let writeQueue = Promise.resolve();

export async function readUsers(): Promise<UserRecord[]> {
  const users = await readJsonStore<UserRecord[]>("users.json", []);
  return users.map((user) => ({
    ...user,
    role: user.role ?? "customer",
    status: user.status ?? "active"
  }));
}

export async function writeUsers(users: UserRecord[]) {
  writeQueue = writeQueue.then(async () => {
    await writeJsonStore("users.json", users);
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
