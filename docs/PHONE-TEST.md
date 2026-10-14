# Phone test

The app can only be installed and work offline from an HTTPS address, and the service worker only exists in production builds.

## Build and host

1. For a local build, run `npm install` (this also draws the app icons into `public/icons`), then `npm run build`.
2. To deploy to GitHub Pages, set **Settings > Pages > Build and deployment > Source** to **GitHub Actions** once. The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the site whenever you push to `master`; the repository name is used as the base path.
3. For another static HTTPS host (such as Cloudflare Pages or Netlify), upload the contents of `dist/Muzsika/browser`.

## What to check on the phone (Chrome on Android)

1. Open the address, then use the browser menu: Install app (or Add to home screen).
2. Open the installed app. The line at the bottom should say your songs are protected from automatic cleanup.
3. Add a song: pick an audio file, paste lyrics, save. Open it and press play.
4. Close the app completely and open it again. The song is still there and plays.
5. Switch on airplane mode and open the app from the home screen. The list and the audio still work.
6. Play a song and lock the screen. Does the audio keep playing? Do lock-screen controls show up?
7. Select a lyric line. Does Translate show up in the selection menu?
8. Deploy a change and reopen the app. A "new version is ready" bar should appear.

Write down anything that fails. Steps 2, 5 and 6 decide whether a PWA is enough.
