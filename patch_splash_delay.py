import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the short splash loop with a 5 second delay logic
old_code = """  for(let i=0; i<15; i++) {
    hddSeek();
    await sleep(50 + Math.random() * 100);
  }"""

new_code = """  // Simulate loading for 5 seconds
  for(let i=0; i<50; i++) {
    if (i % 3 === 0) hddSeek(); // Don't spam the audio too much
    await sleep(100);
  }"""

js = js.replace(old_code, new_code)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated splash screen delay to 5 seconds.")
