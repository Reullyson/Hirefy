def texto(el, selector=None):
    try:
        t = el.query_selector(selector) if selector else el
        return t.inner_text().strip() if t else ""
    except:
        return ""
 
def attr(el, selector, attribute):
    try:
        t = el.query_selector(selector)
        return (t.get_attribute(attribute) or "").strip() if t else ""
    except:
        return ""
 
def tipo_vaga(s):
    s = s.lower()
    if any(x in s for x in ["estágio", "estagio", "intern"]):    return "Estágio"
    if any(x in s for x in ["híbrido", "hibrido", "hybrid"]):    return "Híbrido"
    if any(x in s for x in ["remoto", "remote", "home office"]): return "Remoto"
    if any(x in s for x in ["presencial", "on-site"]):           return "Presencial"
    return "Não informado"
 
def nivel(s):
    s = s.lower()
    if any(x in s for x in ["estágio", "estagio", "intern", "estudante"]): return "Estagiário"
    if any(x in s for x in ["júnior", "junior", "jr."]):   return "Júnior"
    if any(x in s for x in ["pleno", "mid-level", "mid"]): return "Pleno"
    if any(x in s for x in ["sênior", "senior", "sr.", "lead", "staff"]): return "Sênior"
    return "Não informado"
 
def build(titulo, empresa, descricao, loc, link, fonte):
    full = f"{titulo} {loc} {descricao}"
    return {
        "titulo":    titulo,
        "empresa":   empresa or "Não informado",
        "descricao": (descricao or "Ver link")[:300],
        "tipo_vaga": tipo_vaga(full),
        "nivel":     nivel(full),
        "link":      link,
        "fonte":     fonte,
    }

