# Custom Elements
Following: https://css-tricks.com/creating-a-custom-element-from-scratch/

Supplemented by: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements

## Recap
The customElements API allows us to use custom HTML tags on any page that contains the definition. Like a native version of a React component.
```
class MyComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<h1>Hello world</h1>`;
    }
}

customElements.define('my-component', MyComponent);
```

Simple example above creates a `<my-component>` custom element with a custom `MyComponent` class that extends the built-in `HTMLElement` class.
- This example outputs the specified inner HTML value wherever the custom HTML tag is output on the page.

- You could create custom elements that extend from other classes, e.g. `HTMLInputElement` (which in itself extends from `HTMLElement`).
    - This would grant you access to the instance properties specific to that class, e.g. "name" or "defaultValue".

The `connectedCallback()` lifecycle method is called each time the element is added to the document. This is where the element setup should be defined.
Through the `window.customElements.define()` method, the custom element is registered and made available on the page.

## Lifecycle Methods
### connectedCallback()
- Called each time the element is added to the document.
- Initalises the component and defines its functionality in the DOM - e.g. adding content to the element, setting up event listeners, etc.
- Different to the element's constructor, which sets up the bare bones of the element.
    - I.e. `document.createElement()` calls the element's constructor at which no point attributes/content should exist, because it has not been connected to the DOM.
### disconnectedCallback()
- Called each time the element is removed from the document.
    - Inverse of `connectedCallback()`.
- Used for cleaning up the custom element - e.g. removing event listeners, or MutationObservers attached to the element.
### adoptedCallback()
- Called each time the element is moved to a new document.
### attributeChangedCallback()
- Called when attributes are modified (i.e. changed, added, removed, or replaced).
    - This includes when the attribute is initialised for the first time.

## Attributes / Reacting to Changes
- For built-in elements the state is typically reflected by the attributes on the element.
    - For example the `[open]` attribute on a `<details>` element determines if content other than the `<summary>` is visible.
- For custom elements, we can define how our web components react to changes in these elements using:
    - The `observedAttributes` static property/method.
        - **Note**: I'm unsure from the documentation what the difference between the following would be in terms of use-case, but the getter seems to be more standard.
            ```
            static get observedAttributes() { // method example
                return ['color', 'size'];
            }

            static observedAttributes = ['color', 'size']; // property example
            ```

    - In combination with the `attributeChangedCallback()` method described above.

- In the following example, this simply logs the change in value for the relevant attribute.
```
class MyCustomElement extends HTMLElement {
    static get observedAttributes() {
        return ['color', 'size'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(
            `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
        );
    }
}

customElements.define("my-custom-element", MyCustomElement);
```

## Custom States & Pseudo-Class CSS Selectors
- Built-in elements have different states (e.g. hover, disabled, read-only, etc).
    - These states can be referenced by CSS pseudo-class selectors (e.g. `div:hover`, `button:disabled`, `input:read-only`).
- Custom elements can define custom states and style them using the CSS `:state()` pseudo-class function.
- The below example shows a boolean property `collapsed`:
```
class MyCustomElement extends HTMLElement {
    constructor() {
        super();
        this._internals = this.attachInternals();
    }

    get collapsed() {
        return this._internals.states.has('hidden');
    }

    set collapsed(flag) {
        if (flag) {
            // Existence of identifier corresponds to "true"
            this._internals.states.add('hidden');
        } else {
            // Absence of identifier corresponds to "false"
            this._internals.states.delete('hidden');
        }
    }
}

customElements.define("my-custom-element", MyCustomElement);
```
- `HTMLElement.attachInternals()` attaches an `ElementInternals` object which provides access to a `CustomStateSet`.
- The state can then be referenced via CSS using: `my-custom-element:state(hidden)`
    - The `hidden` identifier could have been named anything, e.g. `collapsed` for consistency, example just to show they can be different if needed.

## Non-Presentational Components
- Typically custom elements will include markup and behaviour that is visible within the document.
- However, not all elements need to be visually rendered/have presentational logic.
    - E.g. components that manage application state, or a component that manages analytics requests to an endpoint, etc.