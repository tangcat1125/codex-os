import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_block = """.desktop {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #008080;"""

new_block = """.desktop {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: url('/images/desktop/desktop.jpg') no-repeat center center;
  background-size: cover;
  background-color: #008080;"""

css = css.replace(old_block, new_block)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Fixed desktop background in style.css")
