"use strict";

import "./stylesheets/main.css";
import { ipcRenderer } from "electron";

let streamersArray = ["LOADING..."];

ipcRenderer.on("pause-status", (e, paused) => {
  console.log("---", paused);
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { streamers: ["loading..."] };
    
    this.deleteStreamer = this.deleteStreamer.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on("streamers", (e, streamers) => {
      this.setState({ streamers: streamers });
    });
  }

  componentDidMount() {
    ipcRenderer.send("get-streamers");
  }

  addStreamer() {
    let input = document.querySelector(".inputName")

    if(input.value != "") {
      ipcRenderer.send("add-streamer", input.value);
      input.value = ""
    }
  }

  deleteStreamer(streamer) {
    ipcRenderer.send("delete-streamer", streamer);
  }

  render() {
    function Item(props, func) {
      return (
        <li className="listItem">
          <div className="name">{props.name}</div>
          <div className="btnDelete" onClick={() => props.func(props.name)}>x</div>
        </li>
      );
    }

    return (
      <div>
        <input type="text" className="inputName" />
        <button className="addButton" onClick={() => this.addStreamer()}>ADD</button>
        <ul>
          {this.state.streamers.map((streamer, i) => (
            <Item key={i} name={streamer} func={this.deleteStreamer}/>
          ))}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(React.createElement(App), document.querySelector("#app"));
