from puxador_textual import texto, attr, build, nivel, tipo_vaga
import json

MAX_RESULTS = 10
NAV_TIMEOUT = 20000
WAIT_TIMEOUT = 8000


async def remoteok(page):
    vagas = []
    await page.goto("https://remoteok.com/remote-dev-jobs", wait_until="load", timeout=NAV_TIMEOUT)
    await page.wait_for_selector("tr.job", timeout=WAIT_TIMEOUT)
    for row in await page.query_selector_all("tr.job"):
        if len(vagas) >= MAX_RESULTS:
            break
        titulo  = await texto(row, "h2")
        empresa = await texto(row, "h3")
        tag_els = await row.query_selector_all(".tags .tag")
        tags    = " ".join([await t.inner_text() for t in tag_els])
        href    = await attr(row, "a.preventLink", "href")
        if not titulo or not href: continue
        vagas.append(build(titulo, empresa, tags, "remote", "https://remoteok.com" + href, "Remote OK"))
    return vagas


async def gupy(page):
    vagas = []
    await page.goto("https://portal.api.gupy.io/api/job?jobName=desenvolvedor&limit=10", timeout=NAV_TIMEOUT)
    try:
        data = json.loads(await page.inner_text("body"))
        for j in data.get("data", [])[:MAX_RESULTS]:
            titulo  = j.get("name", "")
            empresa = j.get("careerPageName", "")
            loc     = j.get("workplaceType", "")
            link    = j.get("jobUrl") or f"https://portal.gupy.io/job/{j.get('id','')}"
            if not titulo: continue
            vagas.append(build(titulo, empresa, "", loc, link, "Gupy"))
    except:
        pass
    return vagas


async def programathor(page):
    vagas = []
    await page.goto("https://programathor.com.br/jobs", wait_until="load", timeout=NAV_TIMEOUT)
    await page.wait_for_selector("article, .job-card", timeout=WAIT_TIMEOUT)
    for card in await page.query_selector_all("article, .job-card"):
        if len(vagas) >= MAX_RESULTS:
            break
        titulo  = await texto(card, "h2") or await texto(card, "h3")
        empresa = await texto(card, ".company-name") or await texto(card, ".company")
        loc     = await texto(card, ".location")
        desc    = await texto(card, "p")
        href    = await attr(card, "a", "href")
        if not titulo or not href: continue
        link = "https://programathor.com.br" + href if href.startswith("/") else href
        vagas.append(build(titulo, empresa, desc, loc, link, "Programathor"))
    return vagas


async def indeed(page):
    vagas = []
    await page.goto("https://br.indeed.com/jobs?q=desenvolvedor&l=", wait_until="load", timeout=NAV_TIMEOUT)
    await page.wait_for_selector(".job_seen_beacon, .tapItem", timeout=WAIT_TIMEOUT)
    for card in await page.query_selector_all(".job_seen_beacon, .tapItem"):
        if len(vagas) >= MAX_RESULTS:
            break
        titulo  = await texto(card, "h2")
        empresa = await texto(card, ".companyName") or await texto(card, "[data-testid='company-name']")
        loc     = await texto(card, ".companyLocation") or await texto(card, "[data-testid='text-location']")
        desc    = await texto(card, ".job-snippet")
        href    = await attr(card, "a", "href")
        if not titulo or not href: continue
        link = "https://br.indeed.com" + href if href.startswith("/") else href
        vagas.append(build(titulo, empresa, desc, loc, link, "Indeed"))
    return vagas


async def vagas_com(page):
    vagas = []
    await page.goto("https://www.vagas.com.br/vagas-de-programacao", wait_until="load", timeout=NAV_TIMEOUT)
    await page.wait_for_selector("li.vaga, .vagaResult", timeout=WAIT_TIMEOUT)
    for item in await page.query_selector_all("li.vaga, .vagaResult"):
        if len(vagas) >= MAX_RESULTS:
            break
        titulo  = await texto(item, "a.link-detalhes-vaga") or await texto(item, "h2")
        empresa = await texto(item, ".emprVaga") or await texto(item, ".nome-empresa")
        loc     = await texto(item, ".local")
        desc    = await texto(item, ".detalhes-vaga")
        href    = await attr(item, "a.link-detalhes-vaga", "href") or await attr(item, "a", "href")
        if not titulo or not href: continue
        link = "https://www.vagas.com.br" + href if href.startswith("/") else href
        vagas.append(build(titulo, empresa, desc, loc, link, "Vagas.com.br"))
    return vagas


