import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_mem_loop = """  while (mem < 512) {
    mem += 16;
    memCount.innerText = mem;
    if (mem % 64 === 0) hddSeek();
    await sleep(40);
  }"""

new_mem_loop = """  while (mem < 524288) { // 512MB in KB
    mem += 16384; // Increment by 16MB to keep boot time reasonable
    memCount.innerText = mem;
    hddSeek();
    await sleep(40);
  }"""

js = js.replace(old_mem_loop, new_mem_loop)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated Memory settings to 512MB in main.js")
