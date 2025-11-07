# GitHub Pages Setup Instructions

This repository is configured to work with GitHub Pages. Follow these steps to make it live on the web.

## Quick Setup (5 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/aled1027/research`
2. Click on **Settings** (gear icon in the top menu)
3. Scroll down and click **Pages** in the left sidebar
4. Under **Source**:
   - Select the branch you want to deploy (e.g., `main` or your feature branch)
   - Select **/ (root)** as the folder
   - Click **Save**

### Step 2: Wait for Deployment

- GitHub will build and deploy your site (usually takes 1-2 minutes)
- You'll see a green checkmark when it's ready
- The URL will be displayed: `https://aled1027.github.io/research/`

### Step 3: Access Your Tools

Once deployed, you can access:

- **Landing Page**: `https://aled1027.github.io/research/`
- **Lifestyle Inflation Tracker**: `https://aled1027.github.io/research/is-my-lifestyle-inflating/`

## What's Deployed?

The repository is structured for GitHub Pages:

```
/
├── index.html                    # Landing page (portfolio of projects)
└── is-my-lifestyle-inflating/
    ├── index.html               # Main web tool
    ├── example_data.json        # Sample data (loads with one click)
    ├── lifestyle_tracker.py     # CLI version (not needed for web)
    └── README.md               # Documentation
```

## Features

- ✅ No build process required (pure HTML/CSS/JS)
- ✅ Automatic deployment on push
- ✅ Free hosting
- ✅ HTTPS enabled by default
- ✅ Works on all devices (responsive design)
- ✅ Data stays local (LocalStorage, privacy-first)

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the repository root with your domain
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings to use custom domain

## Troubleshooting

### Site Not Loading?

- Check that GitHub Pages is enabled in Settings > Pages
- Verify the branch is correct
- Wait a few minutes for initial deployment
- Check GitHub Actions for build status

### 404 Error?

- Make sure `index.html` exists at the root
- Check that the branch has been pushed to GitHub
- Verify the URL path is correct

### LocalStorage Not Working?

- LocalStorage works fine on GitHub Pages
- Data is stored per-domain, so different domains won't share data
- Users can export/import JSON to move data between browsers

## Updating the Site

Any push to the configured branch will automatically redeploy:

```bash
git add .
git commit -m "Update site"
git push origin main
```

GitHub will rebuild and deploy automatically!

## Sharing Your Tool

Once live, share the direct link:
```
https://aled1027.github.io/research/is-my-lifestyle-inflating/
```

Anyone can use it without installing anything!
