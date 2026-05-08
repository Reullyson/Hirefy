from puxador_textual import texto, attr, build, nivel, tipo_vaga
import json

def remoteok(page):
    vagas = []
    page.goto("https://remoteok.com/remote-dev-jobs", wait_until="load", timeout=60000)
    page.wait_for_timeout(4000)
    for row in page.query_selector_all("tr.job")[:10]:
        titulo  = texto(row, "h2")
        empresa = texto(row, "h3")
        tags    = " ".join(t.inner_text() for t in row.query_selector_all(".tags .tag"))
        href    = attr(row, "a.preventLink", "href")
        if not titulo or not href: continue
        vagas.append(build(titulo, empresa, tags, "remote", "https://remoteok.com" + href, "Remote OK"))
    return vagas

def gupy(page):
    vagas = []
    page.goto("https://portal.api.gupy.io/api/job?jobName=desenvolvedor&limit=15", timeout=30000)
    try:
        data = json.loads(page.inner_text("body"))
        for j in data.get("data", []):
            titulo  = j.get("name", "")
            empresa = j.get("careerPageName", "")
            loc     = j.get("workplaceType", "")
            link    = j.get("jobUrl") or f"https://portal.gupy.io/job/{j.get('id','')}"
            if not titulo: continue
            vagas.append(build(titulo, empresa, "", loc, link, "Gupy"))
    except:
        pass
    return vagas

def programathor(page):
    vagas = []
    page.goto("https://programathor.com.br/jobs", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(3000)
    for card in page.query_selector_all("article, .job-card")[:10]:
        titulo  = texto(card, "h2") or texto(card, "h3")
        empresa = texto(card, ".company-name") or texto(card, ".company")
        loc     = texto(card, ".location")
        desc    = texto(card, "p")
        href    = attr(card, "a", "href")
        if not titulo or not href: continue
        link = "https://programathor.com.br" + href if href.startswith("/") else href
        vagas.append(build(titulo, empresa, desc, loc, link, "Programathor"))
    return vagas

def indeed(page):
    vagas = []
    page.goto("https://br.indeed.com/jobs?q=desenvolvedor&l=", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(3000)
    for card in page.query_selector_all(".job_seen_beacon, .tapItem")[:10]:
        titulo  = texto(card, "h2")
        empresa = texto(card, ".companyName") or texto(card, "[data-testid='company-name']")
        loc     = texto(card, ".companyLocation") or texto(card, "[data-testid='text-location']")
        desc    = texto(card, ".job-snippet")
        href    = attr(card, "a", "href")
        if not titulo or not href: continue
        link = "https://br.indeed.com" + href if href.startswith("/") else href
        vagas.append(build(titulo, empresa, desc, loc, link, "Indeed"))
    return vagas

def vagas_com(page):
    vagas = []
    page.goto("https://www.vagas.com.br/vagas-de-programacao", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(3000)
    for item in page.query_selector_all("li.vaga, .vagaResult")[:10]:
        titulo  = texto(item, "a.link-detalhes-vaga") or texto(item, "h2")
        empresa = texto(item, ".emprVaga") or texto(item, ".nome-empresa")
        loc     = texto(item, ".local")
        desc    = texto(item, ".detalhes-vaga")
        href    = attr(item, "a.link-detalhes-vaga", "href") or attr(item, "a", "href")
        if not titulo or not href: continue
        link = "https://www.vagas.com.br" + href if href.startswith("/") else href
        vagas.append(build(titulo, empresa, desc, loc, link, "Vagas.com.br"))
    return vagas

def geekhunter(page):
    vagas = []
    page.goto("https://www.geekhunter.com.br/vagas", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(4000)
    for card in page.query_selector_all("article, .job-card, .vacancy-card")[:10]:
        titulo  = texto(card, "h2") or texto(card, "h3")
        empresa = texto(card, ".company") or texto(card, ".company-name")
        loc     = texto(card, ".location")
        desc    = texto(card, "p")
        href    = attr(card, "a", "href")
        if not titulo or not href: continue
        link = "https://www.geekhunter.com.br" + href if href.startswith("/") else href
        vagas.append(build(titulo, empresa, desc, loc, link, "GeekHunter"))
    return vagas
