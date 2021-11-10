import path from "path";
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
let client;
let updateSpeed = 6000;
let updateInterval;

const store = new Store();
let streamers = store.get("streamers") || {}; 

// let streamers = {
//   imakuni: {},
//   towelliee: {},
//   bobross: {},
//   sovietwomble: {}
// };
// store.set("streamers", streamers); 


// const icon = path.join(__dirname, 'tray.png')
const icon = nativeImage.createFromDataURL(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMsSURBVHgB7ZhBTBNBFIbfwhoX9QCKSQkkLIleDCHloJyM5aqXEjWRGxy4ihzkqj0aL8XEkwc4mGCMJvUgPbJHjRwaosYEEoekpgYReyi0pluGeUunnW7b3S3ddtNkv2TS6e7bzftn3sx7swA+Pj4djWRnkEql1sEjJEmKBgKBD1Y2MtgTAo+glK7Y2XRBh+ML8JqOF+BkETslXWyc3mJr1tYSN2cgMTAwMMIb+z9lYRs12cbglPhrwGt8AV7jC/AaX4DX+AK8xs1aSGWntxnh/3A9Q3bSCppsVTglrgpgbdmJITtphdlPGFyg40PIyaGeQgs5PNBB+5iEre9p+EUykD3UoeecDIPqBcge6LGd7cxC7NM0qfe8ZwLQ8fhbAlo86cBaiurd2UhMm01X3bF7tBUC/u7m4EUkAft/co6fYU6QQh4mzbPRdgE48s8WN6qcH7vRD2PX+43wwTDa+paGz9rvChtDRHduXJwJN3chR2DYiM4PsVifezwKFy8rFXYTtwJw+74K75e3YXNjz7jGRluVCz1PWHeB27V1F8LQEWMenX/4NFjlPAevzy2OGmLK0Efh0HLp/NxWAdpa5YLFkceQsePuzJUKO1lX5nm/1QIwVglvSbZNciZCgbojb6bnvAyhO0PlC1L5c6eTNbBidZOVBb3FzGqGsDbJvjoQfuHezdV/UPx8gvt8IwwNi/Y0yHu2ApgDs1b32S6lQnVZQMDkfJFS7F5yOPqcwRFRgNTSNUCgtvNIaftjWRYaYX9X3HZp6T1uCyBQ33kkwTvJnQw0grh+gEql97gpgIC185iJNN7FJIUJyykVO5hEXRdAwM55hi4rS7yPIfT65Q9wwpop+el5qfSepgUoioLxaOs8EtOm0liY8f+bX/bg1fOvRoKrBZYdmInj74hwlUbFeqjpUqKvr8/8pdkSvfts5MxRLkzpySkMRWB8X73Wa+QG3PNxtJM/M0bYiGF2Ugv9j4jvsy3mWsGD0KpaOIJ1LsIJ9apRT05kb7Rpku9SxsVwsoZGjSq0xsHGkxkQwdnQC3SebY1B5g1mWExSaTbkuNNoupxbqnWQ8fFxiWNZjT8ZJQEqqQAAAABJRU5ErkJggg=="
);
const iconPaused = nativeImage.createFromDataURL(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGbSURBVHgB7ZixSsRAEIYnYpHy0iVpjG9wLyDclVqdoP35Dj6BT3CVrREECxst1NK0dldariCJhaAWegYO4qwkkltJdrnsZQ3MB0NY9ifMz2ayswtAEESnsWSCJEnuwBCWZU1c172q06yDnAEYIsuyUKZZg45DBkzTeQMqRazKWx4FvTyaamvRuQJTz/M2i8Dxbo12ImgvYUmoBkxDBkxDBkxDBkxDBkyjsxcK8PQ2Lo03qoR40uoL2gCWRKsBjBMVIZ60RvgYgQaoBlbMo0zwnw2MsdWOZCKdNaDMzQWrnX99+ZoeHg1PQQEjBm4lBpA+KEL7QBO29wPYwSg4O36A++j5d4x7xQAf5ZvBEOvioPwOWgEJ4u1DQQCaUDEQ1k1iW9DLd1YRhjHEJWfixN7WeQaakBoQvzkR/E4D+NsWMKhIXjerqAEGLSXP0W2AQYvJc3QaYNBy8hxdBhgYSJ7T2IBt2/w3aSR5TuN9wHGcqn+9lOj6aWHnnX3MF+Z5NxrHcVCM0zR9F99htJWYfc5/og7f96VnAoIgOsw3PNFpf3spvxAAAAAASUVORK5CYII="
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



const initIpc = () => {
  ipcMain.on("get-streamers", (e, arg) => {
    e.reply("streamers", streamers);
  });

  ipcMain.on("add-streamer", (e, streamer) => {
    if(streamers.hasOwnProperty(streamer)) {
      //console.log('streamer already in list')
      return;
    }
    streamers[streamer] = {}
    store.set("streamers", streamers); 
    e.reply("streamers", streamers);
    initAutoUpdate()
  });

  ipcMain.on("delete-streamer", (e, streamer) => {
    delete streamers[streamer]
    store.set("streamers", streamers); 
    e.reply("streamers", streamers);
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

  paused = store.get("paused") || false

  setIcon()

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
        mainWindow.webContents.send('paused',paused);
        //console.log("paused", store.get("paused"));
      },
    },
    {
      label: "Quit",
      click: () => {
        resetStreamers()
        store.set("streamers", streamers); 
        app.exit(0);
      },
    },
  ]);

  tray.setToolTip("Twitchifier");
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

