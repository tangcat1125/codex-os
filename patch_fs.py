import re

with open('main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add VirtualFS class at the very beginning of the file (after imports if any)
fs_logic = """
// Virtual File System
class VirtualFS {
  constructor() {
    this.root = this.load() || {
      'C:': {
        type: 'dir',
        children: {
          'WINDOWS': { type: 'dir', children: {} },
          'Program Files': { type: 'dir', children: {} },
          'My Documents': { type: 'dir', children: {} }
        }
      },
      'A:': { type: 'dir', children: {} }
    };
  }
  
  save() {
    localStorage.setItem('win95_vfs', JSON.stringify(this.root));
  }
  
  load() {
    try {
      return JSON.parse(localStorage.getItem('win95_vfs'));
    } catch(e) { return null; }
  }
  
  get(path) {
    if(!path) return this.root;
    const parts = path.split('\\\\').filter(p => p);
    let curr = this.root;
    for(let p of parts) {
      if(!curr[p]) return null;
      if(curr[p].type === 'dir') curr = curr[p].children;
      else curr = curr[p];
    }
    return curr;
  }
  
  write(path, filename, data, isImage=false) {
    const dir = this.get(path);
    if(dir) {
      dir[filename] = { type: 'file', data, isImage };
      this.save();
      return true;
    }
    return false;
  }
  
  remove(path, filename) {
    const dir = this.get(path);
    if(dir && dir[filename]) {
      delete dir[filename];
      this.save();
      return true;
    }
    return false;
  }
}
const vfs = new VirtualFS();
let currentExplorerPath = '';
let currentDialogMode = 'open'; // 'open' or 'save'
let currentDialogApp = ''; 
let currentDialogPath = 'C:\\\\My Documents';
let currentSelectedFile = null;

// Explorer UI Logic
window.openExplorer = function(startPath = '') {
  openWin('win-explorer');
  renderExplorer(startPath);
}

window.renderExplorer = function(path) {
  currentExplorerPath = path;
  document.getElementById('explorer-path').innerText = path || 'My Computer';
  const content = document.getElementById('explorer-content');
  content.innerHTML = '';
  
  const items = vfs.get(path);
  if(!items) return;
  
  Object.keys(items).forEach(key => {
    const item = items[key];
    const isDir = item.type === 'dir' || item.children;
    const div = document.createElement('div');
    div.className = 'fs-icon';
    let iconUrl = isDir ? 'https://win98icons.alexmeub.com/icons/png/directory_closed-4.png' : 'https://win98icons.alexmeub.com/icons/png/file_lines-0.png';
    if(key === 'C:' || key === 'A:') iconUrl = key === 'C:' ? 'https://win98icons.alexmeub.com/icons/png/drive_disk-4.png' : 'https://win98icons.alexmeub.com/icons/png/drive_floppy_525-4.png';
    if(item.isImage) iconUrl = 'https://win98icons.alexmeub.com/icons/png/image_document-0.png';
    
    div.innerHTML = `<div class="img" style="background: url('${iconUrl}') no-repeat center; background-size: contain;"></div><div class="label">${key}</div>`;
    div.onclick = () => {
      document.querySelectorAll('#explorer-content .fs-icon').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      currentSelectedFile = key;
    };
    div.ondblclick = () => {
      if(isDir) {
        renderExplorer(path ? path + '\\\\' + key : key);
      } else {
        // Open file
        if (item.isImage) {
          openWin('win-paint');
          const img = new Image();
          img.onload = () => {
             const canvas = document.getElementById('paint-canvas');
             const ctx = canvas.getContext('2d');
             ctx.fillStyle='white'; ctx.fillRect(0,0,canvas.width,canvas.height);
             ctx.drawImage(img, 0, 0);
          };
          img.src = item.data;
          document.querySelector('#win-paint .win-titlebar span').innerText = `Paint - ${key}`;
        } else {
          openWin('win-notepad');
          document.querySelector('.notepad-area').value = item.data;
          document.querySelector('#win-notepad .win-titlebar span').innerText = `${key} - Notepad`;
        }
      }
    };
    content.appendChild(div);
  });
}

window.explorerUp = function() {
  if(!currentExplorerPath) return;
  const parts = currentExplorerPath.split('\\\\');
  parts.pop();
  renderExplorer(parts.join('\\\\'));
}

window.explorerDelete = function() {
  if(!currentSelectedFile) return;
  if(vfs.remove(currentExplorerPath, currentSelectedFile)) {
    renderExplorer(currentExplorerPath);
    currentSelectedFile = null;
  }
}

// Dialog Logic
window.openDialog = function(app, mode) {
  currentDialogApp = app;
  currentDialogMode = mode;
  openWin('win-filedialog');
  document.getElementById('dialog-filename').value = '';
  document.querySelector('#win-filedialog .win-titlebar span').innerText = mode === 'save' ? 'Save As' : 'Open';
  document.getElementById('dialog-action-btn').innerText = mode === 'save' ? 'Save' : 'Open';
  renderDialogList(currentDialogPath);
}

window.renderDialogList = function(path) {
  currentDialogPath = path;
  document.getElementById('dialog-path-display').innerText = path;
  const content = document.getElementById('dialog-list');
  content.innerHTML = '';
  
  const items = vfs.get(path);
  if(!items) return;
  
  // Add UP folder if not root
  if(path) {
    const upDiv = document.createElement('div');
    upDiv.className = 'fs-icon';
    upDiv.innerHTML = `<div class="img" style="background: url('https://win98icons.alexmeub.com/icons/png/directory_open-4.png') no-repeat center; background-size: contain;"></div><div class="label">[..]</div>`;
    upDiv.ondblclick = () => {
      const parts = path.split('\\\\');
      parts.pop();
      renderDialogList(parts.join('\\\\'));
    };
    content.appendChild(upDiv);
  }
  
  Object.keys(items).forEach(key => {
    const item = items[key];
    const isDir = item.type === 'dir' || item.children;
    const div = document.createElement('div');
    div.className = 'fs-icon';
    let iconUrl = isDir ? 'https://win98icons.alexmeub.com/icons/png/directory_closed-4.png' : 'https://win98icons.alexmeub.com/icons/png/file_lines-0.png';
    if(key === 'C:' || key === 'A:') iconUrl = key === 'C:' ? 'https://win98icons.alexmeub.com/icons/png/drive_disk-4.png' : 'https://win98icons.alexmeub.com/icons/png/drive_floppy_525-4.png';
    if(item.isImage) iconUrl = 'https://win98icons.alexmeub.com/icons/png/image_document-0.png';
    
    div.innerHTML = `<div class="img" style="background: url('${iconUrl}') no-repeat center; background-size: contain;"></div><div class="label">${key}</div>`;
    div.onclick = () => {
      document.querySelectorAll('#dialog-list .fs-icon').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      if(!isDir) document.getElementById('dialog-filename').value = key;
    };
    div.ondblclick = () => {
      if(isDir) renderDialogList(path ? path + '\\\\' + key : key);
      else {
        document.getElementById('dialog-filename').value = key;
        dialogAction();
      }
    };
    content.appendChild(div);
  });
}

window.dialogAction = function() {
  const filename = document.getElementById('dialog-filename').value;
  if(!filename && currentDialogMode === 'save') return;
  
  if (currentDialogMode === 'save') {
    if (currentDialogApp === 'notepad') {
      const data = document.querySelector('.notepad-area').value;
      vfs.write(currentDialogPath, filename.includes('.') ? filename : filename+'.txt', data, false);
      document.querySelector('#win-notepad .win-titlebar span').innerText = `${filename} - Notepad`;
    } else if (currentDialogApp === 'paint') {
      const canvas = document.getElementById('paint-canvas');
      const data = canvas.toDataURL('image/png');
      vfs.write(currentDialogPath, filename.includes('.') ? filename : filename+'.bmp', data, true);
      document.querySelector('#win-paint .win-titlebar span').innerText = `Paint - ${filename}`;
    }
  } else {
    // Open
    const item = vfs.get(currentDialogPath)[filename];
    if(item && !item.children) {
      if (currentDialogApp === 'notepad' && !item.isImage) {
        document.querySelector('.notepad-area').value = item.data;
        document.querySelector('#win-notepad .win-titlebar span').innerText = `${filename} - Notepad`;
      } else if (currentDialogApp === 'paint' && item.isImage) {
        const img = new Image();
        img.onload = () => {
           const canvas = document.getElementById('paint-canvas');
           const ctx = canvas.getContext('2d');
           ctx.fillStyle='white'; ctx.fillRect(0,0,canvas.width,canvas.height);
           ctx.drawImage(img, 0, 0);
        };
        img.src = item.data;
        document.querySelector('#win-paint .win-titlebar span').innerText = `Paint - ${filename}`;
      }
    }
  }
  closeWin('win-filedialog');
  if(currentExplorerPath) renderExplorer(currentExplorerPath); // refresh if open
}
"""

content = content.replace("const app = document.getElementById('app');", "const app = document.getElementById('app');\n" + fs_logic)

# 2. Add File Explorer and File Dialog HTML right after IE Window
explorer_html = """
  <!-- Explorer Window -->
  <div id="win-explorer" class="win95-window hidden" style="top: 60px; left: 80px; width: 450px; height: 350px;">
    <div class="win-titlebar">
      <span id="explorer-title">My Computer</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-explorer')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-explorer')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-explorer')">X</div>
      </div>
    </div>
    <div class="menubar">
      <span>File</span><span>Edit</span><span>View</span><span>Help</span>
    </div>
    <div class="explorer-toolbar">
      <div class="explorer-btn" onclick="explorerUp()">↰</div>
      <div class="explorer-btn" onclick="explorerDelete()">🗑</div>
      <div style="flex:1;"></div>
      <div style="padding:0 5px; line-height:24px; font-weight:bold; font-size:12px;" id="explorer-path">My Computer</div>
    </div>
    <div class="explorer-content" id="explorer-content">
      <!-- Injected by JS -->
    </div>
    <div class="win-resizer"></div>
  </div>

  <!-- File Dialog Window -->
  <div id="win-filedialog" class="win95-window hidden" style="top: 150px; left: 200px; width: 400px; height: 260px; z-index:999;">
    <div class="win-titlebar">
      <span>Save As</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="closeWin('win-filedialog')">X</div>
      </div>
    </div>
    <div class="win-content file-dialog">
      <div class="file-dialog-row">
        <span>Save in:</span>
        <div style="background:white; border:inset 2px gray; flex:1; padding:2px;" id="dialog-path-display">C:\\</div>
      </div>
      <div class="file-dialog-list" id="dialog-list">
        <!-- Injected -->
      </div>
      <div class="file-dialog-row">
        <span style="width: 70px;">File name:</span>
        <input type="text" id="dialog-filename" style="flex:1;">
        <button class="win-btn" style="width: 70px;" id="dialog-action-btn" onclick="dialogAction()">Save</button>
      </div>
      <div class="file-dialog-row">
        <span style="width: 70px;">Save as type:</span>
        <select style="flex:1;"><option>All Files (*.*)</option></select>
        <button class="win-btn" style="width: 70px;" onclick="closeWin('win-filedialog')">Cancel</button>
      </div>
    </div>
    <div class="win-resizer"></div>
  </div>
"""
content = content.replace("  <!-- Calculator Window -->", explorer_html + "\n  <!-- Calculator Window -->")

# 3. Change Desktop "My Computer" ondblclick to openWin('win-explorer')
content = content.replace("ondblclick=\"openWin('win-sysprop')\"", "ondblclick=\"openExplorer()\"")

# Add Control Panel to Desktop
control_panel_icon = """
    <div class="desktop-icon" ondblclick="openWin('win-sysprop')">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/settings_gear-4.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Control Panel</div>
    </div>
"""
content = content.replace('<div class="desktop-icon">\n      <div class="icon-img">BIN</div>', control_panel_icon + '    <div class="desktop-icon">\n      <div class="icon-img">BIN</div>')

# 4. Modify Notepad Menu to trigger openDialog
notepad_menubar = '<span>File</span><span onclick="openDialog(\'notepad\', \'save\')">Save</span><span onclick="openDialog(\'notepad\', \'open\')">Open</span>'
content = content.replace('<span>File</span><span>Edit</span><span>Search</span><span>Help</span>', notepad_menubar)

# 5. Modify Paint Menu to trigger openDialog
paint_menubar = '<span>檔案(F)</span><span onclick="openDialog(\'paint\', \'save\')">儲存(S)</span><span onclick="openDialog(\'paint\', \'open\')">開啟(O)</span>'
content = content.replace('<span>檔案(F)</span><span>編輯(E)</span><span>查看(V)</span><span>文字(T)</span><span style="color:gray;">選取(P)</span><span>選項(O)</span><span>輔助說明(H)</span>', paint_menubar)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated main.js with VirtualFS successfully.")
