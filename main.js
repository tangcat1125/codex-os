import './style.css'

const app = document.getElementById('app');

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
    const parts = path.split('\\').filter(p => p);
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
let currentDialogPath = 'C:\\My Documents';
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
        renderExplorer(path ? path + '\\' + key : key);
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
  const parts = currentExplorerPath.split('\\');
  parts.pop();
  renderExplorer(parts.join('\\'));
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
      const parts = path.split('\\');
      parts.pop();
      renderDialogList(parts.join('\\'));
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
      if(isDir) renderDialogList(path ? path + '\\' + key : key);
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


const BIOS_SCREEN = `
<div id="bios-ui" class="bios-screen hidden">
  <div class="bios-top">
    <div class="bios-logo">Award Modular BIOS v4.51PG, An Energy Star Ally<br>Copyright (C) 1984-95, Award Software, Inc.</div>
    <div class="bios-energy-star">
      <pre>
    EPA
  POLLUTION
  PREVENTER
      </pre>
    </div>
  </div>
  <div class="bios-info">
    <div id="cpu-info">Intel 80586-dx50 MHz</div>
    <div id="memory-info">Memory Test : <span id="mem-count">0</span>K OK</div>
    <br>
    <div id="bios-messages"></div>
    <br>
    <div id="boot-prompt"></div>
  </div>
</div>
`;

const DOS_SCREEN = `
<div id="dos-ui" class="bios-screen hidden" style="justify-content: flex-start; padding-top: 50px;">
  <div id="dos-content"></div>
  <div><span class="cursor"></span></div>
</div>
`;

const WIN95_SPLASH = `
<div id="splash-ui" class="win95-splash hidden">
</div>
`;

