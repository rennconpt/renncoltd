# Rennco Ltd — Ready-to-Upload (GitHub Pages)
- Uses your real logo in header + favicon (assets/logo.svg + assets/favicon.svg).
- Contact form via FormSubmit → contact.info@rennco.co.uk
- Floating WhatsApp, social badges (Google, Bark, Facebook, Email, WhatsApp)
- Reviews in /data/reviews.json
- Gallery: upload 1.jpg, 2.jpg, ... into /gallery

## Upload
1) Create a GitHub repo, upload **all files/folders** from this folder (keep the `CNAME` file).
2) Repo → Settings → Pages → Deploy from a branch → main / root → Save.
3) IONOS DNS → add A records to 185.199.108.153 / .109.153 / .110.153 / .111.153, and CNAME `www` → yourusername.github.io.
4) Back in Pages → set Custom domain = rennco.co.uk → Enforce HTTPS.

After deploy, submit the contact form once to verify with FormSubmit.
