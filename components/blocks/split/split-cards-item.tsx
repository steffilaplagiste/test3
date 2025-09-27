"use client";
import PortableTextRenderer from "@/components/portable-text-renderer";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { PAGE_QUERYResult, ColorVariant } from "@/sanity.types";

type Block = NonNullable<NonNullable<PAGE_QUERYResult>["blocks"]>[number];
type SplitRow = Extract<Block, { _type: "split-row" }>;
type SplitCardsList = Extract<
  NonNullable<SplitRow["splitColumns"]>[number],
  { _type: "split-cards-list" }
>;
type SplitCardItem = NonNullable<NonNullable<SplitCardsList["list"]>[number]>;

interface SplitCardsItemProps extends SplitCardItem {
  color?: ColorVariant;
}

export default function SplitCardsItem({
  color,
  tagLine,
  title,
  body,
}: SplitCardsItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    amount: 1,
  });

  return (
 <motion.div
  ref={ref}
  className={cn(
    "group flex flex-col items-start rounded-3xl px-6 lg:px-8 py-6 lg:py-8",
    "transition-colors duration-300 ease-in-out",
    "bg-background text-foreground" // ⬅️ plus de bg noir quand visible
  )}
>
  {tagLine && (
  <div className="font-bold text-2xl lg:text-3xl transition-colors duration-300 ease-in-out text-foreground">
    {tagLine}
  </div>
)}
    {title && (
  <div
    className={cn(
      "my-2 font-semibold text-xl transition-colors duration-300 ease-in-out",
      "text-foreground",
      "group-hover:text-[var(--destructive)] group-hover:underline group-hover:underline-offset-4 group-hover:decoration-[var(--destructive)]",
      isInView && "text-[var(--destructive)] underline underline-offset-4 decoration-[var(--destructive)]"
    )}
  >
    {title}
  </div>
)}
      {body && (
        <div
          className={cn(
            "transition-colors duration-1000 ease-in-out",
            isInView ? "text-background" : "text-foreground"
          )}
        >
          <PortableTextRenderer value={body} />
        </div>
      )}
    </motion.div>
  );
}