const DESKTOP = `
<div id="desktop-ui" class="desktop hidden" onclick="closeStartMenu()">
  <div class="desktop-icons">
    <div class="desktop-icon" ondblclick="openWin('win-display')">
      <div class="icon-img" style="background: url('./images/desktop_icons/control_panel.png') no-repeat center center; background-size: contain;"></div>
      <span>Display<br>Properties</span>
    </div>
    <div class="desktop-icon" ondblclick="openExplorer()">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">My Computer</div>
    </div>
    <div class="desktop-icon">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/network_normal_two_pcs-4.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Network Neighborhood</div>
    </div>
    <div class="desktop-icon">
      <div class="icon-img" style="background: url('./images/desktop/icons/12_recycle_bin.png') no-repeat center; background-size: contain;"></div>
      <div class="icon-text">Recycle Bin</div>
    </div>
    <div class="desktop-icon" ondblclick="openWin('win-sysprop')">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/settings_gear-4.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Control Panel</div>
    </div>
    <div class="desktop-icon" ondblclick="openWin('win-icw')">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/connection_dial_up-3.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Setup The Microsoft Network</div>
    </div>
    <div class="desktop-icon" ondblclick="openDialUp()">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/modem-1.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Dial-Up Networking</div>
    </div>
    <div class="desktop-icon" ondblclick="openIE()">
      <div class="icon-img" style="background: url('./images/desktop/icons/01_browsers.png') no-repeat center; background-size: contain;"></div>
      <div class="icon-text">Netscape Navigator</div>
    </div>
    <div class="desktop-icon" ondblclick="openIE()">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/msie1-0.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Internet Explorer</div>
    </div>
    <div class="win-resizer"></div>
  </div>

  <!-- Dial Up Window -->
  <div id="win-dialup" class="win95-window hidden" style="top: 100px; left: 100px; width: 300px;">
    <div class="win-titlebar">
      <span>Connect to Hinet</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-dialup')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-dialup')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-dialup')">X</div>
      </div>
    </div>
    <div class="win-content">
      <div style="display:flex; margin-bottom: 10px;">
        <div style="width:60px;">User name:</div>
        <input type="text" class="win-input" value="HN12345678" style="flex:1" disabled>
      </div>
      <div style="display:flex; margin-bottom: 10px;">
        <div style="width:60px;">Password:</div>
        <input type="password" class="win-input" value="********" style="flex:1" disabled>
      </div>
      <div style="display:flex; margin-bottom: 20px;">
        <div style="width:60px;">Phone:</div>
        <input type="text" class="win-input" value="4125000" style="flex:1" disabled>
      </div>
      <div style="text-align:center; font-family:'Arial'; font-size:12px; height: 20px; margin-bottom: 10px;" id="dial-status"></div>
      <div style="display:flex; justify-content:center; gap: 10px;">
        <button class="win-btn" id="btn-dial" onclick="startDialUp()">Connect</button>
        <button class="win-btn" onclick="closeWin('win-dialup')">Cancel</button>
      </div>
    </div>
    <div class="win-resizer"></div>
  </div>

  <!-- IE Window -->
  <div id="win-ie" class="win95-window hidden" style="top: 50px; left: 50px; width: 640px; height: 480px;">
    <div class="win-titlebar">
      <span>Internet Explorer</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-ie')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-ie')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-ie')">X</div>
      </div>
    </div>
    <div style="padding: 2px 5px; background: #c0c0c0; border-bottom: 1px solid #808080; display:flex; gap: 5px;">
      <button class="win-btn">Back</button>
      <button class="win-btn">Forward</button>
      <button class="win-btn">Stop</button>
      <button class="win-btn">Refresh</button>
      <button class="win-btn">Home</button>
    </div>
    <div style="padding: 2px 5px; background: #c0c0c0; border-bottom: 1px solid #808080; display:flex; align-items:center;">
      <span style="margin-right: 5px;">Address:</span>
      <input type="text" class="win-input" id="ie-address" value="http://www.yahoo.com" style="flex:1" onkeydown="handleIENav(event)">
    </div>
    <div class="win-content" id="ie-content" style="background: white; border: inset 2px #808080; overflow-y: auto;">
      <!-- Content injected by JS based on connection state -->
    </div>
    <div class="win-resizer"></div>
  </div>


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
        <div style="background:white; border:inset 2px gray; flex:1; padding:2px;" id="dialog-path-display">C:\</div>
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

  <!-- Calculator Window -->
  <div id="win-calc" class="win95-window hidden" style="top: 150px; left: 150px; width: 250px;">
    <div class="win-titlebar">
      <span>Calculator</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-calc')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-calc')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-calc')">X</div>
      </div>
    </div>
    <div class="menubar">
      <span>Edit</span><span>View</span><span>Help</span>
    </div>
    <div class="win-content">
      <div class="calc-display" id="calc-display">0</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px;">
        <div class="calc-btn red" onclick="calcInput('C')">C</div>
        <div class="calc-btn red" onclick="calcInput('CE')">CE</div>
        <div class="calc-btn" onclick="calcInput('B')">Back</div>
        <div class="calc-btn red" onclick="calcInput('/')">/</div>
        <div class="calc-btn" onclick="calcInput('7')">7</div>
        <div class="calc-btn" onclick="calcInput('8')">8</div>
        <div class="calc-btn" onclick="calcInput('9')">9</div>
        <div class="calc-btn red" onclick="calcInput('*')">*</div>
        <div class="calc-btn" onclick="calcInput('4')">4</div>
        <div class="calc-btn" onclick="calcInput('5')">5</div>
        <div class="calc-btn" onclick="calcInput('6')">6</div>
        <div class="calc-btn red" onclick="calcInput('-')">-</div>
        <div class="calc-btn" onclick="calcInput('1')">1</div>
        <div class="calc-btn" onclick="calcInput('2')">2</div>
        <div class="calc-btn" onclick="calcInput('3')">3</div>
        <div class="calc-btn red" onclick="calcInput('+')">+</div>
        <div class="calc-btn" onclick="calcInput('0')">0</div>
        <div class="calc-btn" onclick="calcInput('+/-')">+/-</div>
        <div class="calc-btn" onclick="calcInput('.')">.</div>
        <div class="calc-btn red" onclick="calcInput('=')">=</div>
      </div>
    </div>
    <div class="win-resizer"></div>
  </div>

  <!-- Notepad Window -->
  <div id="win-notepad" class="win95-window hidden" style="top: 80px; left: 400px; width: 400px; height: 300px;">
    <div class="win-titlebar">
      <span>Untitled - Notepad</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-notepad')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-notepad')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-notepad')">X</div>
      </div>
    </div>
    <div class="menubar">
      <span>File</span><span onclick="openDialog('notepad', 'save')">Save</span><span onclick="openDialog('notepad', 'open')">Open</span>
    </div>
    <div class="win-content" style="padding: 0;">
      <textarea class="notepad-area"></textarea>
    </div>
    <div class="win-resizer"></div>
  </div>

  <!-- MS-DOS Prompt -->
  <div id="win-dos" class="win95-window hidden" style="top: 200px; left: 350px; width: 500px; height: 350px;">
    <div class="win-titlebar">
      <span>MS-DOS Prompt</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-dos')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-dos')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-dos')">X</div>
      </div>
    </div>
    <div class="win-content" style="padding: 0;">
      <div class="dos-prompt" id="dos-terminal" onclick="document.getElementById('dos-input').focus()">
        <div>Microsoft(R) Windows 95</div>
        <div>(C)Copyright Microsoft Corp 1981-1995.</div><br>
        <div id="dos-history"></div>
        <div style="display:flex;">
          <span>C:\\WINDOWS&gt;</span>
          <input type="text" id="dos-input" onkeydown="handleDos(event)" autocomplete="off">
        </div>
      </div>
    </div>
    <div class="win-resizer"></div>
  </div>

  <!-- Paint Window -->
  <div id="win-paint" class="win95-window hidden" style="top: 100px; left: 200px; width: 640px; height: 480px; display:flex; flex-direction:column;">
    <div class="win-titlebar">
      <span>調色盤 - [未命名]</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-paint')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-paint')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-paint')">X</div>
      </div>
    </div>
    <div class="menubar">
      <span>檔案(F)</span><span onclick="openDialog('paint', 'save')">儲存(S)</span><span onclick="openDialog('paint', 'open')">開啟(O)</span>
    </div>
    <div class="win-content paint-layout" style="padding: 0;">
      <div style="display:flex; flex:1; overflow:hidden;">
        <!-- Toolbox -->
        <div class="paint-toolbar-left">
          <div class="paint-tool-grid">
            <div class="paint-tool-btn" style="background: url('https://win98icons.alexmeub.com/icons/png/paint_file-1.png') no-repeat center; background-size: 16px;"></div>
            <div class="paint-tool-btn" style="background: url('https://win98icons.alexmeub.com/icons/png/paint_file-1.png') no-repeat center; background-size: 16px;"></div>
            <div class="paint-tool-btn">A</div>
            <div class="paint-tool-btn">B</div>
            <div class="paint-tool-btn">🖌</div>
            <div class="paint-tool-btn active">✎</div>
            <div class="paint-tool-btn">/</div>
            <div class="paint-tool-btn">~</div>
            <div class="paint-tool-btn">⬜</div>
            <div class="paint-tool-btn">⭕</div>
            <div class="paint-tool-btn">🔲</div>
            <div class="paint-tool-btn">⬟</div>
          </div>
          <div class="paint-line-widths">
            <div style="width: 25px; border-bottom: 1px solid black;"></div>
            <div style="width: 25px; border-bottom: 2px solid black;"></div>
            <div style="width: 25px; border-bottom: 3px solid black;"></div>
            <div style="width: 25px; border-bottom: 4px solid black;"></div>
          </div>
        </div>
        <!-- Canvas -->
        <div style="flex:1; border: inset 2px #808080; background:#808080; padding:5px; overflow:auto;">
          <canvas id="paint-canvas" class="paint-canvas" width="800" height="600"></canvas>
        </div>
      </div>
      <!-- Palette -->
      <div class="paint-palette-bottom">
        <div class="paint-current-color">
          <div id="current-bg-color" style="position:absolute; width:16px; height:16px; border:inset 1px gray; background:white; top:12px; left:12px;"></div>
          <div id="current-fg-color" style="position:absolute; width:16px; height:16px; border:inset 1px gray; background:black; top:4px; left:4px;"></div>
        </div>
        <div class="paint-color-grid" id="paint-palette-grid">
          <!-- Populated by JS -->
        </div>
      </div>
    </div>
  </div>
  
  <!-- Display Properties Window -->
  <div id="win-display" class="win95-window hidden" style="top: 100px; left: 150px; width: 300px; height: 350px; display: flex; flex-direction: column; z-index: 500;">
    <div class="win-titlebar">
      <span>Display Properties</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="closeWin('win-display')">X</div>
      </div>
    </div>
    <div class="win-content" style="flex:1; display:flex; flex-direction:column;">
      <div class="win-tabs">
        <div class="win-tab active">Background</div>
      </div>
      <div style="flex: 1; padding: 10px; border: inset 2px #808080; background: white; margin-bottom: 10px;">
        <p>Select a background picture:</p>
        <select id="bg-select" size="4" style="width: 100%;" onchange="previewBg(this.value)">
          <option value="./images/wallpapers/windowsxp/bliss.jpg">Windows XP Bliss (Default)</option>
          <option value="./images/desktop/desktop.jpg">Classic Desktop</option>
          <option value="./images/wallpapers/windows95/clouds.png">Clouds</option>
          <option value="./images/wallpapers/windows95/win95.png">Windows 95 Flag</option>
        </select>
        <div id="bg-preview" style="margin-top: 10px; height: 100px; border: 1px solid black; background-size: cover; background-position: center;"></div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap: 10px; padding-top:10px; border-top: 1px solid var(--win-border-light);">
        <button class="win-btn" onclick="applyBg()">Apply</button>
        <button class="win-btn" onclick="closeWin('win-display')">OK</button>
      </div>
    </div>
  </div>

  <!-- System Properties / Device Manager Window -->
  <div id="win-sysprop" class="win95-window hidden" style="top: 50px; left: 100px; width: 450px; height: 420px; display: flex; flex-direction: column;">
    <div class="win-titlebar">
      <span>System Properties</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-sysprop')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-sysprop')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-sysprop')">X</div>
      </div>
    </div>
    <div class="win-content" style="flex:1; display:flex; flex-direction:column;">
      <div class="win-tabs">
        <div class="win-tab">General</div>
        <div class="win-tab active">Device Manager</div>
        <div class="win-tab">Hardware Profiles</div>
        <div class="win-tab">Performance</div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <input type="radio" checked name="view-type"> View devices by type &nbsp;&nbsp;
        <input type="radio" name="view-type"> View devices by connection
      </div>

      <div class="tree-view">
        <div class="tree-node">
          <span class="expand">-</span><span class="tree-node-text">💻 Computer</span>
        </div>
        <div class="tree-children">
          <div class="tree-node"><span class="expand">+</span><span class="tree-node-text">💿 CDROM</span></div>
          <div class="tree-node"><span class="expand">+</span><span class="tree-node-text">💾 Disk drives</span></div>
          <div class="tree-node"><span class="expand">-</span><span class="tree-node-text">📺 Display adapters</span></div>
          <div class="tree-children">
            <div class="tree-node"><span class="tree-node-text" style="margin-left: 14px;">📼 S3 Trio64V2-DX/GX (775/785)</span></div>
          </div>
          <div class="tree-node"><span class="expand">+</span><span class="tree-node-text">💽 Floppy disk controllers</span></div>
          <div class="tree-node"><span class="expand">+</span><span class="tree-node-text">🖁 Hard disk controllers</span></div>
          <div class="tree-node"><span class="expand">+</span><span class="tree-node-text">⌨ Keyboard</span></div>
          <div class="tree-node"><span class="expand">+</span><span class="tree-node-text">☎ Modem</span></div>
          <div class="tree-node"><span class="expand">+</span><span class="tree-node-text">🖥 Monitors</span></div>
          <div class="tree-node"><span class="expand">+</span><span class="tree-node-text">🖱 Mouse</span></div>
        </div>
      </div>
      
      <div style="display:flex; justify-content:center; gap: 10px; margin-top: auto; padding-top: 10px;">
        <button class="win-btn">Properties</button>
        <button class="win-btn">Refresh</button>
        <button class="win-btn">Remove</button>
        <button class="win-btn">Print...</button>
      </div>
      <div style="display:flex; justify-content:flex-end; gap: 10px; margin-top: 10px; border-top: 1px solid var(--win-border-light); padding-top:10px;">
        <button class="win-btn" onclick="closeWin('win-sysprop')">OK</button>
        <button class="win-btn" onclick="closeWin('win-sysprop')">Cancel</button>
      </div>
    </div>
    <div class="win-resizer"></div>
  </div>

  <!-- Internet Connection Wizard Window -->
  <div id="win-icw" class="win95-window hidden" style="top: 80px; left: 150px; width: 500px; height: 350px; display: flex; flex-direction: column;">
    <div class="win-titlebar">
      <span>Internet Connection Wizard</span>
      <div class="win-controls">
        <div class="win-ctrl-btn" onclick="minWin('win-icw')">_</div>
        <div class="win-ctrl-btn" onclick="maxWin('win-icw')">□</div>
        <div class="win-ctrl-btn" onclick="closeWin('win-icw')">X</div>
      </div>
    </div>
    <div class="win-content wizard-layout" style="padding:0;">
      <div class="wizard-sidebar" style="position:relative;">
        <div style="position:absolute; top:20px; left:20px; width:80px; height:80px; background:white; border:inset 2px gray; display:flex; justify-content:center; align-items:center;">
          <div style="font-size:40px;">🌐</div>
        </div>
        <div style="position:absolute; bottom:20px; left:10px; width:100%; color:white; font-family:Arial; font-size:12px;">
          <div style="text-align:center;">•••</div>
        </div>
      </div>
      <div class="wizard-content">
        <h3 style="margin-top:0;">Setup Options</h3>
        <p>Click the option you want to use to set up a connection to the Internet, and then click Next.</p>
        
        <div class="radio-group">
          <input type="radio" name="icw-option" checked>
          <div>
            <b><u>A</u>utomatic</b>
            <p style="margin:2px 0 10px 0; font-size:12px; color:#333;">Sets up your computer to use a modem to connect to the Internet and configures your Internet settings for you.</p>
          </div>
        </div>
        
        <div class="radio-group">
          <input type="radio" name="icw-option">
          <div>
            <b><u>M</u>anual</b>
            <p style="margin:2px 0 10px 0; font-size:12px; color:#333;">Lets you configure your own Internet settings. You can use either a modem or a local area network to connect to the Internet.</p>
          </div>
        </div>
        
        <div class="radio-group">
          <input type="radio" name="icw-option">
          <div>
            <b><u>C</u>urrent</b>
            <p style="margin:2px 0 10px 0; font-size:12px; color:#333;">Uses your current Internet settings. Choose this option if you already have a connection to the Internet and do not want to change it.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="wizard-footer">
      <button class="win-btn" style="width:70px;" onclick="closeWin('win-icw')">Help</button>
      <div style="flex:1;"></div>
      <button class="win-btn" style="width:70px;" disabled>&lt; Back</button>
      <button class="win-btn" style="width:70px;" onclick="closeWin('win-icw'); openWin('win-dialup')">Next &gt;</button>
      <button class="win-btn" style="width:70px;" onclick="closeWin('win-icw')">Cancel</button>
    </div>
    <div class="win-resizer"></div>
  </div>

  <!-- Start Menu -->
  <div id="start-menu" class="start-menu-container hidden">
    <div class="start-sidebar">
      <div class="start-sidebar-text"><b>Windows</b> 95</div>
    </div>
    <div class="start-menu-items">
      <div class="start-item has-submenu">
        <div class="start-item-icon">P</div> Programs
        <div class="submenu">
          <div class="start-item has-submenu"><div class="start-item-icon">A</div> Accessories
            <div class="submenu">
              <div class="start-item"><div class="start-item-icon">G</div> Games</div>
              <div class="start-item" onclick="openWin('win-paint')"><div class="start-item-icon">P</div> Paint</div>
              <div class="start-item" onclick="openWin('win-notepad')"><div class="start-item-icon">N</div> Notepad</div>
              <div class="start-item" onclick="openWin('win-calc')"><div class="start-item-icon">C</div> Calculator</div>
            </div>
          </div>
          <div class="start-item"><div class="start-item-icon">S</div> Startup</div>
          <div class="start-item" onclick="openWin('win-dos')"><div class="start-item-icon">D</div> MS-DOS Prompt</div>
          <div class="start-item" onclick="openWin('win-ie')"><div class="start-item-icon">E</div> Windows Explorer</div>
        </div>
      </div>
      <div class="start-item has-submenu">
        <div class="start-item-icon">D</div> Documents
        <div class="submenu">
          <div class="start-item">Empty</div>
        </div>
      </div>
      <div class="start-item has-submenu">
        <div class="start-item-icon">S</div> Settings
        <div class="submenu">
          <div class="start-item"><div class="start-item-icon">C</div> Control Panel</div>
          <div class="start-item"><div class="start-item-icon">P</div> Printers</div>
          <div class="start-item"><div class="start-item-icon">T</div> Taskbar...</div>
        </div>
      </div>
      <div class="start-item">
        <div class="start-item-icon">F</div> Find...
      </div>
      <div class="start-item">
        <div class="start-item-icon">H</div> Help
      </div>
      <div class="start-item">
        <div class="start-item-icon">R</div> Run...
      </div>
      <div class="menu-separator"></div>
      <div class="start-item">
        <div class="start-item-icon">Q</div> Shut Down...
      </div>
    </div>
  </div>

  <div class="taskbar">
    <button class="start-btn" onclick="toggleStartMenu(event)"><b>Start</b></button>
    <div class="taskbar-apps" id="taskbar-apps"></div>
    <div style="flex: 1;"></div>
    <div class="system-tray">
      <span class="tray-icon">🔊</span>
      <span id="tray-clock">09:48</span>
    </div>
  </div>
</div>
`;

