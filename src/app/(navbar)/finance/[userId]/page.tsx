import PlaidLinkButton from "~/components/plaid-link-button";

export default async function UserFinancePage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;
  return (
    <div className="flex flex-col items-center justify-start h-screen">
      User Finance: {userId}
      <PlaidLinkButton userId={userId} />
    </div>
  );
}
