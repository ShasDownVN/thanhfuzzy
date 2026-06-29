import { promises as fs } from "node:fs";
import path from "node:path";
import type { Order } from "./types";

const orderPath = path.join(process.cwd(), "data", "orders.json");
let queue = Promise.resolve();

export async function readOrders(): Promise<Order[]> {
  try { return JSON.parse(await fs.readFile(orderPath, "utf8")) as Order[]; }
  catch { return []; }
}

export function writeOrders(orders: Order[]) {
  queue = queue.then(async () => {
    await fs.mkdir(path.dirname(orderPath), { recursive: true });
    await fs.writeFile(orderPath, JSON.stringify(orders, null, 2), "utf8");
  });
  return queue;
}