app.innerHTML = `
  <div id="power-overlay" class="power-btn-overlay">
    <div class="prestart-card pc80586" role="dialog" aria-modal="true" aria-label="Boot panel">
      <div class="pc80586-header">
        <div class="pc80586-brand">TAIWAN PC-AT</div>
        <div class="pc80586-model">80586 Compatible</div>
      </div>

      <div class="pc80586-body">
        <div class="pc80586-left">
          <div class="pc80586-bay">
            <div class="pc80586-bay-label">FLOPPY</div>
            <div class="pc80586-slot"></div>
            <div class="pc80586-led" title="Drive Activity"></div>
          </div>
          <div class="pc80586-bay">
            <div class="pc80586-bay-label">HDD</div>
            <div class="pc80586-slot"></div>
            <div class="pc80586-led pc80586-led-amber" title="HDD Activity"></div>
          </div>
          <div class="pc80586-7seg" aria-label="POST display">88</div>
          <div class="pc80586-caption">課程模擬：請找到正確電源開關</div>
        </div>

        <div class="pc80586-right">
          <div class="pc80586-controls">
            <div class="pc80586-row">
              <button id="btn-turbo" class="pc80586-btn" type="button">Turbo</button>
              <button id="btn-reset" class="pc80586-btn" type="button">Reset</button>
              <button id="btn-sound" class="pc80586-btn pc80586-btn-secondary" type="button">Sound: OFF</button>
              <button id="guide-btn" class="pc80586-btn pc80586-btn-secondary" type="button">說明</button>
            </div>

            <div class="pc80586-row">
              <div class="pc80586-switches">
                <button class="pc80586-switch" type="button" data-switch="sw1" aria-label="Switch 1">I/O</button>
                <button class="pc80586-switch" type="button" data-switch="sw2" aria-label="Switch 2">I/O</button>
                <button class="pc80586-switch" type="button" data-switch="sw3" aria-label="Switch 3">I/O</button>
                <button id="power-switch" class="pc80586-switch pc80586-switch-power" type="button" aria-label="Power switch">POWER</button>
              </div>
              <div class="pc80586-hint">提示：只有一個會開機</div>
            </div>
          </div>

          <div id="prestart-message" class="pc80586-message" aria-live="polite">等待操作…</div>

          <div id="prestart-guide" class="prestart-guide hidden">
            <div class="prestart-guide-title">課程操作（建議流程）</div>
            <ol class="prestart-guide-list">
              <li>先把 <b>Sound</b> 切到 ON（依課程需要），再找出正確的 <b>POWER</b> 開關。</li>
              <li>進入桌面後，從左下角 <b>Start</b> 開始操作各功能。</li>
              <li>建議示範順序：<b>Dial-Up Networking</b> → <b>Internet Explorer</b> → <b>Paint</b> → <b>Notepad</b>。</li>
              <li>要模擬離線狀態：在 Dial-Up 視窗按 <b>Disconnect</b>，再回到 IE 會看到離線提示。</li>
            </ol>
            <div class="prestart-guide-hint">完整說明請看專案根目錄的 README.md。</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  ${BIOS_SCREEN}
  ${DOS_SCREEN}
  ${WIN95_SPLASH}
  ${DESKTOP}
`;

