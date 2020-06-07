import { Component, Element, Event, h, Prop } from "@stencil/core";
/**
 * Displays a status badge
 */
export class StatusBadge {
    constructor() {
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.disabled = false;
        /**
         * Sets the text label to be applied to the element
         */
        this.label = "";
        /**
         * Sets the prefix label to be applied to the element
         */
        this.pre = "";
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        /**
         * Sets the suffix label to be applied to the element
         */
        this.suf = "";
    }
    componentDidLoad() {
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    render() {
        const ico = this.rag === -1
            ? "diamond"
            : this.rag === 0
                ? "triangle"
                : this.rag === 1
                    ? "circle"
                    : "";
        return (h("div", { class: "status-badge" },
            h("div", { class: "icon" },
                h("div", { class: ico })),
            h("div", { class: "text" },
                h("span", null, this.pre),
                h("slot", null),
                h("span", null, this.suf)),
            h("div", { class: "label" }, this.label ? " " + this.label : "")));
    }
    static get is() { return "nel-status-badge"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-status-badge.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-status-badge.css"]
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
        "label": {
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
                "text": "Sets the text label to be applied to the element"
            },
            "attribute": "label",
            "reflect": true,
            "defaultValue": "\"\""
        },
        "pre": {
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
                "text": "Sets the prefix label to be applied to the element"
            },
            "attribute": "pre",
            "reflect": true,
            "defaultValue": "\"\""
        },
        "rag": {
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
                "text": "Sets the Red-Amber-Green icon to be applied to the element"
            },
            "attribute": "rag",
            "reflect": true
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
        "suf": {
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
                "text": "Sets the suffix label to be applied to the element"
            },
            "attribute": "suf",
            "reflect": true,
            "defaultValue": "\"\""
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
}
