import open from "open";

export default {
  label: "About",
  submenu: [
    {
      label: "www.twitchifier.com",
      click: () => {
        open("https://www.twitchifier.com/");
      },
    },
    {
      label: "Version 1.0.0",
    },
  ],
};
