"""
Email service - Send emails via SMTP (o2Switch)
"""

import logging
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import ssl

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""

    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email via SMTP

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (optional)

        Returns:
            True if email sent successfully, False otherwise
        """
        if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
            logger.error("SMTP configuration incomplete. Cannot send email.")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            message["To"] = to_email

            # Add text and HTML parts
            if text_content:
                part_text = MIMEText(text_content, "plain")
                message.attach(part_text)

            part_html = MIMEText(html_content, "html")
            message.attach(part_html)

            # Create secure SSL context
            context = ssl.create_default_context()

            # Connect to SMTP server and send email
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, to_email, message.as_string())

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    @staticmethod
    def send_password_reset_email(to_email: str, reset_token: str, username: str) -> bool:
        """
        Send password reset email with reset link

        Args:
            to_email: User's email address
            reset_token: Password reset token
            username: User's username

        Returns:
            True if email sent successfully
        """
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token}"

        subject = "Réinitialisation de votre mot de passe - SLF Esport"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .button {{
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white !important;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }}
                .warning {{
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔒 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
                <p>Bonjour <strong>{username}</strong>,</p>

                <p>Vous avez demandé la réinitialisation de votre mot de passe sur la plateforme <strong>SLF Esport</strong>.</p>

                <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Réinitialiser mon mot de passe</a>
                </div>

                <p>Ou copiez-collez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">
                    <a href="{reset_url}">{reset_url}</a>
                </p>

                <div class="warning">
                    <strong>⚠️ Important :</strong>
                    <ul>
                        <li>Ce lien est valide pendant <strong>1 heure</strong></li>
                        <li>Il ne peut être utilisé qu'<strong>une seule fois</strong></li>
                        <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                    </ul>
                </div>

                <p>Cordialement,<br>
                <strong>L'équipe SLF Esport</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 SLF Esport - La Salade de Fruits<br>
                Plateforme d'entraînement e-sport holistique</p>
                <p>Cet email a été envoyé à {to_email}</p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Réinitialisation de mot de passe - SLF Esport

        Bonjour {username},

        Vous avez demandé la réinitialisation de votre mot de passe sur la plateforme SLF Esport.

        Cliquez sur ce lien pour créer un nouveau mot de passe :
        {reset_url}

        IMPORTANT :
        - Ce lien est valide pendant 1 heure
        - Il ne peut être utilisé qu'une seule fois
        - Si vous n'avez pas demandé cette réinitialisation, ignorez cet email

        Cordialement,
        L'équipe SLF Esport

        © 2025 SLF Esport - La Salade de Fruits
        """

        return EmailService.send_email(to_email, subject, html_content, text_content)

    @staticmethod
    def send_welcome_email(to_email: str, username: str, temp_password: str) -> bool:
        """
        Send welcome email with temporary password

        Args:
            to_email: User's email address
            username: User's username
            temp_password: Temporary password

        Returns:
            True if email sent successfully
        """
        login_url = f"{settings.FRONTEND_URL}/login"

        subject = "Bienvenue sur SLF Esport - Vos identifiants de connexion"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .credentials {{
                    background: white;
                    border: 2px solid #667eea;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .button {{
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white !important;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }}
                .warning {{
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎮 Bienvenue sur SLF Esport !</h1>
            </div>
            <div class="content">
                <p>Bonjour <strong>{username}</strong>,</p>

                <p>Votre compte a été créé avec succès sur la plateforme <strong>SLF Esport</strong> !</p>

                <div class="credentials">
                    <h3 style="margin-top: 0;">🔑 Vos identifiants de connexion :</h3>
                    <p><strong>Nom d'utilisateur :</strong> {username}</p>
                    <p><strong>Mot de passe temporaire :</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px;">{temp_password}</code></p>
                </div>

                <div style="text-align: center;">
                    <a href="{login_url}" class="button">Se connecter</a>
                </div>

                <div class="warning">
                    <strong>⚠️ Sécurité :</strong>
                    <ul>
                        <li>Changez votre mot de passe dès votre première connexion</li>
                        <li>Utilisez un mot de passe fort (min. 8 caractères, 1 chiffre, 1 majuscule)</li>
                        <li>Ne partagez jamais vos identifiants</li>
                    </ul>
                </div>

                <p>Besoin d'aide ? Contactez votre coach ou l'équipe SLF Esport.</p>

                <p>Bon entraînement !<br>
                <strong>L'équipe SLF Esport</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 SLF Esport - La Salade de Fruits<br>
                Plateforme d'entraînement e-sport holistique</p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        Bienvenue sur SLF Esport !

        Bonjour {username},

        Votre compte a été créé avec succès sur la plateforme SLF Esport.

        VOS IDENTIFIANTS DE CONNEXION :
        Nom d'utilisateur : {username}
        Mot de passe temporaire : {temp_password}

        Connectez-vous ici : {login_url}

        IMPORTANT - Sécurité :
        - Changez votre mot de passe dès votre première connexion
        - Utilisez un mot de passe fort (min. 8 caractères, 1 chiffre, 1 majuscule)
        - Ne partagez jamais vos identifiants

        Bon entraînement !
        L'équipe SLF Esport

        © 2025 SLF Esport - La Salade de Fruits
        """

        return EmailService.send_email(to_email, subject, html_content, text_content)

    @staticmethod
    def send_contact_notification_email(
        submission_id: int,
        nom: str,
        email: str,
        sujet: str,
        message: str,
        to_email: str = "contact@lslf.shinkofa.com"
    ) -> bool:
        """
        Send notification email when someone submits contact form from website
        
        Args:
            submission_id: ID of the contact submission
            nom: Name of the person who submitted
            email: Email of the person who submitted
            sujet: Subject of the message
            message: Message content
            to_email: Email address to send notification to (default: contact@lslf.shinkofa.com)
            
        Returns:
            True if email sent successfully
        """
        platform_url = f"{settings.FRONTEND_URL}/dashboard"
        
        # Map sujet to French labels
        sujet_labels = {
            "support": "Support technique",
            "abonnement": "Question d'abonnement",
            "feedback": "Retour d'expérience",
            "partenariat": "Proposition de partenariat",
            "media": "Demande média/presse",
            "autre": "Autre"
        }
        sujet_label = sujet_labels.get(sujet, sujet)
        
        subject = f"🔔 Nouveau contact SLF Esport - {sujet_label}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #dc2626 0%, #db2777 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .info-box {{
                    background: white;
                    border-left: 4px solid #dc2626;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 5px;
                }}
                .message-box {{
                    background: white;
                    border: 1px solid #e5e7eb;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }}
                .button {{
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #dc2626 0%, #db2777 100%);
                    color: white !important;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }}
                .label {{
                    font-weight: bold;
                    color: #dc2626;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📬 Nouveau message de contact</h1>
                <p style="font-size: 18px; margin: 10px 0 0 0;">Site vitrine SLF Esport</p>
            </div>
            <div class="content">
                <p>Un nouveau message a été soumis via le formulaire de contact du site vitrine.</p>
                
                <div class="info-box">
                    <h3 style="margin-top: 0;">📋 Informations du contact</h3>
                    <p><span class="label">Nom :</span> {nom}</p>
                    <p><span class="label">Email :</span> <a href="mailto:{email}">{email}</a></p>
                    <p><span class="label">Sujet :</span> {sujet_label}</p>
                    <p><span class="label">ID submission :</span> #{submission_id}</p>
                </div>
                
                <h3>💬 Message :</h3>
                <div class="message-box">
{message}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{platform_url}" class="button">📊 Voir dans la plateforme</a>
                    <br><br>
                    <a href="mailto:{email}" class="button" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
                        📧 Répondre directement
                    </a>
                </div>
                
                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 5px;">
                    <p style="margin: 0;"><strong>💡 Astuce :</strong> Les demandes de contact sont également visibles dans le dashboard Manager de la plateforme, dans la section "Demandes de contact".</p>
                </div>
                
                <p style="margin-top: 30px;">Cordialement,<br>
                <strong>Système SLF Esport</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 SLF Esport - La Salade de Fruits<br>
                Notification automatique de la plateforme d'entraînement e-sport</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        NOUVEAU MESSAGE DE CONTACT - SLF ESPORT
        
        Un nouveau message a été soumis via le formulaire de contact du site vitrine.
        
        INFORMATIONS DU CONTACT :
        Nom : {nom}
        Email : {email}
        Sujet : {sujet_label}
        ID submission : #{submission_id}
        
        MESSAGE :
        {message}
        
        ---
        
        Voir dans la plateforme : {platform_url}
        Répondre directement : {email}
        
        © 2025 SLF Esport - La Salade de Fruits
        """
        
        return EmailService.send_email(to_email, subject, html_content, text_content)

    @staticmethod
    def send_recruitment_notification_email(
        application_id: int,
        pseudo: str,
        email: str,
        motivation: str,
        to_email: str = "contact@lslf.shinkofa.com"
    ) -> bool:
        """
        Send notification email when someone submits a recruitment application

        Args:
            application_id: ID of the recruitment application
            pseudo: Gaming pseudo of the applicant
            email: Email of the applicant
            motivation: Motivation text (truncated preview)
            to_email: Email address to send notification to

        Returns:
            True if email sent successfully
        """
        platform_url = f"{settings.FRONTEND_URL}/recruitment"

        subject = f"🎮 Nouvelle candidature SLF Esport - {pseudo}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .info-box {{
                    background: white;
                    border-left: 4px solid #3b82f6;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 5px;
                }}
                .motivation-box {{
                    background: white;
                    border: 1px solid #e5e7eb;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 8px;
                    font-style: italic;
                }}
                .button {{
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    color: white !important;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎮 Nouvelle Candidature</h1>
                <p>Un nouveau joueur souhaite rejoindre l'équipe !</p>
            </div>
            <div class="content">
                <div class="info-box">
                    <p><strong>Pseudo :</strong> {pseudo}</p>
                    <p><strong>Email :</strong> <a href="mailto:{email}">{email}</a></p>
                    <p><strong>ID candidature :</strong> #{application_id}</p>
                </div>

                <h3>💬 Aperçu de la motivation :</h3>
                <div class="motivation-box">
                    "{motivation}"
                </div>

                <p style="text-align: center;">
                    <a href="{platform_url}" class="button">
                        📋 Voir la candidature complète
                    </a>
                </p>

                <p style="margin-top: 30px;">Cordialement,<br>
                <strong>Système SLF Esport</strong></p>
            </div>
            <div class="footer">
                <p>© 2025 SLF Esport - La Salade de Fruits<br>
                Notification automatique de recrutement</p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
        NOUVELLE CANDIDATURE - SLF ESPORT

        Un nouveau joueur souhaite rejoindre l'équipe !

        INFORMATIONS :
        Pseudo : {pseudo}
        Email : {email}
        ID candidature : #{application_id}

        APERÇU MOTIVATION :
        "{motivation}"

        ---

        Voir la candidature complète : {platform_url}

        © 2025 SLF Esport - La Salade de Fruits
        """

        return EmailService.send_email(to_email, subject, html_content, text_content)


# Create global email service instance
email_service = EmailService()
