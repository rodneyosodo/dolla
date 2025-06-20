import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import { income } from "../../../../../constants/categories.ts";
import { paymentMethods } from "../../../../../constants/payment-methods.ts";

const sources = [
  "xyz ltd.",
  "safaricom plc",
  "joyce m. (client)",
  "mama mboga (stall 3)",
  "jua kali artisan group",
  "airbnb guest (unit 4)",
  "agripro ltd.",
  "zyz consultants",
  "kcb bank",
  "equity bank",
  "(self)",
  "family support",
  "government bursary fund",
  "abc school",
  "local sacco",
  "cooperative society",
  "digital marketing agency",
  "online survey platform",
  "friend's business",
  "real estate agent",
  "livestock market",
  "crafts & souvenirs shop",
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
      source: faker.helpers.arrayElement(sources),
      category: faker.helpers.arrayElement(income),
      description: faker.hacker
        .phrase()
        .replace(/^./, (letter) => letter.toUpperCase()), // Capitalize first letter
      payment_method: faker.helpers.arrayElement(paymentMethods),
      amount: faker.number.int({ min: 100, max: 15000 }),
      currency: faker.helpers.arrayElement(["KSH", "USD", "EUR", "GBP"]),
      is_recurring: faker.datatype.boolean(),
      original_amount: faker.number.int({ min: 100, max: 15000 }),
    };
  });
  return transactions;
};

const transactions = generateTransactions(100);

const outputPath = path.join(process.cwd(), "transactions.json");

fs.writeFileSync(outputPath, JSON.stringify(transactions, null, 2));

console.log(
  `✅ ${transactions.length} transactions data generated at ${outputPath}`,
);
