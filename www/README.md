# foxguard.dev

Marketing site for foxguard, built with Astro.

## Requirements

- Node `22.12.0` or newer
- `nvm use` from the repo root if your shell picks an older Node binary

## Commands

Run from `www/`:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

## Notes

- CI builds this site with Node `22.12.0`
- If `npm run build` reports Node `18.x`, your PATH is resolving the wrong `node` binary for npm scripts

## Contact Form

The site includes a server-side contact form at `/api/contact` implemented as a Cloudflare Pages Function.

Required Cloudflare setup:

1. Enable Email Routing for `foxguard.dev`
2. Verify `dtozturk02@gmail.com` as a destination address
3. Add a `send_email` binding named `CONTACT_EMAIL` for the Pages project
4. Use `contact@foxguard.dev` or another `@foxguard.dev` sender address

Optional Pages variables:

- `CONTACT_RECIPIENT`
- `CONTACT_SENDER`

Defaults in code:

- recipient: `dtozturk02@gmail.com`
- sender: `contact@foxguard.dev`
