@echo off
REM Crée un raccourci Hibiki sur le Bureau

set SCRIPT_DIR=%~dp0
set DESKTOP=%USERPROFILE%\Desktop

echo Creation du raccourci Hibiki...

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Hibiki Dev.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%venv\Scripts\pythonw.exe'; $Shortcut.Arguments = '%SCRIPT_DIR%src\main.py'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = '%SCRIPT_DIR%assets\hibiki_icon.ico'; $Shortcut.Description = 'Hibiki - Dictee Vocale'; $Shortcut.Save()"

echo.
echo ✓ Raccourci cree sur le Bureau : "Hibiki Dev.lnk"
echo.
pause
