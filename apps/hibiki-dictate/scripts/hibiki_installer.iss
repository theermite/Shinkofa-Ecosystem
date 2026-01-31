; Hibiki Installer Script for Inno Setup
; Creates a professional Windows installer
; Download Inno Setup: https://jrsoftware.org/isdl.php

#define MyAppName "Hibiki"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "La Voie Shinkofa"
#define MyAppURL "https://shinkofa.com"
#define MyAppExeName "Hibiki.exe"
#define MyAppDescription "Application de dictée vocale locale et confidentielle"

[Setup]
; Basic app info
AppId={{8F7A3B2C-1D4E-4F5A-9B8C-7E6D5C4B3A2F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
AppComments={#MyAppDescription}

; Installation directories
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; License and info files
LicenseFile=COPYRIGHT.md
InfoBeforeFile=README.md

; Output configuration
OutputDir=Output
OutputBaseFilename=Hibiki-Setup-{#MyAppVersion}
SetupIconFile=assets\hibiki_icon.ico
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern

; Privileges
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog

; Architecture
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

; Uninstall
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName}

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
; Main executable and all dependencies
Source: "dist\Hibiki\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; Documentation
Source: "README.md"; DestDir: "{app}\docs"; Flags: ignoreversion
Source: "USER-GUIDE.md"; DestDir: "{app}\docs"; Flags: ignoreversion
Source: "COPYRIGHT.md"; DestDir: "{app}\docs"; Flags: ignoreversion
Source: "CHANGELOG.md"; DestDir: "{app}\docs"; Flags: ignoreversion

; Config directory (created empty)
; Config will be created in user's AppData on first run

[Dirs]
; Create logs directory
Name: "{app}\logs"; Permissions: users-modify

[Icons]
; Start Menu
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Guide Utilisateur"; Filename: "{app}\docs\USER-GUIDE.md"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"

; Desktop icon (optional)
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

; Quick Launch (optional, old Windows versions)
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
; Launch app after installation (optional)
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
// Custom installation messages and checks

function GetGPUInfo: String;
var
  ResultCode: Integer;
begin
  // Try to detect NVIDIA GPU
  if Exec('cmd.exe', '/c nvidia-smi >nul 2>&1', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if ResultCode = 0 then
      Result := 'GPU NVIDIA détecté - Performance optimale attendue'
    else
      Result := 'Pas de GPU NVIDIA - Fonctionnement en mode CPU (plus lent)';
  end
  else
    Result := 'Détection GPU impossible';
end;

procedure InitializeWizard;
var
  GPUPage: TOutputMsgWizardPage;
begin
  // Create custom page to show GPU detection
  GPUPage := CreateOutputMsgPage(wpWelcome,
    'Configuration matérielle détectée',
    'Vérification de votre configuration',
    'Hibiki fonctionne mieux avec un GPU NVIDIA, mais fonctionne aussi sur CPU.' + #13#10 + #13#10 +
    'Résultat détection: ' + GetGPUInfo + #13#10 + #13#10 +
    'Configuration recommandée:' + #13#10 +
    '  • GPU NVIDIA RTX 2060+ (6GB VRAM)' + #13#10 +
    '  • 8GB RAM minimum (16GB recommandé)' + #13#10 +
    '  • 5GB espace disque libre' + #13#10 + #13#10 +
    'Configuration minimale:' + #13#10 +
    '  • CPU 6-8 cores' + #13#10 +
    '  • 16GB RAM (performance réduite)');
end;

function InitializeSetup: Boolean;
begin
  Result := True;

  // Check Windows version (Windows 10+ required)
  if not IsWindows10OrLater then
  begin
    MsgBox('Hibiki nécessite Windows 10 ou supérieur.', mbError, MB_OK);
    Result := False;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigDir: String;
begin
  if CurStep = ssPostInstall then
  begin
    // Create config directory in user's AppData
    ConfigDir := ExpandConstant('{userappdata}\Hibiki');
    if not DirExists(ConfigDir) then
      CreateDir(ConfigDir);
  end;
end;

function InitializeUninstall: Boolean;
var
  Response: Integer;
begin
  Response := MsgBox('Voulez-vous également supprimer votre configuration et vos logs ?' + #13#10 + #13#10 +
                     'Choisissez "Non" pour conserver vos paramètres personnalisés.',
                     mbConfirmation, MB_YESNOCANCEL);

  if Response = IDCANCEL then
    Result := False  // Cancel uninstall
  else if Response = IDYES then
  begin
    // User wants to delete config
    Result := True;
    // Config deletion handled in CurUninstallStepChanged
  end
  else
    Result := True;  // Uninstall but keep config
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  ConfigDir: String;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    ConfigDir := ExpandConstant('{userappdata}\Hibiki');
    if DirExists(ConfigDir) then
    begin
      // Only delete if user confirmed in InitializeUninstall
      if MsgBox('Supprimer la configuration dans: ' + ConfigDir + ' ?',
                mbConfirmation, MB_YESNO) = IDYES then
      begin
        DelTree(ConfigDir, True, True, True);
      end;
    end;
  end;
end;

[Messages]
; French custom messages
french.WelcomeLabel2=Ceci installera [name/ver] sur votre ordinateur.%n%nHibiki est une application de dictée vocale 100%% locale et confidentielle, développée par La Voie Shinkofa.%n%nAucune donnée n'est envoyée sur internet.
french.FinishedLabel=Hibiki a été installé avec succès sur votre ordinateur.%n%nConsultez le Guide Utilisateur (Menu Démarrer) pour apprendre à utiliser l'application.

; English custom messages
english.WelcomeLabel2=This will install [name/ver] on your computer.%n%nHibiki is a 100%% local and private voice dictation application, developed by La Voie Shinkofa.%n%nNo data is sent to the internet.
english.FinishedLabel=Hibiki has been successfully installed on your computer.%n%nSee the User Guide (Start Menu) to learn how to use the application.
