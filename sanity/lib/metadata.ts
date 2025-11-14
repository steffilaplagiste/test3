// lib/metadata.ts (ou où se trouve ce fichier)
import { urlFor } from "@/sanity/lib/image";
import { PAGE_QUERYResult, POST_QUERYResult } from "@/sanity.types";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.massimilianocangelosi.com";

export function generatePageMetadata({
  page,
  slug,
}: {
  page: PAGE_QUERYResult | POST_QUERYResult;
  slug: string;
}) {
  const ogUrl = page?.ogImage
    ? urlFor(page.ogImage).quality(100).url()
    : `${siteUrl}/images/og-image.jpg`;

  const width = page?.ogImage?.asset?.metadata?.dimensions?.width || 1200;
  const height = page?.ogImage?.asset?.metadata?.dimensions?.height || 630;

  const isNoindex = Boolean(page?.noindex); // <- ne noindex que si coché dans Sanity

  return {
    title: page?.meta_title,
    description: page?.meta_description,
    openGraph: {
      images: [{ url: ogUrl, width, height }],
      locale: "fr_FR",
      type: "website",
    },
    // IMPORTANT : objet Robots (pas de string), et PAS de condition d'environnement
    robots: isNoindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            ["max-snippet"]: -1,
            ["max-image-preview"]: "large",
            ["max-video-preview"]: -1,
          },
        },
    // Canonical ABSOLU (évite les canoniques relatifs)
    alternates: {
      canonical: `${siteUrl}/${slug === "index" ? "" : slug}`,
    },
  };
}
