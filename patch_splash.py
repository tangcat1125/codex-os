import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

splash_html = """<div id="splash-ui" class="win95-splash hidden">
</div>"""

js = re.sub(r'<div id="splash-ui" class="win95-splash hidden">[\s\S]*?</div>\n</div>', splash_html, js)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Removed text from splash screen.")
