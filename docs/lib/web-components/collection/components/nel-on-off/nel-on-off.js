import { Component, Element, Event, h, Host, Listen, Prop, Watch } from "@stencil/core";
/**
 * Similar in behaviour to the checkbox (without indeterminate state)
 */
export class OnOff {
    constructor() {
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.disabled = false;
        /**
         * If true, element is in the 'on' state
         */
        this.on = false;
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        /**
         * Adjusts the size of the element, using CSS rem units of measurement
         */
        this.size = 4;
    }
    validateOpen() {
        this.changed.emit(this.host);
    }
    componentDidLoad() {
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    onClick() {
        this.on = !this.on;
    }
    render() {
        const ht = `${this.size / 2}rem`;
        const w = `${this.size}rem`;
        const st = `input { height: ${ht}; width: ${w} }
    input:before { height: ${ht}; width: ${ht} }`;
        return (h(Host, { "aria-checked": this.on ? "true" : "false" },
            h("span", null,
                h("style", null, st),
                h("input", { type: "checkbox", checked: this.on, value: "" }))));
    }
    static get is() { return "nel-on-off"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-on-off.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-on-off.css"]
    }; }
    static get properties() { return {
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
        "on": {
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
                "text": "If true, element is in the 'on' state"
            },
            "attribute": "on",
            "reflect": true,
            "defaultValue": "false"
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
        "size": {
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
                "text": "Adjusts the size of the element, using CSS rem units of measurement"
            },
            "attribute": "size",
            "reflect": true,
            "defaultValue": "4"
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
        }, {
            "method": "changed",
            "name": "changed",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired after element is toggled"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get elementRef() { return "host"; }
    static get watchers() { return [{
            "propName": "on",
            "methodName": "validateOpen"
        }]; }
    static get listeners() { return [{
            "name": "click",
            "method": "onClick",
            "target": undefined,
            "capture": false,
            "passive": false
        }]; }
}
