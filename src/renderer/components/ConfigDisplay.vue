<template>
  <div class="config-inner">
    <div class="config-field">
      <div class="field-description">
        模型选项<show-help>
          重启展示器生效。<br />
          精细穿透：大多模型的占用区域为一个矩形，开启后将通过检测指针所在像素点是否透明的方式确定是否进行窗口穿透。不开启时检测穿透将以模型的占用区域为准。</show-help
        >
      </div>
      <!-- 使用vertical-align: top确保inoine-block的排列正确 -->
      <el-form
        label-width="120px"
        class="filed-form"
        style="display: inline-block; vertical-align: top"
      >
        <el-form-item label="鼠标跟踪">
          <el-switch v-model="configs['follow-mouse']" />
        </el-form-item>
        <el-form-item label="拖拽移动">
          <el-switch v-model="configs['drag-move']" />
        </el-form-item>
      </el-form>
      <el-form
        label-width="120px"
        class="filed-form"
        style="display: inline-block; vertical-align: top"
      >
        <el-form-item label="播放音频">
          <el-switch v-model="configs['has-voice']" />
        </el-form-item>
        <el-form-item label="精细穿透">
          <el-switch v-model="configs['pixel-detect']" />
        </el-form-item>
        <!-- 停用，使用moc模型会产生严重bug -->
        <!-- <el-form-item label="显示Frame">
          <el-switch v-model="configs['show-frame']" />
        </el-form-item> -->
      </el-form>
    </div>
    <div class="config-field">
      <div class="field-description">
        显示设置
        <show-help>
          重启展示器生效。<br />
          显示器分辨率:对于视网膜显示屏，将该参数设定为Retina以获得最佳显示效果，但这会明显提高性能消耗。
        </show-help>
      </div>
      <el-form label-width="120px" class="filed-form">
        <el-form-item label="显示分辨率">
          <el-radio-group v-model="configs['resolution']">
            <el-radio label="2">Retina</el-radio>
            <el-radio label="1">Usual</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模型切换规则">
          <el-radio-group v-model="configs['switch-mode']">
            <el-radio label="junban">顺序</el-radio>
            <el-radio label="random">随机</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示模式">
          <el-radio-group v-model="configs['display-mode']">
            <el-radio label="transparent">全屏</el-radio>
            <el-radio label="window">窗口</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="展示器操作">
          <el-button
            v-for="displayOperation in displayOperations"
            :key="displayOperation.name"
            @click="displayOperate(displayOperation)"
            :type="displayOperation.type"
            plain
            >{{ displayOperation.name }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from "../store/config";
const { ipcRenderer } = require("electron");
const configStore = useConfigStore();
const configs = configStore.savedConfigs.value();

const displayOperations = [
  {
    name: "打开",
    message: "open-display-window",
    type: "primary",
  },
  {
    name: "重载",
    message: "reload-display-window",
    type: "success",
  },
  {
    name: "关闭",
    message: "close-display-window",
    type: "danger",
  },
];
// 控制展示器的通信
function displayOperate(operation) {
  ipcRenderer.send(operation.message);
}
</script>

<style></style>
