import SignIn from "~/components/auth/signin-card";


export default async function SignInPage(props: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await props.searchParams;
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn redirect={redirect} />
    </div>
  )
}
