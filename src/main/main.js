let devTool = [0, 0];
const path = require("path");
const fs = require("fs");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const {
  BrowserWindow,
  app,
  globalShortcut,
  ipcMain,
  Menu,
  Tray,
  dialog,
} = require("electron");

// 创建本地的数据库用异步可能会导致下方爆炸
let dbPath = path.join(app.getPath("userData"), "db");
let configDBPath = path.join(dbPath, "config.json");
let modelDBPath = path.join(dbPath, "db.json");
// 默认的设置
let defalutConfig = {
  "has-voice": true,
  "drag-move": true,
  "show-frame": false,
  scale: "",
  resolution: "2",
  "open-config-when-start": true,
  "open-display-when-start": true,
  "shortcut-change-model": "CommandOrControl+Y",
  "follow-mouse": true,
  "shortcut-interaction": "",
  "shortcut-return-moto": "",
  "display-mode": "transparent",
  "switch-mode": "random",
  "meticulous-through": true,
  "refresh-db": "",
  "pixel-detect": true,
};
let defaultModelDB = {
  models: [],
  "model-now": null,
};
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath);
  fs.writeFileSync(configDBPath, JSON.stringify(defalutConfig));
  fs.writeFileSync(modelDBPath, JSON.stringify(defaultModelDB));
}
// let db = low(new FileSync(modelDBPath));;
let savedConfigs = low(new FileSync(configDBPath));
let displayMenu = null;
let appIcon = null;
let isTransparent;
const Windows = { configWinodw: null, displayWindow: null };
function detectWindowAlive(window, query) {
  if (query == "alive") {
    return window && !window.isDestroyed();
  } else if (query == "not-alive") {
    return !window || window.isDestroyed();
  }
}
let displayMenuTemplate = [
  {
    click: function () {
      if (detectWindowAlive(Windows.configWindow, "not-alive")) {
        createConfigWindow();
      }
      // Windows.configWindow.show();
    },
    label: "打开控制面板",
  },

  {
    label: "模型操作",
    submenu: [
      {
        click: function () {
          Windows.displayWindow.webContents.send(
            "change-model",
            "defalut-change"
          );
        },
        label: "切换",
      },
      {
        click: function () {
          Windows.displayWindow.webContents.send("resize-model", 1.1);
        },
        label: "放大",
      },
      {
        click: function () {
          Windows.displayWindow.webContents.send("resize-model", 0.9);
        },
        label: "缩小",
      },
    ],
  },
  {
    label: "展示器操作",
    submenu: [
      {
        click: openDisplayWindow,
        label: "打开",
      },
      {
        click: closeDisplayWindow,
        label: "关闭",
      },
      {
        click: reloadDisplayWindow,
        label: "重载",
      },
    ],
  },

  { role: "quit" },
];

app.whenReady().then(() => {
  const iconPath = path.join(__dirname, "assets/icon.png");
  appIcon = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate(displayMenuTemplate);
  appIcon.setContextMenu(contextMenu);

  if (savedConfigs.get("open-config-when-start").value()) {
    createConfigWindow();
  }
  if (savedConfigs.get("open-display-when-start").value()) {
    createDisplayWindow();
  }
  // app.on("activate", () => {
  //   if (BrowserWindow.getAllWindows().length == 0) {
  //     createDisplayWindow();
  //   }
  // });
});

app.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    app.quit();
  }
});
// 向子进程提供用户数据存储目录
ipcMain.on("query-user-db-path", (event) => {
  event.returnValue = dbPath;
});
// 设定展示窗口的穿透
ipcMain.on("set-ignore-mouse-events", (event, ...args) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.setIgnoreMouseEvents(...args);
});
// 两个窗口之间的通信代理
ipcMain.on("message-agent", (event, args) => {
  // console.log(args);
  // 通过to进行发送对象的识别
  if (args.to == "display") {
    if (detectWindowAlive(Windows.displayWindow, "alive")) {
      Windows.displayWindow.webContents.send(args.channel, args.data);
    } else if (
      // 任何时候载入模型，如果没有打开展示器都会自动打开
      args.channel == "change-model" &&
      detectWindowAlive(Windows.displayWindow, "not-alive")
    ) {
      createDisplayWindow();
    }
  } else if (args.to == "config") {
    if (detectWindowAlive(Windows.configWindow, "alive")) {
      Windows.configWindow.webContents.send(args.channel, args.data);
    }
  }
});

function openDisplayWindow() {
  if (detectWindowAlive(Windows.displayWindow, "not-alive")) {
    createDisplayWindow();
  }
}

function closeDisplayWindow() {
  if (detectWindowAlive(Windows.displayWindow, "alive")) {
    Windows.displayWindow.destroy();
  }
}
function reloadDisplayWindow() {
  if (detectWindowAlive(Windows.displayWindow, "alive")) {
    Windows.displayWindow.destroy();
    createDisplayWindow();
  }
}
// 展示器的开关控制
ipcMain.on("open-display-window", () => {
  openDisplayWindow();
});
ipcMain.on("close-display-window", () => {
  closeDisplayWindow();
});
ipcMain.on("reload-display-window", () => {
  reloadDisplayWindow();
});

