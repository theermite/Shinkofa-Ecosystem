"""
Email utility for Shizen Planner Service
Shinkofa Platform - Profile regeneration notifications
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

logger = logging.getLogger(__name__)

# Email config from environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@shinkofa.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Shinkofa")
EMAIL_ENABLED = os.getenv("EMAIL_ENABLED", "true").lower() == "true"


def send_profile_regeneration_email(
    to_email: str,
    username: str,
) -> bool:
    """
    Send profile regeneration notification email

    Args:
        to_email: User email address
        username: User display name

    Returns:
        bool: True if sent successfully
    """
    if not EMAIL_ENABLED:
        logger.info(f"Email disabled. Would notify {to_email} about profile update")
        return True

    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP not configured for planner service")
        return False

    subject = "🎯 Ton profil Shinkofa a été mis à jour !"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 32px; margin-bottom: 10px; }}
            h1 {{ color: #7c3aed; margin: 0; font-size: 24px; }}
            .content {{ background: #f8fafc; border-radius: 12px; padding: 30px; margin: 20px 0; }}
            .highlight {{ background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }}
            .button {{ display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }}
            .footer {{ text-align: center; color: #64748b; font-size: 14px; margin-top: 40px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🌸</div>
                <h1>Shinkofa</h1>
            </div>

            <p>Bonjour <strong>{username}</strong>,</p>

            <div class="highlight">
                <p style="margin: 0; font-size: 18px;">✨ Bonne nouvelle !</p>
                <p style="margin: 10px 0 0 0;">Ton profil holistique a été mis à jour avec plus de détails dans les analyses.</p>
            </div>

            <div class="content">
                <p>Notre équipe a amélioré les analyses de ton profil pour te fournir des insights encore plus précis et personnalisés.</p>
                <p>Connecte-toi pour découvrir les nouvelles informations :</p>
                <ul>
                    <li>Analyse psychologique enrichie</li>
                    <li>Détails neurodivergence approfondis</li>
                    <li>Synthèse Shizen IA optimisée</li>
                </ul>
            </div>

            <p style="text-align: center;">
                <a href="https://app.shinkofa.com/profile/holistic" class="button">
                    Voir mon profil mis à jour
                </a>
            </p>

            <div class="footer">
                <p>L'équipe Shinkofa 🌸</p>
                <p style="font-size: 12px;">Tu reçois cet email car ton profil holistique a été mis à jour.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
Bonjour {username},

Bonne nouvelle ! Ton profil holistique Shinkofa a été mis à jour avec plus de détails dans les analyses.

Connecte-toi pour découvrir les améliorations :
https://app.shinkofa.com/profile/holistic

L'équipe Shinkofa
    """

    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message["To"] = to_email

        message.attach(MIMEText(text_content, "plain", "utf-8"))
        message.attach(MIMEText(html_content, "html", "utf-8"))

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())

        logger.info(f"Profile update email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
