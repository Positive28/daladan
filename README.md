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

3. Start development server:

```bash
npm run dev
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
- `POST /refresh`
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
- [ ] `POST /refresh` refreshes token on expired access token (automatic retry path)
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
