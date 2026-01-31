-- Family Hub - Database Schema MySQL 8+
-- © 2025 La Voie Shinkofa
-- Encoding: UTF-8

-- Drop existing tables (DEV only - remove in production)
DROP TABLE IF EXISTS crisis_protocols;
DROP TABLE IF EXISTS bien_etre_logs;
DROP TABLE IF EXISTS couche_logs;
DROP TABLE IF EXISTS repas_logs;
DROP TABLE IF EXISTS shopping_items;
DROP TABLE IF EXISTS shopping_lists;
DROP TABLE IF EXISTS meals;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

-- ======================
-- USERS & AUTHENTICATION
-- ======================

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'contributor', 'viewer') DEFAULT 'contributor',
  avatar_color VARCHAR(7) DEFAULT '#4285f4',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- USER PROFILES (Design Humain)
-- ======================

CREATE TABLE user_profiles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  design_human_type ENUM('Projecteur', 'Générateur', 'Générateur-Manifesteur', 'Manifesteur', 'Réflecteur') NOT NULL,
  profile_line VARCHAR(10) NULL, -- ex: "1/3", "5/1"
  authority ENUM('Splénique', 'Sacrale', 'Émotionnelle', 'Ego', 'Environnement', 'Lune', 'Aucune') NULL,
  strategy TEXT NULL,
  focus_hours_per_day INT DEFAULT 8,
  break_pattern VARCHAR(255) DEFAULT 'Pause 15 min toutes les 90 min',
  recovery_needs TEXT NULL,
  special_needs TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- EVENTS & CALENDAR
-- ======================

