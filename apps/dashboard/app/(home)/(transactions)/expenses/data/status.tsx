import { CheckCircle, CircleOff, HelpCircle } from "lucide-react";

export const statuses = [
  {
    value: "imported",
    label: "Imported",
    icon: HelpCircle,
  },
  {
    value: "reconciled",
    label: "Reconciled",
    icon: CheckCircle,
  },
  {
    value: "canceled",
    label: "Canceled",
    icon: CircleOff,
  },
];
