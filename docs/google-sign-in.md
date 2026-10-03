# Google sign-in setup

Google OAuth is implemented through Better Auth. It is independent of the email
provider: users can sign in with Google even while `EMAIL_MODE=disabled`.
Without credentials, the UI explains setup is pending and the API rejects
Google sign-in rather than pretending a session was created.

## Google Cloud configuration

1. Open Google Cloud Console and select/create a project for this application.
2. In **Google Auth Platform** (or **APIs & Services > OAuth consent screen**),
   configure the app name, audience, support contact, and required branding.
   If the app is in external testing, add the Google accounts that will test it.
3. Create an OAuth client of type **Web application**.
4. Add exact authorized redirect URIs for the frontend origins you use:

   ```text
   http://127.0.0.1:5174/api/auth/callback/google
   http://127.0.0.1:5173/api/auth/callback/google
   https://govpeep.pages.dev/api/auth/callback/google
   ```

   Add only the local ports you use. Add/replace the production URI when choosing
   a custom domain. `localhost` and `127.0.0.1` are different origins; the local
   runner uses `127.0.0.1`. If Google asks for authorized JavaScript origins, use
   those origins without the callback path. This app uses a server OAuth redirect,
   not One Tap or an embedded Google JavaScript SDK.
5. Complete any domain/branding verification Google requires before publishing
   beyond test users. Set the application home URL to the landing page.

## Local development

Append to ignored `apps/api/.dev.vars`:

```dotenv
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

Retain the generated `BETTER_AUTH_SECRET`. Restart `bun run dev` after changing
the configuration. The root runner sets `APP_ORIGIN` to the selected frontend
origin. Both Google and the local development email mailbox can be used.

## Cloudflare production

Store credentials using interactive secret commands from the repository root:

```sh
bun run --cwd apps/api wrangler secret put GOOGLE_CLIENT_ID
bun run --cwd apps/api wrangler secret put GOOGLE_CLIENT_SECRET
```

Also configure `BETTER_AUTH_SECRET`, the Pages `API` service binding, and the
production D1 migrations as documented in `deployment.md`.
`APP_ORIGIN` in `apps/api/wrangler.jsonc` must equal the canonical frontend origin.
The callback is routed through the website's `/api` gateway, not directly to
the `workers.dev` hostname. Client credentials never belong in `VITE_*` variables.

After deployment, `/api/config` on the frontend origin should report
`authProviders.google: true`. Click **Continue with Google**, complete consent,
and verify the resulting session and private requests. A `redirect_uri_mismatch`
means the exact callback above does not match the Google client configuration.

## Scope and testing

- Requests only `openid`, `email`, and `profile`, with PKCE/state protection.
- No Gmail, Drive, inbox synchronization, or offline refresh-token request.
- Email verification comes from Google's verified profile claim.
- Provider availability and email-link availability are separate; existing
  sessions can still be checked if a sign-in provider is temporarily disabled.
- Tests exercise authorization URL generation, scope/callback configuration,
  invalid state, and a mocked token exchange that creates a real local session.
  Real Google consent/login still requires your credentials and a live smoke test.

The product working name lives in `packages/contracts/src/brand.ts`. Update the
Google consent-screen branding separately when the final name/domain is chosen.
