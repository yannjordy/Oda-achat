#!/usr/bin/env python3
"""
Générateur de Son de Notification pour PWA
Crée un fichier audio MP3 pour les notifications push
"""

import os
import sys

def create_notification_sound():
    """
    Génère un son de notification en utilisant sox ou ffmpeg
    """
    print("🔊 Génération du son de notification...")
    
    # Vérifier si sox est installé
    sox_available = os.system("which sox > /dev/null 2>&1") == 0
    ffmpeg_available = os.system("which ffmpeg > /dev/null 2>&1") == 0
    
    if sox_available:
        generate_with_sox()
    elif ffmpeg_available:
        generate_with_ffmpeg()
    else:
        print("❌ sox ou ffmpeg requis pour générer l'audio")
        print("Installation:")
        print("  Ubuntu/Debian: sudo apt-get install sox libsox-fmt-mp3")
        print("  macOS: brew install sox")
        print("  ou téléchargez un fichier audio depuis:")
        print("  - https://notificationsounds.com/")
        print("  - https://freesound.org/")
        sys.exit(1)

def generate_with_sox():
    """Générer avec SoX (Sound eXchange)"""
    print("✅ Utilisation de SoX")
    
    # Générer un double bip agréable
    # Premier bip (800 Hz, 0.15s)
    os.system("sox -n -r 44100 -c 1 /tmp/beep1.wav synth 0.15 sine 800 fade 0.02 0.15 0.05")
    
    # Pause (0.1s de silence)
    os.system("sox -n -r 44100 -c 1 /tmp/pause.wav trim 0 0.1")
    
    # Deuxième bip (960 Hz, 0.15s)
    os.system("sox -n -r 44100 -c 1 /tmp/beep2.wav synth 0.15 sine 960 fade 0.02 0.15 0.05")
    
    # Concaténer les fichiers
    os.system("sox /tmp/beep1.wav /tmp/pause.wav /tmp/beep2.wav /tmp/notification.wav")
    
    # Convertir en MP3
    os.system("sox /tmp/notification.wav -C 128 notification-sound.mp3")
    
    # Nettoyer
    os.system("rm /tmp/beep1.wav /tmp/pause.wav /tmp/beep2.wav /tmp/notification.wav")
    
    print("✅ Fichier créé: notification-sound.mp3")
    print(f"📊 Taille: {os.path.getsize('notification-sound.mp3') / 1024:.2f} KB")

def generate_with_ffmpeg():
    """Générer avec FFmpeg"""
    print("✅ Utilisation de FFmpeg")
    
    # Générer un son avec FFmpeg
    os.system("""
        ffmpeg -f lavfi -i "sine=frequency=800:duration=0.15" -af "afade=t=in:st=0:d=0.02,afade=t=out:st=0.13:d=0.02" /tmp/beep1.wav -y
    """)
    
    os.system("""
        ffmpeg -f lavfi -i "anullsrc=r=44100:cl=mono" -t 0.1 /tmp/pause.wav -y
    """)
    
    os.system("""
        ffmpeg -f lavfi -i "sine=frequency=960:duration=0.15" -af "afade=t=in:st=0:d=0.02,afade=t=out:st=0.13:d=0.02" /tmp/beep2.wav -y
    """)
    
    # Concaténer
    with open('/tmp/concat.txt', 'w') as f:
        f.write("file '/tmp/beep1.wav'\n")
        f.write("file '/tmp/pause.wav'\n")
        f.write("file '/tmp/beep2.wav'\n")
    
    os.system("ffmpeg -f concat -safe 0 -i /tmp/concat.txt -c:a libmp3lame -b:a 128k notification-sound.mp3 -y")
    
    # Nettoyer
    os.system("rm /tmp/beep1.wav /tmp/pause.wav /tmp/beep2.wav /tmp/concat.txt")
    
    print("✅ Fichier créé: notification-sound.mp3")
    print(f"📊 Taille: {os.path.getsize('notification-sound.mp3') / 1024:.2f} KB")

def download_free_sound():
    """Télécharger un son gratuit depuis internet"""
    import urllib.request
    
    print("📥 Téléchargement d'un son de notification gratuit...")
    
    # URL d'un son libre de droits (exemple)
    # Vous pouvez remplacer par n'importe quel son gratuit
    urls = [
        "https://notificationsounds.com/soundfiles/notification.mp3",
        "https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3"
    ]
    
    for url in urls:
        try:
            urllib.request.urlretrieve(url, "notification-sound.mp3")
            print(f"✅ Téléchargé depuis: {url}")
            print(f"📊 Taille: {os.path.getsize('notification-sound.mp3') / 1024:.2f} KB")
            return
        except Exception as e:
            print(f"❌ Échec: {url}")
            continue
    
    print("❌ Impossible de télécharger un son")

if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════╗
    ║  Générateur de Son de Notification PWA  ║
    ╚══════════════════════════════════════════╝
    """)
    
    print("Choisissez une option:")
    print("1. Générer un son avec SoX/FFmpeg (recommandé)")
    print("2. Télécharger un son gratuit")
    print("3. Instructions pour upload manuel")
    
    choice = input("\nVotre choix (1-3): ").strip()
    
    if choice == "1":
        create_notification_sound()
    elif choice == "2":
        download_free_sound()
    elif choice == "3":
        print("""
📚 Instructions pour son personnalisé:

1. Téléchargez un son depuis:
   - https://notificationsounds.com/
   - https://freesound.org/
   - https://mixkit.co/free-sound-effects/

2. Caractéristiques recommandées:
   - Format: MP3 ou OGG
   - Durée: 0.5 - 1 seconde
   - Taille: < 50 KB
   - Qualité: 128 kbps

3. Renommez le fichier en: notification-sound.mp3

4. Placez-le dans le dossier racine de votre site

5. Modifiez le chemin dans pwa-manager-optimized.js si nécessaire:
   soundUrl: '/chemin/vers/votre/son.mp3'
        """)
    else:
        print("❌ Option invalide")
        sys.exit(1)
    
    print("\n✅ Terminé!")
    print("📍 Placez le fichier notification-sound.mp3 dans le dossier racine de votre site")
