const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { ipcRenderer } = require("electron");
const userDBPath = ipcRenderer.sendSync("query-user-db-path");
const dbPath = path.join(userDBPath, "db.json");
const configPath = path.join(userDBPath, "config.json");
const _ = require("lodash");
const db = low(new FileSync(dbPath));
let modelNow = db.get("model-now").value();
let model = null;
let app = null;
let savedConfigs = low(new FileSync(configPath));
let resolution = savedConfigs.value()["resolution"];
let isTransparent = savedConfigs.get("display-mode").value() == "transparent";
let autoInteract = savedConfigs.value()["follow-mouse"];
// 载入控制面板的设定选项
let canvas = document.getElementById("canvas");
(async function main() {
  app = new PIXI.Application({
    view: canvas,
    autoStart: true,
    resizeTo:
      savedConfigs.value()["display-mode"] == "transparent" ? window : null,
    transparent: true,
    // savedConfigs.value()["display-mode"] == "transparent" ? true : false,
    antialias: true,
    autoDensity: true,

    // 用于抠像素……
    preserveDrawingBuffer: true,
    // forceCanvas: true,
    resolution: resolution,
  });
  // app.renderer.autoDensity = true;
  // 确保当前模型不是null
  if (modelNow) {
    await changeModel(modelNow);
  }
})();

async function changeModel(cubismModel) {
  if (model) {
    model.destroy();
  }
  model = await PIXI.live2d.Live2DModel.from(cubismModel.entrance_path, {
    // 用于指定是否进行鼠标跟踪
    autoInteract: autoInteract,
  });
  if (!savedConfigs.get("has-voice").value()) {
    PIXI.live2d.SoundManager.volume = 0;
  }
  app.stage.addChild(model);
  if (!cubismModel.custom_configs) {
    const scaleX = (innerWidth * 0.34) / model.width;
    const scaleY = (innerHeight * 0.8) / model.height;
    // console.log(scaleX, scaleY);
    model.scale.set(Math.min(scaleX, scaleY));
    model.x = app.renderer.view.width / resolution - model.width;
    model.y = app.renderer.view.height / resolution - model.height;
  } else {
    model.x = cubismModel.custom_configs.x;
    model.y = cubismModel.custom_configs.y;
    model.scale.set(cubismModel.custom_configs.scale);
    model.interationMotionGroups = cubismModel.custom_configs.interact_group;
  }
  // model.on("hit", (hitArea) => {
  //   console.log(hitArea);
  // });
  sendModelConfig();
  if (savedConfigs.value()["drag-move"]) {
    draggable(model);
  }
  if (savedConfigs.value()["show-frame"]) {
    addFrame(model);
  }
  // 之前更改modelNow是在这里的，但这会导致直接从模型数据库或拖拽加载时无法收到change-model的信息
  // db.set("model-now", modelNow).write();
  ipcRenderer.send("message-agent", {
    channel: "refresh-model",
    data: null,
    from: "display",
    to: "config",
  });
}

let context =
  document.getElementById("canvas").getContext("webgl2") ||
  // 对Windows7的适配
  document.getElementById("canvas").getContext("webgl");
let rgba;
let ignoreFlag = true; //优化性能，加个flag，减少向主进程传递更改穿透的次数
let pixelDetect = savedConfigs.get("pixel-detect").value();
if (isTransparent) {
  canvas.addEventListener(
    "mousemove",
    // 待修bug，没有模型的时候会报错。但是加入判断语句会导致函数失效
    _.throttle(detectIfClickThrough, 20)
  );
}
function detectIfClickThrough(event) {
  if (
    model &&
    //一堆判断是否鼠标在DisplayObject的条件
    event.clientX < model.x + model.width &&
    event.clientX > model.x &&
    event.clientY < model.y + model.height &&
    event.clientY > model.y
  ) {
    if (pixelDetect) {
      //弃用，每一次都去获取2d上下文，超级消耗性能
      // context = app.renderer.extract.canvas().getContext("2d"); //依旧是我理解不了的问题，这个context的获取只能放在事件响应函数里面才能正常工作
      // rgba = context.getImageData(event.clientX, event.clientY, 1, 1).data;
      rgba = new Uint8Array(4);
      context.readPixels(
        event.clientX * resolution,
        (app.view.height / resolution - event.clientY) * resolution, //2d坐标系和3d坐标系的转换，坐标原点变为屏幕右下角
        1,
        1,
        context.RGBA,
        context.UNSIGNED_BYTE,
        rgba
      );
      if (rgba[3] != 0 && ignoreFlag == true) {
        ipcRenderer.send("set-ignore-mouse-events", false);
        ignoreFlag = false;
        // console.log(event.clientX, event.clientY);
      } else if (rgba[3] == 0 && ignoreFlag == false) {
        ipcRenderer.send("set-ignore-mouse-events", true, { forward: true });
        ignoreFlag = true;
      }
    } else {
      if (ignoreFlag) {
        ipcRenderer.send("set-ignore-mouse-events", false);
        ignoreFlag = false;
      }
    }
  } else {
    if (ignoreFlag == false) {
      ipcRenderer.send("set-ignore-mouse-events", true, { forward: true });
      ignoreFlag = true;
    }
  }
}
canvas.addEventListener("click", () => {
  // console.log("clicked");
  if (!model.dragged) {
    // model.internalModel.motionManager.startRandomMotion(
    //   _.sample(Object.keys(model.internalModel.motionManager.definitions))
    // );
    model.internalModel.motionManager.startRandomMotion(
      _.sample(
        model.interationMotionGroups
          ? model.interationMotionGroups
          : Object.keys(model.internalModel.settings.motions)
      )
    );
  }
  model.dragged = false;
});

