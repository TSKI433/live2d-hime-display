<template>
  <!-- 不知道为什么，想要识别到drop的结果必须要添加dragover事件 -->
  <div
    ref="resizableBox"
    style="padding-bottom: 30px"
    @drop.stop.prevent="loadDragModel"
    @dragover.stop.prevent="dragMaskShow = true"
    @dragleave.stop.prevent="dragMaskShow = false"
  >
    <el-menu
      class="config-menu"
      mode="horizontal"
      :default-active="selectedOption"
      @select="changeMenu"
    >
      <el-menu-item
        v-for="option in configOptions"
        :key="option.title"
        :index="option.index"
        class="config-option"
      >
        <!-- 改用直接引入svg了 -->
        <!-- <img :src="option.icon" alt="" style="stroke: red" /> -->
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          :width="option.icon_width"
          :height="option.icon_height"
        >
          <path :d="option.icon" fill="var(--el-text-color-regular)" />
        </svg>
        <div>{{ option.title }}</div>
      </el-menu-item>
    </el-menu>
    <!-- <component :is="'config-' + selectedOption"></component> -->
    <div class="config-component">
      <!-- 备选方案，之前想用动态组件，但是实际测试下来切换组件开销较大 -->
      <config-gernal v-show="selectedOption == 'gernal'"></config-gernal>
      <config-display v-show="selectedOption == 'display'"></config-display>
      <config-control v-show="selectedOption == 'control'"></config-control>
      <config-database v-show="selectedOption == 'database'"></config-database>
      <config-about v-show="selectedOption == 'about'"></config-about>
    </div>
  </div>
  <div class="drag-mask" v-show="dragMaskShow">
    <div class="drag-mask-inner">将模型的json文件<br />拖拽至此以载入</div>
  </div>
</template>

