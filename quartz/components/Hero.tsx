import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/hero.scss"

interface Options {
  name: string
  title: string
  bio: string
  avatarPath: string
  links: {
    label: string
    url: string
    icon?: string
  }[]
  socials: {
    label: string
    url: string
    icon: string
  }[]
}

const defaultOptions: Options = {
  name: "James Lin",
  title: "Researcher & Developer",
  bio: "Welcome to my personal site. I write about research, technology, and ideas.",
  avatarPath: "/static/avatar.jpg",
  links: [
    { label: "About", url: "/about" },
    { label: "Publications", url: "/publications" },
    { label: "Projects", url: "/projects" },
    { label: "Posts", url: "/posts" },
  ],
  socials: [
    {
      label: "GitHub",
      url: "https://github.com/shixuanLin1009",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
    },
    {
      label: "Email",
      url: "mailto:your@email.com",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    },
  ],
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Hero: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <div class="hero-container">
        <div class="hero-avatar-wrap">
          <img class="hero-avatar" src={opts.avatarPath} alt={opts.name} />
        </div>
        <div class="hero-content">
          <h1 class="hero-name">{opts.name}</h1>
          <p class="hero-title">{opts.title}</p>
          <p class="hero-bio">{opts.bio}</p>
          <nav class="hero-nav">
            {opts.links.map((link) => (
              <a href={link.url} class="hero-nav-btn">
                {link.label}
              </a>
            ))}
          </nav>
          <div class="hero-socials">
            {opts.socials.map((s) => (
              <a
                href={s.url}
                class="hero-social-btn"
                aria-label={s.label}
                dangerouslySetInnerHTML={{ __html: s.icon }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  Hero.css = style
  return Hero
}) satisfies QuartzComponentConstructor