CREATE TABLE events (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  category ENUM('école', 'anniversaire', 'travail', 'activité', 'famille', 'santé', 'autre') DEFAULT 'autre',
  color VARCHAR(7) DEFAULT '#4285f4',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT NULL, -- iCal RRULE format
  google_calendar_id VARCHAR(255) NULL UNIQUE,
  sync_status ENUM('synced', 'pending', 'error', 'local_only') DEFAULT 'local_only',
  sync_error TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_start_time (start_time),
  INDEX idx_category (category),
  INDEX idx_sync_status (sync_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- TASKS
-- ======================

CREATE TABLE tasks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category ENUM('cuisine', 'ménage', 'linge', 'courses', 'enfants', 'autre') DEFAULT 'autre',
  assigned_to VARCHAR(36) NULL,
  frequency ENUM('ponctuelle', 'quotidienne', 'hebdo', 'mensuelle') DEFAULT 'ponctuelle',
  due_date DATE NULL,
  status ENUM('ouverte', 'assignée', 'en_cours', 'complétée', 'archivée') DEFAULT 'ouverte',
  priority ENUM('basse', 'moyenne', 'haute') DEFAULT 'moyenne',
  points INT DEFAULT 1,
  completed_at TIMESTAMP NULL,
  completed_by VARCHAR(36) NULL,
  notes TEXT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- MEALS & MENUS
-- ======================

CREATE TABLE meals (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  date DATE NOT NULL,
  meal_type ENUM('petit_déj', 'déjeuner', 'goûter', 'dîner') NOT NULL,
  dish_name VARCHAR(255) NULL,
  assigned_cook VARCHAR(36) NULL,
  notes TEXT NULL,
  ingredients TEXT NULL, -- JSON array
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_cook) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_date (date),
  INDEX idx_meal_type (meal_type),
  INDEX idx_assigned_cook (assigned_cook),
  UNIQUE KEY unique_date_meal (date, meal_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- SHOPPING LISTS
-- ======================

CREATE TABLE shopping_lists (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  week_start DATE NOT NULL,
  status ENUM('planification', 'finale', 'courses_faites') DEFAULT 'planification',
  location ENUM('Torre del Mar', 'Vélez-Málaga', 'autre') DEFAULT 'Torre del Mar',
  total_estimate DECIMAL(10, 2) NULL,
  completed_by VARCHAR(36) NULL,
  completed_at TIMESTAMP NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_week_start (week_start),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE shopping_items (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  shopping_list_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity VARCHAR(50) NULL,
  unit ENUM('pièce', 'kg', 'g', 'litre', 'ml', 'paquet', 'autre') DEFAULT 'pièce',
  category ENUM('fruits', 'légumes', 'protéines', 'produits_laitiers', 'basiques', 'autre') DEFAULT 'autre',
  priority ENUM('optionnel', 'souhaité', 'essentiel') DEFAULT 'souhaité',
  is_checked BOOLEAN DEFAULT FALSE,
  price_estimate DECIMAL(10, 2) NULL,
  added_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_shopping_list_id (shopping_list_id),
  INDEX idx_category (category),
  INDEX idx_is_checked (is_checked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- BABY TRACKING (Evy, Nami)
-- ======================

CREATE TABLE repas_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  date DATE NOT NULL,
  time TIME NOT NULL,
  enfant ENUM('Evy', 'Nami') NOT NULL,
  type ENUM('biberon', 'repas') NOT NULL,
  quantite_ml INT NULL, -- Pour biberon
  taille_assiette ENUM('petite', 'moyenne', 'grande') NULL, -- Pour repas
  duration_minutes INT NULL,
  notes TEXT NULL,
  logged_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (logged_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_date (date),
  INDEX idx_enfant (enfant),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE couche_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  date DATE NOT NULL,
  time TIME NOT NULL,
  enfant ENUM('Evy', 'Nami') NOT NULL,
  type ENUM('pipi', 'caca', 'mixte') NOT NULL,
  changed_by VARCHAR(36) NOT NULL,
  notes TEXT NULL, -- couleur, texture, observations santé
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_date (date),
  INDEX idx_enfant (enfant),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bien_etre_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  date DATE NOT NULL,
  enfant ENUM('Lyam', 'Théo', 'Evy', 'Nami') NOT NULL,
  category ENUM('santé', 'sommeil', 'comportement', 'développement', 'humeur', 'allergie', 'autre') DEFAULT 'autre',
  observation TEXT NOT NULL,
  added_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_date (date),
  INDEX idx_enfant (enfant),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- CRISIS PROTOCOLS
-- ======================

CREATE TABLE crisis_protocols (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  person_name ENUM('Jay', 'Angélique', 'Gautier', 'Lyam', 'Théo', 'Evy', 'Nami') NOT NULL,
  design_human_type VARCHAR(50) NULL,
  crisis_type ENUM('frustration', 'surcharge', 'transition', 'rejet', 'colère', 'peur', 'autre') NOT NULL,
  trigger_recognition TEXT NULL,
  immediate_response TEXT NULL,
  escalation_step1 TEXT NULL,
  escalation_step2 TEXT NULL,
  escalation_step3 TEXT NULL,
  support_needs TEXT NULL, -- JSON array
  tools_available TEXT NULL, -- JSON array
  what_to_avoid TEXT NULL, -- JSON array
  recovery TEXT NULL,
  notes TEXT NULL,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_person_name (person_name),
  INDEX idx_crisis_type (crisis_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- INDEXES FOR PERFORMANCE
-- ======================

-- Composite indexes for common queries
CREATE INDEX idx_events_user_date ON events(user_id, start_time);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX idx_meals_date_type ON meals(date, meal_type);
CREATE INDEX idx_repas_enfant_date ON repas_logs(enfant, date);
CREATE INDEX idx_couche_enfant_date ON couche_logs(enfant, date);
CREATE INDEX idx_bien_etre_enfant_date ON bien_etre_logs(enfant, date);

-- ======================
-- VIEWS FOR COMMON QUERIES
-- ======================

-- Vue pour les événements de la semaine
CREATE VIEW v_events_this_week AS
SELECT
  e.*,
  u.name as user_name,
  u.avatar_color
FROM events e
INNER JOIN users u ON e.user_id = u.id
WHERE e.start_time >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
  AND e.start_time < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY);

-- Vue pour les tâches actives
CREATE VIEW v_tasks_active AS
SELECT
  t.*,
  u_assigned.name as assigned_name,
  u_created.name as created_by_name
FROM tasks t
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
INNER JOIN users u_created ON t.created_by = u_created.id
WHERE t.status IN ('ouverte', 'assignée', 'en_cours');

-- Vue pour les logs repas du jour
CREATE VIEW v_repas_today AS
SELECT
  r.*,
  u.name as logged_by_name
FROM repas_logs r
INNER JOIN users u ON r.logged_by = u.id
WHERE r.date = CURDATE()
ORDER BY r.time DESC;

-- ======================
-- TRIGGERS
-- ======================

-- Auto-update updated_at timestamp (si MySQL ne le fait pas automatiquement)
DELIMITER $$

CREATE TRIGGER tr_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER tr_tasks_completed_at
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
  IF NEW.status = 'complétée' AND OLD.status != 'complétée' THEN
    SET NEW.completed_at = CURRENT_TIMESTAMP;
  END IF;
END$$

DELIMITER ;

-- ======================
-- COMMENTS
-- ======================

ALTER TABLE users COMMENT = 'Utilisateurs système (Jay, Ange, Gauthier)';
ALTER TABLE user_profiles COMMENT = 'Profils Design Humain détaillés';
ALTER TABLE events COMMENT = 'Événements calendrier + sync Google Calendar';
ALTER TABLE tasks COMMENT = 'Tâches ménagères collaborative';
ALTER TABLE meals COMMENT = 'Planification repas hebdomadaire';
ALTER TABLE shopping_lists COMMENT = 'Listes courses partagées';
ALTER TABLE shopping_items COMMENT = 'Articles courses individuels';
ALTER TABLE repas_logs COMMENT = 'Suivi repas bébés (Evy, Nami)';
ALTER TABLE couche_logs COMMENT = 'Suivi couches bébés';
ALTER TABLE bien_etre_logs COMMENT = 'Notes bien-être enfants';
ALTER TABLE crisis_protocols COMMENT = 'Protocoles gestion crise par personne';
