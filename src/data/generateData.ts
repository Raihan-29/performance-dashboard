import type { DataPoint } from "../types/data";

const categories = [
  "Electronics",
  "Fashion",
  "Grocery",
  "Home",
  "Sports",
];

const regions = [
  "North",
  "South",
  "East",
  "West",
];

export function generateData(count: number): DataPoint[] {
  const data: DataPoint[] = [];

  const startTime =
    Date.now() - 365 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(
      startTime + i * 60 * 60 * 1000
    ).toISOString();

    data.push({
      id: i + 1,

      timestamp,

      value: Math.round(
        100 + Math.random() * 900
      ),

      category:
        categories[
          Math.floor(
            Math.random() * categories.length
          )
        ],

      region:
        regions[
          Math.floor(
            Math.random() * regions.length
          )
        ],
    });
  }

  return data;
}