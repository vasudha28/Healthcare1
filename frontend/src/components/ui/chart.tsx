import { createContext, forwardRef, useContext } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"

import { cn } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ChartContextProps {
  config: ChartOptions<"line">
}

const ChartContext = createContext<ChartContextProps>({ config: {} })

function useChart() {
  const context = useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <Chart />")
  }

  return context
}

const Chart = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ChartContextProps
>(({ config, className, children, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
Chart.displayName = "Chart"

export { Chart, useChart }
