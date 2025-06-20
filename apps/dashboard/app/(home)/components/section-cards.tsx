import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

const data = [
  {
    description: "Total Balance",
    title: "KSH 30,000",
    trendingPercent: 0.1,
  },
  {
    description: "Total Income",
    title: "KSH 80,000",
    trendingPercent: 1.0,
  },
  {
    description: "Total Expenses",
    title: "KSH 40,000",
    trendingPercent: -7.2,
  },
  {
    description: "Total Savings",
    title: "KSH 10,000",
    trendingPercent: 0,
  },
];

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/7 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {data.map((item) => (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{item.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {item.title}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {item.trendingPercent > 0 && (
                  <IconTrendingUp className="text-green-600" />
                )}
                {item.trendingPercent < 0 && (
                  <IconTrendingDown className="text-red-600" />
                )}

                {item.trendingPercent > 0 && `+${item.trendingPercent}%`}
                {item.trendingPercent < 0 && `${item.trendingPercent}%`}
                {item.trendingPercent === 0 && "no change"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {item.trendingPercent > 0 &&
                `Trending up this month by ${item.trendingPercent}%`}
              {item.trendingPercent < 0 &&
                `Trending down this month by ${item.trendingPercent}%`}
              {item.trendingPercent === 0 && "No change this month"}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
