"""
API de Vagas de TI
pip install flask playwright && playwright install chromium
"""

import time
import asyncio

from flask import Flask, jsonify, request
from playwright.async_api import async_playwright
from scrapers import remoteok, gupy, programathor, indeed, vagas_com, geekhunter, scrape_gupy_job

app = Flask(__name__)


# ── Scrapers ────────────────────────────────────────────────────────────────

SCRAPERS = [remoteok, programathor, vagas_com, geekhunter]

# ── Cache ───────────────────────────────────────────────────────────────────

CACHE = {}
CACHE_TTL = 600

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


async def _run_all():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        async def _run_one(scraper_func):
            context = await browser.new_context(user_agent=USER_AGENT, locale="pt-BR")
            page = await context.new_page()
            try:
                return await scraper_func(page)
            except Exception as e:
                print(f"Erro em {scraper_func.__name__}: {e}")
                return []
            finally:
                await context.close()

        todos = await asyncio.gather(*[_run_one(s) for s in SCRAPERS])
        await browser.close()

    todas = []
    for r in todos:
        todas.extend(r)
    return distribuir(todas, 30)


def distribuir(vagas, limite):
    from collections import defaultdict
    grupos = defaultdict(list)
    for v in vagas:
        grupos[v["fonte"]].append(v)

    resultado = []
    fontes = list(grupos.keys())

    while len(resultado) < limite and fontes:
        for fonte in fontes.copy():
            if len(resultado) >= limite:
                break
            if grupos[fonte]:
                resultado.append(grupos[fonte].pop(0))
            if not grupos[fonte]:
                fontes.remove(fonte)
    return resultado


# ── Rotas ───────────────────────────────────────────────────────────────────

@app.route("/vagas")
def api_vagas():
    now = time.time()
    cached = CACHE.get("vagas")
    if cached and (now - cached["timestamp"]) < CACHE_TTL:
        return jsonify(cached["data"])

    todas = asyncio.run(_run_all())

    data = {"total": len(todas), "vagas": todas}
    CACHE["vagas"] = {"data": data, "timestamp": now}

    return jsonify(data)

@app.route("/scrape-gupy")
def api_scrape_gupy():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    async def _run():
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=USER_AGENT, locale="pt-BR")
            page = await context.new_page()
            try:
                return await scrape_gupy_job(page, url)
            finally:
                await browser.close()
    
    try:
        data = asyncio.run(_run())
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
