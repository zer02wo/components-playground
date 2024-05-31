# Intro
Following: https://css-tricks.com/an-introduction-to-web-components/

Supplemented by: https://developer.mozilla.org/en-US/docs/Web/API/Web_components

## Three Main Components
All three of the following technologies make up the core Web Component technologies in order to facilitate reusable and interoperable functionality.

These technologies can be used in conjunction or independently. The focus on this section is their use independently.

### Custom Elements
- Uses the `CustomElementsRegistry` (accessible via window.customElements) to create new HTML elements.
    - **These must always include a hyphen to prevent conflicts with future browser element names**
    - E.g. `<my-custom-component>`
- Implementation of semantics/behaviour/markup is dictated by creating a JavaScript class that extends existing HTML elements.
    ```
    class MyCustomComponent extends HTMLElement
    ...
    class WordCount extends HTMLParagraphElement
    ...
    ```
- Custom elements can exist without 3rd party JS frameworks (such as React), but also have great interoperability to be used out-of-the-box with these frameworks.

### Shadow DOM
- An encapsulated version of the DOM.
    - Allows isolating/"sandboxing" of DOM fragments (similiar to iframe).
        - E.g. limits CSS rules to only apply within the scope of the shadow DOM fragment.
    - Original document scope is referred to as **"light DOM"** (i.e. opposite of "shadow")
        - E.g. JavaScript from the light DOM cannot document.querySelector elements within the shadow DOM.
            - But if `mode` is set to `open`, it can access it via the `Element.shadowRoot` property.
- Can be created using the `Element.attachShadow()` method.
    ```
    // Attach shadow DOM fragment to **#example** element
    const shadowRoot = document.querySelector('#example').attachShadow({ mode: 'open' });
    // Can now interact with the shadow DOM as you would the light DOM
    shadowRoot.appendChild(exampleElementHere);
    ```
- Can be created using the `shadowrootmode` attribute on a `<template>` (see next section).
    ```
    <div id="host">
        <template shadowrootmode="open">
            <span>I'm in the shadow DOM</span>
        </template>
    </div>
    ```
    - `<template>` is replaced by a shadow root containing the template's contents.

### Templates
- Reusable block of code within HTML.
    - Not immediately rendered on the page like standard HTML elements.
    - Unless the `shadowrootmode="open"` property is included.
        - E.g. `<template id="hello-world">Hello, world!</template>` would **not** display anything until a script uses the template.
        - E.g. `<template shadowrootmode="open">Hello, world!</template>` **would** immediately display on the page.
- Create an instance of a template using the `Node.cloneNode()` or `document.importNode()` methods.
    ```
    // Get template fragment from DOM
    const fragment = document.querySelector('#hello-world').content;
    // Create instance of template
    const instance = fragment.cloneNode(true);
    const altInstance = document.importNode(fragment.content, true);
    // Add template instance to the DOM, or do whatever you'd like with it
    document.body.appendChild(instance);
    document.body.appendChild(altInstance);
    ```