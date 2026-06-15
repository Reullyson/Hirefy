import os
import subprocess
import tempfile
import re

def escape_latex(text):
    if not text:
        return ""
    text = str(text)
    # LaTeX special characters
    conv = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\^{}',
        '\\': r'\textbackslash{}',
    }
    regex = re.compile('|'.join(re.escape(str(key)) for key in sorted(conv.keys(), key=lambda item: -len(item))))
    return regex.sub(lambda match: conv[match.group()], text)

def generate_resume_pdf(student):
    # Prepare data safely
    full_name = escape_latex(student.full_name or student.user.nome or "Nome não informado")
    email = escape_latex(student.user.email)
    city = escape_latex(student.city) if student.city else ""
    linkedin = escape_latex(student.linkedin_url) if student.linkedin_url else ""
    github = escape_latex(student.github_url) if student.github_url else ""
    portfolio = escape_latex(student.portfolio_url) if student.portfolio_url else ""
    
    enrollment = escape_latex(student.enrollment)
    course = escape_latex(student.course or "Ciência da Computação")
    semester = escape_latex(student.semester)
    skills = escape_latex(student.skills) if student.skills else ""

    contact_parts = []
    if email: contact_parts.append(email)
    if city: contact_parts.append(city)
    contact_str = " | ".join(contact_parts)
    
    link_parts = []
    if linkedin: link_parts.append(f"\\href{{{student.linkedin_url}}}{{LinkedIn}}")
    if github: link_parts.append(f"\\href{{{student.github_url}}}{{GitHub}}")
    if portfolio: link_parts.append(f"\\href{{{student.portfolio_url}}}{{Portfólio}}")
    link_str = " | ".join(link_parts)
    
    # Experiences
    experiences_tex = ""
    experiences = student.experiences.all().order_by('-start_date') if hasattr(student.experiences, 'order_by') else student.experiences.all()
    if experiences.exists():
        experiences_tex += r"\section*{Experiência Profissional}" + "\n"
        experiences_tex += r"\hrule" + "\n"
        experiences_tex += r"\vspace{2mm}" + "\n"
        for exp in experiences:
            end_date_str = exp.end_date.strftime('%b %Y') if exp.end_date else 'Atual'
            start_date_str = exp.start_date.strftime('%b %Y') if exp.start_date else ''
            date_range = escape_latex(f"{start_date_str} - {end_date_str}" if start_date_str else "")
            title = escape_latex(exp.title)
            inst = escape_latex(exp.institution)
            desc = escape_latex(exp.description)
            experiences_tex += rf"\noindent \textbf{{{title}}} na \textbf{{{inst}}} \hfill {date_range} \\" + "\n"
            experiences_tex += rf"{desc}" + "\n"
            experiences_tex += r"\vspace{3mm}" + "\n"

    # Courses
    courses_tex = ""
    courses = student.courses.all()
    if courses.exists():
        courses_tex += r"\section*{Cursos e Certificações}" + "\n"
        courses_tex += r"\hrule" + "\n"
        courses_tex += r"\vspace{2mm}" + "\n"
        for course in courses:
            name = escape_latex(course.name)
            issuer = escape_latex(course.issuer)
            workload = escape_latex(course.workload)
            courses_tex += rf"\noindent \textbf{{{name}}} - {issuer} \hfill {workload}h" + "\n"
            courses_tex += r"\vspace{2mm}" + "\n"

    # Habilidades Section
    skills_tex = ""
    if skills:
        skills_tex += r"\section*{Habilidades}" + "\n"
        skills_tex += r"\hrule" + "\n"
        skills_tex += r"\vspace{2mm}" + "\n"
        skills_tex += skills + "\n"
        skills_tex += r"\vspace{5mm}" + "\n"

    # LaTeX Template
    latex_code = f"""\\documentclass[11pt,a4paper]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage[T1]{{fontenc}}
\\usepackage[left=2cm,right=2cm,top=2cm,bottom=2cm]{{geometry}}
\\usepackage{{hyperref}}
\\usepackage{{titlesec}}

\\begin{{document}}
\\pagestyle{{empty}}

\\begin{{center}}
    {{\\huge \\textbf{{{full_name}}}}} \\\\
    \\vspace{{2mm}}
    {contact_str} \\\\
    {link_str}
\\end{{center}}

\\vspace{{5mm}}

\\section*{{Educação}}
\\hrule
\\vspace{{2mm}}
\\noindent \\textbf{{Curso:}} {course} \\hfill \\textbf{{Semestre:}} {semester}º semestre

\\vspace{{5mm}}

{skills_tex}

{experiences_tex}

{courses_tex}

\\end{{document}}
"""

    # Compile LaTeX to PDF using pdflatex
    with tempfile.TemporaryDirectory() as temp_dir:
        tex_file_path = os.path.join(temp_dir, 'resume.tex')
        pdf_file_path = os.path.join(temp_dir, 'resume.pdf')
        
        with open(tex_file_path, 'w', encoding='utf-8') as f:
            f.write(latex_code)
            
        try:
            subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', '-output-directory', temp_dir, tex_file_path],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            with open(pdf_file_path, 'rb') as f:
                pdf_data = f.read()
                
            return pdf_data
            
        except subprocess.CalledProcessError as e:
            error_msg = e.stdout.decode('utf-8') if e.stdout else str(e)
            print(f"LaTeX Compilation Error: {error_msg}")
            raise Exception("Erro ao gerar o currículo em PDF.")
