# Media and File Management
## Recommendation
Cloudinary is a practical V1 option for profile images, logos, banners and public tournament media. Use private object storage or private provider delivery for certificates/proofs where access control matters. MySQL stores metadata only, never binary files.

| Asset | Default visibility | Handling |
|---|---|---|
| Avatar/cover | Public if profile public | Optimized image CDN |
| Org/team logo | Public | Image CDN |
| Tournament media | Public when event published | CDN |
| Certificate/proof | Private by default | Private storage + short-lived signed access |
| Review evidence | Reviewer/admin only | Private storage |

## Upload workflow
1. Authenticated client requests upload intent.
2. API authorizes ownership, declared type and size.
3. API issues short-lived signed parameters.
4. Client uploads directly to provider.
5. Provider/API confirms actual metadata.
6. API stores MediaAsset and attaches it to authorized resource.
7. Deletion detaches reference then schedules provider deletion according to retention policy.

## Proposed limits requiring approval
Images: JPEG/PNG/WebP, max 5 MB. Documents: PDF, max 10 MB. Disallow SVG unless sanitized and specifically required. Verify actual MIME/type, dimensions and file size; do not trust filename. Strip EXIF where appropriate. Random provider IDs; no predictable public storage keys.
