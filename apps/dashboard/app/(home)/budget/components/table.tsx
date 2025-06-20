import { Slider } from "@workspace/ui/components/slider";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

const budgets = [
  {
    number: "BUD001",
    name: "Food",
    thresholdAmount: 200.0,
    currentAmount: 250.0,
    Name: "Credit Card",
  },
  {
    number: "BUD002",
    name: "Clothing",
    thresholdAmount: 300.0,
    currentAmount: 150.0,
    Name: "PayPal",
  },
  {
    number: "BUD003",
    name: "Entertainment",
    thresholdAmount: 600.0,
    currentAmount: 350.0,
    Name: "Bank Transfer",
  },
  {
    number: "BUD004",
    name: "Transport",
    thresholdAmount: 900.0,
    currentAmount: 450.0,
    Name: "Credit Card",
  },
  {
    number: "BUD005",
    name: "Gifts",
    thresholdAmount: 1000.0,
    currentAmount: 550.0,
    Name: "PayPal",
  },
  {
    number: "BUD006",
    name: "Savings",
    thresholdAmount: 900.0,
    currentAmount: 200.0,
    Name: "Bank Transfer",
  },
  {
    number: "BUD007",
    name: "Taxes",
    thresholdAmount: 900.0,
    currentAmount: 300.0,
    Name: "Credit Card",
  },
];

export function TableDemo() {
  return (
    <Table>
      <TableCaption>How things are going</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Number</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-[300px]">Status</TableHead>
          <TableHead>Budgeted Amount</TableHead>
          <TableHead>Current Amount</TableHead>
          <TableHead className="text-right">Available Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgets.map((budget) => (
          <TableRow key={budget.number}>
            <TableCell className="font-medium">{budget.number}</TableCell>
            <TableCell>{budget.name}</TableCell>
            <TableCell>
              <Slider
                defaultValue={[budget.currentAmount]}
                value={[budget.currentAmount]}
                max={budget.thresholdAmount}
                min={0}
              />
            </TableCell>
            <TableCell>{formatCurrency(budget.thresholdAmount)}</TableCell>
            <TableCell>{formatCurrency(budget.currentAmount)}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(budget.thresholdAmount - budget.currentAmount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total</TableCell>
          <TableCell className="text-right">
            {formatCurrency(
              budgets.reduce((acc, budget) => acc + budget.currentAmount, 0),
            )}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KSH",
  }).format(value);
}