function exportCanvasAsPNG(fileName) {
  var canvasElement = document.getElementById("canvas");
  var canvasElement = canvas;
  var MIME_TYPE = "image/png";
  // var imgURL = app.renderer.extract.canvas().toDataURL();
  // var imgURL = app.renderer.plugins.extract.image().src;
  // var imgURL = app.view.toDataURL();
  var imgURL = canvasElement.toDataURL(MIME_TYPE);
  // var imgURL = app.renderer.extract.base64(model, "image/png", 1);
  // var imgURL = modelBase64();

  var dlLink = document.createElement("a");
  dlLink.download = fileName;
  dlLink.href = imgURL;
  dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(
    ":"
  );
  document.body.appendChild(dlLink);
  dlLink.click();
  document.body.removeChild(dlLink);
}

function addFrame(model) {
  const foreground = PIXI.Sprite.from(PIXI.Texture.WHITE);
  foreground.width = model.internalModel.width;
  foreground.height = model.internalModel.height;
  foreground.alpha = 0.2;
  model.addChild(foreground);
}
function draggable(model) {
  // model.buttonMode = true;
  model.on("pointerdown", (e) => {
    // console.log(, e.data.button);
    if (e.data.button == 0) {
      //防止右键触发移动事件
      model.dragging = true;
      model._pointerX = e.data.global.x - model.x;
      model._pointerY = e.data.global.y - model.y;
    }
  });
  model.on("pointermove", (e) => {
    if (model.dragging) {
      model.position.x = e.data.global.x - model._pointerX;
      model.position.y = e.data.global.y - model._pointerY;
      model.dragged = true;
      sendModelConfig();
    }
  });
  model.on("pointerupoutside", () => (model.dragging = false));
  model.on("pointerup", () => (model.dragging = false));
}
// 弃用：base64截图
// function modelBase64() {
//   modelCanvas = document.createElement("canvas");
//   modelCanvas.width = canvas.width;
//   modelCanvas.height = canvas.height;
//   modelImg = new Image();
//   modelImg.src = document.getElementById("canvas").toDataURL("image/png");
//   modelImg.onload = () => {
//     modelCanvas.getContext("2d").drawImage(
//       modelImg,
//       0,
//       0，
//       model.x,
//       model.y,
//       model.width,
//       model.height,
//       0,
//       0,
//       model.width,
//       model.height
//     );
//   };
//   return modelCanvas.toDataURL("image/png");
// }

function sendModelConfig() {
  ipcRenderer.send("message-agent", {
    channel: "refresh-model-data",
    data: {
      x: model.x,
      y: model.y,
      scale: model.scale.x,
    },
    from: "display",
    to: "config",
  });
}

ipcRenderer.on("change-model", (event, modelInfo) => {
  if (modelInfo == "defalut-change") {
    if (savedConfigs.value()["switch-mode"] == "junban") {
      modelNow = db.get("models").value()[
        db.get("models").findIndex(modelNow).value() <
        db.get("models").value().length - 1
          ? db.get("models").findIndex(modelNow).value() + 1
          : 0
      ];
    } else {
      modelNow = db.get("models").sample().value();
    }
    modelInfo = modelNow;
  } else {
    modelNow = modelInfo;
  }
  changeModel(modelInfo);
});
ipcRenderer.on("play-motion", (evnet, motionData) => {
  model.motion(motionData.group, motionData.index);
});
ipcRenderer.on("resize-model", (event, rate) => {
  model.scale.set(model.scale.x * rate);
  sendModelConfig();
});
ipcRenderer.on("query-model-config", () => {
  sendModelConfig();
});
ipcRenderer.on("refresh-model-data", (event, data) => {
  model.x = data.x;
  model.y = data.y;
  model.scale.set(data.scale);
});
ipcRenderer.on("random-motion", () => {
  model.internalModel.motionManager.startRandomMotion(
    _.sample(Object.keys(model.internalModel.motionManager.motionGroups))
  );
});
ipcRenderer.on("return-moto", () => {
  model.scale.set(1);
  const scaleX = (innerWidth * 0.34) / model.width;
  const scaleY = (innerHeight * 0.8) / model.height;
  model.scale.set(Math.min(scaleX, scaleY));
  model.x = app.renderer.view.width / resolution - model.width;
  model.y = app.renderer.view.height / resolution - model.height;
});
