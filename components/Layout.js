import { useSession, signIn, signOut } from "next-auth/react";
import Nav from "@/components/Nav";

export default function Layout({ children }) {
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
    <div className="bg-green-500 min-h-screen flex">
      <Nav />
      <div className="bg-white flex-grow mt-2 mr-2 mb-2 rounded-lg p-1">
        Signed in as {session.user.email}
        {children}
      </div>
    </div>
  );
}
