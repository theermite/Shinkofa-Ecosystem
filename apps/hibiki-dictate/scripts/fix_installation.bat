@echo off
REM ============================================
REM Hibiki - Fix Installation Script
REM Corrige les fichiers de lancement sans réinstaller
REM ============================================

echo ============================================
echo   Hibiki - Correction Installation
echo   La Voie Shinkofa
echo ============================================
echo.

REM Vérifier droits admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERREUR: Droits administrateur requis
    echo Clic-droit sur ce fichier et "Executer en tant qu'administrateur"
    pause
    exit /b 1
)

set INSTALL_DIR=C:\Program Files\Hibiki
set APP_DIR=%INSTALL_DIR%\app
set PYTHON_DIR=%INSTALL_DIR%\python
set PYTHONW=%PYTHON_DIR%\pythonw.exe
set LAUNCHER=%INSTALL_DIR%\launch_hibiki.pyw

echo [1/3] Correction du launcher Python...

REM Créer nouveau launcher Python
(
echo #!/usr/bin/env python
echo # -*- coding: utf-8 -*-
echo """
echo Hibiki Launcher - Lance l'application principale
echo """
echo import sys
echo import os
echo from pathlib import Path
echo.
echo # Configurer chemins
echo app_dir = Path^(r"%APP_DIR%"^)
echo src_dir = app_dir / "src"
echo.
echo # Changer vers dossier app
echo os.chdir^(str^(app_dir^)^)
echo.
echo # Ajouter src au path Python
echo sys.path.insert^(0, str^(src_dir^)^)
echo.
echo # Lancer l'application directement
echo if __name__ == "__main__":
echo     try:
echo         import main
echo         main.main^(^) if hasattr^(main, 'main'^) else None
echo     except Exception as e:
echo         import ctypes
echo         ctypes.windll.user32.MessageBoxW^(
echo             0,
echo             f"Erreur au lancement de Hibiki:\n\n{str^(e^)}\n\nConsultez les logs.",
echo             "Erreur Hibiki",
echo             0x10
echo         ^)
echo         raise
) > "%LAUNCHER%"

echo   - Launcher Python corrige

echo.
echo [2/3] Correction du fichier batch...

REM Créer nouveau batch
(
echo @echo off
echo REM Hibiki Launcher - Dictee Vocale
echo start "" "%PYTHONW%" "%LAUNCHER%"
) > "%INSTALL_DIR%\Hibiki.bat"

echo   - Batch file corrige

echo.
echo [3/3] Test du lancement...

REM Tester le lancement
echo   - Lancement de Hibiki...
start "" "%PYTHONW%" "%LAUNCHER%"

timeout /t 3 >nul

echo.
echo ============================================
echo   CORRECTION TERMINEE
echo ============================================
echo.
echo Si Hibiki s'est lance, tout fonctionne !
echo.
echo Vous pouvez maintenant utiliser :
echo   - Raccourci Bureau
echo   - Menu Demarrer ^> Hibiki
echo   - C:\Program Files\Hibiki\Hibiki.bat
echo.
pause