// Global State
let audioCtx;
let soundEnabled = false;
let isConnected = true;

// Audio Helpers
function initAudio() {
  if (!soundEnabled) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function beep() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = 1000;
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  setTimeout(() => osc.stop(), 200);
}

function floppySeek() {
  if (!soundEnabled || !audioCtx) return;
  const duration = 0.1;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150 + Math.random() * 50, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + duration);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function hddSeek() {
  if (!soundEnabled || !audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.05; // 50ms of noise
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  noise.start();
}

// Modem Synthesis Helpers
function playDTMF(f1, f2, duration) {
  if (!soundEnabled || !audioCtx) return;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc1.type = 'sine'; osc2.type = 'sine';
  osc1.frequency.value = f1; osc2.frequency.value = f2;
  osc1.connect(gain); osc2.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  osc1.start(); osc2.start();
  setTimeout(() => { osc1.stop(); osc2.stop(); }, duration);
}

const dtmfFreqs = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
};

async function dialNumber(numberString) {
  if (!soundEnabled || !audioCtx) return;
  for (let char of numberString) {
    if (dtmfFreqs[char]) {
      playDTMF(dtmfFreqs[char][0], dtmfFreqs[char][1], 150);
      await sleep(200);
    }
  }
}

function playModemHandshake() {
  if (!soundEnabled || !audioCtx) return Promise.resolve();
  return new Promise((resolve) => {
    const duration = 8;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    // Simulate high-pitched squeals and static
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(4000, audioCtx.currentTime + 3);
    filter.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 6);
    filter.frequency.linearRampToValueAtTime(3000, audioCtx.currentTime + duration);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noise.start();
    setTimeout(() => resolve(), duration * 1000);
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function startBoot() {
  document.getElementById('power-overlay').classList.add('hidden');
  initAudio();
  
  const biosUi = document.getElementById('bios-ui');
  biosUi.classList.remove('hidden');
  
  // Phase 1: Memory check
  const memCount = document.getElementById('mem-count');
  let mem = 0;
  hddSeek();
  
  while (mem < 524288) { // 512MB in KB
    mem += 16384; // Increment by 16MB to keep boot time reasonable
    memCount.innerText = mem;
    hddSeek();
    await sleep(40);
  }
  
  beep();
  await sleep(500);
  
  const msgBox = document.getElementById('bios-messages');
  msgBox.innerHTML += '<div>Award Plug and Play BIOS Extension v1.0A</div>';
  await sleep(200);
  msgBox.innerHTML += '<div>Initialize Plug and Play Cards...</div>';
  await sleep(300);
  msgBox.innerHTML += '<div>PNP Init Completed</div>';
  await sleep(200);
  
  msgBox.innerHTML += '<div>Detecting IDE Primary Master ... WDC AC250MB</div>';
  for(let i=0; i<3; i++) { hddSeek(); await sleep(100); }
  await sleep(200);
  msgBox.innerHTML += '<div>Detecting IDE Primary Slave  ... None</div>';
  await sleep(200);
  
  document.getElementById('boot-prompt').innerText = "Booting from drive A...";
  await sleep(500);
  
  for(let i=0; i<5; i++) {
    floppySeek();
    await sleep(150 + Math.random() * 100);
  }
  document.getElementById('boot-prompt').innerHTML = "Booting from drive A...<br>Disk I/O error<br>Replace the disk, and then press any key";
  await sleep(1000);
  
  document.getElementById('boot-prompt').innerHTML = "Booting from drive C...";
  for(let i=0; i<3; i++) { hddSeek(); await sleep(100); }
  
  // Phase 3: DOS
  biosUi.classList.add('hidden');
  const dosUi = document.getElementById('dos-ui');
  dosUi.classList.remove('hidden');
  const dosContent = document.getElementById('dos-content');
  dosContent.innerHTML += '<div>Starting MS-DOS...</div>';
  await sleep(500);
  
  hddSeek();
  dosContent.innerHTML += '<br><div>HIMEM is testing extended memory...done.</div>';
  await sleep(400);
  
  hddSeek();
  dosContent.innerHTML += '<div>C:\\>C:\\WINDOWS\\net start</div>';
  await sleep(400);
  
  dosContent.innerHTML += '<div>C:\\>win</div>';
  hddSeek();
  await sleep(400);
  
  // Phase 4: Win95 Splash
  dosUi.classList.add('hidden');
  const splashUi = document.getElementById('splash-ui');
  splashUi.classList.remove('hidden');
  
  // Simulate loading for 5 seconds
  for(let i=0; i<50; i++) {
    if (i % 3 === 0) hddSeek(); // Don't spam the audio too much
    await sleep(100);
  }
  
  // Phase 5: Desktop
  splashUi.classList.add('hidden');
  const desktopUi = document.getElementById('desktop-ui');
  desktopUi.classList.remove('hidden');
  
  const chord = [261.63, 329.63, 392.00, 523.25];
  chord.forEach((freq, idx) => {
    setTimeout(() => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2);
      setTimeout(() => osc.stop(), 2000);
    }, idx * 150);
  });
}

