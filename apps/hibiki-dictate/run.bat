@echo off
echo ========================================
echo   Hibiki - Voice Dictation
echo   La Voie Shinkofa
echo ========================================
echo.

REM Activate virtual environment if exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo WARNING: Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then: venv\Scripts\activate
    echo Then: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Launch Hibiki
echo.
echo Launching Hibiki...
python src\main.py

REM Keep window open if error
if errorlevel 1 (
    echo.
    echo ERROR: Hibiki crashed. Check logs in logs/ folder.
    pause
)
