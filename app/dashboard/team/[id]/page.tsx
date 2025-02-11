import Summary from "@/components/admin-components/Summary";
import { calculateSummary } from "@/lib/actions/team.actions";

export default async function Page({ params }: { params: { id: string }}) {

  if(!params.id) return 

  const data = await calculateSummary({ teamId: params.id });

  return (
    <Summary data={data} />
  );
}
