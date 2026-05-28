import re

# Update main.js
with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace("'/images/", "'./images/")
js = js.replace('"/images/', '"./images/')

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

# Update style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace("'/images/", "'./images/")
css = css.replace('"/images/', '"./images/')

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Replaced all absolute /images/ paths with relative ./images/ paths.")
