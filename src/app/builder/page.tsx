import type { Metadata } from "next";
import ClientBuilder from "./ClientBuilder";

export const metadata: Metadata = { title: "Resume builder" };

export default function BuilderPage() {
  return <ClientBuilder />;
}
