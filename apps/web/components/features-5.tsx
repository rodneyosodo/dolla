import { Activity, DraftingCompass, Import, Mail, Zap } from "lucide-react";
import Image from "next/image";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
          <div className="lg:col-span-2">
            <div className="md:pr-6 lg:pr-0">
              <h2 className="text-4xl font-semibold lg:text-5xl">
                Built for Personal Finance
              </h2>
              <p className="mt-6">
                Track every penny that comes in and goes out of your account.
              </p>
            </div>
            <ul className="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
              <li>
                <Import className="size-5" />
                Import from any exported statement
              </li>
              <li>
                <Zap className="size-5" />
                Fast response time and 24/7 support
              </li>
              <li>
                <Activity className="size-5" />
                Analytics
              </li>
              <li>
                <DraftingCompass className="size-5" />
                Expert AI review
              </li>
            </ul>
          </div>
          <div className="border-border/50 relative rounded-3xl border p-3 lg:col-span-3">
            <div className="bg-linear-to-b relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
              <Image
                src="/expenses-dark.png"
                className="hidden rounded-[15px] dark:block"
                alt="expenses illustration dark"
                width={1461}
                height={775}
              />
              <Image
                src="/expenses-light.png"
                className="rounded-[15px] shadow dark:hidden"
                alt="expenses illustration light"
                width={1466}
                height={792}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
