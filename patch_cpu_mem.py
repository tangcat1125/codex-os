import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update CPU
js = js.replace('<div id="cpu-info">Intel 80486DX-50 MHz</div>', '<div id="cpu-info">Intel 80586-dx50 MHz</div>')

# Update Memory counting
old_mem_loop = """  while (mem < 4096) {
    mem += 128;
    memCount.innerText = mem;
    if (mem % 1024 === 0) hddSeek();
    await sleep(20);
  }"""

new_mem_loop = """  while (mem < 512) {
    mem += 16;
    memCount.innerText = mem;
    if (mem % 64 === 0) hddSeek();
    await sleep(40);
  }"""

js = js.replace(old_mem_loop, new_mem_loop)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated CPU and Memory settings in main.js")
