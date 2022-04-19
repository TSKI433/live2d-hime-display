<template>
  <div class="config-inner">
    <div class="config-field">
      <div class="field-description">当前模型</div>
      <el-form
        label-width="120px"
        class="filed-form"
        style="color: var(--el-text-color-regular)"
      >
        <template v-if="configStore.modelNow">
          {{ configStore.modelNow.name }}
          <template v-if="configStore.modelNow.version == 'moc3'">
            <el-tag>moc3</el-tag>
          </template>
          <template v-else-if="configStore.modelNow.version == 'moc'">
            <el-tag type="success">moc</el-tag>
          </template>
        </template>
        <template v-else> 未加载模型 </template>
      </el-form>
    </div>
    <div class="config-field">
      <div class="field-description">模型参数</div>
      <el-form label-width="120px" class="filed-form">
        <el-form-item label="x坐标">
          <el-input-number
            :precision="2"
            :step="60"
            v-model="modelConfig.x"
            @input="refreshModelConfigToDisplay()"
            :disabled="displayLoaded"
          />
          <span class="number-input-unit regular-text-color">像素</span>
        </el-form-item>
        <el-form-item label="y坐标">
          <el-input-number
            :precision="2"
            :step="60"
            v-model="modelConfig.y"
            @input="refreshModelConfigToDisplay()"
            :disabled="displayLoaded"
          />
          <span class="number-input-unit regular-text-color">像素</span>
        </el-form-item>
        <el-form-item label="缩放比例">
          <el-input-number
            :precision="2"
            :step="0.02"
            v-model="modelConfig.scale"
            @input="refreshModelConfigToDisplay()"
            :disabled="displayLoaded"
          />
          <span class="number-input-unit regular-text-color">%</span>
        </el-form-item>
      </el-form>
    </div>
    <div class="config-field">
      <div class="field-description">动作列表</div>
      <el-form label-width="120px" class="filed-form">
        <el-table
          :data="motions"
          height="250"
          style="width: 100%; cursor: default"
          highlight-current-row
          empty-text="无动作数据"
        >
          <el-table-column
            prop="File"
            label="名称"
            width="200"
            show-overflow-tooltip
          >
            <template #default="scope">
              <!-- moc与moc3的入口文件名称略有区别 -->
              {{
                (scope.row.File || scope.row.file) &&
                /(?<=\/?)[^\/]+(?=\.(json|mtn))/.exec(
                  scope.row.File || scope.row.file
                )[0]
              }}
            </template>
          </el-table-column>
          <el-table-column prop="group" label="动作组" align="center">
            <template #default="scope">
              {{ scope.row.group ? scope.row.group : "空" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center">
            <template #default="scope">
              <el-button
                @click="loadMotion(scope.row)"
                :disabled="displayLoaded"
                >载入动作</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from "vue";
import { useConfigStore } from "../store/config";
const { ipcRenderer } = require("electron");
const configStore = useConfigStore();
const configs = configStore.savedConfigs.value();
const modelConfig = reactive({
  x: 0,
  y: 0,
  scale: 0,
});
const displayLoaded = ref(true);
ipcRenderer.on("refresh-model-data", (event, data) => {
  modelConfig.x = parseFloat(data.x.toFixed(2));
  modelConfig.y = parseFloat(data.y.toFixed(2));
  modelConfig.scale = parseFloat(data.scale.toFixed(2));
  displayLoaded.value = false;
});
ipcRenderer.on("display-closed", () => {
  displayLoaded.value = true;
});
// 先后顺序确保了成功的接收到来自展示器的数据
// 使用一个奇怪的花活来实现是否为空对象的判断……
if (!configStore.modelNow) {
  // if (JSON.stringify(configStore.modelNow) == "{}") {
  configStore.loadModelPreview();
}

// 这里本来也想用个watch，但是会形成递归……展示器和控制面板疯狂发信息
function refreshModelConfigToDisplay() {
  ipcRenderer.send("message-agent", {
    channel: "refresh-model-data",
    data: {
      x: modelConfig.x,
      y: modelConfig.y,
      scale: modelConfig.scale,
    },
    from: "config",
    to: "display",
  });
}
const motions = computed(function () {
  const motionList = [];
  Object.keys(configStore.modelMotions).forEach((motionGroupName) => {
    configStore.modelMotions[motionGroupName].forEach((motion, index) => {
      motion.group = motionGroupName;
      motionList.push(motion);
    });
  });
  return motionList;
});
function loadMotion(motion) {
  ipcRenderer.send("message-agent", {
    channel: "play-motion",
    data: {
      index: configStore.modelMotions[motion.group].findIndex(
        (motionItem) => motionItem.File == motion.File
      ),
      group: motion.group,
    },
    from: "config",
    to: "display",
  });
}
ipcRenderer.send("message-agent", {
  channel: "query-model-config",
  data: null,
  from: "config",
  to: "display",
});
</script>

<style>
.number-input-unit {
  margin-left: 0.7em;
}
</style>
