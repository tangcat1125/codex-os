import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace the .win95-splash block
old_block = """.win95-splash {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: url('/images/wallpapers/windows95/win95.png') no-repeat center center;
  background-size: cover;
  display: flex;"""

new_block = """.win95-splash {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: black url('/images/wallpapers/windows95/win95.png') no-repeat center center;
  background-size: contain;
  display: flex;"""

css = css.replace(old_block, new_block)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Fixed splash screen background size in style.css")
