import DoubleLayerDoughnutChart from '@/components/ldcostchart'
import LDCertificationCostTable from '@/components/ldcosttable'


const page = () => {
  return (
    <div className='bg-whitegrey w-full overflow-y-hidden'>
      <div className='m-3'><div className='mb-3'><DoubleLayerDoughnutChart/></div><div><LDCertificationCostTable/></div>
      </div>
    </div>
  )
}

export default page
