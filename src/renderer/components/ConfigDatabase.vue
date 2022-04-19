<template>
  <div class="config-inner">
    <div class="config-field">
      <div class="field-description">模型数据库</div>

      <el-input
        v-model="searchModelText"
        placeholder="搜索模型名称"
        clearable
        style="width: 70%"
      />
      <el-button @click="loadSelectModel" style="margin: auto; float: right"
        >载入选中模型</el-button
      >

      <el-table
        :data="filterModelData"
        highlight-current-row
        @current-change="changeModel"
        height="320"
        style="cursor: default; margin-top: 15px"
        v-loading="isDatabaseLoading"
        element-loading-text="正在载入数据库..."
        empty-text="无模型数据"
      >
        <!-- Element的无限滚动无法生效，先放这儿 -->
        <!-- v-infinite-scroll="loadMore"
        infinite-scroll-immediate -->
        <el-table-column
          prop="name"
          label="模型名称"
          show-overflow-tooltip
          width="230"
          sortable
        />
        <el-table-column
          prop="version"
          label="版本"
          :filters="[
            { text: 'moc', value: 'moc' },
            { text: 'moc3', value: 'moc3' },
          ]"
          :filter-method="
            (value, row) => {
              return row.version === value;
            }
          "
          align="center"
        >
          <template #default="scope">
            <template v-if="scope.row.version == 'moc3'">
              <el-tag>moc3</el-tag>
            </template>
            <template v-else-if="scope.row.version == 'moc'">
              <el-tag type="success">moc</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          prop="has_motion"
          label="动作文件"
          :filters="[
            { text: '有', value: true },
            { text: '无', value: false },
          ]"
          :filter-method="
            (value, row) => {
              return row.has_motion === value;
            }
          "
          align="center"
        >
          <template #default="scope">
            <template v-if="scope.row.has_motion">
              <el-tag type="warning">有</el-tag>
            </template>
            <template v-else>
              <el-tag type="info">无</el-tag>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="config-field">
      <div class="field-description">数据库路径</div>
      <el-form label-width="120px" class="filed-form">
        <el-form-item
          label="当前数据库路径"
          class="regular-text-color"
          style="white-space: nowrap"
        >
          <el-scrollbar>
            <!-- 保证滚动条的最佳样式 -->
            <div style="padding: 0 10px">
              {{
                configs["refresh-db"] == ""
                  ? "未设定路径"
                  : configs["refresh-db"]
              }}
            </div>
          </el-scrollbar>
        </el-form-item>
        <el-form-item label="数据库操作">
          <el-button type="primary" plain @click="changeDatabasePath"
            >设定</el-button
          >
          <el-button type="success" plain @click="refreshDatabase"
            >刷新</el-button
          >
          <el-button type="danger" plain @click="resetDatabase">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from "../store/config";
import { reactive, ref, computed } from "vue";
const { ipcRenderer } = require("electron");
// 用于转换原始对象
import { toRaw } from "@vue/reactivity";
const configStore = useConfigStore();
let selectedModel = reactive({});
const configs = configStore.savedConfigs.value();
const isDatabaseLoading = ref(false);
function changeModel(currentRow) {
  selectedModel = currentRow;
}
function loadSelectModel() {
  // console.log(selectedModel);
  configStore.db.set("model-now", toRaw(selectedModel)).write();
  ipcRenderer.send("message-agent", {
    channel: "change-model",
    // 这里无法传递代理对象过去
    data: toRaw(selectedModel),
    from: "config",
    to: "display",
  });
}
function changeDatabasePath() {
  ipcRenderer.invoke("select-model-db-path").then((path) => {
    if (path) {
      configs["refresh-db"] = path[0];
      refreshDatabase();
    }
  });
}
function resetDatabase() {
  configStore.clearModelDB();
  configStore.db.read();
  configs["refresh-db"] = "";
  configStore.modelList = configStore.db.get("models").value();
}
function refreshDatabase() {
  isDatabaseLoading.value = true;
  // console.log(isDatabaseLoading.value);
  configStore.clearModelDB();
  configStore.refreshModelDB(configs["refresh-db"]).then(() => {
    configStore.db.read();
    configStore.modelList = configStore.db.get("models").value();
    isDatabaseLoading.value = false;
  });
}
const searchModelText = ref("");
const filterModelData = computed(() =>
  configStore.modelList.filter(
    (data) =>
      !searchModelText.value ||
      data.name.toLowerCase().includes(searchModelText.value.toLowerCase())
  )
);

// Element的无限滚动无法生效，先放这儿
// function loadMore() {

// }
</script>

<style></style>
