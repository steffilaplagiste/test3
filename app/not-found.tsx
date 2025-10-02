import Header from "@/components/header";
import Footer from "@/components/footer";
import Custom404 from "@/components/404";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ce n'est pas le bon chemin !",
};

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <Custom404 />
      <Footer />
    </>
  );
}
