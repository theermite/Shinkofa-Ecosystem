@echo off
REM ============================================
REM Hibiki - Lanceur Application
REM Lance l'application avec configuration Groq
REM ============================================

cd /d "%~dp0"

echo.
echo ============================================================
echo   🎙️ HIBIKI - Dictée Vocale
echo   La Voie Shinkofa
echo ============================================================
echo.
echo Chargement de la configuration...
echo.

REM Vérifier que le venv existe
if not exist "venv\Scripts\python.exe" (
    echo ❌ Environnement virtuel non trouvé !
    echo.
    echo Créez-le avec : python -m venv venv
    echo Puis installez les dépendances : venv\Scripts\pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

REM Vérifier que le .env existe
if not exist ".env" (
    echo ⚠️  Fichier .env non trouvé
    echo    La clé API Groq ne sera pas chargée
    echo.
)

REM Lancer l'application (avec console visible pour debug)
echo Lancement de Hibiki...
echo.
"venv\Scripts\python.exe" "src\main.py"

REM Si l'application s'arrête avec erreur
if errorlevel 1 (
    echo.
    echo ❌ Hibiki s'est arrêté avec une erreur.
    echo    Vérifiez les logs ci-dessus.
    echo.
    pause
)
