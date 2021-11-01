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
  }

  componentWillMount() {
    ipcRenderer.on("streamers", (e, streamers) => {
      this.setState({streamers: streamers })
    });
  }

  componentDidMount() {
    ipcRenderer.send("get-streamers")
  }

  render() {
    // if (this.state.liked) {
    //   return 'You liked this.';
    // }
    // <button onClick={() => this.setState({ liked: true })}></button>

    function Item(props) {
      return <li>{props.name}</li>;
    }



    return (
      <div>
        <ul>
          {this.state.streamers.map((streamer, i) => (
            <Item key={i} name={streamer} />
          ))}
        </ul>
      </div>
    );
  }
}


ReactDOM.render(React.createElement(App), document.querySelector("#app"));
