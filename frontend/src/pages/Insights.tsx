import KpiBar from '../components/KpiBar'
import TopVideosTable from '../components/TopVideosTable'
import ViewsByChannelChart from '../components/ViewsByChannelChart'
import ViewsByTypeBar from '../components/ViewsByTypeBar'
import ViewsOverTimeChart from '../components/ViewsOverTimeChart'

function InsightsPage() {
  return (
    <section className="space-y-6">
      <KpiBar />
      <div className="grid gap-6 lg:grid-cols-2">
        <ViewsByTypeBar />
        <ViewsByChannelChart />
      </div>
      <ViewsOverTimeChart />
      <TopVideosTable />
    </section>
  )
}

export default InsightsPage
