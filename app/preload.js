

const autoUpdate = (client, delay) => {
  getAllStreamersStatuses(client);
  setTimeout(() => {
    autoUpdate(client, delay);
  }, delay);
};

const ttv = async () => {
  const client = new Client({
    clientId: "w9iel69nch6roc7753qsld3ygmheor",
    clientSecret: "8akn7ofyez673ccn9llee1y09g3jer",
  });

  autoUpdate(client, 15000);
};


window.addEventListener("DOMContentLoaded", () => {
  ttv()
});
