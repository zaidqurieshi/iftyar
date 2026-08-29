# Iftyar

A Ramadan-focused prayer timing app built with React and Vite.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Deploy to Netlify

1. Push this repo to GitHub.
2. Go to https://app.netlify.com
3. Click "Add new project" → "Import from Git"
4. Select your repository.
5. Use these settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy.

The included `netlify.toml` file handles client-side routing.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to https://vercel.com
3. Import the repository.
4. Use default settings or these values:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

The included `vercel.json` file handles client-side routing.

## Notes

- This app is frontend-only and works well on free static hosting.
- Browser geolocation is requested by the app on the user device at runtime.
- The app calculates prayer times client-side using the Adhan library.
