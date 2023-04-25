import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-green-500 w-screen h-screen flex items-center">
      <div className="w-full text-center">
        <button className="bg-white p-2 px-4 rounded-lg ">
          Sign in with google
        </button>
      </div>
    </div>
  );
}
