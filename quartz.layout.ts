import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      About: "/about",
      Publications: "/publications",
      Projects: "/projects",
      Posts: "/posts",
      GitHub: "https://github.com/shixuanLin1009",
    },
  }),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Hero({
        name: "James Lin",
        title: "Researcher & Developer",
        bio: "Welcome to my personal site. I share my research, projects, and writings here.",
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
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
          },
          {
            label: "Google Scholar",
            url: "https://scholar.google.com/citations?user=YOURID",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 10a8 8 0 0 1 7.162 3.44L24 9.5z"/></svg>`,
          },
          {
            label: "ORCID",
            url: "https://orcid.org/0000-0000-0000-0000",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 3.872-2.466 3.872-3.722 0-2.016-1.116-3.722-3.884-3.722h-2.285z"/></svg>`,
          },
          {
            label: "ResearchGate",
            url: "https://www.researchgate.net/profile/YOURPROFILE",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a12.193 12.193 0 0 0-.202 1.311l-.005.031a11.03 11.03 0 0 0-.076 1.172c0 .477.098.905.295 1.283.199.38.473.7.823.96.35.257.758.424 1.22.499v.06c-.47.104-.88.28-1.23.527-.347.247-.622.561-.822.942-.2.38-.3.802-.3 1.261 0 .596.156 1.118.47 1.568.315.448.735.793 1.26 1.033.527.24 1.1.36 1.72.36.621 0 1.194-.12 1.72-.36a3.08 3.08 0 0 0 1.261-1.033c.314-.45.47-.972.47-1.568 0-.46-.1-.882-.3-1.261a3.014 3.014 0 0 0-.822-.942c-.35-.248-.76-.423-1.23-.527v-.06c.462-.075.87-.242 1.22-.5.35-.258.624-.578.823-.959.197-.378.295-.806.295-1.283a11.03 11.03 0 0 0-.076-1.172l-.005-.031a12.252 12.252 0 0 0-.202-1.311c-.244-.744-.65-1.303-1.213-1.68C21.094.19 20.404 0 19.586 0zM0 .783v22.434h7.29c1.699 0 3.077-.47 4.133-1.408 1.057-.938 1.585-2.168 1.585-3.69 0-.966-.243-1.823-.729-2.572-.486-.748-1.152-1.3-1.997-1.658v-.093c.688-.33 1.237-.826 1.645-1.487.41-.661.615-1.41.615-2.244 0-1.4-.484-2.524-1.453-3.372C9.1 1.647 7.791 1.22 6.143 1.22H1.218V.783H0zm1.218 1.66h4.925c1.312 0 2.355.335 3.128 1.005.773.67 1.16 1.572 1.16 2.706 0 1.148-.395 2.063-1.185 2.745-.79.681-1.843 1.022-3.16 1.022H1.218V2.443zm0 8.72h5.082c1.473 0 2.63.364 3.47 1.093.842.728 1.262 1.712 1.262 2.952 0 1.28-.428 2.287-1.284 3.02-.856.732-2.022 1.099-3.496 1.099H1.218v-8.163z"/></svg>`,
          },
          {
            label: "LinkedIn",
            url: "https://linkedin.com/in/YOURPROFILE",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
          },
          {
            label: "Email",
            url: "mailto:nm6144046@gs.ncku.edu.tw",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
          },
        ],
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.StatsBar({
        stats: [
          { value: "0", label: "Publications" },
          { value: "0", label: "Projects" },
          { value: "0", label: "Citations" },
        ],
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.FeaturedProjects({
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
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
