import { CircleCheck, CircleX, HelpCircle } from "lucide-react";

export const statuses = [
  {
    value: "imported",
    label: "Imported",
    icon: HelpCircle,
    colour: "text-gray-500",
  },
  {
    value: "reconciled",
    label: "Reconciled",
    icon: CircleCheck,
    colour: "text-green-600",
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CircleX,
    colour: "text-red-600",
  },
];
