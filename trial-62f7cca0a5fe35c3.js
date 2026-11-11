{
  const style = document.createElement('style');
  style.textContent = "/* 布局：左边是一台米黄色显示器（里面是 Win98），右边是 2026 年的手机。单一视觉世界，不跟随系统深浅色。 */\r\n:root {\r\n  --room: #121316;\r\n  --bezel: #d9d3c3;\r\n  --bezel-dark: #b9b19c;\r\n  --w-face: #c0c0c0;\r\n  --w-hi: #ffffff;\r\n  --w-lo: #808080;\r\n  --w-dk: #000000;\r\n  --w-title: #000080;\r\n  --w-title2: #1084d0;\r\n  --w-title-off: #808080;\r\n  --w-title-off2: #b5b5b5;\r\n  --desk: #008080;\r\n  --bbs-head: #2e5e86;\r\n  --bbs-row: #eef4fa;\r\n  --bbs-leaf: #2e6b30;\r\n  --ph-bg: #0e1013;\r\n  --ph-card: #181b21;\r\n  --ph-line: #262a32;\r\n  --ph-fg: #e9eaee;\r\n  --ph-sub: #8d93a0;\r\n  --ph-accent: #5aa2ff;\r\n  --ph-me: #2c6a4c;\r\n  --ph-npc: #252931;\r\n  --ph-warn: #e0a84a;\r\n  --ph-bad: #e06a5a;\r\n  --ph-good: #57c08a;\r\n  --amber: #ffb000;\r\n  --font-98: 12px/1.5 SimSun, \"宋体\", \"NSimSun\", \"Songti SC\", \"Noto Serif CJK SC\", serif;\r\n  --font-hand: KaiTi, \"楷体\", STKaiti, \"Kaiti SC\", serif;\r\n  --font-mono: \"Fixedsys\", \"Lucida Console\", Consolas, \"Courier New\", monospace;\r\n  --font-ph: -apple-system, \"PingFang SC\", \"Microsoft YaHei\", \"Noto Sans CJK SC\", system-ui, sans-serif;\r\n  color-scheme: dark;\r\n}\r\n* { box-sizing: border-box; }\r\nhtml, body { height: 100%; margin: 0; overflow: hidden; background: var(--room); color: var(--ph-fg); }\r\nbody { font-family: var(--font-ph); -webkit-tap-highlight-color: transparent; }\r\nbutton { font: inherit; color: inherit; }\r\n[hidden] { display: none !important; }\r\n:focus-visible { outline: 2px dotted #fff; outline-offset: 1px; }\r\n\r\n#app { display: flex; height: 100%; gap: 14px; padding: 14px; padding-left: max(14px, env(safe-area-inset-left, 0px)); padding-right: max(14px, env(safe-area-inset-right, 0px)); }\r\n\r\n/* ---------- 显示器 ---------- */\r\n#deskwrap { flex: 1; min-width: 0; display: flex; flex-direction: column; }\r\n#monitor { flex: 1; min-height: 0; position: relative; background: linear-gradient(#e2dccd, var(--bezel) 40%, var(--bezel-dark)); border-radius: 14px; padding: 22px 22px 40px; box-shadow: 0 20px 60px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.6), inset 0 -3px 0 rgba(0,0,0,.15); }\r\n#monitor .brand { position: absolute; left: 0; right: 0; bottom: 11px; text-align: center; font: 11px/1 var(--font-mono); letter-spacing: .3em; color: #8a826d; }\r\n#monitor .led { position: absolute; right: 30px; bottom: 15px; width: 8px; height: 8px; border-radius: 50%; background: #3b3b3b; }\r\n#monitor .led.on { background: #5cff6b; box-shadow: 0 0 6px #5cff6b; }\r\n#screen { position: relative; isolation: isolate; width: 100%; height: 100%; background: #000; overflow: hidden; border-radius: 6px; box-shadow: inset 0 0 0 2px #1d1d1d, inset 0 0 30px rgba(0,0,0,.8); font: var(--font-98); color: #000; }\r\n#screen::after { content: \"\"; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(to bottom, rgba(255,255,255,.025) 0 1px, transparent 1px 3px); z-index: 9000; border-radius: 6px; }\r\n\r\n/* 关机/开机画面 */\r\n.off { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; background: #050505; color: #6f6f6f; font: 13px/1.6 var(--font-ph); text-align: center; padding: 20px; }\r\n.power { width: 64px; height: 64px; border-radius: 50%; border: 3px solid #555; background: radial-gradient(#2a2a2a, #111); cursor: pointer; display: grid; place-items: center; color: #8f8; font-size: 26px; }\r\n.power:hover { border-color: #8f8; box-shadow: 0 0 18px rgba(120,255,120,.35); }\r\n.bios { position: absolute; inset: 0; background: #000; color: #c8c8c8; font: 14px/1.45 var(--font-mono); padding: 18px 22px; white-space: pre-wrap; overflow: auto; }\r\n.bios .hl { color: #fff; }\r\n.bios-pass { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: min(520px, 92%); background: #0000aa; color: #fff; border: 2px double #fff; padding: 16px 18px; font: 14px/1.5 var(--font-mono); box-shadow: 8px 8px 0 #000; }\r\n.bios-pass input { background: #000; color: #fff; border: 1px solid #aaa; font: inherit; padding: 2px 6px; width: 100%; margin-top: 6px; }\r\n.bios-pass .row { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }\r\n.bios-pass button { background: #aaa; color: #000; border: 0; padding: 2px 10px; font: inherit; cursor: pointer; }\r\n.bios-pass .msg { min-height: 1.5em; color: #ff5; }\r\n.bios-pass .prompt { white-space: normal; }\r\n.splash { position: absolute; inset: 0; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #fff; }\r\n.splash .logo { font: italic 700 44px/1 Georgia, \"Times New Roman\", serif; letter-spacing: -.02em; }\r\n.splash .logo b { color: #ffb43a; font-style: normal; }\r\n.splash .bar { width: 200px; height: 10px; border: 1px solid #555; overflow: hidden; }\r\n.splash .bar i { display: block; height: 100%; width: 40%; background: linear-gradient(90deg, transparent, #2a7cff, #6bf, transparent); animation: slide 1.2s linear infinite; }\r\n@keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(260%); } }\r\n.login98 { position: absolute; inset: 0; background: var(--desk); display: grid; place-items: center; }\r\n\r\n/* ---------- Win98 基础控件 ---------- */\r\n.out { background: var(--w-face); box-shadow: inset -1px -1px var(--w-dk), inset 1px 1px var(--w-hi), inset -2px -2px var(--w-lo), inset 2px 2px #dfdfdf; }\r\n.in { background: #fff; box-shadow: inset -1px -1px var(--w-hi), inset 1px 1px var(--w-lo), inset -2px -2px #dfdfdf, inset 2px 2px var(--w-dk); }\r\n.b98 { font: var(--font-98); min-width: 72px; padding: 3px 10px; background: var(--w-face); border: 0; color: #000; cursor: pointer; box-shadow: inset -1px -1px var(--w-dk), inset 1px 1px var(--w-hi), inset -2px -2px var(--w-lo), inset 2px 2px #dfdfdf; }\r\n.b98:active, .b98.down { box-shadow: inset -1px -1px var(--w-hi), inset 1px 1px var(--w-dk), inset -2px -2px #dfdfdf, inset 2px 2px var(--w-lo); }\r\n.b98:disabled { color: var(--w-lo); text-shadow: 1px 1px #fff; cursor: default; }\r\n.b98:focus-visible { outline: 1px dotted #000; outline-offset: -5px; }\r\n.f98 { font: var(--font-98); padding: 3px 4px; border: 0; background: #fff; color: #000; box-shadow: inset -1px -1px var(--w-hi), inset 1px 1px var(--w-lo), inset -2px -2px #dfdfdf, inset 2px 2px var(--w-dk); min-width: 0; }\r\n.f98:focus { outline: none; }\r\n.sep98 { height: 2px; border-top: 1px solid var(--w-lo); border-bottom: 1px solid var(--w-hi); margin: 4px 0; }\r\n\r\n/* ---------- 桌面 ---------- */\r\n#desktop { position: absolute; inset: 0 0 28px 0; background: var(--desk); overflow: hidden; }\r\n#icons { position: absolute; inset: 8px; display: flex; flex-direction: column; flex-wrap: wrap; align-content: flex-start; gap: 6px 4px; pointer-events: none; }\r\n.icon { position: relative; width: 76px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 3px 2px; cursor: default; color: #fff; text-align: center; pointer-events: auto; user-select: none; }\r\n.icon svg { width: 32px; height: 32px; flex: none; }\r\n.icon span { padding: 0 2px; line-height: 1.3; word-break: break-all; text-shadow: 1px 1px 0 rgba(0,0,0,.4); }\r\n.icon.sel span { background: var(--w-title); outline: 1px dotted #ff0; }\r\n.icon.sel svg { filter: brightness(.6) sepia(1) hue-rotate(190deg) saturate(4); }\r\n#taskbar { position: absolute; left: 0; right: 0; bottom: 0; height: 28px; display: flex; align-items: center; gap: 4px; padding: 2px; z-index: 5000; }\r\n#startbtn { min-width: 0; display: flex; align-items: center; gap: 4px; font-weight: bold; padding: 2px 6px; height: 22px; }\r\n#startbtn svg { width: 16px; height: 16px; }\r\n#tasks { flex: 1; min-width: 0; display: flex; gap: 3px; overflow: hidden; }\r\n.task { flex: 0 1 150px; min-width: 40px; height: 22px; text-align: left; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px; padding: 0 6px; }\r\n.task svg { width: 16px; height: 16px; flex: none; }\r\n.task.on { background: repeating-conic-gradient(#fff 0 25%, #c0c0c0 0 50%) 0 0/2px 2px; }\r\n#tray { height: 22px; display: flex; align-items: center; gap: 6px; padding: 0 8px; font-variant-numeric: tabular-nums; }\r\n#startmenu { position: absolute; left: 2px; bottom: 28px; width: 210px; display: flex; z-index: 6000; padding: 2px; }\r\n#startmenu .side { width: 22px; background: linear-gradient(to top, var(--w-title), var(--w-title2)); color: #c0c0c0; writing-mode: vertical-rl; transform: rotate(180deg); font: bold 15px/22px Arial, sans-serif; padding: 6px 0; letter-spacing: .05em; }\r\n#startmenu .side b { color: #fff; }\r\n#startmenu ul { list-style: none; margin: 0; padding: 0; flex: 1; }\r\n#startmenu li { display: flex; align-items: center; gap: 8px; padding: 5px 8px; cursor: default; }\r\n#startmenu li svg { width: 24px; height: 24px; }\r\n#startmenu li:hover { background: var(--w-title); color: #fff; }\r\n\r\n/* ---------- 窗口 ---------- */\r\n.win { position: absolute; display: flex; flex-direction: column; padding: 3px; min-width: 200px; min-height: 120px; max-width: 100%; max-height: 100%; }\r\n.win.max { left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; }\r\n.win.max > .grip { display: none; }\r\n.titlebar { flex: none; height: 24px; display: flex; align-items: center; gap: 4px; padding: 0 2px 0 3px; background: linear-gradient(90deg, var(--w-title-off), var(--w-title-off2)); color: #d6d6d6; font-weight: bold; user-select: none; touch-action: none; }\r\n.win.active .titlebar { background: linear-gradient(90deg, var(--w-title), var(--w-title2)); color: #fff; }\r\n.titlebar svg { width: 16px; height: 16px; flex: none; }\r\n.titlebar .t { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\r\n.b98.tbb { width: 20px; height: 18px; min-width: 20px; flex: none; padding: 0; display: grid; place-items: center; font: bold 14px/1 Arial, sans-serif; }\r\n.b98.tbb:hover { background: #d5d5d5; }\r\n.b98.tbb:focus-visible { outline-offset: -4px; }\r\n.window-symbol { width: 10px; height: 10px; position: relative; display: block; pointer-events: none; }\r\n.b98.tbb { touch-action: manipulation; }\r\n.pressed-control { filter: brightness(.85); }\r\n.window-symbol::before, .window-symbol::after { content: \"\"; position: absolute; }\r\n.window-symbol.min::before { left: 0; bottom: 0; width: 8px; border-bottom: 2px solid #000; }\r\n.window-symbol.max::before { inset: 0; border: 1px solid #000; border-top-width: 2px; }\r\n.window-symbol.restore::before { left: 3px; top: 0; width: 7px; height: 7px; border: 1px solid #000; border-top-width: 2px; }\r\n.window-symbol.restore::after { left: 0; top: 3px; width: 7px; height: 7px; background: var(--w-face); border: 1px solid #000; border-top-width: 2px; }\r\n.window-symbol.restore::before, .window-symbol.restore::after { box-sizing: border-box; }\r\n.window-symbol.close::before, .window-symbol.close::after { left: 4px; top: -1px; height: 12px; border-left: 2px solid #000; transform: rotate(45deg); }\r\n.window-symbol.close::after { transform: rotate(-45deg); }\r\n.menubar { flex: none; display: flex; gap: 0; padding: 1px 0; position: relative; }\r\n.menubar > div { padding: 1px 7px; cursor: default; position: relative; }\r\n.menubar > div:hover, .menubar > div.open { background: var(--w-title); color: #fff; }\r\n.dropdown { position: absolute; left: 0; top: 100%; min-width: 170px; z-index: 50; padding: 2px; color: #000; }\r\n.dropdown div { padding: 3px 20px; white-space: nowrap; }\r\n.dropdown div:hover { background: var(--w-title); color: #fff; }\r\n.dropdown div.chk::before { content: \"✓\"; position: absolute; left: 8px; }\r\n.dropdown div { position: relative; }\r\n.toolbar98 { flex: none; display: flex; gap: 4px; align-items: center; padding: 3px 2px; flex-wrap: wrap; }\r\n.toolbar98 .b98 { min-width: 0; padding: 2px 8px; }\r\n.addr { flex: none; display: flex; align-items: center; gap: 4px; padding: 2px; }\r\n.addr .f98 { flex: 1; }\r\n.wbody { flex: 1; min-height: 0; overflow: auto; position: relative; }\r\n.wbody.in { background: #fff; }\r\n.status98 { flex: none; display: flex; gap: 3px; padding-top: 2px; }\r\n.status98 > div { flex: 1; padding: 1px 4px; box-shadow: inset -1px -1px var(--w-hi), inset 1px 1px var(--w-lo); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\r\n.grip { position: absolute; right: 2px; bottom: 2px; width: 14px; height: 14px; cursor: nwse-resize; touch-action: none; background: linear-gradient(135deg, transparent 50%, var(--w-lo) 50% 56%, transparent 56% 66%, var(--w-lo) 66% 72%, transparent 72% 82%, var(--w-lo) 82% 88%, transparent 88%); }\r\n\r\n/* 资源管理器 */\r\n.flist { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 6px; padding: 8px; min-height: 100%; }\r\n.flist .icon { color: #000; width: 82px; }\r\n.flist .icon span { text-shadow: none; }\r\n.flist .icon.sel span { color: #fff; }\r\n.flist .icon.hid { opacity: .55; }\r\ntable.det { border-collapse: collapse; width: 100%; font: var(--font-98); }\r\ntable.det th { position: sticky; top: 0; text-align: left; font-weight: normal; padding: 2px 6px; white-space: nowrap; cursor: default; }\r\ntable.det td { padding: 1px 6px; white-space: nowrap; }\r\ntable.det tr.sel td { background: var(--w-title); color: #fff; }\r\ntable.det td.nm { display: flex; align-items: center; gap: 4px; }\r\ntable.det td.nm svg { width: 16px; height: 16px; }\r\n.empty98 { padding: 20px; color: #666; }\r\n\r\n/* 记事本 / 写字板 / 看图 */\r\n.note { margin: 0; padding: 6px 8px; font: 13px/1.6 SimSun, \"宋体\", \"NSimSun\", monospace; white-space: pre-wrap; word-break: break-all; color: #000; min-height: 100%; background: #fff; }\r\n.wordpad { background: #808080; padding: 16px; min-height: 100%; }\r\n.wordpad .page { background: #fff; color: #000; max-width: 640px; margin: 0 auto; padding: 36px 40px; font: 14px/1.9 SimSun, \"宋体\", serif; box-shadow: 2px 2px 0 #404040; }\r\n.imgview { background: #808080; min-width: 100%; width: max-content; min-height: 100%; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; }\r\n.imgview .canvas { flex: none; background: #fff; box-shadow: 2px 2px 0 #404040; cursor: zoom-in; }\r\n.imgview .canvas svg, .imgview .canvas img { display: block; width: 100%; height: auto; }\r\n.imgview .canvas > .photo { width: 100%; max-width: none; }\r\n.wbody.image-body { display: flex; flex-direction: column; overflow: hidden; background: #808080; }\r\n.image-stage { flex: 1; min-width: 0; min-height: 0; overflow: auto; scrollbar-gutter: stable; }\r\n.image-caption { flex: none; max-height: 35%; overflow: auto; margin: 0; padding: 9px 14px; border-top: 1px solid #606060; background: #e6e6e6; color: #222; font: 12px/1.75 SimSun, \"宋体\", serif; text-align: center; white-space: normal; overflow-wrap: anywhere; }\r\n\r\n/* 磁带播放器 */\r\n.deck { padding: 12px; display: flex; flex-direction: column; gap: 10px; min-height: 100%; }\r\n.cassette { position: relative; height: 120px; border-radius: 6px; background: linear-gradient(#3c3c3c, #262626); border: 2px solid #111; display: flex; align-items: center; justify-content: center; gap: 70px; }\r\n.cassette .lbl { position: absolute; top: 8px; left: 16px; right: 16px; height: 26px; background: #f3edd8; color: #222; font: 15px/26px var(--font-hand); padding: 0 8px; border-radius: 2px; overflow: hidden; white-space: nowrap; }\r\n.reel { width: 46px; height: 46px; border-radius: 50%; background: repeating-conic-gradient(#ddd 0 30deg, #888 30deg 60deg); border: 4px solid #eee; margin-top: 26px; }\r\n.playing .reel { animation: spin var(--spd, 1.5s) linear infinite; }\r\n@keyframes spin { to { transform: rotate(360deg); } }\r\n.deck .ctrl { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }\r\n.deck .ctrl input[type=range] { flex: 1; min-width: 120px; }\r\n.deck .spd { font: bold 13px var(--font-mono); min-width: 52px; }\r\n.deck .ticks { display: flex; justify-content: space-between; font-size: 11px; color: #333; padding: 0 2px; }\r\n.deck .tr { min-height: 120px; padding: 8px 10px; font: 14px/1.8 SimSun, serif; white-space: pre-wrap; color: #000; }\r\n\r\n/* 压缩包 */\r\n.zipv { padding: 10px; display: flex; flex-direction: column; gap: 8px; }\r\n.zipv .cmt { padding: 6px 8px; min-height: 40px; white-space: pre-wrap; }\r\n\r\n/* 鸽讯 */\r\n.gx { display: flex; height: 100%; min-height: 0; }\r\n.gx .left { width: 170px; flex: none; overflow: auto; background: #fff; border-right: 1px solid #808080; }\r\n.gx .grp { padding: 3px 6px; background: #dde8f4; font-weight: bold; color: #234; }\r\n.gx .ct { display: flex; align-items: center; gap: 6px; padding: 4px 6px; cursor: default; }\r\n.gx .ct:hover { background: #eef4fb; }\r\n.gx .ct.sel { background: #cfe0f5; }\r\n.gx .ct .av { width: 22px; height: 22px; border-radius: 3px; background: #6a9ad0; color: #fff; display: grid; place-items: center; font-size: 12px; flex: none; }\r\n.gx .ct.none .av { background: #aaa; }\r\n.gx .ct small { color: #777; }\r\n.gx .right { flex: 1; min-width: 0; display: flex; flex-direction: column; background: #fff; }\r\n.gx .dates { flex: none; display: flex; flex-wrap: wrap; gap: 3px; padding: 5px; border-bottom: 1px solid #ccc; background: #f4f7fb; }\r\n.gx .dates .b98 { min-width: 0; padding: 1px 6px; }\r\n.gx .log { flex: 1; overflow: auto; padding: 8px 10px; }\r\n.gx .ln { margin-bottom: 6px; }\r\n.gx .ln .h { color: #2b6a2b; }\r\n.gx .ln.me .h { color: #1b3f9a; }\r\n.gx .ln .x { padding-left: 1.5em; white-space: pre-wrap; word-break: break-all; }\r\n.gx-login { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(#e8f1fb, #c8dcf2); padding: 16px; }\r\n.gx-login .logo { font: bold 22px/1 var(--font-hand); color: #1b4f8a; }\r\n\r\n/* IE + BBS */\r\n.ie-body { background: #fff; color: #000; }\r\n.bbs { font: 12px/1.6 SimSun, \"宋体\", serif; color: #000; padding: 0 0 20px; min-width: 0; }\r\n.bbs a { color: #0645ad; text-decoration: none; cursor: pointer; touch-action: manipulation; }\r\n.i18n-notes { margin: 12px 0; padding: 8px 10px; border: 1px solid #c7c7b8; background: #faf9f3; font: 13px/1.7 sans-serif; color: #34352f; overflow-wrap: anywhere; }\r\n.i18n-notes summary { cursor: pointer; padding: 4px 0; }\r\n.i18n-notes p { margin: 6px 0; }\r\n.bbs a:focus-visible { text-decoration: underline; color: #c00; }\r\n@media (hover: hover) and (pointer: fine) {\r\n  .bbs a:hover { text-decoration: underline; color: #c00; }\r\n}\r\n.bbs .top { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 12px 6px; border-bottom: 3px solid var(--bbs-leaf); background: linear-gradient(#f4f9ef, #fff); }\r\n.bbs .logo { font: bold 28px/1 var(--font-hand); color: var(--bbs-leaf); letter-spacing: .08em; }\r\n.bbs .logo small { font: 12px SimSun, serif; color: #6a8a5a; letter-spacing: 0; margin-left: 6px; }\r\n.bbs .nav { display: flex; gap: 10px; flex-wrap: wrap; }\r\n.bbs .crumb { padding: 6px 12px; background: #f6f6f6; border-bottom: 1px solid #ddd; }\r\n.bbs .wrap { padding: 8px 12px; overflow-x: auto; }\r\n.bbs table.t { border-collapse: collapse; width: 100%; background: #9fb6cc; border-spacing: 1px; border: 1px solid #9fb6cc; }\r\n.bbs table.t th { background: var(--bbs-head); color: #fff; font-weight: normal; padding: 4px 6px; text-align: left; white-space: nowrap; }\r\n.bbs table.t th.s { cursor: pointer; text-decoration: underline; }\r\n.bbs table.t td { background: #fff; padding: 4px 6px; border: 1px solid #c9d7e5; vertical-align: top; }\r\n.bbs table.t tr:nth-child(even) td { background: var(--bbs-row); }\r\n.bbs .notice { margin: 8px 12px; padding: 8px 10px; border: 1px dashed #b8c9a8; background: #fbfdf7; }\r\n.bbs .post { display: flex; border: 1px solid #9fb6cc; margin-bottom: 6px; }\r\n.bbs .post .who { width: 130px; flex: none; background: #eef4fa; padding: 8px; border-right: 1px solid #c9d7e5; word-break: break-all; }\r\n.bbs .post .who b { color: #1b3f9a; font-size: 13px; }\r\n.bbs .post .who .tt { color: #b45f06; }\r\n.bbs .post .body { flex: 1; min-width: 0; padding: 8px 10px; display: flex; flex-direction: column; }\r\n.bbs .post .meta { color: #777; border-bottom: 1px dotted #ccc; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }\r\n.bbs .post .content { font-size: 13px; line-height: 1.8; word-break: break-word; flex: 1; }\r\n.bbs .post .sig { margin-top: 10px; padding-top: 4px; border-top: 1px dashed #ccc; color: #888; }\r\n.bbs .delbar { background: #fee; border: 1px solid #e99; color: #a00; padding: 6px 10px; margin-bottom: 6px; }\r\n.bbs h2 { font-size: 16px; margin: 4px 0 8px; }\r\n.bbs .err { padding: 40px 20px; }\r\n.bbs .err h1 { font: bold 18px Arial, SimSun, sans-serif; margin: 0 0 10px; }\r\n.bbs .admin { background: #fff8e6; }\r\n.bbs .form { display: flex; flex-direction: column; gap: 8px; max-width: 360px; margin: 20px auto; padding: 14px; border: 1px solid #9fb6cc; background: #f6f9fc; }\r\n.bbs .form .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }\r\n.bbs .form input { font: inherit; padding: 2px 4px; border: 1px solid #7a96b0; }\r\n.bbs .form .msg { color: #c00; min-height: 1.4em; }\r\n.bbs .hl { background: #ff0; }\r\n.bbs .ux { margin-top: 12px; display: flex; gap: 6px; flex-wrap: wrap; }\r\n.bbs .uxbox { margin-top: 8px; padding: 10px; border: 1px solid #ccc; background: #fafafa; }\r\n@media (max-width: 640px) { .bbs .post { flex-direction: column; } .bbs .post .who { width: auto; border-right: 0; border-bottom: 1px solid #c9d7e5; } }\r\n\r\n/* 文档里可用的样式类 */\r\n.paper { background: #fffef6 repeating-linear-gradient(transparent 0 27px, #c9d6e8 27px 28px); padding: 14px 18px; line-height: 28px; color: #1a1a1a; }\r\n.scan { background: #efe6cc; color: #2a2418; padding: 16px 18px; box-shadow: inset 0 0 40px rgba(120,90,30,.25); filter: contrast(1.02); }\r\n.hand { font-family: var(--font-hand); font-size: 1.12em; }\r\n.stamp { display: inline-block; color: #c22; border: 2px solid #c22; border-radius: 4px; padding: 0 6px; transform: rotate(-8deg); font-weight: bold; opacity: .85; }\r\n.mono { font-family: var(--font-mono); }\r\n.faded { opacity: .45; }\r\n.redact { background: #111; color: #111; padding: 0 .2em; }\r\n.torn { clip-path: polygon(0 0, 100% 0, 100% 86%, 94% 92%, 88% 87%, 80% 95%, 72% 88%, 63% 94%, 55% 86%, 46% 93%, 38% 87%, 29% 95%, 20% 88%, 11% 94%, 0 87%); }\r\n.photo { background: #fff; padding: 10px 10px 28px; box-shadow: 0 2px 8px rgba(0,0,0,.35); display: block; width: min(640px, 100%); }\r\n.photo svg, .photo img { display: block; width: 100%; height: auto; }\r\n.datestamp { font: bold 18px var(--font-mono); color: #ff8a1c; text-shadow: 0 0 4px rgba(255,120,0,.8); letter-spacing: .1em; }\r\n.red { color: #c00; }\r\n\r\n/* 对话框 */\r\n.dlg98 { position: fixed; z-index: 9450; width: min(460px, calc(100% - 20px)); left: 50%; top: 50%; transform: translate(-50%,-50%); padding: 3px; display: flex; flex-direction: column; max-height: calc(100% - 20px); }\r\n.dlg98 .wbody { padding: 12px; display: flex; flex-direction: column; gap: 10px; }\r\n.dlg98 .prompt { line-height: 1.7; }\r\n.dlg98 .prompt p { margin: 0 0 6px; }\r\n.help-dialog { width: min(740px, calc(100% - 20px)); height: min(640px, calc(100% - 24px)); }\r\n.help-tabs { display: flex; gap: 6px; padding: 10px; flex-wrap: wrap; }\r\n.help-tabs .on { background: #fff; font-weight: bold; border-bottom-color: #326bc5; }\r\n.help-content { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; margin: 0 10px 10px; padding: 4px 14px 16px; background: #fff; color: #222; border: 1px solid #aaa; line-height: 1.8; overflow-wrap: anywhere; }\r\n.help-content h3 { font-size: 15px; margin: 14px 0 6px; }\r\n.help-content p { margin: 6px 0 14px; }\r\n.inline-hints .hintbox { padding: 6px 8px; background: #ffffe1; color: #222; border: 1px solid #aaa; margin: 6px 0; line-height: 1.7; overflow-wrap: anywhere; }\r\n.hint-next { white-space: normal; }\r\n.dlg98 .row { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }\r\n.dlg98 .msg { min-height: 1.5em; color: #a00; }\r\n.dlg98 .msg.ok { color: #060; }\r\n.dlg98 .hints { display: flex; flex-direction: column; gap: 4px; }\r\n.dlg98 .hints div { padding: 4px 6px; background: #ffffe1; border: 1px solid #999; }\r\n.dlg98 .opts { display: flex; flex-direction: column; gap: 4px; }\r\n.dlg98 .opts label { display: flex; gap: 6px; align-items: flex-start; padding: 2px 0; }\r\n.dlg98 .fields { display: grid; grid-template-columns: auto 1fr; gap: 6px 8px; align-items: center; }\r\n.dlgph { background: #171a20; color: #e9eaee; border-radius: 16px; border: 1px solid #333a46; box-shadow: 0 24px 70px rgba(0,0,0,.6); padding: 0; font: 14px/1.6 var(--font-ph); width: min(440px, calc(100% - 24px)); }\r\n.dlgph .titlebar { background: none !important; color: #e9eaee; height: auto; padding: 14px 16px 0; font-size: 15px; }\r\n.dlgph .titlebar svg { display: none; }\r\n.dlgph .titlebar .b98.tbb { position: relative; width: 36px; height: 36px; min-width: 36px; min-height: 36px; padding: 0; background: transparent; border: 1px solid #3a4150; border-radius: 9px; box-shadow: none; color: #aab2bf; font-size: 0; line-height: 1; }\r\n.dlgph .titlebar .b98.tbb::before, .dlgph .titlebar .b98.tbb::after { content: ''; position: absolute; left: 50%; top: 50%; width: 14px; height: 1.5px; border-radius: 1px; background: currentColor; transform: translate(-50%, -50%) rotate(45deg); pointer-events: none; }\r\n.dlgph .titlebar .b98.tbb::after { transform: translate(-50%, -50%) rotate(-45deg); }\r\n.dlgph .titlebar .b98.tbb:hover { background: #252b35; border-color: #616d80; color: #e9eaee; }\r\n.dlgph .titlebar .b98.tbb:focus-visible { outline: 2px solid var(--ph-accent); outline-offset: 2px; }\r\n.dlgph .titlebar .b98.tbb:active { background: #303846; }\r\n.dlgph .wbody { background: none; padding: 10px 16px 16px; }\r\n.dlgph .prompt { color: #d5d8de; }\r\n.dlgph .f98 { background: #0b0d10; color: #fff; box-shadow: none; border: 1px solid #3a4150; border-radius: 10px; padding: 8px 10px; font: 15px var(--font-ph); }\r\n.dlgph .b98 { background: #232833; color: #e9eaee; box-shadow: none; border: 1px solid #3a4150; border-radius: 10px; padding: 7px 14px; font: 13px var(--font-ph); }\r\n.dlgph .b98:disabled { color: #9da5b3; text-shadow: none; }\r\n.dlgph .row .b98:last-child { background: var(--ph-accent); color: #061223; border-color: var(--ph-accent); font-weight: 600; }\r\n.dlgph .hints div { background: #2a2614; border-color: #6a5a20; color: #f2e3b0; border-radius: 8px; }\r\n.dlgph .msg { color: var(--ph-bad); }\r\n.dlgph .msg.ok { color: var(--ph-good); }\r\n.dlgph .opts label { padding: 4px 0; }\r\n.dlgph .fields label { color: #aab; }\r\n.shade { position: fixed; inset: 0; z-index: 9400; background: rgba(0,0,0,.25); }\r\n.shade.raised { z-index: 9550; }\r\n.dlg98.raised { z-index: 9560; }\r\n.shake { animation: shake .35s; }\r\n@keyframes shake { 20%, 60% { transform: translate(calc(-50% - 6px), -50%); } 40%, 80% { transform: translate(calc(-50% + 6px), -50%); } }\r\n.ctx { position: absolute; z-index: 7100; padding: 2px; min-width: 120px; }\r\n.ctx-item { display: block; width: 100%; border: 0; padding: 4px 18px; background: transparent; color: #000; text-align: left; white-space: nowrap; cursor: pointer; }\r\n.ctx-item:hover, .ctx-item:focus-visible { background: var(--w-title); color: #fff; outline: none; }\r\n\r\n/* 屏保 */\r\n#saver { position: absolute; inset: 0; background: #000; z-index: 8000; overflow: hidden; cursor: none; }\r\n#saver .mq { position: absolute; white-space: nowrap; font: 34px/1 var(--font-hand); color: #ffd84a; animation: mq 22s linear infinite alternate; }\r\n@keyframes mq { from { left: 12px; transform: translateX(0); } to { left: calc(100% - 12px); transform: translateX(-100%); } }\r\n\r\n/* ---------- 手机 ---------- */\r\n#phone { width: 370px; flex: none; display: flex; flex-direction: column; background: var(--ph-bg); border-radius: 28px; border: 8px solid #23262c; box-shadow: 0 20px 60px rgba(0,0,0,.6); overflow: hidden; position: relative; }\r\n.ph-status { flex: none; display: flex; justify-content: space-between; align-items: center; padding: 8px 18px 4px; font-size: 12px; color: var(--ph-sub); font-variant-numeric: tabular-nums; }\r\n.ph-status b { color: var(--ph-fg); font-weight: 600; }\r\n.ph-main { flex: 1; min-height: 0; display: flex; flex-direction: column; }\r\n.ph-head { flex: none; display: flex; align-items: center; gap: 10px; padding: 8px 14px 10px; border-bottom: 1px solid var(--ph-line); min-height: 50px; }\r\n.ph-head h2 { margin: 0; font-size: 17px; font-weight: 600; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n.ph-head small { display: block; font-size: 11px; color: var(--ph-sub); font-weight: 400; }\r\n.ph-back { border: 0; background: none; color: var(--ph-accent); font-size: 22px; padding: 0 6px 0 0; cursor: pointer; line-height: 1; }\r\n.ph-body { flex: 1; min-height: 0; overflow: auto; padding: 10px 12px; }\r\n.ph-tabs { flex: none; display: grid; grid-template-columns: repeat(6, 1fr); border-top: 1px solid var(--ph-line); background: #121418; padding: 4px 2px 8px; }\r\n.ph-tabs button { border: 0; background: none; color: var(--ph-sub); font-size: 11px; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px 0; cursor: pointer; position: relative; }\r\n.ph-tabs button svg { width: 22px; height: 22px; }\r\n.ph-tabs button.on { color: var(--ph-accent); }\r\n.badge { position: absolute; top: 0; right: calc(50% - 20px); min-width: 16px; height: 16px; border-radius: 8px; background: var(--ph-bad); color: #fff; font-size: 10px; line-height: 16px; padding: 0 4px; text-align: center; }\r\n.badge.dot { min-width: 8px; width: 8px; height: 8px; padding: 0; top: 3px; right: calc(50% - 14px); }\r\n.ph-list { display: flex; flex-direction: column; gap: 2px; }\r\n.ph-item { display: flex; gap: 10px; align-items: center; padding: 10px; border-radius: 12px; cursor: pointer; border: 0; background: none; text-align: left; width: 100%; }\r\n.ph-item:hover { background: var(--ph-card); }\r\n.ph-item .av { width: 42px; height: 42px; border-radius: 50%; background: #37415a; display: grid; place-items: center; font-size: 17px; flex: none; color: #fff; }\r\n.ph-item .mid { flex: 1; min-width: 0; }\r\n.ph-item .mid b { display: block; font-weight: 600; font-size: 15px; }\r\n.ph-item .mid span { display: block; color: var(--ph-sub); font-size: 13px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\r\n.ph-item .rt { color: var(--ph-sub); font-size: 11px; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }\r\n.ph-item .cnt { background: var(--ph-bad); color: #fff; border-radius: 9px; font-size: 11px; padding: 0 6px; line-height: 18px; }\r\n.chat { display: flex; flex-direction: column; gap: 6px; padding-bottom: 6px; }\r\n.bub { max-width: 82%; padding: 8px 12px; border-radius: 16px; font-size: 14px; line-height: 1.55; word-break: break-word; white-space: pre-wrap; }\r\n.bub.npc { align-self: flex-start; background: var(--ph-npc); border-bottom-left-radius: 4px; }\r\n.bub.me { align-self: flex-end; background: var(--ph-me); border-bottom-right-radius: 4px; }\r\n.bub.sys { align-self: center; background: none; color: var(--ph-sub); font-size: 12px; padding: 2px 8px; text-align: center; }\r\n.bub .pic { margin-top: 6px; background: #fff; border-radius: 8px; overflow: hidden; cursor: zoom-in; }\r\n.bub.media { width: 82%; }\r\n.bub .pic { white-space: normal; color: #1b1b1b; }\r\n.bub .pic svg { display: block; width: 100%; height: auto; }\r\n.bub.typing { color: var(--ph-sub); }\r\n.bub.typing i { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--ph-sub); margin: 0 2px; animation: blink 1s infinite; }\r\n.bub.typing i:nth-child(2) { animation-delay: .2s; } .bub.typing i:nth-child(3) { animation-delay: .4s; }\r\n@keyframes blink { 50% { opacity: .2; } }\r\n.chat-stamp { display: flex; gap: .55em; align-self: center; margin: 8px 0 5px; color: var(--ph-sub); font-size: 12px; line-height: 1.5; font-variant-numeric: tabular-nums; }\r\n.ph-choices { flex: none; display: flex; flex-direction: column; gap: 6px; padding: 8px 12px 10px; border-top: 1px solid var(--ph-line); max-height: 40%; overflow: auto; }\r\n.ph-reply-label { font-size: 12px; color: var(--ph-sub); }\r\n.chat-latest { flex: none; border: 1px solid var(--ph-line); border-radius: 12px; padding: 4px 8px; background: var(--ph-card); color: var(--ph-accent); cursor: pointer; font-size: 12px; }\r\n.ph-btn { border: 1px solid #3a4150; background: var(--ph-card); color: var(--ph-fg); border-radius: 12px; padding: 9px 12px; text-align: left; cursor: pointer; font-size: 14px; line-height: 1.45; }\r\n.ph-btn:hover { border-color: var(--ph-accent); }\r\n.ph-btn.pri { background: var(--ph-accent); border-color: var(--ph-accent); color: #061223; font-weight: 600; text-align: center; }\r\n.ph-btn.sm { padding: 6px 10px; font-size: 13px; }\r\n.ph-sec { margin: 12px 2px 6px; font-size: 12px; color: var(--ph-sub); letter-spacing: .08em; display: flex; justify-content: space-between; }\r\n.ph-note-controls, .ph-search-bar { position: sticky; top: -10px; z-index: 2; background: var(--ph-bg); padding: 0 0 10px; }\r\n.ph-note-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; padding: 4px; background: var(--ph-card); border: 1px solid var(--ph-line); border-radius: 12px; }\r\n.ph-note-tabs button { min-width: 0; border: 0; border-radius: 9px; padding: 7px 3px; background: transparent; color: var(--ph-sub); font: inherit; font-size: 12px; cursor: pointer; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2px; }\r\n.ph-note-tabs button.on { background: #303846; color: var(--ph-fg); }\r\n.ph-note-tabs button:focus-visible, .ph-search-clear:focus-visible { outline: 2px solid var(--ph-accent); outline-offset: -2px; }\r\n.ph-note-tabs small { font-size: 11px; opacity: .8; }\r\n.ph-search { display: flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 10px; background: var(--ph-card); border: 1px solid var(--ph-line); border-radius: 12px; }\r\n.ph-note-controls .ph-search { margin-top: 8px; }\r\n.ph-search:focus-within { border-color: var(--ph-accent); }\r\n.ph-search-icon { color: var(--ph-sub); font-size: 21px; line-height: 1; }\r\n.ph-search-input { flex: 1; min-width: 0; padding: 8px 0; border: 0; outline: 0; background: transparent; color: var(--ph-fg); font: inherit; font-size: 16px; }\r\n.ph-search-input::placeholder { color: var(--ph-sub); }\r\n.ph-search-input::-webkit-search-cancel-button { display: none; }\r\n.ph-search-clear { border: 0; background: transparent; color: var(--ph-sub); font-size: 22px; line-height: 1; padding: 4px; cursor: pointer; }\r\n.ph-search-clear[hidden] { display: none; }\r\n.ph-scope { width: 100%; margin-top: 8px; padding: 8px 9px; border: 1px solid var(--ph-line); border-radius: 10px; background: var(--ph-card); color: var(--ph-fg); font: inherit; font-size: 13px; }\r\n.ph-journal { border-left: 2px solid var(--ph-accent); padding: 6px 12px 10px; margin: 3px 0 14px; }\r\n.ph-journal .k, .ph-reading-hint { color: var(--ph-sub); font-size: 12px; line-height: 1.8; }\r\n.ph-journal h3 { margin: 5px 0; font-size: 15px; line-height: 1.7; font-weight: 600; }\r\n.ph-journal p { font-size: 13px; line-height: 1.8; margin: 6px 0; color: #bec5cf; }\r\n.ph-source { padding: 5px 0; border: 0; background: transparent; color: var(--ph-accent); font: inherit; font-size: 12px; cursor: pointer; }\r\n.ph-source:focus-visible { outline: 1px solid var(--ph-accent); }\r\n.ph-facts, .ph-clue-group { margin-bottom: 12px; }\r\n.ph-facts > summary, .ph-clue-group > summary { padding: 9px 2px; color: var(--ph-sub); font-size: 12px; cursor: pointer; line-height: 1.6; }\r\n.ph-facts ul { margin: 0 0 8px; padding-left: 20px; font-size: 13px; color: #bec5cf; line-height: 1.8; }\r\n.ph-facts li { margin-bottom: 6px; }\r\n.ph-reading-tile { width: 100%; margin-bottom: 8px; display: grid; grid-template-columns: 1fr auto; gap: 5px 10px; padding: 14px; border: 1px solid var(--ph-line); border-radius: 12px; background: var(--ph-card); text-align: left; color: var(--ph-fg); font: inherit; font-size: 14px; cursor: pointer; }\r\n.ph-reading-tile small, .ph-reading-tile p { color: var(--ph-sub); font-size: 12px; margin: 0; line-height: 1.7; }\r\n.ph-reading-tile p { grid-column: 1 / -1; }\r\n.ph-reading { padding: 3px 2px 18px; font-size: 15px; line-height: 1.95; overflow-wrap: anywhere; }\r\n.ph-reading p { margin: 0 0 1.15em; }\r\n.ph-reading-source { color: var(--ph-sub); font-size: 11px; line-height: 1.8; margin-bottom: 16px; }\r\n.ph-reading-original { margin-bottom: 18px; }\r\n.ph-reading-original svg { display: block; width: 100%; height: auto; }\r\n.ph-reading-original pre { font: inherit; white-space: pre-wrap; }\r\n.ph-card { background: var(--ph-card); border-radius: 14px; padding: 12px 14px; margin-bottom: 8px; font-size: 14px; line-height: 1.6; }\r\n.ph-card.q { border-left: 3px solid var(--ph-warn); cursor: pointer; }\r\n.ph-card.q:hover { background: #1f232b; }\r\n.ph-card .k { font-size: 11px; color: var(--ph-sub); }\r\n.ph-card.done { opacity: .6; }\r\n.ph-empty { color: var(--ph-sub); text-align: center; padding: 30px 10px; font-size: 13px; line-height: 1.7; }\r\n.ph-mail { background: #f6f4ef; color: #1d1d1d; border-radius: 12px; padding: 14px 16px; font-size: 14px; line-height: 1.75; }\r\n.ph-mail .mh { font-size: 12px; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 10px; }\r\n.ph-mail svg { max-width: 100%; height: auto; }\r\n.ph-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }\r\n.ph-tile { background: var(--ph-card); border-radius: 14px; padding: 12px; cursor: pointer; border: 0; text-align: left; color: var(--ph-fg); min-height: 70px; display: flex; flex-direction: column; justify-content: space-between; gap: 6px; font-size: 14px; }\r\n.ph-tile:hover { background: #20242c; }\r\n.ph-tile small { color: var(--ph-sub); font-size: 11px; }\r\n.ph-tile.new::after { content: \"新\"; align-self: flex-start; font-size: 10px; background: var(--ph-bad); color: #fff; border-radius: 6px; padding: 0 5px; }\r\n.ph-view { background: #f4f1ea; color: #1b1b1b; border-radius: 12px; padding: 14px; font-size: 14px; line-height: 1.7; }\r\n.ph-view svg { max-width: 100%; height: auto; display: block; }\r\n.table-scroll { max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; }\r\n.table-scroll > table { min-width: 480px; }\r\n.table-scroll svg[width] { max-width: none; }\r\n.table-hint { color: #666; font-size: 12px; margin: 4px 0; }\r\n.ph-row { display: flex; gap: 8px; flex-wrap: wrap; }\r\n.ph-row .ph-btn { flex: 1; text-align: center; }\r\n.ph-input { width: 100%; background: #0b0d10; border: 1px solid #3a4150; color: var(--ph-fg); border-radius: 10px; padding: 8px 10px; font: 13px/1.5 var(--font-mono); }\r\n.slot-card { display: flex; justify-content: space-between; align-items: center; gap: 8px; }\r\n.slot-card .ph-row { flex: none; }\r\n\r\n/* 推理板 */\r\n#overlay { position: fixed; inset: 0; z-index: 9500; display: none; }\r\n#overlay.on { display: block; }\r\n.board { position: absolute; inset: 0; background: rgba(8,9,11,.92); display: flex; flex-direction: column; align-items: center; overflow: auto; padding: 24px max(16px, env(safe-area-inset-left, 0px)) 24px max(16px, env(safe-area-inset-right, 0px)); }\r\n.board .sheet { width: min(860px, 100%); background: #f3eee2; color: #1f1b14; border-radius: 4px; padding: 26px 30px 22px; box-shadow: 0 30px 80px rgba(0,0,0,.6); font: 16px/2.3 SimSun, \"宋体\", serif; }\r\n.board h2 { margin: 0 0 4px; font: bold 22px/1.3 var(--font-hand); letter-spacing: .1em; }\r\n.board .intro { font: 13px/1.6 var(--font-ph); color: #6b6253; margin-bottom: 14px; }\r\n.board-unread { margin-top: 14px; border-top: 1px dashed #9d8b6c; padding-top: 10px; font: 13px/1.7 var(--font-ph); color: #504735; }\r\n.board-unread p { margin: 0 0 8px; }\r\n.board-unread .bbtn { display: block; max-width: 100%; margin: 6px 0; white-space: normal; text-align: left; }\r\n.board .txt { margin-bottom: 16px; }\r\n.slot { display: inline-block; min-width: 5.5em; padding: 0 .4em; margin: 0 .15em; line-height: 1.6; border: 0; border-bottom: 2px solid #8a7d64; background: rgba(140,120,80,.12); color: #1f1b14; font: inherit; cursor: pointer; border-radius: 3px 3px 0 0; text-align: center; vertical-align: baseline; }\r\n.slot.empty { color: #a39885; }\r\n.slot.act { background: #ffe58a; border-color: #b8860b; }\r\n.slot.drop { background: #d6ecff; }\r\n.bank { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; border-top: 1px dashed #b9ad94; position: sticky; bottom: -22px; background: #f3eee2; margin: 0 -30px -22px; padding: 12px 30px 18px; }\r\n.chip { border: 1px solid #8a7d64; background: #fffaf0; border-radius: 4px; padding: 3px 10px; font: 14px/1.5 SimSun, serif; cursor: grab; color: #1f1b14; }\r\n.chip:hover { background: #fff1c9; }\r\n.board .bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; font: 13px var(--font-ph); }\r\n.board .bar .res { flex: 1; min-width: 140px; font-weight: 600; }\r\n.board .bar .res.ok { color: #1d7a45; }\r\n.board .bar .res.bad { color: #a8452f; }\r\n.bbtn { border: 1px solid #6b6253; background: #fff; color: #1f1b14; border-radius: 6px; padding: 6px 14px; cursor: pointer; font: 13px var(--font-ph); }\r\n.bbtn.pri { background: #1f1b14; color: #f3eee2; }\r\n.board .hintbox { font: 13px/1.6 var(--font-ph); background: #fff6d6; border: 1px solid #e0c46c; border-radius: 6px; padding: 6px 10px; margin-bottom: 6px; }\r\n.board .solved { font: 14px/1.7 var(--font-ph); background: #e3f3e7; border: 1px solid #8fc9a0; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }\r\n\r\n/* 章节卡、结局、标题 */\r\n.card { position: absolute; inset: 0; background: #000; color: #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 24px max(16px, env(safe-area-inset-left, 0px)) 24px max(16px, env(safe-area-inset-right, 0px)); text-align: center; cursor: pointer; animation: fade .8s; }\r\n@keyframes fade { from { opacity: 0; } }\r\n.card .num { font: 14px/1 var(--font-mono); letter-spacing: .6em; color: var(--amber); }\r\n.card h1 { margin: 0; font: 46px/1.2 var(--font-hand); letter-spacing: .3em; color: #f2f2f2; text-wrap: balance; }\r\n.card .date { font: 13px/1 var(--font-mono); color: #888; letter-spacing: .2em; }\r\n.card .intro { max-width: 34em; font: 15px/2 SimSun, serif; color: #b9b9b9; }\r\n.card .go { font: 12px var(--font-ph); color: #666; margin-top: 10px; }\r\n.ending { position: absolute; inset: 0; background: #050505; color: #ccc; overflow: auto; padding: 50px max(16px, env(safe-area-inset-left, 0px)) 50px max(16px, env(safe-area-inset-right, 0px)); display: flex; flex-direction: column; align-items: center; animation: fade 1.6s; }\r\n.ending .in2 { width: min(640px, 100%); }\r\n.ending .num { font: 13px var(--font-mono); letter-spacing: .5em; color: var(--amber); }\r\n.ending h1 { font: 40px/1.3 var(--font-hand); letter-spacing: .2em; margin: 10px 0 28px; color: #eee; }\r\n.ending .body { font: 16px/2.1 SimSun, serif; color: #c4c4c4; }\r\n.ending .body p { margin: 0 0 1.1em; }\r\n.ending .acts { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 30px; }\r\n.title { position: fixed; inset: 0; z-index: 9600; background: radial-gradient(ellipse at 50% 40%, #1b1d22, #050506 70%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 24px max(16px, env(safe-area-inset-left, 0px)) 24px max(16px, env(safe-area-inset-right, 0px)); text-align: center; overflow: auto; }\r\n.title .clock { font: 15px/1 var(--font-mono); color: var(--amber); letter-spacing: .25em; text-shadow: 0 0 8px rgba(255,176,0,.6); }\r\n.title h1 { margin: 0; font: 84px/1 var(--font-hand); letter-spacing: .25em; color: #f1efe9; text-shadow: 0 0 30px rgba(255,255,255,.08); }\r\n.title h1 span { display: inline-block; animation: glitch 6s infinite; }\r\n@keyframes glitch { 0%, 92%, 100% { transform: none; opacity: 1; } 93% { transform: translateX(3px); opacity: .6; } 95% { transform: translateX(-2px) skewX(8deg); } 97% { opacity: .85; } }\r\n.title .sub { font: 14px/1.8 SimSun, serif; color: #8d8d8d; letter-spacing: .3em; }\r\n.title .menu { display: flex; flex-direction: column; gap: 8px; margin-top: 22px; width: min(280px, 100%); }\r\n.site-stats { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px 26px; width: min(440px, 100%); margin-top: 10px; color: #92959d; font: 12px/1.7 var(--font-ph); }\r\n.site-stats .stat-item { display: inline-flex; gap: 9px; align-items: baseline; }\r\n.site-stats strong { color: #d8c6a6; font: 15px/1.4 var(--font-mono); font-variant-numeric: tabular-nums; }\r\n.site-stats .stats-state { flex-basis: 100%; color: #727680; font-size: 11px; }\r\n.site-stats .stats-state:empty { display: none; }\r\n.stats-retry { border: 1px solid #4b5059; border-radius: 5px; background: #20242a; color: #ddd; padding: 6px 12px; min-height: 36px; font: inherit; cursor: pointer; touch-action: manipulation; }\r\n.stats-retry[hidden] { display: none; }\r\n@media (pointer: coarse) { .stats-retry { min-height: 44px; } }\r\n.tbtn { border: 1px solid #3a3d44; background: rgba(255,255,255,.03); color: #ddd; padding: 11px 16px; border-radius: 4px; cursor: pointer; font: 15px var(--font-ph); letter-spacing: .15em; }\r\n.tbtn:hover { border-color: var(--amber); color: #fff; }\r\n.tbtn:disabled { opacity: .35; cursor: default; }\r\n.title .foot { position: absolute; bottom: 14px; left: 0; right: 0; font: 11px var(--font-ph); color: #555; }\r\n@media (max-height: 600px) {\r\n  .title { justify-content: flex-start; gap: 10px; padding-top: 64px; padding-bottom: 20px; }\r\n  .title .menu { margin-top: 8px; }\r\n  .title .foot { position: static; margin-top: 14px; }\r\n}\r\n.panel { width: min(440px, 100%); background: #14161a; border: 1px solid #2c3038; border-radius: 10px; padding: 16px; text-align: left; font-size: 14px; line-height: 1.7; color: #ddd; }\r\n.panel h3 { margin: 0 0 10px; font-size: 16px; }\r\n.panel input[type=text] { width: 100%; padding: 9px 10px; border-radius: 6px; border: 1px solid #3a3d44; background: #0b0c0e; color: #fff; font-size: 15px; }\r\n.panel .row { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; flex-wrap: wrap; }\r\n.panel .muted { color: #888; font-size: 13px; }\r\n.title.panel-open { overflow: hidden; }\r\n.title-panel-layer { position: fixed; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; padding: max(16px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); background: rgba(0,0,0,.72); overscroll-behavior: contain; }\r\n.panel.title-panel { display: flex; flex-direction: column; max-height: 100%; min-height: 0; padding: 0; overflow: hidden; box-shadow: 0 16px 60px rgba(0,0,0,.5); }\r\n.title-panel-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 10px 8px 20px; border-bottom: 1px solid #2c3038; }\r\n.title-panel-head h3 { margin: 0; min-width: 0; overflow-wrap: anywhere; }\r\n.tbtn.title-panel-close { flex: none; width: 44px; height: 44px; padding: 0; font-size: 26px; line-height: 1; letter-spacing: 0; touch-action: manipulation; }\r\n.title-panel-body { min-height: 0; overflow: auto; padding: 16px 20px 20px; overscroll-behavior: contain; }\r\n.title-panel .endgrid > div > span:first-child { flex: 1; min-width: 0; overflow-wrap: anywhere; }\r\n.title-panel .endgrid .tbtn { flex: none; white-space: nowrap; padding: 6px 12px; }\r\n.endgrid { display: grid; gap: 6px; margin: 8px 0; }\r\n.endgrid div { padding: 8px 10px; border-radius: 6px; background: #1d2026; display: flex; justify-content: space-between; gap: 8px; }\r\n.endgrid div.no { color: #555; }\r\n\r\n#toast { position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%); z-index: 9800; display: flex; flex-direction: column; gap: 6px; align-items: center; pointer-events: none; width: min(420px, calc(100% - 32px)); }\r\n.tst { background: rgba(20,22,26,.95); color: #f0f0f0; border: 1px solid #3a3f4a; border-radius: 10px; padding: 9px 14px; font: 13px/1.5 var(--font-ph); box-shadow: 0 8px 24px rgba(0,0,0,.5); animation: tin .25s; text-align: center; }\r\n.tst.good { border-color: #3d8a5c; }\r\n@keyframes tin { from { transform: translateY(10px); opacity: 0; } }\r\n.viewer { position: absolute; inset: 0; background: rgba(0,0,0,.88); display: grid; place-items: center; padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)); }\r\n.viewer-panel { width: min(1100px, 100%); height: 100%; min-height: 0; display: flex; flex-direction: column; background: #181b21; border: 1px solid #3a4150; border-radius: 8px; overflow: hidden; }\r\n.viewer-toolbar { display: flex; flex: none; flex-wrap: wrap; align-items: center; gap: 6px; padding: 10px; border-bottom: 1px solid #3a4150; }\r\n.viewer-toolbar .ph-btn { padding: 6px 10px; border-radius: 6px; }\r\n.viewer-toolbar output { min-width: 4em; text-align: center; font: 13px var(--font-mono); }\r\n.viewer-close { margin-left: auto; }\r\n.viewer-scroll { flex: 1; min-height: 0; overflow: auto; padding: 16px; overscroll-behavior: contain; }\r\n.viewer-canvas { margin: 0 auto; background: #fff; color: #1b1b1b; }\r\n.viewer-canvas svg, .viewer-canvas img { display: block; width: 100%; max-width: none; height: auto; }\r\n.viewer-canvas > .photo { width: 100%; max-width: none; }\r\n.viewer-caption { flex: none; max-height: 30%; overflow: auto; padding: 10px 16px; border-top: 1px solid #3a4150; color: #d1d5dd; font: 13px/1.8 var(--font-ph); text-align: center; overflow-wrap: anywhere; }\r\n.viewer-scroll.pannable { cursor: grab; }\r\n.viewer-scroll.dragging { cursor: grabbing; user-select: none; }\r\n.viewer-toolbar button:disabled { opacity: .45; cursor: default; }\r\n\r\n.ph-close { display: none; border: 0; background: none; color: var(--ph-sub); font-size: 13px; padding: 8px; cursor: pointer; }\r\n#phoneFab { display: none; }\r\n@media (max-width: 960px) {\r\n  #app { padding: 0; gap: 0; }\r\n  #monitor { border-radius: 0; padding: 0 0 0; background: #000; box-shadow: none; }\r\n  #monitor .brand, #monitor .led { display: none; }\r\n  #screen { border-radius: 0; }\r\n  #phone { position: fixed; inset: 0; width: auto; border-radius: 0; border: 0; z-index: 9000; transform: translateX(105%); transition: transform .25s; padding-top: env(safe-area-inset-top, 0px); }\r\n  #phone.open { transform: none; }\r\n  #phoneFab { display: grid; position: fixed; right: max(12px, env(safe-area-inset-right, 0px)); bottom: 40px; z-index: 9100; width: 52px; height: 52px; border-radius: 50%; border: 0; background: #1d2128; color: #fff; place-items: center; box-shadow: 0 6px 18px rgba(0,0,0,.5); cursor: pointer; }\r\n  #phoneFab svg { width: 26px; height: 26px; }\r\n  #phoneFab .badge { top: 2px; right: 2px; }\r\n  .ph-close { display: inline-block; }\r\n  #phone.open ~ #phoneFab { display: none; }\r\n  .title h1 { font-size: 60px; }\r\n  .board .sheet { padding: 18px 16px; font-size: 15px; }\r\n  .board { --picker-height: min(43vh, 350px); }\r\n  @supports (height: 1dvh) {\r\n    .board { --picker-height: min(43dvh, 350px); }\r\n  }\r\n  .board.choosing .sheet { margin-bottom: calc(var(--picker-height) + env(safe-area-inset-bottom, 0px)); }\r\n  .board-picker {\r\n    position: fixed; z-index: 1;\r\n    left: max(8px, env(safe-area-inset-left, 0px)); right: max(8px, env(safe-area-inset-right, 0px));\r\n    bottom: max(6px, env(safe-area-inset-bottom, 0px)); max-width: 850px; max-height: var(--picker-height);\r\n    margin: 0 auto; display: flex; flex-direction: column; overflow: hidden;\r\n    border: 1px solid #8a7d64; border-radius: 8px; background: #f3eee2; box-shadow: 0 2px 14px rgba(0,0,0,.25);\r\n  }\r\n  .board-picker-head {\r\n    display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 3px 10px;\r\n    font: 14px var(--font-ph); flex: none;\r\n  }\r\n  .board-picker-head .bbtn { min-height: 36px; }\r\n  .board-picker .bank {\r\n    position: static; min-height: 0; margin: 0; padding: 8px 10px 10px; gap: 6px;\r\n    overflow-y: auto; overscroll-behavior: contain; align-content: flex-start;\r\n  }\r\n  .board-picker .chip { min-height: 38px; max-width: 100%; overflow-wrap: anywhere; cursor: pointer; }\r\n}\r\n@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }\r\n@media (pointer: coarse), (max-width: 960px) {\r\n  #desktop { bottom: 44px; }\r\n  #taskbar { height: 44px; }\r\n  #startmenu { bottom: 44px; }\r\n  #startbtn, #tray { height: 36px; }\r\n  #tasks { overflow-x: auto; }\r\n  #desktop .b98, #modal .b98 { min-height: 36px; touch-action: manipulation; }\r\n  #modal .dlgph .titlebar .b98.tbb { width: 44px; height: 44px; min-width: 44px; min-height: 44px; }\r\n  #startmenu li { min-height: 44px; }\r\n  .menubar > div { padding: 8px 10px; }\r\n  .dropdown div:not(.sep98), .ctx-item { min-height: 36px; padding-top: 8px; padding-bottom: 8px; }\r\n  .recycle-table td:last-child, .recycle-table th:last-child { position: sticky; right: 0; background: #fff; }\r\n  .recycle-table th:last-child { z-index: 2; background: var(--w-face); }\r\n  .recycle-table .b98 { min-width: 48px !important; }\r\n  .win > .titlebar { height: 44px; gap: 5px; }\r\n  .win > .titlebar .b98.tbb { width: 44px; min-width: 44px; height: 36px; }\r\n  .task { min-height: 36px; touch-action: manipulation; }\r\n  .toolbar98 .b98 { min-height: 36px; touch-action: manipulation; }\r\n  .bbs .nav { gap: 4px 10px; }\r\n  .bbs .nav a { display: inline-flex; align-items: center; min-height: 36px; padding: 0 4px; }\r\n  .bbs .t a, .bbs-latest a, .bbs-replies a { display: inline-block; padding: 4px 0; }\r\n  .gx-remember { min-height: 44px; cursor: pointer; touch-action: manipulation; }\r\n  .gx-remember input { width: 20px; height: 20px; margin: 0; flex: none; }\r\n}\r\n#phoneFab[hidden] { display: none; }\r\n\r\n/* ---------- 语言 ---------- */\r\n.title .langs { position: absolute; top: max(14px, env(safe-area-inset-top, 0px)); right: max(16px, env(safe-area-inset-right, 0px)); display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }\r\n.title .title-topbar { position: absolute; top: max(14px, env(safe-area-inset-top, 0px)); left: max(16px, env(safe-area-inset-left, 0px)); right: max(16px, env(safe-area-inset-right, 0px)); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 12px; }\r\n.title .title-topbar .langs { position: static; margin-left: auto; }\r\n.title .leaderboard-entry { min-height: 44px; padding: 9px 16px; border-color: #c69a40; color: #f1d28f; background: #2b2417; font-size: 14px; letter-spacing: .06em; white-space: nowrap; }\r\n.title .leaderboard-entry:hover, .title .leaderboard-entry:focus-visible { color: #fff1c4; background: #3a2f1b; outline: 2px solid #f1d28f; outline-offset: 3px; }\r\n@media (max-width: 380px) { .title { padding-top: 112px; } }\r\n.lbtn { border: 1px solid #3a3d44; background: rgba(255,255,255,.03); color: #9a9a9a; padding: 6px 12px; border-radius: 4px; cursor: pointer; font: 13px/1.2 var(--font-ph); }\r\n.lbtn:hover { color: #fff; }\r\n.lbtn.on { border-color: var(--amber); color: #fff; }\r\n.lbtn:lang(ja) { font-family: \"Hiragino Sans\", \"Yu Gothic UI\", Meiryo, sans-serif; }\r\n:root:lang(en) {\r\n  --font-98: 12px/1.5 Tahoma, \"MS Sans Serif\", Verdana, Arial, sans-serif;\r\n  --font-ph: -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif;\r\n  --font-hand: \"Segoe Print\", \"Comic Sans MS\", \"Bradley Hand\", cursive;\r\n}\r\n:root:lang(ja) {\r\n  --font-98: 12px/1.5 \"MS PGothic\", \"MS UI Gothic\", \"Yu Gothic UI\", \"Hiragino Kaku Gothic ProN\", \"Noto Sans CJK JP\", sans-serif;\r\n  --font-hand: \"Yu Mincho\", \"Hiragino Mincho ProN\", \"MS Mincho\", serif;\r\n  --font-ph: -apple-system, \"Hiragino Sans\", \"Yu Gothic UI\", Meiryo, \"Noto Sans CJK JP\", sans-serif;\r\n}\r\n:lang(en) .note { font-family: \"Lucida Console\", \"Courier New\", monospace; font-size: 13px; }\r\n:lang(en) .bbs, :lang(en) .bbs .post .content { font-family: Verdana, Tahoma, Arial, sans-serif; }\r\n:lang(en) .wordpad .page, :lang(en) .board .sheet, :lang(en) .chip, :lang(en) .slot, :lang(en) .card .intro, :lang(en) .ending .body, :lang(en) .deck .tr { font-family: Georgia, \"Times New Roman\", serif; }\r\n:lang(en) .card h1, :lang(en) .ending h1 { letter-spacing: .08em; font-family: Georgia, \"Times New Roman\", serif; }\r\n:lang(en) .title h1 { font-family: Georgia, \"Times New Roman\", serif; letter-spacing: .12em; font-size: 64px; }\r\n:lang(ja) .note { font-family: \"MS Gothic\", \"Osaka-Mono\", \"Noto Sans Mono CJK JP\", monospace; }\r\n:lang(ja) .bbs, :lang(ja) .bbs .post .content { font-family: \"MS PGothic\", \"Yu Gothic UI\", \"Hiragino Kaku Gothic ProN\", sans-serif; }\r\n:lang(ja) .wordpad .page, :lang(ja) .board .sheet, :lang(ja) .chip, :lang(ja) .slot, :lang(ja) .card .intro, :lang(ja) .ending .body, :lang(ja) .deck .tr { font-family: \"Yu Mincho\", \"Hiragino Mincho ProN\", \"MS Mincho\", serif; }\r\n\r\n/* 新恢复、还没打开过的文件 */\r\n.newdot { position: absolute; top: 1px; left: calc(50% + 9px); width: 9px; height: 9px; border-radius: 50%; background: #ffd84a; box-shadow: 0 0 0 1px #5a4300, 0 0 4px rgba(255,216,74,.8); pointer-events: none; }\r\n.newtag { display: inline-block; margin-left: 6px; padding: 0 4px; font-size: 10px; line-height: 14px; color: #5a4300; background: #ffd84a; border: 1px solid #b38f00; vertical-align: 1px; }\r\ntable.det tr.sel .newtag { color: #5a4300; }\r\n.bub .who { display: block; font-size: 11px; font-weight: 600; color: var(--ph-sub); margin-bottom: 2px; white-space: normal; }\r\n.rub { margin: 10px 0 4px; display: flex; flex-direction: column; gap: 8px; }\r\n.rub-tip { font-size: 12px; color: var(--ph-sub); }\r\n.rub canvas { display: block; width: 100%; height: auto; touch-action: none; cursor: crosshair; background: #f6f2e6; border: 1px solid #d6ccb2; border-radius: 4px; box-shadow: inset 0 0 18px rgba(120, 100, 60, .12); }\r\n.rub-done { background: #5a5a60; color: #f6f2e6; font-family: KaiTi, STKaiti, serif; font-size: 18px; line-height: 30px; padding: 14px 20px; border-radius: 4px; box-shadow: inset 0 0 24px rgba(0, 0, 0, .35); }\r\n.y2k-card { display: block; max-width: 34em; margin: 0 auto; padding: 6px 12px; border-left: 3px solid #5a8fd0; text-align: left; font-size: 13px; line-height: 1.6; opacity: .85; }\r\n\r\n/* Local Gexun profiles in the shared classic desktop client. */\r\n.gx-login{width:min(350px,calc(100% - 28px));margin:20px auto;color:#26334a}.gx-login>.f98{display:block;width:100%;margin:5px 0 12px}.gx-brand{display:flex;align-items:center;gap:10px;margin-bottom:22px;padding-bottom:15px;border-bottom:1px solid #bdc8d7}.gx-brand svg{width:38px;height:38px}.gx-brand b{font-size:22px}.gx-brand small{font-size:11px;color:#526581}.gx-remember{display:flex;align-items:center;gap:6px;font-size:12px}.gx-source{font-size:12px;line-height:1.6;color:#536276}.gx-login-error{min-height:20px;color:#9b2323;font-size:12px}.gx-accountbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.gx-accountbar>span{margin-right:auto;color:#536276}.gx-friend-filter{width:calc(100% - 12px);margin:6px}.gx-profile{padding:22px;line-height:1.8}.gx-log-heading{color:#777;margin:5px 0 18px}.gx .dates{max-height:120px;overflow:auto;flex-wrap:wrap}.gx .dates .b98{white-space:normal;min-width:0;text-align:left}.gx .log .x{white-space:pre-wrap;overflow-wrap:anywhere}.gx .right{min-width:0}.gx-search-results{max-height:260px;overflow:auto;background:white;padding:6px}.gx-search-result{display:block;width:100%;text-align:left;white-space:pre-wrap;background:#fff;border:0;border-bottom:1px dotted #bbb;padding:8px;cursor:pointer;color:#222}.gx-search-result:hover,.gx-search-result:focus{background:#dfebfc}.gx-search-results input[type=date]{min-width:0}.gx .ct:focus{outline:1px dotted #143fa3;outline-offset:-2px}@media(max-width:600px){.gx-login{margin:10px auto}.gx .left{width:135px;min-width:105px}.gx .ct{padding:6px 3px}.gx .ct .av{display:none}.gx .dates{max-height:105px}.gx .log{padding:8px}.gx-profile{padding:10px}}\r\n\r\n.scratch-note{display:block;width:100%;height:100%;min-height:250px;resize:none;border:0;padding:8px;font:14px/1.6 SimSun,monospace;background:white;color:#111;outline:none}.toolbar98{flex-wrap:wrap}.addr>.f98{min-width:0}.gx .left{overflow-y:auto}.gx .right{overflow:hidden;display:flex;flex-direction:column}.gx .log{flex:1;min-height:0;overflow:auto}.gx{min-height:0;height:100%}\r\n\r\n.gx-system{font-size:12px;color:#777;margin:12px 0;line-height:1.6;border-top:1px dotted #ddd;padding-top:8px}\r\n\r\n/* Native controls inside the old desktop must not inherit the phone's dark theme. */\r\n.win { color-scheme: light; }\r\n.gx-recovery-status { padding: 5px 9px; background: #fffde8; border-bottom: 1px solid #d1c999; color: #655b35; font-size: 12px; line-height: 1.5; }\r\n\r\n/* Keep the original Gexun appearance while sizing its panel to all of its controls. */\r\n.gx-login { height: auto; min-height: calc(100% - 24px); width: min(350px, calc(100% - 24px)); margin: 12px auto; align-items: stretch; gap: 8px; }\r\n.gx-login > .f98 { flex: none; min-height: 26px; width: 100%; margin: 0 0 5px; }\r\n.gx-login .gx-brand { flex: none; flex-wrap: wrap; margin-bottom: 10px; padding-bottom: 12px; }\r\n.gx-login .gx-source { margin: 5px 0; overflow-wrap: anywhere; }\r\n.gx-login .gx-login-error:empty, .gx-login .inline-hints:empty { display: none; }\r\n.gx-login > .row { display: flex; flex: none; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 8px; width: 100%; margin-top: 6px; }\r\n.gx-login > .row > span { margin-right: auto; }\r\n.gx-login > .row > span:empty { display: none; }\r\n.gx-login .hintbox { overflow-wrap: anywhere; }\r\n\r\n/* iPad native text input: retain selection/paste and avoid keyboard auto zoom. */\r\ninput, textarea, [contenteditable=\"true\"] { -webkit-user-select: text; user-select: text; }\r\n@media (any-pointer: coarse) {\r\n  input:not([readonly]):where(:not([type]), [type=text], [type=search], [type=password], [type=email], [type=url], [type=tel], [type=number]), textarea:not([readonly]) { font-size: 16px !important; min-height: 32px; touch-action: manipulation; }\r\n}\r\n\r\n.ending-replay { position: fixed; z-index: 9700; animation: none; overscroll-behavior: contain; }\r\n.tbtn.ending-replay-close { position: fixed; top: max(8px, env(safe-area-inset-top, 0px)); right: max(8px, env(safe-area-inset-right, 0px)); width: 44px; height: 44px; display: grid; place-items: center; padding: 0; font: 24px/1 var(--font-ph); letter-spacing: 0; touch-action: manipulation; }\r\n.endgrid .ending-entry { width: 100%; min-height: 44px; padding: 8px 10px; border: 1px solid #414956; border-radius: 6px; background: #1d2026; color: inherit; font: inherit; text-align: left; display: flex; justify-content: space-between; align-items: center; gap: 8px; cursor: pointer; }\r\n.endgrid .ending-entry span { overflow-wrap: anywhere; }\r\n.endgrid .ending-entry:hover, .endgrid .ending-entry:focus-visible { border-color: var(--amber); background: #2b2a24; outline: 2px solid var(--amber); outline-offset: 1px; }\r\n\r\n/* 页面外层的经典弹窗独立指定文字颜色，兼顾深色手机弹窗。 */\r\n.dlg98:not(.dlgph) { color: #141414; color-scheme: light; }\r\n.dlg98.out:not(.dlgph) > .titlebar { background: var(--w-title); color: #fff; }\r\n.dlg98:not(.dlgph) .faded, .dlg98:not(.dlgph) .selection-count { color: #444; opacity: 1; }\r\n.dlg98:not(.dlgph) .msg { color: #8b0000; }\r\n.dlg98:not(.dlgph) .msg.ok { color: #004d00; }\r\n.dlg98:not(.dlgph) .f98::placeholder { color: #595959; opacity: 1; }\r\n.dlgph .faded, .dlgph .selection-count { color: #b8bfca; opacity: 1; }\r\n\n/* Windows 98 uses the shared classic controls in style.css.\r\n   The second game's applications and evidence viewers are styled below. */\r\n.dlg98:not(.dlgph){color:#141414;font:var(--font-98)}\r\n.dlg98:not(.dlgph)>.titlebar{background:linear-gradient(90deg,var(--w-title),var(--w-title2));color:#fff}\r\n#icons .icon span{word-break:normal;overflow-wrap:anywhere}\r\n@media(pointer:coarse),(max-width:960px){\r\n  .dlg98:not(.dlgph)>.titlebar{height:44px}\r\n  .dlg98:not(.dlgph)>.titlebar .tbb{width:44px;min-width:44px;height:36px}\r\n}\r\n\r\n/* ---------- 二代：还原点、文件比较、名单、寄出 ---------- */\r\n.touch-select-dialog { margin: 0; border: 0; width: min(520px, calc(100vw - 24px)); max-height: calc(100vh - 24px); max-height: calc(100dvh - 24px); overflow: hidden; }\r\n.touch-select-dialog::backdrop { background: rgba(0, 0, 0, .5); }\r\n.touch-select-dialog .wbody { min-height: 0; overflow: hidden; }\r\n.touch-select-options { display: flex; flex-direction: column; gap: 5px; overflow-y: auto; min-height: 0; max-height: min(420px, calc(100vh - 172px)); max-height: min(420px, calc(100dvh - 172px)); overscroll-behavior: contain; touch-action: pan-y; }\r\n.touch-select-option { flex: none; min-height: 44px; padding: 10px 12px; white-space: normal; overflow-wrap: anywhere; text-align: left; line-height: 1.5; }\r\n.touch-select-option[aria-selected=\"true\"] { background: #d4dfef; }\r\n/* Title dialogs use the original game's centered modal shell. */\r\n.panel.title-panel{margin:0;width:min(440px,100%)}\r\n.title .foot{position:static;margin-top:14px;flex:none;max-width:560px;line-height:1.7}\r\n.title > .clock,.title > h1,.title > .sub,.title > .menu,.title > .site-stats{flex-shrink:0}\r\n#desktop.snapmode { background: linear-gradient(rgba(70,60,40,.28), rgba(70,60,40,.28)), var(--desk, #008080); }\r\n.snapbanner { position: absolute; top: 8px; right: 8px; z-index: 5; display: flex; gap: 8px; align-items: center; border: 1px solid #8a6d1f; background: #fff3c4; color: #3b2f05; font: 12px/1.4 Tahoma, SimSun, sans-serif; padding: 4px 10px; border-radius: 3px; cursor: pointer; box-shadow: 1px 1px 0 rgba(0,0,0,.25); }\r\n.snapbanner span { color: #7a5b00; text-decoration: underline; }\r\n#tray.snapmode { color: #7a4b00; font-weight: bold; }\r\n.wbody > .restore { padding: 12px; display: flex; flex-direction: column; gap: 10px; height: 100%; overflow: auto; }\r\n.restore-head p { margin: 4px 0 0; color: #333; }\r\n.restore-list { display: flex; flex-direction: column; background: #fff; border: 1px solid #7f9db9; }\r\n.restore-row { display: grid; grid-template-columns: 22px 92px 64px 1fr auto; gap: 8px; align-items: center; text-align: left; padding: 7px 10px; border: 0; border-bottom: 1px solid #e3e9f2; background: #fff; color: #000; cursor: pointer; font: 12px/1.5 Tahoma, SimSun, sans-serif; }\r\n.restore-row:hover { background: #eef4fd; }\r\n.restore-row.on { background: #dbe8fb; font-weight: bold; }\r\n.restore-row .rid { color: #1f5fbf; }\r\n.restore-row .rdesc { color: #333; font-weight: normal; }\r\n.cmp-pick { display: flex; gap: 6px; align-items: center; padding: 4px; flex-wrap: wrap; }\r\n.cmp-sel { flex: 1; min-width: 180px; }\r\n.cmp-task { margin: 6px; padding: 8px 10px; background: #fffbe0; border: 1px solid #d8c06a; color: #222; display: flex; flex-direction: column; gap: 6px; }\r\n.cmp-task .k { font-size: 11px; color: #8a6d1f; }\r\n.cmp-hint { background: #ffffe1; border: 1px solid #999; padding: 3px 6px; }\r\n.cmp-msg { margin: 6px; padding: 6px 10px; background: #eef7ee; border: 1px solid #8fc9a0; color: #1d4f2c; }\r\n.cmp-wrap { margin: 6px; background: #fff; border: 1px solid #7f9db9; overflow: auto; }\r\ntable.cmp { border-collapse: collapse; width: 100%; table-layout: fixed; font: 13px/1.6 \"Courier New\", SimSun, monospace; color: #000; }\r\ntable.cmp th { position: sticky; top: 0; background: var(--w-face); border-bottom: 1px solid var(--w-lo); text-align: left; padding: 3px 8px; font-weight: normal; }\r\ntable.cmp td { padding: 1px 8px; white-space: pre-wrap; word-break: break-all; vertical-align: top; border-right: 1px solid #e5e5e5; }\r\ntable.cmp tr.hunk { cursor: pointer; }\r\ntable.cmp tr.chg td { background: #fff4b8; }\r\ntable.cmp tr.del td:first-child { background: #ffd6d6; }\r\ntable.cmp tr.del td:last-child { background: #f3f3f3; }\r\ntable.cmp tr.add td:last-child { background: #d6f5dc; }\r\ntable.cmp tr.add td:first-child { background: #f3f3f3; }\r\ntable.cmp tr.sel td { outline: 2px solid #1f5fbf; outline-offset: -2px; }\r\n.ph-card.hh.ok { border-left: 3px solid var(--ph-good, #57c08a); }\r\n.hh-fact { font-size: 13px; color: var(--ph-sub, #8d93a0); margin-top: 4px; }\r\n.hh-tag { display: inline-block; margin-top: 6px; font-size: 11px; padding: 1px 8px; border-radius: 9px; background: #2a2f39; color: #c9ced8; }\r\n.hh-tag.yes { background: #1d3b2a; color: #9fe0b8; }\r\n.hh-tag.no { background: #3b2323; color: #f0b3a8; }\r\n.hh-call { max-height: 50vh; overflow: auto; display: flex; flex-direction: column; gap: 6px; }\r\n.hh-call p { margin: 0; padding: 6px 10px; border-radius: 12px; max-width: 85%; }\r\n.hh-call p.them { background: #262a31; align-self: flex-start; }\r\n.hh-call p.me { background: #2c6a4c; align-self: flex-end; }\r\n.sendout .send-modes { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; }\r\n.send-mode { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border: 1px solid #b9ad94; border-radius: 6px; cursor: pointer; background: #fffaf0; }\r\n.send-mode.on { border-color: #1f1b14; background: #fff1c9; }\r\n.send-mode span { display: flex; flex-direction: column; }\r\n.send-mode small { font: 13px/1.6 var(--font-ph); color: #5d5444; }\r\n.send-sec { font: bold 14px var(--font-ph); margin: 10px 0 6px; }\r\n.send-hh { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 6px; font: 13px var(--font-ph); }\r\n.send-hh label { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }\r\n.send-hh .hh-tag { margin-top: 0; }\r\n.chip.src { border-style: dashed; background: #eef4ff; }\r\n.slot.srcslot { background: rgba(80,120,200,.12); border-bottom-style: dashed; }\r\n.bank-sep { flex-basis: 100%; font: 12px var(--font-ph); color: #6b6253; margin-top: 4px; }\r\n.cmp-task { max-height: 34vh; overflow: auto; }\r\n/* 街区地图 */\r\n.map-head { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; padding: 6px 8px; border-bottom: 1px solid #c9c3b1; background: #f6f1e2; }\r\n.map-head span { color: #555; flex: 1 1 220px; font-size: 12px; }\r\n.map { display: flex; gap: 8px; height: 100%; min-height: 0; padding: 6px; box-sizing: border-box; }\r\n.map-svg { flex: 1; min-width: 0; overflow: auto; background: #efe9d8; border: 1px solid #a89f86; }\r\n.mapsvg { display: block; width: 100%; height: auto; min-width: 560px; font-family: SimSun, \"Songti SC\", serif; }\r\n.mapsvg .m-road { fill: #fbf8ef; stroke: #b9b09a; }\r\n.mapsvg .m-block { fill: #ddd5bf; stroke: #b9b09a; }\r\n.mapsvg .m-river { fill: #a9cbe0; }\r\n.mapsvg .m-wall { stroke: #4a4436; stroke-width: 5; fill: none; }\r\n.mapsvg .m-fence { stroke: #4a4436; stroke-width: 2; fill: none; }\r\n.mapsvg .m-bld { fill: #c7bea6; stroke: #6b6458; }\r\n.mapsvg .m-green { fill: url(#mhatch); stroke: #7fa865; }\r\n.mapsvg .m-pencil { stroke: #6f6f6f; stroke-width: 1.4; stroke-dasharray: 4 3; fill: none; }\r\n.mapsvg text { fill: #3b3528; font-size: 17px; pointer-events: none; }\r\n.mapsvg text.s { font-size: 14px; fill: #6b6458; }\r\n.mapsvg text.hand { font-family: \"KaiTi\", \"STKaiti\", cursive; fill: #5b5b5b; font-size: 16px; }\r\n.mapsvg .spot { fill: transparent; cursor: pointer; outline: none; }\r\n.mapsvg .spot:hover, .mapsvg .spot:focus { fill: rgba(31, 95, 191, .16); stroke: #1f5fbf; stroke-width: 1; }\r\n.mapsvg .spot.sel { fill: rgba(214, 64, 52, .18); stroke: #d64034; stroke-width: 2; stroke-dasharray: 5 3; }\r\n.mapsvg .spot.m-house { fill: #f4ecd6; stroke: #8d846c; }\r\n.mapsvg .spot.m-house.ok { fill: #cfe8cf; stroke: #3f8a52; }\r\n.mapsvg .spot.m-house:hover { fill: #e4ecf8; }\r\n.mapsvg .m-tag { font-size: 11px; }\r\n.mapsvg .pin { cursor: pointer; outline: none; }\r\n.mapsvg .pin circle { fill: #c0392b; stroke: #fff; stroke-width: 1.5; }\r\n.mapsvg .pin:hover circle, .mapsvg .pin:focus circle { fill: #1f5fbf; }\r\n.mapsvg .pin text { fill: #fff; font: bold 9px Tahoma, sans-serif; text-anchor: middle; }\r\n.map-side { width: 230px; flex: none; overflow: auto; background: #fff; border: 1px solid #7f9db9; padding: 8px; display: flex; flex-direction: column; gap: 6px; font-size: 12px; }\r\n.map-side .k { font-size: 11px; color: #8a6d1f; }\r\n.map-side .map-doc { text-align: left; white-space: normal; }\r\n.map-legend { margin-top: auto; border-top: 1px dashed #c9c3b1; padding-top: 6px; color: #555; }\r\n@media (max-width: 760px) { .map { flex-direction: column; height: auto; } .map-svg { flex: none; height: 56vh; } .map-side { width: auto; } }\r\n\r\n/* 录像（移植自三代） */\r\n/* 手机：选择题（选一帧/选一条日志） */\r\n.pick-task { border-left: 3px solid #e2b33c; }\r\n.pick-task .k, .clipcard .k { font-size: 11px; color: var(--ph-sub); }\r\n.pick-task .hint { margin-top: 6px; padding: 6px 8px; border-radius: 6px; background: rgba(255, 255, 255, .06); font-size: 13px; }\r\n.pick-task .row { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }\r\n.pick-msg { margin: 0 0 10px; padding: 8px 10px; border-radius: 8px; background: rgba(80, 160, 110, .18); font-size: 13px; line-height: 1.6; }\r\n\r\n/* 素材 */\r\n.clipcard { display: block; width: 100%; text-align: left; cursor: pointer; color: inherit; font: inherit; }\r\n.clipcard.new::after { content: \"新\"; position: absolute; right: 12px; top: 10px; font-size: 11px; color: #ffcf6b; }\r\n.clipcard { position: relative; }\r\n.frame { margin: 0 0 10px; padding: 8px; border-radius: 10px; background: #15181d; border: 1px solid transparent; cursor: pointer; }\r\n.frame.sel { border-color: #e2b33c; box-shadow: 0 0 0 2px rgba(226, 179, 60, .25); }\r\n.frame .tc { font: 12px/1.4 Consolas, monospace; color: #ffcf6b; margin-bottom: 4px; }\r\n.frame .shot { min-height: 64px; border-radius: 6px; padding: 10px 12px; display: flex; align-items: center; background: linear-gradient(160deg, #2b3138, #0d0f12 70%); color: #d7dbe0; font-size: 13px; line-height: 1.55; overflow: hidden; }\r\n.frame .say { margin-top: 6px; font-size: 13px; line-height: 1.6; color: #f1f1f1; }\r\n.frame .say::before { content: \"声音：\"; color: var(--ph-sub); }\r\n\r\n\r\n/* 坏道修复 */\r\n.fx { display: flex; gap: 8px; height: 100%; padding: 6px; box-sizing: border-box; }\r\n.fx-list { width: 200px; flex: none; display: flex; flex-direction: column; gap: 4px; overflow: auto; background: #fff; border: 1px solid #7f9db9; padding: 6px; }\r\n.fx-list .k { font-size: 11px; color: #8a6d1f; }\r\n.fx-file { text-align: left; border: 1px solid #c9c9c9; background: #f7f7f7; padding: 5px 6px; cursor: pointer; display: flex; flex-direction: column; gap: 2px; font: 12px/1.4 Tahoma, SimSun, sans-serif; }\r\n.fx-file.on { border-color: #1f5fbf; background: #e8f0fd; }\r\n.fx-file.ok b::after { content: '  ✓'; color: #2e8b57; }\r\n.fx-file span { color: #666; font-size: 11px; }\r\n.fx-main { flex: 1; min-width: 0; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 6px; }\r\n.fx-main > * { flex-shrink: 0; }\r\n.fx-selection { background: var(--w-face); }\r\n.fx-selection .fx-strip { max-height: 72px; overflow: auto; }\r\n.fx-dir { font: 12px Consolas, 'Courier New', monospace; color: #333; padding: 2px 6px; }\r\n.fx-strip { min-height: 30px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; padding: 6px; background: #fffbe0; border: 1px dashed #d8c06a; }\r\n.fx-chip { font: 12px Consolas, monospace; background: var(--w-title); color: #fff; padding: 2px 6px; }\r\n.fx-row { display: flex; flex-wrap: wrap; gap: 6px; }\r\n.fx-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 6px; }\r\n.fx-frag { text-align: left; background: #fff; border: 1px solid #a8a8a8; padding: 6px; cursor: pointer; font: 12px/1.55 SimSun, 'Songti SC', serif; color: #222; }\r\n@media (hover: hover) and (pointer: fine) {\r\n  .fx-frag:hover:not(:disabled) { border-color: #1f5fbf; background: #f3f7fe; }\r\n}\r\n.fx-file, .fx-frag { touch-action: manipulation; }\r\n.fx-frag.used { background: #e8f0fd; border-color: #1f5fbf; }\r\n.fx-frag * { pointer-events: none; }\r\n.fx-picked { color: #174a8a; font: bold 12px/1.5 Tahoma, SimSun, sans-serif; white-space: nowrap; }\r\n.fx-picked[hidden] { display: none; }\r\n.fx-frag:disabled { cursor: default; }\r\n.fx-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; font: 11px Consolas, monospace; color: #555; margin-bottom: 4px; }\r\n.fx-head b { color: #1f5fbf; }\r\n.fx-text { display: block; white-space: pre-wrap; }\r\n@media (max-width: 760px) { .fx { flex-direction: column; } .fx-list { width: auto; max-height: 22vh; } }\r\n@media (max-width: 960px) {\r\n  .fx-selection { position: sticky; top: 0; z-index: 1; padding: 4px 0; }\r\n  .fx-frag { scroll-margin-top: 150px; }\r\n}\r\n@media (pointer: coarse), (max-width: 960px) { .fx-file { min-height: 44px; } }\r\n\r\n/* Light photographic cover; controls keep the series home-page layout. */\r\n.title { background-size: cover; background-position: 65% center; }\r\n.title .clock { text-shadow: 0 1px 5px #000; }\r\n.title .sub { color: #b5b8bd; }\r\n.title .menu .tbtn { background: rgba(20,23,27,.9); }\r\n.title .foot { color: #a8aaad; }\r\n.title .leaderboard-entry { background: #2b2417; }\r\n\r\n.media-photo { margin: 6px 0 8px; background: #0c0e10; border: 1px solid #373d45; border-radius: 5px; overflow: hidden; }\r\n.media-photo-image svg { display: block; width: 100%; height: auto; }\r\n.photo-zoom { display: block; width: 100%; min-height: 40px; padding: 8px 12px; border: 0; border-top: 1px solid #373d45; background: #22272e; color: #dce0e5; font: 12px/1.4 var(--font-ph); cursor: zoom-in; touch-action: manipulation; }\r\n.photo-zoom:hover, .photo-zoom:focus-visible { background: #303843; color: #fff; }\r\n.photo-zoom:focus-visible { outline: 2px solid #e2b33c; outline-offset: -3px; }\r\n.evidence-photo { margin: 0 0 14px; padding: 0; }\r\n.evidence-photo svg { display: block; width: 100%; height: auto; border-radius: 4px; }\r\n.evidence-photo figcaption { text-align: center; color: var(--ph-sub); font-size: 12px; margin-top: 6px; }\r\n.ending .ending-memory-divider { width: 56px; margin: 48px auto; border: 0; border-top: 1px solid #454545; }\r\n.ending .ending-memory-sequence { position: relative; margin: 36px 0 28px; }\r\n.ending .ending-memory { width: min(100%, calc((100vh - 96px) * 1.331)); width: min(100%, calc((100svh - 96px) * 1.331)); margin: 0 auto; line-height: 0; }\r\n.ending .ending-memory svg { display: block; width: 100%; height: auto; }\r\n.ending .ending-memory-erased { opacity: var(--memory-progress, 0); }\r\n.ending .ending-memory-hint { margin-top: 14px; color: #777; font: 12px/1.5 var(--font-ph); text-align: center; letter-spacing: .2em; opacity: var(--memory-hint, 1); }\r\n.ending .body .ending-memory-last { margin: 36px 0 48px; text-align: center; letter-spacing: .18em; }\r\n.frame .shot { min-height: 0; background: #20242b; }\r\n@media (max-width: 700px) { .photo-zoom { min-height: 44px; } }\r\n\n.panel.title-panel.leaderboard-panel { width: 1360px; max-width: 100%; }\n.leaderboard-rule { margin: 0 0 8px; color: #e5e7eb; }\n.leaderboard-note { margin: 4px 0; color: #a6acb8; font-size: 13px; line-height: 1.6; }\n.leaderboard-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 14px 0; }\n.leaderboard-status { margin: 0; color: #b8bfce; font-size: 13px; }\n.leaderboard-toolbar .tbtn { flex: none; padding: 8px 14px; font-size: 14px; min-height: 44px; }\n.leaderboard-scroll { overflow-x: auto; overscroll-behavior-x: contain; }\n.leaderboard-grid { display: grid; grid-template-columns: repeat(5, minmax(230px, 1fr)); gap: 12px; min-width: 1198px; }\n.leaderboard-column { background: #1d2026; border: 1px solid #343944; border-radius: 10px; overflow: hidden; }\n.leaderboard-column h4 { margin: 0; padding: 14px 12px; font-size: 16px; color: #e3e7ef; border-bottom: 1px solid #343944; }\n.leaderboard-rows { max-height: 280px; max-height: min(280px, 45vh); max-height: min(280px, 45dvh); overflow-y: auto; overscroll-behavior-y: contain; scrollbar-gutter: stable; scrollbar-width: thin; scrollbar-color: #697487 #1d2026; }\n.leaderboard-rows:focus-visible { outline: 2px solid #8bb7ff; outline-offset: -2px; }\n.leaderboard-rows::-webkit-scrollbar { width: 8px; }\n.leaderboard-rows::-webkit-scrollbar-track { background: #1d2026; }\n.leaderboard-rows::-webkit-scrollbar-thumb { background: #697487; border: 2px solid #1d2026; border-radius: 8px; }\n.leaderboard-column table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; font-size: 12px; }\n.leaderboard-column th, .leaderboard-column td { padding: 10px 6px; text-align: center; white-space: nowrap; border-bottom: 1px solid #2b3039; }\n.leaderboard-column th { color: #aeb7c6; font-weight: 400; font-size: 12px; position: sticky; top: 0; z-index: 1; background: #1d2026; box-shadow: 0 1px #343944; }\n.leaderboard-column td { color: #e3e7ef; }\n.leaderboard-column tbody tr:nth-child(-n+3) td:first-child { color: #ebcc89; }\n.leaderboard-empty { padding: 20px 8px; text-align: center; color: #a6acb8; font-size: 13px; }\n.leaderboard-swipe { display: none; color: #a6acb8; font-size: 12px; }\n@media (max-width: 1290px) { .leaderboard-swipe { display: block; } }\n\n.leaderboard-column td { padding: 0; }\n.leaderboard-number { display: block; width: 100%; min-height: 44px; padding: 10px 6px; border: 0; border-radius: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; touch-action: manipulation; }\n.leaderboard-number:hover, .leaderboard-number:focus-visible { background: #30353e; outline: 2px solid #b49a63; outline-offset: -2px; }\n.leaderboard-review { position: fixed; z-index: 5; width: min(350px, calc(100vw - 16px)); max-height: min(340px, calc(100dvh - 16px)); overflow: auto; box-sizing: border-box; padding: 16px; border: 1px solid #7a6a4b; border-radius: 10px; background: #24252a; color: #e3e7ef; box-shadow: 0 8px 30px #0009; font-size: 14px; line-height: 1.7; user-select: text; }\n.leaderboard-review[hidden] { display: none; }\n.leaderboard-review strong { color: #ebcc89; }\n.leaderboard-review-score { color: #aeb7c6; font-size: 12px; margin: 4px 0 10px; }\n.leaderboard-review-text { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; text-align: left; }\n.finish-review { position: fixed; box-sizing: border-box; width: min(540px, calc(100vw - 32px)); max-width: none; max-height: calc(100dvh - 32px); overflow: auto; margin: auto; padding: 26px; border: 1px solid #665c47; border-radius: 12px; background: #191b20; color: #e3e7ef; box-shadow: 0 20px 70px #000a; text-align: left; font: 15px/1.7 var(--font-ph); }\n.finish-review::backdrop { background: #000b; }\n.finish-review h2 { margin: 0 0 14px; font-size: 21px; line-height: 1.5; font-weight: 500; color: #e8d8b6; }\n.finish-review-summary { color: #b6bbc5; font-size: 13px; margin: 0 0 22px; }\n.finish-review label { display: block; margin-bottom: 8px; }\n.finish-review textarea { box-sizing: border-box; display: block; width: 100%; min-height: 120px; resize: vertical; padding: 12px; border: 1px solid #434852; border-radius: 6px; background: #101216; color: #eee; font: 16px/1.7 var(--font-ph); user-select: text; }\n.finish-review textarea:focus { outline: 2px solid #b49a63; outline-offset: 2px; }\n.finish-review-count { margin: 4px 0; text-align: right; font-size: 12px; color: #a6acb8; }\n.finish-review-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }\n.finish-review-actions .tbtn { min-height: 44px; padding: 9px 14px; font-size: 14px; letter-spacing: 0; }\n.finish-review-submit { border-color: #b49a63; color: #e8d8b6; }\n@media (max-width: 480px) { .finish-review { padding: 20px; } .finish-review-actions .tbtn { width: 100%; } }\n\n.panel.title-panel.feedback-panel{width:min(960px,100%)}\n.feedback-summary{margin:0 0 8px;color:#edd49b;font-size:16px;font-variant-numeric:tabular-nums}\n.feedback-help{margin:0 0 20px;color:#aeb5c0;font-size:13px;line-height:1.7}\n.feedback-layout{display:grid;grid-template-columns:250px minmax(0,1fr);gap:24px;align-items:start}\n.feedback-form{min-width:0}\n.feedback-ratings{margin:0 0 18px;padding:0;border:0;min-width:0}\n.feedback-ratings legend,.feedback-label{display:block;padding:0;margin:0 0 10px;font-size:14px;color:#e4e6eb}\n.feedback-scores{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}\n.feedback-score{position:relative;cursor:pointer}\n.feedback-score input{position:absolute;inset:0;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}\n.feedback-score span{display:grid;place-items:center;min-height:44px;border:1px solid #444953;border-radius:5px;background:#20232a;color:#d5d9e0;font:15px/1 var(--font-ph)}\n.feedback-score input:checked+span{border-color:#d4ae5a;background:#3a3020;color:#ffe0a0}\n.feedback-score input:focus-visible+span{outline:2px solid #edce8e;outline-offset:2px}\n.feedback-form textarea{box-sizing:border-box;display:block;width:100%;min-height:126px;resize:vertical;padding:10px;border:1px solid #444953;border-radius:5px;background:#101216;color:#eee;font:16px/1.7 var(--font-ph);user-select:text}\n.feedback-form textarea:focus{outline:2px solid #b49a63;outline-offset:2px}\n.feedback-count{margin:5px 0 12px;text-align:right;color:#929aaa;font-size:12px}\n.feedback-form .tbtn,.feedback-toolbar .tbtn,.feedback-pagination .tbtn,.feedback-online{min-height:44px;padding:8px 12px;font-size:14px;letter-spacing:0}\n.feedback-publish{width:100%;color:#edd49b;border-color:#aa884a}\n.feedback-post-status,.feedback-list-status{margin:8px 0;color:#b9c0cc;font-size:13px;line-height:1.6;overflow-wrap:anywhere}\n.feedback-post-status:empty,.feedback-list-status:empty{display:none}\n.feedback-list-section{min-width:0}\n.feedback-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-bottom:10px}\n.feedback-toolbar .feedback-list-status{flex:1;margin:0}\n.feedback-pagination{position:sticky;top:-16px;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0 12px;background:#181b21}\n.feedback-page{font-size:13px;color:#aeb5c0;text-align:center;font-variant-numeric:tabular-nums}\n.feedback-entry{padding:16px 0;border-top:1px solid #353a43;user-select:text}\n.feedback-entry-head{display:flex;align-items:center;flex-wrap:wrap;gap:7px 12px;font-size:13px}\n.feedback-entry-head strong{font-weight:400;color:#ccd2dc}\n.feedback-entry-rating{color:#edd49b;font-variant-numeric:tabular-nums}\n.feedback-entry-head time{margin-left:auto;color:#87909f;font-size:12px}\n.feedback-entry-message{margin:10px 0 0;color:#e2e5eb;font-size:14px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}\n.feedback-empty{color:#929aaa;font-size:14px;line-height:1.8;padding:16px 0}\n.feedback-online{display:inline-flex;align-items:center;text-decoration:none}\n@media(max-width:700px){.feedback-layout{grid-template-columns:minmax(0,1fr);gap:20px}.feedback-entry-head time{width:100%;margin-left:0}.feedback-form textarea{min-height:110px}.feedback-summary{font-size:14px;line-height:1.8}}\n\n/* Title content is centered as one group; toolbar stays at the top. */\n.title{justify-content:flex-start;gap:0;padding:76px max(16px,env(safe-area-inset-right,0px)) 76px max(16px,env(safe-area-inset-left,0px));background-size:cover;background-position:center}\n.title .title-content{display:flex;flex-direction:column;align-items:center;gap:14px;flex:none;width:min(760px,100%);margin-block:auto}\n.title .title-content>div:empty{display:none}\n.title .title-content .foot{position:static;inset:auto;flex:none;margin-top:16px;max-width:620px;line-height:1.7;padding:0;color:#a0a0a0}\n.title .title-topbar{position:absolute;top:max(12px,env(safe-area-inset-top,0px));left:max(16px,env(safe-area-inset-left,0px));right:max(16px,env(safe-area-inset-right,0px));display:flex;align-items:flex-start;justify-content:space-between;gap:12px;z-index:1}\n.title .title-topbar .langs{position:static;inset:auto;margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}\n.title .title-topbar .langs[hidden]{display:none}\n.title .title-topbar .leaderboard-entry{position:static;inset:auto;flex:none;min-height:44px;margin:0;background:rgba(43,36,23,.9);border-color:#9e7c32;color:#edd49b}\n.title .clock{font-variant-numeric:tabular-nums;white-space:nowrap}\n.title .sub{color:#aeb0b3}\n.title h1{max-width:100%;text-align:center}\n.title .menu .tbtn{background:rgba(20,23,27,.88)}\n@media(max-width:600px){.title .title-content{gap:12px}.title .clock{font-size:13px;letter-spacing:.14em}.title .sub{font-size:12px;letter-spacing:.15em}.title .title-topbar .leaderboard-entry{font-size:13px;padding:8px 12px}.title .title-topbar .lbtn{font-size:12px;padding:6px 8px}}\n@media(max-width:600px){:lang(en) .title h1{font-size:clamp(30px,8vw,44px);line-height:1.15;letter-spacing:.08em}}\n\n/* Anonymous feedback entry beside the existing title action. */\n.title .title-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-width:0}\n.title .title-topbar .feedback-entry-button{position:static;inset:auto;flex:none;min-height:44px;margin:0;padding:9px 16px;font-size:14px;letter-spacing:.06em;white-space:nowrap;background:rgba(43,36,23,.9);border-color:#9e7c32;color:#edd49b}\n.title .feedback-entry-button:hover,.title .feedback-entry-button:focus-visible{color:#fff1c4;background:#3a2f1b;outline:2px solid #f1d28f;outline-offset:3px}\n@media(max-width:600px){.title .title-topbar .feedback-entry-button{font-size:13px;padding:8px 12px}}\n";
  document.head.append(style);
}
window.Y2K_PAID_MODE='trial';
window.Y2K_LANGS=['zh'];window.Y2K_STATS_CONFIG={"endpoint":"https://qiannianchong-stats.chenhao2003.chatgpt.site/api/stats2","allowedOrigins":["https://qiannianchong2.chenhao2003.chatgpt.site","https://qiannianchongdlzp.github.io","https://qiannianchonggametwo.github.io"],"game":"2-sixth-disk-paid","leaderboardEndpoint":"","feedbackEndpoint":"https://qiannianchong-stats.chenhao2003.chatgpt.site/api/feedback?game=2-sixth-disk","feedbackAllowedOrigins":["https://qiannianchongdlzp.github.io","https://qiannianchonggametwo.github.io","https://qiannianchong2.chenhao2003.chatgpt.site"],"feedbackOnlineUrl":"https://qiannianchongdlzp.github.io/"};
// Anonymous results are separate from story saves; only completed runs are submitted.
(() => {
  'use strict';
  const config = window.Y2K_STATS_CONFIG || {}, game = config.game;
  const endpoint = config.leaderboardEndpoint;
  const enabled = !!endpoint && location.protocol === 'https:' && (config.allowedOrigins || []).includes(location.origin);
  const prefix = `y2k${game}_leaderboard_`, endings = ['A', 'B', 'C', 'D', 'H'];
  const words = {
    zh: { rule: '每个结局列出前 20 名。用时越短，名次越靠前；用时相同，就比谁用的提示少。', privacy: '成绩会匿名上榜。在这个浏览器里，同一个结局只保留最好的一次。', clock: '通关用时会随存档累加。停在首页、切到后台或阅读结局时，计时暂停。', swipe: '左右滑动查看五个结局', ending: '结局 ', hidden: '隐藏结局', rank: '名次', time: '通关用时', hints: '提示', empty: '暂无通关记录', loading: '正在读取排行榜…', error: '暂时无法读取排行榜，请稍后重试。', offline: '排行榜仅在在线版开放。', retry: '刷新榜单' },
    en: { rule: 'Top 20 per ending · Fastest time first; fewer hints break ties', privacy: 'Anonymous results. Each browser keeps its best result per ending.', clock: 'Time follows the save. Home, background tabs and ending screens are paused.', swipe: 'Swipe to see all five endings', ending: 'Ending ', hidden: 'Hidden ending', rank: 'Rank', time: 'Clear time', hints: 'Hints', empty: 'No completed runs yet', loading: 'Loading leaderboard…', error: 'Unable to load the leaderboard. Please try again.', offline: 'Leaderboards are available in the online edition.', retry: 'Refresh' },
    ja: { rule: '各結末の上位20件 · クリア時間順、同タイムならヒント回数順', privacy: '匿名で記録。同じブラウザでは各結末の最高記録を残します。', clock: '時間はセーブごとに累計。タイトル・バックグラウンド・結末閲覧中は停止。', swipe: '横にスワイプして5つの結末を表示', ending: '結末 ', hidden: '隠しエンド', rank: '順位', time: 'クリア時間', hints: 'ヒント', empty: 'まだ記録がありません', loading: 'ランキングを読込中…', error: 'ランキングを読み込めません。時間をおいて再試行してください。', offline: 'ランキングはオンライン版で利用できます。', retry: '更新' }
  };
  Object.assign(words.zh, { reviewTitle: '故事结束了，想留下几句话吗？', reviewLabel: '你的感受或评价（选填）', reviewHelp: '最多 500 字。评价会随本次成绩公开展示，可留空。', reviewOffline: '最多 500 字。离线版评价仅保存在本机。', reviewPlaceholder: '玩到哪儿印象最深？也可以说说哪里没看懂。', reviewSubmit: '保存并继续', reviewSkip: '不留评价，继续', reviewHint: '悬停或点按名次、用时、提示次数，查看该次通关的评价。', reviewRead: '查看通关评价', reviewEmpty: '这位玩家没有留下评价。' });
  Object.assign(words.en, { reviewTitle: 'The story has ended. Would you like to leave a few words?', reviewLabel: 'Your thoughts or review (optional)', reviewHelp: 'Up to 500 characters. Your review will be public alongside this result. You may leave it blank.', reviewOffline: 'Up to 500 characters. Offline reviews are saved only on this device.', reviewPlaceholder: 'A moment that stayed with you, or something that could be improved…', reviewSubmit: 'Save and continue', reviewSkip: 'Continue without a review', reviewHint: 'Hover over or tap a rank, clear time or hint count to read the review for that run.', reviewRead: 'Read this run’s review', reviewEmpty: 'This player did not leave a review.' });
  Object.assign(words.ja, { reviewTitle: '物語を読み終えて、ひと言残しませんか？', reviewLabel: '感想・評価（任意）', reviewHelp: '500文字以内。感想は今回の記録とともに公開されます。空欄でも構いません。', reviewOffline: '500文字以内。オフライン版の感想はこの端末にのみ保存されます。', reviewPlaceholder: '心に残った場面や、改善してほしいことなど……', reviewSubmit: '保存して続ける', reviewSkip: '感想を残さず続ける', reviewHint: '順位・クリア時間・ヒント回数にカーソルを合わせるか、タップすると、その記録の感想が読めます。', reviewRead: 'この記録の感想を読む', reviewEmpty: 'このプレイヤーは感想を残していません。' });
  function get(key, fallback) { try { return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback; } catch { return fallback; } }
  function put(key, value) { try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch {} }
  function newRun() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
  }
  let playerId = get('player', null);
  if (typeof playerId !== 'string' || !/^[0-9a-f-]{36}$/i.test(playerId)) { playerId = newRun(); put('player', playerId); }
  const savedQueue = get('pending', {});
  const pending = savedQueue && typeof savedQueue === 'object' && !Array.isArray(savedQueue) ? savedQueue : {};
  let sending = false;
  async function flush() {
    if (!enabled || sending) return;
    sending = true;
    try {
      while (Object.keys(pending).length) {
        const [key, score] = Object.entries(pending)[0];
        let response;
        try { response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(score), signal: AbortSignal.timeout(10000) }); } catch { break; }
        if (response.ok || response.status === 400) { if (pending[key] === score) delete pending[key]; put('pending', pending); }
        else break;
      }
    } finally { sending = false; }
  }
  function capture(state, ending) {
    if (!endings.includes(ending)) return;
    state.finishRecords ||= {};
    // Legacy saves do not know when an already-unlocked ending was first reached.
    if (!state.finishRecords[ending] && !(state.ends || []).includes(ending)) {
      const durationMs = Math.round(state.playMs || 0);
      const hints = Object.values(state.hints || {}).reduce((n, x) => n + (Number.isSafeInteger(x) && x > 0 ? x : 0), 0);
      if (durationMs < 1000 || durationMs > 31536000000 || hints > 10000) return;
      state.runId ||= newRun();
      state.finishRecords[ending] = { durationMs, hints, review: null };
    }
    const result = state.finishRecords[ending];
    // A pre-ending/manual save may predate a submitted review. Restore only an
    // exact completion's receipt, never a different run's (or ending's) comment.
    if (result && state.runId) {
      const receipt = get(reviewKey(state, ending), null);
      if (typeof receipt === 'string') { result.review = receipt; delete result.reviewDraft; }
    }
    if (!enabled || !result || !state.runId) return;
    pending[`${state.runId}:${ending}`] = { game, ending, playerId, runId: state.runId, durationMs: result.durationMs, hints: result.hints,
      ...(typeof result.review === 'string' ? { review: result.review } : {}) };
    put('pending', pending); void flush();
  }
  function resume(state) {
    for (const ending of endings) if (state.finishRecords?.[ending]) capture(state, ending);
  }
  function time(ms) {
    const seconds = Math.floor(ms / 1000), pad = n => String(n).padStart(2, '0');
    return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}.${String(ms % 1000).padStart(3, '0')}`;
  }
  function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  function reviewKey(state, ending) {
    const result = state.finishRecords[ending];
    return `review:${state.runId}:${ending}:${result.durationMs}:${result.hints}`;
  }
  function requestReview(host, state, ending, language, save) {
    const result = state.finishRecords?.[ending];
    // Older completed saves are not prompted retroactively.
    if (!result || result.review !== null) return;
    const t = words[language] || words.zh;
    const dialog = el('dialog', 'finish-review'); dialog.setAttribute('aria-labelledby', 'finish-review-title');
    const heading = el('h2', '', t.reviewTitle); heading.id = 'finish-review-title'; heading.tabIndex = -1;
    const summary = el('p', 'finish-review-summary', `${ending === 'H' ? t.hidden : t.ending + ending} · ${t.time} ${time(result.durationMs)} · ${t.hints} ${result.hints}`);
    const label = el('label', '', t.reviewLabel); label.htmlFor = 'finish-review-input';
    const input = el('textarea'); input.id = 'finish-review-input'; input.maxLength = 500; input.rows = 5; input.placeholder = t.reviewPlaceholder;
    input.value = typeof result.reviewDraft === 'string' ? result.reviewDraft.slice(0, 500) : '';
    input.setAttribute('aria-describedby', 'finish-review-help finish-review-count');
    const help = el('p', 'leaderboard-note', enabled ? t.reviewHelp : t.reviewOffline); help.id = 'finish-review-help';
    const count = el('p', 'finish-review-count', `${input.value.length} / 500`); count.id = 'finish-review-count';
    input.oninput = () => { result.reviewDraft = input.value.slice(0, 500); count.textContent = `${input.value.length} / 500`; save(); };
    let done = false;
    const finish = text => {
      if (done) return; done = true;
      result.review = text.trim().slice(0, 500); delete result.reviewDraft;
      put(reviewKey(state, ending), result.review); save(); capture(state, ending);
      dialog.close(); dialog.remove(); host.tabIndex = -1; host.focus({ preventScroll: true });
    };
    const actions = el('div', 'finish-review-actions');
    const submit = el('button', 'tbtn finish-review-submit', t.reviewSubmit); submit.type = 'button'; submit.onclick = () => finish(input.value);
    const skip = el('button', 'tbtn finish-review-skip', t.reviewSkip); skip.type = 'button'; skip.onclick = () => finish('');
    actions.append(submit, skip); dialog.append(heading, summary, label, input, count, help, actions); host.append(dialog);
    dialog.addEventListener('cancel', e => { e.preventDefault(); finish(''); });
    dialog.addEventListener('keydown', e => e.stopPropagation());
    dialog.showModal(); heading.focus({ preventScroll: true });
  }
  function mount(body, language) {
    const t = words[language] || words.zh;
    body.closest('.title-panel').classList.add('leaderboard-panel');
    const status = el('p', 'leaderboard-status'); status.setAttribute('role', 'status');
    const refresh = el('button', 'tbtn', t.retry); refresh.type = 'button';
    const toolbar = el('div', 'leaderboard-toolbar'); toolbar.append(status, refresh);
    const scroll = el('div', 'leaderboard-scroll'); scroll.tabIndex = 0; scroll.setAttribute('aria-label', t.swipe);
    const grid = el('div', 'leaderboard-grid'); scroll.append(grid);
    body.append(el('p', 'leaderboard-rule', t.rule), el('p', 'leaderboard-note', t.privacy), el('p', 'leaderboard-note', t.clock), el('p', 'leaderboard-note', t.reviewHint), toolbar, el('p', 'leaderboard-swipe', t.swipe), scroll);
    const layer = body.closest('.title-panel-layer');
    const tip = el('div', 'leaderboard-review'); tip.id = 'leaderboard-review'; tip.setAttribute('role', 'tooltip'); tip.hidden = true;
    layer.append(tip);
    let current = null, pinned = false, hideTimer;
    function hideReview() {
      clearTimeout(hideTimer); current?.removeAttribute('aria-describedby'); current = null; pinned = false; tip.hidden = true;
    }
    function showReview(button, score, ending, rank) {
      clearTimeout(hideTimer); current?.removeAttribute('aria-describedby'); current = button;
      button.setAttribute('aria-describedby', tip.id);
      tip.replaceChildren(el('strong', '', `${ending === 'H' ? t.hidden : t.ending + ending} · ${t.rank} ${rank}`),
        el('p', 'leaderboard-review-score', `${t.time} ${time(score.durationMs)} · ${t.hints} ${score.hints}`),
        el('p', 'leaderboard-review-text', typeof score.review === 'string' && score.review.trim() ? score.review : t.reviewEmpty));
      tip.hidden = false;
      const r = button.getBoundingClientRect(), rect = tip.getBoundingClientRect();
      tip.style.left = `${Math.max(8, Math.min(innerWidth - rect.width - 8, r.x + r.width / 2 - rect.width / 2))}px`;
      tip.style.top = `${Math.max(8, r.bottom + rect.height + 12 <= innerHeight ? r.bottom + 6 : r.top - rect.height - 6)}px`;
    }
    const deferHide = () => { if (!pinned) hideTimer = setTimeout(hideReview, 180); };
    tip.onpointerenter = () => clearTimeout(hideTimer); tip.onpointerleave = deferHide;
    layer.addEventListener('pointerdown', e => { if (!e.target.closest('.leaderboard-number, .leaderboard-review')) hideReview(); });
    layer.addEventListener('keydown', e => { if (e.key === 'Escape' && current) { e.preventDefault(); e.stopImmediatePropagation(); hideReview(); } }, true);
    body.addEventListener('scroll', e => { if (!tip.contains(e.target)) hideReview(); }, true);
    function render(data) {
      hideReview();
      grid.replaceChildren();
      for (const ending of endings) {
        const column = el('section', 'leaderboard-column'); column.dataset.ending = ending;
        column.append(el('h4', '', ending === 'H' ? t.hidden : t.ending + ending));
        const viewport = el('div', 'leaderboard-rows'); viewport.tabIndex = 0;
        viewport.setAttribute('role', 'region'); viewport.setAttribute('aria-label', (ending === 'H' ? t.hidden : t.ending + ending) + ' · ' + t.rank);
        const table = el('table'); const head = el('thead'), tr = el('tr');
        [t.rank, t.time, t.hints].forEach(label => { const th = el('th', '', label); th.scope = 'col'; tr.append(th); });
        head.append(tr); const rows = el('tbody');
        (data?.[ending] || []).slice(0, 20).forEach((score, i) => {
          const row = el('tr');
          [i + 1, time(score.durationMs), score.hints].forEach((value, columnIndex) => {
            const cell = el('td'), button = el('button', 'leaderboard-number', value); button.type = 'button';
            button.setAttribute('aria-label', `${[t.rank, t.time, t.hints][columnIndex]} ${value} · ${t.reviewRead}`);
            button.onpointerenter = e => { if (e.pointerType === 'mouse' && !pinned) showReview(button, score, ending, i + 1); };
            button.onpointerleave = deferHide;
            button.onfocus = () => { if (!pinned) showReview(button, score, ending, i + 1); };
            button.onblur = hideReview;
            button.onclick = () => { if (pinned && current === button) hideReview(); else { showReview(button, score, ending, i + 1); pinned = true; } };
            cell.append(button); row.append(cell);
          });
          rows.append(row);
        });
        table.append(head, rows); viewport.append(table); column.append(viewport);
        if (!rows.children.length) viewport.append(el('p', 'leaderboard-empty', t.empty));
        grid.append(column);
      }
    }
    async function refreshBoard() {
      if (!enabled) { status.textContent = t.offline; refresh.hidden = true; render(); return; }
      refresh.disabled = true; status.textContent = t.loading;
      try {
        await flush();
        const response = await fetch(endpoint, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('unavailable');
        const data = await response.json();
        // Older services have no D column yet; keep their existing scores visible.
        if (data.endings && !Object.hasOwn(data.endings, 'D')) data.endings.D = [];
        if (data.game !== game || !endings.every(id => Array.isArray(data.endings?.[id]) && data.endings[id].every(s => Number.isSafeInteger(s.durationMs) && s.durationMs >= 1000 && Number.isSafeInteger(s.hints) && s.hints >= 0))) throw new Error('invalid response');
        if (!body.isConnected) return;
        render(data.endings); status.textContent = '';
      } catch { if (body.isConnected) status.textContent = t.error; }
      finally { refresh.disabled = false; }
    }
    render();
    refresh.onclick = () => refreshBoard().finally(() => { if (body.isConnected) refresh.focus(); });
    void refreshBoard();
  }
  window.Y2KLeaderboard = { newRun, capture, resume, mount, requestReview };
  window.addEventListener('online', flush);
  setInterval(flush, 60000);
  void flush();
})();

// Public feedback has its own anonymous ID and drafts; it never reads game saves.
(() => {
  'use strict';
  const config = window.Y2K_STATS_CONFIG || {}, endpoint = config.feedbackEndpoint;
  const enabled = !!endpoint && (config.feedbackAllowedOrigins || config.allowedOrigins || []).includes(location.origin);
  const prefix = 'y2k2_feedback_';
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch {} };
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
  let visitor = read('visitor', null);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitor || '')) { visitor = uuid(); write('visitor', visitor); }
  let draft = read('draft', {}), pending = read('pending', null);
  if (!draft || typeof draft !== 'object') draft = {};
  const words = {
    zh: { title: '评分与留言', help: '匿名发布，所有人都可以看到。评分为 1–10 分，留言选填，最多 500 字。', rating: '你的评分', message: '留言（选填）', placeholder: '聊聊你的感受，也欢迎提出建议……', publish: '匿名发布', sending: '正在发布…', sent: '已发布，谢谢你的分享。', choose: '请先选择 1–10 分。', failed: '还没收到发布成功的消息。你的留言还在，可以再试一次。', limited: '发布太频繁，请稍后再试。', retry: '重试发布', loading: '正在读取…', loadError: '留言没加载出来。点“刷新”再试一次。', refresh: '刷新', empty: '还没有评分或留言，欢迎留下第一条。', anonymous: '匿名玩家', ratingOnly: '这位玩家只留下了评分。', previous: '上一页', next: '下一页', pages: (p, n) => `第 ${p} / ${n} 页`, summary: (average, count, total) => `平均评分 ${average === null ? '—' : average.toFixed(1)} / 10 · ${count} 人评分 · ${total} 条反馈`, offline: '评分与留言仅在在线版开放。', online: '打开在线版', list: '玩家评分与留言', pageNav: '留言翻页' },
    en: { title: 'Ratings & messages', help: 'Post anonymously for everyone to read. Rate from 1 to 10; an optional message can contain up to 500 characters.', rating: 'Your rating', message: 'Message (optional)', placeholder: 'Share your thoughts or suggestions…', publish: 'Post anonymously', sending: 'Posting…', sent: 'Posted. Thank you for sharing.', choose: 'Choose a rating from 1 to 10 first.', failed: 'Posting was not confirmed. Your text is saved; try again.', limited: 'You are posting too quickly. Please try again shortly.', retry: 'Retry posting', loading: 'Loading…', loadError: 'Unable to load feedback. Select Refresh to try again.', refresh: 'Refresh', empty: 'No ratings or messages yet. Be the first to share.', anonymous: 'Anonymous player', ratingOnly: 'This player left a rating only.', previous: 'Previous', next: 'Next', pages: (p, n) => `Page ${p} of ${n}`, summary: (average, count, total) => `Average ${average === null ? '—' : average.toFixed(1)} / 10 · ${count} rated · ${total} posts`, offline: 'Ratings and messages are available in the online edition.', online: 'Open online edition', list: 'Player ratings and messages', pageNav: 'Message pages' },
    ja: { title: '評価とメッセージ', help: '匿名で投稿し、誰でも閲覧できます。評価は1〜10点、メッセージは任意で500文字までです。', rating: 'あなたの評価', message: 'メッセージ（任意）', placeholder: '感想や改善してほしいことなど……', publish: '匿名で投稿', sending: '投稿中…', sent: '投稿しました。ありがとうございます。', choose: '先に1〜10点の評価を選んでください。', failed: '投稿を確認できませんでした。内容を残して再試行してください。', limited: '投稿の間隔を空けて、もう一度お試しください。', retry: '投稿を再試行', loading: '読込中…', loadError: '読み込めませんでした。「更新」で再試行してください。', refresh: '更新', empty: 'まだ評価やメッセージはありません。最初の感想をどうぞ。', anonymous: '匿名プレイヤー', ratingOnly: '評価のみの投稿です。', previous: '前のページ', next: '次のページ', pages: (p, n) => `${p} / ${n} ページ`, summary: (average, count, total) => `平均 ${average === null ? '—' : average.toFixed(1)} / 10 · ${count}人が評価 · ${total}件`, offline: '評価とメッセージはオンライン版で利用できます。', online: 'オンライン版を開く', list: 'プレイヤーの評価とメッセージ', pageNav: 'ページ切り替え' },
  };
  function el(tag, cls, text) { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
  async function request(url, options = {}) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { ...options, credentials: 'omit', cache: 'no-store', signal: controller.signal });
      const data = await response.json();
      if (!response.ok) { const error = new Error(data.error || 'request_failed'); error.status = response.status; throw error; }
      return data;
    } finally { clearTimeout(timer); }
  }
  function mount(body, language = 'zh') {
    const t = words[language] || words.zh;
    body.parentElement.classList.add('feedback-panel');
    if (!enabled) {
      const link = el('a', 'tbtn feedback-online', t.online); link.href = config.feedbackOnlineUrl || 'https://qiannianchongdlzp.github.io/'; link.target = '_blank'; link.rel = 'noopener';
      body.append(el('p', 'feedback-help', t.offline), link); return;
    }
    const summary = el('p', 'feedback-summary', t.loading), help = el('p', 'feedback-help', t.help);
    const layout = el('div', 'feedback-layout'), form = el('form', 'feedback-form');
    const fieldset = el('fieldset', 'feedback-ratings'), legend = el('legend', '', t.rating), scores = el('div', 'feedback-scores');
    fieldset.append(legend, scores);
    let selected = Number.isInteger(draft.rating) && draft.rating >= 1 && draft.rating <= 10 ? draft.rating : 0;
    for (let n = 1; n <= 10; n++) {
      const label = el('label', 'feedback-score'), radio = document.createElement('input');
      radio.type = 'radio'; radio.name = 'feedback-rating'; radio.value = String(n); radio.checked = selected === n;
      radio.setAttribute('aria-label', `${n} / 10`);
      label.append(radio, el('span', '', String(n))); scores.append(label);
    }
    const label = el('label', 'feedback-label', t.message); label.htmlFor = 'feedback-message';
    const input = el('textarea'); input.id = 'feedback-message'; input.rows = 5; input.maxLength = 500; input.placeholder = t.placeholder;
    input.value = typeof draft.message === 'string' ? draft.message.slice(0, 500) : '';
    const count = el('p', 'feedback-count', `${input.value.length} / 500`), postStatus = el('p', 'feedback-post-status');
    count.id = 'feedback-count'; input.setAttribute('aria-describedby', count.id); postStatus.setAttribute('role', 'status');
    const publish = el('button', 'tbtn feedback-publish', t.publish); publish.type = 'submit';
    form.append(fieldset, label, input, count, publish, postStatus);
    const section = el('section', 'feedback-list-section'), toolbar = el('div', 'feedback-toolbar');
    section.setAttribute('aria-label', t.list);
    const listStatus = el('p', 'feedback-list-status', t.loading); listStatus.setAttribute('role', 'status');
    const refresh = el('button', 'tbtn', t.refresh); refresh.type = 'button'; toolbar.append(listStatus, refresh);
    const nav = el('nav', 'feedback-pagination'); nav.setAttribute('aria-label', t.pageNav);
    const previous = el('button', 'tbtn', t.previous), pageLabel = el('span', 'feedback-page', t.pages(1, 1)), next = el('button', 'tbtn', t.next);
    previous.type = next.type = 'button'; previous.disabled = next.disabled = true;
    pageLabel.setAttribute('aria-live', 'polite'); nav.append(previous, pageLabel, next);
    const list = el('div', 'feedback-list'); section.append(toolbar, nav, list); layout.append(form, section); body.append(summary, help, layout);
    let page = 1, pages = 1, generation = 0, loading = false, sending = false;
    const buttons = () => { previous.disabled = loading || page <= 1; next.disabled = loading || page >= pages; };
    const remember = () => { draft = { rating: selected, message: input.value }; write('draft', draft); };
    form.oninput = () => { selected = Number(form.querySelector('input:checked')?.value || 0); count.textContent = `${input.value.length} / 500`; remember(); };
    async function load(target, scroll = false) {
      const token = ++generation; loading = true; buttons(); listStatus.textContent = t.loading; list.setAttribute('aria-busy', 'true');
      try {
        const url = new URL(endpoint); url.searchParams.set('page', String(target));
        const data = await request(url.href);
        if (!body.isConnected || token !== generation) return;
        if (!Array.isArray(data.items) || !Number.isSafeInteger(data.page) || !Number.isSafeInteger(data.pages) || data.page < 1 || data.pages < data.page) throw Error('invalid_response');
        page = data.page; pages = data.pages;
        summary.textContent = t.summary(data.averageRating, data.ratingCount, data.total); pageLabel.textContent = t.pages(page, pages);
        list.replaceChildren();
        for (const entry of data.items) {
          const article = el('article', 'feedback-entry'), head = el('div', 'feedback-entry-head'), date = new Date(entry.createdAt);
          const time = el('time', ''); if (Number.isFinite(date.getTime())) { time.dateTime = date.toISOString(); time.textContent = date.toLocaleString({ zh: 'zh-CN', en: 'en-US', ja: 'ja-JP' }[language] || 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
          head.append(el('strong', '', t.anonymous), el('span', 'feedback-entry-rating', `${entry.rating} / 10`), time);
          article.append(head, el('p', 'feedback-entry-message', entry.message || t.ratingOnly)); list.append(article);
        }
        if (!data.items.length) list.append(el('p', 'feedback-empty', t.empty));
        listStatus.textContent = '';
        if (scroll) section.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } catch {
        if (body.isConnected && token === generation) listStatus.textContent = t.loadError;
      } finally {
        if (token === generation) { loading = false; buttons(); list.removeAttribute('aria-busy'); }
      }
    }
    previous.onclick = () => load(page - 1, true); next.onclick = () => load(page + 1, true); refresh.onclick = () => load(page);
    form.onsubmit = async event => {
      event.preventDefault(); if (sending) return;
      selected = Number(form.querySelector('input:checked')?.value || 0);
      if (selected < 1 || selected > 10) { postStatus.textContent = t.choose; return; }
      const message = input.value.trim();
      const reuse = pending && pending.visitorId === visitor && pending.rating === selected && pending.message === message;
      const submission = reuse ? pending : { game: '2-sixth-disk', submissionId: uuid(), visitorId: visitor, rating: selected, message };
      pending = submission; write('pending', pending); remember();
      sending = true; publish.disabled = true; publish.textContent = t.sending; postStatus.textContent = '';
      try {
        const result = await request(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submission) });
        if (!result.accepted) throw Error('not_accepted');
        if (pending?.submissionId === submission.submissionId) { pending = null; write('pending', null); draft = { rating: selected, message: '' }; write('draft', draft); }
        if (!body.isConnected) return;
        input.value = ''; count.textContent = '0 / 500'; postStatus.textContent = t.sent;
        publish.textContent = t.publish; void load(1);
      } catch (error) {
        if (!body.isConnected) return;
        postStatus.textContent = error.status === 429 ? t.limited : t.failed; publish.textContent = t.retry;
      } finally { sending = false; publish.disabled = false; }
    };
    void load(1);
  }
  window.Y2KFeedback = { mount };
})();

'use strict';
// 只传递随机标识与游玩状态；与剧情、昵称和存档无关。
window.Y2KStats = (() => {
  const words = {
    zh: ['累计访问', '当前在线', '同一访客刷新、多标签页不重复计数；全部退出后再次进入才新增一次。在线包含主页和后台页面，同一浏览器只计一人，约每 30 秒更新。', '正在读取统计', '统计暂时不可用', '离线模式', '本地预览不计入统计'],
    en: ['Total visits', 'Online now', 'Refreshes and multiple tabs count as one visit. A new visit starts after all game pages are closed. Online includes home and background pages, with one person per browser, and updates about every 30 seconds.', 'Loading statistics', 'Statistics temporarily unavailable', 'Offline mode', 'Local previews are not counted'],
    ja: ['累計アクセス', '現在オンライン', '再読み込みや複数タブは1回の訪問として集計します。すべてのゲームページを閉じてから再訪すると加算されます。ホーム画面やバックグラウンドもオンラインに含み、ブラウザーごとに1人として約30秒ごとに更新します。', '統計を読み込み中', '統計を取得できません', 'オフラインモード', 'ローカルプレビューは集計対象外です'],
  };
  let started = false, playing = false, pageId, sessionId, visitorId, registered = false;
  let flight = false, queued = false, seq = 0, lastApplied = 0, values = null, mode = 'loading';
  let endpoint = '', enabled = false, departed = false;
  let retryTimer = 0, retryAttempt = 0;
  const panels = new Map();
  const uuid = () => {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    // Older Safari/WebViews support getRandomValues but not randomUUID.
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
  const validId = value => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');
  function beginPage(reload) {
    pageId = uuid(); sessionId = uuid(); seq = 0; lastApplied = 0; registered = false;
    try {
      const previous = sessionStorage.getItem('y2k2_stats_visit');
      if (reload && validId(previous)) pageId = previous;
      sessionStorage.setItem('y2k2_stats_visit', pageId);
    } catch (_) {}
  }
  function paint() {
    for (const [el, lang] of panels) {
      if (!el.isConnected) { panels.delete(el); continue; }
      const w = words[lang] || words.zh;
      const format = value => new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : lang).format(value);
      const ready = mode === 'ready' && values;
      el.querySelector('[data-stat="visits"]').textContent = ready ? format(values.visits) : '—';
      el.querySelector('[data-stat="online"]').textContent = ready ? format(values.online) : '—';
      el.querySelector('.stats-state').textContent = ready ? '' : w[{ loading: 3, error: 4, offline: 5, preview: 6 }[mode] || 4];
      el.querySelector('.stats-retry').hidden = mode !== 'error' || !enabled;
      el.dataset.state = mode;
    }
  }
  function mount(lang) {
    const w = words[lang] || words.zh, el = document.createElement('div');
    el.className = 'site-stats'; el.setAttribute('role', 'group');
    for (const [label, key] of [[w[0], 'visits'], [w[1], 'online']]) {
      const item = document.createElement('span'), text = document.createElement('span'), value = document.createElement('strong');
      item.className = 'stat-item'; text.textContent = label; value.dataset.stat = key; value.textContent = '—';
      item.append(text, value); el.append(item);
    }
    const state = document.createElement('span'); state.className = 'stats-state'; state.setAttribute('role', 'status'); el.append(state);
    const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'stats-retry'; retry.hidden = true;
    retry.textContent = ({ zh: '重新连接', en: 'Reconnect', ja: '再接続' })[lang] || '重新连接';
    retry.onclick = () => { retryAttempt = 0; mode = 'loading'; paint(); void send(); }; el.append(retry);
    panels.set(el, lang); queueMicrotask(paint); return el;
  }
  function active() { return playing && document.visibilityState === 'visible'; }
  function payload(event) { return { event, pageId, sessionId, visitorId, seq: ++seq, playing: event === 'leave' ? false : active() }; }
  function leave() {
    if (!enabled) return;
    clearTimeout(retryTimer); retryTimer = 0;
    const body = JSON.stringify(payload('leave'));
    // 递增序号避免迟到的心跳把已离开的玩家重新记为在线。
    fetch(endpoint, { method: 'POST', body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, keepalive: true, credentials: 'omit' }).catch(() => {
      try { navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' })); } catch (_) {}
    });
  }
  async function send() {
    if (!enabled || departed) return;
    if (flight) { queued = true; return; }
    clearTimeout(retryTimer); retryTimer = 0;
    flight = true;
    const message = payload(registered ? 'heartbeat' : 'visit'), controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(message), credentials: 'omit', cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('stats unavailable');
      const result = await response.json();
      if (![result.visits, result.online].every(n => Number.isSafeInteger(n) && n >= 0)) throw new Error('invalid statistics');
      if (message.sessionId !== sessionId) return;
      if (message.event === 'visit') registered = true;
      retryAttempt = 0;
      if (message.seq >= lastApplied && document.visibilityState === 'visible') { lastApplied = message.seq; values = result; mode = 'ready'; paint(); }
    } catch (_) {
      if (departed || message.sessionId !== sessionId) return;
      mode = 'error'; paint();
      if (retryAttempt < 3) retryTimer = setTimeout(() => { retryTimer = 0; void send(); }, [1500, 4000, 10000][retryAttempt++]);
    }
    finally { clearTimeout(timeout); flight = false; if (queued) { queued = false; void send(); } }
  }
  function setPlaying(value) { const changed = playing !== value; playing = value; if (started && changed) void send(); }
  function start() {
    if (started) return; started = true;
    const config = window.Y2K_STATS_CONFIG || {};
    if (location.protocol === 'file:') { mode = 'offline'; paint(); return; }
    if (!(config.allowedOrigins || []).includes(location.origin)) { mode = 'preview'; paint(); return; }
    try {
      const url = new URL(config.endpoint); if (url.protocol !== 'https:') throw new Error('HTTPS required');
      endpoint = url.href; beginPage(performance.getEntriesByType('navigation')[0]?.type === 'reload');
      try {
        visitorId = localStorage.getItem('y2k2_stats_visitor');
        if (!validId(visitorId)) { visitorId = uuid(); localStorage.setItem('y2k2_stats_visitor', visitorId); }
      } catch (_) { visitorId = uuid(); }
      enabled = true;
    } catch (_) { mode = 'error'; paint(); return; }
    // 后台仍属于同一次访问；只有离开页面才结束这个标签页。
    document.addEventListener('visibilitychange', () => void send());
    window.addEventListener('pagehide', () => { departed = true; leave(); });
    window.addEventListener('pageshow', e => { if (e.persisted) { departed = false; beginPage(false); void send(); } });
    window.addEventListener('online', () => void send());
    setInterval(() => void send(), 30000); void send();
  }
  return { mount, setPlaying, start };
})();

'use strict';
// 《千年虫2》引擎：数据合并、标记与条件、动作、存档、2026 手机、Windows 98 桌面与各个应用。
const Y2K = (() => {
  // ============================================================
  // 语言：界面文字走 _t()（词表在 window.Y2K_UI），内容译文用 Y2K.lang() 注册、启动时按键写回数据
  // ============================================================
  const LANGS = { zh: '中文', en: 'English', ja: '日本語' };
  let LANG = 'zh';
  try { LANG = JSON.parse(localStorage.getItem('y2k2_meta') || '{}').lang || 'zh'; } catch (e) { }
  // 只有打包进来、译完的语言才可选（tools/build.js 写入 Y2K_LANGS）
  const READY = (typeof window !== 'undefined' && Array.isArray(window.Y2K_LANGS) && window.Y2K_LANGS.length) ? window.Y2K_LANGS : ['zh'];
  if (!LANGS[LANG] || !READY.includes(LANG)) LANG = 'zh';
  const UI = (typeof window !== 'undefined' && window.Y2K_UI) || {};
  function _t(s) { const d = UI[LANG]; return d && d[s] != null ? d[s] : window.Y2K2Locale ? window.Y2K2Locale.translate(s, LANG) : s; }
  const LANGMAP = {};
  function lang(code, map) { LANGMAP[code] = Object.assign(LANGMAP[code] || {}, map); }
  const SEG = {};   // 路径段（文件夹名、文件名）的显示译名

  // ============================================================
  // 数据
  // ============================================================
  const D = {
    chapters: [], apps: {}, contacts2018: {}, boot: {}, files: [], threads: [], loginLog: [], mails: [], pages: [],
    users: [], bbsBoards: [], adminSections: {}, bbsMeta: {}, userExtras: [], gxAccount: {}, gxAccounts: {}, gxContacts: [], gxLogs: [],
    puzzles: {}, boards: {}, dialogues: [], mails2018: [], items2018: [], notes: {}, collectibles: {}, endings: {}, screensaver: [], journal: {}, readings: [],
  };
  function add(o) {
    const push = (k, arr) => { if (arr) D[k].push(...arr); };
    push('chapters', o.chapters); push('files', o.files); push('dialogues', o.dialogues); push('mails2018', o.mails2018);
    push('items2018', o.items2018); push('screensaver', o.screensaver); push('userExtras', o.userExtras);
    push('readings', o.readings); Object.assign(D.journal, o.journal || {});
    Object.assign(D.apps, o.apps || {}); Object.assign(D.contacts2018, o.contacts2018 || {}); Object.assign(D.boot, o.boot || {});
    for (const k of ['puzzles', 'boards', 'notes', 'collectibles', 'endings']) Object.assign(D[k], o[k] || {});
    if (o.bbs) {
      const b = o.bbs;
      push('threads', b.threads); push('loginLog', b.loginLog); push('mails', b.mails); push('pages', b.pages);
      push('users', b.users); push('bbsBoards', b.boards); Object.assign(D.adminSections, b.adminSections || {});
      for (const k of ['name', 'sub', 'host', 'software', 'adminPuzzle', 'homeNotice', 'homeSource']) if (b[k]) D.bbsMeta[k] = b[k];
    }
    if (o.gexun) {
      if (o.gexun.account) D.gxAccount = o.gexun.account;
      Object.assign(D.gxAccounts, o.gexun.accounts || {});
      push('gxContacts', o.gexun.contacts); push('gxLogs', o.gexun.logs);
    }
  }
  // 选择题/多选题按选项位置判定，所以要在译文覆盖选项文字之前记下正确答案的位置
  function prepAnswers() {
    for (const p of Object.values(D.puzzles)) {
      if (p.kind === 'choice') p._ai = (p.options || []).indexOf(p.answer);
      if (p.kind === 'pick') p._as = (p.answerSet || []).map(a => (p.options || []).indexOf(a));
    }
  }
  // 把译文按键写回数据。键的规则和 tools/i18n-extract.js 一一对应：
  //   <类别>.<id>.<路径…>；路径末尾带 + 表示追加（answers+、near+）；seg|<名字> 是路径段显示名；bbs.<字段> 是 BBS 站点信息
  function translationTarget(obj, parts, append) {
    if (!obj || typeof obj !== 'object') return null;
    // 字典键本身可能含小数点（如 speeds['1.5']），优先匹配完整的现有键。
    for (let n = parts.length; n > 0; n--) {
      const key = parts.slice(0, n).join('.');
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      if (n === parts.length) return { obj, key };
      const target = translationTarget(obj[key], parts.slice(n), append);
      if (target) return target;
    }
    // answers+ / near+ 可以在已存在的父对象中新增末级字段。
    return append && parts.length === 1 ? { obj, key: parts[0] } : null;
  }
  function applyLang(map) {
    if (!map) return;
    const byId = (arr) => { const o = {}; arr.forEach(x => { o[x.id] = x; }); return o; };
    const roots = {
      chapter: byId(D.chapters), app: D.apps, contact: D.contacts2018, file: byId(D.files), dlg: byId(D.dialogues),
      mail26: byId(D.mails2018), item: byId(D.items2018), reading: byId(D.readings), journal: D.journal, ux: byId(D.userExtras), puzzle: D.puzzles, board: D.boards,
      note: D.notes, col: D.collectibles, ending: D.endings, saver: D.screensaver, bboard: byId(D.bbsBoards), user: byId(D.users),
      thread: byId(D.threads), bmail: byId(D.mails), page: byId(D.pages), gxc: byId(D.gxContacts), gx: byId(D.gxLogs), gxacc: { me: D.gxAccount },
    };
    for (const [key, val] of Object.entries(map)) {
      if (key.startsWith('seg|')) { SEG[key.slice(4)] = val; continue; }
      if (key.startsWith('bbs.')) { D.bbsMeta[key.slice(4)] = val; continue; }
      const append = key.endsWith('+');
      const parts = (append ? key.slice(0, -1) : key).split('.');
      const root = roots[parts[0]];
      const target = translationTarget(root && root[parts[1]], parts.slice(2), append);
      if (!target) continue;
      const { obj, key: last } = target;
      // 未完成译文中的占位符不应覆盖原照片，保留可读的中文原件。
      if (typeof val === 'string' && /^__SVG_[A-Z0-9_]+__$/.test(val) && typeof obj[last] === 'string' && obj[last].includes('<svg')) continue;
      if (append) {
        if (Array.isArray(val)) obj[last] = (obj[last] || []).concat(val);
        else if (val && typeof val === 'object') obj[last] = Object.assign({}, obj[last] || {}, val);
      } else obj[last] = val;
    }
  }
  let DLG = {}, USER = {}, THREAD = {}, MAIL26 = {}, ITEM = {};
  function index() {
    DLG = {}; D.dialogues.forEach(d => DLG[d.id] = d);
    USER = {}; D.users.forEach(u => USER[u.id] = u);
    THREAD = {}; D.threads.forEach(t => THREAD[t.id] = t);
    MAIL26 = {}; D.mails2018.forEach(m => MAIL26[m.id] = m);
    ITEM = {}; D.items2018.forEach(m => ITEM[m.id] = m);
    D.threads.sort((a, b) => a.id - b.id);
  }

  // 将原图替换为写实照片。原 SVG 的证据文字作为独立图层保留，
  // 防止生成图中的日期、编号或笔迹失真，影响玩家推理。
  function applyPhotos() {
    const photos = window.Y2K_PHOTOS || {};
    const svgNS = 'http://www.w3.org/2000/svg';
    const overlayHTML = {
      group: '<rect x="260" y="25" width="140" height="55" rx="2" fill="#101010" stroke="#555" stroke-width="2"/>',
      ice: '<rect x="499" y="82" width="60" height="27" rx="1" fill="#6b4d30" stroke="#49351f" stroke-width="1"/><rect x="597" y="96" width="24" height="12" rx="1" fill="#a21c1c"/>',
    };
    for (const [name, photo] of Object.entries(photos)) {
      for (const target of photo.targets) {
        const entity = (D[target.collection] || []).find(x => x.id === target.id);
        if (!entity || !entity.html) continue;
        const box = document.createElement('div'); box.innerHTML = entity.html;
        const svg = box.querySelector('svg'); if (!svg) continue;
        const vb = svg.viewBox.baseVal;
        const width = vb.width || 640, height = vb.height || 420;
        const texts = [...svg.querySelectorAll('text')];
        if (photo.overlay === 'portrait') {
          texts.filter(node => /[（(]照片[）)]|[（(]photo[）)]|[（(]写真[）)]/i.test(node.textContent)).forEach(node => node.remove());
          const portrait = document.createElementNS(svgNS, 'image');
          portrait.setAttribute('x', '470'); portrait.setAttribute('y', '120'); portrait.setAttribute('width', '110'); portrait.setAttribute('height', '140');
          portrait.setAttribute('preserveAspectRatio', 'xMidYMid slice'); portrait.setAttribute('href', photo.data);
          svg.append(portrait); svg.setAttribute('data-photo', name); entity.html = box.innerHTML; continue;
        }
        if (photo.overlay === 'group') {
          // 与真实合影中的站位一一对应：前排六人，后排七人，右侧主持老师。
          const positions = { 1:[64,78], 2:[153,169], 3:[248,169], 4:[339,165], 5:[405,176], 6:[495,185], 7:[159,78], 8:[298,90], 9:[228,94], 10:[66,177], 11:[383,84], 12:[455,95], 13:[526,78], 14:[582,110] };
          texts.forEach(node => {
            const value = node.textContent.trim();
            if (positions[value]) { node.setAttribute('x', positions[value][0]); node.setAttribute('y', positions[value][1]); }
            else if (value === '距 2000 年') { node.setAttribute('x', '330'); node.setAttribute('y', '44'); node.setAttribute('font-size', '11'); }
            else if (value === '00:01:47') { node.setAttribute('x', '330'); node.setAttribute('y', '69'); node.setAttribute('font-size', '23'); }
          });
        }
        if (photo.overlay === 'ice' && texts.length >= 4) {
          [[529,94,9], [529,105,9], [609,105,8]].forEach(([x, y, size], i) => { texts[i].setAttribute('x', x); texts[i].setAttribute('y', y); texts[i].setAttribute('font-size', size); });
        }
        if (name === 'key_half' && texts.length) {
          texts[0].setAttribute('fill', '#46566c'); texts[texts.length - 1].setAttribute('fill', '#46566c');
        }
        if (photo.overlay === 'date') texts.slice(0, -1).forEach(node => node.remove());
        if (name === 'photo_back') texts.filter(node => node.textContent.includes('梧城彩扩')).forEach(node => node.remove());
        svg.querySelectorAll('defs, rect, path, circle, ellipse, line, polygon, polyline, image').forEach(node => node.remove());
        const raster = document.createElementNS(svgNS, 'image');
        raster.setAttribute('x', '0'); raster.setAttribute('y', '0');
        raster.setAttribute('width', width); raster.setAttribute('height', height);
        raster.setAttribute('preserveAspectRatio', 'xMidYMid slice'); raster.setAttribute('href', photo.data);
        svg.insertBefore(raster, svg.firstChild);
        if (overlayHTML[photo.overlay]) {
          const layer = document.createElementNS(svgNS, 'g'); layer.innerHTML = overlayHTML[photo.overlay];
          raster.after(layer);
        }
        if (name === 'photo_back') {
          const stains = document.createElementNS(svgNS, 'g');
          stains.innerHTML = '<ellipse cx="112" cy="180" rx="48" ry="16" fill="#bfa877" opacity=".3"/><path d="M76 182 q10 -8 20 0 t20 0 t20 0" stroke="#6c7bb0" stroke-width="4" fill="none" opacity=".35"/><ellipse cx="325" cy="288" rx="34" ry="14" fill="#bfa877" opacity=".3"/><path d="M303 290 q9 -7 18 0 t18 0" stroke="#6c7bb0" stroke-width="4" fill="none" opacity=".35"/>';
          svg.append(stains);
        }
        svg.setAttribute('data-photo', name);
        entity.html = box.innerHTML;
      }
    }
  }

  // ============================================================
  // 工具
  // ============================================================
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const strip = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  // Resolve legacy default names at display time so existing saves stay intact.
  function playerText(s, html = false, name = S ? S.player : '') {
    return String(s == null ? '' : s).replace(/\{player\}|老K/g, () => html ? esc(name) : name);
  }
  function fmt(s, player = S ? S.player : '') { return playerText(_t(String(s == null ? '' : s)), true, player); }
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'onclick' && (tag === 'button' || attrs.role === 'button')) bindControl(el, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
    if (tag === 'summary') bindControl(el, event => {
      if (event.type !== 'click' && el.parentElement?.tagName === 'DETAILS') el.parentElement.open = !el.parentElement.open;
    });
    return el;
  }
  function norm(s) {
    return String(s == null ? '' : s).normalize('NFKC').toLowerCase()
      .replace(/[\s，。、！？,.!?;:：；'"“”‘’()（）\[\]【】\-—_·\/\\《》<>~～…「」『』|]/g, '');
  }
  // 在触屏松手时直接执行操作；兼容没有补发 click 的浏览器，并去掉同次触摸的重复点击。
  function controlButton(attrs, action, ...children) {
    const button = h('button', Object.assign({ type: 'button' }, attrs), ...children);
    return bindControl(button, action);
  }
  const controlCancels = new WeakMap();
  let controlClickGuard = null, controlClickGuardInstalled = false;
  function guardControlClicks() {
    if (controlClickGuardInstalled) return;
    controlClickGuardInstalled = true;
    const nextPress = () => { controlClickGuard = null; };
    document.addEventListener('pointerdown', nextPress, true);
    document.addEventListener('touchstart', nextPress, { capture: true, passive: true });
    document.addEventListener('click', event => {
      const guard = controlClickGuard;
      // A redraw can detach the touched node and retarget its compatibility click.
      // Keep keyboard activation, script-triggered downloads and the next press intact.
      if (!guard || !event.isTrusted || event.detail === 0 || Date.now() >= guard.until || Math.hypot(event.clientX - guard.x, event.clientY - guard.y) > 28) return;
      event.preventDefault(); event.stopImmediatePropagation();
    }, true);
  }
  function bindControl(button, action, targetOf = () => button) {
    let press = null, suppressClickUntil = 0;
    const reset = () => { press = null; button.classList.remove('pressed-control'); };
    const start = (kind, id, x, y, target) => { reset(); press = { kind, id, x, y, moved: false, target }; if (target === button) button.classList.add('pressed-control'); };
    const move = (x, y) => { if (press && Math.hypot(x - press.x, y - press.y) > 12) { press.moved = true; button.classList.remove('pressed-control'); } };
    const cancel = () => { if (press) suppressClickUntil = Date.now() + 800; reset(); };
    controlCancels.set(button, cancel);
    const finish = (event, x, y) => {
      if (!press) return;
      const current = press, r = current.target.getBoundingClientRect(); move(x, y); reset();
      suppressClickUntil = Date.now() + 800;
      controlClickGuard = { until: suppressClickUntil, x, y };
      if (event.cancelable) event.preventDefault(); event.stopPropagation();
      if (!current.target.disabled && !current.moved && x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) action(event, current.target);
    };
    button.addEventListener('pointerdown', e => {
      const target = targetOf(e); if (!target) return;
      if (e.pointerType === 'mouse') { suppressClickUntil = 0; return; }
      if (!['touch', 'pen'].includes(e.pointerType)) return;
      if (!e.isPrimary) return cancel();
      start('pointer', e.pointerId, e.clientX, e.clientY, target);
    });
    button.addEventListener('pointermove', e => { if (press && press.kind === 'pointer' && press.id === e.pointerId) move(e.clientX, e.clientY); });
    button.addEventListener('pointerup', e => { if (press && press.kind === 'pointer' && press.id === e.pointerId) finish(e, e.clientX, e.clientY); });
    button.addEventListener('pointercancel', cancel);
    button.addEventListener('touchstart', e => {
      const target = targetOf(e); if (!target) return;
      if (e.touches.length !== 1) return cancel();
      if (!press) { const t = e.touches[0]; start('touch', t.identifier, t.clientX, t.clientY, target); }
    }, { passive: true });
    button.addEventListener('touchmove', e => { if (press && press.kind === 'touch') { const t = [...e.touches].find(t => t.identifier === press.id); if (t) move(t.clientX, t.clientY); } }, { passive: true });
    button.addEventListener('touchend', e => {
      if (!targetOf(e)) return;
      const t = press && [...e.changedTouches].find(t => press.kind === 'pointer' || t.identifier === press.id);
      if (t) finish(e, t.clientX, t.clientY);
      else if (Date.now() < suppressClickUntil) { if (e.cancelable) e.preventDefault(); e.stopPropagation(); }
    }, { passive: false });
    button.addEventListener('touchcancel', cancel, { passive: true });
    button.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') suppressClickUntil = 0; });
    button.addEventListener('click', e => {
      const target = targetOf(e); if (!target) return;
      e.stopPropagation();
      if (target.disabled || Date.now() < suppressClickUntil) { e.preventDefault(); return; }
      action(e, target);
    });
    return button;
  }
  function bindChoice(label, input) {
    return bindControl(label, event => {
      if (event.type === 'click' || input.disabled) return;
      input.checked = input.type === 'radio' || !input.checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  // Use visible in-page options on touch devices instead of relying on a native picker click.
  function bindTouchSelect(select, win) {
    const open = () => {
      if (select.disabled || !select.isConnected || win.selectPicker) return;
      const title = select.getAttribute('aria-label') || _t('选择');
      const dialog = h('dialog', { class: 'dlg98 out touch-select-dialog', 'aria-label': title });
      const list = h('div', { class: 'touch-select-options', role: 'listbox', 'aria-label': title });
      let done = false;
      const finish = value => {
        if (done) return; done = true;
        win.selectPicker = null;
        if (dialog.open) dialog.close(); dialog.remove();
        if (!select.isConnected) return;
        select.focus({ preventScroll: true });
        if (value !== undefined && value !== select.value) {
          select.value = value;
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (win.refreshPending) win.refresh();
      };
      for (const option of select.options) {
        const button = controlButton({ class: 'b98 touch-select-option' + (option.selected ? ' down' : ''),
          role: 'option', 'aria-selected': String(option.selected), disabled: option.disabled,
          'data-select-value': option.value, text: option.textContent }, () => finish(option.value));
        list.append(button);
      }
      dialog.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: title }),
        controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), text: '×' }, () => finish())),
        h('div', { class: 'wbody' }, list, h('div', { class: 'row' }, controlButton({ class: 'b98', text: _t('取消') }, () => finish()))));
      dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
      dialog.addEventListener('close', () => finish());
      dialog.addEventListener('keydown', event => event.stopPropagation());
      list.addEventListener('keydown', event => {
        const buttons = [...list.querySelectorAll('button:not(:disabled)')], index = buttons.indexOf(document.activeElement);
        const next = { ArrowDown: Math.min(buttons.length - 1, index + 1), ArrowUp: Math.max(0, index - 1), Home: 0, End: buttons.length - 1 }[event.key];
        if (next !== undefined) { event.preventDefault(); buttons[next]?.focus(); }
      });
      win.selectPicker = { close: () => finish() };
      document.body.append(dialog); dialog.showModal();
      const current = list.querySelector('[aria-selected="true"]:not(:disabled)') || list.querySelector('button:not(:disabled)');
      current?.focus({ preventScroll: true }); current?.scrollIntoView({ block: 'nearest' });
    };
    // Cancel only these native pickers, leaving other form controls and page scrolling alone.
    select.addEventListener('pointerdown', event => { if (['touch', 'pen'].includes(event.pointerType) && event.cancelable) event.preventDefault(); });
    select.addEventListener('touchstart', event => { if (event.cancelable) event.preventDefault(); }, { passive: false });
    bindControl(select, event => { if (event.type !== 'click' || touchKeyboard()) { event.preventDefault(); open(); } });
    return select;
  }
  const pad = (n) => String(n).padStart(2, '0');
  const timers = new Set();
  function later(fn, ms) { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }
  const coarse = () => window.matchMedia && matchMedia('(pointer: coarse)').matches;
  const narrow = () => window.innerWidth <= 960;
  const touchKeyboard = () => navigator.maxTouchPoints > 0 || coarse();
  const confirmInput = e => e.key === 'Enter' && !e.isComposing && e.keyCode !== 229;
  const textInputTarget = target => {
    const input = target?.closest?.('input, textarea, [contenteditable="true"]');
    if (!input || input.disabled || input.readOnly) return null;
    return input.isContentEditable || input.tagName === 'TEXTAREA' || ['text', 'search', 'password', 'email', 'url', 'tel', 'number'].includes(input.type) ? input : null;
  };
  // iPad can omit the compatibility click after a touch. Focus the actual field
  // synchronously inside the trusted gesture so WebKit may show its keyboard.
  // Leave scrolling, selection, paste and native click behavior untouched.
  function bindTextInputs() {
    let touch = null, pen = null;
    const begin = (input, id, x, y) => input && ({ input, id, x, y, moved: false });
    const move = (press, x, y) => { if (press && Math.hypot(x - press.x, y - press.y) > 12) press.moved = true; };
    const finish = (press, e, x, y) => {
      if (!press || !e.isTrusted || press.moved || !press.input.isConnected || textInputTarget(e.target) !== press.input) return;
      const r = press.input.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) press.input.focus();
    };
    document.addEventListener('touchstart', e => { const t = e.touches[0]; touch = e.touches.length === 1 ? begin(textInputTarget(e.target), t.identifier, t.clientX, t.clientY) : null; }, { capture: true, passive: true });
    document.addEventListener('touchmove', e => { const t = touch && [...e.touches].find(t => t.identifier === touch.id); if (t) move(touch, t.clientX, t.clientY); }, { capture: true, passive: true });
    document.addEventListener('touchend', e => { const t = touch && [...e.changedTouches].find(t => t.identifier === touch.id); if (t) { move(touch, t.clientX, t.clientY); finish(touch, e, t.clientX, t.clientY); } touch = null; }, { capture: true, passive: true });
    document.addEventListener('touchcancel', () => { touch = null; }, { capture: true, passive: true });
    document.addEventListener('pointerdown', e => { if (e.pointerType === 'pen') pen = begin(textInputTarget(e.target), e.pointerId, e.clientX, e.clientY); }, true);
    document.addEventListener('pointermove', e => { if (pen && pen.id === e.pointerId) move(pen, e.clientX, e.clientY); }, true);
    document.addEventListener('pointerup', e => { if (pen && pen.id === e.pointerId) { move(pen, e.clientX, e.clientY); finish(pen, e, e.clientX, e.clientY); pen = null; } }, true);
    document.addEventListener('pointercancel', () => { pen = null; }, true);
  }


  // ============================================================
  // 状态、条件、动作
  // ============================================================
  // 3：现行少年宫剧情。早期档案室剧情的存档（v2）读不进现行剧情，按空存档处理。
  const VER = 3;
  let S = null;
  let flagVer = 0;
  function fresh(player) {
    return {
      v: VER, player: player || _t('老K'), flags: { start: true }, opened: {}, hints: {}, notes: [], noteCh: {}, collected: [],
      dlg: {}, dlgQ: {}, chat: {}, unread: {}, wait: {}, mails: [], mailRead: {}, items: [], itemSeen: {}, boardFill: {},
      seenBoards: {}, seenAsk: {}, chapter: null, chTime: null, stage: 'off', clock: '2026-12-20 21:30', clockAt: Date.now(),
      showHidden: false, playMs: 0, runId: window.Y2KLeaderboard?.newRun(), finishRecords: {}, created: Date.now(), newNotes: 0, newBoards: 0, sound: true, readingSeen: {},
      snap: 'cur', hh: {}, storyRevision: D.storyRevision || 0, chatTimeVersion: 1,
    };
  }
  const compiled = {};
  function compile(expr) {
    const toks = expr.match(/[A-Za-z0-9_]+|[()&|!]/g) || [];
    let i = 0;
    const or = () => { let a = and(); while (toks[i] === '|') { i++; const b = and(), x = a; a = (f) => x(f) || b(f); } return a; };
    const and = () => { let a = not(); while (toks[i] === '&') { i++; const b = not(), x = a; a = (f) => x(f) && b(f); } return a; };
    const not = () => { if (toks[i] === '!') { i++; const a = not(); return (f) => !a(f); } return atom(); };
    const atom = () => { const t = toks[i++]; if (t === '(') { const a = or(); i++; return a; } if (!t) return () => true; return (f) => !!f[t]; };
    return or();
  }
  function test(expr) {
    if (!expr) return true;
    const fn = compiled[expr] || (compiled[expr] = compile(expr));
    return fn(S.flags);
  }
  function setFlag(f) { if (!S.flags[f]) { S.flags[f] = true; flagVer++; } }

  let preEndSnap = null, pendingEnding = null;
  function markInteraction() { try { preEndSnap = JSON.stringify(S); } catch (e) { preEndSnap = null; } }

  function setSceneTime(value) {
    // Late optional conversations retain their content without rewinding the present.
    if (S.clock && value < S.clock) return;
    S.clock = value; S.clockAt = Date.now();
    const [date, time] = value.split(' ');
    S.chTime = { date, time, at: S.clockAt };
  }

  // Only an explicit story checkpoint can move a conversation into a later time slot.
  // Ordinary replies and their follow-ups belong to the current slot until the exchange ends.
  function dialogueTime(dialogue, state) {
    const step = dialogue.steps[state?.i || 0];
    const received = state?.at || S.clock;
    const segment = dialogue.startsAt && received < dialogue.startsAt ? dialogue.startsAt : received;
    if (state?.rep || !step) return segment;
    const checkpoint = step.at || step.action?.clock;
    if (checkpoint) return checkpoint > segment ? checkpoint : segment;
    if (step.choice?.length && step.choice.every(option => option.action?.clock)) {
      return step.choice.map(option => option.action.clock).sort()[0];
    }
    return segment;
  }
  function canReachTime(target, currentDialogue) {
    if (!target || (!currentDialogue && target <= S.clock)) return true;
    if (S.pendingTimedActions?.some(entry => entry.action.clock < target)) return false;
    return !D.dialogues.some(dialogue => {
      const state = S.dlg[dialogue.id];
      // Personal catch-ups in the epilogue can still be answered after the next email arrives.
      if (dialogue.blocksClock === false || dialogue.id === currentDialogue || state?.done || (!state && !test(dialogue.trigger))) return false;
      return dialogueTime(dialogue, state) < target;
    });
  }
  function act(a, once, currentDialogue) {
    if (!a) return;
    if (a.clock && !currentDialogue && a.clock > S.clock && !canReachTime(a.clock)) {
      (S.pendingTimedActions ||= []).push({ action: a, once });
      dirty();
      return;
    }
    (a.set || []).forEach(setFlag);
    (a.unset || []).forEach(f => { if (S.flags[f]) { delete S.flags[f]; flagVer++; } });
    [].concat(a.note || []).forEach(addNote);
    if (a.collect) collect(a.collect);
    if (a.mail) deliverMail(a.mail);
    if (a.toast && once !== false) toast(fmt(a.toast));
    if (a.clock) setSceneTime(a.clock);
    if (a.ending) pendingEnding = a.ending;
    dirty();
  }
  function addNote(id) {
    if (!D.notes[id] || S.notes.includes(id)) return;
    S.notes.push(id); S.noteCh[id] = S.chapter; S.newNotes++;
    toast(_t('笔记 · ') + strip(fmt(D.notes[id].text)).slice(0, 34));
  }
  function collect(id) {
    const c = D.collectibles[id];
    if (!c || S.collected.includes(id)) return;
    S.collected.push(id); setFlag('col_' + id);
    const total = Object.keys(D.collectibles).length;
    if (S.collected.length >= total) setFlag('collected_all');
    S.newNotes++;
    toast(`${_t('找到')}${D.collectLabel || _t('私人手记')}：${c.title}（${S.collected.length}/${total}）`, 'good');
    sfx('ok');
  }
  function deliverMail(id) {
    if (S.mails.includes(id) || !MAIL26[id]) return;
    S.mails.push(id); toast(_t('新邮件 · ') + strip(fmt(MAIL26[id].subject))); sfx('msg');
  }
  // 第一次打开某个东西
  function opened(id, onOpen) {
    if (id) { if (S.opened[id]) return; setFlag('seen_' + id); S.opened[id] = 1; }
    act(onOpen);
    dirty();
  }
  function onceFlag(flag, action) { if (S.flags[flag]) return; setFlag(flag); act(action); }

  // ============================================================
  // 主循环
  // ============================================================
  let dirtyT = 0;
  function dirty() { if (!dirtyT) dirtyT = setTimeout(update, 0); }
  const cardQ = [];
  function update() {
    dirtyT = 0;
    if (!S || titleOn) return;
    // Save the answer now, but wait for the player to finish reading the result.
    if (awaitingPuzzleFeedback()) { save('auto'); return; }
    for (let pass = 0; pass < 4; pass++) {
      const before = flagVer;
      if (S.pendingTimedActions?.length) {
        S.pendingTimedActions.sort((a, b) => a.action.clock.localeCompare(b.action.clock));
        const first = S.pendingTimedActions[0];
        if (canReachTime(first.action.clock)) { S.pendingTimedActions.shift(); act(first.action, first.once); }
      }
      for (const c of D.chapters) {
        const starts = c.date + ' ' + (c.time || '09:00');
        if (!S.flags[c.id] && test(c.trigger) && canReachTime(starts)) {
          setFlag(c.id); S.chapter = c.id; setSceneTime(starts);
          cardQ.push(c);
        }
      }
      D.mails2018.forEach(m => { if (m.requires && !S.mails.includes(m.id) && test(m.requires) && (!m.date || !S.clock || m.date <= S.clock)) deliverMail(m.id); });
      D.dialogues.forEach(d => {
        if (S.dlg[d.id] || !test(d.trigger)) return;
        const cursor = S.heldDialogues?.[d.id] || { i: 0 };
        cursor.at = cursor.at && cursor.at > S.clock ? cursor.at : S.clock;
        S.dlg[d.id] = cursor;
        if (S.heldDialogues) delete S.heldDialogues[d.id];
        (S.dlgQ[d.contact] ||= []).push(d.id);
      });
      if (flagVer === before) break;
    }
    for (const [id, b] of Object.entries(D.boards)) {
      if (!canOpenBoard(id) && S.seenBoards[id]) { delete S.seenBoards[id]; S.newBoards = Math.max(0, S.newBoards - 1); }
      if (!S.flags['board_' + id] && !S.seenBoards[id] && canOpenBoard(id)) { S.seenBoards[id] = 1; S.newBoards++; toast(_t('推理板解锁 · ') + b.title, 'good'); sfx('ok'); }
    }
    for (const [id, p] of Object.entries(D.puzzles)) {
      if (p.ask && !S.seenAsk[id] && test(p.requires) && !S.flags['solved_' + id]) { S.seenAsk[id] = 1; S.newNotes++; }
    }
    D.items2018.forEach(it => { if (!S.items.includes(it.id) && test(it.requires)) { S.items.push(it.id); } });
    runDialogues();
    if (pendingEnding) { const e = pendingEnding; pendingEnding = null; showEnding(e); }
    else if (S.flags.c6_sendout && !S.flags.sent_done && !titleOn && !cardOn && !overlay().classList.contains('on') && !ui._sendShown) { ui._sendShown = true; later(openSendOut, 600); }
    showCards();
    renderAll();
    save('auto');
    if(S.flags.board_c1_final) window.Y2KPaid?.trialComplete();
  }

  // ============================================================
  // 存档
  // ============================================================
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } },
  };
  const MANUAL_SLOTS = Array.from({ length: 8 }, (_, i) => 's' + (i + 1));
  const KEY = { auto: 'y2k2_auto', ...Object.fromEntries(MANUAL_SLOTS.map((slot, i) => [slot, 'y2k2_slot' + (i + 1)])), pre: 'y2k2_preend', meta: 'y2k2_meta' };
  let saveT = 0, storageOK = true;
  function save(slot) {
    if (!S) return;
    if (slot === 'auto') { if (saveT) return; saveT = setTimeout(() => { saveT = 0; writeSave('auto'); }, 400); return; }
    return writeSave(slot);
  }
  function tickPlay() {
    const now = Date.now();
    if (S && playClockRunning && lastTick) S.playMs = Math.max(0, Number(S.playMs) || 0) + Math.max(0, now - lastTick);
    lastTick = now;
  }
  let lastTick = 0, playClockRunning = false;
  function syncPlayClock() {
    tickPlay();
    playClockRunning = !titleOn && document.visibilityState === 'visible' && !document.querySelector('.ending');
  }
  function writeSave(slot) {
    tickPlay();
    if (!titleOn) S.view = captureView();
    S.saved = Date.now();
    const ok = LS.set(KEY[slot], JSON.stringify(S));
    if (!ok && storageOK) { storageOK = false; toast(_t('浏览器不允许本地存储。请用"菜单 → 导出存档"手动保存进度。')); }
    return ok;
  }
  function readSave(slot) { const t = LS.get(KEY[slot]); if (!t) return null; try { const o = JSON.parse(t); return o && o.v === VER ? o : null; } catch (e) { return null; } }
  function meta() { try { return JSON.parse(LS.get(KEY.meta) || '{}'); } catch (e) { return {}; } }
  function setMeta(m) { LS.set(KEY.meta, JSON.stringify(m)); }
  function hintCount(state = S) { return Object.values(state?.hints || {}).reduce((sum, n) => sum + (Number.isSafeInteger(n) && n > 0 ? n : 0), 0); }
  function describe(s) {
    if (!s) return _t('空');
    const c = D.chapters.find(x => x.id === s.chapter);
    const d = new Date(s.saved || s.created);
    const pt = Math.round((s.playMs || 0) / 60000);
    return `${c ? c.num + ' ' + c.name : _t('序章')} ${_t('· 游玩')} ${Math.floor(pt / 60)}${_t('小时')}${pt % 60}${_t('分 ·')} ${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())} · ${_t('提示次数')}：${hintCount(s)}`;
  }
  function loadState(o) {
    clearTimers(); running = {}; typing = {};
    clearTimeout(dirtyT); dirtyT = 0; clearTimeout(saveT); saveT = 0;
    closeAllWins(); closeOverlay(); closeModal(false);
    S = Object.assign(fresh(o.player), o);
    for (const [id, wasOpened] of Object.entries(S.opened || {})) {
      if (wasOpened) setFlag('seen_' + id);
    }
    if (D.migrateStory) { S.storyRevision = o.storyRevision || 0; D.migrateStory(S); }
    if (o.chatTimeVersion !== 1) repairChatTimes();
    // A save can be reopened halfway through an older exchange after a later notification.
    for (const dialogue of D.dialogues) {
      const state = S.dlg[dialogue.id];
      if (!state || state.done || state.at) continue;
      const completedSteps = dialogue.steps.slice(0, state.i);
      const lastClock = completedSteps.map(step => step.action?.clock).filter(Boolean).at(-1);
      const history = S.chat[dialogue.contact] || [];
      const message = history.findLast(m => m.ref ? m.ref.d === dialogue.id : completedSteps.some(step => step[m.from] && step[m.from] === m.text));
      state.at = [lastClock, message && chatTimestamp(message)].filter(Boolean).sort().at(-1) || S.clock;
    }
    // Keep in-chapter date advances (overnight investigation / next-day hospital) when loading.
    if (D.retime) Object.values(S.chat).forEach(log => log.forEach(m => { if (typeof m.text === 'string') m.text = D.retime(m.text); }));
    if (window.Y2K2Locale) Object.values(S.chat).forEach(log => log.forEach(m => { if (!m.ref && typeof m.text === 'string') m.text = window.Y2K2Locale.history(m.text, LANG); }));
    flagVer++; cardQ.length = 0; cardOn = false; pendingEnding = null;
    preEndSnap = null;
    lastTick = Date.now(); playClockRunning = false;
    window.Y2KLeaderboard?.resume(S);
    ui.tab = 'msg'; ui.chat = null; ui.mail = null; ui.item = null;
    ui._viewKey = null; ui.scroll = {}; ui.menuView = null; ui.boardLead = null;
    ui.noteTab = 'questions'; ui.noteQuery = ''; ui.itemQuery = '';
    ui.reading = null; ui.clueScope = 'current'; ui.clueGroups = {};
    ui.clip = null; ui.frameSel = null; ui.framePuzzle = null; ui.frameMsg = ''; ui.returnBoard = null;
    ui.phoneOpen = false; $('#phone').classList.remove('open');
    hideTitle();
    renderScreen(); renderAll(); restoreView(o.view); dirty();
    const unfinishedReview = Object.keys(S.finishRecords || {}).find(id => S.finishRecords[id]?.review === null);
    const legacyEnding = !Object.hasOwn(o, 'activeEnding') && !S.flags.c8_begin && S.ends?.at(-1);
    const resumeEnding = unfinishedReview || S.activeEnding || legacyEnding;
    if (resumeEnding && D.endings[resumeEnding]) showEnding(resumeEnding, true);
  }
  function exportSave() {
    tickPlay();
    S.view = captureView();
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `${_t('千年虫2存档_')}${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast(_t('已导出存档文件'));
  }
  function importFile(cb) {
    const inp = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { const o = JSON.parse(r.result); if (o.v !== VER || !o.flags) throw 0; loadState(o); toast(_t('存档已读取')); cb && cb(); } catch (e) { toast(_t('这个文件不是《千年虫2》的存档')); } };
      r.readAsText(f);
    };
    document.body.append(inp); inp.click(); setTimeout(() => inp.remove(), 60000);
  }
  const b64e = (s) => btoa(unescape(encodeURIComponent(s)));
  const b64d = (s) => decodeURIComponent(escape(atob(s.trim())));

  // Save the reading position as well as story progress. Old saves need no view data.
  const viewKeys = ['tab', 'chat', 'mail', 'item', 'phoneOpen', 'noteTab', 'noteQuery', 'itemQuery', 'reading', 'clueScope', 'clueGroups', 'scroll', 'clip', 'frameSel', 'framePuzzle', 'frameMsg', 'returnBoard'];
  function captureView() {
    const body = $('#phBody');
    if (body && ui._viewKey) ui.scroll[ui._viewKey] = body.scrollTop;
    const phone = Object.fromEntries(viewKeys.map(key => [key, ui[key]]));
    const windows = wins.slice().sort((a, b) => a.z - b.z).map(w => ({
      key: w.key, file: w.o.file?.id, state: w.state, min: w.min, max: w.el.classList.contains('max'),
      rect: ['left', 'top', 'width', 'height'].map(key => parseFloat(w.el.style[key]) || 0),
      scroll: [w.body, ...w.body.querySelectorAll('*')].map((el, index) => ({ index, top: el.scrollTop, left: el.scrollLeft })).filter(s => s.top || s.left),
    }));
    return JSON.parse(JSON.stringify({ phone, windows, board: $('.board')?.dataset.board || null }));
  }
  function restoreView(view) {
    if (!view || typeof view !== 'object') return;
    const phone = view.phone || {};
    for (const key of viewKeys) if (Object.hasOwn(phone, key)) ui[key] = phone[key];
    if (!['msg', 'mail', 'items', 'notes', 'boards', 'clips', 'list', 'menu'].includes(ui.tab)) ui.tab = 'msg';
    if (ui.chat && !contactVisible(ui.chat)) ui.chat = null;
    if (!S.items.includes(ui.item)) ui.item = null;
    if (!S.mails.includes(ui.mail)) ui.mail = null;
    ui.scroll ||= {}; ui.clueGroups ||= {}; ui.phoneOpen = narrow() && !!ui.phoneOpen;
    // Only reopen known applications and currently available files, never saved HTML.
    if (S.stage === 'win') for (const saved of Array.isArray(view.windows) ? view.windows : []) {
      const st = saved.state || {}, file = saved.file && D.files.find(f => f.id === saved.file);
      if (file) { if (!test(file.requires)) continue; openFile(file); }
      else if (saved.key === 'explorer') openExplorer(typeof st.path === 'string' ? st.path : '');
      else if (saved.key === 'ie' && test(D.apps.bbs?.requires)) openIE('/');
      else if (['gexun', 'diskfix', 'compare', 'map'].includes(saved.key) && D.apps[saved.key] && test(D.apps[saved.key].requires)) openApp(saved.key);
      else if (saved.key === 'display') openDisplay();
      else if (saved.key === 'recycle') openRecycle();
      else continue;
      const win = wins.find(w => w.key === saved.key); if (!win) continue;
      Object.assign(win.state, st);
      if (win.state.local?.id) win.state.local = D.files.find(f => f.id === win.state.local.id) || null;
      if (Object.hasOwn(win.state, 'playing')) win.state.playing = false;
      const rect = Array.isArray(saved.rect) ? saved.rect : [], dk = desktop();
      const width = Math.max(220, Math.min(Number(rect[2]) || 560, dk.clientWidth - 10));
      const height = Math.max(140, Math.min(Number(rect[3]) || 400, dk.clientHeight - 10));
      win.el.style.width = width + 'px'; win.el.style.height = height + 'px';
      win.el.style.left = Math.max(0, Math.min(Number(rect[0]) || 0, dk.clientWidth - width)) + 'px';
      win.el.style.top = Math.max(0, Math.min(Number(rect[1]) || 0, dk.clientHeight - height)) + 'px';
      win.toggleMax(narrow() || !!saved.max); win.refresh(true);
      const nodes = [win.body, ...win.body.querySelectorAll('*')];
      for (const pos of saved.scroll || []) if (nodes[pos.index]) { nodes[pos.index].scrollTop = pos.top; nodes[pos.index].scrollLeft = pos.left; }
      win.min = !!saved.min; win.el.hidden = win.min;
    }
    renderTasks(); $('#phone').classList.toggle('open', ui.phoneOpen); renderPhone();
    if (view.board && canOpenBoard(view.board)) openBoard(view.board);
  }
  function sessionScreen(value) {
    try {
      const key = 'y2k2_screen:' + location.pathname;
      if (value) sessionStorage.setItem(key, value);
      return sessionStorage.getItem(key);
    } catch (e) { return null; }
  }

  // ============================================================
  // 声音（WebAudio 合成，可关闭）
  // ============================================================
  let actx = null;
  function sfx(kind) {
    if (!S || !S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t = actx.currentTime;
      const tone = (f, d, at = 0, type = 'sine', vol = .06) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(.0001, t + at + d);
        o.connect(g).connect(actx.destination); o.start(t + at); o.stop(t + at + d + .02);
      };
      if (kind === 'msg') { tone(880, .12); tone(1320, .18, .1); }
      else if (kind === 'ok') { tone(660, .12); tone(880, .12, .1); tone(1175, .25, .2); }
      else if (kind === 'err') { tone(220, .25, 0, 'square', .04); }
      else if (kind === 'boot') { [523, 659, 784, 1047].forEach((f, i) => tone(f, 1.6 - i * .2, i * .22, 'triangle', .05)); }
      else if (kind === 'click') { tone(1800, .03, 0, 'square', .02); }
    } catch (e) { }
  }

  // ============================================================
  // 提示条
  // ============================================================
  function toast(text, kind) {
    const box = $('#toast'); if (!box) return;
    const el = h('div', { class: 'tst' + (kind ? ' ' + kind : ''), html: text });
    box.append(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 3800);
  }

  // ============================================================
  // 图标（像素风小 SVG）
  // ============================================================
  const ICONS = {
    diskfix: '<rect x="5" y="3" width="22" height="26" fill="#2b2b2b" stroke="#000"/><rect x="10" y="3" width="12" height="8" fill="#c0c0c0"/><rect x="9" y="16" width="14" height="11" fill="#fff"/><path d="M11 19h10M11 22h6" stroke="#d33" stroke-width="2"/>',
    floppy: '<rect x="5" y="3" width="22" height="26" fill="#1d4fa0" stroke="#000"/><rect x="10" y="3" width="12" height="8" fill="#c0c0c0"/><rect x="9" y="16" width="14" height="11" fill="#fff"/>',
    restore: '<circle cx="16" cy="16" r="11" fill="#fff" stroke="#1f5fbf" stroke-width="2"/><path d="M16 9v7l5 3" stroke="#1f5fbf" stroke-width="2" fill="none"/><path d="M4 10l2 6 6-3" fill="#2e9e46"/>',
    map: '<path d="M3 7l8-3 10 3 8-3v21l-8 3-10-3-8 3z" fill="#f4e7b5" stroke="#000"/><path d="M11 4v21M21 7v21" stroke="#000" fill="none"/><path d="M5 19c4-2 6 2 10 0s6-4 12-2" stroke="#2e9e46" stroke-width="2" fill="none"/><circle cx="17" cy="12" r="2.5" fill="#d33"/>',
    compare: '<rect x="3" y="5" width="12" height="22" fill="#fff" stroke="#000"/><rect x="17" y="5" width="12" height="22" fill="#fff" stroke="#000"/><rect x="5" y="12" width="8" height="3" fill="#f2c94c"/><rect x="19" y="12" width="8" height="3" fill="#f2c94c"/><rect x="5" y="18" width="8" height="3" fill="#e57373"/><rect x="19" y="21" width="8" height="3" fill="#81c784"/>',
    computer: '<rect x="4" y="4" width="24" height="17" fill="#c0c0c0" stroke="#000"/><rect x="7" y="7" width="18" height="11" fill="#008080"/><rect x="10" y="22" width="12" height="3" fill="#c0c0c0" stroke="#000"/><rect x="5" y="25" width="22" height="4" fill="#c0c0c0" stroke="#000"/>',
    folder: '<path d="M2 8h10l2 3h16v16H2z" fill="#f6d36b" stroke="#7a5c00"/><path d="M2 12h28v15H2z" fill="#ffe28a" stroke="#7a5c00"/>',
    drive: '<rect x="3" y="11" width="26" height="12" fill="#c0c0c0" stroke="#000"/><rect x="6" y="16" width="12" height="2" fill="#404040"/><rect x="23" y="15" width="3" height="3" fill="#0c0"/>',
    floppy: '<rect x="5" y="4" width="22" height="24" fill="#2b2b7a" stroke="#000"/><rect x="10" y="4" width="12" height="8" fill="#c0c0c0"/><rect x="18" y="5" width="3" height="6" fill="#2b2b7a"/><rect x="9" y="17" width="14" height="10" fill="#fff"/>',
    txt: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><path d="M20 3v5h5" fill="none" stroke="#000"/><path d="M10 12h12M10 15h12M10 18h12M10 21h9" stroke="#000080"/>',
    doc: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><path d="M20 3v5h5" fill="none" stroke="#000"/><rect x="10" y="11" width="12" height="9" fill="#1d55c4"/><text x="12" y="19" font-size="8" fill="#fff" font-family="Arial" font-weight="bold">W</text><path d="M10 23h12" stroke="#000"/>',
    img: '<rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#000"/><rect x="6" y="8" width="20" height="14" fill="#7ec0ff"/><path d="M6 22l7-8 5 5 3-3 5 6z" fill="#2f8a2f"/><circle cx="21" cy="12" r="2" fill="#ff0"/>',
    audio: '<rect x="3" y="8" width="26" height="17" rx="2" fill="#333" stroke="#000"/><rect x="6" y="10" width="20" height="5" fill="#f3edd8"/><circle cx="11" cy="20" r="3" fill="#ddd"/><circle cx="21" cy="20" r="3" fill="#ddd"/>',
    zip: '<rect x="6" y="4" width="20" height="24" fill="#f2c94c" stroke="#000"/><path d="M16 4v24" stroke="#000" stroke-dasharray="2 2"/><rect x="13" y="16" width="6" height="6" fill="#c0c0c0" stroke="#000"/>',
    exe: '<rect x="4" y="6" width="24" height="20" fill="#c0c0c0" stroke="#000"/><rect x="4" y="6" width="24" height="4" fill="#000080"/><rect x="8" y="14" width="16" height="2" fill="#000"/><rect x="8" y="18" width="10" height="2" fill="#000"/>',
    sys: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><circle cx="16" cy="18" r="5" fill="#c0c0c0" stroke="#000"/><circle cx="16" cy="18" r="2" fill="#fff" stroke="#000"/>',
    htm: '<path d="M7 3h13l5 5v21H7z" fill="#fff" stroke="#000"/><circle cx="16" cy="18" r="6" fill="#3a7bd5"/><path d="M10 18h12M16 12v12" stroke="#fff"/>',
    ie: '<circle cx="16" cy="16" r="11" fill="#3a7bd5" stroke="#0b2a6b"/><text x="10" y="22" font-size="17" font-family="Georgia" font-style="italic" font-weight="bold" fill="#fff">e</text><path d="M4 20c6-10 18-14 25-12" stroke="#f2c94c" stroke-width="2" fill="none"/>',
    pigeon: '<path d="M5 20c2-8 10-12 17-10l5-3-1 6c2 4 0 9-6 11H9z" fill="#e8eef7" stroke="#2b4a7a"/><circle cx="22" cy="12" r="1.3" fill="#000"/><path d="M27 12l3 1-3 1" fill="#f2a33a"/>',
    recycle: '<path d="M8 9h16l-2 19H10z" fill="#d9e6ef" stroke="#3a4a5a"/><rect x="6" y="6" width="20" height="3" fill="#b9c9d6" stroke="#3a4a5a"/><path d="M13 13v12M16 13v12M19 13v12" stroke="#7b8c9a"/>',
    recyclefull: '<path d="M8 9h16l-2 19H10z" fill="#d9e6ef" stroke="#3a4a5a"/><rect x="6" y="6" width="20" height="3" fill="#b9c9d6" stroke="#3a4a5a"/><path d="M11 9l3-5 4 3 4-4 1 6" fill="#fff" stroke="#555"/>',
    display: '<rect x="4" y="5" width="24" height="17" fill="#c0c0c0" stroke="#000"/><rect x="7" y="8" width="18" height="11" fill="#000"/><text x="9" y="16" font-size="6" fill="#ff0" font-family="Arial">abc</text><rect x="12" y="23" width="8" height="4" fill="#c0c0c0" stroke="#000"/>',
    help: '<circle cx="16" cy="16" r="11" fill="#fff" stroke="#000"/><text x="11" y="22" font-size="16" font-weight="bold" font-family="Arial" fill="#000080">?</text>',
    win: '<rect x="4" y="5" width="11" height="10" fill="#e33"/><rect x="17" y="5" width="11" height="10" fill="#3b3"/><rect x="4" y="17" width="11" height="10" fill="#36f"/><rect x="17" y="17" width="11" height="10" fill="#fc3"/>',
    lock: '<rect x="18" y="20" width="12" height="10" fill="#f2c94c" stroke="#000"/><path d="M20 20v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#000" stroke-width="2"/>',
    shutdown: '<rect x="5" y="6" width="22" height="16" fill="#c0c0c0" stroke="#000"/><rect x="8" y="9" width="16" height="10" fill="#000080"/><rect x="11" y="23" width="10" height="4" fill="#c0c0c0" stroke="#000"/>',
    notepad: '<rect x="6" y="4" width="20" height="25" fill="#fff" stroke="#000"/><path d="M6 4h20v4H6z" fill="#7aa7e0"/><path d="M9 12h14M9 15h14M9 18h14M9 21h10" stroke="#555"/>',
  };
  const TYPEICON = { folder: 'folder', txt: 'txt', log: 'txt', ini: 'sys', bat: 'sys', bak: 'sys', dat: 'sys', sys: 'sys', doc: 'doc', htm: 'htm', img: 'img', audio: 'audio', zip: 'zip', exe: 'exe', lnk: 'exe' };
  const TYPENAME = { folder: _t('文件夹'), txt: _t('文本文档'), log: _t('日志文件'), ini: _t('配置设置'), bat: _t('MS-DOS 批处理程序'), bak: _t('BAK 文件'), dat: _t('DAT 文件'), sys: _t('系统文件'), doc: _t('写字板文档'), htm: _t('HTML 文档'), img: _t('位图图像'), audio: _t('波形声音'), zip: _t('ZIP 压缩文件'), exe: _t('应用程序'), lnk: _t('快捷方式') };
  function icon(name, locked) {
    return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${ICONS[name] || ICONS.txt}${locked ? ICONS.lock : ''}</svg>`;
  }
  const PHICON = {
    clips: '<rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 10l5-3v10l-5-3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3.5 6l1 1 2-2M3.5 12l1 1 2-2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="5" cy="18" r="1.3" fill="currentColor"/>',
    msg: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    items: '<path d="M4 8l8-4 8 4v9l-8 4-8-4z M4 8l8 4 8-4 M12 12v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    notes: '<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.8"/>',
    boards: '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="9" r="1.6" fill="currentColor"/><circle cx="16" cy="14" r="1.6" fill="currentColor"/><path d="M8 9l8 5" stroke="currentColor" stroke-width="1.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 18h2" stroke="currentColor" stroke-width="1.8"/>',
  };
  const phIcon = (k) => `<svg viewBox="0 0 24 24">${PHICON[k]}</svg>`;

  // ============================================================
  // 时间
  // ============================================================
  function machineNow() {
    const m = /^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d)/.exec(S.clock || '1900-01-01 00:00');
    return { y: +m[1], mo: +m[2], d: +m[3], hm: `${m[4]}:${m[5]}` };
  }
  // Narrative dates advance only at story events, independently of real play time.
  function sceneTime() { return S.clock || '2026-12-20 21:30'; }
  function phoneTime(value) {
    const [ymd, hm] = value.split(' '), [y, M, Dd] = ymd.split('-').map(Number);
    const w = new Date(Date.UTC(y, M - 1, Dd)).getUTCDay();
    const date = LANG === 'en' ? `${'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[M - 1]} ${Dd}` : `${M}月${Dd}日`;
    const wk = LANG === 'en' ? 'Sun Mon Tue Wed Thu Fri Sat'.split(' ')[w] : LANG === 'ja' ? '(' + '日月火水木金土'[w] + ')' : '周' + '日一二三四五六'[w];
    return { date, hm, wk };
  }
  function phoneNow() { return phoneTime(sceneTime()); }
  function chatTimestamp(m) {
    if (/^\d{4}-\d\d-\d\d \d\d:\d\d$/.test(m.sceneAt || '')) return m.sceneAt;
    const raw = String(m.at || '');
    let p = /^(\d{1,2})月(\d{1,2})日 (\d\d:\d\d)$/.exec(raw);
    if (!p) {
      const en = /^([A-Z][a-z]{2}) (\d{1,2}) (\d\d:\d\d)$/.exec(raw);
      const month = en && 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ').indexOf(en[1]) + 1;
      if (month) p = [raw, month, en[2], en[3]];
    }
    if (!p) return null;
    const start = D.chapters[0].date, year = +start.slice(0, 4) + (+p[1] < +start.slice(5, 7) ? 1 : 0);
    return `${year}-${pad(+p[1])}-${pad(+p[2])} ${p[3]}`;
  }
  function chatTime(m) { const at = chatTimestamp(m); return at ? phoneTime(at) : { date: '', hm: '' }; }
  function chatListTime(m) {
    if (!m) return '';
    const t = chatTime(m), at = chatTimestamp(m);
    return at && at.slice(0, 10) !== sceneTime().slice(0, 10) ? t.date : t.hm;
  }
  function repairChatTimes() {
    // A later message is an upper bound for earlier ones. Keep order and content;
    // only clamp impossible future timestamps left by the former wall clock.
    for (const log of Object.values(S.chat || {})) {
      let ceiling = sceneTime();
      for (let i = log.length - 1; i >= 0; i--) {
        const m = log[i], at = chatTimestamp(m); if (!at) continue;
        m.sceneAt = at > ceiling ? ceiling : at; ceiling = m.sceneAt;
        const t = phoneTime(m.sceneAt); m.at = `${t.date} ${t.hm}`;
      }
    }
    S.chatTimeVersion = 1;
  }

  // ============================================================
  // 全局浮层：章节卡、结局、推理板、看图
  // ============================================================
  function overlay() { return $('#overlay'); }
  let overlayCleanup = null;
  function openOverlay(el, cleanup) { closeOverlay(); const o = overlay(); o.append(el); o.classList.add('on'); overlayCleanup = cleanup || null; }
  function closeOverlay() {
    const cleanup = overlayCleanup; overlayCleanup = null;
    const o = overlay(); if (o) { o.classList.remove('on'); o.innerHTML = ''; }
    if (cleanup) cleanup();
  }
  let cardOn = false;
  function showCards() {
    if (cardOn || !cardQ.length || titleOn || awaitingPuzzleFeedback() || overlay().classList.contains('on')) return;
    const c = cardQ.shift(); cardOn = true;
    const el = h('div', { class: 'card', tabindex: 0 },
      h('div', { class: 'num', text: c.num }),
      h('h1', { text: c.name }),
      h('div', { class: 'date', text: c.date.replace(/-/g, ' . ') }),
      c.intro ? h('div', { class: 'intro', html: fmt(c.intro) }) : null,
      h('div', { class: 'go', text: _t('点击继续') }));
    const go = () => { cardOn = false; closeOverlay(); showCards(); renderAll(); if (!cardOn) nudgeReplies(); };
    bindControl(el, go); el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    openOverlay(el); el.focus();
  }
  function nudgeReplies() {
    const who = Object.keys(S.wait || {}).filter(c => S.wait[c] && S.wait[c].type !== 'wait' && D.contacts2018[c]).map(c => contactInfo(c).name);
    if (who.length) toast(who.join('、') + _t(' 在等你回复。打开手机里的「消息」，点对话底部的回复。'));
  }
  function showEnding(id, restoring = false) {
    const e = D.endings[id]; if (!e) return;
    tickPlay(); playClockRunning = false;
    window.Y2KLeaderboard?.capture(S, id);
    if (!restoring && preEndSnap) LS.set(KEY.pre, preEndSnap);
    S.activeEnding = id;
    setFlag('ending_' + id);
    if (!S.ends) S.ends = [];
    if (!S.ends.includes(id)) S.ends.push(id);
    const m = meta(); m.endings = m.endings || {}; if (!m.endings[id]) m.endings[id] = Date.now();
    if (id === 'B' && S.flags.route_live) m.revisedBroadcast = true;
    setMeta(m);
    writeSave('auto');
    const previous = readSave('pre');
    const sameRun = previous && (S.runId ? previous.runId === S.runId : previous.created === S.created);
    const exitEnding = () => { S.activeEnding = null; closeOverlay(); syncPlayClock(); dirty(); };
    const el = endingPage(id, [
        e.next && !S.flags.c8_begin ? h('button', { class: 'tbtn', text: _t('进入尾声'), onclick: () => { exitEnding(); act(e.next); } }) : null,
        (id === 'H' || (id === 'C' && S.flags.c8_begin)) ? h('button', { class: 'tbtn', text: _t('回到读盘机'), onclick: () => { exitEnding(); renderAll(); showCards(); } }) : null,
        S.programmeCheckpoint ? h('button', { class: 'tbtn', text: _t('回到填写节目单时'), onclick: () => loadState(S.programmeCheckpoint) }) : null,
        sameRun ? h('button', { class: 'tbtn', text: _t('回到结局前继续'), onclick: () => loadState(previous) }) : null,
        h('button', { class: 'tbtn', text: _t('返回标题画面'), onclick: () => { closeOverlay(); showTitle(); } })], S.player, id === 'B' && !S.flags.route_live);
    sfx('boot');
    openOverlay(el, bindEndingMemory(el));
    window.Y2KLeaderboard?.requestReview(el, S, id, LANG, () => writeSave('auto'));
  }
  function endingEdition(id, historical) {
    if (id === 'B' && historical && D.previousBroadcastEnding) return D.previousBroadcastEnding;
    return D.endings[id];
  }
  function bindEndingMemory(el) {
    const sequence = el.querySelector('[data-memory-scroll]');
    if (!sequence) return () => {};
    const frame = sequence.querySelector('.ending-memory');
    const image = frame.querySelector('svg');
    const fullLabel = image.getAttribute('aria-label');
    let queued = 0;
    const update = () => {
      queued = 0;
      if (!el.isConnected) return;
      const bounds = image.getBoundingClientRect();
      const relativeTop = bounds.top - el.getBoundingClientRect().top;
      // The photo stays in normal flow and starts fading when it first fits.
      const start = Math.max(0, el.clientHeight - bounds.height - 8);
      // Complete the crossfade while the moving photo is still fully visible.
      const distance = Math.max(48, Math.min(bounds.height * .45, start * .85));
      const travel = (start - relativeTop) / distance;
      const t = Math.max(0, Math.min(1, travel));
      const progress = t * t * (3 - 2 * t);
      sequence.style.setProperty('--memory-progress', progress.toFixed(4));
      sequence.style.setProperty('--memory-hint', Math.max(0, Math.min(1, 1 - travel * 5)).toFixed(4));
      image.setAttribute('aria-label', progress > .99 ? '同一帧旧照片，小川的位置空了，其他四人仍抬头看着烟花' : fullLabel);
    };
    const schedule = () => { if (!queued) queued = requestAnimationFrame(update); };
    el.addEventListener('scroll', schedule, {passive: true});
    const observer = new ResizeObserver(schedule);
    observer.observe(el); observer.observe(frame);
    schedule();
    return () => { el.removeEventListener('scroll', schedule); observer.disconnect(); cancelAnimationFrame(queued); };
  }
  function endingPage(id, actions, player, historical) {
    const e = endingEdition(id, historical);
    const names = { A: _t('结局 A'), B: _t('结局 B'), C: _t('结局 C'), D: _t('结局 D'), H: _t('隐藏结局') };
    return h('div', { class: 'ending' }, h('div', { class: 'in2' },
      h('div', { class: 'num', text: names[id] || _t('结局') }),
      h('h1', { text: e.title }),
      h('div', { class: 'body', html: fmt(e.html, player) }),
      h('div', { class: 'acts' }, actions)));
  }
  function replayEnding(id, opener) {
    // 回看只读取解锁记录，不能重新触发结局、存档或成绩提交。
    if (!meta().endings?.[id] || !D.endings[id] || $('.ending-replay')) return;
    tickPlay(); playClockRunning = false;
    let cleanupMemory = () => {};
    const close = () => { cleanupMemory(); el.remove(); syncPlayClock(); if (opener?.isConnected) opener.focus({ preventScroll: true }); };
    const back = controlButton({ class: 'tbtn', text: _t('返回') }, close);
    const el = endingPage(id, [back], S?.player || readSave('auto')?.player || '你', !meta().revisedBroadcast);
    el.classList.add('ending-replay');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'ending-replay-heading');
    el.querySelector('h1').id = 'ending-replay-heading';
    const closeBtn = controlButton({ class: 'tbtn ending-replay-close', text: '×', 'aria-label': _t('关闭') }, close);
    el.prepend(closeBtn);
    el.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === closeBtn) { event.preventDefault(); back.focus(); }
        else if (!event.shiftKey && document.activeElement === back) { event.preventDefault(); closeBtn.focus(); }
      }
    });
    document.body.append(el); cleanupMemory = bindEndingMemory(el); closeBtn.focus({ preventScroll: true });
  }
  function imageSize(root) {
    const svg = root.querySelector('svg'), img = root.querySelector('img');
    const vb = svg && svg.viewBox.baseVal;
    const w = (vb && vb.width) || (img && (img.naturalWidth || img.width)) || 640;
    const hh = (vb && vb.height) || (img && (img.naturalHeight || img.height)) || 480;
    return root.querySelector('.photo') ? { w: w + 20, h: hh + 38 } : { w, h: hh };
  }
  function bindImageZoom(root) {
    root.querySelectorAll('table').forEach(table => {
      const scroll = h('div', { class: 'table-scroll', tabindex: 0, 'aria-label': _t('表格，可左右滚动查看') });
      table.before(scroll); scroll.append(table);
    });
    root.querySelectorAll('svg, img').forEach(img => {
      img.style.cursor = 'zoom-in'; img.setAttribute('role', 'button'); img.setAttribute('tabindex', '0'); img.setAttribute('aria-label', _t('放大图片'));
      const open = () => viewImage(img.outerHTML);
      bindControl(img, open);
      img.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
    });
  }
  function viewImage(html, file) {
    const previousFocus = document.activeElement;
    const canvas = h('div', { class: 'viewer-canvas', html });
    canvas.querySelectorAll('[tabindex]').forEach(el => { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); el.style.cursor = ''; });
    const size = imageSize(canvas);
    const area = h('div', { class: 'viewer-scroll', tabindex: 0, 'aria-label': _t('图片，可滚动查看') }, canvas);
    const value = h('output', { 'aria-live': 'polite' });
    let scale = 1, fitMode = true;
    const resize = (z, center = true) => {
      const oldW = canvas.offsetWidth || size.w, oldH = canvas.offsetHeight || size.h;
      const cx = (area.scrollLeft + area.clientWidth / 2) / oldW, cy = (area.scrollTop + area.clientHeight / 2) / oldH;
      scale = Math.max(.05, Math.min(4, z));
      canvas.style.width = Math.round(size.w * scale) + 'px';
      value.textContent = Math.round(scale * 100) + '%';
      minus.disabled = scale <= .05; plus.disabled = scale >= 4;
      area.classList.toggle('pannable', canvas.offsetWidth > area.clientWidth - 32 || canvas.offsetHeight > area.clientHeight - 32);
      area.scrollLeft = center ? cx * canvas.offsetWidth - area.clientWidth / 2 : 0;
      area.scrollTop = center ? cy * canvas.offsetHeight - area.clientHeight / 2 : 0;
    };
    const fit = () => { fitMode = true; resize(Math.min(1, Math.max(1, area.clientWidth - 32) / size.w, Math.max(1, area.clientHeight - 32) / size.h), false); };
    const zoom = factor => { fitMode = false; resize(scale * factor); };
    const minus = controlButton({ class: 'ph-btn', text: _t('缩小 −') }, () => zoom(1 / 1.25));
    const plus = controlButton({ class: 'ph-btn', text: _t('放大 +') }, () => zoom(1.25));
    const close = () => { closeOverlay(); showCards(); };
    const closeBtn = controlButton({ class: 'ph-btn viewer-close', text: _t('关闭'), title: 'Esc' }, close);
    const toolbar = h('div', { class: 'viewer-toolbar' }, minus, plus, value,
      controlButton({ class: 'ph-btn', text: _t('适应窗口') }, fit),
      controlButton({ class: 'ph-btn', text: _t('原始大小') }, () => { fitMode = false; resize(1); }),
      file && file.documentPhoto && file.caption ? controlButton({ class: 'ph-btn', text: _t('照片说明') }, () => msgBox(_t('照片说明'), fmt(file.caption), null, true)) : null,
      file ? controlButton({ class: 'ph-btn', text: _t('属性') }, () => showProps(file, true)) : null, closeBtn);
    const caption = file && file.caption && !file.documentPhoto ? h('div', { class: 'viewer-caption', html: fmt(file.caption) }) : null;
    const panel = h('div', { class: 'viewer-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': _t('图像查看器') }, toolbar, area, caption);
    const el = h('div', { class: 'viewer', onclick: e => { if (e.target === el) close(); } }, panel);
    if (file) bindCtx(area, () => [[_t('属性'), () => showProps(file, true)]], null, overlay());
    panel.onkeydown = e => {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(1.25); }
      if (e.key === '-') { e.preventDefault(); zoom(1 / 1.25); }
      if (e.key === '0') { e.preventDefault(); fit(); }
      if (e.key === 'Tab') {
        const stops = [...panel.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
        if (e.shiftKey && document.activeElement === stops[0]) { e.preventDefault(); stops[stops.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === stops[stops.length - 1]) { e.preventDefault(); stops[0].focus(); }
      }
    };
    area.addEventListener('wheel', e => { if (e.ctrlKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); } }, { passive: false });
    area.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !area.classList.contains('pannable')) return;
      e.preventDefault(); area.setPointerCapture(e.pointerId); area.classList.add('dragging');
      const x = e.clientX, y = e.clientY, left = area.scrollLeft, top = area.scrollTop;
      const move = ev => { area.scrollLeft = left + x - ev.clientX; area.scrollTop = top + y - ev.clientY; };
      const stop = () => { area.classList.remove('dragging'); area.removeEventListener('pointermove', move); area.removeEventListener('pointerup', stop); area.removeEventListener('pointercancel', stop); };
      area.addEventListener('pointermove', move); area.addEventListener('pointerup', stop); area.addEventListener('pointercancel', stop);
    });
    const observer = new ResizeObserver(() => { if (fitMode) fit(); });
    openOverlay(el, () => { observer.disconnect(); if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true }); });
    fit(); observer.observe(area); closeBtn.focus({ preventScroll: true });
  }

  // ============================================================
  // 谜题
  // ============================================================
  function solved(id) { return !!S.flags['solved_' + id]; }
  function checkPuzzle(p, val) {
    const kind = p.kind || 'text';
    if (kind === 'text') return (p.answers || []).some(a => norm(a) === norm(val));
    if (kind === 'choice') return val === p._ai;
    if (kind === 'pick') { const set = new Set(val); return set.size === p._as.length && p._as.every(a => set.has(a)); }
    if (kind === 'multi') return p.fields.every((f, i) => (f.answers || []).some(a => norm(a) === norm(val[i])));
    return false;
  }
  function solvePuzzle(id) {
    const p = D.puzzles[id];
    if (solved(id)) return;
    setFlag('solved_' + id);
    act(p.onSolve);
    sfx('ok');
    dirty();
  }
  // Puzzle assistance stays beside the answer controls, separate from general Help.
  function puzzleHints(key, p, buttonClass = 'b98') {
    const box = h('div', { class: 'hints inline-hints', 'data-hints': key });
    const count = (p.hints || []).length;
    const used = () => Math.min(count, Math.max(0, Number(S.hints[key]) || 0));
    const button = controlButton({ class: buttonClass + ' hint-next', 'data-hint-for': key }, () => {
      if (!test(p.requires) || used() >= count) return;
      S.hints[key] = used() + 1; draw(); dirty();
    });
    function draw() {
      const available = test(p.requires); box.innerHTML = ''; button.hidden = !available || !count;
      if (available) (p.hints || []).slice(0, used()).forEach((text, i) => box.append(h('div', { class: 'hintbox', html: `<b>${_t('提示')} ${i + 1}：</b>${fmt(text)}` })));
      button.textContent = used() >= count ? _t('提示已用完') : used() === count - 1 ? _t('看答案') : `${_t('提示')}（${used()}/${count}）`;
      button.disabled = used() >= count;
    }
    draw(); return { box, button };
  }
  function awaitingPuzzleFeedback() { return !!document.querySelector('.pz[data-awaiting-ack]'); }
  // 返回一个谜题表单元素。opts: {style:'w98'|'bios'|'login'|'bbs', onSolved, submitLabel}
  function puzzleForm(id, opts = {}) {
    const p = D.puzzles[id];
    if (!p) return h('div', { text: _t('（缺少谜题 ') + id + '）' });
    const kind = p.kind || 'text';
    const box = h('div', { class: 'pz' });
    const prompt = h('div', { class: 'prompt', html: fmt(p.prompt || '') });
    const msg = h('div', { class: 'msg', role: 'status', 'aria-live': 'polite' });
    let getVal, focusEl;
    const inputs = h('div');
    if (kind === 'text') {
      const inp = h('input', { class: opts.style === 'bios' ? '' : 'f98', type: 'text', id: 'pz_' + id, placeholder: opts.placeholder || p.placeholder || '', autocomplete: 'off', spellcheck: 'false', style: { width: '100%' } });
      inp.onkeydown = (e) => { if (confirmInput(e)) submit(); };
      inputs.append(inp); getVal = () => inp.value; focusEl = inp;
    } else if (kind === 'choice' || kind === 'pick') {
      const wrap = h('div', { class: 'opts' });
      p.options.forEach((o, i) => {
        const input = h('input', { type: kind === 'choice' ? 'radio' : 'checkbox', name: 'pz_' + id, value: i, id: `pz_${id}_${i}` });
        wrap.append(bindChoice(h('label', {}, input, h('span', { html: fmt(o) })), input));
      });
      if (kind === 'pick') wrap.append(h('div', { class: 'selection-count', text: `${_t('（选择')} ${p.answerSet.length} ${_t('项）')}` }));
      inputs.append(wrap);
      getVal = () => { const sel = [...wrap.querySelectorAll('input:checked')].map(x => +x.value); return kind === 'choice' ? sel[0] : sel; };
    } else if (kind === 'multi') {
      const g = h('div', { class: 'fields' });
      const ins = p.fields.map((f, i) => { const inp = h('input', { class: 'f98', type: 'text', id: `pz_${id}_${i}`, autocomplete: 'off', placeholder: f.placeholder || '' }); inp.onkeydown = (e) => { if (confirmInput(e)) submit(); }; g.append(h('label', { for: `pz_${id}_${i}`, html: fmt(f.label) }), inp); return inp; });
      inputs.append(g); getVal = () => ins.map(x => x.value); focusEl = ins[0];
    }
    // 锁的谜题属于还没开始的章节：拒绝任何答案，也不给提示（避免提示提前泄露答案）
    const early = !!(p.requires && (p.requires.match(/\bch\d\b/g) || []).some(c => !S.flags[c]));
    const hints = puzzleHints(id, p, opts.style === 'bios' ? '' : 'b98');
    const okBtn = controlButton({ class: opts.style === 'bios' ? '' : 'b98', text: opts.submitLabel || _t('确定') }, submit);
    const ackBtn = controlButton({ class: opts.style === 'bios' ? '' : 'b98', text: opts.extraBtn ? _t('关闭') : _t('继续'), 'data-puzzle-ack': id }, () => box.acknowledge());
    ackBtn.hidden = true;
    box.acknowledge = () => {
      if (!box.hasAttribute('data-awaiting-ack')) return;
      box.removeAttribute('data-awaiting-ack');
      ackBtn.disabled = true;
      if (opts.onSolved) opts.onSolved();
      dirty();
    };
    let submitted = false;
    function submit() {
      if (submitted) return;
      markInteraction();
      const v = getVal();
      if (v == null || (Array.isArray(v) ? !v.length || v.every(x => !String(x).trim()) : !String(v).trim())) { msg.textContent = _t('请先作答。'); return; }
      if (!early && checkPuzzle(p, v)) {
        submitted = true; okBtn.disabled = true;
        box.setAttribute('data-awaiting-ack', id);
        inputs.querySelectorAll('input').forEach(input => { input.disabled = true; });
        hints.button.hidden = true;
        if (opts.extraBtn) opts.extraBtn.hidden = true;
        okBtn.hidden = true; ackBtn.hidden = false;
        msg.className = 'msg ok'; msg.innerHTML = fmt(p.solvedText || _t('正确。'));
        if (opts.onAnswer) opts.onAnswer(v);
        solvePuzzle(id);
        save('auto');
      } else {
        sfx('err');
        let t = early ? _t('密码错误。') : (p.wrongText || opts.wrongText || _t('不对。'));
        if (!early && p.near) { const vals = kind === 'multi' ? v : kind === 'text' ? [v] : []; for (const [k, tx] of Object.entries(p.near)) if (vals.some(x => norm(k) === norm(x))) t = tx; }
        msg.className = 'msg'; msg.innerHTML = fmt(t);
        opts.onWrong && opts.onWrong();
      }
    }
    if (!opts.hidePrompt) box.append(prompt);
    box.append(inputs, msg, hints.box, h('div', { class: 'row' }, hints.button, opts.extraBtn || null, okBtn, ackBtn));
    box.focusFirst = () => { if (focusEl && !touchKeyboard()) focusEl.focus(); };
    return box;
  }
  function modalRoot() { return $('#modal'); }
  function closeModal(acknowledge = true) {
    const m = modalRoot(), feedback = m && m.querySelector('.pz[data-awaiting-ack]');
    if (m) m.innerHTML = '';
    // Clear the old dialog first: its completion callback may open another one.
    if (acknowledge && feedback) feedback.acknowledge();
  }
  function askPuzzle(id, onSolved, phoneStyle, contact) {
    const p = D.puzzles[id];
    if (!p) return toast(_t('缺少谜题 ') + id);
    if (solved(id)) { onSolved && onSolved(); return; }
    if (p.kind === 'mark') { if (narrow()) togglePhone(false); return openCompare({ puzzle: id }); }
    if (p.kind === 'map') { if (narrow()) togglePhone(false); return openMap({ puzzle: id }); }
    if (p.kind === 'frame') { ui.tab = 'clips'; ui.clip = p.clip; ui.framePuzzle = id; ui.frameSel = null; ui.frameMsg = ''; if (narrow()) togglePhone(true); else renderPhone(); return; }
    if (p.kind === 'chain') { if (narrow()) togglePhone(false); return openDiskFix({ puzzle: id }); }
    const m = modalRoot(); m.innerHTML = '';
    const shade = h('div', { class: 'shade', onclick: () => closeModal() });
    const dlg = h('div', { class: phoneStyle ? 'dlg98 dlgph' : 'dlg98 out', role: 'dialog' });
    const form = puzzleForm(id, { onSolved: () => { if (form.isConnected) closeModal(); onSolved && onSolved(); }, onAnswer: value => {
      const cur = contact && curDlg(contact);
      if (!cur || !S.wait[contact] || S.wait[contact].id !== id) return;
      const text = p.kind === 'choice' ? p.options[value] : p.kind === 'pick' ? value.map(i => p.options[i]).join('、') : Array.isArray(value) ? value.join('，') : String(value).trim();
      pushChat(contact, { from: 'me', text });
    }, onWrong: () => { dlg.classList.remove('shake'); void dlg.offsetWidth; dlg.classList.add('shake'); }, extraBtn: controlButton({ class: 'b98', text: _t('取消') }, closeModal) });
    dlg.append(h('div', { class: 'titlebar' }, h('span', { html: icon('lock') }), h('span', { class: 't', text: p.title || _t('需要密码') }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭'), text: '×' }, closeModal)), h('div', { class: 'wbody' }, form));
    m.append(shade, dlg);
    form.focusFirst();
  }
  function msgBox(title, html, buttons, aboveOverlay) {
    const m = modalRoot(); m.innerHTML = '';
    const dlg = h('div', { class: 'dlg98 out' + (aboveOverlay ? ' raised' : ''), role: 'dialog' });
    const row = h('div', { class: 'row' });
    (buttons || [{ text: _t('确定') }]).forEach(b => row.append(controlButton({ class: 'b98', text: b.text }, () => { closeModal(); b.fn && b.fn(); })));
    dlg.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: title }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭'), text: '×' }, closeModal)), h('div', { class: 'wbody' }, h('div', { class: 'prompt', html }), row));
    m.append(h('div', { class: 'shade' + (aboveOverlay ? ' raised' : ''), onclick: () => closeModal() }), dlg);
  }
  // 带锁的东西：先解谜再执行
  function withLock(lock, fn) { if (!lock || solved(lock)) return fn(); askPuzzle(lock, fn); }

  // ============================================================
  // 推理板
  // ============================================================
  function canOpenBoard(id) {
    const board = D.boards[id];
    return !!board && (!!S.flags['board_' + id] || test(board.requires));
  }
  function originalForBoard(id) {
    if (S.items.includes(id)) return {type: 'item', id};
    if (S.mails.includes(id)) return {type: 'mail', id};
    if (D.footage.clips.some(clip => clip.id === id)) return {type: 'clip', id};
    if (D.files.some(file => file.id === id && test(file.requires))) return {type: 'file', id};
    if (D.gxLogs.some(log => log.id === id)) return {type: 'gx', id};
    if (/^t\d+$/.test(id)) return {type: 'url', value: '/thread.asp?id=' + id.slice(1)};
    if (D.mails.some(mail => mail.id === id)) return {type: 'url', value: '/admin/mail.asp?id=' + encodeURIComponent(id)};
    return null;
  }
  function lockedBoardCard(id, board) {
    const card = h('div', {class:'ph-card', 'data-locked-board':id}, h('div', {class:'k', text:_t('尚未解锁')}), h('strong', {text:board.title}));
    if (!test(board.investigationRequires)) {
      card.append(h('p', {text:_t('本章调查仍在进行。')}));
      return card;
    }
    const missing = board.requiredSources.filter(sid => !S.flags['seen_' + sid]);
    card.append(h('p', {text:'还有 ' + missing.length + ' 份原件没看过。看完就能填这张推理板了。'}));
    const sid = missing.find(id => originalForBoard(id));
    if (sid) {
      const source = originalForBoard(sid);
      const mail = D.mails.find(m => m.id === sid);
      const owner = D.files.find(f => f.id === sid)?.evidenceOwner;
      const log = D.gxLogs.find(log => log.id === sid);
      const label = log ? '鸽讯 · ' + log.date : mail ? '站内信 · ' + mail.subject : (owner ? owner + '的' : '') + hhSourceLabel(sid);
      const lead = h('details', {class:'ph-facts'}, h('summary', {text:_t('找一条线索')}));
      lead.open = ui.boardLead === id;
      lead.ontoggle = () => { if (lead.isConnected) ui.boardLead = lead.open ? id : null; };
      lead.append(h('button', {class:'ph-source', type:'button', 'data-unread-source':sid, text:label, onclick:() => {
        ui.boardLead = null;
        ui.returnBoard = ['mail', 'item', 'clip'].includes(source.type) ? id : null;
        goEvidence(source);
      }}));
      card.append(lead);
    }
    return card;
  }
  function openBoard(id) {
    if (!canOpenBoard(id)) return;
    const b = D.boards[id];
    const fill = S.boardFill[id] = S.boardFill[id] || {};
    let active = null;
    const done = () => !!S.flags['board_' + id];
    const wrap = h('div', { class: 'board', 'data-board': id });
    const sheet = h('div', { class: 'sheet' });
    wrap.append(sheet);
    const mobileLayout = window.matchMedia('(max-width: 960px)');
    const choicesId = 'board-choices-' + id;
    const slotButton = key => sheet.querySelector('[data-s="' + key + '"]');
    const close = () => { closeOverlay(); showCards(); renderAll(); };
    function dismissChoices() {
      const key = active;
      active = null;
      draw();
      slotButton(key)?.focus({ preventScroll: true });
    }
    function selectSlot(key) {
      if (done()) return;
      if (mobileLayout.matches && active === key) return dismissChoices();
      active = key;
      draw();
      if (!mobileLayout.matches) return;
      const slot = slotButton(key);
      const picker = sheet.querySelector('.board-picker');
      const overlap = slot.getBoundingClientRect().bottom + 12 - picker.getBoundingClientRect().top;
      if (overlap > 0) wrap.scrollTop += overlap;
      const bank = picker.querySelector('.bank');
      const divider = slot.classList.contains('srcslot') && bank.querySelector('.bank-sep');
      if (divider) bank.scrollTop += divider.getBoundingClientRect().top - bank.getBoundingClientRect().top;
      const choice = divider ? divider.nextElementSibling : bank.querySelector('.chip');
      choice?.focus({ preventScroll: true });
    }
    wrap.addEventListener('click', e => {
      if (e.target === wrap) {
        if (mobileLayout.matches && active) dismissChoices();
        else close();
      }
    });
    wrap.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !mobileLayout.matches || !active) return;
      e.preventDefault();
      e.stopPropagation();
      dismissChoices();
    });
    function draw() {
      const compact = mobileLayout.matches;
      const scroll = wrap.scrollTop;
      wrap.classList.toggle('choosing', compact && !!active && !done());
      sheet.innerHTML = '';
      const W = boardWords(b);
      const slotsInText = [...b.text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(m => m[1]).filter(s => s !== 'player');
      const html = fmt(b.text).replace(/\{([A-Za-z0-9_]+)\}/g, (m, s) => b.slots[s] ? `<button class="slot" data-s="${s}"></button>` : m);
      const txt = h('div', { class: 'txt', html });
      txt.querySelectorAll('.slot').forEach(el => {
        const s = el.dataset.s; const w = fill[s] || (done() ? [].concat(b.slots[s])[0] : null);
        el.textContent = w ? (W[w] || '？') : (String([].concat(b.slots[s])[0]).startsWith('src:') ? _t('〔依据〕') : '＿＿＿＿');
        el.classList.toggle('srcslot', String([].concat(b.slots[s])[0]).startsWith('src:'));
        el.classList.toggle('empty', !w);
        el.classList.toggle('act', active === s);
        if (compact && !done()) {
          el.setAttribute('aria-controls', choicesId);
          el.setAttribute('aria-expanded', String(active === s));
          const kind = el.classList.contains('srcslot') ? _t('原件') : _t('词语');
          el.setAttribute('aria-label', '第' + (slotsInText.indexOf(s) + 1) + '空，' + kind + (w ? '，' + el.textContent : ''));
        }
        bindControl(el, () => selectSlot(s));
        el.oncontextmenu = (e) => { e.preventDefault(); if (done()) return; delete fill[s]; lastRes = null; draw(); dirty(); };
        el.ondragover = (e) => { e.preventDefault(); el.classList.add('drop'); };
        el.ondragleave = () => el.classList.remove('drop');
        el.ondrop = (e) => { e.preventDefault(); const w2 = e.dataTransfer.getData('text/plain'); if (W[w2] && !done()) { fill[s] = w2; active = null; lastRes = null; draw(); dirty(); } };
      });
      const res = h('div', { class: 'res' });
      const bar = h('div', { class: 'bar' }, res);
      const hints = puzzleHints('board_' + id, b, 'bbtn');
      if (!done()) {
        bar.append(
          hints.button,
          h('button', { class: 'bbtn', text: _t('清空'), onclick: () => { for (const k in fill) delete fill[k]; active = null; lastRes = null; draw(); dirty(); } }),
          h('button', { class: 'bbtn pri', text: _t('检查'), onclick: () => check(res) }));
      }
      bar.append(h('button', { class: 'bbtn', text: _t('关闭'), onclick: close }));
      sheet.append(h('h2', { text: b.title }), h('p', { class: 'intro', text: _t(compact ? '点空格，选词语或原件。' : '先点空格，再选词语或原件。也可以直接拖进空格。') }));
      if (done()) sheet.append(h('div', { class: 'solved', html: (id === 'c4_final' ? _t('已整理，仍待核验。') : _t('✔ 推理成立。')) + (b.solvedText ? '<br>' + fmt(b.solvedText) : '') }));
      sheet.append(hints.box, bar, txt);
      if (!done()) {
        const bank = h('div', { class: 'bank' });
        let sourceHeadingAdded = false;
        Object.entries(W).sort((a, c) => (a[0].startsWith('src:') ? 1 : 0) - (c[0].startsWith('src:') ? 1 : 0) || a[1].localeCompare(c[1], 'zh-CN', {numeric:true})).forEach(([wid, label]) => {
          if (wid.startsWith('src:') && !sourceHeadingAdded) {
            bank.append(h('div', { class: 'bank-sep', text: _t('原件') }));
            sourceHeadingAdded = true;
          }
          const chip = h('button', { class: 'chip' + (wid.startsWith('src:') ? ' src' : ''), draggable: compact ? 'false' : 'true', text: label });
          chip.ondragstart = (e) => e.dataTransfer.setData('text/plain', wid);
          bindControl(chip, () => {
            const s = active || slotsInText.find(slot => !fill[slot]);
            if (!s) return;
            fill[s] = wid;
            lastRes = null;
            if (compact) dismissChoices();
            else {
              active = slotsInText.slice(slotsInText.indexOf(s) + 1).find(slot => !fill[slot]) || null;
              draw();
            }
            dirty();
          });
          bank.append(chip);
        });
        if (compact) {
          const label = _t(txt.querySelector('.slot.act.srcslot') ? '选择原件' : '选择词语');
          const picker = h('div', { id: choicesId, class: 'board-picker', role: 'group', 'aria-label': label, hidden: !active });
          picker.append(h('div', { class: 'board-picker-head' }, h('strong', { text: label }),
            h('button', { type: 'button', class: 'bbtn', text: _t('收起'), onclick: dismissChoices })), bank);
          sheet.append(picker);
        } else sheet.append(bank);
      }
      if (compact) wrap.scrollTop = scroll;
      if (lastRes) { res.className = 'res ' + lastRes.cls; res.textContent = lastRes.text; }
    }
    let lastRes = null;
    function check() {
      markInteraction();
      const keys = Object.keys(b.slots);
      let ok = 0;
      keys.forEach(s => { if ([].concat(b.slots[s]).includes(fill[s])) ok++; });
      if (ok === keys.length) {
        lastRes = { cls: 'ok', text: _t('全部正确。') };
        setFlag('board_' + id); act(b.onSolve); sfx('ok');
        S.newBoards = Math.max(0, S.newBoards - 1);
        draw(); dirty();
      } else {
        const filled = keys.filter(s => fill[s]).length;
        lastRes = { cls: 'bad', text: `${ok} / ${keys.length} ${_t('处正确')}` + (filled < keys.length ? `${_t('（还有')} ${keys.length - filled} ${_t('处没填）')}` : '') };
        sfx('err'); draw();
      }
    }
    const changeLayout = () => { active = null; draw(); };
    draw();
    openOverlay(wrap, () => mobileLayout.removeEventListener('change', changeLayout));
    mobileLayout.addEventListener('change', changeLayout);
  }

  // ============================================================
  // 2018 手机
  // ============================================================
  const ui = { tab: 'msg', chat: null, mail: null, item: null, phoneOpen: false, menuView: null, scroll: {}, noteTab: 'questions', noteQuery: '', itemQuery: '', reading: null, clueScope: 'current', clueGroups: {} };
  let running = {}, typing = {}, FAST = false;
  function pushChat(c, m) {
    const at = (m.ref && S.dlg[m.ref.d]?.at) || sceneTime();
    const t = phoneTime(at);
    if (m.ref && m.html) { m = Object.assign({}, m); delete m.html; }
    (S.chat[c] = S.chat[c] || []).push(Object.assign({ at: `${t.date} ${t.hm}`, sceneAt: at }, m));
    const viewing = ui.tab === 'msg' && ui.chat === c && (!narrow() || ui.phoneOpen);
    if (m.from === 'npc' && !viewing) { S.unread[c] = (S.unread[c] || 0) + 1; sfx('msg'); }
    renderPhone();
  }
  // 聊天消息的文字：有引用就按当前语言从对话数据里取，没有就用保存时的文字
  function msgText(m) {
    const R = m.ref, d = R && DLG[R.d], s = d && d.steps[R.i];
    if (!s) return m.text;
    if (R.o != null) { const o = s.choice && s.choice[R.o]; if (!o) return m.text; return R.r != null ? ((o.reply || [])[R.r] ?? m.text) : o.text; }
    const v = m.from === 'npc' ? s.npc : m.from === 'me' ? s.me : s.sys;
    return v != null ? v : m.text;
  }
  function msgHtml(m) { const R = m.ref, d = R && DLG[R.d], s = d && d.steps[R.i]; return s && R.o == null && s.html ? s.html : m.html; }
  function runDialogues() { Object.keys(S.dlgQ).forEach(stepDlg); }
  function curDlg(c) {
    const q = S.dlgQ[c];
    while (q?.length) {
      const first = q[0], state = S.dlg[first];
      if (!DLG[first] || !state || state.done) { q.shift(); continue; }
      // A night follow-up can already be queued when another daytime exchange unlocks
      // on the same contact. Finish the earlier exchange before this clock boundary.
      if (!running[c] && q.length > 1) {
        let earliest = 0;
        for (let i = 1; i < q.length; i++) {
          const candidate = DLG[q[i]], queued = S.dlg[q[i]];
          if (!candidate || !queued || queued.done) continue;
          if (dialogueTime(candidate, queued) < dialogueTime(DLG[q[earliest]], S.dlg[q[earliest]])) earliest = i;
        }
        if (earliest) { q.unshift(q.splice(earliest, 1)[0]); delete S.wait[c]; }
      }
      return [DLG[q[0]], S.dlg[q[0]]];
    }
    return null;
  }
  function typeDelay(text) { return Math.min(2600, 650 + String(text || '').length * 40); }
  // 过期对话：属于更早章节、玩家一直没回复的对话。调查已经推进到后面的章节时，
  // 这些对话快速补播完（回复自动发出、旧选择取不触发结局的选项、旧的等待和问答跳过），
  // 不再挡住本章的消息。本章的对话仍然需要玩家自己发送和选择。
  function isStale(d) {
    const m = /^c(\d)_/.exec(d.id), cur = S.chapter ? +String(S.chapter).replace('ch', '') : 0;
    return !!m && +m[1] < cur;
  }
  function stepDlg(c) {
    if (running[c] || titleOn || awaitingPuzzleFeedback()) return;
    const cur = curDlg(c);
    if (!cur) { delete S.wait[c]; return; }
    const [d, st] = cur;
    if (!canReachTime(dialogueTime(d, st), d.id)) {
      delete S.wait[c];
      const pending = S.pendingTimedActions?.[0];
      if (pending && canReachTime(pending.action.clock)) dirty();
      return;
    }
    const begins = d.steps[st.i]?.at || d.startsAt;
    if (begins && (!st.at || st.at < begins)) { st.at = begins; setSceneTime(begins); }
    const stale = isStale(d);
    const next = () => { st.i++; stepDlg(c); };
    const timed = (ms, fn, showTyping) => {
      if (stale) { ms = 60; showTyping = false; }
      if (FAST) ms = 15;
      running[c] = true; if (showTyping) { typing[c] = true; renderPhone(); }
      later(() => { running[c] = false; typing[c] = false; fn(); save('auto'); }, ms);
    };
    if (Array.isArray(st.rep) && st.rep.length) { const line = st.rep[0]; return timed(typeDelay(line), () => { st.rep.shift(); pushChat(c, { from: 'npc', text: line }); stepDlg(c); }, true); }
    if (st.rep && !Array.isArray(st.rep)) {
      const R = st.rep, o = (d.steps[R.i].choice || [])[R.o], line = o && (o.reply || [])[R.r];
      if (line == null) { delete st.rep; return stepDlg(c); }
      return timed(typeDelay(line), () => { pushChat(c, { from: 'npc', text: line, ref: { d: d.id, i: R.i, o: R.o, r: R.r } }); R.r++; stepDlg(c); }, true);
    }
    const s = d.steps[st.i];
    if (!s) { st.done = 1; setFlag('dlg_' + d.id); S.dlgQ[c].shift(); delete S.wait[c]; dirty(); return stepDlg(c); }
    if (s.npc !== undefined || (s.html && s.me === undefined)) return timed(typeDelay(s.npc), () => {
      pushChat(c, { from: 'npc', text: s.npc || '', html: s.html, who: s.who, ref: { d: d.id, i: st.i } });
      if (s.onReceive) act(s.onReceive, true, d.id);
      next();
    }, true);
    if (s.me !== undefined) {
      if (stale) { delete S.wait[c]; const ref = { d: d.id, i: st.i }; return timed(60, () => { pushChat(c, { from: 'me', text: s.me, html: s.html, ref }); next(); }); }
      S.wait[c] = { type: 'reply' }; renderPhone(); return;
    }
    if (s.sys !== undefined) return timed(400, () => { pushChat(c, { from: 'sys', text: s.sys, ref: { d: d.id, i: st.i } }); next(); });
    if (s.action) {
      if (s.action.clock && (!st.at || s.action.clock > st.at)) st.at = s.action.clock;
      act(s.action, true, d.id); return next();
    }
    if (s.delay) return timed(s.delay, next);
    if (s.wait) { if (stale || test(s.wait)) { delete S.wait[c]; return next(); } S.wait[c] = { type: 'wait' }; return; }
    if (s.puzzle) { if (stale || solved(s.puzzle)) { delete S.wait[c]; return next(); } S.wait[c] = { type: 'puzzle', id: s.puzzle }; renderPhone(); return; }
    if (s.choice) {
      if (stale) {
        let k = s.choice.findIndex(o => test(o.requires) && !o.action?.ending);
        if (k < 0) k = s.choice.findIndex(o => test(o.requires));
        if (k < 0) return;
        const opt = s.choice[k]; delete S.wait[c];
        pushChat(c, { from: 'me', text: opt.text, ref: { d: d.id, i: st.i, o: k } });
        st.rep = (opt.reply || []).length ? { i: st.i, o: k, r: 0 } : null; st.i++;
        act(opt.action, true, d.id); dirty(); return stepDlg(c);
      }
      S.wait[c] = { type: 'choice' }; renderPhone(); return;
    }
    next();
  }
  function sendReply(c, dialogue, step) {
    const cur = curDlg(c); if (!cur || running[c] || titleOn) return;
    const [d, st] = cur, s = d.steps[st.i];
    if (d.id !== dialogue || st.i !== step || !s || s.me === undefined || !S.wait[c] || S.wait[c].type !== 'reply') return;
    if (!canReachTime(dialogueTime(d, st), d.id)) { delete S.wait[c]; dirty(); return; }
    markInteraction(); delete S.wait[c];
    if (d.blocksClock === false && (!st.at || st.at < S.clock)) st.at = S.clock;
    const ref = { d: d.id, i: st.i }; st.i++;
    pushChat(c, { from: 'me', text: s.me, html: s.html, ref });
    sfx('click'); dirty(); stepDlg(c);
  }
  function choose(c, idx, dialogue, step) {
    const cur = curDlg(c); if (!cur) return;
    const [d, st] = cur; const s = d.steps[st.i];
    if (running[c] || titleOn || !s || !s.choice || !s.choice[idx] || !test(s.choice[idx].requires) || !S.wait[c] || S.wait[c].type !== 'choice') return;
    if (dialogue != null && (d.id !== dialogue || st.i !== step)) return;
    if (!canReachTime(dialogueTime(d, st), d.id)) { dirty(); return; }
    markInteraction();
    if (d.programmeCheckpoint && !S.programmeCheckpoint && preEndSnap) {
      S.programmeCheckpoint = JSON.parse(preEndSnap);
      S.programmeCheckpoint.view = captureView();
    }
    const opt = s.choice[idx];
    delete S.wait[c];
    pushChat(c, { from: 'me', text: opt.text, ref: { d: d.id, i: st.i, o: idx } });
    st.rep = (opt.reply || []).length ? { i: st.i, o: idx, r: 0 } : null; st.i++;
    if (opt.action?.clock) st.at = opt.action.clock;
    act(opt.action, true, d.id);
    sfx('click');
    dirty(); stepDlg(c);
  }
  // 铅笔拓印：物品带 rub = { flag, lines, tip, onDone }。在空白页上拖动涂抹，压痕里的字以纸色显出来；
  // 涂到足够面积（或按“一次拓完”）后记下 flag。画布在重绘之间保留，手机刷新不会抹掉进度。
  const rubCache = {};
  function rubPad(it) {
    const R = it.rub;
    if (S.flags[R.flag]) return h('div', { class: 'rub' }, h('div', { class: 'rub-done', 'aria-label': _t('拓印结果') }, ...R.lines.map(t => h('div', { text: t || '\u00a0' }))));
    if (rubCache[it.id]) return rubCache[it.id];
    const W = 320, LH = 30, H = R.lines.length * LH + 36, GX = 12, GY = Math.max(4, R.lines.length);
    const cv = h('canvas', { width: W * 2, height: H * 2, role: 'img', 'aria-label': _t('空白页，按住来回涂抹') });
    cv.style.aspectRatio = W + ' / ' + H;
    const ctx = cv.getContext('2d'); ctx.scale(2, 2);
    const cut = () => { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.font = '20px KaiTi, STKaiti, serif'; ctx.textBaseline = 'top'; R.lines.forEach((t, i) => ctx.fillText(t, 20, 18 + i * LH)); ctx.restore(); };
    const cells = new Set();
    const finish = () => { delete rubCache[it.id]; setFlag(R.flag); act(R.onDone); sfx('ok'); dirty(); renderPhone(); };
    let down = false;
    const rub = e => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(64,64,70,.22)';
      for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(x + (Math.random() - .5) * 16, y + (Math.random() - .5) * 8, 14, 6, -0.4, 0, Math.PI * 2); ctx.fill(); }
      cut(); cells.add(Math.min(GX - 1, Math.floor(x / W * GX)) + ':' + Math.min(GY - 1, Math.floor(y / H * GY)));
      if (cells.size >= GX * GY * 0.45) { down = false; finish(); }
    };
    cv.addEventListener('pointerdown', e => { down = true; try { cv.setPointerCapture(e.pointerId); } catch (x) { } markInteraction(); rub(e); });
    cv.addEventListener('pointermove', e => { if (down) rub(e); });
    cv.addEventListener('pointerup', () => { down = false; });
    cv.addEventListener('pointercancel', () => { down = false; });
    const box = h('div', { class: 'rub' }, cv,
      h('button', { class: 'ph-btn', type: 'button', text: _t('一次拓完'), onclick: () => { markInteraction(); finish(); } }));
    return (rubCache[it.id] = box);
  }
  function contactInfo(id) {
    const info = D.contacts2018[id];
    if (!info?.afterMessages) return info;
    const update = (S.chat[id] || []).findLast(message => message.from === 'sys' && info.afterMessages[msgText(message)]);
    return update ? {...info, ...info.afterMessages[msgText(update)]} : info;
  }

  function contactVisible(id) { const c = D.contacts2018[id]; return c && test(c.requires) && ((S.chat[id] && S.chat[id].length) || S.dlgQ[id]); }

  function phoneSearch(label, key, onSearch) {
    const input = h('input', { class: 'ph-search-input', type: 'search', 'aria-label': label, placeholder: label, autocomplete: 'off', value: ui[key] });
    const clear = h('button', { class: 'ph-search-clear', type: 'button', 'aria-label': _t('清空'), text: '×', onclick: () => { input.value = ''; ui[key] = ''; clear.hidden = true; onSearch(''); input.focus(); } });
    clear.hidden = !ui[key];
    input.addEventListener('input', () => { ui[key] = input.value; clear.hidden = !input.value; onSearch(input.value); });
    return h('div', { class: 'ph-search' }, h('span', { class: 'ph-search-icon', 'aria-hidden': 'true', text: '⌕' }), input, clear);
  }
  function searchText(value) { return strip(fmt(value)).normalize('NFKC').toLocaleLowerCase(); }


  // 只导航到已经开放的资料，仍走原有的文件锁、后台登录和谜题入口。
  function goEvidence(source) {
    if (!source) return;
    if (source.type === 'clip') {
      if (ui.clip !== source.id) { ui.frameSel = null; ui.frameMsg = ''; ui.framePuzzle = null; }
      ui.tab = 'clips'; ui.clip = source.id; ui.chat = null; ui.mail = null; ui.item = null;
      if (narrow()) togglePhone(true); else renderPhone();
      return;
    }
    if (['item', 'mail'].includes(source.type)) {
      const list = source.type === 'item' ? S.items : S.mails;
      if (!list.includes(source.id)) return toast(_t('这份资料尚未收到。'));
      ui.tab = source.type === 'item' ? 'items' : 'mail'; ui.chat = null; ui.reading = null;
      ui.item = source.type === 'item' ? source.id : null; ui.mail = source.type === 'mail' ? source.id : null;
      if (narrow()) togglePhone(true); else renderPhone(); return;
    }
    if (source.type === 'chat') { ui.tab = 'msg'; ui.chat = source.id; ui.reading = null; ui.item = null; ui.mail = null; renderPhone(); return; }
    if (source.type === 'board') { if (canOpenBoard(source.id)) openBoard(source.id); return; }
    if (S.stage !== 'win') return;
    if (source.type === 'app') { if (narrow()) togglePhone(false); return openApp(source.id); }
    if (source.type === 'file') {
      const f = D.files.find(f => f.id === source.id); if (!f || !test(f.requires)) return;
      if (narrow()) togglePhone(false);
      if (f.deleted && !S.flags['restored_' + f.id]) openRecycle(); else openFile(f);
    } else if (source.type === 'props') {
      const f = D.files.find(f => f.id === source.id); if (f && test(f.requires)) showProps(f);
    } else if (source.type === 'url') {
      if (narrow()) togglePhone(false); openIE(source.value);
    } else if (source.type === 'gx') {
      if (narrow()) togglePhone(false);
      withLock(D.apps.gexun?.lock, () => openGexun(source.id));
    }
  }
  function sourceButton(source, label) { return h('button', { class: 'ph-source', type: 'button', text: label || _t('查看原件'), onclick: () => goEvidence(source) }); }
  function noteChapter(id) { const m = /^c([0-7])_/.exec(id); return m ? 'ch' + m[1] : (S.noteCh[id] || S.chapter); }
  function noteSource(id) {
    const has = a => a && [].concat(a.note || []).includes(id);
    for (const f of D.files) { if (has(f.onOpen)) return { type: 'file', id: f.id }; if (has(f.onProps)) return { type: 'props', id: f.id }; }
    for (const t of D.threads) if (has(t.onOpen) || has(t.onSource)) return { type: 'url', value: '/thread.asp?id=' + t.id };
    for (const m of D.mails) if (has(m.onOpen)) return { type: 'url', value: '/admin/mail.asp?id=' + encodeURIComponent(m.id) };
    for (const m of D.mails2018) if (has(m.onOpen)) return { type: 'mail', id: m.id };
    for (const it of D.items2018) if (has(it.onOpen)) return { type: 'item', id: it.id };
    for (const l of D.gxLogs) if (has(l.onOpen)) return { type: 'gx', id: l.id };
    return null;
  }
  function renderJournal(body) {
    const journal = D.journal[S.chapter]; if (!journal) return;
    const next = nextJournalStep();
    body.append(h('section', { class: 'ph-journal', 'data-investigation': next?.until },
      h('div', { class: 'k', text: _t('本章调查') }), h('h3', { text: journal.question }),
      next ? h('p', { text: next.text }) : null,
      next ? sourceButton(next.source, _t('前往资料')) : null));
    const facts = (journal.facts || []).filter(f => test(f.requires));
    if (facts.length) body.append(h('details', { class: 'ph-facts', open: true },
      h('summary', { text: _t('目前能确认的事') + ' · ' + facts.length }),
      h('ul', {}, facts.map(f => h('li', { text: f.text })))));
  }
  function nextJournalStep() {
    const available = source => {
      if (!source) return false;
      if (source.type === 'item') return S.items.includes(source.id);
      if (source.type === 'mail') return S.mails.includes(source.id);
      if (source.type === 'chat') return contactVisible(source.id);
      if (source.type === 'app') return S.stage === 'win' && D.apps[source.id] && test(D.apps[source.id].requires);
      if (source.type === 'board') return D.boards[source.id] && test(D.boards[source.id].requires);
      if (source.type === 'clip') return clipsOpen() && clipList().some(c => c.id === source.id);
      if (['file', 'props'].includes(source.type)) return S.stage === 'win' && D.files.some(f => f.id === source.id && test(f.requires));
      return false;
    };
    return ((D.journal[S.chapter] || {}).steps || []).find(step => {
      if (test(step.until) || !test(step.requires) || !available(step.source)) return false;
      const puzzle = step.until.startsWith('solved_') && D.puzzles[step.until.slice(7)];
      // Reading is the next action; other story prerequisites still apply.
      if (puzzle && !test((puzzle.requires || '').replace(/\bseen_\w+\b/g, 'start'))) return false;
      const dialogue = step.until.startsWith('dlg_') && DLG[step.until.slice(4)];
      if (dialogue && !test(dialogue.trigger)) return false;
      return true;
    });
  }
  function renderClues(body, controls) {
    const results = h('div', { class: 'ph-search-results' });
    const scope = h('select', { class: 'ph-scope', 'aria-label': _t('线索范围') },
      h('option', { value: 'current', text: _t('本章线索') }), h('option', { value: 'all', text: _t('全部已发现线索') }));
    D.chapters.filter(c => S.notes.some(id => noteChapter(id) === c.id)).forEach(c => scope.append(h('option', { value: c.id, text: c.num + ' · ' + c.name })));
    scope.value = ui.clueScope;
    const show = query => {
      results.innerHTML = ''; const q = searchText(query).trim();
      const ids = S.notes.slice().reverse().filter(id => {
        if (!D.notes[id]) return false;
        const ch = noteChapter(id), c = D.chapters.find(c => c.id === ch);
        return (ui.clueScope === 'all' || ch === (ui.clueScope === 'current' ? S.chapter : ui.clueScope))
          && (!q || searchText((c ? c.num + ' ' + c.name : '') + ' ' + D.notes[id].text).includes(q));
      });
      for (const c of D.chapters.slice().reverse()) {
        const group = ids.filter(id => noteChapter(id) === c.id); if (!group.length) continue;
        const opened = !!q || ui.clueScope !== 'all' || c.id === S.chapter || !!ui.clueGroups[c.id];
        const section = h('details', { class: 'ph-clue-group', open: opened },
          h('summary', { text: c.num + ' · ' + c.name + ' · ' + group.length }));
        section.addEventListener('toggle', () => { ui.clueGroups[c.id] = section.open; });
        group.forEach(id => {
          const source = noteSource(id);
          section.append(h('div', { class: 'ph-card', 'data-note': id },
            h('div', { class: 'k', text: c.num }), h('div', { html: fmt(D.notes[id].text) }), source ? sourceButton(source) : null));
        });
        results.append(section);
      }
      if (!ids.length) results.append(h('div', { class: 'ph-card done', text: q ? _t('没有找到。') : _t('这一章还没记下线索。点上方的章节名，可以翻看其他章节的笔记。') }));
      body.scrollTop = 0;
    };
    scope.onchange = () => { ui.clueScope = scope.value; show(ui.noteQuery); };
    controls.append(scope, phoneSearch(_t('搜索') + ' ' + _t('线索'), 'noteQuery', show)); body.append(results); show(ui.noteQuery);
  }
  function renderReadings(body) {
    const readings = D.readings.filter(r => test(r.requires));
    if (ui.reading) {
      const r = readings.find(r => r.id === ui.reading);
      if (!r) { ui.reading = null; return; }
      S.readingSeen = S.readingSeen || {}; S.readingSeen[r.id] = true;
      const f = r.file && D.files.find(f => f.id === r.file && test(f.requires));
      const article = h('article', { class: 'ph-reading' },
        h('div', { class: 'ph-reading-source', text: r.date + ' · ' + r.source }),
        f ? h('div', { class: 'ph-reading-original', html: fmt(f.html || '<pre>' + esc(f.text || '') + '</pre>') }) : null,
        h('div', { html: fmt(r.html) }));
      body.append(article); bindImageZoom(article); save('auto'); return;
    }
    D.chapters.forEach(c => {
      const rows = readings.filter(r => r.chapter === c.id); if (!rows.length) return;
      body.append(h('div', { class: 'ph-sec', text: c.num + ' · ' + c.name }));
      rows.forEach(r => body.append(h('button', { class: 'ph-reading-tile', type: 'button', onclick: () => { ui.reading = r.id; renderPhone(); } },
        h('span', { text: r.title }), h('small', { text: (S.readingSeen || {})[r.id] ? _t('已读') : _t('未读') }),
        r.intro ? h('p', { text: r.intro }) : null)));
    });
    if (!readings.length) body.append(h('div', { class: 'ph-empty', text: _t('读过的信、看过的录像里，有些片段会收在这里，随时可以回来翻。') }));
  }

  function renderPhone() {
    const ph = $('#phone'); if (!ph || !S) return;
    const t = phoneNow();
    $('#phStatus').innerHTML = `<span><b>${t.hm}</b>　${t.date} ${t.wk}</span><span>4G　86%</span>`;
    if (ui.tab === 'msg' && ui.chat && (!narrow() || ui.phoneOpen)) S.unread[ui.chat] = 0;
    const unreadMsg = Object.values(S.unread).reduce((a, b) => a + b, 0);
    const unreadMail = S.mails.filter(m => !S.mailRead[m]).length;
    const newItems = S.items.filter(i => !S.itemSeen[i]).length;
    const waiting = Object.keys(S.wait).filter(c => S.wait[c] && S.wait[c].type !== 'wait').length;
    const badges = { msg: unreadMsg || (waiting ? '!' : 0), mail: unreadMail, items: newItems, notes: S.newNotes, boards: S.newBoards, menu: 0 };
    const tabs = $('#phTabs'); tabs.innerHTML = '';
    const tabList = [['msg', _t('消息')], ['mail', _t('邮件')], ['items', _t('物品')], ['notes', _t('笔记')], ['boards', _t('推理')], ['menu', _t('菜单')]];
    if (hhOpen()) tabList.splice(4, 0, ['list', _t('名单')]);
    if (clipsOpen()) tabList.splice(tabList.findIndex(t => t[0] === 'boards'), 0, ['clips', _t('录像')]);
    badges.clips = newClips();
    badges.list = hhPending();
    tabs.style.gridTemplateColumns = 'repeat(' + tabList.length + ', 1fr)';
    tabList.forEach(([k, n]) => {
      const b = h('button', { class: ui.tab === k ? 'on' : '', html: phIcon(k) + `<span>${n}</span>`, onclick: () => { ui.tab = k; ui.chat = null; ui.mail = null; ui.item = null; ui.menuView = null; ui.reading = null; ui.clip = null; if (k === 'notes') S.newNotes = 0; if (k === 'boards') S.newBoards = 0; renderPhone(); } });
      if (badges[k]) b.append(h('span', { class: 'badge', text: String(badges[k]) }));
      tabs.append(b);
    });
    const fab = $('#phoneFab'); if (fab) { fab.hidden = narrow() && ui.phoneOpen; fab.innerHTML = phIcon('phone'); const n = unreadMsg + unreadMail + (waiting ? 1 : 0); if (n) fab.append(h('span', { class: 'badge', text: String(n) })); }
    const head = $('#phHead'), body = $('#phBody'), foot = $('#phFoot');
    const viewKey = ui.tab + ':' + (ui.chat || ui.mail || ui.item || ui.menuView || ui.clip || (ui.tab === 'notes' ? ui.noteTab + ':' + (ui.reading || '') : ''));
    const sameView = ui._viewKey === viewKey;
    const keepBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 40;
    const prevScroll = body.scrollTop;
    if (ui._viewKey) ui.scroll[ui._viewKey] = prevScroll;
    // 来消息时保留正在输入的存档码等表单；切换页面时照常刷新。
    if (sameView && body.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    body.onscroll = null;
    head.innerHTML = ''; body.innerHTML = ''; foot.innerHTML = ''; foot.hidden = true;
    const closeBtn = h('button', { class: 'ph-close', text: _t('收起'), onclick: () => togglePhone(false) });
    const title = (txt, sub, back) => { if (back) head.append(h('button', { class: 'ph-back', text: '‹', 'aria-label': _t('返回'), onclick: back })); head.append(h('h2', {}, txt, sub ? h('small', { text: sub }) : null), closeBtn); };
    let stick = false;
    if (ui.tab === 'msg') {
      if (ui.chat) {
        const c = ui.chat, info = contactInfo(c);
        title(info.name, typing[c] ? _t('对方正在输入…') : info.sub, () => { ui.chat = null; renderPhone(); });
        const box = h('div', { class: 'chat' });
        let previousAt = '';
        (S.chat[c] || []).forEach(m => {
          const at = chatTimestamp(m);
          if (at && at !== previousAt) {
            const time = phoneTime(at);
            const newDay = at.slice(0, 10) !== previousAt.slice(0, 10);
            box.append(h('time', { class: 'chat-stamp', datetime: at.replace(' ', 'T') },
              h('span', { class: newDay ? 'chat-day' : 'chat-date', text: time.date }), ' ', h('span', { text: time.hm })));
            previousAt = at;
          }
          const b = h('div', { class: 'bub ' + m.from, title: m.at || '' });
          if (m.who) b.append(h('b', { class: 'who', text: m.who }));
          const mt = msgText(m), mh = msgHtml(m);
          if (mt) b.append(h('span', { html: fmt(esc(mt)).replace(/&lt;br&gt;/g, '\n') }));
          const attachments = m.ref && DLG[m.ref.d]?.steps[m.ref.i]?.attachments;
          if (attachments) {
            for (const source of attachments) b.append(sourceButton(source, source.label));
          }
          if (mh) {
            b.classList.add('media');
            const pic = h('div', { class: 'pic', html: fmt(mh), role: 'button', tabindex: 0, 'aria-label': _t('放大图片') });
            const open = () => viewImage(fmt(mh)); bindControl(pic, open);
            pic.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
            b.append(pic);
          }
          box.append(b);
        });
        if (typing[c]) box.append(h('div', { class: 'bub npc typing', html: '<i></i><i></i><i></i>' }));
        body.append(box);
        const w = S.wait[c];
        if (w && (w.type === 'choice' || w.type === 'reply')) {
          const [d, st] = curDlg(c) || [];
          if (d) {
            const step = st.i;
            foot.hidden = false; foot.append(h('div', { class: 'ph-reply-label', text: _t('点击发送回复') }));
            if (w.type === 'reply') foot.append(h('button', { class: 'ph-btn', html: fmt(esc(d.steps[step].me)), onclick: () => sendReply(c, d.id, step) }));
            else d.steps[step].choice.forEach((o, i) => {
              if (test(o.requires)) foot.append(h('button', { class: 'ph-btn', html: fmt(esc(o.text)), onclick: () => choose(c, i, d.id, step) }));
            });
          }
        } else if (w && w.type === 'puzzle') {
          const p = D.puzzles[w.id];
          foot.hidden = false; foot.append(h('button', { class: 'ph-btn pri', text: _t('回答：') + (p ? p.title : ''), onclick: () => askPuzzle(w.id, null, true, c) }));
        }
        stick = true;
      } else {
        title(_t('消息'));
        const list = h('div', { class: 'ph-list' });
        Object.keys(D.contacts2018).filter(contactVisible).forEach(id => {
          const info = contactInfo(id); const log = S.chat[id] || []; const last = log[log.length - 1];
          const w = S.wait[id] && S.wait[id].type !== 'wait';
          list.append(h('button', { class: 'ph-item', 'data-contact': id, onclick: () => { ui.chat = id; renderPhone(); } },
            h('div', { class: 'av', text: info.avatar || info.name[0] }),
            h('div', { class: 'mid' }, h('b', { text: info.name }), h('span', { text: typing[id] ? _t('对方正在输入…') : w ? _t('【等你回复】') : last ? (last.from === 'me' ? _t('我：') : last.who ? last.who + '：' : '') + playerText(msgText(last) || _t('[图片]')) : '' })),
            h('div', { class: 'rt' }, h('span', { text: chatListTime(last) }), S.unread[id] ? h('span', { class: 'cnt', text: String(S.unread[id]) }) : null)));
        });
        if (!list.children.length) list.append(h('div', { class: 'ph-empty', text: _t('暂无消息') }));
        body.append(list);
      }
    } else if (ui.tab === 'mail') {
      if (ui.mail) {
        const m = MAIL26[ui.mail]; S.mailRead[ui.mail] = 1; opened(m.id, m.onOpen);
        title(strip(fmt(m.subject)), '', () => { ui.mail = null; renderPhone(); });
        body.append(h('div', { class: 'ph-mail' }, h('div', { class: 'mh', html: `${_t('发件人：')}${esc(m.from)}<br>${_t('时间：')}${esc(m.date || '')}<br>${_t('主题：')}${fmt(m.subject)}` }), h('div', { html: fmt(m.html) })));
        bindImageZoom(body.querySelector('.ph-mail'));
      } else {
        title(_t('邮件'), `${_t('收件箱')} ${S.mails.length}`);
        const list = h('div', { class: 'ph-list' });
        const inbox = S.mails.slice().reverse().map(id => MAIL26[id]).filter(Boolean);
        inbox.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        inbox.forEach(m => {
          const id = m.id;
          list.append(h('button', { class: 'ph-item', onclick: () => { ui.mail = id; renderPhone(); } },
            h('div', { class: 'av', text: '✉' }),
            h('div', { class: 'mid' }, h('b', { text: strip(fmt(m.subject)), style: S.mailRead[id] ? { fontWeight: 400 } : null }), h('span', { text: m.from })),
            h('div', { class: 'rt' }, h('span', { text: (m.date || '').slice(5, 16) }), !S.mailRead[id] ? h('span', { class: 'cnt', text: _t('新') }) : null)));
        });
        if (!list.children.length) list.append(h('div', { class: 'ph-empty', text: _t('收件箱是空的') }));
        body.append(list);
      }
    } else if (ui.tab === 'items') {
      if (ui.item) {
        const it = ITEM[ui.item]; S.itemSeen[it.id] = 1; opened(it.id, it.onOpen);
        title(strip(fmt(it.name)), '', () => { ui.item = null; renderPhone(); });
        const v = h('div', { class: 'ph-view', html: fmt(it.html) });
        bindImageZoom(v);
        body.append(v);
        if (it.rub) body.append(rubPad(it));
      } else {
        title(_t('物品'), _t('手边的实物和照片'));
        const results = h('div', { class: 'ph-search-results' });
        const showItems = query => {
          results.innerHTML = ''; const g = h('div', { class: 'ph-grid' }), q = searchText(query).trim();
          S.items.forEach(id => { const it = ITEM[id]; if (!it || (q && !searchText(it.name + ' ' + it.html).includes(q))) return; g.append(h('button', { class: 'ph-tile' + (S.itemSeen[id] ? '' : ' new'), onclick: () => { ui.item = id; renderPhone(); } }, h('span', { html: fmt(it.name) }), h('small', { text: S.itemSeen[id] ? _t('已查看') : _t('未查看') }))); });
          results.append(g.children.length ? g : h('div', { class: 'ph-empty', text: S.items.length ? _t('没有找到。') : _t('还没有东西') }));
        };
        body.append(h('div', { class: 'ph-search-bar' }, phoneSearch(_t('搜索') + ' ' + _t('物品'), 'itemQuery', showItems)), results);
        showItems(ui.itemQuery);
      }
    } else if (ui.tab === 'notes') {
      const reading = D.readings.find(r => r.id === ui.reading && test(r.requires));
      title(reading ? reading.title : _t('笔记'), currentChapterLabel(), reading ? () => { ui.reading = null; renderPhone(); } : null);
      const asks = Object.entries(D.puzzles).filter(([id, p]) => p.ask && test(p.requires) && !solved(id));
      const total = Object.keys(D.collectibles).length;
      const controls = h('div', { class: 'ph-note-controls' });
      const pages = h('div', { class: 'ph-note-tabs', 'aria-label': _t('笔记') });
      [['questions', _t('待解决的问题'), asks.length], ['clues', _t('线索'), S.notes.length], ['readings', _t('旧事'), D.readings.filter(r => test(r.requires)).length], ['poems', D.collectLabel || _t('私人手记'), S.collected.length + ' / ' + total]].forEach(([key, label, count]) => {
        pages.append(h('button', { type: 'button', class: key === ui.noteTab ? 'on' : '', 'aria-pressed': key === ui.noteTab ? 'true' : 'false', onclick: () => { ui.noteTab = key; ui.reading = null; renderPhone(); } }, h('span', { text: label }), h('small', { text: count })));
      });
      controls.append(pages); body.append(controls);
      if (ui.noteTab === 'questions') {
        renderJournal(body);
        if (!asks.length && !nextJournalStep()) body.append(h('div', { class: 'ph-card done', text: _t('暂无待核对的问题。') }));
        const addQuestions = (list, host) => list.forEach(([id, p]) => host.append(h('div', { class: 'ph-card q', role: 'button', tabindex: 0, onclick: () => askPuzzle(id, null, true), onkeydown: (e) => { if (confirmInput(e)) askPuzzle(id, null, true); } }, h('div', { class: 'k', text: _t('点击作答') }), h('div', { html: fmt(p.title) }))));
        const current = asks.filter(([id]) => noteChapter(id) === S.chapter);
        addQuestions(current.slice(0, 2), body);
        if (current.length > 2) {
          const more = h('details', { class: 'ph-facts' }, h('summary', { text: _t('本章其他待答问题') + ' · ' + (current.length - 2) }));
          addQuestions(current.slice(2), more); body.append(more);
        }
        const old = asks.filter(([id]) => noteChapter(id) !== S.chapter);
        if (old.length) { const fold = h('details', { class: 'ph-facts' }, h('summary', { text: _t('之前未解的问题') + ' · ' + old.length })); addQuestions(old, fold); body.append(fold); }
      } else if (ui.noteTab === 'clues') {
        renderClues(body, controls);
      } else if (ui.noteTab === 'readings') {
        renderReadings(body);
      } else {
        S.collected.forEach(cid => { const c = D.collectibles[cid]; if (!c) return; body.append(h('div', { class: 'ph-card' }, h('div', { class: 'k', text: c.where || '' }), h('div', { style: { fontWeight: 600 }, html: fmt(c.title) }), h('div', { style: { whiteSpace: 'pre-wrap', fontFamily: 'var(--font-hand)', fontSize: '15px', marginTop: '4px' }, html: fmt(c.text || '') }))); });
        if (!S.collected.length) body.append(h('div', { class: 'ph-card done', text: _t('1999年，他们每人都给四十岁的自己留了一句话。那些话还在当年的软盘里。') }));
      }
    } else if (ui.tab === 'boards') {
      title(_t('推理'), _t('把线索拼成结论'));
      const list = Object.entries(D.boards).filter(([id]) => canOpenBoard(id) || id === S.chapter.replace('ch', 'c') + '_final');
      if (!list.length) body.append(h('div', { class: 'ph-empty', text: _t('暂无记录。') }));
      list.reverse().forEach(([id, b]) => {
        if (!canOpenBoard(id)) { body.append(lockedBoardCard(id, b)); return; }
        const ok = S.flags['board_' + id];
        body.append(h('div', { class: 'ph-card q' + (ok ? ' done' : ''), role: 'button', tabindex: 0, style: ok ? { borderLeftColor: 'var(--ph-good)' } : null, onclick: () => openBoard(id), onkeydown: (e) => { if (confirmInput(e)) openBoard(id); } },
          h('div', { class: 'k', text: ok ? _t('已完成') : _t('进行中 · 点击打开') }), h('div', { style: { fontWeight: 600 }, text: b.title })));
      });
    } else if (ui.tab === 'clips' && clipsOpen()) {
      renderClips(title, body);
    } else if (ui.tab === 'list') {
      renderHouseholds(title, body);
    } else if (ui.tab === 'menu') {
      renderMenu(title, body);
    }
    if (ui.returnBoard && ['items', 'mail', 'clips'].includes(ui.tab)) {
      body.prepend(h('button', {class:'ph-source', type:'button', text:_t('返回推理'), onclick:() => {
        ui.returnBoard = null; ui.tab = 'boards'; renderPhone();
      }}));
    }
    if (stick) {
      if (sameView) body.scrollTop = keepBottom ? body.scrollHeight : prevScroll;
      else body.scrollTop = ui.scroll[viewKey] == null ? body.scrollHeight : ui.scroll[viewKey];
      const latest = h('button', { class: 'chat-latest', text: _t('最新 ↓'), onclick: () => { body.scrollTop = body.scrollHeight; } });
      head.append(latest);
      body.onscroll = () => { latest.hidden = body.scrollHeight - body.scrollTop - body.clientHeight < 40; ui.scroll[viewKey] = body.scrollTop; };
      body.onscroll();
    } else body.scrollTop = sameView ? prevScroll : (ui.scroll[viewKey] || 0);
    ui._viewKey = viewKey;
  }
  function currentChapterLabel() { const c = D.chapters.find(x => x.id === S.chapter); return c ? `${c.num} · ${c.name}` : ''; }
  function renderMenu(title, body) {
    title(_t('菜单'), currentChapterLabel());
    const sec = (t) => body.append(h('div', { class: 'ph-sec', html: `<span>${t}</span>` }));
    sec(_t('存档'));
    const auto = readSave('auto');
    body.append(h('div', { class: 'ph-card slot-card' }, h('div', {}, h('div', { class: 'k', text: _t('自动存档（每一步都会自动保存）') }), h('div', { text: describe(auto) }))));
    MANUAL_SLOTS.forEach((k, i) => {
      const s = readSave(k);
      body.append(h('div', { class: 'ph-card slot-card' },
        h('div', { style: { minWidth: 0 } }, h('div', { class: 'k', text: `${_t('存档位')} ${i + 1}` }), h('div', { text: describe(s) })),
        h('div', { class: 'ph-row' },
          h('button', { class: 'ph-btn sm', text: _t('保存'), onclick: () => { if (writeSave(k)) { toast(`${_t('已保存到存档位')} ${i + 1}`, 'good'); renderPhone(); } } }),
          s ? h('button', { class: 'ph-btn sm', text: _t('读取'), onclick: () => { const o = readSave(k); if (o) { loadState(o); toast(_t('已读取存档位 ') + (i + 1)); } } }) : null)));
    });
    body.append(h('div', { class: 'ph-row', style: { marginBottom: '8px' } },
      h('button', { class: 'ph-btn sm', text: _t('导出存档文件'), onclick: exportSave }),
      h('button', { class: 'ph-btn sm', text: _t('导入存档文件'), onclick: () => importFile() })));
    if (ui.menuView === 'code') {
      tickPlay();
      const ta = h('textarea', { class: 'ph-input', id: 'saveCode', rows: 4, readonly: true }); ta.value = b64e(JSON.stringify(S));
      const tb = h('textarea', { class: 'ph-input', id: 'loadCode', rows: 3, placeholder: _t('把存档码粘贴到这里') });
      body.append(h('div', { class: 'ph-card' }, h('div', { class: 'k', text: _t('当前存档码（复制保存到任何地方）') }), ta,
        h('div', { class: 'ph-row', style: { margin: '6px 0 10px' } }, h('button', { class: 'ph-btn sm', text: _t('复制'), onclick: () => { ta.select(); (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(() => toast(_t('已复制')), () => { document.execCommand && document.execCommand('copy'); toast(_t('已选中，请手动复制')); }); } })),
        h('div', { class: 'k', text: _t('读取存档码') }), tb,
        h('div', { class: 'ph-row', style: { marginTop: '6px' } }, h('button', { class: 'ph-btn sm', text: _t('读取'), onclick: () => { try { const o = JSON.parse(b64d(tb.value)); if (o.v !== VER) throw 0; loadState(o); toast(_t('存档码已读取')); } catch (e) { toast(_t('存档码无效')); } } }))));
    } else body.append(h('button', { class: 'ph-btn sm', style: { width: '100%', marginBottom: '8px' }, text: _t('存档码（复制 / 粘贴）'), onclick: () => { ui.menuView = 'code'; renderPhone(); } }));
    sec(_t('设置'));
    body.append(h('div', { class: 'ph-card slot-card' }, h('div', { text: _t('音效') }), h('button', { class: 'ph-btn sm', text: S.sound ? _t('开') : _t('关'), onclick: () => { S.sound = !S.sound; renderPhone(); save('auto'); } })));
    sec(_t('结局收集'));
    body.append(endingList());
    sec(_t('其他'));
    body.append(h('button', { class: 'ph-btn sm', style: { width: '100%', marginBottom: '8px' }, text: _t('帮助'), onclick: openHelp }));
    body.append(h('button', { class: 'ph-btn sm', style: { width: '100%' }, text: _t('返回标题画面'), onclick: () => { writeSave('auto'); showTitle(); } }));
  }
  // Out-of-story reference only: no story data, evidence links, tasks or answers.
  function openHelp() {
    const m = modalRoot(); m.innerHTML = '';
    const dlg = h('div', { class: 'dlg98 out raised help-dialog', role: 'dialog', 'aria-label': _t('帮助') });
    const tabs = h('div', { class: 'help-tabs', role: 'tablist' });
    const body = h('div', { class: 'help-content', role: 'tabpanel', tabindex: 0 });
    let tab = 'controls';
    const paragraph = text => body.append(h('p', { html: fmt(text) }));
    function draw() {
      body.innerHTML = ''; body.scrollTop = 0;
      for (const button of tabs.children) { button.classList.toggle('on', button.dataset.tab === tab); button.setAttribute('aria-selected', button.dataset.tab === tab ? 'true' : 'false'); }
      if (tab === 'controls') {
        for (const [title, text] of [
          ['电脑与手机', '用鼠标双击图标打开程序，拖动标题栏移动窗口。想看文件属性，就右键点文件。用触屏时，轻点图标即可打开，长按文件可看属性。点右下角的手机按钮可以展开手机。表格太宽时，可以左右滑。'],
          ['材料与笔记', '手机里收着消息、邮件、物品和录像。读过原件，线索就会记进笔记。想重读他们从前的事，可以翻“旧事”。忘了接下来要查什么，就看“待解决的问题”。'],
          ['解题操作', '多选题会标出要选几项。看录像时可以放大画面。看清细节后，选中那一帧再提交。修复坏道时，从目录标出的起始簇开始，照“下一簇”的编号往后接。编号读不出来，就看看哪两段文字接得上。拓印时可以按住纸页来回涂，也可以点“一次拓完”。'],
          ['比较、地图与推理', '先打开要比较的两份资料。如果是同一个文件的两个旧版本，就分别到对应的还原点打开。回到“文件比较”，点出要核对的差异，再提交。看地图时，点地点后要按确认，点红点能重看原件。在推理板上先点空格，再选词语或原件。手机上选好就会收起选项，电脑上也可以把选项拖进空格。〔依据〕一栏放原件。右键点一格可以擦掉里面的内容，点“清空”会清掉整张板。关掉推理板，下次打开还能接着填。'],
          ['还原点与资料恢复', '每个还原点都是一份旧备份。切换还原点不会改动原盘，已经读过的文件版本也还能拿来比较。随着调查继续，你还会陆续找到其他文件、账号记录和网页。'],
          ['提示与存档', '每道题和每张推理板旁边都有提示。每看一条新提示计一次，回头重看不计。最后一条可能会给出答案。进度会自动保存，也可以在手机菜单里手动存档。想换个浏览器接着玩，先导出存档，再到新浏览器里导入。'],
          ['作品说明', '这是虚构故事。电脑内的通讯、网页和系统操作均为剧情模拟，不连接真实人物或旧网站。音乐资料仅记录歌曲信息，不附商业录音。'],
        ]) { body.append(h('h3', { text: _t(title) })); paragraph(_t(text)); }
      } else {
        D.chapters.filter(c => S.flags[c.id] && D.helpCards && D.helpCards[c.id]).forEach(c => paragraph(D.helpCards[c.id]));
      }
    }
    [['controls', '操作说明'], ['technical', '背景知识']].forEach(([key, title]) => tabs.append(controlButton({ class: 'b98', role: 'tab', 'data-tab': key, text: _t(title) }, () => { tab = key; draw(); })));
    dlg.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: _t('帮助 · 画外说明') }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), text: '×' }, closeModal)), tabs, body);
    m.append(h('div', { class: 'shade raised', onclick: closeModal }), dlg); draw();
    tabs.firstElementChild.focus();
  }
  function endingList() {
    const m = meta(); const got = (m && m.endings) || {};
    const g = h('div', { class: 'endgrid' });
    [['A', _t('结局 A')], ['B', _t('结局 B')], ['C', _t('结局 C')], ['D', _t('结局 D')], ['H', _t('隐藏结局')]].forEach(([k, n]) => {
      const e = endingEdition(k, !m.revisedBroadcast);
      const unlocked = !!(got[k] && e);
      const row = unlocked ? controlButton({ class: 'ending-entry', 'data-ending': k }, event => replayEnding(k, event.currentTarget)) : h('div', { class: 'no' });
      row.append(h('span', { text: n }), h('span', { text: unlocked ? (LANG === 'en' ? '“' + e.title + '”' : '「' + e.title + '」') : _t('未达成') }));
      g.append(row);
    });
    return g;
  }
  function togglePhone(on) { ui.phoneOpen = on == null ? !ui.phoneOpen : on; $('#phone').classList.toggle('open', ui.phoneOpen); renderPhone(); }

  // ============================================================
  // 标题画面
  // ============================================================
  let titleOn = false;
  function showTitle() {
    if (S && !titleOn && lastTick) writeSave('auto');
    tickPlay(); playClockRunning = false;
    window.Y2KStats?.setPlaying(false);
    titleOn = true; sessionScreen('title'); closeOverlay(); closeModal();
    clearTimers(); running = {}; typing = {};
    clearTimeout(dirtyT); dirtyT = 0;
    clearTimeout(saveT); saveT = 0;
    const tl = $('#title'); tl.hidden = false; tl.innerHTML = ''; tl.classList.remove('panel-open');
    tl.style.backgroundImage = D.titleArt ? `linear-gradient(90deg, rgba(5,7,9,.76), rgba(5,7,9,.60)), url("${D.titleArt}")` : '';
    const titleStart = Date.parse('2026-12-20T21:30:00Z'), titleOpened = Date.now();
    const titleTime = () => new Date(titleStart + Date.now() - titleOpened).toISOString().slice(0, 19).replace('T', ' ');
    const clk = h('div', { class: 'clock', text: titleTime() });
    const iv = setInterval(() => { if (!titleOn || !clk.isConnected) return clearInterval(iv); clk.textContent = titleTime(); }, 1000);
    const auto = readSave('auto');
    const menu = h('div', { class: 'menu' });
    const panel = h('div');
    menu.append(
      h('button', { class: 'tbtn', text: _t('继续调查'), disabled: !auto, onclick: () => { const o = readSave('auto'); if (o) loadState(o); } }),
      h('button', { class: 'tbtn', text: _t('新的调查'), onclick: e => newGamePanel(panel, !!auto, e.currentTarget) }),
      h('button', { class: 'tbtn', text: _t('读取存档'), onclick: e => loadPanel(panel, e.currentTarget) }),
      h('button', { class: 'tbtn', text: _t('结局收集'), onclick: e => titlePanel(panel, _t('结局收集'), e.currentTarget).append(endingList()) }));
    const leaderboard = h('button', { class: 'tbtn leaderboard-entry', text: _t('排行榜'), onclick: e => window.Y2KLeaderboard?.mount(titlePanel(panel, _t('排行榜'), e.currentTarget), LANG) });
    const feedback = window.Y2KFeedback ? h('button', { class: 'tbtn feedback-entry-button', text: _t('评分与留言'), onclick: e => window.Y2KFeedback.mount(titlePanel(panel, _t('评分与留言'), e.currentTarget), LANG) }) : null;
    // 语言切换：存进 meta，然后重新载入（译文在启动时写回数据）
    const langs = h('div', { class: 'langs', role: 'group', 'aria-label': 'Language' });
    langs.hidden = READY.length < 2;
    Object.entries(LANGS).filter(([code]) => READY.includes(code)).forEach(([code, label]) => langs.append(h('button', { class: 'lbtn' + (code === LANG ? ' on' : ''), lang: code, 'aria-pressed': code === LANG ? 'true' : 'false', text: label, onclick: () => { if (code === LANG) return; const m = meta(); m.lang = code; setMeta(m); location.reload(); } })));
    tl.append(h('div', { class: 'title-topbar' }, h('div', { class: 'title-actions' }, leaderboard, feedback), langs), h('div', { class: 'title-content' }, clk, h('h1', { html: _t('千年<span>虫</span> 2') }), h('div', { class: 'sub', text: _t('未寄出的明天 · 梧城少年宫 · 1999—2003') }), menu, panel, window.Y2KStats?.mount(LANG),
      h('div', { class: 'foot' }, h('div', { class: 'community', text: _t('QQ群') + '：1130040971' }), h('div', { text: _t('本作纯属虚构 · 建议用电脑上的 Chrome / Edge 打开 · 进度自动保存在本浏览器') }))));
  }
  function hideTitle() { titleOn = false; sessionScreen('game'); syncPlayClock(); const tl = $('#title'); tl.hidden = true; tl.innerHTML = ''; tl.classList.remove('panel-open'); window.Y2KStats?.setPlaying(true); showCards(); }
  function titlePanel(host, title, opener) {
    host.innerHTML = '';
    const tl = $('#title'); tl.classList.add('panel-open');
    const close = () => { host.innerHTML = ''; tl.classList.remove('panel-open'); if (opener?.isConnected) opener.focus(); };
    const closeBtn = controlButton({ class: 'tbtn title-panel-close', text: '×', 'aria-label': _t('关闭'), title: _t('关闭') }, close);
    const body = h('div', { class: 'title-panel-body' });
    const dlg = h('div', { class: 'panel title-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'title-panel-heading' },
      h('div', { class: 'title-panel-head' }, h('h3', { id: 'title-panel-heading', text: title }), closeBtn), body);
    const layer = h('div', { class: 'title-panel-layer' }, dlg);
    layer.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      if (e.key === 'Tab') {
        const stops = [...dlg.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')];
        const first = stops[0], last = stops[stops.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    host.append(layer); closeBtn.focus(); return body;
  }
  function newGamePanel(panel, hasSave, opener) {
    const inp = h('input', { type: 'text', id: 'nick', maxlength: 12, placeholder: _t('老K'), value: '' });
    const go = () => {
      const name = inp.value.trim() || _t('老K');
      LS.del(KEY.pre);
      loadState(fresh(name));
    };
    inp.onkeydown = (e) => { if (confirmInput(e)) go(); };
    titlePanel(panel, _t('你的昵称'), opener).append(
      h('div', { class: 'muted', text: _t('你在梧城开了家电脑维修铺，有时把修老电脑的过程拍下来。自从发了七中那期视频，来找你修东西的人也多了。街坊平时怎么叫你？') }), h('div', { style: { height: '8px' } }), inp,
      ...(hasSave ? [h('div', { class: 'muted', style: { marginTop: '8px' }, text: _t('注意：开始新调查会覆盖自动存档（手动存档位不受影响）。') })] : []),
      h('div', { class: 'row' }, h('button', { class: 'tbtn', text: _t('开始'), onclick: go })));
    if (!touchKeyboard()) inp.focus();
  }
  function loadPanel(panel, opener) {
    const p = titlePanel(panel, _t('读取存档'), opener);
    [['auto', _t('自动存档')], ...MANUAL_SLOTS.map((key, i) => [key, _t('存档位') + ' ' + (i + 1)])].forEach(([k, n]) => {
      const s = readSave(k);
      p.append(h('div', { class: 'endgrid' }, h('div', { class: s ? '' : 'no' }, h('span', { text: n + '　' + describe(s) }), s ? h('button', { class: 'tbtn', style: { padding: '4px 10px' }, text: _t('读取'), onclick: () => loadState(readSave(k)) }) : null)));
    });
    const tb = h('textarea', { class: 'ph-input', rows: 3, placeholder: _t('或者粘贴存档码'), id: 'titleCode' });
    p.append(h('div', { class: 'row', style: { justifyContent: 'flex-start' } }, h('button', { class: 'tbtn', text: _t('导入存档文件'), onclick: () => importFile() })), h('div', { style: { height: '8px' } }), tb,
      h('div', { class: 'row' }, h('button', { class: 'tbtn', text: _t('读取存档码'), onclick: () => { try { const o = JSON.parse(b64d(tb.value)); if (!o.v) throw 0; loadState(o); } catch (e) { toast(_t('存档码无效')); } } })));
  }

  // ============================================================
  // 读盘机：屏幕阶段
  // ============================================================
  function screen() { return $('#screen'); }
  function renderScreen() {
    const sc = screen(); sc.innerHTML = '';
    $('#led').classList.toggle('on', S.stage !== 'off');
    if (S.stage === 'off') {
      sc.append(h('div', { class: 'off' },
        controlButton({ class: 'power', 'aria-label': _t('开机'), html: '⏻' }, powerOn),
        h('div', { html: _t('工作台上那台装着 Windows 98 的老电脑还留着软驱，你平时就用它读软盘。') })));
    } else if (S.stage === 'win') {
      buildDesktop();
    } else {
      S.stage = 'off'; renderScreen();
    }
  }
  function powerOn() {
    if (D.boot.requires && !test(D.boot.requires)) return toast(fmt(D.boot.lockedText || _t('还不能开机。')));
    markInteraction();
    S.stage = 'boot'; $('#led').classList.add('on');
    const sc = screen(); sc.innerHTML = '';
    const bios = h('div', { class: 'bios' }); sc.append(bios);
    const lines = [
      '<span class="hl">KITE Modular BIOS v4.51PG</span>', 'Copyright (C) 1999-2004, KITE Software, Inc.', '',
      'Main Processor : Pentium 4 2.40GHz', 'Memory Testing :  524288K OK', '',
      'Primary Master : ST380011A  (80GB)', 'Primary Slave  : None', 'Floppy Drive A : 1.44M, 3.5 in.', '',
      '<span class="hl">老K工作室 · 读盘机</span>', 'Real Time Clock : Sun Dec 20 2026  21:30', '',
    ];
    let i = 0;
    const tick = () => {
      if (i < lines.length) { bios.innerHTML += fmt(lines[i++]) + '\n'; later(tick, 180); return; }
      if (D.boot.biosLock && !solved(D.boot.biosLock)) showBiosPass(bios); else afterBios(bios);
    };
    tick();
  }
  function showBiosPass(bios) {
    const id = D.boot.biosLock;
    const box = h('div', { class: 'bios-pass' });
    const form = puzzleForm(id, { style: 'bios', hidePrompt: true, submitLabel: 'Enter', wrongText: _t('Password incorrect. 密码错误。'), onSolved: () => { box.remove(); afterBios(bios); } });
    box.append(h('div', { text: _t('══ Enter Password 开机密码 ══') }), form);
    screen().append(box); form.focusFirst();
  }
  function afterBios(bios) {
    bios.innerHTML += '\nVerifying DMI Pool Data ........\nBoot from Hard Disk...\nStarting Windows 98...\n';
    later(() => {
      const sc = screen(); sc.innerHTML = '';
      sc.append(h('div', { class: 'splash' }, h('div', { class: 'logo', html: 'Windows<b>98</b>' }), h('div', { class: 'bar', html: '<i></i>' })));
      later(showLogin, 2200);
    }, 900);
  }
  function showLogin() {
    const id = D.boot.loginLock;
    if (!id || solved(id)) return enterDesktop();
    const sc = screen(); sc.innerHTML = '';
    const lg = h('div', { class: 'login98' });
    const dlg = h('div', { class: 'dlg98 out', style: { position: 'relative', left: 'auto', top: 'auto', transform: 'none', width: 'min(440px, 94%)' } });
    const form = puzzleForm(id, { hidePrompt: true, placeholder: _t('密码'), submitLabel: _t('确定'), wrongText: _t('密码不正确。'), onSolved: enterDesktop, onWrong: () => sfx('err') });
    dlg.append(h('div', { class: 'titlebar' }, h('span', { class: 't', text: _t('欢迎使用 Windows') })),
      h('div', { class: 'wbody' },
        h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, h('span', { html: icon('computer'), style: { width: '32px' } }), h('div', { text: _t('键入用户名和密码以登录到 Windows。') })),
        h('div', { class: 'fields', style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 8px', alignItems: 'center' } }, h('label', { text: _t('用户名(U)：') }), h('input', { class: 'f98', value: D.boot.loginUser || 'user', readonly: true })),
        form));
    lg.append(dlg); sc.append(lg); form.focusFirst();
  }
  function enterDesktop() {
    S.stage = 'win';
    sfx('boot');
    dirty();
    renderScreen();
  }

  // ============================================================
  // 桌面与窗口
  // ============================================================
  let wins = [], zTop = 100, renderedFlagVer = -1;
  function desktop() { return $('#desktop'); }
  function buildDesktop() {
    closeCtx();
    const sc = screen(); sc.innerHTML = '';
    const dk = h('div', { id: 'desktop' }, h('div', { id: 'icons' }));
    const tb = h('div', { id: 'taskbar', class: 'out' },
      controlButton({ id: 'startbtn', class: 'b98', html: icon('win') + _t('<span>开始</span>') }, toggleStart),
      h('div', { id: 'tasks' }), h('div', { id: 'tray', class: 'in', style: { background: 'transparent' } }));
    sc.append(dk, tb);
    dk.addEventListener('pointerdown', (e) => { if (e.target === dk || e.target.id === 'icons') { selectIcon(null); closeStart(); closeCtx(); } });
    // 游戏桌面使用自己的菜单；输入框保留浏览器的复制、粘贴菜单。
    dk.addEventListener('contextmenu', e => {
      if (e.defaultPrevented || e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      const win = wins.find(w => w.el.contains(e.target));
      const items = win ? [[_t('刷新'), () => win.refresh(true)]] : [[_t('刷新'), () => { renderIcons(); refreshWins(true); }], [_t('显示 属性'), openDisplay]];
      showCtx(items, e.clientX, e.clientY);
    });
    wins = [];
    renderIcons(); renderTray(); renderTasks();
  }
  let selIcon = null;
  function selectIcon(el) { document.querySelectorAll('#icons .icon.sel').forEach(x => x.classList.remove('sel')); selIcon = el; if (el) el.classList.add('sel'); }
  function desktopEntries() {
    const out = [];
    const appNew = (id, a) => id === 'mycomputer' ? newUnder('C:') || newUnder('A:') : id === 'recycle' ? recycleHasNew() : a.path ? newUnder(a.path) : false;
    for (const [id, a] of Object.entries(D.apps)) if (test(a.requires)) out.push({ fresh: appNew(id, a), key: 'app_' + id, name: a.name, icon: id === 'recycle' ? (recycleItems().length ? 'recyclefull' : 'recycle') : a.icon, open: () => openApp(id), file: a.path ? D.files.find(f => f.path === a.path && f.type === 'folder') : null });
    D.files.filter(f => f.desktop && fileVisible(f)).forEach(f => out.push({ fresh: isNewFile(f), key: 'f_' + f.id, name: nameOf(f.path), icon: TYPEICON[f.type], locked: f.lock && !solved(f.lock), open: () => openFile(f), file: f }));
    return out;
  }
  function renderIcons() {
    const box = $('#icons'); if (!box) return;
    box.innerHTML = '';
    desktopEntries().forEach(en => {
      const el = h('div', { class: 'icon', tabindex: 0, html: icon(en.icon, en.locked) + (en.fresh ? NEWDOT : '') + `<span>${esc(en.name)}</span>` });
      bindControl(el, () => { selectIcon(el); if (coarse()) en.open(); });
      el.ondblclick = () => { if (!coarse()) en.open(); };
      el.onkeydown = (e) => { if (confirmInput(e)) en.open(); };
      bindCtx(el, () => [[_t('打开'), en.open], ...(en.file ? [[_t('属性'), () => showProps(en.file)]] : [])], () => selectIcon(el));
      box.append(el);
    });
  }
  function renderTray() {
    const t = $('#tray'); if (!t || !S) return;
    const m = machineNow();
    t.textContent = (S.snap && S.snap !== 'cur' ? S.snap + ' · ' : '') + m.hm; t.classList.toggle('snapmode', !!S.snap && S.snap !== 'cur'); t.title = LANG === 'en' ? `${m.y}-${pad(m.mo)}-${pad(m.d)}` : `${m.y}${_t('年')}${m.mo}${_t('月')}${m.d}${_t('日')}`;
  }
  function renderTasks() {
    const box = $('#tasks'); if (!box) return;
    box.innerHTML = '';
    const top = wins.filter(w => !w.min).sort((a, b) => b.z - a.z)[0];
    wins.forEach(w => w.el.classList.toggle('active', w === top));
    wins.forEach(w => box.append(controlButton({ class: 'b98 task' + (w === top ? ' on down' : ''), html: icon(w.o.icon || 'exe') + `<span>${esc(w.title)}</span>` }, () => { if (w === top && !w.min) { w.min = true; w.el.hidden = true; renderTasks(); } else focusWin(w); })));
  }
  // 后台状态更新不得替换手指或鼠标正在操作的内容；松手后留出兼容 click 的时间。
  function guardWinInteraction(win) {
    const el = win.el, pointers = new Set();
    let touches = 0, settling = false, timer = null;
    const active = () => pointers.size > 0 || touches > 0;
    win.isInteracting = () => active() || settling || !!win.selectPicker;
    const begin = () => { clearTimeout(timer); settling = false; };
    const release = () => {
      if (active()) return;
      clearTimeout(timer); settling = true;
      timer = setTimeout(() => {
        settling = false;
        if (el.isConnected && !active() && win.refreshPending) win.refresh();
      }, 400);
    };
    const pointerDown = e => { if (e.button === 0) { begin(); pointers.add(e.pointerId); } };
    const pointerEnd = e => { if (pointers.delete(e.pointerId)) release(); };
    const touchStart = e => { begin(); touches = e.touches.length; };
    const touchEnd = e => { if (touches) { touches = e.touches ? e.touches.length : 0; release(); } };
    // 主动翻页会移除原触摸目标，浏览器可能不再把 touchend 派发到 document。
    win.resetInteraction = () => { clearTimeout(timer); pointers.clear(); touches = 0; settling = false; };
    el.addEventListener('pointerdown', pointerDown, true);
    el.addEventListener('touchstart', touchStart, { capture: true, passive: true });
    document.addEventListener('pointerup', pointerEnd, true);
    document.addEventListener('pointercancel', pointerEnd, true);
    document.addEventListener('touchend', touchEnd, { capture: true, passive: true });
    document.addEventListener('touchcancel', touchEnd, { capture: true, passive: true });
    win.interactionCleanup = () => {
      win.selectPicker?.close();
      win.resetInteraction();
      el.removeEventListener('pointerdown', pointerDown, true);
      el.removeEventListener('touchstart', touchStart, true);
      document.removeEventListener('pointerup', pointerEnd, true);
      document.removeEventListener('pointercancel', pointerEnd, true);
      document.removeEventListener('touchend', touchEnd, true);
      document.removeEventListener('touchcancel', touchEnd, true);
    };
  }
  function openWin(o) {
    if (o.key) { const ex = wins.find(w => w.key === o.key); if (ex) { if (o.state) Object.assign(ex.state, o.state); focusWin(ex); ex.refresh(true); return ex; } }
    const dk = desktop(); if (!dk) return null;
    const W = dk.clientWidth, H = dk.clientHeight;
    const w = Math.min(o.w || 560, W - 10), hh = Math.min(o.h || 400, H - 10);
    const n = wins.length;
    const x = Math.max(0, Math.min(W - w, 40 + n * 24 + Math.random() * 20)), y = Math.max(0, Math.min(H - hh, 20 + n * 22));
    const win = { key: o.key, o, title: o.title, state: Object.assign({}, o.state || {}), z: ++zTop, min: false };
    const el = h('div', { class: 'win out', style: { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px', zIndex: win.z } });
    const tt = h('span', { class: 't', text: o.title });
    const symbol = kind => h('span', { class: 'window-symbol ' + kind, 'aria-hidden': 'true' });
    const maxSymbol = symbol('max');
    const maxBtn = controlButton({ class: 'b98 tbb', 'aria-label': _t('最大化'), title: _t('最大化') }, () => { focusWin(win); win.toggleMax(); }, maxSymbol);
    win.toggleMax = force => {
      const max = typeof force === 'boolean' ? force : !el.classList.contains('max');
      el.classList.toggle('max', max); maxSymbol.className = 'window-symbol ' + (max ? 'restore' : 'max');
      maxBtn.setAttribute('aria-label', _t(max ? '还原' : '最大化')); maxBtn.title = _t(max ? '还原' : '最大化');
    };
    const bar = h('div', { class: 'titlebar' }, h('span', { html: icon(o.icon || 'exe') }), tt,
      controlButton({ class: 'b98 tbb', 'aria-label': _t('最小化'), title: _t('最小化') }, () => { win.min = true; el.hidden = true; renderTasks(); }, symbol('min')),
      maxBtn,
      controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), title: _t('关闭') }, () => closeWin(win), symbol('close')));
    const menu = h('div', { class: 'menubar' });
    const top = h('div');
    const body = h('div', { class: 'wbody ' + (o.bodyClass || 'in') });
    if (o.file) bindCtx(body, () => [[_t('属性'), () => showProps(o.file)]]);
    const status = h('div', { class: 'status98' });
    el.append(bar, menu, top, body, status, h('div', { class: 'grip' }));
    win.el = el; win.body = body; win.menu = menu; win.top = top; win.status = status; win.tt = tt;
    guardWinInteraction(win);
    win.setTitle = (t) => { win.title = t; tt.textContent = t; renderTasks(); };
    win.refresh = (force) => {
      if (body.querySelector('.pz[data-awaiting-ack]')) return;
      if (!force && win.isInteracting()) { win.refreshPending = true; return; }
      if (!force && el.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (force) win.resetInteraction();
      win.refreshPending = false;
      const st = body.scrollTop;
      const sl = body.scrollLeft;
      menu.innerHTML = ''; top.innerHTML = ''; status.innerHTML = ''; body.innerHTML = '';
      o.render(win);
      menu.hidden = !menu.children.length; top.hidden = !top.children.length; status.hidden = !status.children.length;
      if (!win.resetScroll) { body.scrollTop = st; body.scrollLeft = sl; } else { body.scrollTop = 0; body.scrollLeft = 0; win.resetScroll = false; }
    };
    el.addEventListener('pointerdown', e => { if (!e.target.closest('.tbb')) focusWin(win); }, true);
    dragify(el, bar, win);
    resizify(el, el.querySelector('.grip'));
    dk.append(el);
    wins.push(win);
    if (narrow() || o.max) win.toggleMax(true);
    focusWin(win);
    win.refresh(true);
    return win;
  }
  function focusWin(w) {
    w.z = ++zTop; w.el.style.zIndex = w.z; w.min = false; w.el.hidden = false;
    wins.forEach(x => x.el.classList.toggle('active', x === w));
    renderTasks(); closeStart();
  }
  function closeWin(w, force = false) { if (!force && w.requestClose) return w.requestClose(); if (w.body.querySelector('.pz[data-awaiting-ack]')) dirty(); w.interactionCleanup(); w.el.remove(); wins = wins.filter(x => x !== w); w.o.onClose && w.o.onClose(w); renderTasks(); }
  function closeAllWins() { wins.forEach(w => { w.interactionCleanup(); w.el.remove(); w.o.onClose && w.o.onClose(w); }); wins = []; }
  function dragify(el, handle, win) {
    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || el.classList.contains('max') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const dk = desktop(); const r = el.getBoundingClientRect(), dr = dk.getBoundingClientRect();
      const ox = e.clientX - r.left, oy = e.clientY - r.top;
      handle.setPointerCapture(e.pointerId);
      const mv = (ev) => { el.style.left = Math.max(0, Math.min(Math.max(0, dr.width - r.width), ev.clientX - dr.left - ox)) + 'px'; el.style.top = Math.max(0, Math.min(dr.height - 24, ev.clientY - dr.top - oy)) + 'px'; };
      const up = () => { handle.removeEventListener('pointermove', mv); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up); };
      handle.addEventListener('pointermove', mv); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
    });
    handle.addEventListener('dblclick', (e) => { if (!e.target.closest('button')) win.toggleMax(); });
  }
  function resizify(el, grip) {
    grip.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); const r = el.getBoundingClientRect(); const sx = e.clientX, sy = e.clientY;
      grip.setPointerCapture(e.pointerId);
      const dr = desktop().getBoundingClientRect();
      const mv = (ev) => { el.style.width = Math.max(220, Math.min(dr.right - r.left, r.width + ev.clientX - sx)) + 'px'; el.style.height = Math.max(140, Math.min(dr.bottom - r.top, r.height + ev.clientY - sy)) + 'px'; };
      const up = () => { grip.removeEventListener('pointermove', mv); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up); };
      grip.addEventListener('pointermove', mv); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
    });
  }
  function menus(win, defs) {
    // defs: [[label, [[itemLabel, fn, checked], ...]], ...]
    defs.forEach(([label, items]) => {
      const m = h('div', { text: label });
      bindControl(m, (e) => {
        e.stopPropagation();
        const was = m.classList.contains('open');
        win.menu.querySelectorAll('.open').forEach(x => { x.classList.remove('open'); x.querySelector('.dropdown') && x.querySelector('.dropdown').remove(); });
        if (was) return;
        m.classList.add('open');
        const dd = h('div', { class: 'dropdown out' });
        items.forEach(it => { if (it === '-') return dd.append(h('div', { class: 'sep98', style: { padding: 0 } })); dd.append(bindControl(h('div', { class: it[2] ? 'chk' : '', text: it[0] }), () => { m.classList.remove('open'); dd.remove(); it[1](); })); });
        m.append(dd);
        const off = (ev) => { if (!m.contains(ev.target)) { m.classList.remove('open'); dd.remove(); document.removeEventListener('pointerdown', off, true); } };
        document.addEventListener('pointerdown', off, true);
      }, e => e.target.closest('.dropdown') ? null : m);
      win.menu.append(m);
    });
  }
  // 右键菜单（触屏长按）
  let ctxEl = null, ctxOutside = null;
  function closeCtx() {
    if (ctxOutside) { document.removeEventListener('pointerdown', ctxOutside, true); ctxOutside = null; }
    if (ctxEl) { ctxEl.remove(); ctxEl = null; }
  }
  function showCtx(items, x, y, keyboard, host) {
    closeCtx(); const dk = host || desktop(); if (!dk || !items.length) return;
    const dr = dk.getBoundingClientRect();
    ctxEl = h('div', { class: 'ctx out', role: 'menu', style: { zIndex: Math.max(7100, zTop + 1) } });
    items.forEach(([t, fn]) => ctxEl.append(controlButton({ class: 'ctx-item', role: 'menuitem', text: t }, () => { closeCtx(); fn(); })));
    ctxEl.onkeydown = e => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault(); const buttons = [...ctxEl.querySelectorAll('button')], i = buttons.indexOf(document.activeElement);
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[n].focus();
    };
    dk.append(ctxEl);
    ctxEl.style.left = Math.max(0, Math.min(x - dr.left, dr.width - ctxEl.offsetWidth)) + 'px';
    ctxEl.style.top = Math.max(0, Math.min(y - dr.top, dr.height - ctxEl.offsetHeight)) + 'px';
    ctxOutside = e => { if (ctxEl && !ctxEl.contains(e.target)) closeCtx(); };
    document.addEventListener('pointerdown', ctxOutside, true);
    if (keyboard) ctxEl.querySelector('button')?.focus();
  }
  function bindCtx(el, items, select, host) {
    const show = (x, y, keyboard) => {
      controlCancels.get(el)?.();
      el.querySelectorAll('.pressed-control').forEach(control => controlCancels.get(control)?.());
      if (select) select(); showCtx(items(), x, y, keyboard, host);
    };
    el.addEventListener('contextmenu', e => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault(); e.stopPropagation();
      if (!touching && Date.now() < suppressContextUntil) return;
      if (touching) { cancel(); touchOpened = true; suppressContextUntil = Date.now() + 1000; }
      if (!ctxEl || !touchOpened) show(e.clientX, e.clientY);
    });
    el.addEventListener('keydown', e => {
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key !== 'ContextMenu' && !(e.shiftKey && e.key === 'F10')) return;
      e.preventDefault(); e.stopPropagation(); const r = el.getBoundingClientRect(); show(r.left + r.width / 2, r.top + r.height / 2, true);
    });
    let lp = 0, touchOpened = false, touching = false, suppressContextUntil = 0;
    const cancel = () => { clearTimeout(lp); lp = 0; };
    el.addEventListener('touchstart', e => {
      cancel(); touchOpened = false; touching = e.touches.length === 1 && !e.target.closest('input, textarea, select, [contenteditable="true"]'); suppressContextUntil = 0; if (!touching) return;
      const { clientX, clientY } = e.touches[0];
      lp = setTimeout(() => { if (el.isConnected) { touchOpened = true; suppressContextUntil = Date.now() + 1000; show(clientX, clientY); } }, 550);
    }, { passive: true });
    // 子按钮会在松手时执行并停止冒泡；提前取消长按计时，避免稍后误弹属性菜单。
    el.addEventListener('pointerup', cancel, true);
    el.addEventListener('pointercancel', cancel, true);
    el.addEventListener('touchend', e => { cancel(); touching = false; if (touchOpened) { e.preventDefault(); touchOpened = false; } }, { capture: true, passive: false });
    el.addEventListener('touchmove', cancel, { passive: true });
    el.addEventListener('touchcancel', () => { cancel(); touching = false; touchOpened = false; }, { passive: true });
  }
  // 开始菜单
  function toggleStart() { if ($('#startmenu')) return closeStart(); openStart(); }
  function closeStart() { const m = $('#startmenu'); if (m) m.remove(); const b = $('#startbtn'); if (b) b.classList.remove('down'); }
  function openStart() {
    const dk = desktop(); if (!dk) return;
    const items = [];
    Object.entries(D.apps).forEach(([id, a]) => { if (test(a.requires) && id !== 'recycle' && id !== 'mydocs') items.push([a.icon, a.name, () => openApp(id)]); });
    items.push(['notepad', _t('记事本'), () => openNotepad({ id: null, path: _t('无标题'), text: '' })]);
    items.push(['display', _t('显示属性'), () => openDisplay()]);
    items.push(['help', _t('帮助'), openHelp]);
    items.push(['shutdown', _t('关闭系统...'), () => msgBox(_t('关闭 Windows'), _t('读盘机正在做镜像，先别关。<br><span style="color:#666">—— 你自己贴在机箱上的纸条</span>'), [{ text: _t('返回标题画面'), fn: () => { writeSave('auto'); showTitle(); } }, { text: _t('取消') }])]);
    const ul = h('ul');
    items.forEach(([ic, n, fn]) => ul.append(bindControl(h('li', { html: icon(ic) + `<span>${esc(n)}</span>` }), () => { closeStart(); fn(); })));
    const m = h('div', { id: 'startmenu', class: 'out' }, h('div', { class: 'side', html: '<b>Windows</b>98' }), ul);
    dk.parentNode.append(m);
    $('#startbtn').classList.add('down');
    setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!m.contains(e.target) && e.target.id !== 'startbtn' && !e.target.closest('#startbtn')) closeStart(); document.removeEventListener('pointerdown', off, true); }, true), 0);
  }

  // ============================================================
  // 文件系统
  // ============================================================
  const normPath = (p) => p.replace(/\\/g, '/').replace(/\/+$/, '').replace(/^([AC]:)$/i, '$1');
  function parentOf(p) { const i = p.lastIndexOf('/'); return i < 0 ? '' : p.slice(0, i); }
  const dispName = (n) => SEG[n] || n;
  const nameOf = (p) => { const i = p.lastIndexOf('/'); return dispName(i < 0 ? p : p.slice(i + 1)); };
  const dispPath = (p) => String(p || '').split('/').map(dispName).join(String.fromCharCode(92));
  let FS = null;
  function buildFS() {
    FS = { nodes: {}, kids: {} };
    const ensure = (p) => {
      if (FS.nodes[p] || !p) return;
      FS.nodes[p] = { path: p, folder: true, files: [] };
      const par = parentOf(p);
      if (par) { ensure(par); (FS.kids[par] = FS.kids[par] || new Set()).add(p); }
    };
    D.files.forEach(f => {
      f.path = normPath(f.path);
      ensure(f.path);
      const n = FS.nodes[f.path];
      n.files.push(f);
      if (f.type !== 'folder') n.folder = false;
    });
    ['A:', 'C:'].forEach(ensure);
  }
  function fileVisible(f) { return test(f.requires) && snapOK(f) && (!f.deleted || S.flags['restored_' + f.id]) && (!f.hidden || S.showHidden); }
  function nodeFile(p) { const n = FS.nodes[p]; if (!n) return null; return n.files.find(f => f.type !== 'folder' && fileVisible(f)) || null; }
  function folderEntry(p) { const n = FS.nodes[p]; return n && n.files.find(f => f.type === 'folder'); }
  function folderVisible(p, depth = 0) {
    if (p === 'A:' || p === 'C:') return true;
    const fe = folderEntry(p);
    if (fe) return test(fe.requires) && (!fe.hidden || S.showHidden);
    if (depth > 20) return false;
    return [...(FS.kids[p] || [])].some(k => (FS.nodes[k].folder && !nodeFile(k)) ? folderVisible(k, depth + 1) : !!nodeFile(k));
  }
  function listDir(p) {
    const out = [];
    [...(FS.kids[p] || [])].forEach(k => {
      const f = nodeFile(k);
      if (f) out.push({ path: k, file: f });
      else if (FS.nodes[k].folder && folderVisible(k)) out.push({ path: k, folder: true, entry: folderEntry(k) });
    });
    out.sort((a, b) => (b.folder ? 1 : 0) - (a.folder ? 1 : 0) || nameOf(a.path).localeCompare(nameOf(b.path), 'zh'));
    return out;
  }
  // 新恢复、还没打开过的文件：图标上加小圆点，所在的文件夹、盘符和桌面图标也跟着标出
  function isNewFile(f) { return !!(f && f.id && f.requires && f.type !== 'folder' && !S.opened[f.id] && fileVisible(f)); }
  function reachablePath(path) {
    for (let q = parentOf(path); q && q !== 'A:' && q !== 'C:'; q = parentOf(q)) if (!folderVisible(q)) return false;
    return true;
  }
  function newUnder(prefix) { return D.files.some(f => (f.path === prefix || f.path.startsWith(prefix + '/')) && isNewFile(f) && reachablePath(f.path)); }
  function recycleHasNew() { return recycleItems().some(f => !S.opened[f.id]); }
  const NEWDOT = `<i class="newdot" aria-label="${esc(_t('新'))}"></i>`;
  function recycleItems() { return D.files.filter(f => f.deleted && !S.flags['restored_' + f.id] && test(f.requires) && snapOK(f)); }
  function sizeOf(f) {
    if (f.size) return f.size;
    const n = (f.text || '').length * 2 + strip(f.html || '').length * 2 + 300;
    return Math.max(1, Math.round(n / 1024)) + ' KB';
  }

  // 打开文件
  function openFile(f) {
    if (!f || !test(f.requires)) return toast(_t('这份资料尚未恢复。'));
    if (!snapOK(f) && !S.opened[f.id]) return toast(_t('这份原件没有收在当前的备份里。换个系统还原点再找找。'));
    markInteraction();
    const go = () => {
      opened(f.id, f.onOpen);
      const t = f.type;
      if (t === 'folder') return openExplorer(f.path);
      if (['txt', 'log', 'ini', 'bat', 'bak', 'dat', 'sys'].includes(t)) return f.text != null ? openNotepad(f) : msgBox(nameOf(f.path), _t('无法打开此文件。<br>Windows 不知道用什么程序打开它。'));
      if (t === 'doc') return openWordpad(f);
      if (t === 'htm') return openIE(null, f);
      if (t === 'img') return openImage(f);
      if (t === 'audio') return openMedia(f);
      if (t === 'zip') return openZip(f);
      if (t === 'lnk' || t === 'exe') { if (f.app) return openApp(f.app); return msgBox(nameOf(f.path), esc(f.text || _t('该程序无法在此系统上运行。')).replace(/\n/g, '<br>')); }
      if (f.text != null) return openNotepad(f);
      msgBox(nameOf(f.path), _t('无法打开此类型的文件。'));
    };
    if (f.type === 'zip') return go();
    withLock(f.lock, go);
  }
  function showProps(f, aboveOverlay) {
    if (f.id) { setFlag('props_' + f.id); if (!S.opened['props_' + f.id]) { S.opened['props_' + f.id] = 1; act(f.onProps); } dirty(); }
    const rows = [[_t('类型'), TYPENAME[f.type] || _t('文件')], [_t('位置'), dispPath(parentOf(f.path)) || f.path], [_t('大小'), f.type === 'folder' ? '-' : sizeOf(f)], [_t('修改时间'), f.date || '-']];
    if (f.created) rows.push([_t('创建时间'), f.created]);
    const attr = `<label><input type="checkbox" disabled ${f.hidden ? 'checked' : ''}${_t('> 隐藏')}</label>　<label><input type="checkbox" disabled checked> ${_t('只读')}</label>`;
    let html = `<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><span style="width:32px">${icon(TYPEICON[f.type] || 'txt')}</span><b>${esc(nameOf(f.path))}</b></div><div class="sep98"></div><table style="border-collapse:collapse">`;
    rows.forEach(([k, v]) => html += `<tr><td style="padding:2px 12px 2px 0;color:#333;white-space:nowrap;vertical-align:top">${k}：</td><td style="padding:2px 0">${esc(v)}</td></tr>`);
    html += `<tr><td style="padding:2px 12px 2px 0;color:#333">${_t('属性：')}</td><td>${attr}</td></tr>`;
    if (f.props) { html += '</table><div class="sep98"></div><table style="border-collapse:collapse">'; Object.entries(f.props).forEach(([k, v]) => html += `<tr><td style="padding:2px 12px 2px 0;color:#333;white-space:nowrap;vertical-align:top">${esc(k)}：</td><td style="padding:2px 0;white-space:pre-wrap">${fmt(esc(v))}</td></tr>`); }
    html += '</table>';
    msgBox(nameOf(f.path) + _t(' 属性'), html, null, aboveOverlay);
  }

  // ============================================================
  // 应用
  // ============================================================
  function openApp(id) {
    const a = D.apps[id] || {};
    if (!test(a.requires)) return toast(_t('这个程序尚未开放。'));
    const go = () => {
      if (id === 'mycomputer') return openExplorer('');
      if (id === 'mydocs') return openExplorer(a.path || 'C:/我的文档');
      if (id === 'recycle') return openRecycle();
      if (id === 'bbs') return openIE('/');
      if (id === 'gexun') return openGexun();
      if (id === 'internet') return openIE('/');
      if (id === 'explorer') return openExplorer('C:');
      if (id === 'display') return openDisplay();
      if (id === 'restore') return openRestore();
      if (id === 'compare') return openCompare();
      if (id === 'diskfix') return openDiskFix();
      if (a.path) return openExplorer(a.path);
      if (id === 'map') return openMap();
      msgBox(a.name || id, _t('无法启动程序。'));
    };
    withLock(a.lock, go);
  }

  // ---- 资源管理器 ----
  function openExplorer(path) {
    const old = wins.find(w => w.key === 'explorer');
    if (old) { focusWin(old); old.navigate(path); return old; }
    return openWin({ key: 'explorer', title: _t('资源管理器'), icon: 'folder', w: 680, h: 440, live: true, state: { path, sel: null, history: [path], hi: 0 }, render: renderExplorer });
  }
  function renderExplorer(win) {
    const st = win.state; st.view = st.view || 'icons';
    const p = st.path;
    const title = p === '' ? _t('我的电脑') : p === 'A:' ? _t('3.5 软盘 (A:)') : p === 'C:' ? '(C:)' : nameOf(p);
    win.setTitle(title + snapTag());
    win.o.icon = p === '' ? 'computer' : 'folder';
    st.history ||= [p]; st.hi ??= 0;
    const go = (np, back = false) => { if (!back && np !== st.path) { st.history = st.history.slice(0, st.hi + 1); st.history.push(np); st.hi = st.history.length - 1; } st.path = np; st.sel = null; win.resetScroll = true; win.refresh(true); };
    win.navigate = go;
    const travel = delta => { const next = st.hi + delta; if (next < 0 || next >= st.history.length) return; st.hi = next; go(st.history[next], true); };
    const address = h('input', { class: 'f98', 'aria-label': '资源管理器地址', value: p === '' ? _t('我的电脑') : dispPath(p) + (p.length === 2 ? '\\' : '') });
    const visit = () => {
      let raw = address.value.trim(); if (raw === _t('我的电脑')) return go('');
      raw = normPath(raw).replace(/^([ac]):/i, (_, d) => d.toUpperCase() + ':');
      if (!/^[AC]:/.test(raw)) raw = (p ? p + '/' : '') + raw;
      const node = FS.nodes[raw], f = nodeFile(raw);
      if (!node || !reachablePath(raw) || (!f && (!node.folder || !folderVisible(raw)))) return msgBox('资源管理器', '找不到指定的路径。请检查文件夹名称是否写对。');
      const locks = []; for (let q = raw; q && q !== 'A:' && q !== 'C:'; q = parentOf(q)) { const e = folderEntry(q); if (e?.lock && !solved(e.lock)) locks.unshift(e.lock); }
      const enter = () => { if (locks.length) return withLock(locks.shift(), enter); if (f) openFile(f); else go(raw); }; enter();
    };
    address.onkeydown = e => { if (confirmInput(e)) { e.preventDefault(); visit(); } }; address.onfocus = () => address.select();
    win.el.onkeydown = e => { if (e.altKey && ['ArrowLeft','ArrowRight','ArrowUp'].includes(e.key)) { e.preventDefault(); if(e.key==='ArrowUp')go(parentOf(st.path));else travel(e.key==='ArrowLeft'?-1:1); } else if(e.ctrlKey&&e.key.toLowerCase()==='l'){e.preventDefault();address.focus();} else if(e.key==='F5'){e.preventDefault();win.refresh(true);} };
    const sel = () => st.sel && items.find(x => x.path === st.sel);
    menus(win, [
      [_t('文件(F)'), [[_t('打开'), () => { const s = sel(); s && openEntry(s); }], [_t('属性'), () => { const s = sel(); s && showProps(s.file || s.entry || { path: s.path, type: 'folder' }); }], '-', [_t('关闭'), () => closeWin(win)]]],
      [_t('查看(V)'), [[_t('大图标'), () => { st.view = 'icons'; win.refresh(true); }, st.view === 'icons'], [_t('详细资料'), () => { st.view = 'details'; win.refresh(true); }, st.view === 'details'], '-',
        [_t('显示所有文件（含隐藏文件）'), () => { S.showHidden = !S.showHidden; flagVer++; refreshWins(true); renderIcons(); save('auto'); toast(S.showHidden ? _t('已显示隐藏文件') : _t('已不显示隐藏文件')); }, S.showHidden]]],
      [_t('帮助(H)'), [[_t('关于 Windows'), () => msgBox(_t('关于 Windows'), fmt('Microsoft Windows 98<br>本机已授权给：老K工作室'))]]],
    ]);
    win.top.append(h('div', { class: 'toolbar98' },
      controlButton({ class: 'b98', text: '← 后退', disabled: st.hi === 0 }, () => travel(-1)),
      controlButton({ class: 'b98', text: '前进 →', disabled: st.hi >= st.history.length - 1 }, () => travel(1)),
      controlButton({ class: 'b98', text: _t('↑ 向上'), disabled: p === '' }, () => go(p === 'A:' || p === 'C:' ? '' : parentOf(p))),
      controlButton({ class: 'b98', text: '刷新' }, () => win.refresh(true)),
      controlButton({ class: 'b98', text: _t('属性') }, () => { const s = sel(); if (s) showProps(s.file || s.entry || { path: s.path, type: 'folder' }); else msgBox(_t('属性'), _t('请先单击选中一个文件。')); })),
      h('div', { class: 'addr' }, h('span', { text: _t('地址') }), address, controlButton({ class: 'b98', text: '转到' }, visit)));
    const body = win.body;
    body.innerHTML = '';
    let items;
    if (p === '') {
      items = [{ path: 'A:', folder: true, drive: 'floppy', label: _t('3.5 软盘 (A:)') }, { path: 'C:', folder: true, drive: 'drive', label: '(C:)' }, { path: '#display', label: _t('控制面板'), drive: 'display' }];
    } else items = listDir(p);
    const openEntry = (it) => {
      if (it.path === '#display') return openDisplay();
      if (it.folder) { const fe = it.entry; if (fe) { opened(fe.id, fe.onOpen); return withLock(fe.lock, () => go(it.path)); } return go(it.path); }
      openFile(it.file);
    };
    if (!items.length) { body.append(h('div', { class: 'empty98', text: _t('此文件夹为空。') })); }
    else if (st.view === 'icons' || p === '') {
      const fl = h('div', { class: 'flist' });
      items.forEach(it => {
        const f = it.file; const locked = (f && f.lock && !solved(f.lock)) || (it.entry && it.entry.lock && !solved(it.entry.lock));
        const ic = it.drive || (it.folder ? 'folder' : TYPEICON[f.type]);
        const hid = (f && f.hidden) || (it.entry && it.entry.hidden);
        const el = h('div', { class: 'icon' + (st.sel === it.path ? ' sel' : '') + (hid ? ' hid' : ''), tabindex: 0, html: icon(ic, locked) + ((it.folder ? it.path !== '#display' && newUnder(it.path) : isNewFile(f)) ? NEWDOT : '') + `<span>${esc(it.label || nameOf(it.path))}</span>` });
        const select = () => { st.sel = it.path; fl.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); win.status.firstChild && (win.status.firstChild.textContent = statusText(it)); };
        bindControl(el, () => { select(); if (coarse()) openEntry(it); });
        el.ondblclick = () => { if (!coarse()) openEntry(it); };
        el.onkeydown = (e) => { if (confirmInput(e)) openEntry(it); };
        bindCtx(el, () => [[_t('打开'), () => openEntry(it)], [_t('属性'), () => showProps(f || it.entry || { path: it.path, type: 'folder' })]], select);
        fl.append(el);
      });
      body.append(fl);
    } else {
      const tb = h('table', { class: 'det' });
      tb.append(h('tr', {}, h('th', { class: 'out', text: _t('名称') }), h('th', { class: 'out', text: _t('大小') }), h('th', { class: 'out', text: _t('类型') }), h('th', { class: 'out', text: _t('修改时间') })));
      items.forEach(it => {
        const f = it.file; const locked = f && f.lock && !solved(f.lock);
        const tr = h('tr', { class: st.sel === it.path ? 'sel' : '' },
          h('td', { class: 'nm', html: icon(it.folder ? 'folder' : TYPEICON[f.type], locked) + esc(nameOf(it.path)) + ((it.folder ? newUnder(it.path) : isNewFile(f)) ? `<span class="newtag">${_t('新')}</span>` : '') }),
          h('td', { text: it.folder ? '' : sizeOf(f) }), h('td', { text: it.folder ? _t('文件夹') : TYPENAME[f.type] || '' }), h('td', { text: (f || it.entry || {}).date || '' }));
        const select = () => { st.sel = it.path; tb.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); tr.classList.add('sel'); win.status.firstChild && (win.status.firstChild.textContent = statusText(it)); };
        bindControl(tr, () => { select(); if (coarse()) openEntry(it); });
        tr.ondblclick = () => { if (!coarse()) openEntry(it); };
        tr.tabIndex = 0;
        tr.onkeydown = e => { if (confirmInput(e)) openEntry(it); };
        bindCtx(tr, () => [[_t('打开'), () => openEntry(it)], [_t('属性'), () => showProps(f || it.entry || { path: it.path, type: 'folder' })]], select);
        tb.append(tr);
      });
      body.append(tb);
    }
    const statusText = (it) => it ? (it.folder || it.drive ? it.label || nameOf(it.path) : `${nameOf(it.path)}　${sizeOf(it.file)}　${it.file.date || ''}`) : `${items.length} ${_t('个对象')}` + (S.showHidden ? '' : _t('（隐藏文件未显示）'));
    win.status.append(h('div', { text: statusText(sel()) }));
  }

  // ---- 回收站 ----
  function openRecycle() { openWin({ key: 'recycle', title: _t('回收站'), icon: 'recycle', w: 520, h: 320, live: true, render: renderRecycle }); }
  function renderRecycle(win) {
    const items = recycleItems();
    win.o.icon = items.length ? 'recyclefull' : 'recycle';
    win.top.append(h('div', { class: 'toolbar98' }, h('span', { text: _t('选中文件后点"还原"，文件会回到原来的位置。') })));
    if (!items.length) { win.body.append(h('div', { class: 'empty98', text: _t('回收站是空的。') })); return; }
    const tb = h('table', { class: 'det recycle-table' });
    tb.append(h('tr', {}, ...[_t('名称'), _t('原位置'), _t('删除日期'), _t('大小'), ''].map(t => h('th', { class: 'out', text: t }))));
    items.forEach(f => {
      tb.append(h('tr', {}, h('td', { class: 'nm', html: icon(TYPEICON[f.type] || 'txt') + esc(nameOf(f.path)) + (S.opened[f.id] ? '' : `<span class="newtag">${_t('新')}</span>`) }), h('td', { text: dispPath(parentOf(f.path)) }), h('td', { text: f.deletedAt || f.date || '' }), h('td', { text: sizeOf(f) }),
        h('td', {}, controlButton({ class: 'b98', style: { minWidth: 0 }, text: _t('还原') }, () => { markInteraction(); setFlag('restored_' + f.id); toast(_t('已还原到 ') + dispPath(parentOf(f.path))); dirty(); win.refresh(true); }))));
    });
    win.body.append(tb);
    win.status.append(h('div', { text: `${items.length} ${_t('个对象')}` }));
  }

  // ---- 记事本 / 写字板 / 看图 ----
  function openNotepad(f) {
    return openWin({ key:'np_'+(f.id||Math.random()),title:nameOf(f.path)+' - 记事本',icon:'notepad',file:f,w:660,h:530,state:{text:fmt(f.text||'').replace(/&amp;/g,'&'),wrap:true,q:'',at:0},render:win=>{
      const st=win.state,editable=!f.id;
      const paper=editable?h('textarea',{class:'scratch-note','aria-label':'记事本文本',value:st.text,spellcheck:false}):h('pre',{class:'note',text:st.text,tabindex:0});
      const wrap=()=>{paper.style.whiteSpace=st.wrap?'pre-wrap':'pre';paper.style.overflowWrap=st.wrap?'anywhere':'normal';};wrap();
      if(editable)paper.oninput=()=>{st.text=paper.value;st.changed=true;win.setTitle('*'+nameOf(f.path)+' - 记事本');};
      const all=()=>{if(editable){paper.focus();paper.select();}else{const r=document.createRange();r.selectNodeContents(paper);const s=getSelection();s.removeAllRanges();s.addRange(r);}};
      const copy=async()=>{let text=editable?paper.value.slice(paper.selectionStart,paper.selectionEnd):String(getSelection());if(!text){all();text=st.text;}try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else if(!document.execCommand('copy'))throw Error();}catch{msgBox('记事本','请选中文字后按 Ctrl+C 复制。');}};
      const findNext=()=>{
        if(!st.q)return find();const hay=st.text.toLowerCase(),q=st.q.toLowerCase();let pos=hay.indexOf(q,st.at);if(pos<0)pos=hay.indexOf(q);
        if(pos<0){msgBox('记事本','找不到“'+esc(st.q)+'”。');return;}
        st.at=pos+q.length;
        if(editable){paper.focus();paper.setSelectionRange(pos,pos+q.length);}else{const node=paper.firstChild;if(!node)return;const range=document.createRange();range.setStart(node,pos);range.setEnd(node,pos+q.length);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);const rect=range.getBoundingClientRect(),base=win.body.getBoundingClientRect();win.body.scrollTop+=rect.top-base.top-50;paper.focus({preventScroll:true});}
      };
      const find=()=>{const input=h('input',{class:'f98',id:'np-find','aria-label':'查找内容',value:st.q});const run=()=>{st.q=input.value;st.at=0;closeModal();if(st.q)findNext();};const m=modalRoot();m.innerHTML='';m.append(h('div',{class:'shade',onclick:closeModal}),h('div',{class:'dlg98 out'},h('div',{class:'titlebar'},h('span',{class:'t',text:'查找'}),controlButton({class:'b98 tbb',text:'×','aria-label':'关闭'},closeModal)),h('div',{class:'wbody'},h('label',{for:'np-find',text:'查找内容：'}),input,h('div',{class:'row'},controlButton({class:'b98',text:'查找下一个'},run),controlButton({class:'b98',text:'取消'},closeModal)))));input.onkeydown=e=>{if (confirmInput(e))run();};if(!touchKeyboard()){input.focus();input.select();}};
      const saveCopy=(onSaved)=>{const filename=h('input',{class:'f98',id:'np-filename','aria-label':'文件名',value:editable?'无标题.txt':nameOf(f.path)});const m=modalRoot();m.innerHTML='';const run=()=>{let name=filename.value.trim();if(!name){filename.focus();return;}name=name.replace(/[<>:"/\\|?*]/g,'_');if(!name.includes('.'))name+='.txt';const blob=new Blob(['\ufeff'+st.text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=h('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);st.changed=false;if(editable){f.path=name;win.setTitle(name+' - 记事本');}closeModal();if(typeof onSaved==='function')onSaved();};m.append(h('div',{class:'shade',onclick:closeModal}),h('div',{class:'dlg98 out'},h('div',{class:'titlebar'},h('span',{class:'t',text:'另存为'}),controlButton({class:'b98 tbb',text:'×','aria-label':'关闭'},closeModal)),h('div',{class:'wbody'},h('label',{for:'np-filename',text:'文件名：'}),filename,h('div',{class:'row'},controlButton({class:'b98',text:'保存'},run),controlButton({class:'b98',text:'取消'},closeModal)))));filename.onkeydown=e=>{if (confirmInput(e))run();};if(!touchKeyboard()){filename.focus();filename.select();}};
      const close=()=>{if(st.changed)return msgBox('记事本','是否保存对文档的修改？',[{text:'保存',fn:()=>saveCopy(()=>closeWin(win,true))},{text:'不保存',fn:()=>closeWin(win,true)},{text:'取消'}]);closeWin(win,true);};
      win.requestClose=close;
      menus(win,[['文件(F)',[['新建',()=>openNotepad({path:'无标题',text:''})],['另存为…',saveCopy],...(f.id?[['属性',()=>showProps(f)]]:[]),'-',['关闭',close]]],['编辑(E)',[['复制',copy],['查找…',find],['查找下一个',findNext],'-',['全选',all]]],['格式(O)',[['自动换行',()=>{st.wrap=!st.wrap;win.refresh(true);},st.wrap]]]]);
      win.el.onkeydown=e=>{if(e.ctrlKey&&['f','s','a'].includes(e.key.toLowerCase())){e.preventDefault();({f:find,s:saveCopy,a:all})[e.key.toLowerCase()]();}else if(e.key==='F3'){e.preventDefault();findNext();}};
      win.body.append(paper);win.status.append(h('div',{text:editable?'新建文档':'只读副本'}),h('div',{text:'Unicode'}));
    }});
  }

  function openWordpad(f) {
    openWin({ key: 'wp_' + f.id, title: nameOf(f.path) + _t(' - 写字板'), icon: 'doc', file: f, w: 720, h: 620, bodyClass: '', render: (win) => {
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      win.body.append(h('div', { class: 'wordpad' }, h('div', { class: 'page', html: fmt(f.html || '') })));
    } });
  }
  function openImage(f) {
    openWin({ key: 'img_' + f.id, title: nameOf(f.path) + _t(' - 图像查看器'), icon: 'img', file: f, w: 640, h: 500, bodyClass: 'in image-body', state: { z: null }, onClose: win => win.imageResize && win.imageResize.disconnect(), render: (win) => {
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      const canvas = h('div', { class: 'canvas', html: fmt(f.html || ''), tabindex: 0, role: 'button', 'aria-label': _t('全屏查看'), ondblclick: () => viewImage(fmt(f.html), f), onkeydown: e => { if (confirmInput(e)) viewImage(fmt(f.html), f); } });
      const size = imageSize(canvas);
      const value = h('span');
      let scale = 1;
      const zoom = delta => { win.state.z = Math.max(.25, Math.min(4, scale + delta)); win.updateImageSize(); };
      win.top.append(h('div', { class: 'toolbar98' },
        controlButton({ class: 'b98', text: _t('放大 +') }, () => zoom(.25)),
        controlButton({ class: 'b98', text: _t('缩小 −') }, () => zoom(-.25)),
        controlButton({ class: 'b98', text: _t('适应窗口') }, () => { win.state.z = null; win.updateImageSize(); stage.scrollLeft = 0; stage.scrollTop = 0; }),
        controlButton({ class: 'b98', text: _t('原始大小') }, () => { win.state.z = 1; win.updateImageSize(); }),
        controlButton({ class: 'b98', text: _t('全屏查看') }, () => viewImage(fmt(f.html), f)),
        f.documentPhoto && f.caption ? controlButton({ class: 'b98', text: _t('照片说明') }, () => msgBox(_t('照片说明'), fmt(f.caption))) : null,
        controlButton({ class: 'b98', text: _t('属性') }, () => showProps(f)),
        value));
      // The caption stays outside the zoom surface, so wrapping text cannot feed
      // back into image scaling or make scrollbars repeatedly appear/disappear.
      const stage = h('div', { class: 'image-stage', tabindex: 0, 'aria-label': _t('图片，可滚动查看') }, h('div', { class: 'imgview' }, canvas));
      const caption = f.caption ? h('div', { class: 'image-caption', html: fmt(f.caption) }) : null;
      win.body.append(stage, caption);
      win.updateImageSize = () => {
        scale = win.state.z == null ? Math.min(1,
          Math.max(1, stage.clientWidth - 24) / size.w,
          f.documentPhoto ? 1 : Math.max(1, stage.clientHeight - 24) / size.h) : win.state.z;
        canvas.style.width = Math.max(1, Math.floor(size.w * scale)) + 'px';
        value.textContent = Math.round(scale * 100) + '%';
      };
      win.updateImageSize();
      if (win.imageResize) win.imageResize.disconnect();
      win.imageResize = new ResizeObserver(() => win.updateImageSize());
      win.imageResize.observe(stage);
    } });
  }

  // ---- 磁带播放器 ----
  const SPEEDS = ['0.5', '0.75', '1', '1.25', '1.5', '2'];
  function openMedia(f) {
    openWin({ key: 'md_' + f.id, title: nameOf(f.path) + _t(' - 媒体播放器'), icon: 'audio', file: f, w: 520, h: 470, bodyClass: 'out', state: { si: 2, playing: false, shown: '' }, render: (win) => {
      const tape = f.tape || {}; const st = win.state;
      menus(win, [[_t('文件(F)'), [[_t('属性'), () => showProps(f)], [_t('关闭'), () => closeWin(win)]]]]);
      const spd = SPEEDS[st.si];
      const deck = h('div', { class: 'deck' });
      const cas = h('div', { class: 'cassette' + (st.playing ? ' playing' : ''), style: { '--spd': (1.6 / +spd) + 's' } }, h('div', { class: 'lbl', text: `${tape.side ? tape.side + _t(' 面　') : ''}${tape.label || nameOf(f.path)}` }), h('div', { class: 'reel' }), h('div', { class: 'reel' }));
      const range = h('input', { type: 'range', min: 0, max: SPEEDS.length - 1, step: 1, value: st.si, id: 'spd_' + f.id, 'aria-label': _t('转速') });
      const speedLabel = h('span', { class: 'spd', text: spd + '×' });
      range.oninput = () => {
        st.si = +range.value; st.playing = false; st.shown = '';
        cas.classList.remove('playing'); cas.style.setProperty('--spd', (1.6 / +SPEEDS[st.si]) + 's');
        speedLabel.textContent = SPEEDS[st.si] + '×'; tr.textContent = _t('（按"播放"开始）');
      };
      const tr = h('div', { class: 'tr in', text: st.shown || _t('（按"播放"开始）') });
      deck.append(cas,
        h('div', { class: 'ctrl' }, h('span', { text: _t('转速') }), range, speedLabel),
        h('div', { class: 'ticks', html: SPEEDS.map(s => `<span>${s}</span>`).join('') }),
        h('div', { class: 'ctrl' },
          controlButton({ class: 'b98', text: _t('▶ 播放') }, () => play()),
          controlButton({ class: 'b98', text: _t('■ 停止') }, () => { st.playing = false; win.refresh(true); })),
        h('div', { text: _t('听到的内容：') }), tr);
      win.body.append(deck);
      function textFor(s) {
        const sp = tape.speeds || {};
        if (sp[s] != null) return sp[s];
        const keys = Object.keys(sp).map(Number).sort((a, b) => Math.abs(a - +s) - Math.abs(b - +s));
        return keys.length ? sp[String(keys[0])] : _t('（一片沙沙声）');
      }
      function play() {
        markInteraction();
        const s = SPEEDS[st.si]; const full = fmt(textFor(s));
        st.playing = true; st.shown = '';
        setFlag(`speed_${f.id}_${s.replace('.', '_')}`);
        const onS = tape.onSpeed && tape.onSpeed[s];
        const once = 'spd_' + f.id + '_' + s;
        if (onS && !S.opened[once]) { S.opened[once] = 1; act(onS); }
        dirty();
        win.refresh(true);
        const box = win.body.querySelector('.tr'); let i = 0;
        const step = () => { if (!st.playing || !box.isConnected) return; i = Math.min(full.length, i + 2); st.shown = full.slice(0, i); box.textContent = st.shown; if (i < full.length) later(step, 45 / Math.max(.5, +s)); else { st.playing = false; win.body.querySelector('.cassette').classList.remove('playing'); } };
        step();
      }
    } });
  }

  // ---- 压缩包 ----
  function openZip(f) {
    openWin({ key: 'zip_' + f.id, title: nameOf(f.path) + _t(' - 解压缩'), icon: 'zip', file: f, w: 480, h: 380, bodyClass: 'out', live: true, render: (win) => {
      const z = f.zip || {}; const unlocked = !f.lock || solved(f.lock);
      const tb = h('table', { class: 'det in' });
      tb.append(h('tr', {}, h('th', { class: 'out', text: _t('名称') }), h('th', { class: 'out', text: _t('状态') })));
      (z.entries || []).forEach(n => tb.append(h('tr', {}, h('td', { class: 'nm', html: icon('txt') + esc(dispName(n)) + (unlocked ? '' : ' *') }), h('td', { text: unlocked ? _t('已解压') : _t('已加密') }))));
      win.body.append(h('div', { class: 'zipv' },
        h('div', { text: _t('压缩包注释：') }), h('div', { class: 'cmt in', html: fmt(esc(z.comment || _t('（无）'))).replace(/\n/g, '<br>') }),
        h('div', { style: { overflow: 'auto', maxHeight: '160px' } }, tb),
        h('div', { class: 'row', style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
          unlocked ? controlButton({ class: 'b98', text: _t('打开解压目录') }, () => z.extractTo && openExplorer(normPath(z.extractTo)))
            : controlButton({ class: 'b98', text: _t('解压…') }, () => askPuzzle(f.lock, () => { toast(_t('已解压到 ') + dispPath(z.extractTo), 'good'); dirty(); })))));
      win.status.append(h('div', { text: unlocked ? _t('已解压到 ') + dispPath(z.extractTo) : _t('文件已加密，需要密码') }));
    } });
  }

  // ---- 显示属性 / 屏保 ----
  function openDisplay() {
    openWin({ key: 'display', title: _t('显示 属性'), icon: 'display', w: 400, h: 360, bodyClass: 'out', render: (win) => {
      const box = h('div', { style: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' } },
        h('div', { class: 'in', style: { height: '130px', background: '#000', display: 'flex', alignItems: 'center', overflow: 'hidden' } }, h('div', { style: { color: '#ffd84a', fontFamily: 'var(--font-hand)', fontSize: '18px', whiteSpace: 'nowrap', padding: '0 10px' }, text: saverText().slice(0, 18) + '…' })),
        h('div', {}, _t('屏幕保护程序：'), h('select', { class: 'f98', id: 'saverSel' }, h('option', { text: _t('字幕') }))),
        h('div', {}, _t('等待：1 分钟　'), controlButton({ class: 'b98', text: _t('设置…') }, () => msgBox(_t('字幕设置'), _t('文字：<br><div class="in" style="padding:4px;margin-top:4px">') + esc(saverText()) + '</div>')), ' ', controlButton({ class: 'b98', text: _t('预览') }, () => showSaver())));
      win.body.append(box);
    } });
  }
  // 满足条件的屏保轮流播放：还没触发过 onShow 的优先，其次按顺序轮换
  let saverIdx = -1, saverPick = null;
  function saverEntry() {
    const list = D.screensaver.filter(x => test(x.requires));
    if (!list.length) return { text: _t('少年宫小站') };
    const fresh = list.find(x => x.onShow && !S.opened['saver_' + D.screensaver.indexOf(x)]);
    if (fresh) return fresh;
    return list[((saverIdx % list.length) + list.length) % list.length];
  }
  function saverText() { return fmt(saverEntry().text); }
  let idleT = 0, saverOn = false;
  function resetIdle() {
    if (saverOn) hideSaver();
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (S && S.stage === 'win' && !titleOn && !overlay().classList.contains('on')) showSaver(); }, 90000);
  }
  function showSaver() {
    if (!S || S.stage !== 'win') return;
    saverIdx++;
    const e = saverEntry();
    const sc = screen(); if (!sc || $('#saver')) return;
    saverOn = true;
    const el = h('div', { id: 'saver' }, h('div', { class: 'mq', text: strip(fmt(e.text)), style: { top: (20 + Math.random() * 60) + '%' } }));
    sc.append(el);
    if (e.onShow) { const k = 'saver_' + D.screensaver.indexOf(e); if (!S.opened[k]) { S.opened[k] = 1; later(() => act(e.onShow), 3000); } }
  }
  function hideSaver() { saverOn = false; const s = $('#saver'); if (s) s.remove(); }

  // ---- 鸽讯 ----
  function gxAccount(id) { return D.gxAccounts[id]; }
  function gxCanRead(account) { const a = gxAccount(account); return !!(a && test(a.requires) && solved(a.puzzle)); }
  function openGexun(logId) {
    const existing = wins.find(win => win.key === 'gexun');
    if (existing && !logId) { focusWin(existing); return existing; }
    const log = logId && D.gxLogs.find(entry => entry.id === logId);
    const owner = log && (log.account || 'xiaochuan');
    const session = existing?.state.account || (S.gxRemember ? S.gxSession : null);
    const account = gxCanRead(session) && (!owner || owner === session) ? session : null;
    const state = { account, c: null, d: null, pick: owner || null, pendingLog: null, filter: '' };
    if (log && test(gxAccount(owner)?.requires)) {
      if (account && test(log.requires)) { state.c = log.contact; state.d = log.id; }
      else state.pendingLog = log.id;
    }
    return openWin({ key: 'gexun', title: '鸽讯 2005 · 消息管理器', icon: 'pigeon', w: 720, h: 500, live: true, state, render: renderGexun });
  }
  function gxLogsFor(c, account) {
    if (!gxCanRead(account)) return [];
    return D.gxLogs.filter(l => (l.account || 'xiaochuan') === account && (!c || l.contact === c) && test(l.requires)).sort((a,b)=>(a.date+(a.lines[0]?.time||'')).localeCompare(b.date+(b.lines[0]?.time||'')));
  }
  function renderGexun(win) {
    const st=win.state, account=gxAccount(st.account);
    const logout=()=>{ st.pick=st.account;st.account=null; st.c=null;st.d=null;st.filter='';S.gxSession=null;save('auto');win.refresh(true); };
    if (!account || !gxCanRead(st.account)) {
      win.setTitle('鸽讯 2005 · 打开本地账号');
      menus(win,[['文件(F)',[['关闭',()=>closeWin(win)]]],['帮助(H)',[['关于鸽讯',()=>msgBox('鸽讯 2005','本地消息管理器 5.0<br>打开已备份的用户资料和聊天记录。此窗口不连接消息服务器。')]]]]);
      const accounts=Object.entries(D.gxAccounts).filter(([,a])=>test(a.requires));
      const panel=h('div',{class:'gx-login'});
      panel.append(h('div',{class:'gx-brand',html:icon('pigeon')+'<b>鸽讯 2005</b><small>本地消息管理器</small>'}));
      const select=bindTouchSelect(h('select',{class:'f98',id:'gx-account','aria-label':'鸽讯账号'}),win);
      accounts.forEach(([id,a])=>select.append(h('option',{value:id,text:a.number+'  '+a.nick})));
      if(!accounts.length){select.append(h('option',{value:'',text:'尚未载入用户资料'}));select.disabled=true;}
      if(accounts.some(([id])=>id===st.pick))select.value=st.pick;
      const pass=h('input',{class:'f98',id:'gx-password',type:'password',autocomplete:'off','aria-label':'本地资料密码'});
      const remember=h('input',{type:'checkbox',id:'gx-remember',checked:st.rememberChoice??!!S.gxRemember});
      pass.disabled=remember.disabled=!accounts.length;
      remember.onchange=()=>{st.rememberChoice=remember.checked;};
      const rememberLabel=bindChoice(h('label',{class:'gx-remember',for:'gx-remember'},remember,h('span',{text:'在这台电脑上记住账号'})),remember);
      const msg=h('div',{class:'gx-login-error',role:'status'}),source=h('p',{class:'gx-source'}),hintBox=h('div'),hintButton=h('span');
      const change=()=>{
        st.pick=select.value;pass.value='';msg.textContent='';const a=gxAccount(select.value);
        source.textContent=a?.source||'本机还没有账号备份。收到备份后，就能在这里选账号、查聊天记录了。';
        hintBox.replaceChildren();hintButton.replaceChildren();
        if(a&&D.puzzles[a.puzzle]){const hints=puzzleHints(a.puzzle,D.puzzles[a.puzzle]);hintBox.append(hints.box);hintButton.append(hints.button);}
      };
      select.onchange=change;change();
      const login=()=>{
        const a=gxAccount(select.value);if(!a||!test(a.requires))return;
        if(!(remember.checked&&S.gxRemember&&solved(a.puzzle)&&!pass.value)&&!checkPuzzle(D.puzzles[a.puzzle],pass.value)){
          msg.textContent='密码不对。对照一下备份里的线索，再试一次。';pass.select();return;
        }
        st.account=select.value;st.c=null;st.d=null;st.filter='';S.gxRemember=remember.checked;S.gxSession=remember.checked?st.account:null;
        solvePuzzle(a.puzzle);
        const target = st.pendingLog && gxLogsFor(null, st.account).find(log => log.id === st.pendingLog);
        if (target) { st.c = target.contact; st.d = target.id; }
        st.pendingLog = null;
        save('auto');win.refresh(true);
      };
      pass.onkeydown=e=>{if (confirmInput(e)){e.preventDefault();login();}};
      panel.append(h('label',{for:'gx-account',text:'账号'}),select,h('label',{for:'gx-password',text:'本地资料密码'}),pass,
        rememberLabel,source,msg,hintBox,
        h('div',{class:'row'},hintButton,controlButton({class:'b98',text:'登录',id:'gx-login',disabled:!accounts.length},login),controlButton({class:'b98',text:'取消'},()=>closeWin(win))));
      win.body.append(panel);win.status.append(h('div',{text:'本地资料模式 · 未连接'}));return;
    }
    win.setTitle('鸽讯 — '+account.nick+'（'+account.number+'）');
    menus(win,[['系统(S)',[['切换账号…',logout],['查找聊天记录…',()=>gxSearch(win)],'-',['关闭',()=>closeWin(win)]]],['帮助(H)',[['资料来源',()=>msgBox('资料来源',esc(account.source))]]]]);
    win.top.append(h('div',{class:'toolbar98 gx-accountbar'},h('b',{text:account.nick+'  '+account.number}),h('span',{text:'本地资料'}),controlButton({class:'b98',text:'切换账号'},logout),controlButton({class:'b98',text:'查找'},()=>gxSearch(win))));
    if(account.recoveryPending&&test(account.recoveryPending))win.top.append(h('div',{class:'gx-recovery-status',text:account.recoveryText}));
    const gx=h('div',{class:'gx'}),left=h('div',{class:'left'}),groups={};
    const contacts=D.gxContacts.filter(c=>(c.account||'xiaochuan')===st.account&&test(c.requires));
    const contactFilter=h('input',{class:'f98 gx-friend-filter',placeholder:'查找联系人','aria-label':'查找联系人',value:st.filter||''});
    const list=h('div');
    const draw=()=>{list.innerHTML='';const q=contactFilter.value.trim().toLowerCase();Object.keys(groups).forEach(k=>delete groups[k]);contacts.filter(c=>!q||(c.nick+' '+c.number).toLowerCase().includes(q)).forEach(c=>(groups[c.group||'好友']??=[]).push(c));
      Object.entries(groups).forEach(([g,cs])=>{list.append(h('div',{class:'grp',text:g+'（'+cs.length+'）'}));cs.forEach(c=>{
        const n=gxLogsFor(c.id,st.account).length;
        list.append(bindControl(h('div',{class:'ct'+(st.c===c.id?' sel':'')+(n?'':' none'),tabindex:0},h('div',{class:'av',text:c.nick[0]}),h('div',{},h('div',{text:c.nick}),h('small',{text:c.number+'　'+n+' 段记录'}))),()=>{st.c=c.id;st.d=null;win.resetScroll=true;win.refresh(true);}));
      });});if(!list.children.length)list.append(h('div',{class:'empty98',text:'没有匹配的联系人。'}));};
    contactFilter.oninput=()=>{st.filter=contactFilter.value;draw();};left.append(contactFilter,list);draw();
    const right=h('div',{class:'right'}),c=contacts.find(x=>x.id===st.c);
    if(!c)right.append(h('div',{class:'gx-profile'},h('h3',{text:account.nick}),h('p',{text:account.signature||''}),h('p',{text:'本地记录：'+account.period}),h('p',{class:'muted',text:'选择联系人查看消息。'})));
    else {
      const logs=gxLogsFor(c.id,st.account),dates=h('div',{class:'dates'});
      logs.forEach(l=>dates.append(controlButton({class:'b98'+(st.d===l.id?' down':''),text:l.date+(l.subject?' · '+l.subject:'')+(S.opened[l.id]?'':' •'),'data-gx-log':l.id},()=>{st.d=l.id;win.resetScroll=true;win.refresh(true);})));right.append(dates);
      const log=h('div',{class:'log',tabindex:0}),L=logs.find(x=>x.id===st.d);
      if(!L)log.append(h('div',{class:'empty98',text:logs.length?'选择日期查看那一天的聊天记录。':'这份备份里还没有和这个人的聊天记录。'}));
      else {
        opened(L.id, L.onOpen);
        log.append(h('div', { class: 'gx-log-heading', text: L.date + '　与 ' + c.nick + '（' + c.number + '）的消息' }));
        for (const line of L.lines) {
          const stamp = [line.date, line.time].filter(Boolean).join(' ');
          if (line.who === 'system') {
            log.append(h('div', { class: 'gx-system', text: stamp + '　' + line.text }));
          } else {
            const speaker = line.who === 'me' ? account.nick : c.nick;
            log.append(h('div', { class: 'ln ' + line.who },
              h('div', { class: 'h', text: speaker + '　' + stamp }),
              h('div', { class: 'x', text: fmt(line.text) })));
          }
        }
      }
      right.append(log);
    }
    gx.append(left,right);win.body.append(gx);win.status.append(h('div',{text:'消息服务器：未连接'}),h('div',{text:gxLogsFor(null,st.account).length+' 段本地记录'}));
  }
  function gxSearch(win) {
    if(!gxCanRead(win.state.account))return;
    const m=modalRoot();m.innerHTML='';
    const inp=h('input',{class:'f98',id:'gxq','aria-label':'查找内容',style:{width:'100%'}}),from=h('input',{class:'f98',type:'date','aria-label':'起始日期'}),to=h('input',{class:'f98',type:'date','aria-label':'结束日期'});
    const res=h('div',{class:'in gx-search-results',role:'status'});
    const run=()=>{res.innerHTML='';const q=inp.value.trim();if(!q){res.textContent='请输入查找内容。';return;}
      if(from.value&&to.value&&from.value>to.value){res.textContent='起始日期不能晚于结束日期。';return;}
      for (const record of gxLogsFor(null, win.state.account)) {
        const contact = D.gxContacts.find(c => c.id === record.contact);
        for (const line of record.lines) {
          const day = line.date || record.date;
          if ((from.value && day < from.value) || (to.value && day > to.value)) continue;
          if (!line.text.toLowerCase().includes(q.toLowerCase())) continue;
          const text = (contact?.nick || '') + '　' + day + ' ' + (line.time || '') + '\n' + line.text;
          res.append(controlButton({ class: 'gx-search-result', text }, () => {
            closeModal();
            Object.assign(win.state, { c: record.contact, d: record.id, filter: '' });
            win.resetScroll = true; win.refresh(true);
          }));
        }
      }
      if(!res.children.length)res.textContent='没有找到。';
    };
    inp.onkeydown=e=>{if (confirmInput(e))run();};
    const dlg=h('div',{class:'dlg98 out'},h('div',{class:'titlebar'},h('span',{class:'t',text:'查找聊天记录 — '+gxAccount(win.state.account).nick}),controlButton({class:'b98 tbb',text:'×','aria-label':'关闭'},closeModal)),h('div',{class:'wbody'},h('label',{for:'gxq',text:'查找内容'}),inp,h('div',{class:'row'},from,h('span',{text:'至'}),to),h('div',{class:'row'},controlButton({class:'b98',text:'查找'},run)),res));
    m.append(h('div',{class:'shade',onclick:closeModal}),dlg);if (!touchKeyboard()) inp.focus();
  }

  // ---- IE + 少年宫小站 ----
  function openIE(url, localFile) {
    const host = D.bbsMeta.host || '192.168.1.103';
    const start = localFile ? 'file:///' + localFile.path : 'http://' + host + (url || '/');
    const ex = wins.find(w => w.key === 'ie');
    if (ex) { ieGo(ex, start); focusWin(ex); return; }
    const win = openWin({ key: 'ie', title: 'Microsoft Internet Explorer', icon: 'ie', w: 960, h: 680, bodyClass: 'in ie-body', live: true, state: { hist: [start], hi: 0, local: localFile || null }, render: renderIE });
    return win;
  }
  function ieGo(win, url) { const st = win.state; st.hist = st.hist.slice(0, st.hi + 1); st.hist.push(url); st.hi = st.hist.length - 1; win.resetScroll = true; win.refresh(true); }
  function parseURL(u) {
    u = String(u || '').trim();
    const host = (D.bbsMeta.host || '192.168.1.103').toLowerCase();
    let s = u.replace(/^https?:\/\//i, '');
    if (s.toLowerCase().startsWith(host)) s = s.slice(host.length);
    else if (/^www\./i.test(s) || /^[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|cn|net|org|edu|gov|info|biz)(:\d+)?(\/|$)/i.test(s) || /^\d+\.\d+\.\d+\.\d+/.test(s)) return { external: true, raw: u };
    if (!s.startsWith('/')) s = '/' + s;
    const [path, q] = s.split('?');
    const params = {}; (q || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); params[decodeURIComponent(k).toLowerCase()] = decodeURIComponent((v || '').replace(/\+/g, ' ')); });
    return { path: path.toLowerCase().replace(/\/index\.(asp|htm|html)$/, '/').replace(/\/+$/, '') || '/', params, raw: s };
  }
  function renderIE(win) {
    const st = win.state; const url = st.hist[st.hi];
    menus(win, [
      [_t('文件(F)'), [[_t('关闭'), () => closeWin(win)]]],
      [_t('查看(V)'), [[_t('源文件'), () => viewSource(win)], [_t('刷新'), () => win.refresh(true)]]],
      [_t('收藏(A)'), [[(D.bbsMeta.name || _t('少年宫小站')) + _t(' 首页'), () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/')], ...(bbsArchiveReady() ? [[_t('站务管理'), () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/admin/')]] : [])]],
      [_t('帮助(H)'), [[_t('关于'), () => msgBox(_t('关于 Internet Explorer'), 'Microsoft Internet Explorer 6.0')]]],
    ]);
    const addr = h('input', { class: 'f98', id: 'ieaddr', value: url, spellcheck: 'false', autocomplete: 'off' });
    addr.onkeydown = (e) => { if (confirmInput(e)) { markInteraction(); ieGo(win, addr.value); } };
    addr.onfocus = () => addr.select();
    win.top.append(h('div', { class: 'toolbar98' },
      controlButton({ class: 'b98', text: _t('← 后退'), disabled: st.hi === 0 }, () => { st.hi--; win.resetScroll = true; win.refresh(true); }),
      controlButton({ class: 'b98', text: _t('前进 →'), disabled: st.hi >= st.hist.length - 1 }, () => { st.hi++; win.resetScroll = true; win.refresh(true); }),
      controlButton({ class: 'b98', text: _t('刷新') }, () => win.refresh(true)),
      controlButton({ class: 'b98', text: _t('主页') }, () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/')),
      controlButton({ class: 'b98', text: _t('源文件') }, () => viewSource(win))),
      h('div', { class: 'addr' }, h('span', { text: _t('地址(D)') }), addr, controlButton({ class: 'b98', style: { minWidth: 0 }, text: _t('转到') }, () => { markInteraction(); ieGo(win, addr.value); })));
    let page;
    if (url.startsWith('file:///')) {
      const f = st.local && ('file:///' + st.local.path) === url ? st.local : D.files.find(x => 'file:///' + x.path === url);
      page = f && test(f.requires) && snapOK(f) && (!f.lock || solved(f.lock)) ? { title: nameOf(f.path), html: `<div style="padding:12px">${fmt(f.html || '')}</div>`, source: f.source || '' } : errPage(_t('无法找到文件'));
    } else page = bbsRoute(parseURL(url), win);
    win.page = page;
    win.setTitle((page.title ? strip(page.title) + ' - ' : '') + 'Microsoft Internet Explorer');
    const body = h('div', { class: 'bbs' });
    if (page.node) body.append(page.node); else body.innerHTML = page.html;
    bindControl(body, (e, a) => {
      e.preventDefault(); markInteraction();
      const href = a.getAttribute('href');
      if (/^(https?:)?\/\//i.test(href) && !href.includes(D.bbsMeta.host || '192.168.1.103')) return msgBox('Internet Explorer', _t('无法显示网页。<br>本机没有连接外网（拨号连接已断开）。'));
      ieGo(win, href.startsWith('http') ? href : 'http://' + (D.bbsMeta.host || '192.168.1.103') + (href.startsWith('/') ? href : '/' + href));
    }, e => e.target.closest && e.target.closest('a[href]'));
    win.body.append(body);
    win.status.append(h('div', { text: _t('完成') }), h('div', { style: { flex: 'none', width: '100px' }, text: _t('本地 Intranet') }));
    if (page.after) page.after(body);
  }
  function viewSource(win) {
    const p = win.page || {};
    if (p.srcFlag) { setFlag(p.srcFlag); if (!S.opened[p.srcFlag]) { S.opened[p.srcFlag] = 1; act(p.onSource); } dirty(); }
    const content = p.node ? p.node.innerHTML : (p.html || '');
    const src = `<html>\n<head>\n<meta http-equiv="Content-Type" content="text/html; charset=gb2312">\n<title>${strip(p.title || (D.bbsMeta.name || _t('少年宫小站')))}</title>\n<link rel="stylesheet" href="/style.css">\n</head>\n<body bgcolor="#FFFFFF">\n${p.source ? fmt(p.source) + '\n' : ''}${D.bbsMeta.homeSource || ''}\n${content.replace(/></g, '>\n<').slice(0, 20000)}\n</body>\n</html>`;
    openWin({ key: 'src_' + Math.random(), title: _t('源文件 - 记事本'), icon: 'notepad', w: 600, h: 440, render: (w) => w.body.append(h('pre', { class: 'note', text: src })) });
  }
  function errPage(msg) {
    return { title: _t('无法找到网页'), html: `<div class="err"><h1>${_t('无法找到该网页')}</h1><p>${msg || _t('您要查找的网页可能已被删除、已更名或暂时不可用。')}</p><hr><p>${_t('请尝试以下操作：')}<br>${_t('· 检查地址栏中的网址拼写是否正确。')}<br>${_t('· 打开')} <a href="/">${_t('少年宫小站首页')}</a>${_t('，然后查找需要的链接。')}</p><p style="color:#888">${_t('HTTP 404 - 文件未找到')}<br>Internet Explorer</p></div>` };
  }
  const uName = (id) => { const u = USER[id]; return u && test(u.requires) ? u : null; };
  const uLink = (id) => { const u = uName(id); return u ? `<a href="/user.asp?id=${encodeURIComponent(id)}">${esc(u.nick)}</a>` : esc(id); };
  const visibleThreads = () => D.threads.filter(t => !isDel(t) && test(t.requires) && snapOK(t));
  const bbsArchiveReady = () => !D.bbsMeta.archiveRequires || test(D.bbsMeta.archiveRequires);
  const topBar = (crumb) => `<div class="top"><div class="logo">${(D.bbsMeta.name || _t('少年宫小站'))}<small>${(!bbsArchiveReady() && D.bbsMeta.publicSub) || D.bbsMeta.sub || _t('梧城少年宫计算机班 · 1999')}</small></div><div class="nav"><a href="/">${_t('首页')}</a><a href="/users.asp">${_t('成员列表')}</a><a href="/search.asp">${_t('搜索')}</a>${bbsArchiveReady() ? `<a href="/admin/">${_t('站务管理')}</a>` : ''}</div></div>${crumb ? `<div class="crumb">${crumb}</div>` : ''}`;
  function bbsRoute(u, win) {
    if(D.bbsMeta.accessRequires&&!test(D.bbsMeta.accessRequires))return {title:'Internet Explorer · 工作脱机',html:'<div class="err"><h1>工作脱机</h1><p>未连接到互联网，本机尚未载入离线网页备份。</p><p>已有文件仍可从“我的电脑”打开。</p></div>'};
    if (u.external) return { title: _t('无法显示网页'), html: `<div class="err"><h1>${_t('无法显示网页')}</h1><p>${_t('本机没有连接外网（拨号连接已断开）。')}<br>${_t('只能访问校园网内的服务器')} ${esc(D.bbsMeta.host || '')}。</p></div>` };
    const path = u.path, P = u.params;
    // 自定义页面
    const custom = D.pages.find(p => parseURL(p.url).path === path && (!parseURL(p.url).params.id || parseURL(p.url).params.id === P.id) && test(p.requires));
    if (custom) {
      if (custom.lock && !solved(custom.lock)) return lockPage(custom.lock, win, custom.title);
      opened(custom.id, custom.onOpen);
      return { title: custom.title, html: topBar(esc(custom.title || '')) + `<div class="wrap">${fmt(custom.html)}</div>`, source: custom.source, srcFlag: 'source_' + custom.id, onSource: custom.onSource };
    }
    if (path === '/' || path === '/index.asp' || path === '') {
      const vt = visibleThreads();
      let rows = '';
      D.bbsBoards.filter(b => test(b.requires)).forEach(b => {
        const ts = vt.filter(t => t.board === b.id); const last = ts.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
        rows += `<tr><td><a href="/board.asp?id=${b.id}"><b>${esc(b.name)}</b></a><br><span style="color:#666">${esc(b.desc || '')}</span></td><td>${uLink(b.mod)}</td><td style="text-align:center">${ts.length}</td><td>${last ? `<a href="/thread.asp?id=${last.id}">${esc(strip(last.title)).slice(0, 18)}</a><br><span style="color:#888">${esc(last.date)}</span>` : '-'}</td></tr>`;
      });
      const notice = (!bbsArchiveReady() && D.bbsMeta.publicHomeNotice) || D.bbsMeta.homeNotice || '';
      const batch = (D.bbsMeta.recoveryBatches || []).filter(pack => test(pack.requires)).at(-1);
      const recent = batch ? batch.ids.map(id => THREAD[id]).filter(t => vt.includes(t)) : vt.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
      const separate = new Set(batch?.separateIds || []);
      recent.sort((a, b) => Number(separate.has(a.id)) - Number(separate.has(b.id)));
      const latest = recent.map(t => `<li><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a> <span style="color:#888">— ${uLink(t.author)} ${esc(t.date)}${separate.has(t.id) ? ' · 单独找回的整页' : ''}</span></li>`).join('');
      const batchTitle = batch?.through ? '本批恢复的帖子 · 整理至 ' + batch.through.replaceAll('-', '.') : _t(batch ? '本批恢复的帖子' : '最新帖子');
      return { title: D.bbsMeta.name || _t('少年宫小站'), html: topBar('') + `<div class="notice">${fmt(notice)}</div><div class="wrap"><table class="t"><tr><th>${_t('版面')}</th><th>${_t('版主')}</th><th>${_t('主题数')}</th><th>${_t('最新主题')}</th></tr>${rows}</table><p style="color:#666">${_t('注册用户')} ${D.users.filter(x => test(x.requires)).length} ${_t('人　|　帖子')} ${vt.length} ${_t('篇　|　本地网页备份')}</p><h2>${esc(batchTitle)}</h2><ul class="bbs-latest" style="padding-left:18px;margin:0">${latest}</ul></div>`, source: '' };
    }
    if (path === '/board.asp') {
      const b = D.bbsBoards.find(x => x.id === P.id && test(x.requires));
      if (!b) return errPage(_t('版面不存在。'));
      const ts = visibleThreads().filter(t => t.board === b.id).sort((x, y) => (y.sticky ? 1 : 0) - (x.sticky ? 1 : 0) || y.date.localeCompare(x.date));

      let rows = ts.map(t => `<tr><td>${t.sticky ? _t('<b style="color:#c00">[置顶]</b> ') : ''}<a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a>${S.opened['t' + t.id] ? '' : ' <span style="color:#c00">new</span>'}</td><td>${uLink(t.author)}</td><td style="text-align:center">${(t.posts || []).length - 1}</td><td style="text-align:center">${t.views || (37 + (t.id * 7) % 300)}</td><td>${esc(t.date)}</td></tr>`).join('');
      if (!rows) rows = _t('<tr><td colspan="5">本版暂无已恢复的帖子。</td></tr>');
      return { title: b.name, html: topBar(`<a href="/">${_t('首页')}</a> » ${esc(b.name)}　<span style="color:#666">${_t('版主：')}${uLink(b.mod)}</span>`) + `<div class="wrap"><table class="t"><tr><th>${_t('主题')}</th><th>${_t('作者')}</th><th>${_t('回复')}</th><th>${_t('人气')}</th><th>${_t('发表时间')}</th></tr>${rows}</table></div>`, source: b.source || '' };
    }
    if (path === '/thread.asp') {
      const id = parseInt(P.id, 10);
      const t = THREAD[id];
      if (!t || !test(t.requires) || !snapOK(t)) return { title: _t('帖子不存在'), html: topBar(`<a href="/">${_t('首页')}</a>`) + `<div class="err"><h1>${_t('错误：帖子不存在')}</h1><p>${_t('编号为')} ${esc(P.id || '')} ${_t('的帖子不存在，或者数据尚未恢复。')}</p><p style="color:#888">WTBBS Error 1032</p></div>` };
      if (isDel(t) && D.bbsMeta.adminPuzzle && !solved(D.bbsMeta.adminPuzzle)) {
        return { title: _t('站务回收站'), html: topBar('') + '<div class="err">请先<a href="/admin/">登录站务管理</a>查看回收站里的原帖。</div>' };
      }
      if (t.lock && !solved(t.lock)) return lockPage(t.lock, win, t.title);
      opened('t' + t.id, t.onOpen);
      const b = D.bbsBoards.find(x => x.id === t.board);
      const posts = (t.posts || []).map((p, i) => {
        const au = USER[p.author] || { nick: p.author };
        return `<div class="post"><div class="who"><b>${uLink(p.author)}</b><br><span style="color:#666">${esc(p.author)}</span>${au.title ? `<br><span class="tt">${esc(au.title)}</span>` : ''}<br>${_t('帖子：')}${au.posts || 0}<br>${_t('注册：')}${esc((au.reg || '').slice(0, 10))}</div><div class="body"><div class="meta"><span>${i === 0 ? _t('<b>楼主</b>') : i + _t(' 楼')}　${_t('发表于')} ${esc(p.date || t.date)}</span>${i === 0 && t.ip ? `<span>IP：${esc(t.ip)}</span>` : ''}</div><div class="content">${fmt(p.html)}</div>${au.sig ? `<div class="sig">${esc(au.sig)}</div>` : ''}</div></div>`;
      }).join('');
      return { title: t.title, html: topBar(`<a href="/">${_t('首页')}</a> » <a href="/board.asp?id=${t.board}">${esc(b ? b.name : t.board)}</a> ${_t('» 帖子 #')}${t.id}`) + `<div class="wrap">${isDel(t) ? ('<div class="delbar">' + _t('【该帖已被站务删除，仅管理员可见】') + (t.deletedAt ? '　删除记录：' + esc(t.deletedAt) : '') + '</div>') : ''}<h2>${esc(strip(t.title))}</h2>${posts}</div>`, source: t.source || '', srcFlag: 'source_t' + t.id, onSource: t.onSource };
    }
    if (path === '/user.asp') {
      const us = uName(P.id);
      if (!us) return errPage(_t('用户不存在。'));
      const publicThreads = visibleThreads();
      const ts = publicThreads.filter(t => t.author === us.id).sort((a, b) => b.date.localeCompare(a.date));

      const node = h('div', { html: topBar(`<a href="/">${_t('首页')}</a> » <a href="/users.asp">${_t('成员列表')}</a> » ${esc(us.nick)}`) + `<div class="wrap"><table class="t"><tr><th colspan="2">${_t('用户资料：')}${esc(us.nick)}（${esc(us.id)}）</th></tr><tr><td width="90">${_t('昵称')}</td><td>${esc(us.nick)}</td></tr><tr><td>${_t('性别')}</td><td>${esc(us.gender || '-')}</td></tr><tr><td>${_t('头衔')}</td><td>${esc(us.title || '-')}</td></tr><tr><td>${_t('注册时间')}</td><td>${esc(us.reg || '')}</td></tr><tr><td>${_t('最后登录')}</td><td>${esc(us.lastLogin || '')}</td></tr><tr><td>${_t('发帖数')}</td><td>${us.posts || 0}</td></tr><tr><td>${_t('个人介绍')}</td><td>${esc(us.intro || '')}</td></tr><tr><td>${_t('签名档')}</td><td>${esc(us.sig || '')}</td></tr></table><h2>${_t('TA 的帖子（已恢复')} ${ts.length} ${_t('篇）')}</h2><ul style="padding-left:18px;margin:0">${ts.map(t => `<li><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a> <span style="color:#888">${esc(t.date)}</span></li>`).join('') || _t('<li>无</li>')}</ul></div>` });
      const replies = [];
      for (const thread of publicThreads) {
        if (thread.author === us.id || (thread.lock && !solved(thread.lock))) continue;
        const floor = thread.posts.findLastIndex(post => post.author === us.id);
        if (floor > 0) replies.push({ thread, floor, date: thread.posts[floor].date });
      }
      if (replies.length) {
        replies.sort((a, b) => b.date.localeCompare(a.date));
        const list = h('ul', { class: 'bbs-replies', style: { paddingLeft: '18px', margin: '0' } });
        for (const { thread, floor, date } of replies) {
          list.append(h('li', {}, h('a', { href: '/thread.asp?id=' + thread.id, text: strip(thread.title) }),
            h('span', { text: '　' + floor + ' 楼 · ' + date, style: { color: '#666' } })));
        }
        node.querySelector('.wrap').append(h('h2', { text: '回过的主题（已恢复 ' + replies.length + ' 篇）' }), list);
      }
      const extras = D.userExtras.filter(x => x.user === us.id && test(x.requires));
      if (extras.length) {
        const ux = h('div', { class: 'ux' }); const out = h('div');
        extras.forEach(x => ux.append(controlButton({ class: 'b98', text: x.label }, () => markInteraction() || withLock(x.lock, () => { opened(x.id, x.onOpen); out.innerHTML = ''; out.append(h('div', { class: 'uxbox', html: fmt(x.html) })); }))));
        node.querySelector('.wrap').append(ux, out);
      }
      return { title: _t('用户资料 - ') + us.nick, node };
    }
    if (path === '/users.asp') {
      const rows = D.users.filter(x => test(x.requires)).map(x => `<tr><td>${uLink(x.id)}</td><td>${esc(x.id)}</td><td>${esc(x.title || '')}</td><td>${x.posts || 0}</td><td>${esc((x.reg || '').slice(0, 10))}</td><td>${esc(x.lastLogin || '')}</td></tr>`).join('');
      return { title: _t('成员列表'), html: topBar(`<a href="/">${_t('首页')}</a> ${_t('» 成员列表')}`) + `<div class="wrap"><table class="t"><tr><th>${_t('昵称')}</th><th>ID</th><th>${_t('头衔')}</th><th>${_t('发帖')}</th><th>${_t('注册')}</th><th>${_t('最后登录')}</th></tr>${rows}</table></div>` };
    }
    if (path === '/search.asp') {
      const q = (P.q || '').trim();
      const node = h('div', { html: topBar(`<a href="/">${_t('首页')}</a> ${_t('» 搜索')}`) });
      const wrap = h('div', { class: 'wrap' });
      const inp = h('input', { id: 'bbsq', value: q, style: { font: 'inherit', padding: '2px 4px', width: '220px' } });
      const go = () => ieGo(win, 'http://' + (D.bbsMeta.host || '192.168.1.103') + '/search.asp?q=' + encodeURIComponent(inp.value.trim()));
      inp.onkeydown = (e) => { if (confirmInput(e)) go(); };
      wrap.append(h('div', { style: { margin: '6px 0 10px' } }, _t('搜索帖子标题和内容：'), inp, ' ', controlButton({ class: 'b98', text: _t('搜索') }, go)));
      if (q) {
        const res = [];
        visibleThreads().forEach(t => {
          const hitTitle = strip(t.title).includes(q);
          const p = (t.posts || []).find(x => strip(x.html).includes(q));
          if (hitTitle || p) res.push({ t, snip: p ? strip(p.html) : strip(t.title) });
        });

        const hl = (s) => esc(s).split(esc(q)).join(`<span class="hl">${esc(q)}</span>`);
        wrap.append(h('div', { html: `<p>${_t('找到')} ${res.length} ${_t('个结果：')}</p>` + res.map(({ t, snip }) => { const i = Math.max(0, snip.indexOf(q) - 20); return `<p><a href="/thread.asp?id=${t.id}"><b>${hl(strip(t.title))}</b></a> <span style="color:#888">${esc(t.date)} · ${esc(USER[t.author] ? USER[t.author].nick : t.author)}</span><br>…${hl(snip.slice(i, i + 70))}…</p>`; }).join('') }));
      }
      node.append(wrap);
      return { title: _t('搜索'), node };
    }
    if (path.startsWith('/admin')) return adminRoute(path, P, win);
    return errPage();
  }
  function lockPage(lock, win, title) {
    const node = h('div', { html: topBar('') });
    const f = h('div', { class: 'form' }, h('b', { text: _t('此页面需要密码') }), puzzleForm(lock, { onSolved: () => win.refresh(true) }));
    node.append(f);
    return { title: title || _t('需要密码'), node };
  }
  function adminRoute(path, P, win) {
    if(!bbsArchiveReady())return {title:'未收录站务管理文件',html:topBar('')+'<div class="err"><h1>此副本未收录站务管理文件</h1><p>当前载入的是公开网页光盘。没有可运行的后台程序，也没有站内信或登录日志。</p><p><a href="/">返回公开首页</a></p></div>'};
    const id = D.bbsMeta.adminPuzzle || 'c1_admin';
    const host = D.bbsMeta.host || '192.168.1.103';
    if (!D.puzzles[id] || !solved(id)) {
      const node = h('div', { html: topBar(`<a href="/">${_t('首页')}</a> ${_t('» 站务管理')}`) });
      node.append(h('div', { class: 'form' }, D.puzzles[id] ? puzzleForm(id, { submitLabel: _t('登录'), wrongText: _t('密码错误。'), onSolved: () => win.refresh(true) }) : h('div', { text: _t('（暂不可用）') })));
      return { title: _t('站务管理登录'), node };
    }
    const sec = D.adminSections;
    const nav = `<div class="crumb admin"><b>${_t('站务管理')}</b>　${test(sec.recycle) ? _t('<a href="/admin/recycle.asp">回收站</a>　') : ''}${test(sec.logs) ? _t('<a href="/admin/log.asp">登录日志</a>　') : ''}${test(sec.users) ? _t('<a href="/admin/users.asp">用户管理</a>　') : ''}${test(sec.mails) ? _t('<a href="/admin/mail.asp">站内信</a>　') : ''}<span style="color:#888">${_t('已登录：sysop')}</span></div>`;
    const head = topBar('') + nav;
    if (path === '/admin' || path === '/admin/' || path === '/admin/index.asp') return { title: _t('站务管理'), html: head + `<div class="wrap"><p>${_t('欢迎回来，站长。')}</p><p style="color:#666">${(D.bbsMeta.software || 'NTBBS 2.0') + _t(' 管理后台。请从上方选择功能。')}</p></div>` };
    if (path === '/admin/recycle.asp' && test(sec.recycle)) {
      const ts = D.threads.filter(t => t.deleted && test(t.requires));
      const rows = ts.map(t => `<tr><td>${t.id}</td><td><a href="/thread.asp?id=${t.id}">${esc(strip(t.title))}</a></td><td>${esc(t.author)}</td><td>${esc(t.date)}</td><td>${esc(t.ip || '')}</td><td>${esc(t.deletedAt || '')}</td></tr>`).join('') || _t('<tr><td colspan="6">回收站为空。</td></tr>');
      return { title: _t('回收站'), html: head + `<div class="wrap"><table class="t"><tr><th>${_t('编号')}</th><th>${_t('标题')}</th><th>${_t('作者')}</th><th>${_t('发表时间')}</th><th>${_t('发帖 IP')}</th><th>${_t('删除时间')}</th></tr>${rows}</table></div>` };
    }
    if (path === '/admin/log.asp' && test(sec.logs)) {
      const all = D.loginLog.filter(l => test(l.requires));
      const fu = (P.user || '').trim(), fd = (P.date || '').trim(), order = P.order === 'asc' ? 'asc' : 'desc';
      let rows = all.filter(l => (!fu || l.user.toLowerCase() === fu.toLowerCase()) && (!fd || l.time.startsWith(fd)));
      rows.sort((a, b) => order === 'asc' ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time));
      for (const row of rows.slice(0, 400)) if (row.receipt) opened(row.receipt);
      const node = h('div', { html: head });
      const wrap = h('div', { class: 'wrap' });
      const iu = h('input', { id: 'lgu', value: fu, placeholder: _t('用户 ID'), style: { width: '100px', font: 'inherit' } });
      const id2 = h('input', { id: 'lgd', value: fd, placeholder: _t('日期，如 2000-01-01'), style: { width: '150px', font: 'inherit' } });
      const go = (o) => ieGo(win, `http://${host}/admin/log.asp?user=${encodeURIComponent(iu.value.trim())}&date=${encodeURIComponent(id2.value.trim())}&order=${o || order}`);
      iu.onkeydown = id2.onkeydown = (e) => { if (confirmInput(e)) go(); };
      wrap.append(h('div', { style: { margin: '4px 0 8px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } }, _t('筛选：'), iu, id2, controlButton({ class: 'b98', text: _t('筛选') }, () => go()), controlButton({ class: 'b98', text: order === 'desc' ? _t('改为从旧到新') : _t('改为从新到旧') }, () => go(order === 'desc' ? 'asc' : 'desc')), h('span', { style: { color: '#666' }, text: `${_t('共')} ${rows.length} ${_t('条（时间为服务器时间）')}` })));
      wrap.append(h('div', { html: `<table class="t"><tr><th>${_t('时间')}</th><th>${_t('用户')}</th><th>IP</th><th>${_t('机器名')}</th></tr>${rows.slice(0, 400).map(l => `<tr><td>${esc(l.time)}</td><td>${esc(l.user)}</td><td>${esc(l.ip || '')}</td><td>${esc(l.host || '')}</td></tr>`).join('') || _t('<tr><td colspan="4">没有记录。</td></tr>')}</table>` }));
      node.append(wrap);
      return { title: _t('登录日志'), node };
    }
    if (path === '/admin/users.asp' && test(sec.users)) {
      const rows = D.users.filter(x => test(x.requires)).map(x => `<tr><td>${esc(x.id)}</td><td>${esc(x.nick)}</td><td>******</td><td>${esc(x.reg || '')}</td><td>${esc(x.lastLogin || '')}</td><td>${x.posts || 0}</td></tr>`).join('');
      return { title: _t('用户管理'), html: head + `<div class="wrap"><p style="color:#666">${(D.bbsMeta.software || 'NTBBS 2.0') + _t(' 起密码加密存储，后台不再显示明文。')}</p><table class="t"><tr><th>ID</th><th>${_t('昵称')}</th><th>${_t('密码')}</th><th>${_t('注册时间')}</th><th>${_t('最后登录')}</th><th>${_t('发帖')}</th></tr>${rows}</table></div>` };
    }
    if (path === '/admin/mail.asp' && test(sec.mails)) {
      const all = D.mails.filter(m => test(m.requires));
      if (P.id) {
        const m = all.find(x => x.id === P.id);
        if (!m) return errPage(_t('信件不存在。'));
        opened(m.id, m.onOpen);
        return { title: _t('站内信'), html: head + `<div class="wrap"><p><a href="/admin/mail.asp?sort=${esc(P.sort || '')}${_t('">« 返回站内信列表')}</a></p><table class="t"><tr><th colspan="2">${esc(strip(m.subject || _t('（无主题）')))}</th></tr><tr><td width="80">${_t('发信人')}</td><td>${esc(m.from)}（${esc(USER[m.from] ? USER[m.from].nick : '')}）</td></tr><tr><td>${_t('收信人')}</td><td>${esc(m.to)}（${esc(USER[m.to] ? USER[m.to].nick : '')}）</td></tr><tr><td>${_t('发信时间')}</td><td>${esc(m.date)}</td></tr><tr><td colspan="2" style="padding:12px;font-size:13px;line-height:1.9">${fmt(m.body)}</td></tr></table></div>` };
      }
      const sort = P.sort || 'date_desc';
      const [k, dir] = sort.split('_');
      const key = { date: (m) => m.date, from: (m) => m.from.toLowerCase(), to: (m) => m.to.toLowerCase() }[k] || ((m) => m.date);
      const rows = all.slice().sort((a, b) => { const r = key(a).localeCompare(key(b)) || a.date.localeCompare(b.date); return dir === 'asc' ? r : -r; });
      const th = (kk, label) => { const cur = k === kk; const nd = cur && dir === 'desc' ? 'asc' : 'desc'; return `<th class="s"><a style="color:#fff" href="/admin/mail.asp?sort=${kk}_${nd}">${label}${cur ? (dir === 'desc' ? ' ▼' : ' ▲') : ''}</a></th>`; };
      return { title: _t('站内信'), html: head + `<div class="wrap"><p style="color:#666">${_t('全站站内信')} ${rows.length} ${_t('封。点击表头可以排序。')}</p><table class="t"><tr>${th('from', _t('发信人'))}${th('to', _t('收信人'))}<th>${_t('主题')}</th>${th('date', _t('发信时间'))}</tr>${rows.map(m => `<tr><td>${esc(m.from)}</td><td>${esc(m.to)}</td><td><a href="/admin/mail.asp?id=${encodeURIComponent(m.id)}&sort=${sort}">${esc(strip(m.subject || _t('（无主题）')))}</a>${S.opened[m.id] ? '' : ' <span style="color:#c00">•</span>'}</td><td>${esc(m.date)}</td></tr>`).join('')}</table></div>` };
    }
    return errPage();
  }

  // ============================================================
  // 渲染总入口
  // ============================================================
  function refreshWins(force) { wins.forEach(w => { if (w.o.live || force) w.refresh(); }); }
  function renderAll() {
    if (!S || awaitingPuzzleFeedback()) return;
    const brand = $('.brand');
    if (brand) brand.textContent = playerText(_t('老K工作室 · 读盘机'));
    renderPhone();
    if (S.stage === 'win' && $('#desktop')) {
      if (renderedFlagVer !== flagVer) { renderedFlagVer = flagVer; renderIcons(); refreshWins(); }
      renderTray();
    }
  }

  // ============================================================
  // 启动
  // ============================================================
  // ============================================================
  // 二代：还原点时间轴、文件比较、十七户名单、寄出
  // ============================================================
  // 还原点：D.snapshots = [{ id, label, date, cut, requires, desc }]，cut 之后的文件和帖子在该时间点不存在。
  // 文件或帖子写 snaps: ['RP101'] 时只在这些时间点出现；同一路径可以放几个版本。
  function snapList() { return (D.snapshots && D.snapshots.length) ? D.snapshots : [{ id: 'cur', label: _t('当前'), date: '' }]; }
  function curSnap() { const id = (S && S.snap) || 'cur'; return snapList().find(x => x.id === id) || snapList()[0]; }
  function snapOK(o) {
    const id = (S && S.snap) || 'cur';
    if (o.snaps) return o.snaps.includes(id);
    const c = curSnap();
    return !c.cut || !o.date || String(o.date) <= c.cut;
  }
  function isDel(t) { return !!t.deleted && !(t.listedIn || []).includes((S && S.snap) || 'cur'); }
  function snapTag() { const c = curSnap(); return c.id === 'cur' ? '' : `　[${c.id} · ${c.date}]`; }
  function setSnap(id) {
    const c = snapList().find(x => x.id === id); if (!c) return;
    S.snap = id; setFlag('visited_' + id);
    flagVer++; refreshWins(true); renderIcons(); renderTray(); renderSnapBanner();
    toast(id === 'cur' ? _t('已回到当前状态。') : `${_t('已挂载只读快照')} ${c.id}（${c.date}）`, 'good');
    dirty();
  }
  function renderSnapBanner() {
    const dk = $('#desktop'); if (!dk) return;
    let b = dk.querySelector('.snapbanner');
    const c = curSnap();
    if (c.id === 'cur') { if (b) b.remove(); dk.classList.remove('snapmode'); return; }
    dk.classList.add('snapmode');
    if (!b) { b = h('button', { class: 'snapbanner', type: 'button', onclick: () => openRestore() }); dk.append(b); }
    b.innerHTML = `<b>${esc(c.id)}</b> · ${esc(c.date)} · ${esc(_t('只读快照'))}<span>${esc(_t('点此切换'))}</span>`;
  }
  function openRestore() {
    openWin({ key: 'restore', title: _t('系统还原'), icon: 'restore', w: 560, h: 440, bodyClass: 'out', live: true, render: (win) => {
      const list = snapList().filter(x => test(x.requires));
      const box = h('div', { class: 'restore' },
        h('div', { class: 'restore-head' }, h('b', { text: _t('还原点') }), h('p', { text: _t('挂载方式：只读') })));
      const ul = h('div', { class: 'restore-list' });
      list.forEach(x => {
        const on = ((S.snap || 'cur') === x.id);
        ul.append(h('button', { class: 'restore-row' + (on ? ' on' : ''), type: 'button', onclick: () => { setSnap(x.id); win.refresh(true); } },
          h('span', { class: 'rd', text: on ? '◉' : '○' }),
          h('span', { class: 'rdate', text: x.date || '' }),
          h('span', { class: 'rid', text: x.id === 'cur' ? _t('当前') : x.id }),
          h('span', { class: 'rdesc', text: x.desc || '' }),
          S.flags['visited_' + x.id] || x.id === 'cur' ? null : h('span', { class: 'newtag', text: _t('新') })));
      });
      box.append(ul);
      win.body.append(box);
      win.status.append(h('div', { text: `${_t('当前挂载：')}${curSnap().id === 'cur' ? _t('当前') : curSnap().id}` }));
    } });
  }

  // 文件比较：任选两份已经读过的文本资料（各个时间点的版本各算一份），按行对照差异
  function cmpText(f) {
    if (f.cmpText != null) return String(f.cmpText);
    if (f.text != null) return String(f.text);
    if (f.html != null) return strip(String(f.html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|tr|li|h\d)>/gi, '\n'));
    if (f.tape) return String((f.tape.speeds || {})['1'] || '');
    return '';
  }
  function cmpLabel(f) {
    const snap = f.snaps ? f.snaps.join('/') : (f.ver || _t('当前'));
    return `${nameOf(f.path)}　[${snap}]`;
  }
  function cmpDocs() { return D.files.filter(f => f.id && S.opened[f.id] && f.type !== 'folder' && f.type !== 'zip' && f.type !== 'exe' && cmpText(f).trim()); }
  function diffLines(a, b, sourceA = a, sourceB = b) {
    const A = a.split('\n'), B = b.split('\n'), n = A.length, m = B.length;
    const rawA = sourceA.split('\n'), rawB = sourceB.split('\n');
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const rows = []; let i = 0, j = 0, hunk = null, hid = 0;
    const flush = () => { if (hunk) { rows.push(hunk); hunk = null; } };
    while (i < n || j < m) {
      if (i < n && j < m && A[i] === B[j]) { flush(); rows.push({ eq: true, l: A[i], r: B[j] }); i++; j++; }
      else {
        hunk = hunk || { id: hid++, l: [], r: [], source: [] };
        if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) { hunk.r.push(B[j]); hunk.source.push(rawB[j] || ''); j++; } else { hunk.l.push(A[i]); hunk.source.push(rawA[i] || ''); i++; }
      }
    }
    flush();
    return rows;
  }
  function markPuzzlesFor(lid, rid) {
    return Object.entries(D.puzzles).filter(([id, p]) => p.kind === 'mark' && !solved(id) && test(p.requires) && p.pair && p.pair.includes(lid) && p.pair.includes(rid) && lid !== rid);
  }
  function openCompare(opts = {}) {
    const ex = wins.find(w => w.key === 'compare');
    if (ex) { if (opts.puzzle) ex.state.puzzle = opts.puzzle; if (opts.left) ex.state.l = opts.left; focusWin(ex); ex.refresh(true); return; }
    openWin({ key: 'compare', title: _t('文件比较'), icon: 'compare', w: 980, h: 660, bodyClass: 'out', live: true, state: { l: opts.left || '', r: '', sel: null, puzzle: opts.puzzle || null, msg: '' }, render: renderCompare });
  }
  function renderCompare(win) {
    const st = win.state, docs = cmpDocs();
    const fileLabel = file => {
      const label = cmpLabel(file);
      return file.evidenceOwner ? nameOf(parentOf(file.path)) + ' · ' + label : label;
    };
    docs.sort((a, b) => fileLabel(a).localeCompare(fileLabel(b), 'zh-CN', { numeric: true, sensitivity: 'base' }));
    const pick = (key) => {
      const s = h('select', { class: 'f98 cmp-sel', id: 'cmp_' + key, 'aria-label': key === 'l' ? _t('左侧文件') : _t('右侧文件') }, h('option', { value: '', text: _t('— 选择一份已读过的资料 —') }));
      docs.forEach(f => s.append(h('option', { value: f.id, text: fileLabel(f), selected: st[key] === f.id })));
      s.onchange = () => { st[key] = s.value; st.sel = null; st.msg = ''; win.refresh(true); };
      return bindTouchSelect(s, win);
    };
    win.top.append(h('div', { class: 'cmp-pick' }, h('label', { text: _t('左：') }), pick('l'), h('label', { text: _t('右：') }), pick('r')));
    const P = st.puzzle && D.puzzles[st.puzzle] && !solved(st.puzzle) ? [st.puzzle, D.puzzles[st.puzzle]] : null;
    const L = D.files.find(f => f.id === st.l), R = D.files.find(f => f.id === st.r);
    const body = win.body;
    const active = P || (L && R ? markPuzzlesFor(L.id, R.id)[0] : null);
    if (active) {
      const [pid, p] = active;
      const hints = puzzleHints(pid, p);
      const matches = L && R && p.pair.includes(L.id) && p.pair.includes(R.id) && L.id !== R.id;
      const ban = h('div', { class: 'cmp-task' },
        h('div', { class: 'k', text: _t('待核对') }), h('b', { text: p.title }), h('div', { html: fmt(p.prompt || '') }), hints.box,
        h('div', { class: 'row' }, hints.button,
          h('button', { class: 'b98', type: 'button', text: _t('提交选中的差异'), disabled: !(matches && st.sel != null), onclick: () => {
            const rows = diffLines(cmpText(L), cmpText(R), L.sourceText, R.sourceText), hk = rows.find(x => !x.eq && x.id === st.sel);
            const text = hk ? hk.source.join('\n') : '';
            const want = [].concat(p.mark);
            markInteraction();
            if (want.some(w => text.includes(w))) { st.msg = p.solvedText || _t('就是这一处。'); solvePuzzle(pid); st.puzzle = null; }
            else { sfx('err'); st.msg = (p.near && Object.entries(p.near).find(([k]) => text.includes(k)) || [0, _t('这处改动跟要查的事无关，再看看别的行。')])[1]; }
            win.refresh(true);
          } })),
        st.msg ? h('div', { class: 'cmp-msg', html: fmt(st.msg) }) : null);
      win.top.append(ban);
    } else if (st.msg) win.top.append(h('div', { class: 'cmp-msg', html: fmt(st.msg) }));
    if (!L || !R) { body.append(h('div', { class: 'empty98', text: _t('在上方选好两份资料，这里就会显示它们的差别。') })); win.status.append(h('div', { text: `${docs.length} ${_t('份可比较的资料')}` })); return; }
    const rows = diffLines(cmpText(L), cmpText(R), L.sourceText, R.sourceText);
    const hunks = rows.filter(x => !x.eq);
    const tb = h('table', { class: 'cmp' });
    tb.append(h('tr', {}, h('th', { text: fileLabel(L) }), h('th', { text: fileLabel(R) })));
    rows.forEach(x => {
      if (x.eq) { tb.append(h('tr', {}, h('td', { text: x.l }), h('td', { text: x.r }))); return; }
      const n = Math.max(x.l.length, x.r.length), cls = x.l.length && x.r.length ? 'chg' : x.l.length ? 'del' : 'add';
      for (let k = 0; k < n; k++) {
        const tr = h('tr', { class: 'hunk ' + cls + (st.sel === x.id ? ' sel' : ''), tabindex: k === 0 ? 0 : null, 'data-h': x.id, 'data-source': x.source.join('\n') },
          h('td', { text: x.l[k] != null ? x.l[k] : '' }), h('td', { text: x.r[k] != null ? x.r[k] : '' }));
        const selectDifference = () => { st.sel = x.id; st.msg = ''; win.refresh(); };
        bindControl(tr, selectDifference);
        tr.onkeydown = (e) => { if (confirmInput(e)) selectDifference(); };
        tb.append(tr);
      }
    });
    body.append(h('div', { class: 'cmp-wrap' }, tb));
    win.status.append(h('div', { text: hunks.length ? `${_t('差异')} ${hunks.length} ${_t('处')}　${_t('黄色：改动　红色：只在左侧　绿色：只在右侧　单击选中一处')}` : _t('两份资料内容相同。') }));
  }

  // 十七户名单：每户要挂上两份能对得上的原件才算确认
  const hhOpen = () => !!(D.households && D.households.length && test(D.hhRequires || 'ch2'));
  const hhVisible = () => (D.households || []).filter(x => test(x.requires));
  const hhState = (id) => (S.hh[id] = S.hh[id] || { ok: false, tries: 0, called: false });
  function hhPending() { return hhOpen() ? hhVisible().filter(x => !hhState(x.id).ok && x.sources.filter(s => S.flags['seen_' + s]).length >= 2).length : 0; }
  function hhPool() {
    const ids = new Set(); (D.households || []).forEach(x => x.sources.forEach(s => ids.add(s))); (D.hhDistractors || []).forEach(s => ids.add(s));
    return [...ids].filter(id => S.flags['seen_' + id]).map(id => ({ id, label: hhSourceLabel(id) }));
  }
  function hhSourceLabel(id) {
    const clip = ((D.footage || {}).clips || []).find(c => c.id === id); if (clip) return `${_t('录像')} ${clip.date}《${clip.title}》`;
    const f = D.files.find(x => x.id === id); if (f) return cmpLabel(f);
    if (/^t\d+$/.test(id)) { const t = THREAD[+id.slice(1)]; return t ? `${_t('论坛帖')} #${t.id}《${strip(t.title)}》` : id; }
    const it = ITEM[id]; if (it) return `${_t('物品')}：${strip(it.name)}`;
    const m = MAIL26[id]; if (m) return `${_t('邮件')}：${strip(m.subject)}`;
    return id;
  }
  function renderHouseholds(title, body) {
    const list = hhVisible(), ok = list.filter(x => hhState(x.id).ok).length;
    title(_t('名单'), `B17 · ${ok} / ${(D.households || []).length} ${_t('户已确认')}`);
    body.append(h('div', { class: 'ph-card done', html: _t('每一户都要两份互相独立、能对得上的原件才算确认。点开一户，挂上你认为说的是同一户的两份资料。') }));
    if (S.flags.c6_sendout && !S.flags.sent_done) body.append(h('button', { class: 'ph-btn pri', style: { width: '100%', margin: '6px 0 10px' }, text: _t('打开「寄出」'), onclick: openSendOut }));
    list.forEach(x => {
      const s = hhState(x.id);
      const card = h('div', { class: 'ph-card hh' + (s.ok ? ' ok' : '') });
      card.append(h('div', { class: 'k', text: x.id + (s.ok ? '' : ' · ' + _t('未确认')) }));
      if (!s.ok) {
        card.append(h('div', { html: fmt(x.clue || _t('名册上只剩一个编号。')) }), h('button', { class: 'ph-btn sm', text: _t('挂上原件核对'), onclick: () => hhAttach(x) }));
      } else {
        card.append(h('div', { style: { fontWeight: 600 }, html: fmt(x.name + (x.addr ? '　<span class="faded">' + x.addr + '</span>' : '')) }));
        (x.facts || []).filter(fc => test(fc.requires)).forEach(fc => card.append(h('div', { class: 'hh-fact', html: fmt(fc.text) })));
        const consent = s.called ? x.call.consent : null;
        if (x.call && test(x.call.requires) && !s.called) card.append(h('button', { class: 'ph-btn sm', text: _t('2026 年回访'), onclick: () => hhCall(x) }));
        if (s.called) card.append(h('div', { class: 'hh-fact', html: fmt(x.call.result || '') }), h('div', { class: 'hh-tag ' + (consent ? 'yes' : 'no'), text: consent ? _t('同意公开姓名') : _t('不同意公开姓名') }));
        else if (!x.call) card.append(h('div', { class: 'hh-tag', text: _t('无法回访：没有本人意见') }));
      }
      body.append(card);
    });
  }
  function hhAttach(x) {
    const pool = hhPool(), m = modalRoot(); m.innerHTML = '';
    const chosen = new Set();
    const msg = h('div', { class: 'msg' });
    const listBox = h('div', { class: 'opts' });
    if (!pool.length) listBox.append(h('div', { class: 'faded', text: _t('还没有读过能用来核对名单的原件。') }));
    pool.forEach(o => {
      const cb = h('input', { type: 'checkbox', id: 'hh_' + o.id });
      cb.onchange = () => { if (cb.checked) chosen.add(o.id); else chosen.delete(o.id); };
      listBox.append(h('label', {}, cb, h('span', { text: o.label })));
    });
    const dlg = h('div', { class: 'dlg98 dlgph', role: 'dialog' },
      h('div', { class: 'titlebar' }, h('span', { class: 't', text: `${x.id} · ${_t('挂上原件')}` }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), text: '×' }, closeModal)),
      h('div', { class: 'wbody' }, h('div', { class: 'prompt', html: fmt(x.clue || '') + '<br>' + _t('选出两份说的是同一户的原件。') }), listBox, msg,
        h('div', { class: 'row' }, controlButton({ class: 'b98', text: _t('取消') }, closeModal), controlButton({ class: 'b98', text: _t('核对') }, () => {
          markInteraction();
          const s = hhState(x.id);
          if (chosen.size !== 2) { msg.textContent = _t('请正好选两份。'); return; }
          if ([...chosen].every(id => x.sources.includes(id))) {
            s.ok = true; setFlag('hh_' + x.id.replace('-', '_')); setFlag('hhcount_' + (D.households.filter(y => hhState(y.id).ok).length));
            closeModal(); sfx('ok'); toast(`${x.id} ${_t('已确认：')}${x.name}`, 'good'); act(x.onConfirm); dirty();
          } else {
            s.tries++; sfx('err');
            const one = [...chosen].some(id => x.sources.includes(id));
            msg.textContent = one ? _t('其中一份对得上，另一份说的是别的人家。') : _t('这两份原件说的都不是这一户。');
            dirty();
          }
        }))));
    m.append(h('div', { class: 'shade', onclick: closeModal }), dlg);
  }
  function hhCall(x) {
    const s = hhState(x.id);
    const m = modalRoot(); m.innerHTML = '';
    const lines = h('div', { class: 'hh-call' });
    const dlg = h('div', { class: 'dlg98 dlgph', role: 'dialog' },
      h('div', { class: 'titlebar' }, h('span', { class: 't', text: `${_t('回访')} · ${x.name}` }), controlButton({ class: 'b98 tbb', 'aria-label': _t('关闭'), text: '×' }, closeModal)),
      h('div', { class: 'wbody' }, lines, h('div', { class: 'row' }, controlButton({ class: 'b98', text: _t('挂断') }, closeModal))));
    m.append(h('div', { class: 'shade', onclick: closeModal }), dlg);
    let i = 0;
    const step = () => { if (i >= x.call.lines.length) { s.called = true; setFlag('called_' + x.id.replace('-', '_')); dirty(); renderPhone(); return; } const [who, t] = x.call.lines[i++]; lines.append(h('p', { class: who === 'me' ? 'me' : 'them', html: fmt(t) })); lines.scrollTop = lines.scrollHeight; later(step, FAST ? 10 : 700); };
    step();
  }

  // 寄出：终章的选择。结局由寄送方式、确认户数和是否尊重每户的公开意愿共同决定。
  function openSendOut() {
    if (S.flags.sent_done || !D.sendOut) return;
    const cfg = D.sendOut, ok = (D.households || []).filter(x => hhState(x.id).ok);
    const wrap = h('div', { class: 'board' }), sheet = h('div', { class: 'sheet sendout' });
    wrap.append(sheet);
    let mode = null;
    const inc = new Set(ok.map(x => x.id));
    const draw = () => {
      sheet.innerHTML = '';
      sheet.append(h('h2', { text: cfg.title }), h('div', { class: 'intro', html: fmt(cfg.intro) }));
      const modes = h('div', { class: 'send-modes' });
      cfg.modes.forEach(md => modes.append(h('label', { class: 'send-mode' + (mode === md.id ? ' on' : '') }, h('input', { type: 'radio', name: 'sendmode', id: 'send_' + md.id, checked: mode === md.id, onchange: () => { mode = md.id; draw(); } }), h('span', {}, h('b', { text: md.label }), h('small', { html: fmt(md.desc) })))));
      sheet.append(modes);
      sheet.append(h('div', { class: 'send-sec', text: `${_t('随信附上的名字')}（${_t('已确认')} ${ok.length} / ${(D.households || []).length}）` }));
      const hl = h('div', { class: 'send-hh' });
      if (!ok.length) hl.append(h('div', { class: 'faded', text: _t('名单上还没有确认的户。') }));
      ok.forEach(x => {
        const s = hhState(x.id), consent = s.called ? x.call.consent : null;
        hl.append(h('label', {}, h('input', { type: 'checkbox', checked: inc.has(x.id), disabled: mode !== 'public', onchange: (e) => { e.target.checked ? inc.add(x.id) : inc.delete(x.id); } }),
          h('span', { text: `${x.id} ${x.name}` }), h('small', { class: 'hh-tag ' + (consent === true ? 'yes' : 'no'), text: consent === true ? _t('同意公开') : consent === false ? _t('不同意公开') : _t('未征得意见') })));
      });
      sheet.append(hl, h('div', { class: 'faded', style: { margin: '6px 0 12px' }, text: _t('只有「公开到论坛」时才需要逐户决定附不附名字；其他方式只交给有权核查的人和本人。') }));
      sheet.append(h('div', { class: 'bar' }, h('button', { class: 'bbtn', text: _t('稍后再决定'), onclick: () => { closeOverlay(); renderAll(); } }), h('button', { class: 'bbtn pri', text: _t('寄出'), disabled: !mode, onclick: send })));
    };
    const send = () => {
      markInteraction();
      const md = cfg.modes.find(x => x.id === mode); if (!md) return;
      const missing = (D.households || []).length - ok.length;
      const exposed = ok.filter(x => inc.has(x.id) && !(hhState(x.id).called && x.call.consent === true));
      const end = D.endings[md.ending];
      const extra = md.extra ? md.extra({ missing, confirmed: ok.length, exposed: exposed.map(x => x.name), public: mode === 'public' }) : '';
      if (end) { end.baseHtml = end.baseHtml || end.html; end.html = end.baseHtml + (extra || ''); }
      setFlag('sent_done'); setFlag('sent_' + mode);
      closeOverlay();
      act({ ending: md.ending });
    };
    draw();
    openOverlay(wrap);
  }

  // 街区地图：D.map.orig 列出的还原点里显示原图，其他时间点显示公示版。
  // spots 是可点的地点（看说明、核对名单、回答地图题），pins 是读过的资料在图上的位置。
  function mapVer() { return ((D.map || {}).orig || []).includes((S && S.snap) || 'cur') ? 'orig' : 'pub'; }
  const mapShow = (x, ver) => (!x.ver || x.ver === ver) && test(x.requires);
  const mapPinSeen = (p) => !!S.flags['seen_' + p.id];
  function mapPuzzles() { return Object.entries(D.puzzles).filter(([id, p]) => p.kind === 'map' && !solved(id) && test(p.requires)); }
  function openMap(opts = {}) {
    const ex = wins.find(w => w.key === 'map');
    if (ex) { if (opts.puzzle) { ex.state.puzzle = opts.puzzle; ex.state.msg = ''; } focusWin(ex); ex.refresh(true); return; }
    openWin({ key: 'map', title: (D.map && D.map.name) || _t('街区地图'), icon: 'map', w: 960, h: 660, bodyClass: 'out', live: true, state: { sel: null, puzzle: opts.puzzle || null, msg: '' }, render: renderMap });
  }
  function mapHouse(sp) { return sp.hh ? (D.households || []).find(x => x.id === sp.hh && test(x.requires)) : null; }
  function renderMap(win) {
    const M = D.map, st = win.state, ver = mapVer(), V = M.versions[ver];
    win.top.append(h('div', { class: 'map-head' }, h('b', { text: V.title }), h('span', { text: V.sub || '' }),
      snapList().filter(s => test(s.requires)).length > 1 ? h('button', { class: 'b98', type: 'button', text: _t('切换还原点…'), onclick: () => openRestore() }) : null));
    const P = st.puzzle && D.puzzles[st.puzzle] && test(D.puzzles[st.puzzle].requires) && !solved(st.puzzle) ? [st.puzzle, D.puzzles[st.puzzle]] : mapPuzzles()[0];
    const sp = st.sel && M.spots[st.sel] && mapShow(M.spots[st.sel], ver) ? M.spots[st.sel] : null;
    if (P) {
      const [pid, p] = P;
      const hints = puzzleHints(pid, p);
      win.top.append(h('div', { class: 'cmp-task' },
        h('div', { class: 'k', text: _t('待核对') }), h('b', { text: p.title }), h('div', { html: fmt(p.prompt || '') }), hints.box,
        h('div', { class: 'row' }, hints.button,
          h('button', { class: 'b98', type: 'button', text: sp ? `${_t('就是这里')}：${sp.label}` : _t('先在图上点一个地点'), disabled: !sp, onclick: () => {
            markInteraction();
            if ([].concat(p.spot).includes(st.sel)) { st.msg = p.solvedText || _t('就是这里。'); st.puzzle = null; solvePuzzle(pid); }
            else { sfx('err'); st.msg = (p.near || {})[st.sel] || _t('地点不符。'); }
            win.refresh(true);
          } })),
        st.msg ? h('div', { class: 'cmp-msg', html: fmt(st.msg) }) : null));
    } else if (st.msg) win.top.append(h('div', { class: 'cmp-msg', html: fmt(st.msg) }));

    const svg = [`<svg class="mapsvg" viewBox="0 0 ${M.w} ${M.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(V.title)}"><defs><pattern id="mhatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#cfe3b8"/><line x1="0" y1="0" x2="0" y2="8" stroke="#9fc184" stroke-width="2"/></pattern></defs>`];
    M.draw.filter(x => mapShow(x, ver)).forEach(x => svg.push(x.svg));
    Object.entries(M.spots).filter(([, s]) => mapShow(s, ver)).forEach(([id, s]) => {
      const x = mapHouse(s), ok = x && hhState(x.id).ok;
      svg.push(`<rect class="spot${s.cls ? ' ' + s.cls : ''}${ok ? ' ok' : ''}${st.sel === id ? ' sel' : ''}" data-spot="${esc(id)}" tabindex="0" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"><title>${esc(s.label)}</title></rect>`);
      if (s.tag) svg.push(`<text class="m-tag" x="${s.x + 6}" y="${s.y + s.h / 2 + 4}">${esc(s.tag)}${ok ? '　' + esc(x.name) : ''}</text>`);
    });
    const pins = (M.pins || []).filter(p => mapPinSeen(p) && mapShow(p, ver));
    pins.forEach(p => svg.push(`<g class="pin" data-pin="${esc(p.id)}" tabindex="0"><circle cx="${p.at[0]}" cy="${p.at[1]}" r="7"/><text x="${p.at[0]}" y="${p.at[1] + 3.5}">${esc(p.mark || '•')}</text><title>${esc(p.label)}</title></g>`));
    svg.push('</svg>');
    const mapBox = h('div', { class: 'map-svg', html: svg.join('') });
    const pick = (el) => {
      const pin = el.closest('[data-pin]');
      if (pin) { const p = M.pins.find(x => x.id === pin.dataset.pin); if (p) goEvidence(p.ev || { type: 'file', id: p.id }); return; }
      const s = el.closest('[data-spot]'); if (s) { st.sel = s.dataset.spot; st.msg = ''; win.refresh(true); }
    };
    bindControl(mapBox, (e, target) => pick(target), e => e.target.closest('[data-pin], [data-spot]'));
    mapBox.onkeydown = (e) => { if (confirmInput(e)) pick(e.target); };

    const side = h('div', { class: 'map-side' });
    if (!sp) side.append(h('div', { class: 'faded', text: _t('尚未选择地点。') }));
    else {
      side.append(h('b', { text: sp.label }));
      const x = mapHouse(sp);
      if (x) {
        const s = hhState(x.id);
        side.append(h('div', { class: 'k', text: `${x.id} · ${s.ok ? _t('已确认') : _t('未确认')}` }));
        if (s.ok) {
          side.append(h('div', { html: fmt(x.name) }));
          (x.facts || []).filter(fc => test(fc.requires)).forEach(fc => side.append(h('div', { class: 'hh-fact', html: fmt(fc.text) })));
          if (s.called) side.append(h('div', { class: 'hh-tag ' + (x.call.consent ? 'yes' : 'no'), text: x.call.consent ? _t('同意公开姓名') : _t('不同意公开姓名') }));
        } else side.append(h('div', { html: fmt(x.clue || '') }), h('button', { class: 'b98', type: 'button', text: _t('挂上原件核对'), onclick: () => hhAttach(x) }));
      } else if (sp.info) side.append(h('div', { html: fmt(sp.info) }));
      (sp.more || []).filter(m => test(m.requires)).forEach(m => side.append(h('div', { class: 'hh-fact', html: fmt(m.text) })));
      const near = pins.filter(p => p.spot === st.sel);
      if (near.length) side.append(h('div', { class: 'k', text: _t('这里的资料') }), ...near.map(p => h('button', { class: 'b98 map-doc', type: 'button', text: p.label, onclick: () => goEvidence(p.ev || { type: 'file', id: p.id }) })));
    }
    if (M.legend) side.append(h('div', { class: 'map-legend', html: fmt(M.legend[ver] || '') }));
    win.body.append(h('div', { class: 'map' }, mapBox, side));
    win.status.append(h('div', { text: `${pins.length} ${_t('份资料已标在图上')}　${ver === 'orig' ? _t('原图') : _t('公示版')}` }));
  }

  // 推理板依据：b.srcPool 里玩家读过的原件会作为「原件」词条出现，空格写成 'src:<文件id>'
  function boardWords(b) {
    const w = Object.assign({}, b.words);
    (b.srcPool || []).forEach(id => {
      if (!S.flags['seen_' + id]) return;
      const file = D.files.find(f => f.id === id);
      const title = '《' + hhSourceLabel(id).replace(/　\[.*\]$/, '').replaceAll('《', '〈').replaceAll('》', '〉') + '》';
      w['src:' + id] = b.sourceLabels?.[id] || (file && file.evidenceOwner ? file.evidenceOwner + '的' + title : title);
    });
    return w;
  }

  // ---- 录像：仪式录像带与老K自己的素材（逐帧看画面描述和口播）----
  const clipsOpen = () => !!(D.footage && test(D.footage.requires));
  const clipList = () => ((D.footage || {}).clips || [])
    .filter(c => test(c.requires))
    .sort((a, b) => b.date.localeCompare(a.date)
      || (b.frames?.[0]?.t || '').localeCompare(a.frames?.[0]?.t || ''));
  const newClips = () => clipsOpen() ? clipList().filter(c => !S.flags['seen_' + c.id]).length : 0;
  const activePick = (kind, key, owner) => {
    const ok = ([id, p]) => !!p && p.kind === kind && !solved(id) && test(p.requires) && (kind !== 'frame' || p.clip === owner);
    const cur = ui[key] ? [ui[key], D.puzzles[ui[key]]] : null;
    return cur && ok(cur) ? cur : (Object.entries(D.puzzles).find(ok) || null);
  };
  function pickBanner(body, pz, selLabel, onSubmit, msgKey) {
    const [pid, p] = pz;
    const hints = puzzleHints(pid, p, 'ph-btn sm');
    body.append(h('div', { class: 'ph-card pick-task' },
      h('div', { class: 'k', text: _t('待核对') }), h('b', { text: p.title }), h('div', { html: fmt(p.prompt || '') }), hints.box,
      h('div', { class: 'row' }, hints.button,
        h('button', { class: 'ph-btn sm pri', text: selLabel ? _t('提交：') + selLabel : _t('先选一帧画面'), disabled: !selLabel, onclick: onSubmit })),
      ui[msgKey] ? h('div', { class: 'pick-msg', html: fmt(ui[msgKey]) }) : null));
  }
  function renderClips(title, body) {
    const clip = ui.clip && clipList().find(c => c.id === ui.clip);
    if (!clip) {
      title(_t('录像'), (D.footage.sub || ''));
      if (D.footage.intro) body.append(h('div', { class: 'ph-card done', html: fmt(D.footage.intro) }));
      clipList().forEach(c => {
        const frameTime = c.frames?.[0]?.t?.slice(0, 5);
        const recorded = [c.date, frameTime].filter(Boolean).join(' ');
        const b = h('button', { class: 'ph-card clipcard' + (S.flags['seen_' + c.id] ? '' : ' new'), type: 'button', onclick: () => { ui.clip = c.id; ui.frameSel = null; ui.frameMsg = ''; renderPhone(); } },
          h('div', { class: 'k', text: c.dur ? `${recorded}　${_t('时长')} ${c.dur}` : recorded }), h('b', { text: c.title }), c.sub ? h('div', { class: 'faded', text: c.sub }) : null);
        body.append(b);
      });
      return;
    }
    if (!S.flags['seen_' + clip.id]) { setFlag('seen_' + clip.id); act(clip.onOpen); }
    title(clip.title, clip.date, () => { ui.clip = null; ui.frameSel = null; ui.frameMsg = ''; renderPhone(); });
    const frames = clip.frames.map((fr, i) => [fr, i]).filter(([fr]) => test(fr.requires));
    const pz = activePick('frame', 'framePuzzle', clip.id);
    if (pz) {
      const sel = ui.frameSel != null && clip.frames[ui.frameSel];
      pickBanner(body, pz, sel ? sel.t : '', () => {
        const [pid, p] = pz; markInteraction();
        if ([].concat(p.frame).includes(sel.t)) { ui.frameMsg = p.solvedText || _t('就是这一帧。'); ui.framePuzzle = null; solvePuzzle(pid); }
        else { sfx('err'); ui.frameMsg = (p.near || {})[sel.t] || _t('再看看别的画面。这一帧里找不到要核对的细节。'); }
        renderPhone();
      }, 'frameMsg');
    } else if (ui.frameMsg) body.append(h('div', { class: 'pick-msg', html: fmt(ui.frameMsg) }));
    if (clip.sub) body.append(h('div', { class: 'faded', style: { margin: '0 2px 8px' }, text: clip.sub }));
    frames.forEach(([fr, i]) => {
      const card = h('div', { class: 'frame' + (ui.frameSel === i ? ' sel' : ''), tabindex: 0, role: 'button', 'aria-pressed': ui.frameSel === i ? 'true' : 'false' },
        h('div', { class: 'tc', text: fr.t }),
        fr.photo ? photoPreview(fr.photo, _t('放大画面')) : null,
        h('div', { class: 'shot', html: fmt(fr.desc || '') }),
        fr.say ? h('div', { class: 'say', html: fmt(fr.say) }) : null);
      const pick = () => { ui.frameSel = i; ui.frameMsg = ''; if (fr.onView) act(fr.onView); renderPhone(); };
      bindControl(card, pick); card.onkeydown = e => { if (e.target === card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(); } };
      body.append(card);
    });
  }

  function photoPreview(html, label) {
    const button = controlButton({ class: 'photo-zoom', text: label, 'aria-label': label }, e => {
      e.stopPropagation(); viewImage(html);
    });
    // 看大图不会代替“选中此帧”，也不会触发素材里的收集事件。
    button.addEventListener('keydown', e => e.stopPropagation());
    return h('div', { class: 'media-photo' }, h('div', { class: 'media-photo-image', html }), button);
  }

  // ---- 坏道修复：沿着 FAT 簇链把文件碎片拼回去 ----
  // 谜题 kind:'chain'：p.start 起始簇号，p.frags 碎片 [{c:簇号, next:下一簇或'??'或null(结尾), text}]，p.order 正确顺序（簇号数组）。
  function chainPuzzles() { return Object.entries(D.puzzles).filter(([id, p]) => p.kind === 'chain' && test(p.requires)); }
  function openDiskFix(opts = {}) {
    const ex = wins.find(w => w.key === 'diskfix');
    if (ex) { if (opts.puzzle) { ex.state.pid = opts.puzzle; ex.state.seq = []; ex.state.msg = ''; } focusWin(ex); ex.refresh(true); return ex; }
    return openWin({ key: 'diskfix', title: _t('坏道修复 - 第六张盘'), icon: 'diskfix', w: 860, h: 600, bodyClass: 'out', live: true, state: { pid: opts.puzzle || null, seq: [], msg: '' }, render: renderDiskFix });
  }
  function renderDiskFix(win) {
    const st = win.state, list = chainPuzzles();
    if (!st.pid || !D.puzzles[st.pid] || !test(D.puzzles[st.pid].requires)) st.pid = (list.find(([id]) => !solved(id)) || list[0] || [null])[0];
    const side = h('div', { class: 'fx-list' }, h('div', { class: 'k', text: _t('受损文件') }));
    if (!list.length) side.append(h('div', { class: 'faded', text: _t('还没有扫描出可以修复的文件。') }));
    list.forEach(([id, p]) => side.append(controlButton({ class: 'fx-file' + (st.pid === id ? ' on' : '') + (solved(id) ? ' ok' : '') }, () => { st.pid = id; st.seq = []; st.msg = ''; win.refresh(true); },
      h('b', { text: p.file }), h('span', { text: solved(id) ? _t('已修复') : `${_t('起始簇')} #${p.start}　${p.frags.length} ${_t('块')}` }))));
    const main = h('div', { class: 'fx-main' });
    const cur = st.pid && D.puzzles[st.pid];
    if (cur) {
      const pid = st.pid, p = cur;
      const hints = puzzleHints(pid, p);
      const feedback = h('div', { class: 'cmp-msg', hidden: !st.msg, html: fmt(st.msg || ''), role: 'status' });
      const cards = new Map();
      let drawSelection = () => {};
      main.append(h('div', { class: 'cmp-task' }, h('div', { class: 'k', text: solved(pid) ? _t('已修复') : _t('待恢复') }), h('b', { text: p.title }), h('div', { html: fmt(p.prompt || '') }), hints.box,
        solved(pid) ? feedback : null));
      main.append(h('div', { class: 'fx-dir', text: `${_t('目录项')}：${p.file}　${_t('起始簇')} #${p.start}　${p.size || ''}` }));
      if (!solved(pid)) {
        const strip = h('div', { class: 'fx-strip', role: 'status', 'aria-label': _t('待校验簇链') });
        const undo = controlButton({ class: 'b98', text: _t('退一块') }, () => { st.seq.pop(); st.msg = ''; drawSelection(); });
        const clear = controlButton({ class: 'b98', text: _t('清空') }, () => { st.seq = []; st.msg = ''; drawSelection(); });
        const verify = controlButton({ class: 'b98', text: _t('拼接并校验') }, () => {
          if (st.seq.length !== p.frags.length) return;
          markInteraction();
          const bad = p.order.findIndex((c, i) => st.seq[i] !== c);
          if (bad < 0) { st.msg = p.solvedText || _t('文件已修复。'); st.seq = []; solvePuzzle(pid); win.refresh(true); }
          else { sfx('err'); st.msg = bad === 0 ? _t('校验失败：起始簇不符。') : `${_t('校验失败：第')} ${bad + 1} ${_t('块不连续。')}`; drawSelection(); }
        });
        main.append(h('div', { class: 'fx-selection' }, strip, h('div', { class: 'row fx-row' }, hints.button, undo, clear, verify), feedback));
        // Keep fragment nodes and their scroll position while a finger selects them.
        drawSelection = () => {
          strip.replaceChildren();
          if (!st.seq.length) strip.append(h('span', { class: 'faded', text: _t('待校验簇链：空') }));
          st.seq.forEach((c, i) => strip.append(h('span', { class: 'fx-chip', text: '#' + c + (i < st.seq.length - 1 ? ' →' : '') })));
          undo.disabled = clear.disabled = !st.seq.length;
          verify.disabled = st.seq.length !== p.frags.length;
          feedback.hidden = !st.msg; feedback.innerHTML = fmt(st.msg || '');
          for (const [c, { card, picked }] of cards) {
            const index = st.seq.indexOf(c), used = index >= 0;
            card.disabled = used; card.classList.toggle('used', used); card.setAttribute('aria-pressed', String(used));
            picked.hidden = !used; picked.textContent = used ? `${_t('已选')} · ${_t('第')}${index + 1}${_t('块')}` : '';
          }
        };
      }
      const grid = h('div', { class: 'fx-grid' });
      const shown = solved(pid) ? p.order.map(c => p.frags.find(f => f.c === c)) : p.frags;
      shown.forEach(f => {
        const picked = h('span', { class: 'fx-picked', hidden: true });
        const card = controlButton({ class: 'fx-frag', disabled: solved(pid), 'aria-pressed': 'false' }, () => {
          if (solved(pid) || st.seq.includes(f.c)) return;
          st.seq.push(f.c); st.msg = ''; drawSelection();
        },
          h('span', { class: 'fx-head' }, h('b', { text: '#' + f.c }), picked, h('span', { text: f.next === null ? _t('文件结尾') : f.next === '??' ? _t('下一簇：??（坏道）') : `${_t('下一簇')}：#${f.next}` })),
          h('span', { class: 'fx-text', text: f.text }));
        cards.set(f.c, { card, picked });
        grid.append(card);
      });
      main.append(grid);
      drawSelection();
    } else main.append(h('div', { class: 'empty98', text: _t('还没有可以修复的文件。') }));
    win.body.append(h('div', { class: 'fx' }, side, main));
    win.status.append(h('div', { text: `${list.filter(([id]) => solved(id)).length} / ${list.length} ${_t('个受损文件已修复')}` }));
  }

  const PATCHES = [];
  function patch(fn) { PATCHES.push(fn); }

  function boot() {
    bindTextInputs();
    guardControlClicks();
    PATCHES.forEach(fn => fn(D));
    { const m = meta(); if (m.story !== 'sixth-disk') { m.story = 'sixth-disk'; m.endings = {}; setMeta(m); } }
    prepAnswers();
    if (LANG !== 'zh') applyLang(LANGMAP[LANG]);
    if (window.Y2K2Locale) window.Y2K2Locale.apply(D, LANG, cmpText, SEG);
    applyPhotos();
    document.documentElement.lang = { zh: 'zh-CN', en: 'en', ja: 'ja' }[LANG];
    document.title = _t('千年虫 2：未寄出的明天');
    index(); buildFS();
    document.body.innerHTML = '';
    document.body.append(
      h('div', { id: 'app' },
        h('div', { id: 'deskwrap' }, h('div', { id: 'monitor' }, h('div', { id: 'screen' }), h('div', { class: 'brand', text: _t('老K工作室 · 读盘机') }), h('div', { class: 'led', id: 'led' }))),
        h('div', { id: 'phone' }, h('div', { class: 'ph-status', id: 'phStatus' }), h('div', { class: 'ph-main' }, h('div', { class: 'ph-head', id: 'phHead' }), h('div', { class: 'ph-body', id: 'phBody' }), h('div', { class: 'ph-choices', id: 'phFoot', hidden: true })), h('div', { class: 'ph-tabs', id: 'phTabs' }))),
      controlButton({ id: 'phoneFab', 'aria-label': _t('手机') }, () => togglePhone()),
      h('div', { id: 'modal' }), h('div', { id: 'overlay' }), h('div', { id: 'title', class: 'title', hidden: true }), h('div', { id: 'toast' }));
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => document.addEventListener(ev, resetIdle, { passive: true }));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (ctxEl) closeCtx(); else if ($('#modal').children.length) closeModal(); else if (overlay().classList.contains('on') && overlay().querySelector('.board, .viewer')) { closeOverlay(); showCards(); renderAll(); } }
    });
    setInterval(() => { if (!S) return; renderTray(); const st = $('#phStatus'); if (st) { const t = phoneNow(); st.querySelector('b') && (st.querySelector('b').textContent = t.hm); } }, 15000);
    setInterval(() => { if (S && !titleOn) { tickPlay(); writeSave('auto'); } }, 30000);
    document.addEventListener('visibilitychange', () => { syncPlayClock(); if (S && !titleOn) writeSave('auto'); });
    window.addEventListener('pagehide', () => { if (S && !titleOn) writeSave('auto'); playClockRunning = false; });
    window.addEventListener('pageshow', syncPlayClock);
    window.addEventListener('beforeunload', () => { if (S && !titleOn) writeSave('auto'); });
    window.addEventListener('resize', () => {
      if (!narrow() && ui.phoneOpen) togglePhone(false);
      const dk = desktop(); if (!dk) return;
      wins.forEach(w => {
        if (w.el.classList.contains('max')) return;
        w.el.style.left = Math.max(0, Math.min(parseFloat(w.el.style.left) || 0, dk.clientWidth - w.el.offsetWidth)) + 'px';
        w.el.style.top = Math.max(0, Math.min(parseFloat(w.el.style.top) || 0, dk.clientHeight - w.el.offsetHeight)) + 'px';
      });
    });
    S = fresh(_t('老K'));
    const reload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
    const resume = reload && sessionScreen() === 'game' && location.hash !== '#leaderboard' && readSave('auto');
    if (resume) loadState(resume); else showTitle();
    if (location.hash === '#leaderboard') $('#title .leaderboard-entry')?.click();
    window.Y2KStats?.start();
  }

  // 测试与调试用（浏览器控制台）
  const debug = { get state() { return S; }, get pre() { return preEndSnap; }, D, test, act, setFlag: (f) => { setFlag(f); dirty(); }, solve: (id) => { solvePuzzle(id); dirty(); }, board: (id) => { if (!canOpenBoard(id)) return; setFlag('board_' + id); act(D.boards[id].onSolve); dirty(); }, openBoard, openFile: (id) => openFile(D.files.find(f => f.id === id)), openIE, ieGo: (u) => { const w = wins.find(x => x.key === 'ie'); w ? ieGo(w, u) : openIE(u); }, choose, flush: () => { clearTimers(); running = {}; typing = {}; }, fast: (on) => { FAST = on !== false; }, update: () => update(), ui, checkPuzzle, norm, showProps, closeModal, closeAllWins, openGexun, openApp, renderPhone, wins: () => wins, closeOverlay, showCards };
  return { add, boot, lang, patch };
})();

Y2K.add({"chapters":[{"id":"ch0","num":"序章","name":"开盒","date":"2026-12-20","time":"21:30","trigger":"start","intro":"2026年12月20日，晚上。梧城下了今冬第一场雪。<br><br>七中那期视频上线两周，找你修电脑的人多了一倍。<br><br>手机响了。一位没见过面的陈先生问你，工作室里还有没有能读软盘的机器。"},{"id":"ch1","num":"第一章","name":"封条","date":"2026-12-21","time":"10:00","trigger":"dlg_c0_end","intro":"江老师说，那天是他亲手封的，五个孩子一人一张。<br><br>第六张是谁放的？什么时候放的？<br><br>胶囊封存那晚，有人拿着家用摄像机，录下了整个仪式。"}],"files":[{"id":"d_caps","path":"C:/胶囊软盘","type":"folder","date":"2026-12-20 22:10","requires":"c0_image_ready"},{"id":"d_d1","path":"C:/胶囊软盘/盘1（蓝·陈一鸣）","type":"folder","date":"1999-12-31 21:32","requires":"c0_image_ready"},{"id":"d_d2","path":"C:/胶囊软盘/盘2（黑·赵小川）","type":"folder","date":"1999-12-31 22:12","requires":"c0_image_ready"},{"id":"d_d3","path":"C:/胶囊软盘/盘3（白·白露）","type":"folder","date":"1999-12-31 22:15","requires":"c0_image_ready"},{"id":"d_d4","path":"C:/胶囊软盘/盘4（绿·孟凡）","type":"folder","date":"1999-12-31 22:18","requires":"c0_image_ready"},{"id":"d_d5","path":"C:/胶囊软盘/盘5（粉·米乐）","type":"folder","date":"1999-12-31 22:20","requires":"c0_image_ready"},{"id":"d_d6","path":"C:/胶囊软盘/盘6（无标签）","type":"folder","date":"2026-12-20 22:30","requires":"c0_image_ready"},{"id":"d_work","path":"C:/工作","type":"folder","date":"2026-12-20 22:00","requires":"ch0"},{"id":"f_d6_dir","path":"C:/胶囊软盘/盘6（无标签）/目录.txt","type":"txt","date":"2026-12-20 22:30","requires":"c0_image_ready","props":{"来源":"工作室读盘机生成的目录报告，保存在工作盘的只读副本中"},"text":"灰色软盘 · 目录读取报告\n生成于 2026-12-20 22:30　老K工作室读盘机\n\n卷标：（无）\n卷序列号：041A-152C\n制作工具：QNP-FMT 1.0（少年宫制盘程序）\n扩展记录：读取失败（所在扇区有坏道），待补读\n\n文件名        大小    日期        状态\nLETTER.TXT    5,228   ??-??-??    坏道，无法读取\nCONFESS.TXT   2,708   ??-??-??    坏道，无法读取\nCHAT.LOG      2,644   ??-??-??    坏道，无法读取\nFOUND.TXT     2,980   ??-??-??    坏道，无法读取\n\n目录区受损，四个文件的原始日期都没读出。后来补读的结果另存。\n外观：金属挡板有一道划痕，留下的时间和原因不明。"},{"id":"f_serial_help","path":"C:/工作/卷序列号怎么换算.txt","type":"txt","date":"2024-03-02 23:10","requires":"p2_seal_received","text":"给自己记的：少年宫 QNP-FMT 1.0 制盘记录（只适用于这个程序，不是通用 FAT 规则）\n\nQNP-FMT 把制盘时电脑显示的月日时分写入卷序列号，形如 XXXX-YYYY（十六进制）：\n  前四位 XXXX = 月 × 256 + 日\n  后四位 YYYY = 时 × 256 + 分\n\n例：0C1F-1705\n  0C1F = 3103 = 12 × 256 + 31 → 12月31日\n  1705 = 5893 = 23 × 256 + 5  → 23:05\n\n这个字段不含年份。年份另记在引导扇区后面的一条扩展记录里，共四个字节：\n  星期（1字节）　01—07，星期一记 01，星期日记 07\n  日序（2字节）　当天是这一年的第几天，1月1日记 1\n  年份（1字节）　只记后两位，十位、个位各占半个字节。99 是 1999，03 是 2003\n\n1998年写的程序，年份也只留了两位。\n\n扩展记录读不全的时候，翻万年历太慢，记两条规矩：\n  · 同一个日子，隔一年，星期往后挪一天；中间夹着2月29日的，挪两天。\n  · 3月1日以后的日子，闰年的日序比平年多 1。\n\n盘片背面的批号只能排除过早的年份。算出来的时间，还得跟文件内容、外部记录核对。"},{"id":"f_d1_letter","evidenceOwner":"陈一鸣","path":"C:/胶囊软盘/盘1（蓝·陈一鸣）/给2026年的我.txt","type":"txt","date":"1999-12-31 21:32","requires":"c0_image_ready","text":"2026年的陈一鸣：\n\n我是除虫小队队长陈一鸣。今天是1999年12月31日，我们刚帮卫生站查完电脑。\n\n我想你已经开了自己的公司，有很多电脑，再也不用抢少年宫那台奔腾了。\n\n今晚我要上楼顶拍倒计时，那是全梧城最好的位置。等四十岁的时候，我请他们四个吃饭。孟凡得坐我边上。靠窗的位子他也想要，那就猜拳，三局两胜。\n\n队长 陈一鸣"},{"id":"f_d1_sheet","path":"C:/胶囊软盘/盘1（蓝·陈一鸣）/千年虫自查表（空白）.txt","type":"txt","date":"1999-12-12 16:30","requires":"c0_image_ready","text":"千年虫自查表　梧城少年宫 · 除虫小队\n\n检查人：________　地点：________　时间：________\n\n□ 1. BIOS 日期能不能跳到2000年\n□ 2. 系统日期是不是四位年份\n□ 3. 打补丁（光盘：千年虫补丁 v2.1）\n□ 4. 重启以后再看一次\n\n修好了，签自己的名字。没修好，也签自己的名字，写上为什么。\n\n——许嘉　1999.12.12"},{"id":"f_d1_hidden","path":"C:/胶囊软盘/盘1（蓝·陈一鸣）/队长守则.txt","type":"txt","date":"1999-12-31 21:33","requires":"c0_image_ready","hidden":true,"onOpen":{"collect":"p_chen"},"text":"（隐藏文件）\n\n四十岁的陈一鸣：别光顾着赢。"},{"id":"f_d2_letter","evidenceOwner":"赵小川","path":"C:/胶囊软盘/盘2（黑·赵小川）/给2026年的我.txt","type":"txt","date":"1999-12-31 22:12","requires":"c0_image_ready","onOpen":{"note":"n_f_d2"},"text":"四十岁的我：\n\n你还在做模型吗？我在做一个天文台的模型。圆顶一转就卡，满满非要往里头塞个小人，说得有个人来开门。你要是造了个真的，记得给她也留把钥匙。\n\n今天封盒要用的铜模子，是我在金工课上做的。我做了两个，一个给江老师，一个我自己留着。等四十岁那天，胶囊打开以后，我要自己再封一次，封给六十岁的我们。\n\n许嘉哥说，修好了要签自己的名字。我今天修好了两台，签了两次。\n\n赵小川"},{"id":"f_d2_hidden","path":"C:/胶囊软盘/盘2（黑·赵小川）/背面.txt","type":"txt","date":"1999-12-31 22:13","requires":"c0_image_ready","hidden":true,"onOpen":{"collect":"p_xiaochuan"},"text":"（隐藏文件）\n\n四十岁的赵小川：别怕说真话。"},{"id":"f_d3_letter","evidenceOwner":"白露","path":"C:/胶囊软盘/盘3（白·白露）/给2026年的我.txt","type":"txt","date":"1999-12-31 22:15","requires":"c0_image_ready","onProps":{"collect":"p_bailu"},"props":{"作者":"白露","备注":"四十岁的白露：别替别人做决定。"},"text":"2026年的白露：\n\n你当上医生了吗？上个礼拜天刘阿姨借我听诊器，我听了自己的心跳。咚、哒，停一下，又咚、哒。我想问这算一下还是两下，她让人叫走了。下回记得问。\n\n今天在卫生站，护士阿姨说，电脑每天晚上都会给张奶奶打电话，提醒她吃药。一鸣在前台电脑上找到了张奶奶的名字，指给我看。我们九点才到。我想看看八点那通电话打通了没有。一鸣只找得到名字，点来点去也没找到拨号记录。\n\n希望四十岁的时候，我们五个还在一起。\n\n白露"},{"id":"f_d4_letter","evidenceOwner":"孟凡","path":"C:/胶囊软盘/盘4（绿·孟凡）/给2026年的我.txt","type":"txt","date":"1999-12-31 22:18","requires":"c0_image_ready","text":"四十岁的孟凡：\n\n你开上大卡车了吗？我爸说开卡车能去很远的地方。\n\n今天在卫生站，前台那台电脑是我跟一鸣查的。我外婆一个人住在卫生站后头，每天晚上八点，卫生站都会打电话提醒她吃心脏的药。护士阿姨说，外婆的电话号码就是从这台电脑输进去的。\n\n一鸣签字签得最快，他说人多了就占不着好地方，把手电扔给我，说楼顶见。外婆说哪天要坐我的车去东湖，问我开车稳不稳。我说你先等等，我脚还够不着呢。\n\n孟凡"},{"id":"f_d4_hidden","path":"C:/胶囊软盘/盘4（绿·孟凡）/我爸.txt","type":"txt","date":"1999-12-31 22:19","requires":"c0_image_ready","hidden":true,"onOpen":{"collect":"p_mengfan"},"text":"（隐藏文件）\n\n四十岁的孟凡：少喝酒。我爸就是喝酒才天天吵架的。"},{"id":"f_d5_letter","evidenceOwner":"米乐","path":"C:/胶囊软盘/盘5（粉·米乐）/给2026年的我.txt","type":"txt","date":"1999-12-31 22:20","requires":"c0_image_ready","text":"亲爱的四十岁的米乐：\n\n我的盘是粉色的！\n\n你当上老师了吗？上课记得往后排看一眼。小川举手举到一半，老师一转身他就放下去了，我明明看见了。还有，上课有人嗑瓜子，你可以把瓜子收走，可等下课了得还人家。\n\n我们五个说好了，四十岁的时候一起打开这个盒子。一个都不能少。\n\n米乐"},{"id":"f_d1_plan","path":"C:/胶囊软盘/盘1（蓝·陈一鸣）/倒计时拍摄计划.txt","type":"txt","date":"1999-12-28 21:30","requires":"c0_image_ready","text":"千禧倒计时 拍摄计划（导演：陈一鸣）\n\n机位：少年宫楼顶，东南角栏杆（能同时拍到七中和电视塔）\n器材：爸爸的 DV，电池两块，带子一盘（60分钟）\n\n12.31\n21:00　卫生站查电脑（江老师派的，快点弄完）\n21:40　上楼顶占机位！！！晚了就被高中生占了\n23:30　下楼放盘、封胶囊（不能缺席，我是队长）\n23:40　回楼顶\n23:59:50　开拍，倒数十秒\n00:00　烟花\n\n备注：孟凡负责举电筒。倒数前把 DV 架好，开拍后我也入镜。"},{"id":"f_d1_company","path":"C:/胶囊软盘/盘1（蓝·陈一鸣）/我的公司.txt","type":"txt","date":"1999-12-30 20:15","requires":"c0_image_ready","text":"以后我要开一家公司。\n\n名字：鸣远（一鸣惊人，远走高飞）\n标志：一个“鸣”字，口字旁画成一台摄像机的镜头\n口号：先赢再说\n\n第一个员工：孟凡（他说他要开卡车，那就给公司开车）\n第二个员工：小川（做道具）\n白露当公司医生。米乐负责发瓜子。\n\n——陈一鸣 1999.12.30"},{"id":"f_d2_mold","path":"C:/胶囊软盘/盘2（黑·赵小川）/模子图纸.txt","type":"txt","date":"1999-12-18 17:00","requires":"c0_image_ready","onProps":{"collect":"p_star6"},"props":{"作者":"赵小川","备注":"图纸右下角画着一小团星星：昴星团，七姐妹。旁边写：七颗，我只数得出六颗。"},"text":"铅封模子 图纸（金工课作业）\n\n材料：黄铜圆棒，直径 45mm，长 30mm\n字：梧城少年宫 1999.12.31\n注意！！！字要反着刻，压出来才是正的。\n\n深度 0.8mm。“9”的尾巴最细，最容易崩，刻的时候慢一点。\n\n做两个。\n一个给江老师封胶囊用。\n一个我自己留着，等四十岁那天，胶囊打开以后，我们再封一次。"},{"id":"f_d2_star","path":"C:/胶囊软盘/盘2（黑·赵小川）/星图.txt","type":"txt","date":"1999-12-31 22:14","requires":"c0_image_ready","hidden":true,"onOpen":{"collect":"p_star3"},"text":"（隐藏文件）\n\n北极星。\n它不动，别的星都绕着它转。\n迷路了就找它。\n\n等我们四十岁，我想做一个比少年宫楼顶大十倍的天文台，带他们四个去看。"},{"id":"f_d2_plan2000","path":"C:/胶囊软盘/盘2（黑·赵小川）/2000年要看的.txt","type":"txt","date":"1999-12-31 22:13","requires":"c0_image_ready","text":"2000年要看的：\n\n1. 1月21日 月全食（要早起，大概中午……不对，是北京时间中午，看不到。算了）\n2. 夏天的银河，去东湖那边，没有路灯\n3. 狮子座流星雨（东湖钓叟爷爷说2001年最多）\n4. 我的生日 4月26日，晚上看猎户座最后一眼\n\n记录人：赵小川"},{"id":"f_d3_questions","path":"C:/胶囊软盘/盘3（白·白露）/我的问题本.txt","type":"txt","date":"1999-12-26 21:00","requires":"c0_image_ready","text":"问题本（问许嘉哥和江老师的）\n\n1. 为什么不一开始就存四位？——省两个字节。七十年代很贵。\n2. 如果零点以后机器坏了，谁负责？——江老师说：签字的人负责。\n3. 卫生站那台电脑，是它自己打电话吗？——许嘉哥说，不是，前台只是窗口。我还没听懂。\n4. 医生和修电脑的人，哪个更厉害？——许嘉哥说，都一样，都要先查清楚，再签字。\n\n还没问的：\n5. 张奶奶的电话，会不会响？"},{"id":"f_d4_grandma","path":"C:/胶囊软盘/盘4（绿·孟凡）/外婆的电话.txt","type":"txt","date":"1999-12-26 20:30","requires":"c0_image_ready","text":"外婆耳朵背，有时候响几声才听见。等她慢慢挪到电话跟前，都响十声了。\n护士阿姨说，不怕，头一回没接着，电脑还会再打，一晚上能打三遍。\n\n外婆说，电话一响，她就知道八点了，该吃药了，也知道有人还记得她。\n\n千禧年以后，我想给外婆买一个大声的电话。等我开上卡车，第一个拉她去东湖。"},{"id":"f_d5_list","path":"C:/胶囊软盘/盘5（粉·米乐）/一个都不能少.txt","type":"txt","date":"1999-12-31 22:21","requires":"c0_image_ready","text":"除虫小队 生日表（米乐整理）\n\n陈一鸣　9月14日　爱吃：辣条\n孟凡　　7月18日　爱吃：外婆包的饺子\n白露　　11月8日　爱吃：话梅\n赵小川　4月26日　爱吃：什么都行，给他就吃\n米乐　　5月20日　爱吃：瓜子（我自己）\n\n规矩：谁过生日，其他四个人都要到。"},{"id":"f_d5_tape","path":"C:/胶囊软盘/盘5（粉·米乐）/录像带目录.txt","type":"txt","date":"1999-12-31 22:22","requires":"c0_image_ready","text":"我爸的录像带（家里柜子第二层）\n\n1. 1997 春节\n2. 1998 我上计算机班\n3. 1999.12.31 少年宫胶囊（我爸拍！我负责举话筒）\n\n我爸说，录像机右下角的时间要对准，不然以后谁也不信。我们对了三遍。"},{"id":"f_d3_diary","path":"C:/胶囊软盘/盘3（白·白露）/日记 1231.txt","type":"txt","date":"1999-12-31 22:16","requires":"c0_image_ready","text":"1999年12月31日　晴　冷\n\n今天去卫生站。前台那台电脑是一鸣和孟凡查的。刘阿姨在旁边教我们怎么把要提醒的人输进电脑。\n\n一鸣九点二十就签了字。他说他要去楼顶占机位。我一直看着，屏幕上的日期跟刚开机时一样。他连机器都没重启。\n\n我想叫他等一下，没开口。\n\n许嘉哥说，没修好，也要签自己的名字，写上为什么。可今天那台电脑本来就没分给我查。我要是看见一鸣签错了，是不是也该说一声？\n\n明天，我去跟一鸣说，让他回去再查一遍。\n\n现在要去封胶囊了。写给四十岁的我：你当上医生了吗？"},{"id":"f_d4_draw","path":"C:/胶囊软盘/盘4（绿·孟凡）/孟凡号.jpg","type":"img","date":"1999-12-31 22:19","requires":"c0_image_ready","html":"<svg class=\"evidence-image\" data-photo=\"mengfan-drawing\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"孟凡的画《孟凡号》：大卡车的车斗里坐着外婆，她抱着写有“八点”的大电话；天空有五颗星星，最大的一颗旁边写着“小川说这颗叫天狼星”。\"><title>孟凡的画《孟凡号》：大卡车的车斗里坐着外婆，她抱着写有“八点”的大电话；天空有五颗星星，最大的一颗旁边写着“小川说这颗叫天狼星”。</title><image href=\"/trial-photo-c0c342f976256546.png\" width=\"1448\" height=\"1086\"/></svg>","caption":"等我四十岁，我要把这张画给外婆看。","props":{"作者":"孟凡","备注":"等我四十岁，我要把这张画给外婆看。"}},{"id":"d_klog","path":"C:/工作/读盘记录","type":"folder","date":"2026-12-20 23:59","requires":"ch0"},{"id":"life_f_kelan_receipt","path":"C:/工作/来件/老K/修理单背面.txt","type":"txt","date":"2026-12-21 09:30","requires":"ch1","text":"修理单背面　柯岚留\n\n今天收了三台机器，地址写在袋子上。电源跟机器放一块儿，别又弄混了。靠窗那台是卖早点的李叔的。他说电脑不急，孙女的作文急。给他回个电话吧，他临走前又问了一遍。\n\n晚上饭放在小锅，热一遍就吃。你上回说忙完吃，忙到我回来，锅还是凉的。炉子别开着就戴耳机，我从门口叫你三遍你都没听见。有人找你取机器，先把手里的螺丝放好再起来，你刚才找的那一颗就在裤脚卷边里。\n\n陈先生送来的纸箱我没拆。收件单夹在右边抽屉。门口那个柜子锁不上了，先别放贵重东西，我约了师傅明天来看。师傅明天来之前你可别把锁拆了，人家来了都不知道修哪儿。\n\n楼下小孩问你周日有没有空，想拿坏了的游戏机来。你答应帮看一次，别到时候全忘了。他没钱买新的，在门口问了好几回都不敢进去。我说你脸上那副表情不是不欢迎，是看小字看累了，他说知道，下回先敲门。\n\n还有一件事。你下次讲慢点。今天李叔问了三遍“镜像是把照片变大吗”，你手都伸到下一台机器上去了。\n\n药盒在桌上，照医生说的用。今晚要是能早点关店就回来，我等你吃饭。"},{"id":"handoff_01-封存录像","path":"C:/工作/来件/交接记录/01-封存录像.txt","type":"txt","date":"2026-12-21 10:00","requires":"p2_seal_received","text":"资料交接 · 01-封存录像\n\n盒子里比清单上多了一张软盘。我请江老师问了米乐，他爸当年拍的封盒录像还在不在。\n\n录像找到了，今天江老师发给了我。我把它和这次开箱时拍的画面放在一起，可以对照着看。\n\n另外还有一份 QNP-FMT 的说明，查灰盘编号时用得上。\n\n——老K"},{"id":"f_d6_reread","path":"C:/胶囊软盘/盘6（无标签）/补读记录.txt","type":"txt","date":"2026-12-21 10:20","requires":"solved_c1_serial & c0_image_ready","props":{"来源":"工作室读盘机对灰盘扩展记录的补读结果，保存在工作盘的只读副本中"},"text":"灰色软盘 · 扩展记录补读\n2026-12-21 10:20　老K工作室读盘机　第 14 遍\n\nQNP-FMT 扩展记录（4 字节）\n  星期　　06　　　　　　读出，三遍一致\n  日序　　0074h（116）　读出，三遍一致\n  年份　　0?　　　　　　十位读出是 0；个位落在坏道上，读不出\n\n再读怕伤盘面，先停。\n年份只剩半截，星期和日序倒是好的。\n\n翻了下手边的旧台历：2002年4月26日，星期五。"}],"dialogues":[{"id":"c0_chen","contact":"chen","trigger":"ch0","steps":[{"npc":"老K师傅，我叫陈一鸣。七中那期视频是你做的吧？我看了三遍。有几张软盘，想请你帮我看看。"},{"npc":"1999年跨年那晚，我们五个在梧城少年宫封了个时间胶囊。盒盖上写着2027年1月1号零点开，那时候我们都四十了。"},{"npc":"老少年宫月底就封了，明年一月拆。我把新址的礼堂借下来了，费用公司出。跨年那晚还要直播。"},{"npc":"盒里是我们小时候写的信，一人一张软盘。我问过了，大伙儿都同意先试试还能不能读。师傅，你开盒时给录一段吧，跨年那晚放。"},{"me":"行。我先拷一份。"},{"me":"陈先生，你十三岁写的东西，真敢让公司的人先看？"},{"npc":"哎，那可不行。我都忘了写过谁了。让大伙儿先看自己的，愿意念的再念。明天我把合同发你，钱公司出。"},{"npc":"那我把试盘的事写进预告。盒子在江老师那儿，以前教我们电脑的。他说今晚给你送过去。"}]},{"id":"c0_jiang","contact":"jiang","trigger":"dlg_c0_chen","steps":[{"npc":"老K师傅吧？我是江振华，以前在少年宫教电脑。一鸣让我来送盒子。"},{"npc":"七中那期我看了。许嘉以前也来少年宫上我的课。头一回来，得坐到椅子边上才够得着键盘。后来打起字来，比我都快。唉，这孩子。"},{"npc":"盒子在储藏室的铁柜里放了二十七年。钥匙一直在我这儿，没给过别人。旧楼要拆，我才把盒子拿出来。"},{"npc":"到你门口了。封线锈死在柜里的搁板上，盒子端不出来，封线我剪了。铅块没扔，盖子也还扣着。你开的时候录一下，让几个孩子看看当年的东西。","at":"2026-12-20 22:00"},{"action":{"clock":"2026-12-20 22:00","set":["c0_box"],"toast":"江老师把胶囊送来了"}},{"npc":"五个孩子里有一个……2003年走了。他那张盘，师傅，拿的时候手轻一点。"},{"npc":"读出什么，也跟我说一声。我老了，就想跨年那晚看他们高高兴兴的。"}]},{"id":"c0_end","contact":"jiang","trigger":"solved_c0_odd & dlg_c0_photo_chen","steps":[{"me":"江老师，胶囊里有六张盘。清单上只写了五张。"},{"npc":"……六张？不可能。那天是我亲手封的，五个孩子一人一张。"},{"npc":"是不是哪个孩子多塞了一张？他们那时候调皮。"},{"me":"您看这张照片。最底下那张灰的，一鸣没认出来。您记得是谁放的吗？","html":"<svg class=\"evidence-image\" data-photo=\"unboxing\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘\"><title>开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘</title><image href=\"/trial-photo-17eddff45a8fcaa9.webp\" width=\"1448\" height=\"1086\"/><g transform=\"matrix(.98 -.057 .035 .98 502 118)\" font-family=\"SimSun, serif\" fill=\"#41392c\" opacity=\".76\" aria-hidden=\"true\"><text x=\"0\" y=\"0\" font-size=\"19\" >梧城少年宫 千禧时间胶囊</text><text x=\"0\" y=\"18\" font-size=\"15\" >封存：1999年12月31日 23:35</text><text x=\"0\" y=\"36\" font-size=\"15\" >开启：2027年1月1日 00:00（2026年跨年夜，等我们都四十岁）</text><text x=\"0\" y=\"54\" font-size=\"15\" ></text><text x=\"0\" y=\"72\" font-size=\"15\" >内装：</text><text x=\"0\" y=\"90\" font-size=\"15\" >1. 陈一鸣　软盘一张　蓝</text><text x=\"0\" y=\"108\" font-size=\"15\" >2. 赵小川　软盘一张　黑</text><text x=\"0\" y=\"126\" font-size=\"15\" >3. 白露　　软盘一张　白</text><text x=\"0\" y=\"144\" font-size=\"15\" >4. 孟凡　　软盘一张　绿</text><text x=\"0\" y=\"162\" font-size=\"15\" >5. 米乐　　软盘一张　粉</text><text x=\"0\" y=\"180\" font-size=\"15\" ></text><text x=\"0\" y=\"198\" font-size=\"15\" >共五张。</text><text x=\"0\" y=\"216\" font-size=\"15\" >铅封：梧城少年宫 1999.12.31</text><text x=\"0\" y=\"234\" font-size=\"15\" >保管人：江振华</text></g></svg>"},{"npc":"灰盘我不记得。米乐那张我倒记得，他往里放的时候还喊呢，说他的是粉的。最后到底放了几张，我还真没数。"},{"me":"能不能找找当年封盒的录像？我想数一下，那天放进去的到底是几张。"},{"npc":"米乐他爸拍的，这回办活动刚把带子转出来。我问问米乐，整段能不能发你。你开盒那段也留好啊。"}]},{"id":"c1_jiang","contact":"jiang","trigger":"ch1 & solved_c1_frame","steps":[{"npc":"米乐他爸拍的那盘带子，还看得清人吗？"},{"me":"看得清。有个孩子背着个画了星星的书包，往盒里放了张黑盘。那是小川吧？"},{"npc":"是他。拿涂改液画的，他妈洗了两回也没洗掉。"},{"me":"他那天怎么还背着书包上台？"},{"npc":"喷雾放在书包里呢。那天小川咳了一阵，还是我从他包里拿给他的。"},{"npc":"你从封盒那儿往前倒一点，米乐他爸应该拍着了。"}]},{"id":"c1_kelan","contact":"kelan","trigger":"solved_c1_serial","steps":[{"npc":"又接活了？"},{"me":"嗯，少年宫托我读几张旧软盘。清单上写着五张，盒子开出来倒有六张。"},{"npc":"瞧你，一说“六张”就来劲了。上回修七中那台电脑你也这样。"},{"npc":"今晚可别又熬通宵。上回我去工作室，一开门就看见你躺在地上。"},{"me":"知道。药在抽屉里。"},{"npc":"要在你嘴里。"}]},{"id":"c1_chen","contact":"chen","trigger":"solved_c1_frame","steps":[{"npc":"老K，进展怎么样？"},{"me":"五张彩盘都能读。我正看当年那盘录像，想数数他们到底往盒里放了几张。"},{"npc":"录像？米乐他爸拍的那盘？"},{"npc":"那天我还得顾着楼顶那台相机。礼堂里估计没拍着我几回。"},{"npc":"盒底那张灰盘，能看出来是谁的了吗？"},{"me":"还不行，只能看见几个文件名。"},{"npc":"……读出什么，先告诉我。我是委托人。"},{"me":"陈总，你写的那封信，我可以先发给你。灰盘没署名，我还得查查是谁留下的。"},{"npc":"行，我还真想看看自己那封。"}]},{"id":"p2_seal_delivery","contact":"jiang","trigger":"ch1","steps":[{"npc":"米乐把录像发过来了，封盒那段从头到尾都在。原带他爸还留着呢。"},{"me":"收到了，我跟昨天的开盒录像对对看。灰盘的序列号也能读，等会儿我翻翻 QNP-FMT 的说明书。"},{"action":{"set":["p2_seal_received"],"toast":"已收到封盒录像，可和开箱照片对照"}}]},{"id":"c0_photo_chen","contact":"chen","trigger":"dlg_c0_jiang & solved_c0_odd","steps":[{"me":"陈总，五张彩盘底下还压着一张灰的，没贴标签。你认识吗？","html":"<svg class=\"evidence-image\" data-photo=\"unboxing\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘\"><title>开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘</title><image href=\"/trial-photo-17eddff45a8fcaa9.webp\" width=\"1448\" height=\"1086\"/><g transform=\"matrix(.98 -.057 .035 .98 502 118)\" font-family=\"SimSun, serif\" fill=\"#41392c\" opacity=\".76\" aria-hidden=\"true\"><text x=\"0\" y=\"0\" font-size=\"19\" >梧城少年宫 千禧时间胶囊</text><text x=\"0\" y=\"18\" font-size=\"15\" >封存：1999年12月31日 23:35</text><text x=\"0\" y=\"36\" font-size=\"15\" >开启：2027年1月1日 00:00（2026年跨年夜，等我们都四十岁）</text><text x=\"0\" y=\"54\" font-size=\"15\" ></text><text x=\"0\" y=\"72\" font-size=\"15\" >内装：</text><text x=\"0\" y=\"90\" font-size=\"15\" >1. 陈一鸣　软盘一张　蓝</text><text x=\"0\" y=\"108\" font-size=\"15\" >2. 赵小川　软盘一张　黑</text><text x=\"0\" y=\"126\" font-size=\"15\" >3. 白露　　软盘一张　白</text><text x=\"0\" y=\"144\" font-size=\"15\" >4. 孟凡　　软盘一张　绿</text><text x=\"0\" y=\"162\" font-size=\"15\" >5. 米乐　　软盘一张　粉</text><text x=\"0\" y=\"180\" font-size=\"15\" ></text><text x=\"0\" y=\"198\" font-size=\"15\" >共五张。</text><text x=\"0\" y=\"216\" font-size=\"15\" >铅封：梧城少年宫 1999.12.31</text><text x=\"0\" y=\"234\" font-size=\"15\" >保管人：江振华</text></g></svg>"},{"npc":"我放大看了。蓝盘是我的，灰的没印象。"},{"me":"除了你们五个，当时还有谁站在盒子旁边？"},{"npc":"江老师在，他就站桌边。你问问他？我去找米乐，他小时候连谁拿什么颜色的盘都记得。"}]}],"mails2018":[{"id":"m_c1_news","from":"梧城日报 · 早间推送 <news@example>","date":"2026-12-21 07:30","subject":"七中旧案重新侦查：二十六年前的“千年虫”或另有隐情","requires":"ch1","html":"<p>据警方通报，2000年梧城七中系列死亡案件已重新立案侦查。一名嫌疑人已被羁押。</p><p>当年被认定为“千年虫”的七中学生许嘉，其家属表示，愿意等待调查结论，不接受采访。</p><p>此前，一期修复七中旧电脑的网络视频引发广泛关注。</p>"},{"id":"m_c0_fan","from":"一位观众 <viewer@example>","date":"2026-12-18 23:41","subject":"看完七中那期","requires":"ch0","html":"<p>老K：</p><p>看完七中那期，我在出租屋里坐了很久。我也是梧城人，2000年那年上初一。那时候大人一提“千年虫”，我就以为是个怪物。后来才知道，七中有人拿这三个字当网名。</p><p>你在片子最后说：修电脑第一步是先做镜像，别动原盘，因为原盘只有一张。我记住了。</p><p>谢谢你把那台机器修好。</p>"},{"id":"m_c0_contract","from":"鸣远数据 法务部 <legal@example>","date":"2026-12-21 09:12","subject":"委托合同（千禧胶囊读盘）","requires":"ch1","html":"<p>老K师傅：</p><p>附件为委托合同，要点如下：</p><p>一、读取对象：梧城少年宫1999年千禧时间胶囊内软盘；开盒查验已取得写信人或其家属的同意，提前开盒检修，保留开盒清点录像，跨年夜正式展示。<br>二、读取方式：只读镜像，原盘不做写入。<br>三、公开范围：任何内容上屏前，须取得写信人本人书面同意；涉及已故者，须取得其家属同意。<br>四、本条第三款，委托方不得单方面变更。</p><p>第三、四款是您要求加的，陈总已签字确认。</p><p>鸣远数据 法务部</p>"},{"id":"m_c1_notice","from":"城东拆迁指挥部 <notice@example>","date":"2026-12-21 08:00","subject":"梧城少年宫旧址拆除公告","requires":"ch1","html":"<p>梧城少年宫旧址（城东文化路3号）分区拆除：</p><p>12月下旬　礼堂、东侧附楼<br>12月31日　全面封场，禁止进入<br>2027年1月　主楼及楼顶天文台拆除</p><p>如有遗留物品，请于12月30日前联系原保管人江振华老师。</p>"},{"id":"m_c1_viewer","from":"一位观众 <viewer5@example>","date":"2026-12-21 09:40","subject":"软盘还能读吗","requires":"ch1","html":"<p>老K：</p><p>我在旧书箱里翻到一盒3.5寸软盘，是我爸2001年存的照片。家里翻遍了，没一台电脑能插软盘。</p><p>看你在拍少年宫的胶囊，想问问：二十多年的软盘，还能读吗？</p><p>我爸去年走了。我想看看照片里他年轻时候的样子。</p>"}],"mails2026":[],"items2018":[{"id":"c0_list","name":"胶囊清单（1999年，贴在铁盒盖内侧）","requires":"c0_box","html":"<figure class=\"evidence-photo\"><svg class=\"evidence-image\" data-photo=\"document-paper\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"铁盒盖里的胶囊清单\"><title>铁盒盖里的胶囊清单</title><image href=\"/trial-photo-6ea20b33995faaef.webp\" width=\"1448\" height=\"1086\"/><g fill=\"#39362f\" font-family=\"SimSun, Songti SC, serif\"><text x=\"180\" y=\"145\" font-size=\"35\" >梧城少年宫 千禧时间胶囊</text><text x=\"180\" y=\"195.75\" font-size=\"35\" >封存：1999年12月31日 23:35</text><text x=\"180\" y=\"246.5\" font-size=\"35\" >开启：2027年1月1日 00:00（2026年跨年夜，等我们都四十岁）</text><text x=\"180\" y=\"297.25\" font-size=\"35\" ></text><text x=\"180\" y=\"348\" font-size=\"35\" >内装：</text><text x=\"180\" y=\"398.75\" font-size=\"35\" >1. 陈一鸣　软盘一张　蓝</text><text x=\"180\" y=\"449.5\" font-size=\"35\" >2. 赵小川　软盘一张　黑</text><text x=\"180\" y=\"500.25\" font-size=\"35\" >3. 白露　　软盘一张　白</text><text x=\"180\" y=\"551\" font-size=\"35\" >4. 孟凡　　软盘一张　绿</text><text x=\"180\" y=\"601.75\" font-size=\"35\" >5. 米乐　　软盘一张　粉</text><text x=\"180\" y=\"652.5\" font-size=\"35\" ></text><text x=\"180\" y=\"703.25\" font-size=\"35\" >共五张。</text><text x=\"180\" y=\"754\" font-size=\"35\" >铅封：梧城少年宫 1999.12.31</text><text x=\"180\" y=\"804.75\" font-size=\"35\" >保管人：江振华</text></g></svg></figure><div class=\"paper\">梧城少年宫 千禧时间胶囊<br>封存：1999年12月31日 23:35<br>开启：2027年1月1日 00:00（2026年跨年夜，等我们都四十岁）<br><br>内装：<br>1. 陈一鸣　软盘一张　蓝<br>2. 赵小川　软盘一张　黑<br>3. 白露　　软盘一张　白<br>4. 孟凡　　软盘一张　绿<br>5. 米乐　　软盘一张　粉<br><br>共五张。<br>铅封：梧城少年宫 1999.12.31<br>保管人：江振华</div>"},{"id":"c0_photo","name":"开箱照片（你自己拍的）","requires":"c0_box","onOpen":{"clock":"2026-12-20 22:10"},"html":"<figure class=\"evidence-photo\"><svg class=\"evidence-image\" data-photo=\"unboxing\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘\"><title>开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘</title><image href=\"/trial-photo-17eddff45a8fcaa9.webp\" width=\"1448\" height=\"1086\"/><g transform=\"matrix(.98 -.057 .035 .98 502 118)\" font-family=\"SimSun, serif\" fill=\"#41392c\" opacity=\".76\" aria-hidden=\"true\"><text x=\"0\" y=\"0\" font-size=\"19\" >梧城少年宫 千禧时间胶囊</text><text x=\"0\" y=\"18\" font-size=\"15\" >封存：1999年12月31日 23:35</text><text x=\"0\" y=\"36\" font-size=\"15\" >开启：2027年1月1日 00:00（2026年跨年夜，等我们都四十岁）</text><text x=\"0\" y=\"54\" font-size=\"15\" ></text><text x=\"0\" y=\"72\" font-size=\"15\" >内装：</text><text x=\"0\" y=\"90\" font-size=\"15\" >1. 陈一鸣　软盘一张　蓝</text><text x=\"0\" y=\"108\" font-size=\"15\" >2. 赵小川　软盘一张　黑</text><text x=\"0\" y=\"126\" font-size=\"15\" >3. 白露　　软盘一张　白</text><text x=\"0\" y=\"144\" font-size=\"15\" >4. 孟凡　　软盘一张　绿</text><text x=\"0\" y=\"162\" font-size=\"15\" >5. 米乐　　软盘一张　粉</text><text x=\"0\" y=\"180\" font-size=\"15\" ></text><text x=\"0\" y=\"198\" font-size=\"15\" >共五张。</text><text x=\"0\" y=\"216\" font-size=\"15\" >铅封：梧城少年宫 1999.12.31</text><text x=\"0\" y=\"234\" font-size=\"15\" >保管人：江振华</text></g></svg></figure><div class=\"paper\">照片：工作台上的铁盒，盒盖内侧贴着清单。剪断的封线和铅块放在一边。<br><br>你把取出来的软盘沿着盒口摊开。蓝、黑、白、绿、粉，旁边还有一张灰色的，没贴标签。刚掀开盖子时，它压在最底下。<br><br>你给照片加了条备注：清单写五张。</div>"},{"id":"c1_seal_now","name":"现在的铅封（你拍的特写）","requires":"p2_seal_received","html":"<figure class=\"evidence-photo\"><svg class=\"evidence-image\" data-photo=\"seal-base\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"现在的铅封：1999 年末尾的 9 有缺口\"><title>现在的铅封：1999 年末尾的 9 有缺口</title><image href=\"/trial-photo-f4e74f9bd52123bb.webp\" width=\"1448\" height=\"1086\"/><g transform=\"translate(724 550)\" fill=\"#464647\" opacity=\".84\"><defs><mask id=\"stamp-notch-seal-base\" maskUnits=\"userSpaceOnUse\" x=\"-400\" y=\"-300\" width=\"800\" height=\"600\"><rect x=\"-400\" y=\"-300\" width=\"800\" height=\"600\" fill=\"white\"/><path d=\"M-74 43l5 1 1 9-7-1z\" fill=\"black\"/></mask></defs><g mask=\"url(#stamp-notch-seal-base)\"><text x=\"0\" y=\"-48\" font-size=\"54\" text-anchor=\"middle\" font-family=\"SimSun, serif\">梧城少年宫</text><text x=\"-198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"-154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">2</text><text x=\"110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">3</text><text x=\"198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text></g></g></svg></figure><div class=\"paper\">剪下来的铅块还连着一截封线。上面压着一行字：<br><br>梧城少年宫 1999.12.31<br><br>字压得很深，边缘有些毛。年份末尾那个“9”的尾巴上有一个米粒大的缺口，像是模子上崩掉了一小块。</div>"},{"id":"c1_label","name":"第六张盘的盘片（背面照片）","requires":"p2_seal_received","html":"<figure class=\"evidence-photo\"><svg class=\"evidence-image\" data-photo=\"disk-back\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"第六张软盘的背面：生产批号 0210\"><title>第六张软盘的背面：生产批号 0210</title><image href=\"/trial-photo-fa86aa1a03346e05.webp\" width=\"1448\" height=\"1086\"/><g fill=\"#474842\" font-family=\"Consolas, monospace\" opacity=\".86\"><text x=\"435\" y=\"826\" font-size=\"30\" >DS,HD  1.44MB</text><text x=\"435\" y=\"873\" font-size=\"34\" >0210</text></g></svg></figure><div class=\"paper\">照片：灰色的3.5寸软盘，正面没有标签。<br><br>背面压印：DS,HD　1.44MB<br>生产批号：0210（2002年10月）<br><br>金属挡板上有一道明显的划痕，无法仅凭外观判断产生时间。</div>"},{"id":"c1_news2003","name":"旧闻：《梧城晚报》2003年4月28日","requires":"solved_c1_year","html":"<p class=\"muted\">沿着灰盘的日期往后查，我在2003年4月28日的《梧城晚报》上找到了这条短讯。——老K</p><div class=\"paper\">梧城晚报　2003年4月28日　星期一　第六版<br><br><b>停课期间翻入少年宫　一高中生死亡</b><br><br>4月27日清晨，少年宫工作人员在楼顶天文台内发现一名男生，已无生命体征。死者赵某某，17岁，本市某中学学生，患有哮喘。<br><br>警方初步调查认为，死者于26日夜间独自翻入因非典停课而关闭的少年宫，在天文台内哮喘发作，系意外。<br><br>少年宫提醒家长：停课期间请看管好孩子。</div>"}],"items2026":[],"readings":[{"id":"r2_lid","chapter":"ch0","title":"等我们都四十岁","date":"1999-12-31","requires":"ch0 & seen_c0_list","source":"贴在铁盒盖内侧的胶囊清单","html":"<p>清单上一个名字占一行。陈一鸣，蓝盘。赵小川，黑盘。往下是白露、孟凡，最后那张粉的归米乐。</p><p>名单上方写着开盒的日子，连钟点也约好了：2027年1月1日零点。五个孩子还特地写上了“等我们都四十岁”。</p>"},{"id":"r2_birthdays","chapter":"ch0","title":"小川爱吃什么","date":"1999-12-31","requires":"ch0 & seen_f_d5_list","source":"米乐的粉盘 ·《一个都不能少》","html":"<p>米乐做了张生日表。一鸣爱吃辣条，白露爱吃话梅。孟凡那栏写得仔细，得是外婆包的饺子。轮到小川，米乐写的是：“什么都行，给他就吃。”</p><p>他把自己也列进去了，五月二十，瓜子。表底下还有条规矩，谁过生日，另外四个人都得来给他过。</p>"},{"id":"r2_pink","chapter":"ch1","title":"我的是粉色的","date":"1999-12-31","requires":"ch1 & seen_v1999_01","source":"米乐父亲翻录的千禧夜封存录像","html":"<p>礼堂里，江老师举着铁盒，让孩子们把盘放进去。瘦高的男孩放下黑盘，还伸手拍了拍盒子。米乐在旁边等着，嗓门比谁都大：“我的是粉色的！”</p><p>“谁问你了。”孟凡说。</p><p>拍到楼顶倒数的时候，周围的人都在喊。米乐又凑到镜头跟前，这次说得很轻：“四十岁的米乐，还记得今天。”</p>"}],"screensaver":[],"userExtras":[],"puzzles":{"c0_count":{"kind":"text","ask":true,"title":"一共几张","requires":"ch0 & seen_c0_list & seen_c0_photo","prompt":"清单上写了五张。看看开箱照片，盒子里一共有几张软盘？","answers":["6","六","6张","六张"],"hints":["看“物品”里的开箱照片。","五种颜色，再加一张没有标签的。","答案：6。"],"solvedText":"六张。五张彩盘底下压着一张没贴签的灰盘。五张彩盘都拷出来了。读灰盘时软驱响了好几次，读盘报告上有一片红。先看看目录还在不在。","onSolve":{"note":"n_p_count","set":["c0_image_ready"],"clock":"2026-12-20 22:30"}},"c0_odd":{"kind":"text","ask":true,"title":"没有名字的那张","requires":"solved_c0_count & seen_f_d6_dir","prompt":"那张没有标签的盘，目录里一共列出了几个文件？","answers":["4","四","4个","四个"],"hints":["在“胶囊软盘”里打开“盘6（无标签）”的目录。","每一行一个文件，后面都写着坏道。","答案：4。"],"solvedText":"四个文件，全落在坏道上，一个也打不开：LETTER.TXT、CONFESS.TXT、CHAT.LOG、FOUND.TXT。","onSolve":{"note":"n_p_odd"}},"c1_frame":{"kind":"frame","ask":true,"title":"1999年的铅封","requires":"ch1 & seen_v1999_01","clip":"v1999_01","frame":["23:35:12"],"answers":["23:35:12"],"prompt":"在1999年的仪式录像里，选出拍清铅封的那一帧。","near":{"23:33:40":"这一帧在放盘，盒子还没合上。","23:31:05":"这一帧还没开始放盘。","23:34:20":"这一帧盒子还开着，镜头对着小川。"},"hints":["铅封是盒子合上以后才打的。","找“特写”。","答案：23:35:12 那一帧。"],"solvedText":"23:35:12，镜头对准铅封。“梧城少年宫 1999.12.31”这行字拍得清楚，年份末尾那个“9”圆圆的，一点没缺。","onSolve":{"note":"n_p_frame1"}},"c1_diff":{"kind":"choice","ask":true,"title":"哪里不一样","requires":"solved_c1_frame & seen_c1_seal_now","prompt":"现在的铅封，和1999年录像里的铅封，哪里不一样？","options":["年份末尾那个“9”的尾巴上多了一个缺口","日期是1999.12.30","少了“少年宫”三个字","一模一样"],"answer":"年份末尾那个“9”的尾巴上多了一个缺口","answers":["年份末尾那个“9”的尾巴上多了一个缺口"],"hints":["字和日期都一样。","看年份末尾那个“9”的尾巴。","答案：年份末尾那个“9”的尾巴上多了一个缺口。"],"solvedText":"录像里那个“9”是好的，现在尾巴上却缺了一小块。有人换过模子，重新封过盒子？再翻过那张灰盘，看看背面是哪年出厂的。","onSolve":{"note":"n_p_diff"}},"c1_serial":{"kind":"text","ask":true,"title":"卷序列号","requires":"ch1 & seen_f_serial_help & seen_f_d6_dir","prompt":"第六张盘的卷序列号是 041A-152C。按 QNP-FMT 的记录，它的制盘时间是几月几日几点几分？按“月-日 时:分”输入，例如 12-31 23:05。","answers":["04-26 21:44","4-26 21:44","4月26日21:44","4月26日 21:44","0426 2144","04-26 2144"],"hints":["041A 换成十进制是 1050。","1050 = 4 × 256 + 26；152C = 5420 = 21 × 256 + 44。","答案：04-26 21:44。"],"solvedText":"4月26日，晚上9点44分。知道这张盘是什么时候格式化的了，只差年份。","onSolve":{"note":"n_p_serial"}},"c1_year":{"kind":"text","ask":true,"title":"哪一年","requires":"solved_c1_serial & seen_f_d6_dir & seen_c1_label & seen_f_d6_reread","prompt":"卷序列号里没有年份。打开盘6的《补读记录.txt》：年份只读出了半截。对照制盘程序的换算说明和盘片背面的批号，这张盘是哪一年格式化的？","answers":["2003","2003年"],"hints":["年份的十位是 0，只可能是 2000—2009 年。背面批号 0210：这张盘 2002 年 10 月才出厂，所以 4 月 26 日最早也得是 2003 年。","4 月 26 日记成第 116 天，说明那一年的 2 月只有 28 天，不是闰年。再从 2002 年的星期五往后推：隔一年挪一天，夹着 2 月 29 日挪两天。哪一年落在星期六？","答案：2003。"],"solvedText":"2003年4月26日，星期六，21:44。灰盘是那晚格式化的。日子有了，往后翻翻那几天的《梧城晚报》。","onSolve":{"note":["n_p_year","n_p2_news_source"]},"near":{"2002":"2002年4月26日是星期五。再说，这张盘那年10月才出厂。","2004":"2004年是闰年，4月26日是第117天，而且那天是星期一。","2008":"2008年的4月26日也是星期六。可那年是闰年，4月26日是第117天，日序对不上。","2009":"2009年4月26日是星期日。","2014":"年份的十位读出来是 0，只能是 2000—2009 年。","2025":"年份的十位读出来是 0，只能是 2000—2009 年。"}},"c1_who":{"kind":"text","ask":true,"title":"那一夜","requires":"solved_c1_year & seen_c1_news2003","prompt":"旧闻里的“赵某某”，是胶囊清单上的哪一个人？","answers":["赵小川","小川"],"hints":["清单上只有一个人姓赵。","江老师说过，五个孩子里有一个2003年走了。","答案：赵小川。"],"solvedText":"清单上第二个名字是赵小川，黑盘是他的。多出来的那张灰盘，偏偏是在他出事那一夜格式化的。","onSolve":{"note":"n_p_who"}}},"boards":{"c1_final":{"title":"封条","requires":"(ch1 & solved_c1_frame & solved_c1_diff & solved_c1_serial & solved_c1_year & solved_c1_who) & seen_v1999_01 & seen_c1_label & seen_f_d6_dir & seen_c1_seal_now & seen_c1_news2003 & seen_f_serial_help & seen_f_d6_reread","intro":"读到〔依据〕时，选出能证明这句话的那份原件。","text":"1999年跨年夜，梧城少年宫的五个孩子各自写了封信，存在软盘上，一起封进铁盒。那年他们十三岁，约好等四十岁了，再看看自己写了些什么。二十七年后，陈一鸣张罗着把大家再聚到一起。他怕上了台才发现盘读不出来，托我提前试试。<br><br>盒盖内侧贴着一张清单，每个名字后面都写着软盘的颜色。我照着清单把五张盘摆在桌上，盒底却还剩一张灰的。再看{s1}，孩子们放进去的明明只有五张。<br><br>江老师压下钳子时，录像里还能看清铅封上的“1999”。最后一个“9”的尾巴是{a}的，手里这枚铅封上，那个“9”却{b}。我又看了{s2}，批号是“0210”。这张盘到{e}年十月才出厂。有人在那以后重新开过盒，把灰盘放了进去。<br><br>灰盘的文件还打不开，读盘机留下了{s3}，上面还读得出卷序列号：{c}。我照少年宫制盘程序的说明一算，这张盘是在4月26日{d}格式化的。年份不在这串数里。我又补读了十几遍，{s4}里也只剩半截：十位是“0”，那天是星期六，是当年的第116天。批号排掉了2003年以前，第116天排掉了闰年，这十年里只有{y}年的4月26日落在星期六。往后翻了两天的晚报，我看到一条短讯。27日清早，有人在少年宫天文台里发现了一个十七岁的男孩，已经去世了，报上只写他姓赵。江老师说过，写信的五个孩子里有一个在那年走了。我又看了一眼盒盖里的清单。五个人里，姓赵的叫{f}。","slots":{"a":"w_a","b":"w_b","c":"w_c","d":"w_d","e":"w_e","f":"w_f","s1":"src:v1999_01","s2":"src:c1_label","s3":"src:f_d6_dir","s4":"src:f_d6_reread","y":"w_y"},"words":{"w_a":"完整","w_b":"有一个缺口","w_c":"041A-152C","w_d":"21:44","w_e":"2002","w_f":"赵小川","d0":"一模一样","d1":"0C1F-1705","d2":"23:05","d4":"陈一鸣","d5":"江老师","w_y":"2003","d3":"2008","d6":"2004"},"srcPool":["v1999_01","c1_seal_now","c1_label","c1_news2003","f_d6_dir","f_serial_help","f_d6_reread"],"hints":["先看当年封盒的录像，再对照手里这枚铅封和灰盘背面的批号。","卷序列号只给出月日和钟点。年份要用补读记录里的星期、日序，加上盘片批号去推，再把日期与晚报上的消息对一对。","按空格顺序：《1999年录像〈胶囊封存仪式〉》 → 完整 → 有一个缺口 → 《灰盘背面照片》 → 2002 → 盘6的《目录.txt》 → 041A-152C → 21:44 → 盘6的《补读记录.txt》 → 2003 → 赵小川。"],"solvedText":"灰盘是在小川出事那晚格式化的。后来有人把它放进盒子，还把铅封重新压好了。谁有这样的模子？","onSolve":{"note":"n_board1"},"sourceLabels":{"v1999_01":"《1999年录像〈胶囊封存仪式〉》","c1_label":"《灰盘背面照片》","f_d6_dir":"盘6的《目录.txt》","f_d6_reread":"盘6的《补读记录.txt》"},"requiredSources":["v1999_01","c1_label","f_d6_dir","c1_seal_now","c1_news2003","f_serial_help","f_d6_reread"],"investigationRequires":"ch1 & solved_c1_frame & solved_c1_diff & solved_c1_serial & solved_c1_year & solved_c1_who"}},"notes":{"n_p_count":{"text":"清单上记了五张软盘，开箱时数到六张。多出来的那张是灰色的，没贴标签。"},"n_p_odd":{"text":"第六张盘目录：LETTER.TXT、CONFESS.TXT、CHAT.LOG、FOUND.TXT，全在坏道上。"},"n_p_frame1":{"text":"1999年录像，23:35:12。铅封上印着“梧城少年宫 1999.12.31”，年份末尾那个“9”的尾巴是完整的。"},"n_p_diff":{"text":"现在的铅封上，年份末尾那个“9”缺了一小截，1999年录像里的“9”却是好的。盒子也许重新封过。"},"n_p_serial":{"text":"卷序列号 041A-152C → 4月26日 21:44 格式化。"},"n_p_year":{"text":"扩展记录只读出年份十位的“0”，另有星期六、第116天。批号排掉2002年以前，第116天排掉闰年，这十年里只有2003年的4月26日是星期六。卷序列号补上了钟点：2003年4月26日21:44。"},"n_p_who":{"text":"4月27日清早，一名十七岁的男孩被发现在天文台里。晚报只说他姓赵，警方初步判断是哮喘发作。清单上的赵小川与报上的人对得上。"},"n_board1":{"text":"2003年4月26日21:44，有人格式化了这张灰盘。小川就是那天夜里出的事。铁盒后来让人打开过，又重新封上了。"},"n_v1999":{"text":"米乐爸爸拍的封盒录像，镜头从礼堂一直跟到了楼顶。画面右下角有时间。"},"n_k1220":{"text":"12月20日开盒时数过，六张软盘。垫在最底下的那张是灰色的，没贴标签。"},"n_f_d2":{"text":"小川1999年的信：模子做了两个；“许嘉哥说，修好了要签自己的名字。”"},"n_p2_news_source":{"text":"顺着制盘日期找到了当年的一份《梧城晚报》，剪报已存进手机。"}},"endings":{},"journal":{"ch0":{"question":"胶囊里有什么？","steps":[{"until":"dlg_c0_chen","text":"委托人陈一鸣发来了消息。","source":{"type":"chat","id":"chen"}},{"until":"c0_box","text":"胶囊的保管人江老师发来了消息。","source":{"type":"chat","id":"jiang"}},{"until":"seen_c0_list","text":"看1999年的胶囊清单。","source":{"type":"item","id":"c0_list"}},{"until":"solved_c0_count","text":"盒盖里的清单记了五张软盘。数数开箱照片里桌上摆了几张？","source":{"type":"item","id":"c0_photo"}},{"until":"solved_c0_odd","text":"灰盘没写在清单上。打开它的目录，看看能读出哪些文件名。","source":{"type":"file","id":"f_d6_dir"}},{"until":"dlg_c0_photo_chen","text":"开箱时拍的照片里有一张没贴签的盘，先发给委托人认一认。","source":{"type":"chat","id":"chen"}},{"until":"dlg_c0_end","text":"一鸣看过照片了，再请当年封盒的江老师看看。","source":{"type":"chat","id":"jiang"}}],"facts":[{"requires":"solved_c0_count","text":"开箱数到六张盘，清单上只登记了五张。"},{"requires":"solved_c0_odd","text":"灰盘能读出四个文件名，正文还打不开。"}]},"ch1":{"question":"封盒那晚，灰盘已经在里面了吗？","steps":[{"until":"p2_seal_received","text":"江老师昨晚答应去问米乐要录像。看看他发来的消息。","source":{"type":"chat","id":"jiang"}},{"until":"solved_c1_frame","text":"手机里多了「录像」。在1999年的仪式录像里，找到铅封的特写。","source":{"type":"clip","id":"v1999_01"}},{"until":"solved_c1_diff","text":"拿出开箱时拍的照片，跟录像里的铅封比一比。","source":{"type":"item","id":"c1_seal_now"}},{"until":"solved_c1_serial","text":"第六张盘的卷序列号还读得出来。“工作”文件夹里有你以前记的换算方法。","source":{"type":"file","id":"f_serial_help"}},{"until":"solved_c1_year","text":"卷序列号里只有月日和钟点。年份那条记录只补读出半截，打开盘6的《补读记录.txt》，对照换算说明和盘片批号推一推。","source":{"type":"file","id":"f_d6_reread"}},{"until":"solved_c1_who","text":"年份有了。翻翻那几天的《梧城晚报》：灰盘格式化的那个夜里，少年宫出了什么事？","source":{"type":"item","id":"c1_news2003"}},{"until":"board_c1_final","text":"打开手机“推理”，把本章的结论和依据拼起来。","source":{"type":"board","id":"c1_final"}}],"facts":[{"requires":"solved_c1_diff","text":"现在的铅封和录像里的印子不一样。"},{"requires":"solved_c1_year","text":"灰盘的制盘记录是2003年4月26日21:44。"}]}},"contacts2018":{"chen":{"name":"陈一鸣","sub":"鸣远数据 · 委托人","avatar":"陈"},"jiang":{"name":"江老师","sub":"江振华 · 胶囊保管人","avatar":"江","requires":"dlg_c0_chen"},"kelan":{"name":"柯岚","sub":"姐姐","avatar":"岚","requires":"ch1"}},"apps":{"mycomputer":{"name":"我的电脑","icon":"computer","requires":"ch0"},"caps":{"name":"胶囊软盘","icon":"floppy","path":"C:/胶囊软盘","requires":"c0_image_ready"},"gexun":{"name":"鸽讯 2005","icon":"pigeon","requires":"ch0"}},"boot":{"requires":"c0_box","lockedText":"江老师还没把胶囊送来。先看看手机。"},"collectibles":{"p_chen":{"title":"陈一鸣","where":"蓝色那张盘 · 隐藏文件","text":"四十岁的陈一鸣：别光顾着赢。"},"p_xiaochuan":{"title":"赵小川","where":"黑色那张盘 · 隐藏文件","text":"四十岁的赵小川：别怕说真话。"},"p_bailu":{"title":"白露","where":"白色那张盘 · 文件属性","text":"四十岁的白露：别替别人做决定。"},"p_mengfan":{"title":"孟凡","where":"绿色那张盘 · 隐藏文件","text":"四十岁的孟凡：少喝酒。"},"p_mile":{"title":"米乐","where":"仪式录像带 · 零点","text":"四十岁的米乐：还记得今天。"},"p_star3":{"title":"星图卡 · 北极星","where":"黑色那张盘 · 隐藏文件","text":"北极星。它不动，别的星都绕着它转。迷路了就找它。"},"p_star6":{"title":"星图卡 · 昴星团","where":"黑色那张盘 · 图纸属性","text":"昴星团，七姐妹。七颗，我只数得出六颗。"}},"bbs":{"threads":[],"loginLog":[],"users":[],"boards":[],"mails":[],"pages":[],"adminSections":{}},"gexun":{"account":{},"accounts":{},"contacts":[],"logs":[]},"footage":{"requires":"ch1","sub":"1999年的仪式录像、工作室监控，还有你自己拍的几段","clips":[{"id":"v1999_01","title":"1999年千禧夜：胶囊封存仪式（录像带翻录）","date":"1999-12-31","dur":"31:20","requires":"p2_seal_received","onOpen":{"note":"n_v1999"},"sub":"米乐爸爸用家里的摄像机拍的，画面右下角能看到拍摄时间。","frames":[{"t":"23:31:05","desc":"少年宫礼堂，挂着“迎接2000年”的横幅。江老师（四十多岁，戴眼镜）举着一个铁盒。五个孩子排成一排，个子参差不齐。","say":"（江老师）孩子们，把你们给四十岁的自己写的信放进盒子里吧。"},{"t":"23:33:40","desc":"孩子们一个接一个往盒子里放软盘：蓝、黑、白、绿、粉。黑色那张是一个瘦高的男孩放的，他放完还拍了拍盒子。","say":"（米乐）我的是粉色的！（孟凡）谁问你了。"},{"t":"23:34:20","desc":"瘦高的男孩背过身咳个不停。江老师从他书包侧袋里摸出一支哮喘喷雾，塞到他手里。男孩的书包上用涂改液画满了星星。","say":"（江老师）小川，喷两下。药就放侧袋，别乱塞，听见没有？"},{"t":"23:35:12","desc":"铅封特写：江老师用钳子压下铅块，字是“梧城少年宫 1999.12.31”。年份末尾那个“9”的尾巴完整、圆润。","say":"（瘦高的男孩）这个模子是我做的！金工课做的！","photo":"<svg class=\"evidence-image\" data-photo=\"seal-1999\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"1999 年录像中的铅封：末尾的 9 完整\"><title>1999 年录像中的铅封：末尾的 9 完整</title><image href=\"/trial-photo-2b9398a8492f4daf.webp\" width=\"1448\" height=\"1086\"/><g transform=\"translate(724 550)\" fill=\"#464647\" opacity=\".84\"><g ><text x=\"0\" y=\"-48\" font-size=\"54\" text-anchor=\"middle\" font-family=\"SimSun, serif\">梧城少年宫</text><text x=\"-198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"-154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">2</text><text x=\"110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">3</text><text x=\"198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text></g></g></svg>"},{"t":"23:36:50","desc":"镜头扫过礼堂，孩子们在抢一包瓜子。只有四个孩子在画面里。","say":"（江老师）一鸣呢？（孩子）他上楼顶拍倒计时去了！"},{"t":"23:59:52","desc":"少年宫楼顶，所有人挤在栏杆边倒数。远处七中那边，已经有人抢先放了支烟花。","say":"十、九、八……（米乐凑到镜头前，小声说：四十岁的米乐，还记得今天。）","onView":{"collect":"p_mile"}}]},{"id":"k1220_01","title":"12月20日：开箱","date":"2026-12-20","dur":"06:40","requires":"ch0","onOpen":{"note":"n_k1220"},"frames":[{"t":"22:05:10","desc":"镜头先拍桌上碟子里的铅块，上面还连着一截剪断的封线。镜头拉远，旁边的铁盒还扣着盖。","say":"已经录上了。江老师，我开了啊。","photo":"<svg class=\"evidence-image\" data-photo=\"seal-base\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"现在的铅封：1999 年末尾的 9 有缺口\"><title>现在的铅封：1999 年末尾的 9 有缺口</title><image href=\"/trial-photo-f4e74f9bd52123bb.webp\" width=\"1448\" height=\"1086\"/><g transform=\"translate(724 550)\" fill=\"#464647\" opacity=\".84\"><defs><mask id=\"stamp-notch-seal-base\" maskUnits=\"userSpaceOnUse\" x=\"-400\" y=\"-300\" width=\"800\" height=\"600\"><rect x=\"-400\" y=\"-300\" width=\"800\" height=\"600\" fill=\"white\"/><path d=\"M-74 43l5 1 1 9-7-1z\" fill=\"black\"/></mask></defs><g mask=\"url(#stamp-notch-seal-base)\"><text x=\"0\" y=\"-48\" font-size=\"54\" text-anchor=\"middle\" font-family=\"SimSun, serif\">梧城少年宫</text><text x=\"-198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"-154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">2</text><text x=\"110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">3</text><text x=\"198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text></g></g></svg>"},{"t":"22:07:33","desc":"你掀开盒盖，露出贴在内侧的清单。你把蓝、黑、白、绿、粉五张软盘依次取出来。盒底还压着一张没贴标签的灰盘，你把它摆在粉盘旁边。","say":"清单上写五张。……这是第六张。","photo":"<svg class=\"evidence-image\" data-photo=\"unboxing\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘\"><title>开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘</title><image href=\"/trial-photo-17eddff45a8fcaa9.webp\" width=\"1448\" height=\"1086\"/><g transform=\"matrix(.98 -.057 .035 .98 502 118)\" font-family=\"SimSun, serif\" fill=\"#41392c\" opacity=\".76\" aria-hidden=\"true\"><text x=\"0\" y=\"0\" font-size=\"19\" >梧城少年宫 千禧时间胶囊</text><text x=\"0\" y=\"18\" font-size=\"15\" >封存：1999年12月31日 23:35</text><text x=\"0\" y=\"36\" font-size=\"15\" >开启：2027年1月1日 00:00（2026年跨年夜，等我们都四十岁）</text><text x=\"0\" y=\"54\" font-size=\"15\" ></text><text x=\"0\" y=\"72\" font-size=\"15\" >内装：</text><text x=\"0\" y=\"90\" font-size=\"15\" >1. 陈一鸣　软盘一张　蓝</text><text x=\"0\" y=\"108\" font-size=\"15\" >2. 赵小川　软盘一张　黑</text><text x=\"0\" y=\"126\" font-size=\"15\" >3. 白露　　软盘一张　白</text><text x=\"0\" y=\"144\" font-size=\"15\" >4. 孟凡　　软盘一张　绿</text><text x=\"0\" y=\"162\" font-size=\"15\" >5. 米乐　　软盘一张　粉</text><text x=\"0\" y=\"180\" font-size=\"15\" ></text><text x=\"0\" y=\"198\" font-size=\"15\" >共五张。</text><text x=\"0\" y=\"216\" font-size=\"15\" >铅封：梧城少年宫 1999.12.31</text><text x=\"0\" y=\"234\" font-size=\"15\" >保管人：江振华</text></g></svg>"}]}]},"map":null,"collectLabel":"星图卡与五句话","helpCards":{"ch0":"两位数年份：早年内存和磁盘很贵，程序只存年份的后两位。1999，记作 99。","ch1":"卷序列号：格式化软盘时写下的一串编号。有的制盘程序，会把格式化的时刻藏在里面。"},"storyRevision":2026111001,"materialBatches":[]});Y2K.patch(D=>Object.assign(D,{"mails2026":[],"items2026":[],"puzzles":{"c0_count":{"kind":"text","ask":true,"title":"一共几张","requires":"ch0 & seen_c0_list & seen_c0_photo","prompt":"清单上写了五张。看看开箱照片，盒子里一共有几张软盘？","answers":["6","六","6张","六张"],"hints":["看“物品”里的开箱照片。","五种颜色，再加一张没有标签的。","答案：6。"],"solvedText":"六张。五张彩盘底下压着一张没贴签的灰盘。五张彩盘都拷出来了。读灰盘时软驱响了好几次，读盘报告上有一片红。先看看目录还在不在。","onSolve":{"note":"n_p_count","set":["c0_image_ready"],"clock":"2026-12-20 22:30"}},"c0_odd":{"kind":"text","ask":true,"title":"没有名字的那张","requires":"solved_c0_count & seen_f_d6_dir","prompt":"那张没有标签的盘，目录里一共列出了几个文件？","answers":["4","四","4个","四个"],"hints":["在“胶囊软盘”里打开“盘6（无标签）”的目录。","每一行一个文件，后面都写着坏道。","答案：4。"],"solvedText":"四个文件，全落在坏道上，一个也打不开：LETTER.TXT、CONFESS.TXT、CHAT.LOG、FOUND.TXT。","onSolve":{"note":"n_p_odd"}},"c1_frame":{"kind":"frame","ask":true,"title":"1999年的铅封","requires":"ch1 & seen_v1999_01","clip":"v1999_01","frame":["23:35:12"],"answers":["23:35:12"],"prompt":"在1999年的仪式录像里，选出拍清铅封的那一帧。","near":{"23:33:40":"这一帧在放盘，盒子还没合上。","23:31:05":"这一帧还没开始放盘。","23:34:20":"这一帧盒子还开着，镜头对着小川。"},"hints":["铅封是盒子合上以后才打的。","找“特写”。","答案：23:35:12 那一帧。"],"solvedText":"23:35:12，镜头对准铅封。“梧城少年宫 1999.12.31”这行字拍得清楚，年份末尾那个“9”圆圆的，一点没缺。","onSolve":{"note":"n_p_frame1"}},"c1_diff":{"kind":"choice","ask":true,"title":"哪里不一样","requires":"solved_c1_frame & seen_c1_seal_now","prompt":"现在的铅封，和1999年录像里的铅封，哪里不一样？","options":["年份末尾那个“9”的尾巴上多了一个缺口","日期是1999.12.30","少了“少年宫”三个字","一模一样"],"answer":"年份末尾那个“9”的尾巴上多了一个缺口","answers":["年份末尾那个“9”的尾巴上多了一个缺口"],"hints":["字和日期都一样。","看年份末尾那个“9”的尾巴。","答案：年份末尾那个“9”的尾巴上多了一个缺口。"],"solvedText":"录像里那个“9”是好的，现在尾巴上却缺了一小块。有人换过模子，重新封过盒子？再翻过那张灰盘，看看背面是哪年出厂的。","onSolve":{"note":"n_p_diff"}},"c1_serial":{"kind":"text","ask":true,"title":"卷序列号","requires":"ch1 & seen_f_serial_help & seen_f_d6_dir","prompt":"第六张盘的卷序列号是 041A-152C。按 QNP-FMT 的记录，它的制盘时间是几月几日几点几分？按“月-日 时:分”输入，例如 12-31 23:05。","answers":["04-26 21:44","4-26 21:44","4月26日21:44","4月26日 21:44","0426 2144","04-26 2144"],"hints":["041A 换成十进制是 1050。","1050 = 4 × 256 + 26；152C = 5420 = 21 × 256 + 44。","答案：04-26 21:44。"],"solvedText":"4月26日，晚上9点44分。知道这张盘是什么时候格式化的了，只差年份。","onSolve":{"note":"n_p_serial"}},"c1_year":{"kind":"text","ask":true,"title":"哪一年","requires":"solved_c1_serial & seen_f_d6_dir & seen_c1_label & seen_f_d6_reread","prompt":"卷序列号里没有年份。打开盘6的《补读记录.txt》：年份只读出了半截。对照制盘程序的换算说明和盘片背面的批号，这张盘是哪一年格式化的？","answers":["2003","2003年"],"hints":["年份的十位是 0，只可能是 2000—2009 年。背面批号 0210：这张盘 2002 年 10 月才出厂，所以 4 月 26 日最早也得是 2003 年。","4 月 26 日记成第 116 天，说明那一年的 2 月只有 28 天，不是闰年。再从 2002 年的星期五往后推：隔一年挪一天，夹着 2 月 29 日挪两天。哪一年落在星期六？","答案：2003。"],"solvedText":"2003年4月26日，星期六，21:44。灰盘是那晚格式化的。日子有了，往后翻翻那几天的《梧城晚报》。","onSolve":{"note":["n_p_year","n_p2_news_source"]},"near":{"2002":"2002年4月26日是星期五。再说，这张盘那年10月才出厂。","2004":"2004年是闰年，4月26日是第117天，而且那天是星期一。","2008":"2008年的4月26日也是星期六。可那年是闰年，4月26日是第117天，日序对不上。","2009":"2009年4月26日是星期日。","2014":"年份的十位读出来是 0，只能是 2000—2009 年。","2025":"年份的十位读出来是 0，只能是 2000—2009 年。"}},"c1_who":{"kind":"text","ask":true,"title":"那一夜","requires":"solved_c1_year & seen_c1_news2003","prompt":"旧闻里的“赵某某”，是胶囊清单上的哪一个人？","answers":["赵小川","小川"],"hints":["清单上只有一个人姓赵。","江老师说过，五个孩子里有一个2003年走了。","答案：赵小川。"],"solvedText":"清单上第二个名字是赵小川，黑盘是他的。多出来的那张灰盘，偏偏是在他出事那一夜格式化的。","onSolve":{"note":"n_p_who"}}},"boards":{"c1_final":{"title":"封条","requires":"(ch1 & solved_c1_frame & solved_c1_diff & solved_c1_serial & solved_c1_year & solved_c1_who) & seen_v1999_01 & seen_c1_label & seen_f_d6_dir & seen_c1_seal_now & seen_c1_news2003 & seen_f_serial_help & seen_f_d6_reread","intro":"读到〔依据〕时，选出能证明这句话的那份原件。","text":"1999年跨年夜，梧城少年宫的五个孩子各自写了封信，存在软盘上，一起封进铁盒。那年他们十三岁，约好等四十岁了，再看看自己写了些什么。二十七年后，陈一鸣张罗着把大家再聚到一起。他怕上了台才发现盘读不出来，托我提前试试。<br><br>盒盖内侧贴着一张清单，每个名字后面都写着软盘的颜色。我照着清单把五张盘摆在桌上，盒底却还剩一张灰的。再看{s1}，孩子们放进去的明明只有五张。<br><br>江老师压下钳子时，录像里还能看清铅封上的“1999”。最后一个“9”的尾巴是{a}的，手里这枚铅封上，那个“9”却{b}。我又看了{s2}，批号是“0210”。这张盘到{e}年十月才出厂。有人在那以后重新开过盒，把灰盘放了进去。<br><br>灰盘的文件还打不开，读盘机留下了{s3}，上面还读得出卷序列号：{c}。我照少年宫制盘程序的说明一算，这张盘是在4月26日{d}格式化的。年份不在这串数里。我又补读了十几遍，{s4}里也只剩半截：十位是“0”，那天是星期六，是当年的第116天。批号排掉了2003年以前，第116天排掉了闰年，这十年里只有{y}年的4月26日落在星期六。往后翻了两天的晚报，我看到一条短讯。27日清早，有人在少年宫天文台里发现了一个十七岁的男孩，已经去世了，报上只写他姓赵。江老师说过，写信的五个孩子里有一个在那年走了。我又看了一眼盒盖里的清单。五个人里，姓赵的叫{f}。","slots":{"a":"w_a","b":"w_b","c":"w_c","d":"w_d","e":"w_e","f":"w_f","s1":"src:v1999_01","s2":"src:c1_label","s3":"src:f_d6_dir","s4":"src:f_d6_reread","y":"w_y"},"words":{"w_a":"完整","w_b":"有一个缺口","w_c":"041A-152C","w_d":"21:44","w_e":"2002","w_f":"赵小川","d0":"一模一样","d1":"0C1F-1705","d2":"23:05","d4":"陈一鸣","d5":"江老师","w_y":"2003","d3":"2008","d6":"2004"},"srcPool":["v1999_01","c1_seal_now","c1_label","c1_news2003","f_d6_dir","f_serial_help","f_d6_reread"],"hints":["先看当年封盒的录像，再对照手里这枚铅封和灰盘背面的批号。","卷序列号只给出月日和钟点。年份要用补读记录里的星期、日序，加上盘片批号去推，再把日期与晚报上的消息对一对。","按空格顺序：《1999年录像〈胶囊封存仪式〉》 → 完整 → 有一个缺口 → 《灰盘背面照片》 → 2002 → 盘6的《目录.txt》 → 041A-152C → 21:44 → 盘6的《补读记录.txt》 → 2003 → 赵小川。"],"solvedText":"灰盘是在小川出事那晚格式化的。后来有人把它放进盒子，还把铅封重新压好了。谁有这样的模子？","onSolve":{"note":"n_board1"},"sourceLabels":{"v1999_01":"《1999年录像〈胶囊封存仪式〉》","c1_label":"《灰盘背面照片》","f_d6_dir":"盘6的《目录.txt》","f_d6_reread":"盘6的《补读记录.txt》"},"requiredSources":["v1999_01","c1_label","f_d6_dir","c1_seal_now","c1_news2003","f_serial_help","f_d6_reread"],"investigationRequires":"ch1 & solved_c1_frame & solved_c1_diff & solved_c1_serial & solved_c1_year & solved_c1_who"}},"notes":{"n_p_count":{"text":"清单上记了五张软盘，开箱时数到六张。多出来的那张是灰色的，没贴标签。"},"n_p_odd":{"text":"第六张盘目录：LETTER.TXT、CONFESS.TXT、CHAT.LOG、FOUND.TXT，全在坏道上。"},"n_p_frame1":{"text":"1999年录像，23:35:12。铅封上印着“梧城少年宫 1999.12.31”，年份末尾那个“9”的尾巴是完整的。"},"n_p_diff":{"text":"现在的铅封上，年份末尾那个“9”缺了一小截，1999年录像里的“9”却是好的。盒子也许重新封过。"},"n_p_serial":{"text":"卷序列号 041A-152C → 4月26日 21:44 格式化。"},"n_p_year":{"text":"扩展记录只读出年份十位的“0”，另有星期六、第116天。批号排掉2002年以前，第116天排掉闰年，这十年里只有2003年的4月26日是星期六。卷序列号补上了钟点：2003年4月26日21:44。"},"n_p_who":{"text":"4月27日清早，一名十七岁的男孩被发现在天文台里。晚报只说他姓赵，警方初步判断是哮喘发作。清单上的赵小川与报上的人对得上。"},"n_board1":{"text":"2003年4月26日21:44，有人格式化了这张灰盘。小川就是那天夜里出的事。铁盒后来让人打开过，又重新封上了。"},"n_v1999":{"text":"米乐爸爸拍的封盒录像，镜头从礼堂一直跟到了楼顶。画面右下角有时间。"},"n_k1220":{"text":"12月20日开盒时数过，六张软盘。垫在最底下的那张是灰色的，没贴标签。"},"n_f_d2":{"text":"小川1999年的信：模子做了两个；“许嘉哥说，修好了要签自己的名字。”"},"n_p2_news_source":{"text":"顺着制盘日期找到了当年的一份《梧城晚报》，剪报已存进手机。"}},"endings":{},"journal":{"ch0":{"question":"胶囊里有什么？","steps":[{"until":"dlg_c0_chen","text":"委托人陈一鸣发来了消息。","source":{"type":"chat","id":"chen"}},{"until":"c0_box","text":"胶囊的保管人江老师发来了消息。","source":{"type":"chat","id":"jiang"}},{"until":"seen_c0_list","text":"看1999年的胶囊清单。","source":{"type":"item","id":"c0_list"}},{"until":"solved_c0_count","text":"盒盖里的清单记了五张软盘。数数开箱照片里桌上摆了几张？","source":{"type":"item","id":"c0_photo"}},{"until":"solved_c0_odd","text":"灰盘没写在清单上。打开它的目录，看看能读出哪些文件名。","source":{"type":"file","id":"f_d6_dir"}},{"until":"dlg_c0_photo_chen","text":"开箱时拍的照片里有一张没贴签的盘，先发给委托人认一认。","source":{"type":"chat","id":"chen"}},{"until":"dlg_c0_end","text":"一鸣看过照片了，再请当年封盒的江老师看看。","source":{"type":"chat","id":"jiang"}}],"facts":[{"requires":"solved_c0_count","text":"开箱数到六张盘，清单上只登记了五张。"},{"requires":"solved_c0_odd","text":"灰盘能读出四个文件名，正文还打不开。"}]},"ch1":{"question":"封盒那晚，灰盘已经在里面了吗？","steps":[{"until":"p2_seal_received","text":"江老师昨晚答应去问米乐要录像。看看他发来的消息。","source":{"type":"chat","id":"jiang"}},{"until":"solved_c1_frame","text":"手机里多了「录像」。在1999年的仪式录像里，找到铅封的特写。","source":{"type":"clip","id":"v1999_01"}},{"until":"solved_c1_diff","text":"拿出开箱时拍的照片，跟录像里的铅封比一比。","source":{"type":"item","id":"c1_seal_now"}},{"until":"solved_c1_serial","text":"第六张盘的卷序列号还读得出来。“工作”文件夹里有你以前记的换算方法。","source":{"type":"file","id":"f_serial_help"}},{"until":"solved_c1_year","text":"卷序列号里只有月日和钟点。年份那条记录只补读出半截，打开盘6的《补读记录.txt》，对照换算说明和盘片批号推一推。","source":{"type":"file","id":"f_d6_reread"}},{"until":"solved_c1_who","text":"年份有了。翻翻那几天的《梧城晚报》：灰盘格式化的那个夜里，少年宫出了什么事？","source":{"type":"item","id":"c1_news2003"}},{"until":"board_c1_final","text":"打开手机“推理”，把本章的结论和依据拼起来。","source":{"type":"board","id":"c1_final"}}],"facts":[{"requires":"solved_c1_diff","text":"现在的铅封和录像里的印子不一样。"},{"requires":"solved_c1_year","text":"灰盘的制盘记录是2003年4月26日21:44。"}]}},"contacts2018":{"chen":{"name":"陈一鸣","sub":"鸣远数据 · 委托人","avatar":"陈"},"jiang":{"name":"江老师","sub":"江振华 · 胶囊保管人","avatar":"江","requires":"dlg_c0_chen"},"kelan":{"name":"柯岚","sub":"姐姐","avatar":"岚","requires":"ch1"}},"apps":{"mycomputer":{"name":"我的电脑","icon":"computer","requires":"ch0"},"caps":{"name":"胶囊软盘","icon":"floppy","path":"C:/胶囊软盘","requires":"c0_image_ready"},"gexun":{"name":"鸽讯 2005","icon":"pigeon","requires":"ch0"}},"boot":{"requires":"c0_box","lockedText":"江老师还没把胶囊送来。先看看手机。"},"collectibles":{"p_chen":{"title":"陈一鸣","where":"蓝色那张盘 · 隐藏文件","text":"四十岁的陈一鸣：别光顾着赢。"},"p_xiaochuan":{"title":"赵小川","where":"黑色那张盘 · 隐藏文件","text":"四十岁的赵小川：别怕说真话。"},"p_bailu":{"title":"白露","where":"白色那张盘 · 文件属性","text":"四十岁的白露：别替别人做决定。"},"p_mengfan":{"title":"孟凡","where":"绿色那张盘 · 隐藏文件","text":"四十岁的孟凡：少喝酒。"},"p_mile":{"title":"米乐","where":"仪式录像带 · 零点","text":"四十岁的米乐：还记得今天。"},"p_star3":{"title":"星图卡 · 北极星","where":"黑色那张盘 · 隐藏文件","text":"北极星。它不动，别的星都绕着它转。迷路了就找它。"},"p_star6":{"title":"星图卡 · 昴星团","where":"黑色那张盘 · 图纸属性","text":"昴星团，七姐妹。七颗，我只数得出六颗。"}},"footage":{"requires":"ch1","sub":"1999年的仪式录像、工作室监控，还有你自己拍的几段","clips":[{"id":"v1999_01","title":"1999年千禧夜：胶囊封存仪式（录像带翻录）","date":"1999-12-31","dur":"31:20","requires":"p2_seal_received","onOpen":{"note":"n_v1999"},"sub":"米乐爸爸用家里的摄像机拍的，画面右下角能看到拍摄时间。","frames":[{"t":"23:31:05","desc":"少年宫礼堂，挂着“迎接2000年”的横幅。江老师（四十多岁，戴眼镜）举着一个铁盒。五个孩子排成一排，个子参差不齐。","say":"（江老师）孩子们，把你们给四十岁的自己写的信放进盒子里吧。"},{"t":"23:33:40","desc":"孩子们一个接一个往盒子里放软盘：蓝、黑、白、绿、粉。黑色那张是一个瘦高的男孩放的，他放完还拍了拍盒子。","say":"（米乐）我的是粉色的！（孟凡）谁问你了。"},{"t":"23:34:20","desc":"瘦高的男孩背过身咳个不停。江老师从他书包侧袋里摸出一支哮喘喷雾，塞到他手里。男孩的书包上用涂改液画满了星星。","say":"（江老师）小川，喷两下。药就放侧袋，别乱塞，听见没有？"},{"t":"23:35:12","desc":"铅封特写：江老师用钳子压下铅块，字是“梧城少年宫 1999.12.31”。年份末尾那个“9”的尾巴完整、圆润。","say":"（瘦高的男孩）这个模子是我做的！金工课做的！","photo":"<svg class=\"evidence-image\" data-photo=\"seal-1999\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"1999 年录像中的铅封：末尾的 9 完整\"><title>1999 年录像中的铅封：末尾的 9 完整</title><image href=\"/trial-photo-2b9398a8492f4daf.webp\" width=\"1448\" height=\"1086\"/><g transform=\"translate(724 550)\" fill=\"#464647\" opacity=\".84\"><g ><text x=\"0\" y=\"-48\" font-size=\"54\" text-anchor=\"middle\" font-family=\"SimSun, serif\">梧城少年宫</text><text x=\"-198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"-154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">2</text><text x=\"110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">3</text><text x=\"198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text></g></g></svg>"},{"t":"23:36:50","desc":"镜头扫过礼堂，孩子们在抢一包瓜子。只有四个孩子在画面里。","say":"（江老师）一鸣呢？（孩子）他上楼顶拍倒计时去了！"},{"t":"23:59:52","desc":"少年宫楼顶，所有人挤在栏杆边倒数。远处七中那边，已经有人抢先放了支烟花。","say":"十、九、八……（米乐凑到镜头前，小声说：四十岁的米乐，还记得今天。）","onView":{"collect":"p_mile"}}]},{"id":"k1220_01","title":"12月20日：开箱","date":"2026-12-20","dur":"06:40","requires":"ch0","onOpen":{"note":"n_k1220"},"frames":[{"t":"22:05:10","desc":"镜头先拍桌上碟子里的铅块，上面还连着一截剪断的封线。镜头拉远，旁边的铁盒还扣着盖。","say":"已经录上了。江老师，我开了啊。","photo":"<svg class=\"evidence-image\" data-photo=\"seal-base\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"现在的铅封：1999 年末尾的 9 有缺口\"><title>现在的铅封：1999 年末尾的 9 有缺口</title><image href=\"/trial-photo-f4e74f9bd52123bb.webp\" width=\"1448\" height=\"1086\"/><g transform=\"translate(724 550)\" fill=\"#464647\" opacity=\".84\"><defs><mask id=\"stamp-notch-seal-base\" maskUnits=\"userSpaceOnUse\" x=\"-400\" y=\"-300\" width=\"800\" height=\"600\"><rect x=\"-400\" y=\"-300\" width=\"800\" height=\"600\" fill=\"white\"/><path d=\"M-74 43l5 1 1 9-7-1z\" fill=\"black\"/></mask></defs><g mask=\"url(#stamp-notch-seal-base)\"><text x=\"0\" y=\"-48\" font-size=\"54\" text-anchor=\"middle\" font-family=\"SimSun, serif\">梧城少年宫</text><text x=\"-198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"-154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">9</text><text x=\"-22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"22\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text><text x=\"66\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">2</text><text x=\"110\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">.</text><text x=\"154\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">3</text><text x=\"198\" y=\"50\" font-size=\"58\" text-anchor=\"middle\" font-family=\"Consolas, monospace\">1</text></g></g></svg>"},{"t":"22:07:33","desc":"你掀开盒盖，露出贴在内侧的清单。你把蓝、黑、白、绿、粉五张软盘依次取出来。盒底还压着一张没贴标签的灰盘，你把它摆在粉盘旁边。","say":"清单上写五张。……这是第六张。","photo":"<svg class=\"evidence-image\" data-photo=\"unboxing\" viewBox=\"0 0 1448 1086\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘\"><title>开盒时拍的照片：清单贴在盒盖内侧，盒口摆着五张彩色软盘和一张灰色软盘</title><image href=\"/trial-photo-17eddff45a8fcaa9.webp\" width=\"1448\" height=\"1086\"/><g transform=\"matrix(.98 -.057 .035 .98 502 118)\" font-family=\"SimSun, serif\" fill=\"#41392c\" opacity=\".76\" aria-hidden=\"true\"><text x=\"0\" y=\"0\" font-size=\"19\" >梧城少年宫 千禧时间胶囊</text><text x=\"0\" y=\"18\" font-size=\"15\" >封存：1999年12月31日 23:35</text><text x=\"0\" y=\"36\" font-size=\"15\" >开启：2027年1月1日 00:00（2026年跨年夜，等我们都四十岁）</text><text x=\"0\" y=\"54\" font-size=\"15\" ></text><text x=\"0\" y=\"72\" font-size=\"15\" >内装：</text><text x=\"0\" y=\"90\" font-size=\"15\" >1. 陈一鸣　软盘一张　蓝</text><text x=\"0\" y=\"108\" font-size=\"15\" >2. 赵小川　软盘一张　黑</text><text x=\"0\" y=\"126\" font-size=\"15\" >3. 白露　　软盘一张　白</text><text x=\"0\" y=\"144\" font-size=\"15\" >4. 孟凡　　软盘一张　绿</text><text x=\"0\" y=\"162\" font-size=\"15\" >5. 米乐　　软盘一张　粉</text><text x=\"0\" y=\"180\" font-size=\"15\" ></text><text x=\"0\" y=\"198\" font-size=\"15\" >共五张。</text><text x=\"0\" y=\"216\" font-size=\"15\" >铅封：梧城少年宫 1999.12.31</text><text x=\"0\" y=\"234\" font-size=\"15\" >保管人：江振华</text></g></svg>"}]}]},"map":null,"collectLabel":"星图卡与五句话","helpCards":{"ch0":"两位数年份：早年内存和磁盘很贵，程序只存年份的后两位。1999，记作 99。","ch1":"卷序列号：格式化软盘时写下的一串编号。有的制盘程序，会把格式化的时刻藏在里面。"},"storyRevision":2026111001,"materialBatches":[]}));Y2K.patch(D=>{D.titleArt="/trial-photo-2ca4a500ff630388.webp";});
Y2K.patch(D => (function installTrialMigration(D, keepFullRevision = false) {
  const oldLines = ['师傅，读得怎么样？', '五张有颜色的都读出来了。', '那张没标签的呢？', '坏道多，还在修。', '别熬夜。你们修电脑的，都不爱惜身体。', '真读不出来，也别勉强。坏了的东西，有时候就让它坏着吧。'];
  const scene = D.dialogues.find(d => d.id === 'c1_jiang');
  D.migrateStory = state => {
    // Refresh this revised opening line even when the save already has the current revision.
    const photoLine = D.dialogues.find(dialogue => dialogue.id === 'c0_photo_chen').steps[0].me;
    for (const message of state.chat?.chen || []) {
      const matches = message.ref
        ? message.ref.d === 'c0_photo_chen' && message.ref.i === 0
        : message.text === '陈总，这张是我把盘摊开以后拍的。灰色那张原来压在五张彩盘底下，没贴标签。你认识吗？';
      if (matches && message.from === 'me') message.text = photoLine;
    }
    const previous = Math.max(state.storyRevision || 0, (keepFullRevision ? state.paidTrialMigrationRevision : state.trialMigrationRevision) || 0);
    if (previous >= D.storyRevision) return;
    if (state.flags.ch1) state.flags.p2_seal_received = true;
    for (const message of state.chat?.jiang || []) {
      const i = message.ref ? (message.ref.d === scene.id ? message.ref.i : -1) : oldLines.indexOf(message.text);
      const wording = scene.steps[i]?.[message.from];
      if (wording) message.text = wording;
    }
    // Some exported early saves have message text without a dialogue position.
    const imageTime = '2026-12-20 22:30';
    if (state.flags.solved_c0_count || state.flags.ch1 || state.flags.seen_f_d6_dir || state.opened?.f_d6_dir) {
      state.flags.c0_image_ready = true;
      if (state.chapter === 'ch0' && state.clock < imageTime) {
        state.clock = imageTime; state.clockAt = Date.now();
        state.chTime = {date: imageTime.slice(0,10), time: imageTime.slice(11), at: state.clockAt};
      }
    }
    const delivery = D.dialogues.find(d => d.id === 'c0_jiang').steps[3];
    for (const message of state.chat?.jiang || []) {
      const ref = message.ref;
      const matches = ref ? ref.d === 'c0_jiang' && ref.i === 3 : message.text === delivery.npc || message.text?.startsWith('盒子我放你门口了。');
      if (message.from !== 'npc' || !matches || message.sceneAt > delivery.at) continue;
      message.sceneAt = delivery.at; message.at = '12月20日 22:00';
      if (state.clock && state.clock < delivery.at) {
        state.clock = delivery.at; state.clockAt = Date.now();
        state.chTime = {date: delivery.at.slice(0,10), time: delivery.at.slice(11), at: state.clockAt};
      }
      const thread = state.dlg?.c0_jiang;
      if (thread && !thread.done && thread.i > 3 && (!thread.at || thread.at < delivery.at)) thread.at = delivery.at;
    }
    const earlyReplies = [["c0_chen",3,"盒里一人一张软盘，存的都是小时候写的信。我家连个软驱都找不着了，总不能等几万人看直播的时候，才头一回试这些盘能不能读吧？大家都答应先开盒，小川家里也点了头。麻烦你从开盒起录下来。跨年那晚我们再把盘拿上台，念信。"],["c0_chen",5,"等盘能读了，各人的信先给各人。你十三岁写的那封，真想让全公司的人先听？"],["c0_jiang",1,"许嘉我教过，在少年宫。第一次来上课，椅子还得往前拖。后来打字比我都快。你拍的七中那期，我看了。"],["p2_seal_delivery",1,"收到了。我拿昨天开箱那段跟它对着看，铅封和盘片都拍清楚了。灰盘用的是 QNP-FMT，我手里还有这工具的说明，能查查卷序列号。"],["c1_chen",7,"陈总，开盒前咱们说好的，各人先看各人的。你那封我可以给你，别人的得先问一句。"],["c1_kelan",5,"药在抽屉里有什么用。要在你嘴里。"],["c0_chen",4,"行。我先把软盘上的写保护拨好，把能读的都拷出来。真有地方要修，我就在拷贝上修，省得来回折腾原盘。"],["c0_end",3,"有一张没标签。我先读读看。"],["c1_chen",3,"我那天在楼顶，录像里应该没几个我的镜头。"],["c1_chen",4,"那张多出来的盘呢？"],["c1_chen",5,"还在读。"],["c1_chen",7,"陈总，合同第三条你也看过。信上大屏得先问本人。私下给你看也一样，写信的人得说行。"],["c1_chen",8,"那条是你加的。行。"]];
    earlyReplies.push(
      ["c0_chen", 3, "盒里是我们小时候写的信，一人一张软盘。我还指望大伙儿上台念两句呢。昨晚翻遍了家，连个软驱都找不着。我挨家问过了，都说先开吧。师傅，开盒的时候帮我录一下？到时候放给大家看。"],
      ["c0_chen", 4, "行，我先把盘里的东西拷出来。真有坏的地方，我就修拷出来的那份，不折腾原盘。"],
      ["c0_chen", 5, "信读出来，先各自看一遍吧。陈总，你十三岁写的东西，真敢让公司的人先看？"],
      ["c0_chen", 7, "盒子一直在江老师那儿。他以前教我们电脑，今年七十多了，说今晚给你送过去。"],
      ["c0_jiang", 3, "到你门口了。封线我剪了，铅块没扔，盖子也还扣着。你开的时候录一下，让几个孩子看看当年的东西。"],
      ["c0_end", 3, "您看照片最底下，有张灰色的软盘。一鸣说他没印象，您记得是谁放进去的吗？"],
      ["c0_photo_chen", 0, "陈总，给你看张开盒的照片。五张彩盘下面压着一张灰的，也没贴标签。你认识这张灰盘吗？"]
    );
    earlyReplies.push(["c0_chen", 4, "行，我先给盘拨上写保护。能读的先拷，读不出来的地方记下来，回头再试。拼文件就在副本上拼。"], ["c0_chen", 5, "信读出来，各人的先给各人看。陈先生，你十三岁写的东西，真敢让公司的人先看？"]);
    earlyReplies.push(["c0_jiang", 3, "到门口了。盒子还封着呢。我带了钳子，等你把镜头对好了，我再剪线。铅块也给你留着。"], ["c0_chen", 3, "盒里是我们小时候写的信，一人一张软盘。我还指望大伙儿上台念两句呢。昨晚翻遍了家，连个软驱都找不着。我挨家问过了，都同意我先试盘。师傅，从剪封线起就帮我录着吧？到时候放给大家看。"]);
    earlyReplies.push(
      ["c0_chen",1,"1999年跨年那晚，我们五个在梧城少年宫封了个时间胶囊，说好等大伙儿四十岁再开。日子写在盒盖上，2027年1月1号零点。"],
      ["c0_chen",3,"盒里是我们小时候写的信，一人一张软盘。我还指望大伙儿上台念两句呢。昨晚翻遍了家，连个软驱都找不着。我挨家问过了，都同意我先试盘。师傅，开盒的时候帮我录一下？到时候放给大家看。"],
      ["c0_chen",4,"行。我先把软盘上的资料拷贝一份。如果有地方要修，我就在拷贝上修，省得来回折腾原盘"],
      ["c0_chen",6,"哎，那可不行。我连自己写了谁都忘了。先看，看完我再问谁愿意念。读盘的钱公司出，明天我把合同发你。"],
      ["c0_chen",7,"那我就把试盘的事写进活动预告了。盒子一直在江老师那儿，他以前教我们电脑，今年七十多了，说今晚给你送过去。"],
      ["c0_jiang",0,"是老K师傅吧？我是江振华，少年宫退休的计算机老师。一鸣跟你说过了吧。"],
      ["c0_jiang",2,"二十七年，盒子一直搁储藏室那只铁柜里。柜门钥匙在我这儿，没给过别人。这回少年宫旧址要拆了，我才去把盒子拿出来。"],
      ["c0_end",3,"您看照片里那张没标签的灰盘。我开盒时，它压在最底下。一鸣说他没印象，您记得是谁放的吗？"],
      ["c0_end",6,"米乐他爸拍的。这回办仪式，他们刚把带子转出来。我先问问米乐，能不能把整段发你。你开箱那段也留着，别光给我拍个铅封。"],
      ["c1_chen",4,"我又翻出昨晚开盒的照片看了看。盒底那张灰盘，现在能看出是谁的了吗？"],
      ["c1_chen",5,"只读出了几个文件名，里面写的什么还看不见。"],
      ["p2_seal_delivery",1,"收到了，我拿昨天开盒那段跟它对一对。灰盘上还能读出个序列号，是 QNP-FMT 写的。我这儿有说明书，等会儿翻翻。"],
      ["c0_photo_chen",2,"我把你的蓝盘单独收好了。当时除了你们五个，还有谁在盒子旁边？"],
    );
    earlyReplies.push(["c0_chen", 5, "等盘能读了，每个人的信先给他们自己看看。陈先生，你十三岁写的东西，真敢让公司的人先看？"],["p2_seal_delivery", 0, "米乐把录像发过来了。封盒那段从头到尾都在，你先看，别往外放。原带他爸还留着呢。"]);
    for (const [id, index, oldText] of earlyReplies) {
      const dialogue = D.dialogues.find(d => d.id === id);
      for (const message of state.chat?.[dialogue.contact] || []) {
        const matches = message.ref ? message.ref.d === id && message.ref.i === index : message.text === oldText;
        const wording = dialogue.steps[index][message.from];
        if (matches && typeof wording === 'string') message.text = wording;
      }
    }
    // Older releases moved dialogue steps. The November wording edit keeps their positions.
    if (previous < 2026110202) {
      for (const log of Object.values(state.chat || {})) {
        for (const message of log) if (message.text != null) delete message.ref;
      }
      for (const dialogue of D.dialogues) {
        const current = state.dlg?.[dialogue.id];
        if (!current || current.done) continue;
        current.i = 0;
        delete current.rep;
        delete state.wait[dialogue.contact];
        const queue = state.dlgQ[dialogue.contact] ||= [];
        if (!queue.includes(dialogue.id)) queue.unshift(dialogue.id);
      }
    }
    // Old trial saves predate the explicit photo handoff to the commissioner.
    const photo = D.dialogues.find(dialogue => dialogue.id === 'c0_photo_chen');
    const photoDone = state.flags.ch1 || state.flags.dlg_c0_end || state.dlg?.c0_end?.i > 3;
    state.chat ||= {}; state.dlg ||= {}; state.dlgQ ||= {}; state.wait ||= {};
    if (photo && photoDone && !state.dlg[photo.id] && !state.flags['dlg_' + photo.id]) {
      const sceneAt = '2026-12-20 22:30';
      const log = state.chat[photo.contact] ||= [];
      const messages = photo.steps.filter(step => step.me !== undefined || step.npc !== undefined).map((step, i) => {
        const from = step.me !== undefined ? 'me' : 'npc';
        return { from, text: step[from], at: '12月20日 22:30', sceneAt, ref: {d: photo.id, i} };
      });
      const later = log.findIndex(message => message.sceneAt > sceneAt);
      log.splice(later < 0 ? log.length : later, 0, ...messages);
      state.dlg[photo.id] = {i: photo.steps.length, done: 1, at: sceneAt};
      state.flags['dlg_' + photo.id] = true;
    }
    const closing = state.dlg.c0_end;
    if (closing && !closing.done && !state.flags.dlg_c0_photo_chen) {
      const queue = state.dlgQ.jiang || [];
      if (queue[0] === 'c0_end') delete state.wait.jiang;
      state.dlgQ.jiang = queue.filter(id => id !== 'c0_end');
      (state.heldDialogues ||= {}).c0_end = closing;
      delete state.dlg.c0_end;
    }
    if (keepFullRevision) state.paidTrialMigrationRevision = D.storyRevision;
    else { state.trialMigrationRevision = D.storyRevision; state.storyRevision = D.storyRevision; }
  };
})(D, true));
Y2K.boot();