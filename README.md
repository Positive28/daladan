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
```

For AI description generation on Vercel, add this server-side environment variable in the Vercel project settings (Preview + Production):

```bash
API_SECRET=your_deepseek_api_key
```

Do not expose this value in frontend env files with `VITE_` prefix.

3. Start development server:

```bash
yarn dev
```

`yarn dev` runs `vercel pull` + `vite` so local env is synced before start.

If you only need frontend without serverless routes, use:

```bash
yarn dev:vite
```

In local Vite mode, `/api/generate-description` is served by a dev middleware that reuses the same handler logic as the Vercel function.

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
