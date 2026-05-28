import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('let isConnected = false;', 'let isConnected = true;')

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Set isConnected to true by default.")
