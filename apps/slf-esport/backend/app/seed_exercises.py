"""
Seed script to populate database with cognitive exercises
Run this script to initialize the 13 exercises in the database
"""

from app.core.database import SessionLocal
from app.models.exercise import Exercise, ExerciseCategory, ExerciseType


def seed_exercises():
    """Seed the database with cognitive exercises"""
    db = SessionLocal()

    try:
        # Check if exercises already exist
        existing = db.query(Exercise).count()
        if existing > 0:
            print(f"Database already contains {existing} exercises. Skipping seed.")
            return

        exercises = [
            # REFLEXES (3 exercises)
            {
                "name": "Reaction Time Challenge",
                "description": "Mesure ton temps de réaction en cliquant dès que l'écran change de couleur",
                "category": ExerciseCategory.REFLEXES,
                "exercise_type": ExerciseType.CUSTOM,
                "external_url": None,
                "instructions": "1. Attends que l'écran devienne vert\n2. Clique le plus rapidement possible\n3. Répète 5 fois pour obtenir une moyenne\n4. Ton temps moyen sera automatiquement sauvegardé",
                "score_unit": "ms",
                "lower_is_better": True,
                "order": 1
            },
            {
                "name": "Aim Trainer",
                "description": "Entraîne ta précision en cliquant sur les cibles qui apparaissent",
                "category": ExerciseCategory.REFLEXES,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://humanbenchmark.com/tests/aim",
                "instructions": "1. Clique sur les cibles qui apparaissent\n2. Fais 30 clics au total\n3. Note ton temps en millisecondes",
                "score_unit": "ms",
                "lower_is_better": True,
                "order": 2
            },
            {
                "name": "Typing Speed",
                "description": "Teste ta vitesse de frappe (utile pour les communications rapides)",
                "category": ExerciseCategory.REFLEXES,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://www.typingtest.com",
                "instructions": "1. Lance le test 1 minute\n2. Tape le texte affiché\n3. Note ton score en mots par minute (WPM)",
                "score_unit": "WPM",
                "lower_is_better": False,
                "order": 3
            },

            # VISION (3 exercises)
            {
                "name": "Chimp Test (Visual Memory)",
                "description": "Mémorise la position des nombres qui disparaissent",
                "category": ExerciseCategory.VISION,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://humanbenchmark.com/tests/chimp",
                "instructions": "1. Mémorise la position des nombres\n2. Clique-les dans l'ordre croissant\n3. Note ton meilleur niveau atteint",
                "score_unit": "level",
                "lower_is_better": False,
                "order": 1
            },
            {
                "name": "Visual Memory",
                "description": "Mémorise les cases qui s'allument et répète le motif",
                "category": ExerciseCategory.VISION,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://humanbenchmark.com/tests/memory",
                "instructions": "1. Regarde les cases qui s'allument\n2. Clique sur les mêmes cases\n3. Note ton meilleur niveau",
                "score_unit": "level",
                "lower_is_better": False,
                "order": 2
            },
            {
                "name": "Peripheral Vision Trainer",
                "description": "Entraîne ta vision périphérique (essentiel pour la mini-map)",
                "category": ExerciseCategory.VISION,
                "exercise_type": ExerciseType.CUSTOM,
                "external_url": None,
                "instructions": "1. Fixe le centre de l'écran\n2. Clique sur les cibles en périphérie\n3. Note ton score de précision",
                "score_unit": "%",
                "lower_is_better": False,
                "order": 3
            },

            # MEMOIRE (3 exercises)
            {
                "name": "Sequence Memory",
                "description": "Mémorise et répète des séquences de plus en plus longues",
                "category": ExerciseCategory.MEMOIRE,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://humanbenchmark.com/tests/sequence",
                "instructions": "1. Regarde la séquence\n2. Répète-la en cliquant\n3. Note ton meilleur niveau",
                "score_unit": "level",
                "lower_is_better": False,
                "order": 1
            },
            {
                "name": "Number Memory",
                "description": "Mémorise des nombres de plus en plus longs",
                "category": ExerciseCategory.MEMOIRE,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://humanbenchmark.com/tests/number-memory",
                "instructions": "1. Mémorise le nombre affiché\n2. Tape-le de mémoire\n3. Note ton meilleur niveau",
                "score_unit": "digits",
                "lower_is_better": False,
                "order": 2
            },
            {
                "name": "Verbal Memory",
                "description": "Retiens les mots déjà vus et identifie les nouveaux",
                "category": ExerciseCategory.MEMOIRE,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://humanbenchmark.com/tests/verbal-memory",
                "instructions": "1. Lis chaque mot\n2. Indique si tu l'as déjà vu\n3. Note ton meilleur score",
                "score_unit": "score",
                "lower_is_better": False,
                "order": 3
            },

            # ATTENTION (2 exercises)
            {
                "name": "Stroop Test",
                "description": "Teste ta capacité d'inhibition et de concentration",
                "category": ExerciseCategory.ATTENTION,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://www.strooptest.com",
                "instructions": "1. Lis la COULEUR du texte (pas le mot)\n2. Réponds le plus rapidement possible\n3. Note ton temps total",
                "score_unit": "seconds",
                "lower_is_better": True,
                "order": 1
            },
            {
                "name": "Multi-Task Test",
                "description": "Gère plusieurs tâches simultanément (custom mini-game)",
                "category": ExerciseCategory.ATTENTION,
                "exercise_type": ExerciseType.CUSTOM,
                "external_url": None,
                "instructions": "1. Gère la tâche principale au centre\n2. Réponds aux événements secondaires\n3. Note ton score de performance",
                "score_unit": "%",
                "lower_is_better": False,
                "order": 2
            },

            # COORDINATION (2 exercises)
            {
                "name": "Pattern Recognition",
                "description": "Identifie et reproduis des patterns complexes",
                "category": ExerciseCategory.COORDINATION,
                "exercise_type": ExerciseType.EXTERNAL,
                "external_url": "https://humanbenchmark.com/tests/sequence",
                "instructions": "1. Observe le pattern\n2. Reproduis-le exactement\n3. Note ton meilleur niveau",
                "score_unit": "level",
                "lower_is_better": False,
                "order": 1
            },
            {
                "name": "Synchronization Test",
                "description": "Coordonne plusieurs actions simultanées (spécifique MOBA)",
                "category": ExerciseCategory.COORDINATION,
                "exercise_type": ExerciseType.CUSTOM,
                "external_url": None,
                "instructions": "1. Exécute les actions demandées\n2. Coordonne les timings\n3. Note ton score de précision",
                "score_unit": "%",
                "lower_is_better": False,
                "order": 2
            },
        ]

        # Create exercises
        created_count = 0
        for ex_data in exercises:
            exercise = Exercise(**ex_data)
            db.add(exercise)
            created_count += 1

        db.commit()
        print(f"✅ Successfully seeded {created_count} exercises!")
        print("\nExercises by category:")
        print(f"  - Réflexes: 3")
        print(f"  - Vision: 3")
        print(f"  - Mémoire: 3")
        print(f"  - Attention: 2")
        print(f"  - Coordination: 2")
        print(f"\nCustom mini-games: 4")
        print(f"  - Reaction Time Challenge ✅")
        print(f"  - Peripheral Vision Trainer ✅")
        print(f"  - Multi-Task Test ✅")
        print(f"  - Synchronization Test")
        print(f"External links: 9")

    except Exception as e:
        print(f"❌ Error seeding exercises: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting exercise database seed...")
    seed_exercises()