<script>
import ConfigAbout from "./components/ConfigAbout.vue";
import ConfigControl from "./components/ConfigControl.vue";
import ConfigDatabase from "./components/ConfigDatabase.vue";
import ConfigDisplay from "./components/ConfigDisplay.vue";
import ConfigGernal from "./components/ConfigGernal.vue";
import { useConfigStore } from "./store/config";
import { ref } from "vue";
const { ipcRenderer } = require("electron");
export default {
  components: {
    ConfigAbout,
    ConfigControl,
    ConfigDatabase,
    ConfigDisplay,
    ConfigGernal,
  },
  setup() {
    const configStore = useConfigStore();
    // 硬核把svg数据搞了过来，虽然我也不想这么做，但是这是我能想到让图标跟着变色的最省事的方式
    const configOptions = [
      {
        title: "通用",
        icon: "M9.46289 20.8789L11.4355 20.8789Q12.002 20.8789 12.4072 20.5615Q12.8125 20.2441 12.9395 19.6973L13.3594 17.8711L13.6719 17.7637L15.2637 18.7402Q15.7324 19.043 16.25 18.9746Q16.7676 18.9062 17.168 18.5059L18.5352 17.1484Q18.9355 16.748 19.0039 16.2305Q19.0723 15.7129 18.7695 15.2441L17.7734 13.6621L17.8906 13.3691L19.7168 12.9395Q20.2539 12.8125 20.5762 12.4023Q20.8984 11.9922 20.8984 11.4355L20.8984 9.50195Q20.8984 8.94531 20.5762 8.53516Q20.2539 8.125 19.7168 7.99805L17.9102 7.55859L17.7832 7.24609L18.7793 5.66406Q19.082 5.19531 19.0137 4.68262Q18.9453 4.16992 18.5449 3.75977L17.1777 2.39258Q16.7871 2.00195 16.2695 1.93359Q15.752 1.86523 15.2832 2.1582L13.6914 3.13477L13.3594 3.00781L12.9395 1.18164Q12.8125 0.644531 12.4072 0.322266Q12.002 0 11.4355 0L9.46289 0Q8.89648 0 8.49121 0.322266Q8.08594 0.644531 7.95898 1.18164L7.5293 3.00781L7.19727 3.13477L5.61523 2.1582Q5.13672 1.86523 4.62402 1.93359Q4.11133 2.00195 3.71094 2.39258L2.35352 3.75977Q1.94336 4.16992 1.87988 4.68262Q1.81641 5.19531 2.11914 5.66406L3.10547 7.24609L2.98828 7.55859L1.18164 7.99805Q0.634766 8.125 0.317383 8.53516Q0 8.94531 0 9.50195L0 11.4355Q0 11.9922 0.322266 12.4023Q0.644531 12.8125 1.18164 12.9395L3.00781 13.3691L3.11523 13.6621L2.12891 15.2441Q1.82617 15.7129 1.88965 16.2305Q1.95312 16.748 2.36328 17.1484L3.7207 18.5059Q4.12109 18.9062 4.63867 18.9746Q5.15625 19.043 5.63477 18.7402L7.2168 17.7637L7.5293 17.8711L7.95898 19.6973Q8.08594 20.2441 8.49121 20.5615Q8.89648 20.8789 9.46289 20.8789ZM9.61914 19.3555Q9.375 19.3555 9.33594 19.1309L8.75 16.709Q8.30078 16.6016 7.89551 16.4307Q7.49023 16.2598 7.17773 16.0645L5.04883 17.373Q4.87305 17.5 4.6875 17.3242L3.53516 16.1719Q3.37891 16.0254 3.49609 15.8105L4.80469 13.7012Q4.63867 13.3887 4.46289 12.9883Q4.28711 12.5879 4.16992 12.1387L1.74805 11.5625Q1.52344 11.5234 1.52344 11.2793L1.52344 9.64844Q1.52344 9.41406 1.74805 9.36523L4.16016 8.7793Q4.27734 8.30078 4.46777 7.89062Q4.6582 7.48047 4.78516 7.20703L3.48633 5.09766Q3.35938 4.88281 3.51562 4.7168L4.67773 3.58398Q4.85352 3.42773 5.04883 3.53516L7.1582 4.81445Q7.4707 4.63867 7.89551 4.46289Q8.32031 4.28711 8.75977 4.16992L9.33594 1.74805Q9.375 1.52344 9.61914 1.52344L11.2793 1.52344Q11.5234 1.52344 11.5527 1.74805L12.1484 4.18945Q12.6074 4.30664 13.0029 4.47754Q13.3984 4.64844 13.7207 4.82422L15.8398 3.53516Q16.0449 3.42773 16.2207 3.58398L17.373 4.7168Q17.5391 4.88281 17.4023 5.09766L16.1035 7.20703Q16.2402 7.48047 16.4258 7.89062Q16.6113 8.30078 16.7285 8.7793L19.1504 9.36523Q19.375 9.41406 19.375 9.64844L19.375 11.2793Q19.375 11.5234 19.1504 11.5625L16.7188 12.1387Q16.6016 12.5879 16.4307 12.9883Q16.2598 13.3887 16.084 13.7012L17.3926 15.8105Q17.5195 16.0254 17.3535 16.1719L16.2109 17.3242Q16.0254 17.5 15.8398 17.373L13.7109 16.0645Q13.3984 16.2598 12.998 16.4307Q12.5977 16.6016 12.1484 16.709L11.5527 19.1309Q11.5234 19.3555 11.2793 19.3555ZM10.4492 14.1699Q11.4746 14.1699 12.3193 13.667Q13.1641 13.1641 13.667 12.3145Q14.1699 11.4648 14.1699 10.4395Q14.1699 9.42383 13.667 8.5791Q13.1641 7.73438 12.3193 7.23145Q11.4746 6.72852 10.4492 6.72852Q9.42383 6.72852 8.5791 7.23145Q7.73438 7.73438 7.22656 8.5791Q6.71875 9.42383 6.71875 10.4395Q6.71875 11.4648 7.22656 12.3096Q7.73438 13.1543 8.5791 13.6621Q9.42383 14.1699 10.4492 14.1699ZM10.4492 12.6562Q9.84375 12.6562 9.34082 12.3584Q8.83789 12.0605 8.54004 11.5576Q8.24219 11.0547 8.24219 10.4395Q8.24219 9.83398 8.54004 9.33594Q8.83789 8.83789 9.34082 8.54004Q9.84375 8.24219 10.4492 8.24219Q11.0449 8.24219 11.543 8.54004Q12.041 8.83789 12.3389 9.33594Q12.6367 9.83398 12.6367 10.4395Q12.6367 11.0449 12.3389 11.5479Q12.041 12.0508 11.543 12.3535Q11.0449 12.6562 10.4492 12.6562Z",
        index: "gernal",
        icon_width: 20.8984,
        icon_height: 20.8887,
      },
      {
        title: "展示器",
        icon: "M2.24609 16.8945L21.0254 16.8945Q22.0801 16.8945 22.6807 16.2939Q23.2812 15.6934 23.2812 14.6387L23.2812 2.92969Q23.2812 1.875 22.6807 1.2793Q22.0801 0.683594 21.0254 0.683594L2.24609 0.683594Q1.20117 0.683594 0.600586 1.2793Q0 1.875 0 2.92969L0 14.6387Q0 15.6934 0.600586 16.2939Q1.20117 16.8945 2.24609 16.8945ZM2.27539 15.3223Q1.95312 15.3223 1.7627 15.1318Q1.57227 14.9414 1.57227 14.6191L1.57227 2.95898Q1.57227 2.62695 1.7627 2.44141Q1.95312 2.25586 2.27539 2.25586L21.0059 2.25586Q21.3281 2.25586 21.5186 2.44141Q21.709 2.62695 21.709 2.95898L21.709 14.6191Q21.709 14.9414 21.5186 15.1318Q21.3281 15.3223 21.0059 15.3223ZM8.55469 19.2188L14.7266 19.2188L14.7266 16.7676L8.55469 16.7676ZM8.49609 20.3613L14.7852 20.3613Q15.1074 20.3613 15.3369 20.1318Q15.5664 19.9023 15.5664 19.5703Q15.5664 19.2383 15.3369 19.0088Q15.1074 18.7793 14.7852 18.7793L8.49609 18.7793Q8.17383 18.7793 7.93945 19.0088Q7.70508 19.2383 7.70508 19.5703Q7.70508 19.9023 7.93945 20.1318Q8.17383 20.3613 8.49609 20.3613Z",
        index: "display",
        icon_width: 23.2812,
        icon_height: 20.3613,
      },
      {
        title: "控制",
        icon: "M9.96094 19.9219Q12.002 19.9219 13.8037 19.1406Q15.6055 18.3594 16.9824 16.9824Q18.3594 15.6055 19.1406 13.8037Q19.9219 12.002 19.9219 9.96094Q19.9219 7.91992 19.1406 6.11816Q18.3594 4.31641 16.9824 2.93945Q15.6055 1.5625 13.7988 0.78125Q11.9922 0 9.95117 0Q7.91016 0 6.1084 0.78125Q4.30664 1.5625 2.93457 2.93945Q1.5625 4.31641 0.78125 6.11816Q0 7.91992 0 9.96094Q0 12.002 0.78125 13.8037Q1.5625 15.6055 2.93945 16.9824Q4.31641 18.3594 6.11816 19.1406Q7.91992 19.9219 9.96094 19.9219ZM9.96094 18.2617Q8.23242 18.2617 6.72852 17.6172Q5.22461 16.9727 4.08691 15.835Q2.94922 14.6973 2.30957 13.1934Q1.66992 11.6895 1.66992 9.96094Q1.66992 8.23242 2.30957 6.72852Q2.94922 5.22461 4.08203 4.08203Q5.21484 2.93945 6.71875 2.2998Q8.22266 1.66016 9.95117 1.66016Q11.6797 1.66016 13.1836 2.2998Q14.6875 2.93945 15.8301 4.08203Q16.9727 5.22461 17.6172 6.72852Q18.2617 8.23242 18.2617 9.96094Q18.2617 11.6895 17.6221 13.1934Q16.9824 14.6973 15.8447 15.835Q14.707 16.9727 13.1982 17.6172Q11.6895 18.2617 9.96094 18.2617ZM5.48828 14.9023L14.4141 14.9023Q14.707 14.9023 14.8486 14.7314Q14.9902 14.5605 14.9902 14.2871Q14.9902 13.8867 14.6826 13.2471Q14.375 12.6074 13.7549 11.9678Q13.1348 11.3281 12.1875 10.8887Q11.2402 10.4492 9.95117 10.4492Q8.66211 10.4492 7.71484 10.8887Q6.76758 11.3281 6.14746 11.9678Q5.52734 12.6074 5.21973 13.2471Q4.91211 13.8867 4.91211 14.2871Q4.91211 14.5605 5.05371 14.7314Q5.19531 14.9023 5.48828 14.9023ZM9.95117 9.64844Q10.6445 9.6582 11.2158 9.29688Q11.7871 8.93555 12.124 8.31543Q12.4609 7.69531 12.4609 6.91406Q12.4609 6.18164 12.124 5.57129Q11.7871 4.96094 11.2158 4.59473Q10.6445 4.22852 9.95117 4.22852Q9.25781 4.22852 8.68652 4.59473Q8.11523 4.96094 7.77832 5.57129Q7.44141 6.18164 7.44141 6.91406Q7.44141 7.69531 7.77832 8.31055Q8.11523 8.92578 8.68652 9.28711Q9.25781 9.64844 9.95117 9.64844Z",
        index: "control",
        icon_width: 19.9219,
        icon_height: 19.9316,
      },
      {
        title: "数据库",
        icon: "M18.0176 4.81445Q18.5254 4.80469 18.8916 4.43848Q19.2578 4.07227 19.2578 3.56445Q19.2578 3.05664 18.8916 2.68066Q18.5254 2.30469 18.0176 2.30469Q17.5195 2.30469 17.1484 2.68066Q16.7773 3.05664 16.7773 3.56445Q16.7773 4.07227 17.1484 4.44824Q17.5195 4.82422 18.0176 4.81445ZM18.0176 10.2246Q18.5254 10.2148 18.8916 9.84863Q19.2578 9.48242 19.2578 8.97461Q19.2578 8.4668 18.8916 8.09082Q18.5254 7.71484 18.0176 7.71484Q17.5195 7.71484 17.1484 8.09082Q16.7773 8.4668 16.7773 8.97461Q16.7773 9.48242 17.1484 9.8584Q17.5195 10.2344 18.0176 10.2246ZM18.0176 15.6348Q18.5254 15.625 18.8916 15.2588Q19.2578 14.8926 19.2578 14.3848Q19.2578 13.877 18.8916 13.501Q18.5254 13.125 18.0176 13.125Q17.5195 13.125 17.1484 13.501Q16.7773 13.877 16.7773 14.3848Q16.7773 14.8926 17.1484 15.2686Q17.5195 15.6445 18.0176 15.6348ZM22.1777 7.02148L22.1777 5.54688L0.878906 5.54688L0.878906 7.02148ZM22.1777 12.4512L22.1777 10.9766L0.878906 10.9766L0.878906 12.4512ZM3.06641 17.9785L19.9609 17.9785Q21.5039 17.9785 22.2656 17.2217Q23.0273 16.4648 23.0273 14.9609L23.0273 3.02734Q23.0273 1.52344 22.2656 0.761719Q21.5039 0 19.9609 0L3.06641 0Q1.5332 0 0.766602 0.756836Q0 1.51367 0 3.02734L0 14.9609Q0 16.4648 0.766602 17.2217Q1.5332 17.9785 3.06641 17.9785ZM3.08594 16.4062Q2.35352 16.4062 1.96289 16.0205Q1.57227 15.6348 1.57227 14.873L1.57227 3.11523Q1.57227 2.35352 1.96289 1.96289Q2.35352 1.57227 3.08594 1.57227L19.9414 1.57227Q20.6641 1.57227 21.0596 1.96289Q21.4551 2.35352 21.4551 3.11523L21.4551 14.873Q21.4551 15.6348 21.0596 16.0205Q20.6641 16.4062 19.9414 16.4062Z",
        index: "database",
        icon_width: 23.0273,
        icon_height: 17.9785,
      },
      {
        title: "关于",
        icon: "M9.96094 19.9219Q12.002 19.9219 13.8037 19.1406Q15.6055 18.3594 16.9824 16.9824Q18.3594 15.6055 19.1406 13.8037Q19.9219 12.002 19.9219 9.96094Q19.9219 7.91992 19.1406 6.11816Q18.3594 4.31641 16.9824 2.93945Q15.6055 1.5625 13.7988 0.78125Q11.9922 0 9.95117 0Q7.91016 0 6.1084 0.78125Q4.30664 1.5625 2.93457 2.93945Q1.5625 4.31641 0.78125 6.11816Q0 7.91992 0 9.96094Q0 12.002 0.78125 13.8037Q1.5625 15.6055 2.93945 16.9824Q4.31641 18.3594 6.11816 19.1406Q7.91992 19.9219 9.96094 19.9219ZM9.96094 18.2617Q8.23242 18.2617 6.72852 17.6172Q5.22461 16.9727 4.08691 15.835Q2.94922 14.6973 2.30957 13.1934Q1.66992 11.6895 1.66992 9.96094Q1.66992 8.23242 2.30957 6.72852Q2.94922 5.22461 4.08203 4.08203Q5.21484 2.93945 6.71875 2.2998Q8.22266 1.66016 9.95117 1.66016Q11.6797 1.66016 13.1836 2.2998Q14.6875 2.93945 15.8301 4.08203Q16.9727 5.22461 17.6172 6.72852Q18.2617 8.23242 18.2617 9.96094Q18.2617 11.6895 17.6221 13.1934Q16.9824 14.6973 15.8447 15.835Q14.707 16.9727 13.1982 17.6172Q11.6895 18.2617 9.96094 18.2617ZM8.25195 15.3223L12.2266 15.3223Q12.5293 15.3223 12.7344 15.127Q12.9395 14.9316 12.9395 14.6387Q12.9395 14.3457 12.7344 14.1504Q12.5293 13.9551 12.2266 13.9551L11.0156 13.9551L11.0156 8.98438Q11.0156 8.58398 10.8203 8.34473Q10.625 8.10547 10.2539 8.10547L8.41797 8.10547Q8.11523 8.10547 7.91016 8.30078Q7.70508 8.49609 7.70508 8.78906Q7.70508 9.08203 7.91016 9.27734Q8.11523 9.47266 8.41797 9.47266L9.46289 9.47266L9.46289 13.9551L8.25195 13.9551Q7.94922 13.9551 7.74414 14.1504Q7.53906 14.3457 7.53906 14.6387Q7.53906 14.9316 7.74414 15.127Q7.94922 15.3223 8.25195 15.3223ZM9.87305 6.47461Q10.4102 6.47461 10.7764 6.10352Q11.1426 5.73242 11.1426 5.20508Q11.1426 4.66797 10.7764 4.29688Q10.4102 3.92578 9.87305 3.92578Q9.3457 3.92578 8.97461 4.29688Q8.60352 4.66797 8.60352 5.20508Q8.60352 5.73242 8.97461 6.10352Q9.3457 6.47461 9.87305 6.47461Z",
        index: "about",
        icon_width: 19.9219,
        icon_height: 19.9316,
      },
    ];
    const selectedOption = ref("gernal");
    // 用于获取容器高度进行动态改变
    const resizableBox = ref(null);
    function changeMenu(config) {
      // 通过setImmediate等待Vue加载完组件再改变窗口大小，不然高度计算会出错
      setImmediate(() => {
        // console.log(resizableBox.value.scrollHeight);
        ipcRenderer.send("resize-config-window", {
          // Windows下会有一个菜单栏的高度
          height:
            resizableBox.value.scrollHeight +
            (process.platform == "win32" ? 55 : 0),
          width: 560,
        });
      });
      selectedOption.value = config;
    }
    const dragDrectionShow = ref(false);
    function loadDragModel(e) {
      configStore.loadModelFromPath(e.dataTransfer.files[0].path);
      dragMaskShow.value = false;
    }
    const dragMaskShow = ref(false);
    return {
      selectedOption,
      changeMenu,
      configOptions,
      resizableBox,
      dragDrectionShow,
      loadDragModel,
      dragMaskShow,
    };
  },
};
</script>

