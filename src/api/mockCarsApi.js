import { mockCars } from "../data/mockCars";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Autocomplete Search
 * q: "ford" أو "ford mu" أو "corolla"
 */
export async function searchCars(q) {
  await wait(450); // latency (كأن فيه سيرفر)

  const query = (q || "").trim().toLowerCase();
  if (query.length < 2) return [];

  // مثال بسيط: ابحث داخل make + model
  const list = mockCars
    .filter((c) => `${c.make} ${c.model}`.toLowerCase().includes(query))
    .slice(0, 12);

  return list;
}

export async function getCarDetails(id) {
  await wait(350);

  const car = mockCars.find((c) => c.id === id);
  if (!car) throw new Error("Car not found");
  return car;
}
