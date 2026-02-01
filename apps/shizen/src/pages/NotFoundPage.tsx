import { Link } from 'react-router-dom';
import { Button } from '@shinkofa/ui';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-beige-sable dark:bg-bleu-fonce flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-bleu-profond dark:text-blanc-pur mb-4">
          404
        </h1>
        <p className="text-xl text-bleu-profond/80 dark:text-blanc-pur/80 mb-8">
          Page introuvable
        </p>
        <Link to="/">
          <Button leftIcon={<Home className="w-4 h-4" />}>
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