document.getElementById('guide-btn').addEventListener('click', () => {
  const guide = document.getElementById('prestart-guide');
  guide.classList.toggle('hidden');
});

const prestartMessage = document.getElementById('prestart-message');
const setPrestartMessage = (text) => {
  if (prestartMessage) prestartMessage.textContent = text;
};

const soundBtn = document.getElementById('btn-sound');
soundBtn.addEventListener('click', async () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    initAudio();
    try { await audioCtx?.resume?.(); } catch {}
    soundBtn.textContent = 'Sound: ON';
    setPrestartMessage('音效已啟用。現在請找到正確的 POWER 開關。');
  } else {
    soundBtn.textContent = 'Sound: OFF';
    setPrestartMessage('音效已關閉。');
  }
});

document.getElementById('btn-reset').addEventListener('click', () => {
  setPrestartMessage('Reset pressed…（沒有反應）');
});
document.getElementById('btn-turbo').addEventListener('click', () => {
  setPrestartMessage('Turbo toggled…（看起來更快了但其實沒有）');
});

// Wrong switches: show message only
document.querySelectorAll('.pc80586-switch[data-switch]').forEach((el) => {
  el.addEventListener('click', () => {
    const sw = el.getAttribute('data-switch');
    if (sw === 'sw2') {
      setPrestartMessage('通電成功。Power good。');
      startBoot();
      return;
    }
    setPrestartMessage('喀噠…沒有反應。再試試看其他開關。');
  });
});

