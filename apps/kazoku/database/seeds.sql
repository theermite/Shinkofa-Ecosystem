-- Family Hub - Seed Data
-- © 2025 La Voie Shinkofa
-- Données initiales famille Goncalves

-- IMPORTANT: Changer les mots de passe AVANT déploiement production !
-- Mot de passe par défaut (à changer): "FamilyHub2025!"

-- ======================
-- USERS
-- ======================

-- Hashs bcrypt pour "FamilyHub2025!" (rounds=10)
-- ATTENTION: Ces mots de passe DOIVENT être changés en production

INSERT INTO users (id, email, password_hash, name, role, avatar_color) VALUES
('jay-001', 'jay@shinkofa.com', '$2b$10$YourHashHere', 'Jay', 'admin', '#4285f4'),
('ange-001', 'angelique@shinkofa.com', '$2b$10$YourHashHere', 'Angélique', 'contributor', '#9c27b0'),
('gautier-001', 'gautier@shinkofa.com', '$2b$10$YourHashHere', 'Gautier', 'contributor', '#4caf50');

-- ======================
-- USER PROFILES (Design Humain)
-- ======================

INSERT INTO user_profiles (user_id, design_human_type, profile_line, authority, strategy, focus_hours_per_day, break_pattern, recovery_needs, special_needs) VALUES
(
  'jay-001',
  'Projecteur',
  '1/3',
  'Splénique',
  'Attendre l\'invitation',
  5,
  'Pause 15 min toutes les 90 min',
  'Repos régulier, respect des cycles énergétiques',
  'TDAH, multipotentiel - Invitations explicites obligatoires, reconnaissance importante, pauses fréquentes'
),
(
  'ange-001',
  'Générateur',
  '5/1',
  'Sacrale',
  'Répondre à la vie',
  8,
  'Pause 10 min toutes les 2h',
  'Écouter réponse sacrale, respecter cycles naturels',
  'Hypersensibilité émotionnelle, post-grossesses récentes - Temps créatif quotidien'
),
(
  'gautier-001',
  'Générateur',
  '5/1',
  'Sacrale',
  'Répondre à la vie',
  8,
  'Pause 15 min toutes les 2h',
  'Jour OFF hebdomadaire garanti',
  'Besoin reconnaissance travail logistique, rotation tâches importante'
);

-- ======================
-- ÉVÉNEMENTS RÉCURRENTS
-- ======================

