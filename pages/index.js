import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  if (!session) {
    return (
      <div className="bg-green-500 w-screen h-screen flex items-center">
        <div className="w-full text-center">
          <button
            className="bg-white p-2 px-4 rounded-lg text-black hover:bg-green-100"
            onClick={() => signIn("google")}
          >
            Sign in with google
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      Signed in as {session.user.email} <br />
      <button onClick={() => signOut()}>Sign out</button>
    </>
  );
}
