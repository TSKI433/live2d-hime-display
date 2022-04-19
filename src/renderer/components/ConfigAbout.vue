<template>
  <div class="config-inner">
    <div class="about">
      <div class="app-info">
        <div class="app-icon">
          <img :src="iconImage" alt="" />
        </div>
        <div class="app-name">Hime Display</div>
        <div class="app-version">Version:0.0.1</div>
      </div>
      <div class="author-info">
        <div class="author-developer">Developed by TSKI433</div>
        <div class="author-illustrator">Illustrated by MakoSaikou</div>
      </div>
      <div class="github-info">
        View source code in
        <a
          href="https://github.com/tski433/live2d-hime-display"
          @click.prevent="
            (event) => {
              shell.openExternal(event.target.href);
            }
          "
          >GitHub</a
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import iconImage from "../assets/logo.png";
const { shell } = require("electron");
</script>

<style>
.about {
  color: var(--el-text-color-regular);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.app-icon img {
  height: 140px;
  margin: 30px auto 0;
}
.app-info {
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
}
.app-name {
  font-size: 28px;
  padding: 6px 0;
}
.app-version {
  font-size: 18px;
  padding: 10px 0;
}
.author-info {
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
}
.github-info {
  padding: 10px;
}
</style>
