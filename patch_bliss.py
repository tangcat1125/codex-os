import re

# Update style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_css = """  background: url('/images/desktop/desktop.jpg') no-repeat center center;"""
new_css = """  background: url('/images/wallpapers/windowsxp/bliss.jpg') no-repeat center center;"""
css = css.replace(old_css, new_css)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)


# Update main.js to add Bliss to dropdown and maybe set it as default
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_options = """          <option value="/images/desktop/desktop.jpg">Classic Desktop (Default)</option>
          <option value="/images/wallpapers/windows95/clouds.png">Clouds</option>
          <option value="/images/wallpapers/windows95/win95.png">Windows 95 Flag</option>"""

new_options = """          <option value="/images/wallpapers/windowsxp/bliss.jpg">Windows XP Bliss (Default)</option>
          <option value="/images/desktop/desktop.jpg">Classic Desktop</option>
          <option value="/images/wallpapers/windows95/clouds.png">Clouds</option>
          <option value="/images/wallpapers/windows95/win95.png">Windows 95 Flag</option>"""

js = js.replace(old_options, new_options)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated default wallpaper to bliss.jpg and added to Display Properties.")
