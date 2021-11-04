"use strict";

import "./stylesheets/main.css";
import { ipcRenderer } from "electron";

ipcRenderer.on("pause-status", (e, paused) => {
  //console.log("---", paused);
});






class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { streamers: [], statuses: {}, displayNames: {} };
    
    this.deleteStreamer = this.deleteStreamer.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on("pause-status", (e, paused) => {
      //console.log("---", paused);
    });

    ipcRenderer.on("streamers", (e, streamers, statuses, displayNames) => {
      this.setState({ streamers: streamers, statuses: statuses, displayNames: displayNames});
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

    if(input.value != "") {
      ipcRenderer.send("add-streamer", input.value.toLowerCase());
      input.value = ""
    }
  }

  deleteStreamer(streamer) {
    ipcRenderer.send("delete-streamer", streamer);
  }

  render() {
    function Item(props, func) {
      if(props.state.statuses.hasOwnProperty(props.streamer)) {
        const isLoggedIn = props.state.statuses[props.streamer]

        let displayName = props.streamer
        if(props.state.displayNames.hasOwnProperty(props.streamer)) {
          displayName = props.state.displayNames[props.streamer]
        }
        
        if(isLoggedIn) {
          return (
            <li className="listItem">
              <div className="dot-online"></div>
              <div className="name" onClick={() => { ipcRenderer.send("goto-streamer", props.streamer) }}>{displayName}</div>
              <div className="btnDelete fa fa-times" onClick={() => props.func(props.streamer)}></div>
            </li>
          );
        } else {
          return (
            <li className="listItem">
              <div className="dot-offline" ></div>
              <div className="name" onClick={() => { ipcRenderer.send("goto-streamer", props.streamer) }}>{displayName}</div>
              <div className="btnDelete fa fa-times" onClick={() => props.func(props.streamer)}></div>
            </li>
          );
        }
      }

      return (
        <li className="listItem">
          <div className="loader"></div>
          <div className="name">{props.streamer}</div>
          <div className="btnDelete fa fa-times" onClick={() => props.func(props.streamer)}></div>
        </li>
      );
    }

    let state = this.state;
    return (
      <div className="UI">
        <div className="header">
        <input type="text" placeholder="Streamer" className="inputName" />
        <button className="addButton" onClick={() => this.addStreamer()}>ADD</button>
        </div>
        {state.streamers.length == 0 &&
        <div className="suggestion">
          <span className="bold">Feels empty here...</span><br />Just add your favorite Twitch streamers.
        </div>
        }
        <ul>
          {this.state.streamers.map((streamer, i) => (
            <Item key={i} streamer={streamer} state={state} func={this.deleteStreamer}/>
          ))}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(React.createElement(App), document.querySelector("#app"));