async def geekhunter(page):
    vagas = []
    await page.goto("https://www.geekhunter.com.br/vagas", wait_until="load", timeout=NAV_TIMEOUT)
    await page.wait_for_selector("article, .job-card, .vacancy-card", timeout=WAIT_TIMEOUT)
    for card in await page.query_selector_all("article, .job-card, .vacancy-card"):
        if len(vagas) >= MAX_RESULTS:
            break
        titulo  = await texto(card, "h2") or await texto(card, "h3")
        empresa = await texto(card, ".company") or await texto(card, ".company-name")
        loc     = await texto(card, ".location")
        desc    = await texto(card, "p")
        href    = await attr(card, "a", "href")
        if not titulo or not href: continue
        link = "https://www.geekhunter.com.br" + href if href.startswith("/") else href
        vagas.append(build(titulo, empresa, desc, loc, link, "GeekHunter"))
    return vagas

async def scrape_gupy_job(page, url):
    """
    Scrapes a single job from a Gupy URL.
    """
    await page.goto(url, wait_until="networkidle", timeout=NAV_TIMEOUT)
    
    # Try to extract data from structured JSON if available, or fallback to DOM
    try:
        # Gupy usually has a __NEXT_DATA__ script
        data_json = await page.evaluate("() => JSON.parse(document.getElementById('__NEXT_DATA__').textContent)")
        job_data = data_json['props']['pageProps']['job']
        
        # Mapping Gupy levels to our choices
        level_map = {
            'Estágio': 'ESTAGIO',
            'Júnior': 'JUNIOR',
            'Pleno': 'PLENO',
            'Sênior': 'SENIOR',
            'Especialista': 'SENIOR',
            'Gerência': 'SENIOR',
            'Diretoria': 'SENIOR'
        }
        
        # Mapping Gupy contract types
        contract_map = {
            'CLT': 'CLT',
            'Pessoa Jurídica': 'PJ',
            'Estágio': 'ESTAGIO',
            'Temporário': 'CLT',
            'Autônomo': 'PJ'
        }

        # Mapping Location types
        location_type_map = {
            'remote': 'REMOTO',
            'Remoto': 'REMOTO',
            'on-site': 'PRESENCIAL',
            'Presencial': 'PRESENCIAL',
            'hybrid': 'HIBRIDO',
            'Híbrido': 'HIBRIDO'
        }

        res = {
            'title': job_data.get('name'),
            'description': f"{job_data.get('description', '')}\n\n### Responsabilidades\n{job_data.get('responsibilities', '')}",
            'requirements_mandatory': job_data.get('prerequisites'),
            'requirements_desirable': "",
            'benefits': job_data.get('relevantExperiences'),
            'level': level_map.get(job_data.get('careerLevel'), 'PLENO' if 'Pleno' in job_data.get('name', '') else 'JUNIOR'),
            'contract_type': contract_map.get(job_data.get('type'), 'CLT'),
            'location_type': location_type_map.get(job_data.get('workplaceType'), 'REMOTO'),
            'city': job_data.get('addressCity') or 'Remoto',
            'state': job_data.get('addressState') or 'Remote',
            'workload': "Não informado",
            'education_level': "Não informado"
        }
        return res
    except Exception as e:
        print(f"Erro ao extrair via JSON: {e}")
        # Fallback to simple DOM scraping if JSON-LD/NextData fails
        titulo = await texto(page, "h1")
        desc = await texto(page, "[data-testid='text-description']")
        req = await texto(page, "[data-testid='text-requirements']")
        
        return {
            'title': titulo,
            'description': desc,
            'requirements_mandatory': req,
            'requirements_desirable': "",
            'benefits': "",
            'level': 'JUNIOR',
            'contract_type': 'CLT',
            'location_type': 'REMOTO',
            'city': 'Vários',
            'state': 'Vários',
            'workload': "Não informado",
            'education_level': "Não informado"
        }
