import re


def limpar_texto(txt):
    if not txt:
        return ""

    return re.sub(r'\s+', ' ', txt).strip()


def texto(el, selector=None):
    try:
        t = el.query_selector(selector) if selector else el

        if not t:
            return ""

        return t.inner_text().strip()

    except:
        return ""


def attr(el, selector, attribute):
    try:
        t = el.query_selector(selector)

        if not t:
            return ""

        return (t.get_attribute(attribute) or "").strip()

    except:
        return ""


def extrair_tags(txt):
    """
    Transforma quebras de linha em array.
    """

    if not txt:
        return []

    linhas = txt.splitlines()

    tags = []

    for linha in linhas:
        linha = limpar_texto(linha)

        if linha:
            tags.append(linha)

    # remove duplicadas
    resultado = []
    vistos = set()

    for tag in tags:
        chave = tag.lower()

        if chave not in vistos:
            resultado.append(tag)
            vistos.add(chave)

    return resultado


def tipo_vaga(s):
    s = s.lower()

    if any(x in s for x in ["estágio", "estagio", "intern"]):
        return "Estágio"

    if any(x in s for x in ["híbrido", "hibrido", "hybrid"]):
        return "Híbrido"

    if any(x in s for x in ["remoto", "remote", "home office"]):
        return "Remoto"

    if any(x in s for x in ["presencial", "on-site"]):
        return "Presencial"

    return "Não informado"


def nivel(s):
    s = s.lower()

    if any(x in s for x in ["estágio", "estagio", "intern", "estudante"]):
        return "Estagiário"

    if any(x in s for x in ["júnior", "junior", "jr."]):
        return "Júnior"

    if any(x in s for x in ["pleno", "mid-level", "mid"]):
        return "Pleno"

    if any(x in s for x in ["sênior", "senior", "sr.", "lead", "staff"]):
        return "Sênior"

    return "Não informado"


def build(titulo, empresa, descricao, loc, link, fonte):

    full = f"{titulo} {loc} {descricao}"

    tags = extrair_tags(descricao)

    return {
        "titulo": titulo,
        "empresa": empresa or "Não informado",

        # array das infos quebradas
        "descricao": tags,

        "tipo_vaga": tipo_vaga(full),
        "nivel": nivel(full),
        "link": link,
        "fonte": fonte,
    }