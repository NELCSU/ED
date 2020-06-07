import { Component, Element, Event, h, Prop, Watch } from "@stencil/core";
/**
 * Displays a modal background for displaying messages above page content
 */
export class ModalView {
    constructor() {
        /**
         * Aligns child elements. Defaults to center of viewport.
         */
        this.align = "center";
        /**
         * If true, displays the modal element
         */
        this.open = false;
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
    }
    validateOpen(newValue) {
        if (Boolean(newValue)) {
            this.opened.emit(this.host);
        }
        else {
            this.closed.emit(this.host);
        }
    }
    componentDidLoad() {
        this.loaded.emit(this.host);
    }
    componentWillRender() {
        this.ready = true;
    }
    render() {
        const cls = `modal-content ${this.align}`;
        return (h("div", { class: "modal-view" },
            h("div", { class: cls },
                h("slot", null))));
    }
    static get is() { return "nel-modal-view"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-modal-view.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-modal-view.css"]
    }; }
    static get properties() { return {
        "align": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "\"bottom\" | \"center\" | \"top\"",
                "resolved": "\"bottom\" | \"center\" | \"top\"",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Aligns child elements. Defaults to center of viewport."
            },
            "attribute": "align",
            "reflect": true,
            "defaultValue": "\"center\""
        },
        "open": {
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
                "text": "If true, displays the modal element"
            },
            "attribute": "open",
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
        }
    }; }
    static get events() { return [{
            "method": "closed",
            "name": "closed",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired when element's open property is false either via UI or programmatically"
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
            "method": "opened",
            "name": "opened",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired when element's open property is true either via UI or programmatically"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get elementRef() { return "host"; }
    static get watchers() { return [{
            "propName": "open",
            "methodName": "validateOpen"
        }]; }
}
