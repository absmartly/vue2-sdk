import { createLocalVue, shallowMount } from "@vue/test-utils";
import { SDK } from "@absmartly/javascript-sdk";
import ABSmartly from "@/plugin";
import Treatment from "@/components/Treatment.vue";

function mountContext(context) {
	const localVue = createLocalVue();
	localVue.use(ABSmartly, { context });
	return shallowMount(Treatment, {
		localVue,
		propsData: { name: "missing" },
		scopedSlots: {
			default: props => `${props.ready}/${props.failed}/${props.treatment}`,
			loading: () => "loading"
		}
	});
}

describe("real JavaScript SDK context", () => {
	it("renders control after failed initialization and preserves the original error event", async () => {
		let rejectLoad;
		const client = {
			getContext: jest.fn(
				() =>
					new Promise((resolve, reject) => {
						rejectLoad = reject;
					})
			)
		};
		const eventLogger = jest.fn();
		const context = new SDK({ client, eventLogger }).createContext(
			{ units: { user: "test-user" } },
			{ publishDelay: -1 }
		);
		const wrapper = mountContext(context);
		try {
			expect(wrapper.text()).toBe("loading");
			const failure = new Error("initial load failed");
			rejectLoad(failure);
			await expect(context.ready()).resolves.toBe(true);
			await wrapper.vm.$nextTick();
			expect(wrapper.text()).toBe("true/true/0");
			expect(context.peek("missing")).toBe(0);
			expect(context.variableValue("missing", "fallback")).toBe("fallback");
			expect(eventLogger).toHaveBeenCalledWith(context, "error", failure);
		} finally {
			wrapper.destroy();
			await context.finalize();
		}
	});

	it("uses the real context for readiness, refresh and goal publishing", async () => {
		let resolveLoad;
		const client = {
			getContext: jest
				.fn()
				.mockImplementationOnce(
					() =>
						new Promise(resolve => {
							resolveLoad = resolve;
						})
				)
				.mockResolvedValue({ experiments: [] }),
			publish: jest.fn().mockResolvedValue(undefined)
		};
		const eventLogger = jest.fn();
		const context = new SDK({ client, eventLogger }).createContext(
			{ units: { user: "test-user" } },
			{ publishDelay: -1 }
		);
		const wrapper = mountContext(context);
		try {
			expect(wrapper.text()).toBe("loading");
			resolveLoad({ experiments: [] });
			await context.ready();
			await wrapper.vm.$nextTick();
			expect(wrapper.text()).toBe("true/false/0");
			await context.refresh();
			expect(client.getContext).toHaveBeenCalledTimes(2);
			expect(eventLogger).toHaveBeenCalledWith(context, "refresh", { experiments: [] });
			context.track("purchase", { value: 42 });
			await context.publish();
			expect(client.publish).toHaveBeenCalledWith(
				expect.objectContaining({
					goals: [expect.objectContaining({ name: "purchase", properties: { value: 42 } })]
				}),
				undefined
			);
		} finally {
			wrapper.destroy();
			await context.finalize();
		}
	});
});
