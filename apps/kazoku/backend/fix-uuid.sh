#!/usr/bin/env bash
# Script pour corriger le problème insertId dans tous les modèles

MODELS_DIR="src/models"

# Liste des fichiers à corriger
FILES=(
  "task.model.ts"
  "event.model.ts"
  "baby.model.ts"
  "crisis.model.ts"
  "user.model.ts"
  "userProfile.model.ts"
)

for file in "${FILES[@]}"; do
  filepath="$MODELS_DIR/$file"
  echo "Correction de $file..."

  # Ajouter l'import randomUUID après l'import mysql2
  sed -i "/import.*from 'mysql2'/a import { randomUUID } from 'crypto';" "$filepath"

  # Trouver toutes les fonctions avec insertId.toString() et les corriger
  # Cette étape nécessite une édition manuelle car chaque fonction est différente

  echo "  - Import randomUUID ajouté"
done

echo ""
echo "✅ Imports ajoutés. Correction manuelle nécessaire pour chaque fonction create*."
echo ""
echo "Pour chaque fonction:"
echo "1. Ajouter: const id = randomUUID();"
echo "2. Ajouter 'id' dans INSERT INTO columns"
echo "3. Ajouter 'id' comme premier paramètre dans VALUES"
echo "4. Remplacer: return result.insertId.toString(); par: return id;"