<style>
/* 适配Mac深色模式 */
@media (prefers-color-scheme: dark) {
  * {
    color-scheme: dark;
    --el-color-primary: #409effee;
    --el-text-color-regular: #dddc;
    --el-menu-text-color: #999c;
    --el-border-color: #636363;
    --el-table-border-color: #636363 !important;
    --el-menu-border-color: #636363;
    --el-table-border-color: #636363;
    --el-menu-hover-bg-color: #2b4463bb;
    --el-table-row-hover-bg-color: #2b4463bb;
    --el-table-current-row-bg-color: #2b4463bb;
    --el-table-row-hover-bg-color: #3b3b3ba6;
    --el-menu-hover-text-color: #bfc6d6;
    --el-color-white: #fffd;
    --el-button-bg-color: !important;
    --el-button-disabled-border-color: #e4e7ed88 !important;
    --el-border: 1px solid #636363;
    --el-input-bg-color: ;
    --el-fill-color-blank: ;
    --el-fill-color-light: ;
    --el-disabled-bg-color: ;
  }
  .el-button {
    --el-button-hover-border-color: #2b4463bb !important;
    --el-button-bg-color: #fff1 !important;
    --el-button-hover-bg-color: #fff3 !important;
    --el-button-hover-text-color: #409effbb;
  }
  .el-tag {
    --el-tag-bg-color: #d9ecff22;
    --el-tag-border-color: #d9ecff66;
  }
  .el-tag.el-tag--success {
    --el-tag-bg-color: #f0f9eb22;
    --el-tag-border-color: #e1f3d866;
  }
  .el-tag.el-tag--warning {
    --el-tag-bg-color: #fdf6ec22;
    --el-tag-border-color: #faecd866;
  }

  .el-tag.el-tag--info {
    --el-tag-bg-color: #f4f4f522;
    --el-tag-border-color: #e9e9eb66;
  }
  /* 官方的样式表好像出了一点问题，加一个div选择器提高优先级 */
  div.el-popover.el-popper {
    color: var(--el-text-color-regular);
    background: var(--el-text-color-primary);
    border: 1px solid var(--el-text-color-primary);
  }
  .el-popper.is-light span.el-popper__arrow::before {
    background: var(--el-text-color-primary);
    border: 1px solid var(--el-text-color-primary);
  }
}

