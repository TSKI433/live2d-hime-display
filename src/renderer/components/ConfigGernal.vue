<template>
  <div class="config-inner">
    <div class="config-field">
      <div class="field-description">
        默认启动<show-help>
          Mac上目前存在未知bug，刚启动应用通过控制面板打开展示器初次启动时会导致跨桌面显示失效，因此建议直接启动时打开展示器
        </show-help>
      </div>
      <el-form
        label-width="120px"
        class="filed-form"
        style="display: inline-block; vertical-align: top"
      >
        <el-form-item label="控制面板">
          <el-switch v-model="configs['open-config-when-start']" />
        </el-form-item>
      </el-form>
      <el-form
        label-width="120px"
        class="filed-form"
        style="display: inline-block; vertical-align: top"
      >
        <el-form-item label="展示器">
          <el-switch v-model="configs['open-display-when-start']" />
        </el-form-item>
      </el-form>
    </div>
    <div class="config-field">
      <div class="field-description">
        注册快捷键
        <show-help>
          此处输入内容将直接提供给Electron进行快捷键绑定，具体名称参见
          <!-- 对打开链接需要特殊处理 -->
          <a
            href="https://www.electronjs.org/zh/docs/latest/api/accelerator"
            @click.prevent="
              (event) => {
                shell.openExternal(event.target.href);
              }
            "
          >
            官方文档</a
          >。 此处的触发动作将随机播放一个模型动作，
          模型切换规则以显示器设定为准。
        </show-help>
      </div>
      <el-form :model="configs" label-width="120px" class="filed-form">
        <el-form-item label="切换模型">
          <el-input
            v-model="configs['shortcut-change-model']"
            class="inline-input"
          />
        </el-form-item>
        <el-form-item label="触发随机动作">
          <el-input
            v-model="configs['shortcut-interaction']"
            class="inline-input"
          />
        </el-form-item>
        <el-form-item label="恢复原位">
          <el-input
            v-model="configs['shortcut-return-moto']"
            class="inline-input"
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="config-field">
      <div class="field-description">还原</div>
      <el-form :model="configs" label-width="120px" class="filed-form">
        <el-form-item>
          <el-button @click="configStore.resetConfig">还原所有设置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from "../store/config";
const { shell } = require("electron");
const configStore = useConfigStore();
const configs = configStore.savedConfigs.value();
</script>

<style></style>
