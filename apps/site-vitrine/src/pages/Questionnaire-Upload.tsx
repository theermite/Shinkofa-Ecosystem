/**
 * Page Upload de Questionnaires Papier - Traitement OCR
 * Permet de numériser d'anciens questionnaires papier
 * Shinkofa Platform
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DocumentUploader } from '../components/questionnaire/Document-Uploader';
import { FileUp, ArrowLeft, Info } from 'lucide-react';

export function QuestionnaireUpload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer session_id depuis URL ou créer nouvelle session
    const urlSessionId = searchParams.get('session_id');

    if (urlSessionId) {
      setSessionId(urlSessionId);
    } else {
      // TODO: Créer une nouvelle session via API
      // Pour l'instant, utiliser un ID temporaire
      const tempSessionId = `temp-${Date.now()}`;
      setSessionId(tempSessionId);
    }
  }, [searchParams]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadComplete = (response: any) => {
    console.log('Upload terminé:', response);
    // TODO: Rediriger vers page de révision/import des données
    // navigate(`/questionnaire/review?session_id=${sessionId}`);
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <FileUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Importer un questionnaire papier
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Numérisez vos anciens questionnaires papier grâce à notre technologie OCR
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold">Comment ça marche ?</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Scannez ou photographiez votre questionnaire papier</li>
                <li>Uploadez le fichier PDF ou image (PNG, JPG, TIFF, BMP)</li>
                <li>Notre système OCR extrait automatiquement le texte en français et anglais</li>
                <li>L'IA détecte les questions et réponses automatiquement</li>
                <li>Révisez et validez les données extraites avant import</li>
              </ol>
              <p className="mt-3">
                <span className="font-semibold">Conseils :</span> Pour de meilleurs résultats,
                assurez-vous que le document est bien éclairé, droit, et que le texte est lisible.
              </p>
            </div>
          </div>
        </div>

        {/* Document Uploader Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <DocumentUploader
            sessionId={sessionId}
            onUploadComplete={handleUploadComplete}
            apiUrl={import.meta.env.VITE_API_URL || 'http://localhost:8001'}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Formats supportés
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              PDF, PNG, JPG, JPEG, TIFF, BMP
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Taille maximale
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              10 MB par fichier
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Langues détectées
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Français et Anglais
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Questions fréquentes
          </h2>

          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 dark:text-white py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Puis-je uploader plusieurs pages à la fois ?
              </summary>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-4">
                Oui, les fichiers PDF multi-pages sont supportés. Chaque page sera analysée
                individuellement et les résultats seront consolidés.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 dark:text-white py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Que faire si la qualité de détection est faible ?
              </summary>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-4">
                Essayez de re-scanner le document avec une meilleure résolution et un meilleur
                éclairage. Vous pouvez aussi corriger manuellement les données après l'extraction.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 dark:text-white py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Mes données sont-elles sécurisées ?
              </summary>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-4">
                Oui, tous les documents sont traités de manière sécurisée et les fichiers temporaires
                sont automatiquement supprimés après traitement. Vos données personnelles ne sont
                jamais partagées avec des tiers.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 dark:text-white py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Puis-je modifier les données extraites ?
              </summary>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-4">
                Oui, après l'extraction OCR, vous pourrez réviser et corriger toutes les données
                avant de les importer dans votre profil holistique.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