-- École Théo (lundi-vendredi 09h00-14h00)
INSERT INTO events (id, user_id, title, description, start_time, end_time, category, color, is_recurring, recurrence_rule, sync_status) VALUES
('evt-theo-ecole', 'jay-001', 'École Théo', 'Théo à l\'école - Dépôt 08h30, Récupération 14h00', '2025-01-06 09:00:00', '2025-01-06 14:00:00', 'école', '#ff9800', TRUE, 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', 'local_only');

-- Anniversaires (récurrents annuels)
INSERT INTO events (id, user_id, title, description, start_time, end_time, category, color, is_recurring, recurrence_rule, sync_status) VALUES
('evt-anniv-jay', 'jay-001', '🎂 Anniversaire Jay', 'Jay - 17 novembre 1985', '2025-11-17 00:00:00', '2025-11-17 23:59:59', 'anniversaire', '#4285f4', TRUE, 'FREQ=YEARLY', 'local_only'),
('evt-anniv-ange', 'ange-001', '🎂 Anniversaire Angélique', 'Ange - 10 janvier 1991', '2026-01-10 00:00:00', '2026-01-10 23:59:59', 'anniversaire', '#9c27b0', TRUE, 'FREQ=YEARLY', 'local_only'),
('evt-anniv-gautier', 'gautier-001', '🎂 Anniversaire Gautier', 'Gautier - 23 février 1996', '2026-02-23 00:00:00', '2026-02-23 23:59:59', 'anniversaire', '#4caf50', TRUE, 'FREQ=YEARLY', 'local_only'),
('evt-anniv-lyam', 'jay-001', '🎂 Anniversaire Lyam', 'Lyam - 28 juillet 2016 (9 ans)', '2025-07-28 00:00:00', '2025-07-28 23:59:59', 'anniversaire', '#ff9800', TRUE, 'FREQ=YEARLY', 'local_only'),
('evt-anniv-theo', 'jay-001', '🎂 Anniversaire Théo', 'Théo - 25 avril 2018 (7 ans)', '2026-04-25 00:00:00', '2026-04-25 23:59:59', 'anniversaire', '#ff9800', TRUE, 'FREQ=YEARLY', 'local_only'),
('evt-anniv-evy', 'ange-001', '🎂 Anniversaire Evy', 'Evy - 20 février 2024 (1 an)', '2026-02-20 00:00:00', '2026-02-20 23:59:59', 'anniversaire', '#ff9800', TRUE, 'FREQ=YEARLY', 'local_only'),
('evt-anniv-nami', 'ange-001', '🎂 Anniversaire Nami', 'Nami - 16 mars 2025 (6 mois)', '2026-03-16 00:00:00', '2026-03-16 23:59:59', 'anniversaire', '#ff9800', TRUE, 'FREQ=YEARLY', 'local_only');

-- ======================
-- TÂCHES RÉCURRENTES
-- ======================

INSERT INTO tasks (id, title, description, category, frequency, priority, points, created_by, status) VALUES
-- Quotidiennes
('task-vaisselle', 'Vaisselle', 'Vaisselle complète cuisine', 'cuisine', 'quotidienne', 'haute', 2, 'jay-001', 'ouverte'),
('task-balayage', 'Balayage cuisine', 'Balayage + serpillière cuisine', 'ménage', 'quotidienne', 'moyenne', 2, 'jay-001', 'ouverte'),
('task-repas-midi', 'Préparation repas midi', 'Cuisine repas midi', 'cuisine', 'quotidienne', 'haute', 3, 'ange-001', 'ouverte'),
('task-repas-soir', 'Préparation repas soir', 'Cuisine repas soir', 'cuisine', 'quotidienne', 'haute', 3, 'ange-001', 'ouverte'),

-- Hebdomadaires
('task-lessive', 'Lessive', 'Lessive complète (laver, étendre, plier, ranger)', 'linge', 'hebdo', 'haute', 4, 'gautier-001', 'ouverte'),
('task-courses', 'Courses hebdomadaires', 'Courses Torre del Mar / Vélez-Málaga', 'courses', 'hebdo', 'haute', 3, 'gautier-001', 'ouverte'),
('task-sdb', 'Nettoyage salles de bain', 'Nettoyage complet 2 salles de bain', 'ménage', 'hebdo', 'moyenne', 3, 'gautier-001', 'ouverte'),
('task-terrasse', 'Nettoyage terrasse', 'Balayage + rangement terrasse', 'ménage', 'hebdo', 'basse', 2, 'jay-001', 'ouverte'),

-- Mensuelles
('task-nettoyage-profond', 'Nettoyage profond maison', 'Nettoyage complet toutes pièces', 'ménage', 'mensuelle', 'moyenne', 5, 'jay-001', 'ouverte'),
('task-rangement', 'Rangement général', 'Tri, organisation, désencombrement', 'ménage', 'mensuelle', 'basse', 4, 'gautier-001', 'ouverte');

-- ======================
-- PROTOCOLES DE CRISE
-- ======================

-- Jay (Projecteur Splénique 1/3)
INSERT INTO crisis_protocols (person_name, design_human_type, crisis_type, trigger_recognition, immediate_response, escalation_step1, escalation_step2, escalation_step3, support_needs, tools_available, what_to_avoid, recovery, created_by) VALUES
(
  'Jay',
  'Projecteur Splénique 1/3',
  'surcharge',
  'Signes: Irritabilité, amertume montante, fatigue extrême, parole rapide, dispersion mentale',
  'STOP immédiat toute activité. Se retirer dans espace calme (chambre, terrasse). Couper stimulations (phone, écrans).',
  '2-5 min: Respiration profonde 4-4-4. Écouter sensation corporelle splénique (ventre, rate). Identifier besoin RÉEL.',
  '5-10 min: Si surcharge persiste, allongement complet. Lumière tamisée. Silence ou musique douce instrumentale. Hydratation.',
  '10+ min: Lecture manga/livre léger OU méditation guidée courte. Pas de pression retour immédiat activités.',
  '["Silence", "Espace personnel garanti", "Reconnaissance explicite difficulté", "Temps indéterminé récupération", "Pas de questions/demandes"]',
  '["Chambre calme", "Terrasse extérieur", "Mangas collection", "Musique instrumentale playlists", "Bouteille eau", "Casque anti-bruit si besoin"]',
  '["Demander actions immédiates", "Justifier besoin repos", "Minimiser fatigue", "Comparer à autres", "Forcer conversation"]',
  'Après-crise: Validation expérience vécue. Débrief si souhaité (pas forcé). Identification trigger pour prévention future. Repos prolongé si nécessaire (plusieurs heures). Reconnaissance contribution malgré limite.',
  'jay-001'
),

-- Angélique (Générateur Sacral 5/1)
(
  'Angélique',
  'Générateur Sacral 5/1',
  'frustration',
  'Signes: Frustration montante, "oui" sacral ignorés répétés, épuisement cycles non respectés, hypersensibilité émotionnelle amplifiée',
  'STOP. Interroger sacral: "Qu\'est-ce qui est vraiment important MAINTENANT ?" Écouter réponse viscérale (ventre).',
  '2-5 min: Respiration sacrale profonde (ventre). Reconnecter énergie vitale. Identifier "oui/non" authentiques récents ignorés.',
  '5-10 min: Si frustration persiste, activité créative légère (dessin, écriture libre, musique). Exprimer émotions sans filtre.',
  '10+ min: Temps nature si possible (terrasse, jardin). Mouvement doux (marche, étirements). Reconnexion cycles naturels.',
  '["Écoute sacrale respectée", "Temps créatif quotidien garanti", "Validation émotions", "Cycles naturels honorés", "Pas jugement réponses sacrale"]',
  '["Carnet créatif", "Musique playlists variées", "Terrasse/jardin accès", "Matériel dessin/peinture", "Espace calme création"]',
  '["Forcer actions contre sacral", "Ignorer réponse émotionnelle", "Rythme imposé externe", "Dévaloriser besoin créativité", "Comparer à productivité autres"]',
  'Après-crise: Débrief "oui/non" sacral récents. Ajustement planning futur selon sacral. Validation besoins créatifs légitimes. Temps récupération cycles naturels. Reconnaissance force Générateur quand aligné.',
  'jay-001'
);

-- Gautier (Générateur Sacral 5/1)
INSERT INTO crisis_protocols (person_name, design_human_type, crisis_type, trigger_recognition, immediate_response, escalation_step1, escalation_step2, escalation_step3, support_needs, tools_available, what_to_avoid, recovery, created_by) VALUES
(
  'Gautier',
  'Générateur Sacral 5/1',
  'frustration',
  'Signes: Frustration tâches logistiques accumulées, manque reconnaissance, sacral éteint, épuisement répétitif',
  'STOP tâches. Interroger sacral: "Est-ce que cette tâche résonne VRAIMENT maintenant ?" Respecter réponse.',
  '2-5 min: Lister 3 choses accomplies aujourd\'hui. Reconnaissance EXPLICITE contributions logistiques.',
  '5-10 min: Si frustration persiste, activité plaisir courte (gaming 15 min, musique, pause extérieur). Reconnexion motivation sacrale.',
  '10+ min: Planification jour OFF proche garanti. Rotation tâches futures. Gamification reconnaissance (points, badges).',
  '["Reconnaissance quotidienne explicite", "Jour OFF sacré préservé", "Rotation tâches variées", "Choix tâches selon sacral", "Pas surcharge logistique"]',
  '["Gaming setup e-sport", "Musique motivante", "Calendrier jour OFF visible", "Système points/badges", "Espace détente"]',
  '["Tenir reconnaissance pour acquise", "Annuler/déplacer jour OFF", "Tâches répétitives sans variation", "Ignorer épuisement sacral", "Comparer charge travail"]',
  'Après-crise: Validation charge logistique reconnue. Ajustement répartition tâches équitable. Confirmation jour OFF prochain. Reconnaissance pilier familial essentiel. Gamification victoires quotidiennes.',
  'jay-001'
);

-- Enfants (Théo, Evy, Nami, Lyam) - Exemples protocoles de base
INSERT INTO crisis_protocols (person_name, design_human_type, crisis_type, trigger_recognition, immediate_response, escalation_step1, escalation_step2, escalation_step3, support_needs, tools_available, what_to_avoid, recovery, created_by) VALUES
(
  'Théo',
  'Générateur-Manifesteur 4/6',
  'frustration',
  'Signes: Frustration montante, décisions rapides contestées, besoin validation non comblé',
  'STOP. Respiration profonde. Nommer émotion: "Je me sens frustré parce que..."',
  'Proposer 2-3 choix clairs. Valider décision rapide. Respecter initiative.',
  'Activité défoulement physique (course, jeu actif). Expression verbale libre.',
  'Temps calme après défoulement. Câlin si désiré. Validation besoin autonomie.',
  '["Validation décisions", "Choix proposés", "Initiative respectée", "Expression émotions libre"]',
  '["Ballon", "Espace extérieur", "Jeux actifs", "Doudou si besoin"]',
  '["Imposer décisions autoritaires", "Minimiser frustration", "Bloquer initiative", "Forcer calme immédiat"]',
  'Débrief situation. Validation ressenti. Reconnaissance autonomie. Câlin réconfort.',
  'jay-001'
),
(
  'Evy',
  'Générateur-Manifesteur 2/4',
  'transition',
  'Signes: Pleurs transition activités, attachement Jay fort, besoin stabilité',
  'Sécurité physique. Câlin immédiat si demandé. Voix douce rassurante.',
  'Objet familier (doudou). Bercement doux. Chant/musique apaisante.',
  'Transition progressive expliquée. Contact Jay maintenu si possible.',
  'Activité sensorielle apaisante (lecture, jeu calme). Présence stable adulte.',
  '["Sécurité affective", "Présence Jay si possible", "Transition douce", "Objet familier"]',
  '["Doudou", "Musique douce", "Livres imagiers", "Jeux sensoriels"]',
  '["Transitions brusques", "Séparation Jay rapide", "Ignorer pleurs", "Forcer adaptation"]',
  'Câlin prolongé. Validation émotion. Présence stable. Retour calme.',
  'jay-001'
),
(
  'Nami',
  'Manifesteur 4/1',
  'colère',
  'Signes: Pleurs intenses, initiation rapide contestée, besoin clarté/limites',
  'Sécurité physique immédiate. Bercement régulier. Voix calme ferme.',
  'Validation initiation: "Tu veux... c\'est ça ?" Clarté limites douces.',
  'Si pleurs persistent, vérifier besoins base (faim, change, sommeil).',
  'Bercement prolongé. Chant apaisant. Contact peau si accepté.',
  '["Clarté limites", "Respect initiation", "Sécurité physique", "Voix calme"]',
  '["Bercement", "Chants apaisants", "Contact physique", "Routine stable"]',
  '["Bloquer initiation systématiquement", "Voix forte", "Ignorer besoins", "Incohérence limites"]',
  'Bercement doux. Validation émotion (même bébé). Retour calme. Routine rassurante.',
  'jay-001'
);

-- ======================
-- DONNÉES EXEMPLE REPAS (semaine type)
-- ======================

-- Obtenir date lundi prochain
SET @lundi = DATE_ADD(CURDATE(), INTERVAL (7 - WEEKDAY(CURDATE())) DAY);

INSERT INTO meals (date, meal_type, dish_name, assigned_cook, created_by) VALUES
-- Lundi
(DATE_ADD(@lundi, INTERVAL 0 DAY), 'déjeuner', 'Pasta créative', 'ange-001', 'ange-001'),
(DATE_ADD(@lundi, INTERVAL 0 DAY), 'dîner', 'Salade composée', 'jay-001', 'ange-001'),

-- Mardi
(DATE_ADD(@lundi, INTERVAL 1 DAY), 'déjeuner', 'Plat simple', 'jay-001', 'ange-001'),
(DATE_ADD(@lundi, INTERVAL 1 DAY), 'dîner', 'Curry légumes', 'ange-001', 'ange-001'),

-- Mercredi
(DATE_ADD(@lundi, INTERVAL 2 DAY), 'déjeuner', 'Sandwich', 'gautier-001', 'ange-001'),
(DATE_ADD(@lundi, INTERVAL 2 DAY), 'dîner', 'Poisson grillé', 'ange-001', 'ange-001'),

-- Jeudi (Jour OFF Gautier - commande)
(DATE_ADD(@lundi, INTERVAL 3 DAY), 'déjeuner', 'Jour OFF - Commande', NULL, 'ange-001'),
(DATE_ADD(@lundi, INTERVAL 3 DAY), 'dîner', 'Pizza', NULL, 'ange-001'),

-- Vendredi
(DATE_ADD(@lundi, INTERVAL 4 DAY), 'déjeuner', 'Repas rapide', 'jay-001', 'ange-001'),
(DATE_ADD(@lundi, INTERVAL 4 DAY), 'dîner', 'Cuisine ensemble', NULL, 'ange-001'),

-- Samedi
(DATE_ADD(@lundi, INTERVAL 5 DAY), 'déjeuner', 'Brunch', NULL, 'ange-001'),
(DATE_ADD(@lundi, INTERVAL 5 DAY), 'dîner', 'Repas familial', 'ange-001', 'ange-001'),

-- Dimanche
(DATE_ADD(@lundi, INTERVAL 6 DAY), 'déjeuner', 'Restes', NULL, 'ange-001'),
(DATE_ADD(@lundi, INTERVAL 6 DAY), 'dîner', 'Préparation semaine (batch cooking)', 'ange-001', 'ange-001');

-- ======================
-- NOTES
-- ======================

-- Les mots de passe par défaut DOIVENT être changés en production
-- Utiliser bcrypt avec rounds >= 10 pour hasher les mots de passe
-- Les IDs sont fixes pour faciliter les références initiales
-- Les dates anniversaires sont basées sur les données CDC v1.1
