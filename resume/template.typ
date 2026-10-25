// Resume PDF — rendered from the site's /cv/<locale>.json (see scripts/resume.ts).
// Styled after the classic "Jake's resume" LaTeX layout.
//
//   typst compile resume/template.typ out.pdf --input data=data.en.json [--input phone=...]

#import "@preview/cmarker:0.1.10"

#let data = json(sys.inputs.at("data", default: "data.en.json"))
#let phone = sys.inputs.at("phone", default: none)
#let zh = data.locale == "zh-TW"
// Follows the site's palette (Settings → palette), passed in via /cv/<locale>.json.
#let accent = rgb(data.at("accent", default: "#155e75"))
// CJK has no italics; slanting only the Latin words in a mixed line looks broken.
#let italic = if zh { "normal" } else { "italic" }
#let field(d, key) = d.at(key, default: none)

#set document(title: data.name + if zh { " — 履歷" } else { " — Resume" }, author: data.name)
#set page(
  paper: "a4",
  margin: (x: 1.45cm, y: 1.25cm),
  footer: context {
    if counter(page).final().first() > 1 {
      align(right, text(size: 8pt, fill: luma(130), counter(page).display("1 / 1", both: true)))
    }
  },
)
#set text(font: ("New Computer Modern", "Noto Serif TC"), size: 10pt, lang: if zh { "zh" } else { "en" })
#set text(region: "tw") if zh
#set par(justify: true, leading: if zh { 0.7em } else { 0.52em }, spacing: 0.6em)
#set list(indent: 0.3em, body-indent: 0.45em, spacing: if zh { 0.5em } else { 0.38em }, marker: text(size: 0.8em, baseline: -0.05em)[•])
#show link: it => it
#show strong: set text(weight: "bold")

#let md(s) = cmarker.render(s, smart-punctuation: false)

// ---------------------------------------------------------------- header
#align(center)[
  #text(size: 22pt, weight: "bold", tracking: if zh { 0.15em } else { 0.04em })[
    #if zh { data.name } else { upper(data.name) }
  ]
  #if field(data, "altName") != none [
    #h(0.4em) #text(size: 13pt, fill: luma(90))[#data.altName]
  ]
  #v(-0.2em)
  #text(size: 9pt)[
    #let items = ()
    #if phone != none { items.push(phone) }
    #for c in data.contact { items.push(link(c.url, c.label)) }
    #items.join(h(0.6em) + text(fill: luma(150), "|") + h(0.6em))
  ]
]

// ---------------------------------------------------------------- building blocks
#let section-title(title) = {
  v(0.55em)
  block(below: 0.55em, grid(
    columns: (auto, 1fr),
    column-gutter: 0.5em,
    align: horizon,
    text(fill: accent, weight: "bold", size: 11pt, if zh { title } else { smallcaps(title) }),
    line(length: 100%, stroke: 0.6pt + accent.lighten(30%)),
  ))
}

#let entry(e) = block(breakable: true, below: 0.8em)[
  #grid(
    columns: (1fr, auto),
    column-gutter: 1.2em,
    row-gutter: 0.42em,
    text(weight: "bold", e.title), text(size: 9.5pt, e.at("dates", default: "")),
    ..if field(e, "subtitle") != none or field(e, "location") != none {
      (
        text(style: italic, e.at("subtitle", default: "")),
        text(size: 9.5pt, style: italic, e.at("location", default: "")),
      )
    } else { () },
  )
  #if field(e, "detail") != none {
    v(0.15em)
    text(size: 9.5pt, md(e.detail))
  }
  #if e.bullets.len() > 0 {
    v(0.1em)
    set text(size: 9.6pt)
    list(..e.bullets.map(md))
  }
]

// ---------------------------------------------------------------- sections
#for s in data.sections {
  section-title(s.title)
  if s.kind == "summary" {
    md(s.text)
  } else if s.kind == "entries" {
    for e in s.items { entry(e) }
  } else if s.kind == "publications" {
    set text(size: 9.6pt)
    enum(..s.items.map(p => [
      #text(weight: "bold", p.title). #p.authors.map(a => if a.self { underline(strong(a.name)) } else { a.name }).join(", "). #text(style: italic, p.venue) (#p.status)#if field(p, "note") != none [, #p.note].
    ]))
  } else if s.kind == "skills" {
    grid(
      columns: (auto, 1fr),
      column-gutter: 1.2em,
      row-gutter: 0.55em,
      ..s.items.map(g => (text(weight: "bold", g.group), g.items.join(", "))).flatten(),
    )
  }
}
