@echo off
REM ============================================
REM Hibiki - Build Installer Script
REM Creates standalone .exe and installer
REM ============================================

echo ============================================
echo   Hibiki - Build Installer
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
echo [1/5] Activating virtual environment...
call venv\Scripts\activate

REM Install PyInstaller if not already installed
echo.
echo [2/5] Installing build tools...
pip install pyinstaller pillow --quiet

REM Clean previous builds
echo.
echo [3/5] Cleaning previous builds...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

REM Build executable with PyInstaller
echo.
echo [4/5] Building Hibiki executable...
echo This may take 5-10 minutes...
echo.

REM Check if user wants GPU version
set /p GPU_BUILD="Build with GPU support? (y/n, default=n): "
if /i "%GPU_BUILD%"=="y" (
    echo Building GPU version (CUDA support)...
    pyinstaller hibiki.spec -- --gpu
) else (
    echo Building CPU version (wider compatibility)...
    pyinstaller hibiki.spec
)

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    echo Check the output above for errors.
    pause
    exit /b 1
)

echo.
echo [5/5] Build complete!
echo.
echo Executable location: dist\Hibiki\Hibiki.exe
echo.
echo ============================================
echo   NEXT STEPS
echo ============================================
echo.
echo 1. Test the executable:
echo    cd dist\Hibiki
echo    Hibiki.exe
echo.
echo 2. Create installer with Inno Setup:
echo    - Install Inno Setup from: https://jrsoftware.org/isdl.php
echo    - Open hibiki_installer.iss
echo    - Click Build ^> Compile
echo.
echo 3. Installer will be created in: Output\
echo.
pause
