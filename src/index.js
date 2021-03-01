import { Context, SDK, mergeConfig } from "@absmartly/javascript-sdk";
import ABSmartly from "./plugin";
import Treatment from "./components/Treatment.vue";

if (typeof window !== "undefined" && window.Vue) {
	window.Vue.use(ABSmartly);
}

export default { ABSmartly, Treatment, Context, SDK, mergeConfig };
