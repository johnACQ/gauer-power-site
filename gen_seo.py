import os, re, sys, datetime

D = os.path.expanduser("~/Desktop/apex_clients/aaron_gauer/static_site")
BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "https://johnacq.github.io/gauer-power-site"
TODAY = "2026-07-31"

PRIORITY = {"index.html":("1.0","weekly"),"gauer_residential.html":("0.9","monthly"),
  "gauer_commercial.html":("0.9","monthly"),"gauer_ev.html":("0.9","monthly"),
  "gauer_panel.html":("0.9","monthly"),"gauer_service_areas.html":("0.8","monthly"),
  "gauer_about.html":("0.6","monthly"),"gauer_contact.html":("0.7","monthly"),
  "privacy.html":("0.2","yearly"),"sms-terms.html":("0.2","yearly")}

pages = sorted([f for f in os.listdir(D) if f.endswith(".html")])

# ---- sitemap.xml ----
rows = []
for f in pages:
    loc = BASE + "/" + ("" if f == "index.html" else f)
    pri, freq = PRIORITY.get(f, ("0.5","monthly"))
    rows.append(f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>{TODAY}</lastmod>\n'
                f'    <changefreq>{freq}</changefreq>\n    <priority>{pri}</priority>\n  </url>')
open(os.path.join(D,"sitemap.xml"),"w").write(
  '<?xml version="1.0" encoding="UTF-8"?>\n'
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(rows) + "\n</urlset>\n")

# ---- robots.txt ----
open(os.path.join(D,"robots.txt"),"w").write(
  "User-agent: *\nAllow: /\n\nSitemap: " + BASE + "/sitemap.xml\n")

# ---- retarget canonical / og:url / JSON-LD to BASE ----
OLD = re.compile(r'https://johnacq\.github\.io/gauer-power-site|https://(?:www\.)?gauerpower\.ca')
changed = []
for f in pages:
    p = os.path.join(D,f); h = open(p,encoding="utf-8").read()
    n = OLD.sub(BASE, h)
    if n != h: open(p,"w",encoding="utf-8").write(n); changed.append(f)

print("BASE =", BASE)
print("sitemap.xml:", len(pages), "urls")
print("robots.txt : written")
print("retargeted :", len(changed), "pages", changed if changed else "(already correct)")