//  控制面板的窗口大小重设
ipcMain.on("resize-config-window", (event, size) => {
  Windows.configWindow.setSize(size.width, size.height, true);
});
ipcMain.handle("select-model-db-path", (event) => {
  return dialog.showOpenDialogSync(Windows.configWindow, {
    properties: ["openDirectory"],
  });
});
ipcMain.handle("reset-config", (event) => {
  fs.writeFileSync(configDBPath, JSON.stringify(defalutConfig));
  fs.writeFileSync(modelDBPath, JSON.stringify(defaultModelDB));
  return true;
});
function createDisplayWindow() {
  savedConfigs.read();
  isTransparent = savedConfigs.get("display-mode").value() == "transparent";
  const win = new BrowserWindow({
    title: "Hime Display",
    frame: !isTransparent, //去除边框
    hasShadow: !isTransparent, //live2d模型会动，导致阴影出问题，所以干脆不要了
    transparent: isTransparent, //让窗口透明
    autoHideMenuBar: isTransparent,
    skipTaskbar: isTransparent,
    // acceptFirstMouse: true, //不接受其他事件，不影响下方窗口，但是将鼠标移动事件同步传入，实现模型视线的跟踪
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      // 在生产环境打开开发者工具会导致窗口进入不可控的事态
      devTools: import.meta.env.DEV,
    },
  });
  Windows.displayWindow = win;
  //模型展示器初始化
  win.loadURL(
    import.meta.env.DEV
      ? "http://localhost:3000/display.html"
      : "file://" + path.resolve(__dirname, "../renderer/display.html")
  );
  // win.loadURL("http://localhost:3000/display.html");
  if (devTool[0]) {
    win.webContents.openDevTools();
  }

  displayMenu = Menu.buildFromTemplate(displayMenuTemplate);
  win.webContents.on("context-menu", (e, params) => {
    displayMenu.popup(win, params.x, params.y);
  });
  if (isTransparent) {
    win.maximize(); //让整个窗口最大化
    win.setIgnoreMouseEvents(true, {
      forward: savedConfigs.get("follow-mouse").value(),
    }); //忽略鼠标的事件，直接穿透到下方
    win.setAlwaysOnTop(true, "screen-saver", 1);
    win.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true, //在所有窗口上显示，全屏应用也不例外
    });
  }
  // 告知控制面板展示器关闭了
  win.on("closed", () => {
    if (detectWindowAlive(Windows.configWindow, "alive")) {
      Windows.configWindow.webContents.send("display-closed");
    }
  });
  // app.dock.hide();
  savedConfigs.get("shortcut-change-model").value() &&
    globalShortcut.register(
      savedConfigs.get("shortcut-change-model").value(),
      () => {
        if (detectWindowAlive(Windows.displayWindow, "alive")) {
          Windows.displayWindow.webContents.send(
            "change-model",
            "defalut-change"
          );
        }
      }
    );
  savedConfigs.get("shortcut-interaction").value() &&
    globalShortcut.register(
      savedConfigs.get("shortcut-interaction").value(),
      () => {
        if (detectWindowAlive(Windows.displayWindow, "alive")) {
          Windows.displayWindow.webContents.send("random-motion");
        }
      }
    );
  savedConfigs.get("shortcut-return-moto").value() &&
    globalShortcut.register(
      savedConfigs.get("shortcut-return-moto").value(),
      () => {
        if (detectWindowAlive(Windows.displayWindow, "alive")) {
          Windows.displayWindow.webContents.send("return-moto");
        }
      }
    );
  //截图测试代码
  // globalShortcut.register("CommandOrControl+P", () => {
  //   let { x, y } = screen.getCursorScreenPoint();
  //   console.log(x, y);
  //   win.webContents
  //     .capturePage({ x: x, y: y, width: 1, height: 1 })
  //     .then(function (image) {
  //       var buffer = image.getBitmap();
  //       console.log(buffer);
  //       // send the data back to renderer for processing, with buffer[3] being the alpha channel
  //       // webContents.send('capturePage', 'RESULT|' + [buffer[0],buffer[1],buffer[2],buffer[3]])
  //     });
  // });
}

function createConfigWindow() {
  const win = new BrowserWindow({
    title: "Hime Display 控制面板",
    // Windows下会有一个菜单栏的高度
    height: 519 + (process.platform == "win32" ? 55 : 0),
    width: 560,
    titleBarStyle: "hidden",
    vibrancy: "window",
    autoHideMenuBar: true,
    titleBarOverlay: true,
    // visualEffectState: "active",
    autoHideMenuBar: true,
    // skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      devTools: import.meta.env.DEV,
    },
  });
  Windows.configWindow = win;
  win.once("ready-to-show", () => {
    win.show();
  });

  if (devTool[1]) {
    win.webContents.openDevTools();
  }
  win.loadURL(
    import.meta.env.DEV
      ? "http://localhost:3000/config.html"
      : "file://" + path.resolve(__dirname, "../renderer/config.html")
  );
  // win.loadURL("http://localhost:3000/config.html");
  win.on("blur", () => {
    //保持窗口一直处于聚焦状态
    if (detectWindowAlive(Windows.displayWindow, "alive")) {
      Windows.displayWindow.focus();
    }
  });
}
