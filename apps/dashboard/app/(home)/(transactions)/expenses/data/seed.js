import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import { categories } from "../../../../../constants/categories.ts";
import { paymentMethods } from "../../../../../constants/payment-methods.ts";

const statuses = ["imported", "reconciled", "canceled"];

const merchants = [
  "QuickMart",
  "Naivas",
  "KPLC",
  "Nairobi Water",
  "Safaricom",
  "Matatu 14",
  "Uber",
  "Bolt",
  "Mama Mboga",
  "Local Kiosk",
  "Equity Bank",
  "KCB Bank",
  "Cooperative Sacco",
  "Chemist",
  "Local Fundi",
  "Zuku",
  "DStv",
  "Kenyatta National Hospital",
  "ABC Primary School",
  "Local Butchery",
  "Shell Petrol Station",
  "Total Energies",
  "Car Wash",
  "Salon Pro",
  "Barber Shop Deluxe",
  "Java House",
  "Artcaffe",
  "Nyama Choma Place",
  "Mama Oliech's",
  "Netflix",
  "Spotify",
  "Jumia",
  "Kilimall",
  "Boda Boda Rider",
];

const generateTransactions = (count) => {
  const transactions = Array.from({ length: count }, () => {
    const randomDate = faker.date.soon({
      days: 365,
      refDate: "2025-01-01T00:00:00.000Z",
    });
    const year = randomDate.getFullYear();
    const month = randomDate.getMonth() + 1; // Month is 0-indexed
    const day = randomDate.getDate();

    const formattedDate = `${year}-${month}-${day}`;

    return {
      id: faker.string.uuid(),
      date: formattedDate,
      merchant: faker.helpers.arrayElement(merchants),
      category: faker.helpers.arrayElement(categories),
      description: faker.hacker
        .phrase()
        .replace(/^./, (letter) => letter.toUpperCase()), // Capitalize first letter
      payment_method: faker.helpers.arrayElement(paymentMethods),
      amount: faker.number.int({ min: 100, max: 15000 }),
      status: faker.helpers.arrayElement(statuses),
    };
  });
  return transactions;
};

const transactions = generateTransactions(1000);

const outputPath = path.join(process.cwd(), "transactions.json");

fs.writeFileSync(outputPath, JSON.stringify(transactions, null, 2));

console.log(
  `✅ ${transactions.length} transactions data generated at ${outputPath}`,
);
