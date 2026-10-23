import { Context, SDK } from "@absmartly/javascript-sdk";
import { createLocalVue, mount } from "@vue/test-utils";
import ABSmartly from "@/plugin";
import Treatment from "@/components/Treatment.vue";

jest.mock("@absmartly/javascript-sdk");

const mockCreateContext = jest.fn().mockImplementation(() => {
	return new Context();
});

const mockCreateContextWith = jest.fn().mockImplementation(() => {
	return new Context();
});

SDK.mockImplementation(() => {
	return {
		createContext: mockCreateContext,
		createContextWith: mockCreateContextWith
	};
});

describe("ABSmartly Vue.js Plugin", () => {
	const Component = {
		template: "<div>test</div>"
	};

	const sdkOptions = {
		test: 1
	};

	const contextOptions = {
		refreshPeriod: 600000,
		test: 2
	};

	const context = {
		test: 2
	};

	const data = {
		test: 2
	};

	const attrs = {
		attr1: "value1",
		attr2: "value2"
	};

	const overrides = {
		not_found: 2
	};

	it("should create SDK and context", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			context,
			contextOptions,
			attributes: attrs,
			overrides
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).toHaveBeenCalledTimes(1);
		expect(SDK).toHaveBeenLastCalledWith(sdkOptions);
		expect(mockCreateContext).toHaveBeenCalledTimes(1);
		expect(mockCreateContext).toHaveBeenCalledWith(context, contextOptions);

		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledWith(attrs);

		expect(wrapper.vm.$absmartly.overrides).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.overrides).toHaveBeenCalledWith(overrides);
	});

	it("should create context with default options", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			context,
			attributes: attrs,
			overrides
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).toHaveBeenCalledTimes(1);
		expect(SDK).toHaveBeenLastCalledWith(sdkOptions);
		expect(mockCreateContext).toHaveBeenCalledTimes(1);
		expect(mockCreateContext).toHaveBeenCalledWith(context, {
			refreshPeriod: 300000
		});

		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledWith(attrs);

		expect(wrapper.vm.$absmartly.overrides).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.overrides).toHaveBeenCalledWith(overrides);
	});

	it("should create SDK and context with no attributes and no overrides", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			context,
			contextOptions
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).toHaveBeenCalledTimes(1);
		expect(SDK).toHaveBeenLastCalledWith(sdkOptions);
		expect(mockCreateContext).toHaveBeenCalledTimes(1);
		expect(mockCreateContext).toHaveBeenCalledWith(context, contextOptions);

		expect(wrapper.vm.$absmartly.attributes).not.toHaveBeenCalled();
		expect(wrapper.vm.$absmartly.overrides).not.toHaveBeenCalled();
	});

	it("should create SDK and context with data", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			context,
			data,
			contextOptions,
			attributes: attrs,
			overrides
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).toHaveBeenCalledTimes(1);
		expect(SDK).toHaveBeenLastCalledWith(sdkOptions);
		expect(mockCreateContextWith).toHaveBeenCalledTimes(1);
		expect(mockCreateContextWith).toHaveBeenCalledWith(context, data, contextOptions);

		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.attributes).toHaveBeenCalledWith(attrs);

		expect(wrapper.vm.$absmartly.overrides).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.overrides).toHaveBeenCalledWith(overrides);
	});

	it("should use passed context", () => {
		const mockContext = new Context();
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			context: mockContext,
			attributes: attrs,
			overrides
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(SDK).not.toHaveBeenCalled();
		expect(mockCreateContext).not.toHaveBeenCalled();
		expect(mockCreateContextWith).not.toHaveBeenCalled();

		expect(mockContext.attributes).toHaveBeenCalledTimes(1);
		expect(mockContext.attributes).toHaveBeenCalledWith(attrs);

		expect(wrapper.vm.$absmartly.overrides).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.$absmartly.overrides).toHaveBeenCalledWith(overrides);

		expect(wrapper.vm.$absmartly).toBe(mockContext);
	});

	it("should add global $absmartly context object", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(wrapper.vm.$absmartly).toBeInstanceOf(Context);
	});

	it("should add options.globalName context object", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			globalName: "$exp"
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(wrapper.vm.$exp).toBeInstanceOf(Context);
	});

	it("should add custom globalName context object", () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions,
			globalName: "$experiment"
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(wrapper.vm.$experiment).toBeInstanceOf(Context);
	});

	it("should register components by default", () => {
		const localVue = createLocalVue();

		const expectedComponents = {
			Treatment
		};

		for (const componentName of Object.keys(expectedComponents)) {
			expect(localVue.options.components).not.toHaveProperty(componentName);
		}

		localVue.use(ABSmartly, {
			sdkOptions
		});

		for (const componentName of Object.keys(expectedComponents)) {
			expect(localVue.options.components).toHaveProperty(componentName);
		}
	});

	it("should not register components when options.globalComponents is false", () => {
		const localVue = createLocalVue();

		const expectedComponents = {
			Treatment
		};

		for (const componentName of Object.keys(expectedComponents)) {
			expect(localVue.options.components).not.toHaveProperty(componentName);
		}

		const globalComponents = false;
		localVue.use(ABSmartly, {
			sdkOptions,
			globalComponents
		});

		for (const componentName of Object.keys(expectedComponents)) {
			expect(localVue.options.components).not.toHaveProperty(componentName);
		}
	});

	describe("Plugin Integration", () => {
		it("should install global __absmartlyGlobal property on Vue prototype", () => {
			const localVue = createLocalVue();
			localVue.use(ABSmartly, { sdkOptions });

			expect(localVue.prototype.__absmartlyGlobal).toBe("$absmartly");
		});

		it("should provide $absmartly method in component instances", () => {
			const localVue = createLocalVue();
			localVue.use(ABSmartly, { sdkOptions });

			const wrapper = mount(Component, { localVue });

			expect(typeof wrapper.vm.$absmartly).toBe("object");
			expect(wrapper.vm.$absmartly).toBeInstanceOf(Context);
		});

		it("should handle multiple Vue.use() calls gracefully", () => {
			const localVue = createLocalVue();

			localVue.use(ABSmartly, { sdkOptions });
			const firstContext = localVue.prototype.$absmartly;

			localVue.use(ABSmartly, { sdkOptions });
			const secondContext = localVue.prototype.$absmartly;

			expect(firstContext).toBeDefined();
			expect(secondContext).toBeDefined();
		});

		it("should work with different global name configurations", () => {
			const localVue1 = createLocalVue();
			localVue1.use(ABSmartly, {
				sdkOptions,
				globalName: "$experiments"
			});

			const wrapper1 = mount(Component, { localVue: localVue1 });
			expect(wrapper1.vm.$experiments).toBeInstanceOf(Context);
			expect(wrapper1.vm.$absmartly).toBeUndefined();

			const localVue2 = createLocalVue();
			localVue2.use(ABSmartly, {
				sdkOptions,
				globalName: "$ab"
			});

			const wrapper2 = mount(Component, { localVue: localVue2 });
			expect(wrapper2.vm.$ab).toBeInstanceOf(Context);
		});
	});
});
