# Shixuan Lin - Personal Website

A Jekyll-powered personal website showcasing research, projects, and blog posts.

## 🌐 Live Website
Visit: [https://shixuanlin1009.github.io](https://shixuanlin1009.github.io)

## 📝 How to Add Blog Posts

1. Create a new file in the `_posts/` directory
2. Name it: `YYYY-MM-DD-title-of-post.md`
3. Add front matter at the top:

```markdown
---
layout: post
title: "Your Post Title"
date: 2024-03-15 10:00:00 +0000
categories: [research, projects]
tags: [machine-learning, python]
author: Shixuan Lin
excerpt: "Brief description of your post"
---

# Your Content Here
Write your blog post using Markdown...
```

## 📁 Website Structure

- `_posts/` - Blog posts (Markdown files)
- `_layouts/` - HTML templates
- `_includes/` - Reusable components (header, footer, navigation)
- `pages/` - Static pages (about, CV, contact, etc.)
- `_config.yml` - Site configuration
- `assets/` - CSS, JavaScript, and other assets

## 🚀 Deployment

This site automatically deploys to GitHub Pages when you push changes to the main branch.

## 🛠️ Local Development

```bash
# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Visit http://localhost:4000
```

## ✍️ Content Management

- **Blog Posts**: Add files to `_posts/`
- **Pages**: Edit files in `pages/`
- **Site Info**: Update `_config.yml`
- **Styling**: Modify files in `_sass/` and `assets/css/`

## 📱 Features

- ✅ Responsive design
- ✅ Blog system with categories and tags
- ✅ Static pages (About, CV, Publications, Contact)
- ✅ SEO optimization
- ✅ RSS feed
- ✅ Syntax highlighting

---

Built with Jekyll and hosted on GitHub Pages.