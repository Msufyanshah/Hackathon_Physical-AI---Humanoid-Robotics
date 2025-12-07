# GitHub Pages Setup for Physical AI & Humanoid Robotics Book

## How to Enable GitHub Pages for This Repository

This document explains how to set up GitHub Pages to host the Docusaurus-based Physical AI and Humanoid Robotics book online.

## Prerequisites

1. The repository should already contain the Docusaurus website files in the `website/` directory
2. You need admin access to the repository settings

## Step 1: Create a GitHub Actions Workflow

Create a new file at `.github/workflows/deploy.yml` in your repository with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # or your default branch
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: website
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
          cache-dependency-path: website/package-lock.json

      - name: Install dependencies
        run: npm ci
      - name: Build website
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./website/build
          publish_branch: gh-pages
          user_name: github-actions[bot]
          user_email: 41898282+github-actions[bot]@users.noreply.github.com
```

## Step 2: Enable GitHub Pages in Repository Settings

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to the **Pages** section in the left sidebar
4. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)` 
5. Click **Save**

## Step 3: Verify Build Process

After setting up the workflow, GitHub Actions will automatically build your site:

1. Go to the **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete successfully
4. Check the **Pages** section in **Settings** for deployment status

## Step 4: Access Your Site

Once deployed, your site will be available at:

```
https://<username>.github.io/<repository-name>/
```

For this repository, it would be:
```
https://msufyanshah.github.io/Hackathon_Physical-AI---Humanoid-Robotics/
```

## Troubleshooting

### If the Site Doesn't Build:
1. Check the GitHub Actions logs for errors
2. Ensure all dependencies are listed in `website/package.json`
3. Verify the Docusaurus configuration in `website/docusaurus.config.ts`

### If Images/Bundles Don't Load:
1. Check if the base URL is properly set in `docusaurus.config.ts`
2. Make sure the `baseUrl` field matches your repository name (e.g., `/Hackathon_Physical-AI---Humanoid-Robotics/`)

## Additional Configuration

In your `website/docusaurus.config.ts`, ensure you have the proper GitHub Pages configuration:

```typescript
export default {
  // ...
  url: 'https://msufyanshah.github.io',
  baseUrl: '/Hackathon_Physical-AI---Humanoid-Robotics/',
  trailingSlash: true,
  // ...
  themes: [
    '@docusaurus/theme-mermaid',
  ],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  // ...
};
```

## Custom Domain (Optional)

If you want to use a custom domain:

1. Go to repository **Settings** → **Pages**
2. Under "Custom domain", enter your domain name
3. Add a CNAME file to the root of your repository with your domain

## Notes

- The site will rebuild automatically on pushes to the main branch
- You can customize the appearance by modifying the files in `website/src/css/custom.css`
- Documentation files are in the `website/docs/` directory
- The build process may take 1-2 minutes to complete

After following these steps, your Physical AI & Humanoid Robotics book will be accessible as a live website through GitHub Pages!