// Decoy POWER button (common student trap)
document.getElementById('power-switch').addEventListener('click', () => {
  setPrestartMessage('按下 POWER…但沒有通電。（這顆只是面板按鍵）');
});

// Window Management

window.previewBg = function(url) {
  document.getElementById('bg-preview').style.backgroundImage = 'url(' + url + ')';
}
window.applyBg = function() {
  const url = document.getElementById('bg-select').value;
  if(url) {
    document.getElementById('desktop-ui').style.backgroundImage = 'url(' + url + ')';
  }
}

window.toggleStartMenu = function(e) {
  e.stopPropagation();
  const startMenu = document.getElementById('start-menu');
  startMenu.classList.toggle('hidden');
}

window.closeStartMenu = function() {
  const startMenu = document.getElementById('start-menu');
  if (startMenu && !startMenu.classList.contains('hidden')) {
    startMenu.classList.add('hidden');
  }
}


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


// Calculator Logic
let calcVal = '0';
let calcPrev = null;
let calcOp = null;
window.calcInput = function(key) {
  if(['+','-','*','/'].includes(key)) {
    calcPrev = calcVal;
    calcOp = key;
    calcVal = '0';
  } else if (key === '=') {
    if (calcOp && calcPrev) {
      calcVal = String(eval(calcPrev + calcOp + calcVal));
      calcOp = null;
    }
  } else if (key === 'C') {
    calcVal = '0'; calcPrev = null; calcOp = null;
  } else if (key === 'CE') {
    calcVal = '0';
  } else if (key === 'B') {
    calcVal = calcVal.length > 1 ? calcVal.slice(0, -1) : '0';
  } else if (key === '+/-') {
    calcVal = calcVal.startsWith('-') ? calcVal.slice(1) : '-' + calcVal;
  } else {
    calcVal = calcVal === '0' ? key : calcVal + key;
  }
  document.getElementById('calc-display').innerText = calcVal;
}

