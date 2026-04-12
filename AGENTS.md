<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tauri & Static Desktop Compatibility Rules

This project is a **Hybrid App** (Web + Tauri Desktop). All future code MUST remain compatible with **Next.js Static Export** (`output: 'export'`).

## 1. Routing & NAVIGATION
- **NO Dynamic Path Segments**: Avoid `[id]/page.jsx`. 
- **USE Search Parameters**: Use `?id=XYZ` and `useSearchParams()`.
- **Suspense Wrapping**: Any component using `useSearchParams()` MUST be wrapped in a `<Suspense>` boundary to prevent build failures.

## 2. API & BACKEND
- **NO /api Routes**: The `src/app/api` directory is deleted during build. 
- **Direct Appwrite Calls**: Always talk to the Appwrite SDK/REST API directly from the client.
- **No Server-side Secrets**: Never use `node-appwrite` or `APPWRITE_API_KEY` in frontend code.

## 3. ASSETS & IMAGES
- **Direct URLs**: Fetch images/files directly from Appwrite URLs. Do not use server-side proxies.
- **Unoptimized Images**: The Next.js `<Image>` component must have `unoptimized: true` in `next.config.mjs`.

## 4. ADMIN FEATURES
- Features requiring the **Appwrite Admin API Key** (like creating users or force-resetting passwords) are **restricted to the Web version**. Always add a check and an error message for these features in the Desktop environment.
