"""
Auto-update system for Hibiki.
Checks GitHub Releases for new versions and notifies user.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import json
import urllib.request
import urllib.error
import re
from typing import Optional, Dict, Tuple
from pathlib import Path
from loguru import logger


class AutoUpdater:
    """Auto-update checker for Hibiki."""

    def __init__(
        self,
        current_version: str = "1.0.0",
        github_repo: str = "theermite/hibiki",
        check_on_startup: bool = True
    ):
        """
        Initialize auto-updater.

        Args:
            current_version: Current app version (semver format)
            github_repo: GitHub repository (user/repo)
            check_on_startup: Check for updates on app startup
        """
        self.current_version = current_version
        self.github_repo = github_repo
        self.check_on_startup = check_on_startup
        self.api_url = f"https://api.github.com/repos/{github_repo}/releases/latest"

    def parse_version(self, version: str) -> Tuple[int, int, int]:
        """
        Parse semantic version string to tuple.

        Args:
            version: Version string like "1.2.3" or "v1.2.3"

        Returns:
            Tuple of (major, minor, patch)
        """
        # Remove 'v' prefix if present
        version = version.lstrip('v')

        # Extract numbers
        match = re.match(r'(\d+)\.(\d+)\.(\d+)', version)
        if not match:
            logger.warning(f"Invalid version format: {version}")
            return (0, 0, 0)

        return tuple(map(int, match.groups()))

    def is_newer_version(self, latest: str, current: str) -> bool:
        """
        Compare two versions.

        Args:
            latest: Latest version string
            current: Current version string

        Returns:
            True if latest > current
        """
        latest_tuple = self.parse_version(latest)
        current_tuple = self.parse_version(current)

        return latest_tuple > current_tuple

    def check_for_updates(self) -> Optional[Dict]:
        """
        Check GitHub Releases for new version.

        Returns:
            Dict with update info if available, None otherwise
            {
                'version': '1.1.0',
                'download_url': 'https://...',
                'release_notes': 'What\'s new...',
                'published_at': '2025-01-15'
            }
        """
        try:
            logger.info(f"Checking for updates from {self.api_url}")

            # Create request with User-Agent (required by GitHub API)
            req = urllib.request.Request(
                self.api_url,
                headers={'User-Agent': 'Hibiki-AutoUpdater/1.0'}
            )

            # Fetch latest release info
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))

            latest_version = data.get('tag_name', '').lstrip('v')

            # Check if newer version available
            if self.is_newer_version(latest_version, self.current_version):
                logger.info(f"✨ New version available: {latest_version} (current: {self.current_version})")

                # Extract download URL for Windows installer
                download_url = None
                for asset in data.get('assets', []):
                    name = asset.get('name', '')
                    # Look for Hibiki-Setup-*.exe
                    if name.startswith('Hibiki-Setup') and name.endswith('.exe'):
                        download_url = asset.get('browser_download_url')
                        break

                if not download_url:
                    # Fallback to release page
                    download_url = data.get('html_url')

                return {
                    'version': latest_version,
                    'download_url': download_url,
                    'release_notes': data.get('body', 'Aucune note de version disponible.'),
                    'published_at': data.get('published_at', '')[:10],  # YYYY-MM-DD
                    'is_prerelease': data.get('prerelease', False)
                }
            else:
                logger.info(f"✅ Up to date (current: {self.current_version})")
                return None

        except urllib.error.HTTPError as e:
            if e.code == 404:
                logger.warning("No releases found on GitHub")
            else:
                logger.error(f"HTTP error checking updates: {e.code}")
            return None

        except urllib.error.URLError as e:
            logger.warning(f"Network error checking updates: {e.reason}")
            return None

        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response: {e}")
            return None

        except Exception as e:
            logger.error(f"Unexpected error checking updates: {e}")
            return None

    def download_update(
        self,
        download_url: str,
        save_path: Optional[Path] = None
    ) -> Optional[Path]:
        """
        Download update installer.

        Args:
            download_url: URL to download from
            save_path: Where to save (default: Downloads folder)

        Returns:
            Path to downloaded file, or None if failed
        """
        try:
            if save_path is None:
                # Default to user's Downloads folder
                downloads_dir = Path.home() / "Downloads"
                downloads_dir.mkdir(exist_ok=True)
                filename = download_url.split('/')[-1]
                save_path = downloads_dir / filename

            logger.info(f"Downloading update from {download_url}")
            logger.info(f"Saving to {save_path}")

            # Download with progress (simple version)
            urllib.request.urlretrieve(download_url, save_path)

            logger.info(f"✅ Update downloaded: {save_path}")
            return save_path

        except Exception as e:
            logger.error(f"Failed to download update: {e}")
            return None

    def get_update_message(self, update_info: Dict) -> str:
        """
        Format update notification message.

        Args:
            update_info: Dict from check_for_updates()

        Returns:
            Formatted message string
        """
        version = update_info['version']
        notes = update_info['release_notes'][:200] + "..." if len(update_info['release_notes']) > 200 else update_info['release_notes']

        msg = f"""
🎉 Nouvelle version disponible !

Version actuelle : {self.current_version}
Nouvelle version : {version}
Publiée le : {update_info['published_at']}

Nouveautés :
{notes}

Voulez-vous télécharger la mise à jour maintenant ?
"""
        return msg.strip()


# Singleton instance
_updater_instance = None

def get_updater(current_version: str = "1.0.0") -> AutoUpdater:
    """Get singleton updater instance."""
    global _updater_instance
    if _updater_instance is None:
        _updater_instance = AutoUpdater(current_version=current_version)
    return _updater_instance


if __name__ == "__main__":
    # Test auto-updater
    from loguru import logger

    logger.info("Testing auto-updater...")

    updater = AutoUpdater(current_version="1.0.0")
    update_info = updater.check_for_updates()

    if update_info:
        print("\n" + "="*50)
        print(updater.get_update_message(update_info))
        print("="*50)
        print(f"\nDownload URL: {update_info['download_url']}")
    else:
        print("\n✅ No updates available")
