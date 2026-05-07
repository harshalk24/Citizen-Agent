import { redirect } from "next/navigation";

export default function JourneyDetailPage({ params }: { params: { id: string } }) {
  redirect(`/discover?event=${params.id}`);
}
