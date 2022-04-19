// 直接使用pinia代理几乎所有的全局逻辑代码
import { defineStore } from "pinia";
import { watch } from "vue";
const path = require("path");
const fs = require("fs");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
// 用于异步函数转换
const util = require("util");
const { ipcRenderer } = require("electron");
// 载入配置模版

const configStore = defineStore({
  id: "config",
  state: () => ({
    initialized: false,
    db: null,
    canvas: null,
    modelList: [],
    modelNow: null,
    // 设为null直接爆炸。因后面要用到Object.keys
    modelMotions: {},
    savedConfigs: null,
    userDBPath: "",
  }),
  // 好吧事实证明这里用计算属性在刷新数据库以后直接爆炸
  // getters: {
  //   // 这里一用箭头函数就爆炸
  //   modelList() {
  //     return this.db.get("models").value();
  //   },
  //   modelNow() {
  //     return this.db.get("models").value()[this.db.get("model-now").value()];
  //   },
  //   // modelMotions() {},
  // },
  actions: {
    async loadModelPreview() {
      this.db.read();
      // console.log(this.modelNow.entrance_path);
      // 先判断有没有当前模型
      if (this.db.get("model-now").value()) {
        this.modelNow = this.db.get("model-now").value();
        // console.log(this.modelNow.entrance_path);
        const model = await PIXI.live2d.Live2DModel.from(
          this.modelNow.entrance_path,
          {
            // 只是截一张图，没有必要动起来。
            autoUpdate: false,
          }
        );
        this.modelMotions = model.internalModel.settings.motions;
        model.destroy();
      }
    },
    setConfig(config, value) {
      savedConfigs.set(config, value).write();
    },
    async refreshModelDB(modelPath) {
      //根据文件路径读取文件，返回文件列表
      // 全部使用肩头函数，确保this对象可以传进去
      const files = await util.promisify(fs.readdir)(modelPath);
      let promises = [];
      //遍历读取到的文件列表
      // 为了保证顶级的Promise在所有目录读取结束后再返回，这里无法使用forEach，因为这样以来就无法await了，直接在里面forEach里面async整活也做不到让顶级的一步函数等着
      for (const filename of files) {
        //获取当前文件的绝对路径
        var filedir = path.join(modelPath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        const stats = await util.promisify(fs.stat)(filedir);
        var isFile = stats.isFile(); //是文件
        var isDir = stats.isDirectory(); //是文件夹
        if (isFile) {
          //是文件
          // console.log(path.extname(filedir));
          this.dectectModelJson(filedir).then((modelInfo) => {
            if (modelInfo) {
              //  防止重复写入模型数据
              if (this.db.get("models").findIndex(modelInfo).value() == -1) {
                this.db.get("models").push(modelInfo).write();
              }
            }
          });
        }
        if (isDir) {
          //递归，如果是文件夹，就继续遍历该文件夹下面的文件
          // 这里不能在push里面写await，Promise.all应该接收一个Promise的列表
          promises.push(this.refreshModelDB(filedir));
          // 这样写的话和同步都没有区别了
          // await this.refreshModelDB(filedir);
        }
      }
      // console.log(modelPath);
      // 异步的关键
      return Promise.all(promises);
    },
    clearModelDB() {
      this.db
        .get("models")
        .remove(() => true)
        .write();
    },
    async dectectModelJson(jsonPath) {
      // 确保格式正确
      if (path.extname(jsonPath) == ".json") {
        // 回调函数往上无法嵌套，转换成Promise
        let data = await util.promisify(fs.readFile)(jsonPath);
        let modelInfo = {};
        let fileJson = JSON.parse(data.toString());
        // 区分模型的版本
        if ("model" in fileJson) {
          // 同时切分Windows和UNIX路径
          modelInfo.name = path
            .dirname(jsonPath)
            .split("/")
            .pop()
            .split("\\")
            .pop();
          modelInfo.version = "moc";
          modelInfo.entrance_path =
            // Windows下使用file:会导致路径出错，热重载开发环境下不使用file:会导致路径报错
            (import.meta.env.DEV ? "file://" : "") + path.resolve(jsonPath);
          modelInfo.has_motion = "motions" in fileJson ? true : false;
          return modelInfo;
        } else if ("FileReferences" in fileJson) {
          modelInfo.name = path
            .dirname(jsonPath)
            .split("/")
            .pop()
            .split("\\")
            .pop();
          modelInfo.version = "moc3";
          modelInfo.entrance_path =
            (import.meta.env.DEV ? "file://" : "") + path.resolve(jsonPath);
          modelInfo.has_motion =
            "Motions" in fileJson.FileReferences ? true : false;
          // console.log(modelInfo);
          return modelInfo;
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
    async loadModelFromPath(modelPath) {
      let modelInfo = await this.dectectModelJson(modelPath);
      if (modelInfo) {
        this.db.set("model-now", modelInfo).write();
        ipcRenderer.send("message-agent", {
          channel: "change-model",
          data: modelInfo,
          from: "config",
          to: "display",
        });
      } else {
        ElMessage({
          message: "无法识别该模型入口文件",
          type: "warning",
        });
      }
    },
    resetConfig() {
      ipcRenderer.invoke("reset-config").then(() => {
        this.savedConfigs.read();
        ElMessage({
          message: "重置成功",
          type: "success",
          duration: 800,
        });
        setTimeout(() => {
          location.reload();
        }, 1000);
      });
    },
  },
});

export const useConfigStore = function () {
  const config = configStore();
  window.configStore = config;

  //  通过是否初始化的判断来放置多次进行初始化
  if (!config.initialized) {
    config.initialized = true;
    // 后续的操作都要用到数据库，迫不得已这里只能阻塞进程使用同步请求了
    config.userDBPath = ipcRenderer.sendSync("query-user-db-path");
    // console.log(path.join(config.userDBPath, "config.json"));
    config.db = low(new FileSync(path.join(config.userDBPath, "db.json")));
    config.savedConfigs = low(
      new FileSync(path.join(config.userDBPath, "config.json"))
    );

    // 得益于pinia的深度代理，lowdb的内部数据有变化都能直接通过watch侦测到，然后直接调用保存函数，实现控制数据的实时保存
    watch(config.savedConfigs.value(), () => {
      config.savedConfigs.write();
    });
    config.modelList = config.db.get("models").value();
    // 监听一系列主进程的事件
    ipcRenderer.on("refresh-model", () => {
      config.loadModelPreview();
    });
  }
  return config;
};
