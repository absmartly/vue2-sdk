<script>
export default {
	name: "Treatment",
	props: {
		name: {
			type: String,
			required: true
		},

		attributes: {
			type: Object,
			default() {
				return undefined;
			}
		}
	},

	data() {
		return {
			ready: false,
			failed: undefined,
			treatment: undefined,
			treatmentNames: undefined,
			config: undefined
		};
	},

	render(createElement) {
		const findSlot = (obj, names) => {
			for (const name of names) {
				if (name in obj) {
					return name;
				}
			}
			return undefined;
		};

		const props = this.ready
			? {
					treatment: this.treatment || 0,
					config: this.config,
					ready: this.ready,
					failed: this.failed
			  }
			: {
					ready: this.ready,
					failed: this.failed
			  };

		const slotName = findSlot(this.$scopedSlots, this.treatmentNames);
		if (slotName === undefined) {
			throw new Error(`No matching treatment slots. Expected one of ${this.treatmentNames}`);
		}

		return createElement("div", [this.$scopedSlots[slotName](props)]);
	},

	beforeMount() {
		const updateState = context => {
			this.failed = context.isFailed();

			if (context.isReady()) {
				if (this.attributes instanceof Object) {
					context.attributes(this.attributes);
				}

				this.treatment = context.treatment(this.name);
				this.ready = true;
			}

			if (this.ready) {
				this.treatmentNames = [String.fromCharCode(65 + this.treatment), this.treatment.toString(), "default"];
				this.config = context.experimentConfig(this.name);
			} else {
				this.treatmentNames = ["loading", "default"];
				this.config = {};
			}
		};

		const context = this[this.__absmartlyGlobal];
		updateState(context);

		if (!context.isReady()) {
			context.ready().then(() => {
				updateState(context);
			});
		}
	}
};
</script>
