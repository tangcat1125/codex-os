import re

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Update desktop background
css = re.sub(r'\.desktop \{\n  background-color: var\(--desktop-bg\);', 
             r".desktop {\n  background: url('/codex-os/images/desktop.jpg') no-repeat center center;\n  background-size: cover;\n  background-color: var(--desktop-bg);", css)

# Update splash screen
css = re.sub(r'\.win95-splash \{\n  background-color: #008080;\n  color: white;',
             r".win95-splash {\n  background: url('/codex-os/03_windows95_clouds_wallpaper/windows95_clouds.png') no-repeat center center;\n  background-size: cover;\n  color: white;", css)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

with open('main.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I will update the desktop icons HTML in main.js to use the new icons.
new_desktop_icons_html = """  <div class="desktop-icons">
    <div class="desktop-icon" ondblclick="openExplorer()">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">My Computer</div>
    </div>
    <div class="desktop-icon">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/network_normal_two_pcs-4.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Network Neighborhood</div>
    </div>
    <div class="desktop-icon">
      <div class="icon-img" style="background: url('/codex-os/images/desktop_icons/12_recycle_bin.png') no-repeat center; background-size: contain;"></div>
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
      <div class="icon-img" style="background: url('/codex-os/images/desktop_icons/01_browsers.png') no-repeat center; background-size: contain;"></div>
      <div class="icon-text">Netscape Navigator</div>
    </div>
    <div class="desktop-icon" ondblclick="openIE()">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/msie1-0.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Internet Explorer</div>
    </div>
    <div class="win-resizer"></div>
  </div>"""

js = re.sub(r'  <div class="desktop-icons">[\s\S]*?<div class="win-resizer"></div>\n  </div>', new_desktop_icons_html, js)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated style.css and main.js with custom assets successfully.")
