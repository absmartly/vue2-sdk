# ABsmartly Vue2 SDK [![npm version](https://badge.fury.io/js/%40absmartly%2Fvue2-sdk.svg)](https://badge.fury.io/js/%40absmartly%2Fvue2-sdk)

A/B Smartly - Vue 2 SDK

## Compatibility

The A/B Smartly Vue2 SDK is a thin wrapper around the [A/B Smartly JavaScript SDK](https://www.github.com/absmartly/javascript-sdk).

It requires Vue 2 version 2.6.0+ and is supported on IE 10+ and all other major browsers.

**Note**: IE 10 does not natively support Promises. If you target IE 10, you must include a polyfill like [es6-promise](https://www.npmjs.com/package/es6-promise) or [rsvp](https://www.npmjs.com/package/rsvp).

## Installation

#### npm

```shell
npm install @absmartly/vue2-sdk --save
```

#### yarn

```shell
yarn add @absmartly/vue2-sdk
```

#### Directly in the browser

You can include an optimized and pre-built package directly in your HTML code through [unpkg.com](https://www.unpkg.com).

Simply add the following code to your `head` section to include the latest published version:

```html
<script src="https://unpkg.com/@absmartly/vue2-sdk"></script>
```

## Getting Started

Please follow the [installation](#installation) instructions before trying the following code.

### Import the SDK

```javascript
const absmartly = require("@absmartly/vue2-sdk");
// OR with ES6 modules:
import absmartly from "@absmartly/vue2-sdk";
```

### Initialization

This example assumes an API Key, an Application, and an Environment have been created in the A/B Smartly web console.

The Vue2 SDK wraps the [A/B Smartly JavaScript SDK](https://www.github.com/absmartly/javascript-sdk). Refer to the JavaScript SDK docs for details regarding additional options used for initialization.

```javascript
// Before mounting your Vue application
Vue.use(absmartly.ABSmartlyVue, {
    sdkOptions: {
        endpoint: "https://your-company.absmartly.io/v1",
        apiKey: "YOUR-API-KEY",
        environment: "production",
        application: "website",
    },
    context: {
        units: {
            session_id: "5ebf06d8cb5d8137290c4abb64155584fbdb64d8",
        },
    },
});
```

This makes the `$absmartly` context instance available in every Vue component via `this.$absmartly`.

#### With Optional Parameters

```javascript
Vue.use(absmartly.ABSmartlyVue, {
    sdkOptions: {
        endpoint: "https://your-company.absmartly.io/v1",
        apiKey: "YOUR-API-KEY",
        environment: "production",
        application: "website",
    },
    context: {
        units: {
            session_id: "5ebf06d8cb5d8137290c4abb64155584fbdb64d8",
        },
    },
    contextOptions: {
        refreshPeriod: 5 * 60 * 1000, // refresh every 5 minutes (default)
    },
    attributes: {
        user_agent: navigator.userAgent,
    },
    overrides: {
        exp_test_development: 1,
    },
    globalName: "$absmartly", // default
    globalComponents: true, // registers <Treatment> component globally (default)
});
```

#### Advanced Configuration

For advanced use cases where you need full control, you can pass a pre-created `Context` instance directly:

```javascript
import { SDK, Context } from "@absmartly/vue2-sdk";

const sdk = new SDK({
    endpoint: "https://your-company.absmartly.io/v1",
    apiKey: "YOUR-API-KEY",
    environment: "production",
    application: "website",
});

const context = sdk.createContext({
    units: {
        session_id: "5ebf06d8cb5d8137290c4abb64155584fbdb64d8",
    },
});

Vue.use(absmartly.ABSmartlyVue, {
    context: context,
});
```

**Plugin Options**

| Option           | Type       | Required? |    Default     | Description                                                                                                                                                                  |
| :--------------- | :--------- | :-------: | :------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sdkOptions       | `Object`   |  &#9989;  | `undefined`    | Options passed to the JavaScript SDK constructor (endpoint, apiKey, environment, application).                                                                               |
| context          | `Object`   |  &#9989;  | `undefined`    | Context definition with `units` mapping. Can also be a pre-created `Context` instance.                                                                                       |
| contextOptions   | `Object`   |  &#10060; | `{ refreshPeriod: 300000 }` | Options for context creation. `refreshPeriod` sets automatic refresh interval in milliseconds.                                                          |
| data             | `Object`   |  &#10060; | `undefined`    | Pre-fetched context data for server-side rendering scenarios.                                                                                                                |
| attributes       | `Object`   |  &#10060; | `undefined`    | Initial context attributes to set (e.g., `{ user_agent: navigator.userAgent }`).                                                                                            |
| overrides        | `Object`   |  &#10060; | `undefined`    | Treatment overrides for development/testing (e.g., `{ exp_name: 1 }`).                                                                                                      |
| globalName       | `String`   |  &#10060; | `"$absmartly"` | The name of the context instance on `Vue.prototype`.                                                                                                                         |
| globalComponents | `Boolean`  |  &#10060; | `true`         | Whether to register the `<Treatment>` component globally.                                                                                                                    |

## Creating a New Context

The Vue2 SDK plugin creates a single context during `Vue.use()`. The context is available as `this.$absmartly` in every component.

### With Pre-fetched Data

When doing full-stack experimentation, we recommend creating a context only once on the server-side. Creating a context involves a round-trip to the A/B Smartly event collector. You can avoid repeating the round-trip on the client-side by sending the server-side data embedded in the first document, for example by rendering it in the template.

```javascript
Vue.use(absmartly.ABSmartlyVue, {
    sdkOptions: {
        endpoint: "https://your-company.absmartly.io/v1",
        apiKey: "YOUR-API-KEY",
        environment: "production",
        application: "website",
    },
    context: {
        units: {
            session_id: "5ebf06d8cb5d8137290c4abb64155584fbdb64d8",
        },
    },
    data: prefetchedContextData, // injected from server-side rendering
});
```

### Refreshing the Context with Fresh Experiment Data

For long-running single-page applications, experiment data is refreshed automatically based on the `refreshPeriod` option (default: 5 minutes). You can also refresh manually:

```javascript
this.$absmartly.refresh();
```

### Setting Extra Units

You can add additional units to the context after initialization. Note that **you cannot override an already set unit type**.

```javascript
this.$absmartly.unit("db_user_id", "1000013");

this.$absmartly.units({
    db_user_id: "1000013",
});
```

## Basic Usage

### Selecting a Treatment with the Treatment Component

The preferred method to select a treatment is using the `<Treatment>` component with named and scoped slots per treatment.

The slot selection rules are as follows:

- If the context is not ready:
    - If the `loading` slot exists, select it
    - Otherwise, select the `default` slot

- If the context is ready:
    - If a slot with the treatment alias (A, B, C, ...) exists, select it
    - Otherwise, if a slot with the treatment index exists, select it
    - Otherwise, select the `default` slot

- If the selected slot does not exist, nothing will be rendered

#### Example using treatment aliases

```html
<treatment name="exp_test_experiment">
    <template #A>
        <my-button></my-button>
    </template>
    <template #B="{ config }">
        <my-button :color="config.color"></my-button>
    </template>
    <template #loading>
        <my-spinner></my-spinner>
    </template>
</treatment>
```

#### Example using treatment indices

```html
<treatment name="exp_test_experiment">
    <template #0>
        <my-button></my-button>
    </template>
    <template #1="{ config }">
        <my-button :color="config.color"></my-button>
    </template>
    <template #2="{ config }">
        <my-other-button :color="config.color"></my-other-button>
    </template>
    <template #loading>
        <my-spinner></my-spinner>
    </template>
</treatment>
```

#### Example using the default slot

```html
<treatment name="exp_test_experiment">
    <template #default="{ config, treatment, ready }">
        <template v-if="ready">
            <my-button v-if="treatment == 0"></my-button>
            <my-button v-else-if="treatment == 1" :color="config.color"></my-button>
            <my-other-button v-else-if="treatment == 2" :color="config.color"></my-other-button>
        </template>
        <template v-else>
            <my-spinner></my-spinner>
        </template>
    </template>
</treatment>
```

#### Scoped Slot Properties

The scoped slot properties contain information about the A/B Smartly context and the selected treatment:

```json
{
    "treatment": 1,
    "config": {
        "color": "red"
    },
    "ready": true,
    "failed": false
}
```

If the experiment is not running, or the context creation failed, the slot will be rendered with:

```json
{
    "treatment": 0,
    "config": {},
    "ready": true,
    "failed": false
}
```

### Selecting a Treatment Programmatically

You can also call the treatment method directly:

```javascript
const treatment = this.$absmartly.treatment("exp_test_experiment");

if (treatment === 0) {
    // user is in control group (variant 0)
} else {
    // user is in treatment group
}
```

### Treatment Variables

```javascript
const buttonColor = this.$absmartly.variableValue("button.color", "red");
```

### Peek at Treatment Variants

Peek at a treatment without triggering an exposure:

```javascript
const treatment = this.$absmartly.peekTreatment("exp_test_experiment");
```

#### Peeking at Variables

```javascript
const buttonColor = this.$absmartly.peekVariableValue("button.color", "red");
```

### Overriding Treatment Variants

During development, it is useful to force a treatment for an experiment. Overrides can be set during initialization or at any time afterwards:

```javascript
// During initialization
Vue.use(absmartly.ABSmartlyVue, {
    // ...
    overrides: {
        exp_test_experiment: 1,
        exp_another_experiment: 0,
    },
});

// Or at runtime
this.$absmartly.override("exp_test_experiment", 1);

this.$absmartly.overrides({
    exp_test_experiment: 1,
    exp_another_experiment: 0,
});
```

## Advanced

### Context Attributes

Attributes can be set during initialization or at any time in a component.

```javascript
// During initialization
Vue.use(absmartly.ABSmartlyVue, {
    // ...
    attributes: {
        user_agent: navigator.userAgent,
    },
});

// In a component
this.$absmartly.attribute("user_agent", navigator.userAgent);

this.$absmartly.attributes({
    customer_age: "new_customer",
});
```

Or directly in templates with the `attributes` prop of the `<Treatment>` component:

```html
<treatment name="exp_test_experiment" :attributes="{ customer_age: 'returning' }">
    <template #default="{ config, treatment, ready }">
        <template v-if="ready">
            <my-button v-if="treatment == 0"></my-button>
            <my-button v-else-if="treatment == 1" :color="config.color"></my-button>
        </template>
        <template v-else>
            <my-spinner></my-spinner>
        </template>
    </template>
</treatment>
```

### Tracking Goals

Goals are created in the A/B Smartly web console.

```javascript
this.$absmartly.track("payment", {
    item_count: 1,
    total_amount: 1999.99,
});
```

### Publishing Pending Data

Sometimes it is necessary to ensure all events have been published to the A/B Smartly collector before proceeding. You can explicitly call `publish()`:

```javascript
await this.$absmartly.publish();
```

### Finalizing

The `finalize()` method will ensure all events have been published to the A/B Smartly collector, like `publish()`, and will also "seal" the context, throwing an error if any method that could generate an event is called.

```javascript
await this.$absmartly.finalize();
```

A common pattern is to finalize before navigation:

```javascript
await this.$absmartly.finalize();
window.location = "https://www.example.com";
```

### Custom Event Logger

The A/B Smartly JavaScript SDK supports a custom event logger. Pass it through the `sdkOptions`:

```javascript
Vue.use(absmartly.ABSmartlyVue, {
    sdkOptions: {
        endpoint: "https://your-company.absmartly.io/v1",
        apiKey: "YOUR-API-KEY",
        environment: "production",
        application: "website",
        eventLogger: (context, eventName, data) => {
            if (eventName === "exposure") {
                analytics.track("Experiment Viewed", {
                    experiment_name: data.name,
                    variant: data.variant,
                });
            }
        },
    },
    context: {
        units: {
            session_id: "5ebf06d8cb5d8137290c4abb64155584fbdb64d8",
        },
    },
});
```

**Event Types**

| Event      | When                                                       | Data                                   |
| ---------- | ---------------------------------------------------------- | -------------------------------------- |
| `error`    | Context receives an error                                  | Error object                           |
| `ready`    | Context turns ready                                        | Context data used to initialize        |
| `refresh`  | `refresh()` method succeeds                                | Context data used to refresh           |
| `publish`  | `publish()` method succeeds                                | Publish event sent to collector        |
| `exposure` | `treatment()` succeeds on first exposure                   | Exposure enqueued for publishing       |
| `goal`     | `track()` method succeeds                                  | Goal achievement enqueued for publishing |
| `finalize` | `finalize()` method succeeds the first time                | `null`                                 |

## Platform-Specific Examples

### Using with Vue Router

```javascript
import Vue from "vue";
import VueRouter from "vue-router";
import absmartly from "@absmartly/vue2-sdk";

Vue.use(VueRouter);

Vue.use(absmartly.ABSmartlyVue, {
    sdkOptions: {
        endpoint: "https://your-company.absmartly.io/v1",
        apiKey: "YOUR-API-KEY",
        environment: "production",
        application: "website",
    },
    context: {
        units: {
            session_id: getSessionId(),
        },
    },
});

const router = new VueRouter({
    routes: [
        { path: "/", component: Home },
        { path: "/product/:id", component: Product },
    ],
});

new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app");
```

### Using with Vuex

```javascript
// store/index.js
export default new Vuex.Store({
    actions: {
        trackPurchase({ rootState }, { items, total }) {
            const context = rootState._vm.$absmartly;
            context.track("purchase", {
                item_count: items.length,
                total_amount: total,
            });
        },
    },
});
```

### Component with Treatment Logic

```html
<template>
    <div>
        <treatment name="exp_checkout_flow">
            <template #A>
                <standard-checkout @complete="onCheckoutComplete"></standard-checkout>
            </template>
            <template #B="{ config }">
                <streamlined-checkout
                    :steps="config.steps"
                    @complete="onCheckoutComplete"
                ></streamlined-checkout>
            </template>
            <template #loading>
                <checkout-skeleton></checkout-skeleton>
            </template>
        </treatment>
    </div>
</template>

<script>
export default {
    name: "CheckoutPage",
    methods: {
        onCheckoutComplete(orderData) {
            this.$absmartly.track("checkout_complete", {
                order_id: orderData.id,
                total_amount: orderData.total,
            });
        },
    },
};
</script>
```

## About A/B Smartly

**A/B Smartly** is the leading provider of state-of-the-art, on-premises, full-stack experimentation platforms for engineering and product teams that want to confidently deploy features as fast as they can develop them.
A/B Smartly's real-time analytics helps engineering and product teams ensure that new features will improve the customer experience without breaking or degrading performance and/or business metrics.

### Have a look at our growing list of clients and SDKs:
- [Java SDK](https://www.github.com/absmartly/java-sdk)
- [JavaScript SDK](https://www.github.com/absmartly/javascript-sdk)
- [PHP SDK](https://www.github.com/absmartly/php-sdk)
- [Swift SDK](https://www.github.com/absmartly/swift-sdk)
- [Vue2 SDK](https://www.github.com/absmartly/vue2-sdk) (this package)
- [Vue3 SDK](https://www.github.com/absmartly/vue3-sdk)
- [React SDK](https://www.github.com/absmartly/react-sdk)
- [Angular SDK](https://www.github.com/absmartly/angular-sdk)
- [Android SDK](https://www.github.com/absmartly/android-sdk)
- [Python3 SDK](https://www.github.com/absmartly/python3-sdk)
- [Go SDK](https://www.github.com/absmartly/go-sdk)
- [Ruby SDK](https://www.github.com/absmartly/ruby-sdk)
- [.NET SDK](https://www.github.com/absmartly/dotnet-sdk)
- [Dart SDK](https://www.github.com/absmartly/dart-sdk)
- [Flutter SDK](https://www.github.com/absmartly/flutter-sdk)
