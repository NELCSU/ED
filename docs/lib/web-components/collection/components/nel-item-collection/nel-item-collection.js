import { Component, Element, Event, h, Prop, Watch } from "@stencil/core";
/**
 * Organises child elements vertically or horizontally
 */
export class ItemCollection {
    constructor() {
        /**
         * Aligns child elements within collection. Defaults to vertical list.
         */
        this.align = "vertical";
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.disabled = false;
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        /**
         * Displays the element resize handle (bottom right corner) if true
         */
        this.resizable = false;
        /**
         * Sorts child elements in collection based on text content
         */
        this.sort = "ASC";
    }
    validateHAlign(newValue) {
        this.align = newValue;
    }
    validateClear(newValue) {
        if (newValue) {
            for (let el of Array.from(this.host.children)) {
                this.host.removeChild(el);
            }
            this.cleared.emit(this.host);
            this.clear = false;
        }
    }
    validateSort(newValue) {
        const sorted = Array.from(this.host.children)
            .sort(newValue === "DESC"
            ? (a, b) => (a.textContent || "") > (b.textContent || "") ? -1 : 1
            : (a, b) => (a.textContent || "") > (b.textContent || "") ? 1 : -1);
        Array.from(this.host.children)
            .map(el => this.host.removeChild(el));
        sorted.map(el => this.host.appendChild(el));
        this.sort = newValue;
        this.sorted.emit(this.host);
    }
    componentDidLoad() {
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    render() {
        let cls = `item-collection ${this.align}`;
        cls += !this.disabled && this.resizable ? ` resize-${this.align}` : "";
        const tab = this.disabled ? undefined : 0;
        return (h("div", { class: cls, tabindex: tab },
            h("slot", null)));
    }
    static get is() { return "nel-item-collection"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-item-collection.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-item-collection.css"]
    }; }
    static get properties() { return {
        "align": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "\"horizontal\" | \"vertical\"",
                "resolved": "\"horizontal\" | \"vertical\"",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Aligns child elements within collection. Defaults to vertical list."
            },
            "attribute": "align",
            "reflect": true,
            "defaultValue": "\"vertical\""
        },
        "clear": {
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
                "text": "Clears out all child elements from collection"
            },
            "attribute": "clear",
            "reflect": true
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
        "resizable": {
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
                "text": "Displays the element resize handle (bottom right corner) if true"
            },
            "attribute": "resizable",
            "reflect": true,
            "defaultValue": "false"
        },
        "sort": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "\"ASC\" | \"DESC\"",
                "resolved": "\"ASC\" | \"DESC\"",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Sorts child elements in collection based on text content"
            },
            "attribute": "sort",
            "reflect": true,
            "defaultValue": "\"ASC\""
        }
    }; }
    static get events() { return [{
            "method": "cleared",
            "name": "cleared",
            "bubbles": true,
            "cancelable": false,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired after child elements are removed via clear() method"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }, {
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
            "method": "sorted",
            "name": "sorted",
            "bubbles": true,
            "cancelable": false,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired after child elements are sorted"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get elementRef() { return "host"; }
    static get watchers() { return [{
            "propName": "align",
            "methodName": "validateHAlign"
        }, {
            "propName": "clear",
            "methodName": "validateClear"
        }, {
            "propName": "sort",
            "methodName": "validateSort"
        }]; }
}
