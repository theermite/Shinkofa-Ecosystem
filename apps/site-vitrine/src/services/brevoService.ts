/**
 * Service pour l'intégration Brevo (SendinBlue)
 * Envoi des résultats du questionnaire par email
 */

import axios from 'axios';
import type { QuestionAnswer } from '../types/questionnaire';
import { generateAIPrompt, generateAnswersText } from './promptGenerator';

// Types Brevo
interface BrevoContact {
  email: string;
  attributes?: Record<string, any>;
  listIds?: number[];
  updateEnabled?: boolean;
}

interface BrevoEmailData {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Configuration Brevo
 * IMPORTANT: Les clés API doivent être définies dans les variables d'environnement
 */
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';
const BREVO_API_URL = 'https://api.brevo.com/v3';
const SENDER_EMAIL = 'contact@shinkofa.com';
const SENDER_NAME = 'Shinkofa';
const ADMIN_EMAIL = 'contact@shinkofa.com'; // Email qui recevra les réponses

/**
 * Instance axios configurée pour Brevo
 */
const brevoApi = axios.create({
  baseURL: BREVO_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'api-key': BREVO_API_KEY
  }
});

/**
 * Ajouter ou mettre à jour un contact dans Brevo
 */
export async function addOrUpdateContact(contact: BrevoContact): Promise<void> {
  try {
    await brevoApi.post('/contacts', contact);
  } catch (error: any) {
    // Si le contact existe déjà (code 400), on le met à jour
    if (error.response?.status === 400 && error.response?.data?.code === 'duplicate_parameter') {
      await brevoApi.put(`/contacts/${encodeURIComponent(contact.email)}`, {
        attributes: contact.attributes,
        listIds: contact.listIds
      });
    } else {
      throw error;
    }
  }
}

/**
 * Envoyer un email transactionnel via Brevo
 */
export async function sendEmail(emailData: BrevoEmailData): Promise<void> {
  await brevoApi.post('/smtp/email', emailData);
}

/**
 * Formater les réponses du questionnaire en HTML
 */