body,
html,
#app {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
* {
  -webkit-user-drag: none;
  user-select: none;
  margin: 0;
  padding: 0;
  font-family: "system-ui";
  font-size: 14px;
  box-sizing: border-box;
  --el-menu-hover-bg-color: #c3dfff62;
  --el-table-row-hover-bg-color: #c3dfff62;
  --el-input-bg-color: ;
  --el-fill-color-blank: ;
  --el-fill-color-light: ;
  --el-disabled-bg-color: ;
}
.config-menu {
  padding: 0 50px;
  display: flex;
  justify-content: center;
  -webkit-app-region: drag;
  background: none;
}
.config-option {
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  padding: 0.7em 2em;
  margin: 0.7em 0 !important;
  flex-direction: column;
  line-height: initial;
  /* 确保覆盖了默认样式 */
  border: none !important;
  height: auto !important;
  border-radius: 10px;
  width: 70px;
}
.config-option.is-active {
  background-color: var(--el-menu-hover-bg-color) !important;
}

.config-option.is-active svg path {
  fill: var(--el-menu-active-color);
}
.config-option img {
  margin-bottom: 5px;
}
.config-component {
  width: 100%;
  display: flex;
  justify-content: center;
}
.config-inner {
  width: 75%;
}
.field-description {
  margin: 1rem 0;
  font-size: 1.6rem;
  border-bottom: 1px solid var(--el-border-color);
  color: var(--el-text-color-regular);
}

.inline-input {
  width: auto;
  padding-right: 1rem;
}
.inline-input * {
  width: auto;
}
.regular-text-color {
  color: var(--el-text-color-regular);
}
.drag-mask {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background: #fffc;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 666;
}
.drag-mask-inner {
  width: 70%;
  height: 70%;
  font-size: 3em;
  border-radius: 20px;
  border: 5px var(--el-color-primary-light-6) dashed;
  color: var(--el-color-primary-light-4);
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
