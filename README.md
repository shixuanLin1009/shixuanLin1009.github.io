# Personal Website

This is a personal website built using Jekyll and hosted on GitHub Pages. The site showcases my blog, projects, publications, and CV.

## Project Structure

The project is organized as follows:

- **_config.yml**: Configuration settings for the Jekyll site, including site title, description, and other metadata.
- **_layouts/**: Contains layout files for different types of pages:
  - **default.html**: Main layout for the site.
  - **post.html**: Layout for individual blog posts.
  - **page.html**: Layout for static pages.
- **_includes/**: Contains reusable HTML snippets:
  - **header.html**: Header section with site title and navigation.
  - **footer.html**: Footer section with copyright and additional links.
  - **navigation.html**: Navigation menu linking to various sections.
- **_posts/**: Contains blog posts in markdown format, each with front matter for metadata.
- **_sass/**: Contains SASS files for styling:
  - **_base.scss**: Base styles for typography and layout.
  - **_layout.scss**: Styles specific to the layout.
  - **_syntax-highlighting.scss**: Styles for syntax highlighting in code snippets.
- **assets/**: Contains compiled CSS and JavaScript files.
- **pages/**: Contains static pages like About, CV, Publications, and Contact.
- **index.html**: Homepage of the website.
- **blog.html**: Blog index page listing all posts.
- **Gemfile**: Specifies Ruby gems required for the Jekyll site.

## Getting Started

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/personal-website.git
   cd personal-website
   ```

2. **Install dependencies**:
   Make sure you have Ruby and Bundler installed. Then run:
   ```
   bundle install
   ```

3. **Run the Jekyll server**:
   ```
   bundle exec jekyll serve
   ```

4. **Open your browser**:
   Navigate to `http://localhost:4000` to view your website.

## Adding New Posts

To add a new blog post:

1. Create a new markdown file in the `_posts` directory with the format `YYYY-MM-DD-title.md`.
2. Include front matter at the top of the file, for example:
   ```
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD
   ---
   ```
3. Write your content below the front matter.

## License

This project is licensed under the MIT License. See the LICENSE file for details.