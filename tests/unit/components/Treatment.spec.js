import { shallowMount } from "@vue/test-utils";
import Treatment from "@/components/Treatment.vue";

const createMocks = () => ({
	__absmartlyGlobal: "$absmartly",
	$absmartly: {
		treatment: jest.fn(),
		experimentConfig: jest.fn(),
		attributes: jest.fn(),
		ready: jest.fn(),
		isReady: jest.fn(),
		isFailed: jest.fn()
	}
});

describe("Treatment.vue", () => {
	let mocks;

	beforeEach(() => {
		mocks = createMocks();
	});

	it("it should not render loading slot when ready", async () => {
		const slotMock = jest.fn();
		const loadingMock = jest.fn();

		const attributes = {
			attr1: 15,
			attr2: 50
		};

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(1);

		shallowMount(Treatment, {
			propsData: {
				name: "test_exp",
				attributes
			},
			scopedSlots: {
				default: slotMock,
				loading: loadingMock
			},
			mocks
		});

		expect(mocks.$absmartly.treatment).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.treatment).toHaveBeenCalledWith("test_exp");
		expect(mocks.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.attributes).toHaveBeenCalledWith(attributes);
		expect(loadingMock).not.toHaveBeenCalled();
		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: true,
			failed: false,
			treatment: 1
		});
	});

	it("should render loading slot when not ready", async () => {
		const slotMock = jest.fn();
		const loadingMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(false);
		mocks.$absmartly.isFailed.mockReturnValue(false);

		const ready = Promise.resolve(true);
		mocks.$absmartly.ready.mockReturnValue(ready);

		const attributes = {
			attr1: 15,
			attr2: 50
		};

		const wrapper = shallowMount(Treatment, {
			propsData: {
				name: "test_exp",
				attributes
			},
			scopedSlots: {
				default: slotMock,
				loading: loadingMock
			},
			mocks
		});

		expect(mocks.$absmartly.treatment).not.toHaveBeenCalled();
		expect(mocks.$absmartly.attributes).not.toHaveBeenCalled();
		expect(slotMock).not.toHaveBeenCalled();
		expect(loadingMock).toHaveBeenCalledTimes(1);
		expect(loadingMock).toHaveBeenCalledWith({
			ready: false,
			failed: false
		});

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.treatment.mockReturnValue(1);

		await ready;
		await wrapper.vm.$nextTick();

		expect(mocks.$absmartly.treatment).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.treatment).toHaveBeenCalledWith("test_exp");
		expect(mocks.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.attributes).toHaveBeenCalledWith(attributes);
		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: true,
			failed: false,
			treatment: 1
		});
	});

	it("should render default slot when not ready", async () => {
		const slotMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(false);
		mocks.$absmartly.isFailed.mockReturnValue(false);

		const ready = Promise.resolve(true);
		mocks.$absmartly.ready.mockReturnValue(ready);

		const attributes = {
			attr1: 15,
			attr2: 50
		};

		const wrapper = shallowMount(Treatment, {
			propsData: {
				name: "test_exp",
				attributes
			},
			scopedSlots: {
				default: slotMock
			},
			mocks
		});

		expect(mocks.$absmartly.treatment).not.toHaveBeenCalled();
		expect(mocks.$absmartly.attributes).not.toHaveBeenCalled();
		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: false,
			failed: false
		});

		slotMock.mockClear();

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.treatment.mockReturnValue(1);

		await ready;
		await wrapper.vm.$nextTick();

		expect(mocks.$absmartly.treatment).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.treatment).toHaveBeenCalledWith("test_exp");
		expect(mocks.$absmartly.attributes).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.attributes).toHaveBeenCalledWith(attributes);
		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: true,
			failed: false,
			treatment: 1
		});
	});

	it.each([
		[0, "0"],
		[1, "1"],
		[2, "2"],
		[3, "3"],
		[4, "4"]
	])("should render treatment slot %i by index (%s)", (treatment, slot) => {
		const slotMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(treatment);

		shallowMount(Treatment, {
			propsData: {
				name: "test_exp"
			},
			scopedSlots: {
				[slot]: slotMock
			},
			mocks
		});

		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: true,
			failed: false,
			treatment: treatment
		});
	});

	it.each([
		[0, "A"],
		[1, "B"],
		[2, "C"],
		[3, "D"],
		[4, "E"]
	])("should render treatment slot %i by alpha (%s)", (treatment, slot) => {
		const slotMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(treatment);

		shallowMount(Treatment, {
			propsData: {
				name: "test_exp"
			},
			scopedSlots: {
				[slot]: slotMock
			},
			mocks
		});

		expect(slotMock).toHaveBeenCalledTimes(1);
		expect(slotMock).toHaveBeenCalledWith({
			ready: true,
			failed: false,
			treatment
		});
	});

	it.each([[0], [1], [2], [3], [4]])(
		"should render default treatment slot for treatment %i",
		treatment => {
			const slotMock = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.treatment.mockReturnValue(treatment);

			shallowMount(Treatment, {
				propsData: {
					name: "test_exp"
				},
				scopedSlots: {
					default: slotMock
				},
				mocks
			});

			expect(slotMock).toHaveBeenCalledTimes(1);
			expect(slotMock).toHaveBeenCalledWith({
				ready: true,
				failed: false,
				treatment
			});
		}
	);

	it("should throw with no matching slot", () => {
		const slotMock = jest.fn();

		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(2);

		expect(() => {
			jest.spyOn(console, "error").mockImplementation(() => {});
			shallowMount(Treatment, {
				propsData: {
					name: "test_exp"
				},
				scopedSlots: {
					unused: slotMock
				},
				mocks
			});
		}).toThrow(new Error("No matching treatment slots. Expected one of C,2,default"));

		expect(slotMock).not.toHaveBeenCalled();
	});

	it("should not call context.attributes with no attribute property", () => {
		const slotMock = jest.fn();
		mocks.$absmartly.isReady.mockReturnValue(true);
		mocks.$absmartly.isFailed.mockReturnValue(false);
		mocks.$absmartly.treatment.mockReturnValue(1);

		shallowMount(Treatment, {
			propsData: {
				name: "test_exp"
			},
			scopedSlots: {
				default: slotMock
			},
			mocks
		});

		expect(mocks.$absmartly.treatment).toHaveBeenCalledTimes(1);
		expect(mocks.$absmartly.treatment).toHaveBeenCalledWith("test_exp");
		expect(mocks.$absmartly.attributes).not.toHaveBeenCalledWith();
		expect(slotMock).toHaveBeenCalledTimes(1);
	});

	describe("Timeout Behavior", () => {
		it("shows loading state during async ready", async () => {
			const loadingMock = jest.fn();
			const defaultMock = jest.fn();

			let resolveReady;
			const readyPromise = new Promise(resolve => {
				resolveReady = resolve;
			});

			mocks.$absmartly.isReady.mockReturnValue(false);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.ready.mockReturnValue(readyPromise);

			shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: {
					loading: loadingMock,
					default: defaultMock
				},
				mocks
			});

			expect(loadingMock).toHaveBeenCalledTimes(1);
			expect(loadingMock).toHaveBeenCalledWith({
				ready: false,
				failed: false
			});
			expect(defaultMock).not.toHaveBeenCalled();

			resolveReady(true);
		});

		it("transitions from loading to ready state after ready resolves", async () => {
			const loadingMock = jest.fn();
			const defaultMock = jest.fn();

			const readyPromise = Promise.resolve(true);

			mocks.$absmartly.isReady.mockReturnValue(false);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.ready.mockReturnValue(readyPromise);

			const wrapper = shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: {
					loading: loadingMock,
					default: defaultMock
				},
				mocks
			});

			expect(loadingMock).toHaveBeenCalledTimes(1);

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.treatment.mockReturnValue(1);

			await readyPromise;
			await wrapper.vm.$nextTick();

			expect(defaultMock).toHaveBeenCalledWith({
				ready: true,
				failed: false,
				treatment: 1
			});
		});

		it("handles immediately ready context (zero wait time)", () => {
			const defaultMock = jest.fn();
			const loadingMock = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.treatment.mockReturnValue(0);

			shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: {
					loading: loadingMock,
					default: defaultMock
				},
				mocks
			});

			expect(loadingMock).not.toHaveBeenCalled();
			expect(defaultMock).toHaveBeenCalledTimes(1);
			expect(defaultMock).toHaveBeenCalledWith({
				ready: true,
				failed: false,
				treatment: 0
			});
		});

		it("handles delayed ready resolution", async () => {
			jest.useFakeTimers();
			const loadingMock = jest.fn();
			const defaultMock = jest.fn();

			let resolveReady;
			const readyPromise = new Promise(resolve => {
				resolveReady = resolve;
			});

			mocks.$absmartly.isReady.mockReturnValue(false);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.ready.mockReturnValue(readyPromise);

			const wrapper = shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: {
					loading: loadingMock,
					default: defaultMock
				},
				mocks
			});

			expect(loadingMock).toHaveBeenCalledTimes(1);
			expect(defaultMock).not.toHaveBeenCalled();

			jest.advanceTimersByTime(1000);

			expect(loadingMock).toHaveBeenCalledTimes(1);
			expect(defaultMock).not.toHaveBeenCalled();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.treatment.mockReturnValue(2);

			resolveReady(true);
			await readyPromise;
			await wrapper.vm.$nextTick();

			expect(defaultMock).toHaveBeenCalledWith({
				ready: true,
				failed: false,
				treatment: 2
			});

			jest.useRealTimers();
		});
	});

	describe("Component Lifecycle", () => {
		it("initializes state correctly in beforeMount", () => {
			const defaultMock = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.treatment.mockReturnValue(1);

			const wrapper = shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { default: defaultMock },
				mocks
			});

			expect(wrapper.vm.ready).toBe(true);
			expect(wrapper.vm.failed).toBe(false);
			expect(wrapper.vm.treatment).toBe(1);
			expect(wrapper.vm.treatmentNames).toEqual(["B", "1", "default"]);
		});

		it("sets up ready promise listener when not ready on mount", async () => {
			const defaultMock = jest.fn();
			const readyPromise = Promise.resolve(true);

			mocks.$absmartly.isReady.mockReturnValue(false);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.ready.mockReturnValue(readyPromise);

			const wrapper = shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { default: defaultMock },
				mocks
			});

			expect(mocks.$absmartly.ready).toHaveBeenCalledTimes(1);
			expect(wrapper.vm.ready).toBe(false);
			expect(wrapper.vm.treatmentNames).toEqual(["loading", "default"]);
		});

		it("updates state after ready promise resolves", async () => {
			const defaultMock = jest.fn();
			const readyPromise = Promise.resolve(true);

			mocks.$absmartly.isReady.mockReturnValue(false);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.ready.mockReturnValue(readyPromise);

			const wrapper = shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { default: defaultMock },
				mocks
			});

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.treatment.mockReturnValue(0);

			await readyPromise;
			await wrapper.vm.$nextTick();

			expect(wrapper.vm.ready).toBe(true);
			expect(wrapper.vm.treatment).toBe(0);
			expect(wrapper.vm.treatmentNames).toEqual(["A", "0", "default"]);
		});

		it("handles component destruction gracefully", async () => {
			const defaultMock = jest.fn();
			let resolveReady;
			const readyPromise = new Promise(resolve => {
				resolveReady = resolve;
			});

			mocks.$absmartly.isReady.mockReturnValue(false);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.ready.mockReturnValue(readyPromise);

			const wrapper = shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { default: defaultMock },
				mocks
			});

			wrapper.destroy();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.treatment.mockReturnValue(1);

			resolveReady(true);
			await readyPromise;

			expect(wrapper.vm._isDestroyed).toBe(true);
		});

		it("correctly calculates treatment names for various treatments", () => {
			const testCases = [
				{ treatment: 0, expected: ["A", "0", "default"] },
				{ treatment: 1, expected: ["B", "1", "default"] },
				{ treatment: 2, expected: ["C", "2", "default"] },
				{ treatment: 3, expected: ["D", "3", "default"] },
				{ treatment: 4, expected: ["E", "4", "default"] }
			];

			for (const { treatment, expected } of testCases) {
				const defaultMock = jest.fn();
				mocks.$absmartly.isReady.mockReturnValue(true);
				mocks.$absmartly.isFailed.mockReturnValue(false);
				mocks.$absmartly.treatment.mockReturnValue(treatment);

				const wrapper = shallowMount(Treatment, {
					propsData: { name: "test_exp" },
					scopedSlots: { default: defaultMock },
					mocks
				});

				expect(wrapper.vm.treatmentNames).toEqual(expected);
			}
		});
	});

	describe("Error Handling", () => {
		it("handles context failure state", () => {
			const defaultMock = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(true);
			mocks.$absmartly.treatment.mockReturnValue(0);

			const wrapper = shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { default: defaultMock },
				mocks
			});

			expect(wrapper.vm.failed).toBe(true);
			expect(defaultMock).toHaveBeenCalledWith(
				expect.objectContaining({
					failed: true,
					ready: true
				})
			);
		});

		it("renders default slot on error when no error slot provided", () => {
			const defaultMock = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(true);
			mocks.$absmartly.treatment.mockReturnValue(0);

			shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { default: defaultMock },
				mocks
			});

			expect(defaultMock).toHaveBeenCalledTimes(1);
			expect(defaultMock).toHaveBeenCalledWith({
				ready: true,
				failed: true,
				treatment: 0
			});
		});

		it("passes failed state in slot props during loading", async () => {
			const loadingMock = jest.fn();
			const readyPromise = Promise.resolve(true);

			mocks.$absmartly.isReady.mockReturnValue(false);
			mocks.$absmartly.isFailed.mockReturnValue(true);
			mocks.$absmartly.ready.mockReturnValue(readyPromise);

			shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { loading: loadingMock },
				mocks
			});

			expect(loadingMock).toHaveBeenCalledWith({
				ready: false,
				failed: true
			});
		});

		it("updates failed state when ready promise resolves with failure", async () => {
			const defaultMock = jest.fn();
			const readyPromise = Promise.resolve(true);

			mocks.$absmartly.isReady.mockReturnValue(false);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.ready.mockReturnValue(readyPromise);

			const wrapper = shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { default: defaultMock },
				mocks
			});

			expect(wrapper.vm.failed).toBe(false);

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(true);
			mocks.$absmartly.treatment.mockReturnValue(0);

			await readyPromise;
			await wrapper.vm.$nextTick();

			expect(wrapper.vm.failed).toBe(true);
		});
	});

	describe("Slot Rendering", () => {
		it("renders named treatment slot by letter", () => {
			const slotB = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.treatment.mockReturnValue(1);

			shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { B: slotB },
				mocks
			});

			expect(slotB).toHaveBeenCalledTimes(1);
			expect(slotB).toHaveBeenCalledWith({
				ready: true,
				failed: false,
				treatment: 1
			});
		});

		it("passes scoped slot props correctly", () => {
			const defaultMock = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.treatment.mockReturnValue(2);

			shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: { default: defaultMock },
				mocks
			});

			expect(defaultMock).toHaveBeenCalledWith({
				ready: true,
				failed: false,
				treatment: 2
			});
		});

		it("falls back to default slot when specific treatment slot not found", () => {
			const defaultMock = jest.fn();
			const slotA = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.treatment.mockReturnValue(3);

			shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: {
					A: slotA,
					default: defaultMock
				},
				mocks
			});

			expect(slotA).not.toHaveBeenCalled();
			expect(defaultMock).toHaveBeenCalledTimes(1);
		});

		it("prefers letter slot over numeric slot when both provided", () => {
			const slotB = jest.fn();
			const slot1 = jest.fn();

			mocks.$absmartly.isReady.mockReturnValue(true);
			mocks.$absmartly.isFailed.mockReturnValue(false);
			mocks.$absmartly.treatment.mockReturnValue(1);

			shallowMount(Treatment, {
				propsData: { name: "test_exp" },
				scopedSlots: {
					B: slotB,
					1: slot1
				},
				mocks
			});

			expect(slotB).toHaveBeenCalledTimes(1);
			expect(slot1).not.toHaveBeenCalled();
		});
	});
});
