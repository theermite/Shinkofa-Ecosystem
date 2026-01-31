# Markdown Generator Service
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.user import User, UserRole
from app.models.exercise import ExerciseScore, Exercise
from app.models.availability import Availability

class MarkdownGenerator:
    @staticmethod
    def yaml_fm(title, rtype, tags, author, dt):
        t = ", ".join(tags)
        d = dt.strftime("%Y-%m-%d")
        return f"---\ntitle: {title}\ndate: {d}\ntype: {rtype}\ntags: [{t}]\nauthor: {author}\nplatform: SLF E-Sport\n---\n\n"
    
    @staticmethod
    def header(title, level=2, emoji=""):
        p = "#" * level
        e = f"{emoji} " if emoji else ""
        return f"{p} {e}{title}\n\n"
    
    @staticmethod
    def table(headers, rows):
        h = "| " + " | ".join(str(x) for x in headers) + " |\n"
        s = "| " + " | ".join(["---"] * len(headers)) + " |\n"
        r = ""
        for row in rows:
            r += "| " + " | ".join(str(c) for c in row) + " |\n"
        return h + s + r + "\n"
    
    @staticmethod
    def callout(txt, ctype="info"):
        lines = txt.strip().split("\n")
        out = f"> [!{ctype}]\n"
        for line in lines:
            out += f"> {line}\n"
        return out + "\n"
    
    @staticmethod
    def link(txt):
        return f"[[{txt}]]"
    
    @staticmethod
    def bar(pct, w=20):
        f = int(w * (pct / 100))
        return "¢" * f + "║" * (w - f) + f" {pct:.1f}%"
    
    @staticmethod
    def gen_analytics(db, author, params=None):
        now = datetime.utcnow()
        days = params.get("period_days", 30) if params else 30
        start = now - timedelta(days=days)
        
        c = MarkdownGenerator.yaml_fm(
            f"Rapport Analytics - {now.strftime('%d/%m/%Y')}",
            "analytics",
            ["analytics", "performance", "team", "slf-esport"],
            f"{author.prenom} {author.nom}",
            now
        )
        c += MarkdownGenerator.header("Rapport Analyse Performance", 1, "📊")
        c += MarkdownGenerator.callout(f"Période: {start.strftime('%d/%m/%Y')} - {now.strftime('%d/%m/%Y')}\nGénérɩ par: {author.prenom} {author.nom}")
        
        tp = db.query(User).filter(User.role == UserRole.JOUEUR).count()
        ap = db.query(User).filter(and_(User.role == UserRole.JOUEUR, User.is_active == True)).count()
        te = db.query(Exercise).count()
        rs = db.query(ExerciseScore).filter(ExerciseScore.completed_at >= start).count()
        
        top = db.query(User.id, User.prenom, User.nom, func.count(ExerciseScore.id).label("t"), func.avg(ExerciseScore.score).label("a")).join(ExerciseScore).filter(ExerciseScore.completed_at >= start).group_by(User.id, User.prenom, User.nom).order_by(func.avg(ExerciseScore.score).desc()).limit(10).all()
        
        c += MarkdownGenerator.header("KPIs", 2, "🎯")
        c += MarkdownGenerator.table(["Métrique", "Valeur"], [["👥 Joueurs", tp], ["✅ Actifs", ap], ["📍 Exercices", te], ["🏆 Scores", rs]])
        
        c += MarkdownGenerator.header("Top 10 Joueurs", 2, "🏆")
        if top:
            rows = []
            for i, p in enumerate(top, 1):
                rows.append([i, MarkdownGenerator.link(f"{p.prenom} {p.nom}"), p.t, f"{p.a:.1f}", MarkdownGenerator.bar(p.a)])
            c += MarkdownGenerator.table(["#", "Joueur", "Ex", "Score", "Perf"], rows)
        else:
            c += "*Aucune donnée*\n\n"
        
        c += "---\n#analytics #slf-esport\n*Généré par SLF Platform*\n"
        return c