// MS-DOS Logic
window.handleDos = function(e) {
  if(e.key === 'Enter') {
    const input = e.target.value.trim();
    const history = document.getElementById('dos-history');
    history.innerHTML += '<div>C:\\WINDOWS&gt;' + input + '</div>';
    
    if (input.toLowerCase() === 'exit') {
      closeWin('win-dos');
    } else if (input.toLowerCase() === 'dir') {
      history.innerHTML += '<div> Volume in drive C is MS-DOS_6<br> Directory of C:\\WINDOWS<br>SYSTEM       &lt;DIR&gt;        05-28-26  8:00a<br>WIN      COM       12,345 05-28-26  8:00a<br></div>';
    } else if (input) {
      history.innerHTML += '<div>Bad command or file name</div>';
    }
    
    e.target.value = '';
    const term = document.getElementById('dos-terminal');
    term.scrollTop = term.scrollHeight;
  }
}

// Paint Logic
let paintColor = '#000000';
setTimeout(() => {
  const canvas = document.getElementById('paint-canvas');
  if(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let isDrawing = false;
    canvas.onmousedown = (e) => {
      isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      ctx.strokeStyle = paintColor;
      ctx.lineWidth = 2;
    };
    canvas.onmousemove = (e) => {
      if(isDrawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
    };
    canvas.onmouseup = () => isDrawing = false;
    canvas.onmouseleave = () => isDrawing = false;
    
    // Generate Palette Colors
    const colors = [
      '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#4000ff', '#804000',
      '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040'
    ];
    const grid = document.getElementById('paint-palette-grid');
    colors.forEach(c => {
      const cell = document.createElement('div');
      cell.className = 'paint-color-cell';
      cell.style.backgroundColor = c;
      cell.onclick = () => {
        paintColor = c;
        document.getElementById('current-fg-color').style.backgroundColor = c;
      };
      grid.appendChild(cell);
    });
  }
}, 1000);

window.openDialUp = function() {
  openWin('win-dialup');
}

window.startDialUp = async function() {
  const status = document.getElementById('dial-status');
  const btn = document.getElementById('btn-dial');
  if (isConnected) {
    status.innerText = "Disconnected.";
    btn.innerText = "Connect";
    isConnected = false;
    return;
  }
  
  btn.disabled = true;
  status.innerText = "Dialing 4125000...";
  await dialNumber('4125000');
  await sleep(500);
  status.innerText = "Handshaking with server...";
  await playModemHandshake();
  status.innerText = "Verifying username and password...";
  await sleep(2000);
  status.innerText = "Connected at 56,000 bps.";
  isConnected = true;
  btn.innerText = "Disconnect";
  btn.disabled = false;
}

window.openIE = function() {
  openWin('win-ie');
  renderIEPage(document.getElementById('ie-address').value);
}

window.handleIENav = function(e) {
  if (e.key === 'Enter') {
    renderIEPage(e.target.value);
  }
}

function renderIEPage(url) {
  const content = document.getElementById('ie-content');
  if (!isConnected) {
    content.innerHTML = `
      <div style="padding: 20px;">
        <h2>The page cannot be displayed</h2>
        <p>The page you are looking for is currently offline. Please check your dial-up connection.</p>
        <ul>
          <li>Check your modem cable.</li>
          <li>Click Dial-Up Networking to connect.</li>
        </ul>
      </div>
    `;
    return;
  }
  
  if (url.toLowerCase().includes('yahoo.com')) {
    content.innerHTML = `
      <div style="background: url('https://www.transparenttextures.com/patterns/stardust.png') black; color: white; height: 100%; padding: 20px; font-family: 'Times New Roman', serif;">
        <h1 style="text-align:center; color: #00ffff; text-shadow: 2px 2px #000080;">Welcome to the Internet!</h1>
        <div class="marquee"><span>✨ NEW! Chat with friends online! ✨ Free Email! ✨ Under Construction 🚧</span></div>
        <div style="display:flex; justify-content:center; gap: 20px; margin-top: 30px;">
          <a href="#" class="web-btn">Yahoo! Directory</a>
          <a href="#" class="web-btn">GeoCities</a>
          <a href="#" class="web-btn">AltaVista</a>
        </div>
        <div style="text-align:center; margin-top:50px;">
          <img src="https://media.giphy.com/media/l41Ys1fQky5raqvMQ/giphy.gif" alt="Under construction" style="height:50px;">
        </div>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div style="padding: 20px;">
        <h2>Action Canceled</h2>
        <p>Internet Explorer was unable to link to the Web page you requested. The page might be temporarily unavailable.</p>
        <hr>
        <p>Please try the following:</p>
        <ul>
          <li>Click the Refresh button, or try again later.</li>
          <li>If you have typed the page address in the Address bar, make sure that it is spelled correctly.</li>
          <li>To check your connection settings, click the <b>Tools</b> menu, and then click <b>Internet Options</b>.</li>
        </ul>
        <p style="color: gray; margin-top: 20px;">Cannot find server or DNS Error<br>Internet Explorer</p>
      </div>
    `;
  }
}

setInterval(() => {
  const clock = document.getElementById('tray-clock');
  if(clock) {
    const d = new Date();
    clock.innerText = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }
}, 1000);
