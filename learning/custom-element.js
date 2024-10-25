class OneDialog extends HTMLElement {
    static get observedAttributes() {
        return ['open'];
    }

    constructor() {
        // Always call super()
        super();
        // Bind methods to instance of element (ensure proper reference to 'this')
        this.close = this.close.bind(this);
        this._watchEscape = this._watchEscape.bind(this);
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (newValue !== oldValue) {
            this[attrName] = this.hasAttribute(attrName);
        }
    }

    connectedCallback() {
        // Use template
        const template = document.getElementById('dialog-template');
        const node = document.importNode(template.content, true);
        this.appendChild(node);
        // Remove event listeners
        this.querySelector('button').addEventListener('click', this.close);
        this.querySelector('.overlay').addEventListener('click', this.close);
    }

    disconnectedCallback() {
        // Unattach event listeners
        this.querySelector('button').removeEventListener('click', this.close);
        this.querySelector('.overlay').removeEventListener('click', this.close);
    }

    // Following getter/setters ensure the open attribute (on HTML element)
    // is synced with the property (on the DOM object)
    // These getter/setters are not *required*, but considered best practice for custom-element authoring
    get open() {
        return this.hasAttribute('open');
    }

    // E.g. setting element.open = true will add the [open] attribute on the DOM
    // and vice-versa
    set open(isOpen) {
        // Toggle wrapper element state
        this.querySelector('.wrapper').classList.toggle('open', isOpen);
        this.querySelector('.wrapper').setAttribute('aria-hidden', !isOpen);

        if (isOpen) {
            // Save reference to previously focused element for accessibility
            this._wasFocused = document.activeElement;

            this.setAttribute('open', '');
            document.addEventListener('keydown', this._watchEscape);
            this.focus();
            this.querySelector('button').focus();
        } else {
            // Return focus to previous element for accessibility
            this._wasFocused && this._wasFocused.focus && this._wasFocused.focus();

            this.removeAttribute('open');
            document.removeEventListener('keydown', this._watchEscape);
            this.close();
        }
    }

    close() {
        if (this.open !== false) {
            this.open = false;
        }

        // Utility event to allow listening for component state update
        const closeEvent = new CustomEvent('dialog-closed');
        this.dispatchEvent(closeEvent);
    }

    _watchEscape(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }
}

customElements.define('one-dialog', OneDialog);

// Button to toggle dialog attribute
const button = document.getElementById('launch-dialog');
button.addEventListener('click', () => {
    document.querySelector('one-dialog').open = true;
})