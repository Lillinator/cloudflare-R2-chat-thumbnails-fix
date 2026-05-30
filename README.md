# Discourse S3/R2 Chat Thumbnail Fix

A lightweight, highly-optimized Discourse Theme Component to fix broken chat thumbnails when using Cloudflare R2 or other S3-compatible object storage.

## The Bug
Currently, Discourse Core has a bug in its Chat serializers. While standard forum posts properly wrap images in your configured CDN domain, Chat bypasses this logic. It outputs the raw, internal S3 bucket URL directly to the browser. 

Because providers like Cloudflare R2 are "secure-by-default" and block unauthenticated access to the raw `.cloudflarestorage.com` endpoint, Chat images completely break (returning `403 Forbidden`). 

## The Solution
This Theme Component acts as a client-side band-aid while waiting for a core patch. It utilizes a highly optimized `MutationObserver` that intercepts the broken URLs *only* within newly injected Chat DOM elements and instantly swaps them for your correct CDN domain. It catches `src`, `srcset`, `href`, and `data-src` attributes without causing UI lag or freezing the browser.

## Installation
1. Go to your Discourse Admin dashboard.
2. Navigate to **Customize** -> **Themes** -> **Components**.
3. Click **Install** and select **From a git repository**.
4. Paste the URL to this repository.
5. Add the component to your active themes.

## Configuration
Once installed, configure the two settings in the Theme Component UI:

| Setting | Description | Example |
| :--- | :--- | :--- |
| `bad_cloudflare_r2_url` | The raw, broken bucket URL that Discourse is leaking to the browser. You can find this by inspecting a broken chat image. | `disco-docs-uploads.e72838402cd25cd74f272f3e35133843.eu.r2.cloudflarestorage.com` |
| `s3_cdn_url` | Your actual, public-facing CDN domain that *should* be used. | `uploads.disco-docs.com` |

> **Note:** Do not include `https://` or trailing slashes in the settings. Just use the raw domains!

## Performance
The `MutationObserver` in this component has been strictly scoped. Rather than running `querySelectorAll` against the entire webpage every time a user scrolls or types, it strictly evaluates the `addedNodes` payload. This guarantees that your Chat UI remains blazing fast, even during heavy server loads or rapid message ingestion.
