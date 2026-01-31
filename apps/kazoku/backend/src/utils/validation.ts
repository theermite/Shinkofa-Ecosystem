/**
 * Validation Schemas - Joi
 * © 2025 La Voie Shinkofa
 */

import Joi from 'joi';

// ======================
// AUTH VALIDATION
// ======================

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Mot de passe requis',
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut dépasser 100 caractères',
    'any.required': 'Nom requis',
  }),
  role: Joi.string().valid('admin', 'contributor', 'viewer').optional(),
  avatar_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
    'string.pattern.base': 'Couleur invalide (format HEX requis)',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mot de passe requis',
  }),
});

export const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Mot de passe actuel requis',
  }),
  new_password: Joi.string().min(8).required().messages({
    'string.min': 'Le nouveau mot de passe doit contenir au moins 8 caractères',
    'any.required': 'Nouveau mot de passe requis',
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  avatar_color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// ======================
// USER PROFILE VALIDATION
// ======================

export const createUserProfileSchema = Joi.object({
  design_human_type: Joi.string()
    .valid('Projecteur', 'Générateur', 'Générateur-Manifesteur', 'Manifesteur', 'Réflecteur')
    .required(),
  profile_line: Joi.string().optional().allow(null),
  authority: Joi.string()
    .valid('Splénique', 'Sacrale', 'Émotionnelle', 'Ego', 'Environnement', 'Lune', 'Aucune')
    .optional()
    .allow(null),
  strategy: Joi.string().optional().allow(null),
  focus_hours_per_day: Joi.number().min(1).max(24).optional(),
  break_pattern: Joi.string().optional(),
  recovery_needs: Joi.string().optional().allow(null),
  special_needs: Joi.string().optional().allow(null),
  notes: Joi.string().optional().allow(null),
});

export const updateUserProfileSchema = Joi.object({
  design_human_type: Joi.string()
    .valid('Projecteur', 'Générateur', 'Générateur-Manifesteur', 'Manifesteur', 'Réflecteur')
    .optional(),
  profile_line: Joi.string().optional().allow(null),
  authority: Joi.string()
    .valid('Splénique', 'Sacrale', 'Émotionnelle', 'Ego', 'Environnement', 'Lune', 'Aucune')
    .optional()
    .allow(null),
  strategy: Joi.string().optional().allow(null),
  focus_hours_per_day: Joi.number().min(1).max(24).optional(),
  break_pattern: Joi.string().optional(),
  recovery_needs: Joi.string().optional().allow(null),
  special_needs: Joi.string().optional().allow(null),
  notes: Joi.string().optional().allow(null),
});

// ======================
// EVENT VALIDATION
// ======================

export const createEventSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().optional().allow(null, ''),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().min(Joi.ref('start_time')).required(),
  category: Joi.string()
    .valid('école', 'anniversaire', 'travail', 'activité', 'famille', 'santé', 'autre')
    .optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  is_recurring: Joi.boolean().optional(),
  recurrence_rule: Joi.string().optional().allow(null, ''),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional().allow(null, ''),
  start_time: Joi.date().iso().optional(),
  end_time: Joi.date().iso().optional(),
  category: Joi.string()
    .valid('école', 'anniversaire', 'travail', 'activité', 'famille', 'santé', 'autre')
    .optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  is_recurring: Joi.boolean().optional(),
  recurrence_rule: Joi.string().optional().allow(null, ''),
});

// ======================
// TASK VALIDATION
// ======================

export const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().optional().allow(null, ''),
  category: Joi.string()
    .valid('cuisine', 'ménage', 'linge', 'courses', 'enfants', 'autre')
    .optional(),
  assigned_to: Joi.string().optional().allow(null, ''),
  frequency: Joi.string().valid('ponctuelle', 'quotidienne', 'hebdo', 'mensuelle').optional(),
  due_date: Joi.date().optional().allow(null, ''),
  priority: Joi.string().valid('basse', 'moyenne', 'haute').optional(),
  points: Joi.number().min(1).max(10).optional(),
  notes: Joi.string().optional().allow(null, ''),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional().allow(null, ''),
  category: Joi.string()
    .valid('cuisine', 'ménage', 'linge', 'courses', 'enfants', 'autre')
    .optional(),
  assigned_to: Joi.string().optional().allow(null, ''),
  frequency: Joi.string().valid('ponctuelle', 'quotidienne', 'hebdo', 'mensuelle').optional(),
  due_date: Joi.date().optional().allow(null, ''),
  status: Joi.string().valid('ouverte', 'assignée', 'en_cours', 'complétée', 'archivée').optional(),
  priority: Joi.string().valid('basse', 'moyenne', 'haute').optional(),
  points: Joi.number().min(1).max(10).optional(),
  notes: Joi.string().optional().allow(null, ''),
});

// ======================
// VALIDATION MIDDLEWARE
// ======================

export function validate(schema: Joi.ObjectSchema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      // Log validation errors for debugging
      console.error('❌ Validation Error:', {
        url: req.url,
        method: req.method,
        body: req.body,
        errors,
      });

      return res.status(400).json({
        success: false,
        error: 'Erreur de validation',
        details: errors,
      });
    }

    req.body = value;
    next();
  };
}
