import re

with open('main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add win-controls to every window
def replace_titlebar(match):
    title = match.group(1)
    close_btn = match.group(2)
    id_name = re.search(r"closeWin\('([^']+)'\)", close_btn).group(1)
    controls = f'''<div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('{id_name}')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('{id_name}')">□</div>
        {close_btn.replace('win-close-btn', 'win-ctrl-btn')}
      </div>'''
    return f'<span>{title}</span>\n      {controls}'

content = re.sub(r'<span>(.*?)</span>\s*(<div class="win-close-btn".*?>X</div>)', replace_titlebar, content)

# Add win-resizer to every window before closing div
content = re.sub(r'(  </div>\n\n  <!--)', r'    <div class="win-resizer"></div>\n  </div>\n\n  <!--', content)

# Also add resizer to the last window (Internet Connection Wizard)
content = content.replace('      <button class="win-btn" style="width:70px;" onclick="closeWin(\'win-icw\')">Cancel</button>\n    </div>\n  </div>', 
                          '      <button class="win-btn" style="width:70px;" onclick="closeWin(\'win-icw\')">Cancel</button>\n    </div>\n    <div class="win-resizer"></div>\n  </div>')

# Add taskbar-apps container to taskbar
content = content.replace('<div class="taskbar">\n    <button class="start-btn" onclick="toggleStartMenu(event)"><b>Start</b></button>\n    <div style="flex: 1;"></div>',
                          '<div class="taskbar">\n    <button class="start-btn" onclick="toggleStartMenu(event)"><b>Start</b></button>\n    <div class="taskbar-apps" id="taskbar-apps"></div>\n    <div style="flex: 1;"></div>')


# Add window management javascript logic before Calculator Logic
wm_logic = """
// Window Management Core Logic
let zIndex = 10;
const taskbarApps = document.getElementById('taskbar-apps');

function bringToFront(id) {
  const win = document.getElementById(id);
  if(win) {
    win.style.zIndex = ++zIndex;
    document.querySelectorAll('.win-titlebar').forEach(tb => tb.classList.add('inactive'));
    win.querySelector('.win-titlebar').classList.remove('inactive');
    
    document.querySelectorAll('.taskbar-btn').forEach(tb => tb.classList.remove('active'));
    const tbtn = document.getElementById('tbtn-' + id);
    if(tbtn) tbtn.classList.add('active');
  }
}

window.openWin = function(id) {
  const win = document.getElementById(id);
  win.classList.remove('hidden');
  
  if (!document.getElementById('tbtn-' + id)) {
    const title = win.querySelector('.win-titlebar span').innerText;
    const btn = document.createElement('div');
    btn.id = 'tbtn-' + id;
    btn.className = 'taskbar-btn';
    btn.innerText = title;
    btn.onclick = () => {
      if (win.classList.contains('hidden') || win.style.display === 'none') {
        win.style.display = 'flex';
        win.classList.remove('hidden');
        bringToFront(id);
      } else if (win.querySelector('.win-titlebar').classList.contains('inactive')) {
        bringToFront(id);
      } else {
        window.minWin(id);
      }
    };
    taskbarApps.appendChild(btn);
  }
  
  win.style.display = 'flex';
  bringToFront(id);
  closeStartMenu();
  if(id === 'win-dos') setTimeout(() => document.getElementById('dos-input').focus(), 100);
}

window.closeWin = function(id) {
  const win = document.getElementById(id);
  win.classList.add('hidden');
  win.style.display = 'none';
  const tbtn = document.getElementById('tbtn-' + id);
  if(tbtn) tbtn.remove();
}

window.minWin = function(id) {
  document.getElementById(id).style.display = 'none';
  const tbtn = document.getElementById('tbtn-' + id);
  if(tbtn) tbtn.classList.remove('active');
}

window.maxWin = function(id) {
  const win = document.getElementById(id);
  win.classList.toggle('maximized');
  bringToFront(id);
}

// Dragging Logic
let isDragging = false;
let dragWin = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

document.addEventListener('mousedown', (e) => {
  const titlebar = e.target.closest('.win-titlebar');
  if (titlebar && !e.target.closest('.win-controls')) {
    const win = titlebar.closest('.win95-window');
    bringToFront(win.id);
    if (!win.classList.contains('maximized')) {
      isDragging = true;
      dragWin = win;
      const rect = win.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
    }
  } else {
    const win = e.target.closest('.win95-window');
    if(win) bringToFront(win.id);
  }
});

// Resizing Logic
let isResizing = false;
let resizeWin = null;
let startW = 0;
let startH = 0;
let startX = 0;
let startY = 0;

document.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('win-resizer')) {
    const win = e.target.closest('.win95-window');
    bringToFront(win.id);
    if (!win.classList.contains('maximized')) {
      isResizing = true;
      resizeWin = win;
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      e.preventDefault();
    }
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDragging && dragWin) {
    dragWin.style.left = (e.clientX - dragOffsetX) + 'px';
    dragWin.style.top = (e.clientY - dragOffsetY) + 'px';
  } else if (isResizing && resizeWin) {
    resizeWin.style.width = (startW + e.clientX - startX) + 'px';
    resizeWin.style.height = (startH + e.clientY - startY) + 'px';
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  dragWin = null;
  isResizing = false;
  resizeWin = null;
});
"""

# Replace the old openWin/closeWin block with wm_logic
content = re.sub(r'window\.openWin = function\(id\) \{[\s\S]*?window\.closeWin = function\(id\) \{[\s\S]*?\}\n', wm_logic + '\n', content)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated main.js successfully.")
