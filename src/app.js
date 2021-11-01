'use strict';

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






class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return (
      <button onClick={() => this.setState({ liked: true })}>
        Like
      </button>
    );
  }
}

ReactDOM.render(React.createElement(App), document.querySelector("#app"));