const getAllStreamersStatuses = () => {
  Object.keys(streamers).forEach(async (streamer) => {
    try {
      let user = await client.getUser(streamer);
      if(user != null) {
        
        user.isLive().then(function (result) {

          if (firstrun) {
            streamers[streamer] = { name: streamer, isLive: result, displayName: user.displayName };
          }

          if(streamers[streamer].hasOwnProperty('isLive')) {
            if(streamers[streamer].isLive != result) {
              streamers[streamer].isLive = result;

              if(!paused) {   // only show notifications if not paused
                if (result === true) {
                  createNotification({ streamer: streamer, title: streamers[streamer].displayName + " is now online!", body: "Click to go to stream." })
                  mainWindow.webContents.send('play-sound-on',streamers);
                } else {
                  createNotification({ title: "Twitchifier", body: streamers[streamer].displayName + " is now offline..." })
                  mainWindow.webContents.send('play-sound-off',streamers);
                }
              }
            }
          } else {
            streamers[streamer] = { name: streamer, isLive: result, displayName: user.displayName };
          }

        }).catch((err) => {
          console.log('le error', err)
        });
      } else {
        //console.log('user seems to not exist and will be deleted.')
        delete streamers[streamer] 
      }
    } catch (error) {
      console.log("Error", error, error?.response?.body);
    }
  });
  mainWindow.webContents.send('streamers',streamers);
};



let update = () => {
  //mainWindow.webContents.send('streamers',streamers);
  getAllStreamersStatuses();
};

let initAutoUpdate = () => {
  clearInterval(updateInterval);
  updateInterval = setInterval(() => {
    update();
  }, updateSpeed)
}

const init = async () => {
  client = await new Client({
    clientId: "w9iel69nch6roc7753qsld3ygmheor",
    clientSecret: "8akn7ofyez673ccn9llee1y09g3jer",
  });

  initAutoUpdate()
  update();

  if (firstrun) {
    setTimeout(() => {
      firstrun = false;
      mainWindow.webContents.send('paused',paused);
    }, 3000);
  }
};


const resetStreamers = () => {
  for (const [streamer, val] of Object.entries(streamers)) {
    streamers[streamer].isLive = 'check'
  }
}




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

  app.on("before-quit", function (e) {
    e.preventDefault()
    resetStreamers()
    store.set("streamers", streamers); 
    isQuiting = true;
  });

  
});



