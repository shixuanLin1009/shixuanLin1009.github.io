import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/statsBar.scss"

interface StatItem {
  value: string
  label: string
}

interface Options {
  stats: StatItem[]
}

const defaultOptions: Options = {
  stats: [
    { value: "0", label: "Publications" },
    { value: "0", label: "Projects" },
    { value: "0", label: "Citations" },
  ],
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const StatsBar: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <div class="stats-bar">
        {opts.stats.map((stat) => (
          <div class="stat-item">
            <span class="stat-value">{stat.value}</span>
            <span class="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    )
  }

  StatsBar.css = style
  return StatsBar
}) satisfies QuartzComponentConstructor
