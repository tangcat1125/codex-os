import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Update splash screen path to use win95.png instead of clouds.png
css = css.replace("url('/images/wallpapers/windows95/clouds.png')", "url('/images/wallpapers/windows95/win95.png')")
# Handle the old codex-os path just in case
css = css.replace("url('/codex-os/03_windows95_clouds_wallpaper/windows95_clouds.png')", "url('/images/wallpapers/windows95/win95.png')")


with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated splash screen to win95.png.")
