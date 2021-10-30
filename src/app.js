import "./stylesheets/main.css";
import Client from "dank-twitch-api/dist/client";


var open = require("open");





let firstrun = true

const streamers = ['imakuni', 'towelliee', 'prattbros', 'princesspaperplane', 'kitboga', 'sovietwomble', 'frogpants', 'bottedfps', 'woodenpotatoes', 'vivisartservice', 'jon_jagger', 'beauschwartz', 'agent_engel', 'guildwars2']

let statuses = {}
let userData = {}

const getAllStreamersStatuses = (client) => {
  if(firstrun) {
    setTimeout(() => {
      firstrun = false
    }, 7000)
  }
  streamers.forEach( async (streamer, index) => {
    try {
      let user = await client.getUser(streamer);
      user.isLive().then(function(result) {
        if(firstrun) {
          statuses[streamer] = result
          userData[streamer] = user
        } else {
          if(statuses[streamer] !== result) {
            statuses[streamer] = result
            if(result) {
              new Notification(userData[streamer].displayName + ' is now online!', { body: 'Click to go to stream.' })
  .onclick = () => open("https://www.twitch.tv/" + streamer)
            } else {
              new Notification('TTV-Notifier', { body: userData[streamer].displayName + ' is now offline...' })
            }
          }
        }
      }) 
    } catch (error) {
      console.log('Error', error, error?.response?.body);
    }
  });
}

const autoUpdate = (client, delay) => {
  console.dir(statuses)
  getAllStreamersStatuses(client)
  setTimeout(() => {
    autoUpdate(client, delay)
  }, delay)
}

const ttv = async () => {
  const client = new Client({
    clientId: 'w9iel69nch6roc7753qsld3ygmheor',
    clientSecret: '8akn7ofyez673ccn9llee1y09g3jer',
  });
  
  autoUpdate(client, 15000)
};

ttv()
