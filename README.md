# Daladan Web

Daladan frontend built with React, TypeScript, and Vite.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file in project root:

```bash
VITE_API_BASE_URL=https://api.daladan.uz/api/v1
# Optional — enable admin UI when opened on these hostnames (comma-separated):
# VITE_ADMIN_APP_HOSTS=admin.daladan.uz,localhost
```

For AI description generation on Vercel, add a server-side API key in the Vercel project settings (Preview + Production). Prefer `DEEPSEEK_API_SECRET`; `API_SECRET` still works as a fallback:

```bash
DEEPSEEK_API_SECRET=your_deepseek_api_key
# optional legacy name:
# API_SECRET=your_deepseek_api_key
```

Do not expose this value in frontend env files with `VITE_` prefix.

3. Start development servers:

**Marketplace + admin together (default):**

```bash
yarn dev
```

`yarn dev` runs `vercel pull` once, then starts two Vite processes:

- **Website:** [http://localhost:5173/](http://localhost:5173/) — marketplace (`development` mode; no [`.env.admin`](.env.admin))
- **Admin:** [http://localhost:5174/](http://localhost:5174/) — admin UI ([`.env.admin`](.env.admin) sets `VITE_ADMIN_APP_HOSTS=localhost` so `isAdminApp()` is true only on this dev server)

Without Vercel pull:

```bash
yarn dev:vite
```

**Marketplace only** (single process on port 5173):

```bash
yarn dev:site
```

Without Vercel pull:

```bash
yarn dev:site:vite
```

**Admin only** on port 5174 (uses [`/.env.admin`](.env.admin) via `vite --mode admin`):

```bash
yarn admin:dev
```

Without Vercel pull:

```bash
yarn admin:dev:vite
```

In local Vite mode, `/api/generate-description` is served by a dev middleware that reuses the same handler logic as the Vercel function.

## Quality checks

- **`yarn typecheck`** — TypeScript project references (`tsc -b`), same check as the first step of `yarn build`.
- **`yarn react-doctor`** — [React Doctor](https://www.react.doctor/) with `--verbose`, `--lint`, `--offline`, `--no-dead-code`, `--fail-on error`, `--annotations`. Dead-code is off because that step can throw on this CLI. For stricter gates, change `--fail-on error` to `--fail-on warning` in [`package.json`](package.json). Not used here: `--score` (report only), `--diff`, `--staged` (subset scans), `--no-lint`.
- **`yarn check`** — runs `typecheck` then a full `react-doctor` scan.

**Git hooks:** After `yarn install`, Husky runs **`yarn typecheck`** and a full **`react-doctor`** scan on **`git push`** (pre-push). To skip hooks once, use `HUSKY=0 git push` (see [Husky docs](https://typicode.github.io/husky/how-to.html)).

## AI Description Generation

The create-ad form auto-generates Uzbek ad descriptions when both category and subcategory are selected (and you can still regenerate manually with the button).

- Server endpoint: `POST /api/generate-description`
- Request JSON: `{ "categoryName": string, "subcategoryName": string, "title"?: string }`
- Response JSON: `{ "description": string }`

Quick verification on Vercel preview:

1. Open create-ad page and select category + subcategory.
2. Confirm description field is auto-filled automatically with natural Uzbek text (10+ chars).
3. (Optional) click `AI yordamida tavsif yaratish` to regenerate.
4. Submit flow should work as before.

Optional API smoke test:

```bash
curl -X POST "https://<your-preview-domain>/api/generate-description" \
  -H "Content-Type: application/json" \
  -d "{\"categoryName\":\"Mevalar\",\"subcategoryName\":\"Olma\",\"title\":\"Yangi hosil olma\"}"
```

## API Documentation

- Swagger UI: [https://api.daladan.uz/api/documentation](https://api.daladan.uz/api/documentation)
- OpenAPI JSON: [https://api.daladan.uz/docs?api-docs.json](https://api.daladan.uz/docs?api-docs.json)

## Auth Integration

Base URL:

```text
https://api.daladan.uz/api/v1
```

Implemented auth/session endpoints:

- `POST /register?auth_type=password`
- `POST /login`
- `POST /logout`
- `GET /profile` (used as canonical current-user profile/me source)

Not used by design:

- `GET /get-me` (frontend relies on `GET /profile` for current-user data)

### Admin panel (`admin.daladan.uz`)

The same SPA switches to the admin UI when the browser hostname matches the built-in production admin host `admin.daladan.uz`, or any extra hostname listed in `VITE_ADMIN_APP_HOSTS` (comma-separated, for example `localhost,admin.local`). Admin screens call the same API base URL with Bearer auth on `/admin/categories`, `/admin/subcategories`, and `/admin/users`.

**Session:** The auth token is stored in `localStorage`, which is **not** shared between the main site and the admin subdomain. Admins must **log in on the admin host** so the token is stored for that origin.

**Local development:** With `yarn dev`, open the marketplace at `http://localhost:5173` and the admin app at `http://localhost:5174`. For admin alone, run `yarn admin:dev` (or `yarn admin:dev:vite`) and open `http://localhost:5174`. The committed [`.env.admin`](.env.admin) sets `VITE_ADMIN_APP_HOSTS=localhost` only when Vite runs with `--mode admin`. Override locally with `.env.admin.local` if needed (gitignored).

**CORS:** The API must allow the origin `https://admin.daladan.uz`.

#### Vercel: one project, two domains (recommended)

Use a **single** Vercel project and **one** production build (`yarn build`). The same static files are served for both the marketplace and the admin UI; the app chooses which shell to show from `window.location.hostname`.

1. **Vercel** → your project → **Settings** → **Domains** → **Add** → enter `admin.daladan.uz`.
2. At your DNS provider, add the record Vercel shows (usually **CNAME** `admin` → `cname.vercel-dns.com` or an **A** record as instructed). Wait for DNS to verify.
3. **Build command:** `yarn build` (default). Output directory: `dist` (Vite default).
4. Environment variables are baked at build time. The repo includes [`.env.production`](.env.production) with `VITE_ADMIN_APP_HOSTS=admin.daladan.uz`. You can override values in **Vercel** → **Settings** → **Environment Variables** (Production / Preview) if needed. The code also has `admin.daladan.uz` as a built-in production host so the admin shell still renders if that env is missing from a deploy.

**If `admin.daladan.uz` shows the marketplace (not a redirect):** Vite embeds `VITE_ADMIN_APP_HOSTS` at **build** time. If the Vercel build ran without that value (e.g. an empty override in the dashboard, or a deploy from a branch without [`.env.production`](.env.production)), the bundle can miss extra admin hosts like `localhost`. The canonical production host `admin.daladan.uz` is now detected in code, but you should still set **Production** env `VITE_ADMIN_APP_HOSTS=admin.daladan.uz` and **redeploy** so your bundle configuration matches the deployment setup.

You do **not** need a separate Vercel project for admin unless you want split pipelines (see below).

#### Production build commands

| Command | When to use |
|--------|----------------|
| `yarn build` | **Default.** Loads [`.env.production`](.env.production): API URL + `admin.daladan.uz` in `VITE_ADMIN_APP_HOSTS`. Use for the usual single deployment (main + admin subdomain). |
| `yarn build:admin` | Loads [`.env.admin-production`](.env.admin-production). Same typical values as production; use if you prefer a dedicated CI job name or a **second** Vercel project that only serves `admin.daladan.uz`. |
| `yarn build:site` | Loads [`.env.site`](.env.site): marketplace only (no `VITE_ADMIN_APP_HOSTS`). Use only if you deploy the main site **without** admin in the bundle and host admin on **another** project that runs `yarn build:admin`. |

For most setups, **`yarn build` once** and two domains on the same project is enough.

Register payload fields used by frontend:

- `phone` (string)
- `password` (string)
- `fname` (string)
- `lname` (string)
- `region_id` (number)
- `city_id` (number)
- `email` (optional string)
- `telegram` (optional string)

Login payload fields used by frontend:

- `phone` (string)
- `password` (string)

## Region and City Resources

Endpoints used for registration form selections:

- `GET /resources/regions`
- `GET /resources/cities`
- `GET /resources/cities?region_id={region_id}`

The registration form loads regions first, then loads cities for the selected region.

## API Integration Smoke Checklist

Public endpoints:

- [ ] `GET /public/ads` renders marketplace cards
- [ ] `GET /public/ads/{id}` renders item details
- [ ] `GET /resources/regions`
- [ ] `GET /resources/cities?region_id={id}`
- [ ] `GET /resources/categories`
- [ ] `GET /resources/subcategories?category_id={id}`

Authenticated endpoints:

- [ ] `POST /login` and user session persists
- [ ] `POST /logout` clears local session and server session
- [ ] `GET /profile` returns current user profile after login/register and on app bootstrap

Profile endpoints:

- [ ] `PUT /profile` saves first/last name changes from profile edit
- [ ] `POST /profile/avatar` updates avatar via file upload
- [ ] `PUT /profile/password` updates password with current/new/confirmation

Profile ads endpoints:

- [ ] `GET /profile/ads` loads \"My ads\" section
- [ ] `POST /profile/ads` creates new ad from \"Yangi e'lon\"
- [ ] `GET /profile/ads/{ad}` works for ad detail fetch
- [ ] `POST|PUT|PATCH /profile/ads/{ad}` updates existing ad
- [ ] `DELETE /profile/ads/{ad}` removes ad and refreshes list
