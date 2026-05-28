import re

with open('main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define new desktop icons
desktop_icons_html = """  <div class="desktop-icons">
    <div class="desktop-icon" ondblclick="openExplorer()">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">My Computer</div>
    </div>
    <div class="desktop-icon">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/network_normal_two_pcs-4.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Network Neighborhood</div>
    </div>
    <div class="desktop-icon">
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-4.png') no-repeat center; background-size: cover;"></div>
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
      <div class="icon-img" style="background: url('https://win98icons.alexmeub.com/icons/png/msie1-0.png') no-repeat center; background-size: cover;"></div>
      <div class="icon-text">Internet Explorer</div>
    </div>
    <div class="desktop-icon" ondblclick="openIE()">
      <div class="icon-img" style="background: url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Netscape_icon.svg/32px-Netscape_icon.svg.png') no-repeat center; background-size: contain;"></div>
      <div class="icon-text" style="background:#008080;">Netscape Navigator</div>
    </div>
    <div class="win-resizer"></div>
  </div>"""

content = re.sub(r'  <div class="desktop-icons">[\s\S]*?<div class="win-resizer"></div>\n  </div>', desktop_icons_html, content)

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated desktop icons successfully.")
