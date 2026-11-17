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

	it("should create SDK and context", async () => {
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

	it("should create context with default options", async () => {
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

	it("should create SDK and context with no attributes and no overrides", async () => {
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

	it("should create SDK and context with data", async () => {
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

	it("should use passed context", async () => {
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

	it("should add global $absmartly context object", async () => {
		const localVue = createLocalVue();
		localVue.use(ABSmartly, {
			sdkOptions
		});

		const wrapper = mount(Component, {
			localVue
		});

		expect(wrapper.vm.$absmartly).toBeInstanceOf(Context);
	});

	it("should add options.globalName context object", async () => {
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

	it("should add options.globalName context object", async () => {
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

	it("should register components by default", async () => {
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

	it("should not register components when options.globalComponents is false", async () => {
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
});