function formatAnswersAsHTML(answers: QuestionAnswer[], questionsMap: Map<string, { title: string; type: string }>): string {
  let html = '<h2>Réponses au Questionnaire Shinkofa</h2><div style="font-family: Arial, sans-serif;">';

  answers.forEach(answer => {
    const question = questionsMap.get(answer.questionId);
    if (!question) return;

    html += `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f6f0; border-left: 4px solid #e08f34; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #1c3049;">${question.title}</p>
        <p style="margin: 0; color: #4a5568;">
    `;

    if (Array.isArray(answer.value)) {
      html += answer.value.join(', ');
    } else if (typeof answer.value === 'number') {
      html += `${answer.value}/10`;
    } else {
      html += answer.value.toString().replace(/\n/g, '<br>');
    }

    html += `
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #999;">
          Répondu le ${new Date(answer.answeredAt).toLocaleString('fr-FR')}
        </p>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

/**
 * Soumettre les résultats du questionnaire via Brevo
 */
export async function submitQuestionnaire(
  email: string,
  name: string,
  answers: QuestionAnswer[],
  questionsMap: Map<string, { title: string; type: string }>
): Promise<void> {
  try {
    // Récupérer le prénom et nom depuis les réponses
    const prenomAnswer = answers.find(a => a.questionId === 'prenom');
    const nomAnswer = answers.find(a => a.questionId === 'nom');

    const userInfo = {
      email,
      prenom: prenomAnswer?.value as string || name || 'Utilisateur',
      nom: nomAnswer?.value as string || '',
    };

    // Générer le prompt IA et les réponses formatées
    const aiPrompt = generateAIPrompt(userInfo, answers, questionsMap);
    const answersText = generateAnswersText(answers, questionsMap);

    // 1. Ajouter le contact à Brevo
    const contactData: BrevoContact = {
      email,
      attributes: {
        PRENOM: userInfo.prenom,
        NOM: userInfo.nom,
        QUESTIONNAIRE_COMPLETE: true,
        DATE_QUESTIONNAIRE: new Date().toISOString()
      },
      updateEnabled: true
    };

    await addOrUpdateContact(contactData);

    // 2. Envoyer un email de confirmation à l'utilisateur avec prompt IA
    const confirmationEmail: BrevoEmailData = {
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL
      },
      to: [
        {
          email,
          name: userInfo.prenom || undefined
        }
      ],
      subject: '✨ Génère ta Synthèse Holistique - Questionnaire Shinkofa complété !',
      htmlContent: `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1c3049; }
            .header { background: linear-gradient(135deg, #e08f34 0%, #f5cd3e 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; background-color: #ffffff; }
            .prompt-box { background-color: #f8f6f0; border-left: 4px solid #e08f34; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .instructions-box { background-color: #fff8e6; border: 2px solid #f5cd3e; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { background-color: #1c3049; color: white; padding: 20px; text-align: center; font-size: 12px; }
            .btn { display: inline-block; padding: 12px 24px; background-color: #e08f34; color: white; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: bold; }
            .step { margin: 15px 0; padding-left: 20px; }
            pre { background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 11px; white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Merci ${userInfo.prenom} ! 🙏</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Ton questionnaire Shinkofa est complet !</p>
          </div>
          <div class="content">
            <h2>🎯 Génère maintenant ta Synthèse Holistique Personnalisée</h2>
            <p>Tu as répondu à toutes les questions. Voici comment obtenir ton <strong>Manuel Holistique</strong> complet généré par IA :</p>

            <div class="instructions-box">
              <h3 style="margin-top: 0; color: #e08f34;">📖 Instructions en 6 étapes simples :</h3>
              <div class="step">
                <strong>1️⃣ Génère ta Carte de Design Humain</strong><br>
                <a href="https://www.mybodygraph.com/" target="_blank" class="btn">mybodygraph.com</a>
                <span style="font-size: 12px; color: #666;">(ou jovianarchive.com)</span>
              </div>
              <div class="step">
                <strong>2️⃣ Génère ta Carte du Ciel (Thème Astral)</strong><br>
                <a href="https://www.astro.com/" target="_blank" class="btn">astro.com</a>
                <span style="font-size: 12px; color: #666;">(Section "Horoscope gratuit" > "Carte du ciel")</span>
              </div>
              <div class="step">
                <strong>3️⃣ Ouvre Perplexity (RECOMMANDÉ)</strong><br>
                <a href="https://www.perplexity.ai/" target="_blank" class="btn">perplexity.ai</a><br>
                <span style="font-size: 12px; color: #666;">⚠️ Sélectionne le modèle <strong>"Claude Sonnet 4.5 (raisonnement)"</strong></span>
              </div>
              <div class="step">
                <strong>4️⃣ Copie le prompt IA ci-dessous</strong>
              </div>
              <div class="step">
                <strong>5️⃣ Colle le prompt + joins tes 2 cartes (Design Humain + Carte du Ciel)</strong>
              </div>
              <div class="step">
                <strong>6️⃣ Lance la génération et patiente 2-5 minutes ⏳</strong>
              </div>
            </div>

            <div class="prompt-box">
              <h3 style="margin-top: 0; color: #e08f34;">🤖 TON PROMPT IA PERSONNALISÉ</h3>
              <p style="font-size: 13px; color: #666;">Copie TOUT le texte ci-dessous (du début à la fin) :</p>
              <pre>${aiPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </div>

            <h3>📊 Tes réponses complètes au questionnaire</h3>
            <p style="font-size: 13px; color: #666;">Elles sont déjà incluses dans le prompt ci-dessus. Tu peux aussi les consulter ci-dessous :</p>
            <details>
              <summary style="cursor: pointer; color: #e08f34; font-weight: bold;">Voir mes réponses détaillées ▼</summary>
              <pre style="margin-top: 15px;">${answersText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </details>

            <hr style="margin: 40px 0; border: none; border-top: 2px solid #f5cd3e;">

            <h3>💡 Besoin d'aide ?</h3>
            <ul>
              <li>📧 Contacte-nous : <a href="mailto:contact@shinkofa.com">contact@shinkofa.com</a></li>
              <li>🌐 FAQ : <a href="https://shinkofa.com/faq">shinkofa.com/faq</a></li>
              <li>💬 Discord (bientôt disponible)</li>
            </ul>

            <p style="margin-top: 30px; font-style: italic; color: #666; text-align: center;">
              真の歩 (Shin-Ko-Fa) - "Le Véritable Pas"<br>
              Chaque pas authentique sur ton chemin unique est plus précieux que mille pas empruntés sur le chemin d'un autre.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 La Voie Shinkofa - Tous droits réservés</p>
            <p>
              <a href="https://shinkofa.com" style="color: #f5cd3e; text-decoration: none;">shinkofa.com</a> |
              <a href="mailto:contact@shinkofa.com" style="color: #f5cd3e; text-decoration: none;">contact@shinkofa.com</a>
            </p>
          </div>
        </body>
        </html>
      `
    };

    await sendEmail(confirmationEmail);

    // 3. Envoyer un email à l'admin avec les réponses complètes
    const adminEmail: BrevoEmailData = {
      sender: {
        name: 'Questionnaire Shinkofa',
        email: SENDER_EMAIL
      },
      to: [
        {
          email: ADMIN_EMAIL
        }
      ],
      subject: `✅ Questionnaire complété : ${userInfo.prenom} ${userInfo.nom}`,
      htmlContent: `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1c3049; }
            .header { background-color: #1c3049; padding: 20px; color: white; }
            .content { padding: 20px; }
            .info-box { background-color: #f8f6f0; border-left: 4px solid #e08f34; padding: 15px; margin: 15px 0; }
            pre { background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 11px; white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Nouveau Questionnaire Complété</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><strong>📧 Email :</strong> ${email}</p>
              <p><strong>👤 Prénom :</strong> ${userInfo.prenom}</p>
              <p><strong>👥 Nom :</strong> ${userInfo.nom}</p>
              <p><strong>📅 Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
              <p><strong>📊 Nombre de réponses :</strong> ${answers.length}</p>
            </div>

            <h2>🤖 Prompt IA Généré</h2>
            <details>
              <summary style="cursor: pointer; color: #e08f34; font-weight: bold;">Voir le prompt complet ▼</summary>
              <pre>${aiPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </details>

            <h2>📋 Réponses Détaillées</h2>
            ${formatAnswersAsHTML(answers, questionsMap)}
          </div>
        </body>
        </html>
      `
    };

    await sendEmail(adminEmail);

  } catch (error) {
    console.error('Erreur lors de la soumission du questionnaire:', error);
    throw new Error('Impossible d\'envoyer le questionnaire. Vérifie ta connexion internet et réessaye.');
  }
}

/**
 * Vérifier si la configuration Brevo est valide
 */
export function isBrevoConfigured(): boolean {
  return Boolean(BREVO_API_KEY && BREVO_API_KEY !== '');
}

/**
 * Soumettre un témoignage utilisateur
 */
export async function submitTemoignage(data: {
  prenom: string;
  nom: string;
  email: string;
  photoUrl: string;
  temoignage: string;
  autorisation: boolean;
}): Promise<void> {
  try {
    // 1. Ajouter le contact à Brevo
    const contactData: BrevoContact = {
      email: data.email,
      attributes: {
        PRENOM: data.prenom,
        NOM: data.nom,
        TEMOIGNAGE_ENVOYE: true,
        DATE_TEMOIGNAGE: new Date().toISOString()
      },
      updateEnabled: true
    };

    await addOrUpdateContact(contactData);

    // 2. Envoyer email de confirmation à l'utilisateur
    const confirmationEmail: BrevoEmailData = {
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL
      },
      to: [
        {
          email: data.email,
          name: data.prenom || undefined
        }
      ],
      subject: '✅ Témoignage reçu - Merci pour ton partage !',
      htmlContent: `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1c3049; }
            .header { background: linear-gradient(135deg, #e08f34 0%, #f5cd3e 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; background-color: #ffffff; }
            .footer { background-color: #1c3049; color: white; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Merci ${data.prenom} ! 🙏</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Ton témoignage a bien été reçu</p>
          </div>
          <div class="content">
            <p>Ton partage est précieux et aidera d'autres personnes neurodivergentes à découvrir Shinkofa.</p>

            <p>Nous allons l'examiner et le publier prochainement sur le site (avec ton autorisation).</p>

            <p>Si tu as des questions ou souhaites modifier ton témoignage, n'hésite pas à nous contacter directement en répondant à cet email.</p>

            <p style="margin-top: 30px; font-style: italic; color: #666; text-align: center;">
              真の歩 (Shin-Ko-Fa) - "Le Véritable Pas"<br>
              Chaque pas authentique sur ton chemin unique est plus précieux que mille pas empruntés sur le chemin d'un autre.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 La Voie Shinkofa - Tous droits réservés</p>
            <p>
              <a href="https://shinkofa.com" style="color: #f5cd3e; text-decoration: none;">shinkofa.com</a> |
              <a href="mailto:contact@shinkofa.com" style="color: #f5cd3e; text-decoration: none;">contact@shinkofa.com</a>
            </p>
          </div>
        </body>
        </html>
      `
    };

    await sendEmail(confirmationEmail);

    // 3. Envoyer email à l'admin avec le témoignage complet
    const adminEmail: BrevoEmailData = {
      sender: {
        name: 'Témoignages Shinkofa',
        email: SENDER_EMAIL
      },
      to: [
        {
          email: ADMIN_EMAIL
        }
      ],
      subject: `💬 Nouveau témoignage : ${data.prenom} ${data.nom}`,
      htmlContent: `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1c3049; }
            .header { background-color: #1c3049; padding: 20px; color: white; }
            .content { padding: 20px; }
            .info-box { background-color: #f8f6f0; border-left: 4px solid #e08f34; padding: 15px; margin: 15px 0; }
            .temoignage-box { background-color: #fff8e6; border: 2px solid #f5cd3e; padding: 20px; margin: 20px 0; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💬 Nouveau Témoignage</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><strong>👤 Prénom :</strong> ${data.prenom}</p>
              <p><strong>👥 Nom :</strong> ${data.nom || '(non fourni)'}</p>
              <p><strong>📧 Email :</strong> ${data.email}</p>
              <p><strong>📸 Photo URL :</strong> ${data.photoUrl || '(non fournie)'}</p>
              <p><strong>✅ Autorisation publication :</strong> ${data.autorisation ? 'OUI' : 'NON'}</p>
              <p><strong>📅 Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            </div>

            <div class="temoignage-box">
              <h2 style="margin-top: 0; color: #e08f34;">Témoignage complet</h2>
              <p style="white-space: pre-wrap;">${data.temoignage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>

            ${data.photoUrl ? `
              <h3>Photo de profil</h3>
              <p><a href="${data.photoUrl}" target="_blank">${data.photoUrl}</a></p>
              <img src="${data.photoUrl}" alt="Photo ${data.prenom}" style="max-width: 200px; border-radius: 50%; margin: 10px 0;" onerror="this.style.display='none'">
            ` : ''}

            <hr style="margin: 30px 0;">

            <h3>Prochaines étapes</h3>
            <ol>
              <li>Vérifier le témoignage (authenticité, pertinence)</li>
              <li>Formater pour le site (card component Home.tsx)</li>
              <li>Ajouter à la section témoignages</li>
              <li>Notifier ${data.prenom} une fois publié</li>
            </ol>
          </div>
        </body>
        </html>
      `
    };

    await sendEmail(adminEmail);

  } catch (error) {
    console.error('Erreur lors de la soumission du témoignage:', error);
    throw new Error('Impossible d\'envoyer le témoignage. Vérifie ta connexion internet et réessaye.');
  }
}
