import type { Order } from "./types";
import { readJsonStore, writeJsonStore } from "./json-store";

let queue = Promise.resolve();

export async function readOrders(): Promise<Order[]> {
  return readJsonStore<Order[]>("orders.json", []);
}

export function writeOrders(orders: Order[]) {
  queue = queue.then(async () => {
    await writeJsonStore("orders.json", orders);
  });
  return queue;
}
