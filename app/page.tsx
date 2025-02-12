import MenuBar from "@/components/menubar";
import LdCards from "@/components/ldcards";
import BarGraph from "@/components/newldbarchart";
import LdPendingActionsList from "@/components/ldpendingaction";

export default function Home() {
  return (
    <div className="bg-whitegrey flex h-screen p-4">
      {/* Left Section */}
      <div className="flex-1">
        <LdCards />
        <div className="z-10 p-1">
          <BarGraph />
        </div>
      </div>

      {/* Right Section (Pending Actions List) */}
      <div className="w-1/3 min-w-[400px] h-full overflow-hidden p-1">
        <LdPendingActionsList />
      </div>
    </div>
  );
}
