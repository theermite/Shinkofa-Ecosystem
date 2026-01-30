/**
 * Document Uploader Component - OCR Processing for Old Paper Questionnaires
 * Shinkofa Platform
 */

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader, X } from 'lucide-react';

interface OCRQuestionAnswer {
  question_number: number | null;
  question_text: string | null;
  answer: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

interface OCRResponse {
  success: boolean;
  file_name: string;
  file_type: string;
  num_pages: number;
  extracted_text: string;
  questions_found: number;
  answers_found: number;
  parsed_data: OCRQuestionAnswer[];
  raw_sections: string[];
  parsing_notes: string[];
  error: string | null;
}

interface DocumentUploaderProps {
  sessionId: string;
  onUploadComplete?: (response: OCRResponse) => void;
  apiUrl?: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/tiff',
  'image/bmp'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploader({
  sessionId,
  onUploadComplete,
  apiUrl = 'http://localhost:8001'
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Type de fichier non supporté. Formats acceptés : PDF, PNG, JPG, TIFF, BMP`;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `Fichier trop volumineux (${sizeMB}MB). Maximum : 10MB`;
    }

    return null;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError(null);
    setResult(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(
        `${apiUrl}/questionnaire/upload-document/${sessionId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors du traitement du document');
      }

      const data: OCRResponse = await response.json();
      setResult(data);

      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Zone */}
      {!result && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              {selectedFile ? selectedFile.name : 'Déposez votre document ici'}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              ou cliquez pour sélectionner un fichier
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Parcourir
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
              onChange={handleFileInput}
              className="hidden"
            />

            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Formats acceptés : PDF, PNG, JPG, TIFF, BMP • Maximum 10MB
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !uploading && (
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Analyser le document
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Loading State */}
          {uploading && (
            <div className="flex flex-col items-center gap-3 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Traitement OCR en cours... Cela peut prendre quelques instants.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Success Header */}
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Document traité avec succès
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {result.file_name} • {result.num_pages} page{result.num_pages > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Nouveau document
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Questions trouvées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.questions_found}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Réponses trouvées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.answers_found}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Taux de réussite</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.questions_found > 0
                  ? Math.round((result.answers_found / result.questions_found) * 100)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Parsing Notes */}
          {result.parsing_notes.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Notes de qualité
              </h4>
              <ul className="space-y-1">
                {result.parsing_notes.map((note, index) => (
                  <li key={index} className="text-sm text-blue-800 dark:text-blue-200">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Data */}
          {result.parsed_data.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Questions et réponses extraites
              </h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {result.parsed_data.map((qa, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          <FileText className="w-4 h-4 inline mr-1" />
                          {qa.question_number && `Q${qa.question_number}: `}
                          {qa.question_text || 'Question non détectée'}
                        </p>
                        {qa.answer && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 pl-5">
                            → {qa.answer}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getConfidenceColor(qa.confidence)}`}>
                        {qa.confidence}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Extracted Text (Collapsible) */}
          <details className="group">
            <summary className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <span className="font-medium text-gray-900 dark:text-white">
                Texte brut extrait ({result.extracted_text.length} caractères)
              </span>
            </summary>
            <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono overflow-x-auto">
                {result.extracted_text}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
