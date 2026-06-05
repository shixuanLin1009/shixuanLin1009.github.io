import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/featuredProjects.scss"

interface Project {
  name: string
  description: string
  tags: string[]
  github?: string
  demo?: string
}

interface Options {
  projects: Project[]
}

const defaultOptions: Options = {
  projects: [
    {
      name: "Project Name",
      description: "專案簡短說明，描述這個專案的功能與目標。",
      tags: ["Python", "Machine Learning"],
      github: "https://github.com/shixuanLin1009",
    },
    {
      name: "Project Name 2",
      description: "專案簡短說明，描述這個專案的功能與目標。",
      tags: ["TypeScript", "Web"],
      github: "https://github.com/shixuanLin1009",
    },
    {
      name: "Project Name 3",
      description: "專案簡短說明，描述這個專案的功能與目標。",
      tags: ["Research", "NLP"],
      github: "https://github.com/shixuanLin1009",
    },
  ],
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const FeaturedProjects: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <div class="featured-projects">
        <div class="section-header">
          <h2 class="section-title">Featured Projects</h2>
          <a href="/projects" class="section-more">View all →</a>
        </div>
        <div class="project-grid">
          {opts.projects.map((p) => (
            <div class="project-card">
              <div class="project-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h6l3 3 3-3h6v18H3z"/></svg>
                <h3 class="project-name">{p.name}</h3>
                <div class="project-links">
                  {p.github && (
                    <a href={p.github} aria-label="GitHub" target="_blank" rel="noopener">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} aria-label="Demo" target="_blank" rel="noopener">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  )}
                </div>
              </div>
              <p class="project-desc">{p.description}</p>
              <div class="project-tags">
                {p.tags.map((tag) => (
                  <span class="project-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  FeaturedProjects.css = style
  return FeaturedProjects
}) satisfies QuartzComponentConstructor
