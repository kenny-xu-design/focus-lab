# GitHub Upload Checklist

Use this checklist when uploading Focus Lab as an independent GitHub repository.

## 1. Verify Locally

```bash
npm install
npm run build
```

The build should complete successfully.

## 2. Files That Should Be Committed

Commit source files and project configuration, including:

- `src/`
- `public/`
- `scripts/`
- `.github/workflows/build.yml`
- `.gitignore`
- `.gitattributes`
- `DEPLOYMENT.md`
- `README.md`
- `package.json`
- `package-lock.json`
- `tsconfig*.json`
- `vite.config.ts`
- `index.html`
- `Focus Lab Launcher.cmd`
- `Focus Lab Popup.cmd`

## 3. Files That Should Not Be Committed

These are already ignored by `.gitignore`:

- `node_modules`
- `dist`
- `.env`
- `.env.local`
- `.vite`
- `.cache`
- `*.log`
- `.DS_Store`

## 4. Create An Independent Repository

Run these commands inside the `focus-lab` folder:

```bash
git init
git add .
git commit -m "Initial Focus Lab app"
git branch -M main
git remote add origin https://github.com/<your-name>/focus-lab.git
git push -u origin main
```

## 5. Deployment Notes

For GitHub Pages project-path deployment, read `DEPLOYMENT.md` first. The app currently uses React Router's `BrowserRouter`, which is simplest when deployed at a domain root.
