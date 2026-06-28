# Deployment

Focus Lab is a static Vite app. It can be deployed to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static file host.

## Static Build

```bash
npm install
npm run build
```

The production files are generated in `dist/`.

## GitHub Pages Note

This project currently uses `BrowserRouter`, which works best when deployed at a domain root such as:

```txt
https://your-domain.com/
```

If you deploy to a GitHub Pages project path such as:

```txt
https://your-name.github.io/focus-lab/
```

you should either:

- configure Vite `base: '/focus-lab/'` and React Router `basename="/focus-lab"`, or
- switch to `HashRouter`.

For a quick first public preview, Netlify or Vercel is usually simpler because they can serve the app from the domain root and support SPA rewrites.
