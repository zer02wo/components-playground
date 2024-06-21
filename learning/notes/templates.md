# HTML Templates
Following: https://css-tricks.com/crafting-reusable-html-templates/

Supplemented by: https://developer.mozilla.org/en-US/docs/Web/API/Web_components

## Recap

The `<template>` element is a "user-defined HTML element that isn't rendered until called upon in JavaScript" and can be passed around/reused.
```
<template>
<h1>Hello, world!</h1>
</template>
```
Simple example above will not be rendered, makes it easier to:
- Define content/structure in HTML (rather than writing HTML in JS)
- Save it for later use (not rendered on page load)

- `Node.cloneNode()` or `Document.importNode()` allows us to add a **deep copy** (i.e. includes child nodes) of the template content to the page, so it can be **reused** again.
    - Personal note: I can't find any important distinction between these two methods (other than legacy behaviour). So I'm using `cloneNode()` as the syntax is nicer, and this is what MDN docs use.

- Accessing `template.content` directly would remove the DOM node from its original location and add it to where it is later appended.
```
const template = document.querySelector('template');
const node = template.content.cloneNode(true);
// const node = document.importNode(template.content, true);

document.body.appendChild(node);
```

## On Versatility & Performance
Templates can contain ***any*** HTML, including `<script>` and `<style>` elements.

- This allows you to create cohesive elements that are (almost) entirely responsible for themselves.
    - I.e. a template contains its own styles and frontend logic, but the template still needs to be rendered on the page.
    - Presentation and business/application logic should still be separated by using using a REST API to connect to a backend.
- Personal question: How does this relate to Separation of Concerns?
    - Components are tightly coupled, but also very cohesive.

- However, this does now introduce another *"problem"* that templates solve regarding *Separation of Concerns*.
    - Templates prevent you from having to write HTML in JavaScript.
    - But using these elements means you're now writing CSS & JS in HTML.
        - **Although**, the readability of CSS/JS in HTML is a lot better than CSS/HTML in JS, even when using template literals.
    - One could argue it's more difficult to find CSS/JS logic outside those expected file prefixes.
        - Someone else could argue it's easier, as everything is within the one location.
    - People like TailwindCSS, but don't like the use of JavaScript attributes in HTML (e.g. `onclick="..."`).

- Personal note: I can also see this having some performance benefits (and drawbacks).
    - Pro: the scripts & styles are not immediately rendered by the browser, which means there is less work for the browser to do on render.
    - Con: heavy use of template elements on load could see issues with some CWV scores (i.e. INP/CLS) if not accounted for appropriately.
        - Perhaps this is not distinct to templates and is just related to heavy JS use in general, but seems easy to fall into with templates.
    - Con: stylesheets (.css) and JavaScript files (.js) can be cached by the browser, adding this to the HTML content means it does not.

### Template Scope
- With the current method of just adding `<script>` and `<style>` tags directly to the `<template>`, they will be scoped to the entire document.
    - This means the styles will apply to all relevant elements within the documents.
        - And the JavaScript will also not be encapsulated.
    - Through the use of current methods, this makes `<templates>` very fragile as introducing them to the page can break things.
        - Next step in guide will cover how to encapsulate this content.
