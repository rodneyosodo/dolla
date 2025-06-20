export const expense = [
  "groceries",
  "utilities",
  "rent / housing",
  "transport",
  "airtime / data",
  "food - dining out",
  "loan repayment",
  "clothing",
  "education",
  "health",
  "entertainment",
  "personal care",
  "savings / investment",
  "tithe / offerings",
  "remittances sent",
  "farm produce sales",
  "business sales / daily sales",
  "freelance / gig work",
  "salary / wages",
  "rental income",
  "dividends",
  "interest",
  "consulting fees",
  "commissions",
  "grants / bursaries",
  "loan repayment received",
  "gifts / remittances",
];

export const getExpenseCategoryClassName = (category: string): string => {
  const classMap: { [key: string]: string } = {
    // Income related - calming and hopeful tones
    "farm produce sales": "bg-teal-300 text-black",
    "business sales / daily sales": "bg-sky-300 text-black",
    "freelance / gig work": "bg-lime-300 text-black",
    "salary / wages": "bg-emerald-300 text-black",
    "rental income": "bg-cyan-300 text-black",
    dividends: "bg-indigo-300 text-black",
    interest: "bg-violet-300 text-black",
    "consulting fees": "bg-green-300 text-black",
    commissions: "bg-blue-300 text-black",
    "grants / bursaries": "bg-rose-200 text-black",
    "loan repayment received": "bg-amber-200 text-black",
    "gifts / remittances": "bg-yellow-200 text-black",

    // Expense related - soft but distinct
    groceries: "bg-orange-200 text-black",
    utilities: "bg-rose-100 text-black",
    "rent / housing": "bg-zinc-200 text-black",
    transport: "bg-slate-200 text-black",
    "airtime / data": "bg-fuchsia-200 text-black",
    "food - dining out": "bg-pink-200 text-black",
    "loan repayment": "bg-amber-300 text-black",
    clothing: "bg-purple-200 text-black",
    education: "bg-indigo-200 text-black",
    health: "bg-red-200 text-black",
    entertainment: "bg-violet-200 text-black",
    "personal care": "bg-rose-300 text-black",

    // Other categories
    "savings / investment": "bg-blue-100 text-black",
    "tithe / offerings": "bg-emerald-100 text-black",
    "remittances sent": "bg-cyan-100 text-black",
  };

  return classMap[category] || "bg-stone-200 text-black";
};

export const income = [
  "salary / wages",
  "freelance / gig work",
  "business sales / daily sales",
  "rental income",
  "dividends",
  "interest",
  "farm produce sales",
  "consulting fees",
  "commissions",
  "grants / bursaries",
  "loan repayment received",
  "gifts / remittances",
  "other",
];

export const getIncomeCategoryClassName = (category: string): string => {
  const classMap: { [key: string]: string } = {
    "salary / wages": "bg-emerald-300 text-black",
    "freelance / gig work": "bg-lime-300 text-black",
    "business sales / daily sales": "bg-sky-300 text-black",
    "rental income": "bg-cyan-300 text-black",
    dividends: "bg-indigo-300 text-black",
    interest: "bg-violet-300 text-black",
    "farm produce sales": "bg-teal-300 text-black",
    "consulting fees": "bg-green-300 text-black",
    commissions: "bg-blue-300 text-black",
    "grants / bursaries": "bg-rose-200 text-black",
    "loan repayment received": "bg-amber-200 text-black",
    "gifts / remittances": "bg-yellow-200 text-black",
    other: "bg-stone-200 text-black",
  };

  return classMap[category] || "bg-stone-200 text-black";
};
