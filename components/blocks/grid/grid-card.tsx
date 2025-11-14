import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { PAGE_QUERYResult, ColorVariant } from "@/sanity.types";

type Block = NonNullable<NonNullable<PAGE_QUERYResult>["blocks"]>[number];
type GridRow = Extract<Block, { _type: "grid-row" }>;
type GridColumn = NonNullable<NonNullable<GridRow["columns"]>>[number];
type GridCard = Extract<GridColumn, { _type: "grid-card" }>;

interface GridCardProps extends Omit<GridCard, "_type" | "_key"> {
  color?: ColorVariant;
}

export default function GridCard({
  color,
  title,
  excerpt,
  image,
  link,
}: GridCardProps) {
  return (
    <Link
      key={title}
      className="flex w-full rounded-3xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      href={link?.href ?? "#"}
      target={link?.target ? "_blank" : undefined}
    >
      <div
        className={cn(
          "flex w-full flex-col justify-between overflow-hidden rounded-3xl p-4",
          "transition-transform duration-300 ease-in-out", // transition douce
          "hover:scale-105" // scale léger au hover
        )}
      >
        <div>
          {image && image.asset?._id && (
            <div className="mb-4 relative w-full aspect-square rounded-2xl overflow-hidden">
              <Image
                src={urlFor(image).url()}
                alt={image.alt || ""}
                placeholder={image?.asset?.metadata?.lqip ? "blur" : undefined}
                blurDataURL={image?.asset?.metadata?.lqip || ""}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                quality={100}
              />
            </div>
          )}

          <div className={cn(color === "primary" ? "text-background" : undefined)}>
            {title && (
              <div className="mb-4">
                <h3 className="font-bold text-2xl text-center">{title}</h3>
              </div>
            )}
            {excerpt && <p className="text-center">{excerpt}</p>}
          </div>
        </div>

        <Button
          className="mt-6 self-center w-auto"
          size="lg"
          variant={stegaClean(link?.buttonVariant)}
          asChild
        >
          <div className="px-6">{link?.title ?? "Learn More"}</div>
        </Button>
      </div>
    </Link>
  );
}
