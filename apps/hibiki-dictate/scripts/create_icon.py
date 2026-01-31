"""
Crée une icône Hibiki avec emoji microphone
Utilise Pillow pour générer un fichier .ico multi-résolution

Requirements: pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_microphone_icon(output_path="assets/hibiki_icon.ico"):
    """
    Crée une icône avec emoji microphone.
    Génère plusieurs résolutions : 256x256, 128x128, 64x64, 32x32, 16x16
    """

    # Créer dossier assets si n'existe pas
    os.makedirs("assets", exist_ok=True)

    # Tailles à générer
    sizes = [256, 128, 64, 32, 16]
    images = []

    for size in sizes:
        # Créer image avec fond transparent
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Couleur de fond (violet Shinkofa)
        shinkofa_purple = (138, 43, 226, 255)  # BlueViolet

        # Dessiner cercle de fond
        margin = size // 20
        draw.ellipse(
            [margin, margin, size - margin, size - margin],
            fill=shinkofa_purple,
            outline=(255, 255, 255, 255),
            width=max(1, size // 50)
        )

        # Dessiner microphone (simplifié)
        # Centre du micro
        center_x = size // 2
        center_y = size // 2

        # Taille micro proportionnelle
        mic_width = size // 5
        mic_height = size // 3

        # Corps du micro (rectangle arrondi)
        mic_top = center_y - mic_height // 2
        mic_bottom = center_y + mic_height // 4
        mic_left = center_x - mic_width // 2
        mic_right = center_x + mic_width // 2

        draw.rounded_rectangle(
            [mic_left, mic_top, mic_right, mic_bottom],
            radius=mic_width // 2,
            fill=(255, 255, 255, 255)
        )

        # Pied du micro
        stand_width = mic_width // 4
        stand_height = size // 6
        stand_top = mic_bottom
        stand_bottom = stand_top + stand_height

        draw.rectangle(
            [center_x - stand_width // 2, stand_top,
             center_x + stand_width // 2, stand_bottom],
            fill=(255, 255, 255, 255)
        )

        # Base du micro
        base_width = mic_width * 1.5
        base_height = size // 20

        draw.ellipse(
            [center_x - base_width // 2, stand_bottom - base_height // 2,
             center_x + base_width // 2, stand_bottom + base_height // 2],
            fill=(255, 255, 255, 255)
        )

        # Grille du micro (3 lignes horizontales)
        for i in range(3):
            y = mic_top + mic_height // 4 + i * (mic_height // 8)
            draw.line(
                [mic_left + mic_width // 4, y, mic_right - mic_width // 4, y],
                fill=shinkofa_purple,
                width=max(1, size // 80)
            )

        images.append(img)

    # Sauvegarder en .ico multi-résolution
    images[0].save(
        output_path,
        format='ICO',
        sizes=[(s, s) for s in sizes],
        append_images=images[1:]
    )

    print(f"✓ Icône créée : {output_path}")
    print(f"  Résolutions : {', '.join(f'{s}x{s}' for s in sizes)}")

    # Créer aussi une version PNG 256x256 pour preview
    png_path = output_path.replace('.ico', '.png')
    images[0].save(png_path, format='PNG')
    print(f"✓ Preview PNG : {png_path}")

if __name__ == "__main__":
    create_microphone_icon()
