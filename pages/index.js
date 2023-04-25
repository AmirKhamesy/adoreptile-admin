import { useSession, signIn, signOut } from "next-auth/react";
import Nav from "@/components/Nav";
import Layout from "@/components/Layout";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return;
  }
  return (
    <Layout>
      <div>
        <p>Hello {session?.user?.name}</p>
      </div>
    </Layout>
  );
}
