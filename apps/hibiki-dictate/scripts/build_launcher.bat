@echo off
REM ============================================
REM Hibiki Launcher - Build Script
REM Crée Hibiki.exe (installer + launcher unique)
REM ============================================

echo ============================================
echo   Hibiki Launcher - Build
echo   La Voie Shinkofa
echo ============================================
echo.

REM Check if virtual environment exists
if not exist venv (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then install dependencies: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activate virtual environment
echo [1/4] Activation de l'environnement virtuel...
call venv\Scripts\activate

REM Install PyInstaller if not already installed
echo.
echo [2/4] Installation des outils de build...
pip install pyinstaller --quiet

REM Clean previous builds
echo.
echo [3/4] Nettoyage des builds precedents...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

REM Build launcher executable with PyInstaller
echo.
echo [4/4] Build de Hibiki.exe...
echo Cela peut prendre 2-5 minutes...
echo.

pyinstaller hibiki_launcher.spec --clean

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    echo Check the output above for errors.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   BUILD TERMINE !
echo ============================================
echo.
echo Executable cree: dist\Hibiki.exe
echo.
echo Ce fichier unique contient:
echo   - Le launcher intelligent
echo   - L'installateur automatique
echo   - Tous les fichiers de l'application
echo.
echo Taille approximative: 50-100 MB
echo.
echo ============================================
echo   PROCHAINES ETAPES
echo ============================================
echo.
echo 1. Tester le launcher:
echo    cd dist
echo    Hibiki.exe
echo.
echo    Au premier lancement:
echo      - Demande droits admin
echo      - Installe Python embarque
echo      - Installe dependances
echo      - Telecharge modeles WhisperX
echo      - Cree raccourcis
echo      - Lance l'application
echo.
echo    Aux lancements suivants:
echo      - Lance directement l'application
echo.
echo 2. Distribuer Hibiki.exe:
echo    - Uploader sur GitHub Releases
echo    - Partager le lien de telechargement
echo    - Les utilisateurs telechargent et lancent
echo    - Installation automatique au premier lancement
echo.
echo 3. Verifier version et updates:
echo    - Le systeme verifie automatiquement les updates
echo    - Configure dans hibiki_preferences.json
echo.
pause
