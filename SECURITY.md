# Security Policy & Architecture Guide

## Supported Versions

Currently, the following versions are being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 1. Threat Model & Security Controls

We maintain a threat model for CarbonNode to guard user privacy, avoid API abuse, and secure key system boundaries. Below is a log of identified threat scenarios and their active engineering mitigations:

| Threat                                | Impact                                                                        | Mitigation in CarbonNode                                                                                                                                                                                                                                                                  |
| :------------------------------------ | :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API Key Exposure**                  | Financial / Quota theft of the Google Gemini API key.                         | Express backend acts as an API proxy. The client-side UI never holds or exposes the `GEMINI_API_KEY`.                                                                                                                                                                                     |
| **Cross-Site Request Forgery (CSRF)** | Attackers abuse the user's browser session to exhaust Gemini API quotas.      | 1. CORS origin allowlist restricts allowed request domains.<br>2. Custom stateless security headers (`X-Requested-With` and `X-CSRF-Token`) are enforced on all mutation routes. SOP blocks cross-origin requests from setting custom headers without CORS approval.                      |
| **Cross-Site Scripting (XSS)**        | Malicious scripts injected into client-side views to steal storage state.     | 1. Input sanitization at Express controllers strips HTML tags and escapes special characters before parsing.<br>2. Client-side DOMPurify sanitizes narrative text logs.<br>3. Strict CSP headers block inline script execution and restrict network calls.                                |
| **Malicious File Uploads / RCE**      | Attacker uploads web shells or scripts disguised as receipt images.           | 1. Image upload is processed via base64 encoded strings (no temp files stored on disk).<br>2. Size limits enforced at Express middleware (4MB).<br>3. Magic bytes/file signature checking verifies image headers (PNG, JPEG, WebP) independent of file extension or Content-Type headers. |
| **Path Traversal / Arbitrary Write**  | Malicious filenames like `../../filename` traverse directory paths on server. | All uploaded filenames are stripped of directories (`path.basename`) and sanitized to alphanumeric characters, dashes, and dots.                                                                                                                                                          |
| **Denial of Service / API Abuse**     | Brute force calls to Express proxy exhaust API quotas.                        | IP-based rate limiting (15 req/min) utilizing `X-Forwarded-For` analysis to prevent global lockouts behind load balancers.                                                                                                                                                                |

---

## 2. Secrets Handling Policy

- **Development:** Developers use local `.env` files for configuration. The `.env` file must never be committed to source control (enforced in `.gitignore`).
- **Production / Cloud Deployments (GCP Cloud Run):**
  - **No Plaintext on Disk:** CarbonNode relies on a cloud secrets manager mounting pattern.
  - **GCP Secret Manager Integration:** The `GEMINI_API_KEY` is stored inside Google Cloud Secret Manager and mounted as a secure read-only volume at `/secrets/gemini-api-key` (configured in `server/shared/geminiClient.ts`).
  - **Fallback Chain:** The Express app checks for the mounted secret path at startup. If absent, it checks the runtime process environment variable, allowing fallback for development while keeping secrets out of env tables in production.

---

## 3. Security Headers Configuration

We utilize Helmet to set standard HTTP security response headers:

- **Content-Security-Policy (CSP):** Restricts script sources to `'self'` and connect sources to verified Google APIs.
- **X-Frame-Options: DENY:** Prevents Clickjacking by disallowing the application from being loaded inside frames or iframes.
- **Referrer-Policy: no-referrer:** Ensures no URL path details or parameters are leaked in the `Referer` header to external endpoints.
- **Permissions-Policy:** Explicitly disables access to sensitive browser capabilities (camera, microphone, geolocation, interest-cohort).

---

## 4. Reporting a Vulnerability & Disclosure Policy

We take the security of CarbonNode seriously. If you discover a security vulnerability within CarbonNode, please report it responsibly:

1. **Do not create public GitHub issues** for security vulnerabilities.
2. Email your findings privately to **security@carbonnode.local**.
3. Include detailed steps to reproduce, raw HTTP payloads, or proof-of-concept scripts.
4. **SLA:** We will acknowledge receipt of your report within 24 hours and provide a fix or mitigation plan within 48 hours.
5. **Safe Harbor:** We support research that is conducted in good faith. We will not pursue legal action against researchers who report vulnerabilities according to this policy and allow reasonable time for remediation.
