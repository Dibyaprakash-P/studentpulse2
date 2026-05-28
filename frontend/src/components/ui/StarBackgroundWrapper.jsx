import dynamic from "next/dynamic";

const StarBackground = dynamic(
  () => import("@/components/ui/StarBackground"),
  { ssr: false }
);

export default function StarBackgroundWrapper() {
  return <StarBackground starCount={180} />;
}
