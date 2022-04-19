import { createApp } from "vue";
import { createPinia } from "pinia";
import Config from "./ConfigView.vue";
import ShowHelp from "./components/elements/ShowHelp.vue";
const pinia = createPinia();
const app = createApp(Config);
app.use(pinia);
app.component("ShowHelp", ShowHelp);
app.mount("#app");
