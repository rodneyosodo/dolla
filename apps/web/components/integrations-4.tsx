import { cn } from "@workspace/ui/lib/utils";
import { Command } from "lucide-react";
import Image from "next/image";

export default function IntegrationsSection() {
  return (
    <section id="integrations">
      <div className="py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative mx-auto flex max-w-sm items-center justify-between">
            <div className="space-y-6">
              <IntegrationCard position="left-top">
                <Image
                  src="/logos/absa.png"
                  alt="absa logo"
                  width="400"
                  height="400"
                />
              </IntegrationCard>
              <IntegrationCard position="left-middle">
                <Image
                  src="/logos/cooperative.jpeg"
                  alt="cooperative logo"
                  width="300"
                  height="300"
                />
              </IntegrationCard>
              <IntegrationCard position="left-bottom">
                <Image
                  src="/logos/equity.png"
                  alt="equity logo"
                  width="2000"
                  height="1312"
                />
              </IntegrationCard>
            </div>
            <div className="mx-auto my-2 flex w-fit justify-center gap-2">
              <div className="bg-muted relative z-20 rounded-2xl border p-1">
                <IntegrationCard
                  className="shadow-black-950/10 dark:bg-background size-16 border-black/25 shadow-xl dark:border-white/25 dark:shadow-white/10"
                  isCenter={true}
                >
                  <Command />
                </IntegrationCard>
              </div>
            </div>
            <div
              role="presentation"
              className="absolute inset-1/3 bg-[radial-gradient(var(--dots-color)_1px,transparent_1px)] opacity-50 [--dots-color:black] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:[--dots-color:white]"
            ></div>

            <div className="space-y-6">
              <IntegrationCard position="right-top">
                <Image
                  src="/logos/im.png"
                  alt="im logo"
                  width="2000"
                  height="878"
                />
              </IntegrationCard>
              <IntegrationCard position="right-middle">
                <Image
                  src="/logos/kcb.png"
                  alt="kcb logo"
                  width="2000"
                  height="2000"
                />
              </IntegrationCard>
              <IntegrationCard position="right-bottom">
                <Image
                  src="/logos/ncba.png"
                  alt="ncba logo"
                  width="400"
                  height="400"
                />
              </IntegrationCard>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-lg space-y-6 text-center">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              Integrate with your favorite banks
            </h2>
            <p className="text-muted-foreground">
              Connect seamlessly with popular platforms and services to enhance
              your workflow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  children,
  className,
  position,
  isCenter = false,
}: {
  children: React.ReactNode;
  className?: string;
  position?:
    | "left-top"
    | "left-middle"
    | "left-bottom"
    | "right-top"
    | "right-middle"
    | "right-bottom";
  isCenter?: boolean;
}) => {
  return (
    <div
      className={cn(
        "bg-background relative flex size-12 rounded-xl border dark:bg-transparent",
        className,
      )}
    >
      <div
        className={cn(
          "relative z-20 m-auto size-fit *:size-6",
          isCenter && "*:size-8",
        )}
      >
        {children}
      </div>
      {position && !isCenter && (
        <div
          className={cn(
            "bg-linear-to-r to-muted-foreground/25 absolute z-10 h-px",
            position === "left-top" &&
              "left-full top-1/2 w-[130px] origin-left rotate-[25deg]",
            position === "left-middle" &&
              "left-full top-1/2 w-[120px] origin-left",
            position === "left-bottom" &&
              "left-full top-1/2 w-[130px] origin-left rotate-[-25deg]",
            position === "right-top" &&
              "bg-linear-to-l right-full top-1/2 w-[130px] origin-right rotate-[-25deg]",
            position === "right-middle" &&
              "bg-linear-to-l right-full top-1/2 w-[120px] origin-right",
            position === "right-bottom" &&
              "bg-linear-to-l right-full top-1/2 w-[130px] origin-right rotate-[25deg]",
          )}
        />
      )}
    </div>
  );
};
