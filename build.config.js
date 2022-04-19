const builder = require("electron-builder");
const options = {
  targets: builder.Platform.MAC.createTarget(),
  config: {
    productName: "Hime Display",
    appId: "com.example.yourapp",
    directories: {
      output: "build",
    },
    files: ["dist/renderer/**/*", "dist/main/**/*"],
    dmg: {
      contents: [
        {
          x: 410,
          y: 150,
          type: "link",
          path: "/Applications",
        },
        {
          x: 130,
          y: 150,
          type: "file",
        },
      ],
    },
    nsis: {
      oneClick: false,
      allowElevation: true,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: false,
    },
    mac: {
      icon: "public/icons/logo.png",
    },
    win: {
      icon: "public/icons/logo.png",
      target: [
        {
          target: "nsis",
          arch: ["x64", "ia32"],
        },
      ],
    },
    // linux: {
    //   icon: "public/icons",
    //   target: "tar.gz",
    // },
  },
};

module.exports = options;
