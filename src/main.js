import path from "path";
import url from "url";
import { app, Menu, Tray, nativeImage, Notification, ipcMain } from "electron";
import appMenuTemplate from "./menu/app_menu_template";
import aboutMenuTemplate from "./menu/about_menu_template";
import createWindow from "./helpers/window";
import Store from "electron-store";
import Client from "dank-twitch-api/dist/client";
import open from "open";

let mainWindow;
let notification;
let tray;
let paused = false;
let isQuiting = false;
let firstrun = true;
let statuses = {};
let userData = {};
let displayNames = {};
let client;

let updateSpeed = 6000;
const store = new Store();
let streamers = store.get("streamers" || []); 
// let streamers = [
//   "imakuni",
//   "towelliee",
//   "prattbros",
//   "princesspaperplane",
//   "kitboga",
//   "sovietwomble",
// ];
// store.set("streamers", streamers); 


// const icon = path.join(__dirname, 'tray.png')
const icon = nativeImage.createFromDataURL(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHMSURBVHgB7ZjPbcIwFMZfwgGOcAOE1GQDOkFhg3aClgkoG9AJoBNAN6ATNBs0GyS9wJUjB0T6ucRSFNVxCqmN2veTnoj/v89+2HGIGIZhbOKQZaIoajYajUc83sAGIi9JktBxnHmn03nRtbcqYLPZePh5g3mKKjFsCCGxqo9SAtKBFrA+rEmnsYQjo1y/Eamdl8S73e7a9/3td4WuprF0/p2Oy3uq84SQWOX6fSC98wIPITZWFWoFIB5ndIbjkv1+/5FNQ9D4B80HqgJtCGGmEqoAhI9zTr/59hLtClw6xgSs1+urXFZAJUG4haoyYwJc1+3nsgIqCf6Hc2W/ZAg4cZtNY2d5puM+ryMuOtCMChCnrky3Wi2xrw+pWESc1lFiTADiuFmv1xfZPHHCwnw8jnJxHsCm4gArOoW/+iUNVW2jEqzEpNvtzqkijG+jmOkZJmVKFWF8BTIsYU+6ENFhU4BkeTgcXhFaca/XC9MxPeT1a7XafbvdvitqfAkCClG9Qkj4VcI2LMA2LMA2LMA2LMA2LMA2/0LAli6YMgJCsgTuCCtdnTICxBdlG6uwxfVzoqukFZBe+a7zX5d/ETFZgRjz3OsmwzAM8/f5BIBMjuUC8FMyAAAAAElFTkSuQmCC"
);
const iconPaused = nativeImage.createFromDataURL(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJ0SURBVHgB7ZnNbcIwFIBfwgGOcAOE1LBBmaDtBu0EbSdoO0HpBKUTNN2gnaBsABuQSggkThw58NP3WiJFJo7t5DkBKZ9kmcSJ4y/PsR0CUFJSImWxWJzDkePKCubzeX+z2Ywwv4UjxonbSY3H7Dmy667Van2ABSaTSb1Wqz3izwtMl7Rvt9uNHccZ6FzzQGA6nZ5XKpVRzLHsEnijPMy+MXmSQwJMV3jdQFaHLAJ3mL3HFC0x1SEdPjbkXrjOBOSNDwlWq1Wv2+0u4wpjnwG8kI/ZfUxR2sYDdonP6Pb+Jnkap3rYxR5khdKHOEEiFev1+ie6jUIPBqdfygocUJDQnYzAG+II9e7AAPH8EBfUJ/rAGAlulAIEh8RsNjsTdg1BE+xuY1mZlgCRVcJ1XXFWH4ImOC8MpPWCAVkksBHX0W0cWd7gf5xXESTNP0oBcSmRVoIEaNYNtxuNBo3rV5AsEeyPkaITAZ9DAvtxvVqtvgv10N3tUl1CPx9i6tMEljQL/9ULCiLD3cFSIs0Qi5F4arfbA2DC5BngisTrfrHIgkkEQlgigfiYXlRdREUaAYJLgvC32+0Xdq2g0+mM93V5uI9WxbfNZvMm6eS0AgSnhBTZEiLEaB4Q8LmG2CxkESAKl8gqQBQqwSFAFCbBJUAUIsEpQOQuwS1A5CphQ4DITcKWAJGLhE0BwrqEbQHCqkQeAoQ1ibwECCsSOgJL4MNIApfYymvrCIyBF20Jeo9WfZ/QEaCKOaNAmETCT5LQ+WsxwKwn/rvMAIuE8o2sCGRvdvjJqxe+dobkOQppI4lEX2z80UORoHdyTM9wqpzCp96SkiL5BepYPNjLmoujAAAAAElFTkSuQmCC"
);

import env from "env";

if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

/******************************************
 * Menu
 */

