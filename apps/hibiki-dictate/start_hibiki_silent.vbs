' ============================================
' Hibiki - Lanceur Silencieux
' Lance l'application SANS fenetre de console
' ============================================
'
' UTILISATION:
'   Double-cliquer sur ce fichier pour lancer Hibiki
'   sans afficher de fenetre de terminal.
'
' Pour debug (avec console visible):
'   Utiliser start_hibiki.bat a la place
'
' Copyright (C) 2025 La Voie Shinkofa
' ============================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Recuperer le repertoire du script
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Chemin vers pythonw.exe (sans console) et main.py
pythonwPath = scriptDir & "\venv\Scripts\pythonw.exe"
mainPath = scriptDir & "\src\main.py"

' Verifier que le venv existe
If Not fso.FileExists(pythonwPath) Then
    MsgBox "Environnement virtuel non trouve !" & vbCrLf & vbCrLf & _
           "Creez-le avec :" & vbCrLf & _
           "python -m venv venv" & vbCrLf & _
           "venv\Scripts\pip install -r requirements.txt", _
           vbCritical, "Hibiki - Erreur"
    WScript.Quit 1
End If

' Lancer Hibiki avec pythonw.exe (pas de console)
' CurrentDirectory = scriptDir pour que les chemins relatifs fonctionnent
WshShell.CurrentDirectory = scriptDir
WshShell.Run """" & pythonwPath & """ """ & mainPath & """", 0, False

' Nettoyer
Set WshShell = Nothing
Set fso = Nothing
