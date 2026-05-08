"""
API de Vagas de TI
pip install flask playwright && playwright install chromium
"""

from flask import Flask, jsonify
from playwright.sync_api import sync_playwright
from scrapers import programathor, geekhunter, gupy, remoteok, indeed, vagas_com

app = Flask(__name__)


# ── Scrapers ────────────────────────────────────────────────────────────────

SCRAPERS = [remoteok, gupy, programathor, indeed, vagas_com, geekhunter]

# ── Rota ────────────────────────────────────────────────────────────────────

@app.route("/vagas")
def api_vagas():
    todas = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="pt-BR",
        ).new_page()

        for scraper in SCRAPERS:
            try:
                todas.extend(scraper(page))
            except Exception as e:
                print(f"Erro em {scraper.__name__}: {e}")

        browser.close()

    return jsonify({"total": len(todas), "vagas": todas})

if __name__ == "__main__":
    app.run(debug=True)