import re

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add Display Properties icon to the desktop
# Find the end of desktop-icons
icon_block = """  <div class="desktop-icons">"""
new_icon = """  <div class="desktop-icons">
    <div class="desktop-icon" ondblclick="openWin('win-display')">
      <div class="icon-img" style="background: url('/images/desktop_icons/control_panel.png') no-repeat center center; background-size: contain;"></div>
      <span>Display<br>Properties</span>
    </div>"""
js = js.replace(icon_block, new_icon)

# 2. Add Display window HTML
sysprop_block = """  <!-- System Properties / Device Manager Window -->"""
display_window = """  <!-- Display Properties Window -->
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
          <option value="/images/desktop/desktop.jpg">Classic Desktop (Default)</option>
          <option value="/images/wallpapers/windows95/clouds.png">Clouds</option>
          <option value="/images/wallpapers/windows95/win95.png">Windows 95 Flag</option>
        </select>
        <div id="bg-preview" style="margin-top: 10px; height: 100px; border: 1px solid black; background-size: cover; background-position: center;"></div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap: 10px; padding-top:10px; border-top: 1px solid var(--win-border-light);">
        <button class="win-btn" onclick="applyBg()">Apply</button>
        <button class="win-btn" onclick="closeWin('win-display')">OK</button>
      </div>
    </div>
  </div>
"""

js = js.replace(sysprop_block, display_window + '\n' + sysprop_block)

# 3. Add JS functions for previewing and applying background
functions_code = """window.toggleStartMenu = function(e) {"""
bg_functions = """
window.previewBg = function(url) {
  document.getElementById('bg-preview').style.backgroundImage = 'url(' + url + ')';
}
window.applyBg = function() {
  const url = document.getElementById('bg-select').value;
  if(url) {
    document.getElementById('desktop-ui').style.backgroundImage = 'url(' + url + ')';
  }
}
"""
js = js.replace(functions_code, bg_functions + '\n' + functions_code)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Added Display Properties to change desktop background.")