const setApplicationMenu = () => {
  const menus = [appMenuTemplate, aboutMenuTemplate];
  if (env.name !== "production") {
    //menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

/******************************************
 * Communication
 */

const doesExist = async (streamer) => {
  let user = await client.getUser(streamer)
  if( !user.hasOwnProperty('isLive')) {
    return false
  }
  return true
}

const initIpc = () => {
  ipcMain.on("get-pause", (e, arg) => {
    e.reply("pause-status", paused);
  });

  ipcMain.on("get-streamers", (e, arg) => {
    e.reply("streamers", streamers, statuses, displayNames);
  });

  ipcMain.on("add-streamer", (e, streamer) => {
    const index = streamers.indexOf(streamer)
    // if(!doesExist()) {
    //   //console.log('streamer does not exist')
    //   return;
    // }
    streamers.push(streamer)
    store.set("streamers", streamers); 
    e.reply("streamers", streamers, statuses, displayNames);
  });

  ipcMain.on("delete-streamer", (e, streamer) => {
    const index = streamers.indexOf(streamer);
    streamers.splice(index, 1);
    delete statuses[streamer]
    delete userData[streamer]
    delete displayNames[streamer]
    store.set("streamers", streamers); 
    e.reply("streamers", streamers, statuses, displayNames);
  });

  ipcMain.on("goto-streamer", (e, streamer) => {
    open("https://www.twitch.tv/" + streamer)
  });
};

/******************************************
 * Main Window
 */

const createMainWindow = () => {
  mainWindow = createWindow("main", {
    width: 370,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: env.name === "test",
    },
  });

  mainWindow.loadFile(path.join(__dirname, "app.html"));

  mainWindow.on("minimize", (e) => {
    //console.log("mini");
    e.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("close", (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }

    return false;
  });

  if (env.name === "development") {
    mainWindow.openDevTools();
  }
};

/******************************************
 * Tray
 */

const setIcon = () => {
  if(paused) {
    tray.setImage(iconPaused)
  } else {
    tray.setImage(icon)
  }
}

const createTray = () => {
  tray = new Tray(icon);

  paused = store.get("paused")

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "Pause Notifications",
      type: "checkbox",
      checked: paused,
      click: (e) => {
        paused = e.checked;
        store.set("paused", paused);
        setIcon()
        //console.log("paused", store.get("paused"));
      },
    },
    {
      label: "Quit",
      click: () => {
        app.exit(0);
      },
    },
  ]);

  tray.setToolTip("Twitch-Mate");
  tray.setContextMenu(contextMenu);

  setIcon()
};



/******************************************
 * Twitch Mate
 */
 const createNotification = (data) => {
  notification = new Notification({ title: data.title, body: data.body, silent: false });

  if(data.streamer) {
    notification.on('click', (event, arg) => {
      open("https://www.twitch.tv/" + data.streamer)
    });
  }

  notification.show();
}

const getAllStreamersStatuses = (client) => {
  if (firstrun) {
    setTimeout(() => {
      firstrun = false;
    }, 3000);
  }

  streamers.forEach(async (streamer, index) => {
    try {
      let user = await client.getUser(streamer);
      user.isLive().then(function (result) {
        if (firstrun) {
          statuses[streamer] = result;
          userData[streamer] = user;
          displayNames[streamer] = user.displayName
        } else {
          if(!statuses[streamer]) {
            statuses[streamer] = result;
            userData[streamer] = user;
            displayNames[streamer] = user.displayName
          }
          if (statuses[streamer] !== result) {
            statuses[streamer] = result;
            if(!paused) {   // only show notifications if not paused
              if (result) {
                createNotification({ streamer: streamer, title: userData[streamer].displayName + " is now online!", body: "Click to go to stream." })
              } else {
                createNotification({ title: "Twitchifier", body: userData[streamer].displayName + " is now offline..." })
              }
            }
          }
        }
      });
    } catch (error) {
      //console.log("Error", error, error?.response?.body);
    }
  });
};

let autoUpdate = (client, delay) => {
  //console.dir(statuses);
  mainWindow.webContents.send('streamers',streamers, statuses, displayNames);
  getAllStreamersStatuses(client);
  setTimeout(() => {
    autoUpdate(client, delay);
  }, delay);
};

const init = async () => {
  client = new Client({
    clientId: "w9iel69nch6roc7753qsld3ygmheor",
    clientSecret: "8akn7ofyez673ccn9llee1y09g3jer",
  });

  autoUpdate(client, updateSpeed);
};



/******************************************
 * App
 */

app.whenReady().then(() => {
  createMainWindow();

  setApplicationMenu();

  initIpc();

  createTray();

  init();

  app.on("activate", function () {
    if (mainWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.exit(0);
    }
  });

  app.on("before-quit", function () {
    isQuiting = true;
  });
});
