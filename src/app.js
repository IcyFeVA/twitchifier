import "./stylesheets/main.css";
import { ipcRenderer } from "electron";

ipcRenderer.on("pause-status", (e, paused) => {
  console.log("---", paused);
});
ipcRenderer.on("streamers", (e, streamers) => {
  console.log("---", streamers);
});

document.querySelector("#btn").addEventListener("click", (e) => {
    e.preventDefault();
    ipcRenderer.send("get-streamers", e.target.href);
  });
