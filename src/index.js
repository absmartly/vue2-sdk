import { Context, SDK, mergeConfig } from "@absmartly/javascript-sdk";
import ABSmartlyVue from "./plugin";
import Treatment from "./components/Treatment.vue";

if (typeof window !== "undefined" && window.Vue) {
	window.Vue.use(ABSmartlyVue);
}

export { ABSmartlyVue, Treatment, Context, SDK, mergeConfig };
export default { ABSmartlyVue, Treatment, Context, SDK, mergeConfig };
