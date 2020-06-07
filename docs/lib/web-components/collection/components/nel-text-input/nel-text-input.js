import { Component, Element, Event, h, Listen, Prop, Watch } from "@stencil/core";
/**
 * Similar in behaviour to the input element
 */
export class TextInput {
    constructor() {
        this._mask = /.*/gi;
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.cleartext = true;
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.disabled = false;
        /**
         * Sets a regular expression to restrict data entry to allowed characters
         */
        this.mask = "";
        /**
         * Maximum length of text entry
         */
        this.maxlength = -1;
        /**
         * Minimum length of text entry
         */
        this.minlength = -1;
        /**
         * Sets a regular expression to validate text
         */
        this.pattern = "";
        /**
         * Sets a visual text prompt as a palceholder within text box
         */
        this.placeholder = "";
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        /**
         * Width of text entry
         */
        this.width = 20;
    }
    validateMask(newValue) {
        this._mask = new RegExp(newValue);
    }
    componentDidLoad() {
        this._input = this.host.shadowRoot.querySelector("input");
        this._mask = new RegExp(this.mask);
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    onInput() {
        this.value = this._input.value;
    }
    onKeyDown(ev) {
        if (this.disabled || ev.keyCode === 229) {
            return false;
        }
        if (!this._editKeyPressed(ev) && !this._mask.test(ev.key)) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
        return true;
    }
    onPaste(ev) {
        if (!this.disabled && ev.clipboardData) {
            const paste = ev.clipboardData.getData("text/plain");
            if (!this._mask.test(paste)) {
                ev.preventDefault();
                ev.stopPropagation();
                return false;
            }
            return true;
        }
        return false;
    }
    onSearch() {
        const input = new InputEvent("input", { bubbles: true, cancelable: true });
        this.host.dispatchEvent(input);
    }
    _editKeyPressed(ev) {
        return ev.code === "Delete" || ev.code === "Backspace" ||
            ev.code === "ArrowLeft" || ev.code === "ArrowRight";
    }
    render() {
        return (h("input", { type: this.cleartext ? "search" : "password", maxlength: this.maxlength, minlength: this.minlength, pattern: this.pattern, placeholder: this.placeholder, size: this.width, value: this.value }));
    }
    static get is() { return "nel-text-input"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-text-input.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-text-input.css"]
    }; }
    static get properties() { return {
        "cleartext": {
            "type": "boolean",
            "mutable": true,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "If false, element is partly greyed out and not responding to user input"
            },
            "attribute": "cleartext",
            "reflect": true,
            "defaultValue": "true"
        },
        "disabled": {
            "type": "boolean",
            "mutable": false,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "If false, element is partly greyed out and not responding to user input"
            },
            "attribute": "disabled",
            "reflect": true,
            "defaultValue": "false"
        },
        "mask": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Sets a regular expression to restrict data entry to allowed characters"
            },
            "attribute": "mask",
            "reflect": true,
            "defaultValue": "\"\""
        },
        "maxlength": {
            "type": "number",
            "mutable": false,
            "complexType": {
                "original": "number",
                "resolved": "number",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Maximum length of text entry"
            },
            "attribute": "maxlength",
            "reflect": true,
            "defaultValue": "-1"
        },
        "minlength": {
            "type": "number",
            "mutable": false,
            "complexType": {
                "original": "number",
                "resolved": "number",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Minimum length of text entry"
            },
            "attribute": "minlength",
            "reflect": true,
            "defaultValue": "-1"
        },
        "pattern": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Sets a regular expression to validate text"
            },
            "attribute": "pattern",
            "reflect": true,
            "defaultValue": "\"\""
        },
        "placeholder": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Sets a visual text prompt as a palceholder within text box"
            },
            "attribute": "placeholder",
            "reflect": true,
            "defaultValue": "\"\""
        },
        "ready": {
            "type": "boolean",
            "mutable": true,
            "complexType": {
                "original": "boolean",
                "resolved": "boolean",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "True when element can correctly respond to external programmatic access"
            },
            "attribute": "ready",
            "reflect": false,
            "defaultValue": "false"
        },
        "value": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Sets the value of the text box"
            },
            "attribute": "value",
            "reflect": true
        },
        "width": {
            "type": "number",
            "mutable": false,
            "complexType": {
                "original": "number",
                "resolved": "number",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Width of text entry"
            },
            "attribute": "width",
            "reflect": true,
            "defaultValue": "20"
        }
    }; }
    static get events() { return [{
            "method": "loaded",
            "name": "loaded",
            "bubbles": true,
            "cancelable": false,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired when element can correctly respond to external programmatic access"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get elementRef() { return "host"; }
    static get watchers() { return [{
            "propName": "mask",
            "methodName": "validateMask"
        }]; }
    static get listeners() { return [{
            "name": "input",
            "method": "onInput",
            "target": undefined,
            "capture": false,
            "passive": false
        }, {
            "name": "keydown",
            "method": "onKeyDown",
            "target": undefined,
            "capture": false,
            "passive": false
        }, {
            "name": "paste",
            "method": "onPaste",
            "target": undefined,
            "capture": false,
            "passive": false
        }, {
            "name": "search",
            "method": "onSearch",
            "target": undefined,
            "capture": false,
            "passive": false
        }]; }
}
