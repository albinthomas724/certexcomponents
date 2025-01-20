

import MenuBar from "@/components/menubar";
import LdCards from "@/components/ldcards";
import BarGraph from "@/components/newldbarchart";



export default function Home() {
  return (
    <div className="bg-whitegrey">

<LdCards/>
<div className="w-3/4 p-1"><BarGraph/></div>


{/* <div className="flex flex-col"><div><LdCards/></div><div className="flex flex-col"><BarGraph/><LDCostChart/>
</div></div> */}
{/* 
<PendingActions/> */}
{/* <LDCostChart/>
<BarGraph/>
 */}

    {/* <ModalPage/> */}
    
    {/* <LdAdmin/> */}
    </div>
//     <div>
// {/* <ProductCart/> */}
//     </div>
  );
}
