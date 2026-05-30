# Discourse S3/R2 Chat Thumbnail Fix

A lightweight Discourse Theme Component to fix broken chat thumbnails when using Cloudflare R2 or other S3-compatible object storage.

## The Bug
Currently, Discourse Core has a bug in its Chat serializers. While standard forum posts properly wrap images in your configured CDN domain, Chat bypasses this logic. It outputs the raw, internal S3 bucket URL directly to the browser. 

Because providers like Cloudflare R2 are "secure-by-default" and block unauthenticated access to the raw `.cloudflarestorage.com` endpoint, Chat images completely break (returning `403 Forbidden`). 

## The Solution
This Theme Component intercepts the broken URLs *only* within newly injected Chat DOM elements and instantly swaps them for your correct CDN domain. It catches `src`, `srcset`, `href`, and `data-src` attributes without causing UI lag or freezing the browser.

## ⚙️ Settings
Once installed, configure the two settings:

| Setting | Description | Example |
| :--- | :--- | :--- |
| `raw_s3_bucket_url` | The raw bucket URL that Discourse is leaking to the browser. You can find this by inspecting a broken/bypassed chat image. | `my-forum.s3.amazonaws.com` or `...eu.r2.cloudflarestorage.com` |
| `s3_cdn_url` | The exact domain you have configured in your Discourse `s3_cdn_url` setting. | `uploads.disco-docs.com` |

> **Note:** Do not include `https://` or trailing slashes in the settings - just use the raw domains.

## Performance
The `MutationObserver` in this component has been strictly scoped. Rather than running `querySelectorAll` against the entire webpage every time a user scrolls or types, it strictly evaluates the `addedNodes` payload. This guarantees that your Chat UI remains fast, even during heavy server loads or rapid message ingestion.
