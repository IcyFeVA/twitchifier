"use strict";

import "./stylesheets/main.css";
import { ipcRenderer } from "electron";

ipcRenderer.on("pause-status", (e, paused) => {
  //console.log("---", paused);
});






class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { streamers: {}, streamerNames: [] };
    
    // this.deleteStreamer = this.deleteStreamer.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on("pause-status", (e, paused) => {
      console.log("---", paused);
    });

    ipcRenderer.on("streamers", (e, streamers) => {
      let streamerNames = []
      for (const [key, value] of Object.entries(streamers)) {
        streamerNames.push(key)
      }
      this.setState({ streamers: streamers, streamerNames: streamerNames });
    });

    ipcRenderer.send("get-streamers")
  }

  componentDidMount() {
    var input = document.querySelector(".inputName")

    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.querySelector(".addButton").click();
      }
    });
  }

  addStreamer() {
    let input = document.querySelector(".inputName")

    let val = input.value
    if(val != "") {
      val = val.replace(/[^A-Z0-9]/ig, "");
      ipcRenderer.send("add-streamer", val);
      input.value = ""
    }
  }



  render() {

    function Item(props) {
      const deleteStreamer = () => {
        ipcRenderer.send("delete-streamer", props.streamer);
      }

      if(props.state.streamers[props.streamer].hasOwnProperty('isLive')) {

        const isLive = props.state.streamers[props.streamer].isLive
        const displayName = props.state.streamers[props.streamer].displayName

        if(isLive == 'check') { // App was closed and isLive was set to check
          return (
            <li className="listItem">
              <div className="loader"></div>
              <div className="name" onClick={() => { ipcRenderer.send("goto-streamer", props.streamer) }}>{displayName}</div>
              <div className="btnDelete fa fa-times" onClick={() => deleteStreamer()}></div>
            </li>
          );
        } 
        if(isLive == 'doesntexist') { // App was closed and isLive was set to check
          return (
            <li className="listItem">
              <div className="loader"></div>
              <div className="name">? {displayName}</div>
              <div className="btnDelete fa fa-times" onClick={() => deleteStreamer()}></div>
            </li>
          );
        } 
        if(isLive) {
          return (
            <li className="listItem">
              <div className="dot-online"></div>
              <div className="name" onClick={() => { ipcRenderer.send("goto-streamer", props.streamer) }}>{displayName}</div>
              <div className="btnDelete fa fa-times" onClick={() => deleteStreamer()}></div>
            </li>
          );
        } else {
          return (
            <li className="listItem">
              <div className="dot-offline" ></div>
              <div className="name" onClick={() => { ipcRenderer.send("goto-streamer", props.streamer) }}>{displayName}</div>
              <div className="btnDelete fa fa-times" onClick={() => deleteStreamer()}></div>
            </li>
          );
        }
      }

      // just added streamer
      return (
        <li className="listItem">
          <div className="loader"></div>
          <div className="name">{props.streamer}</div>
          <div className="btnDelete fa fa-times" onClick={() => deleteStreamer()}></div>
        </li>
      );
    }

    const state = this.state;

    const handleKeyDown = e => {
      if (e.key === " ") {
        e.preventDefault();
      }
    };

    if(Object.keys(state.streamers).length == 0) {
      return (
        <div className="UI">
          <div className="header">
          <input type="text" placeholder="Streamer" className="inputName" onKeyDown={handleKeyDown} />
          <button className="addButton" onClick={() => this.addStreamer()}>ADD</button>
          </div>
          <div className="suggestion">
            <span className="bold">Feels empty here...</span><br />Just add your favorite Twitch streamers.
          </div>
        </div>
      );
    } else {
      return (
        <div className="UI">
          <div className="header">
          <input type="text" placeholder="Streamer" className="inputName" onKeyDown={handleKeyDown} />
          <button className="addButton" onClick={() => this.addStreamer()}>ADD</button>
          </div>
          <ul>
            {state.streamerNames.map((streamer, i) =>
              <Item key={i} streamer={streamer} state={state} />
            )}
          </ul>
        </div>
      );
    }
  }
}

ReactDOM.render(React.createElement(App), document.querySelector("#app"));
