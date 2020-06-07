import { Component, Element, Event, h, Listen, Prop } from "@stencil/core";
/**
 * Displays content when network connectivity is interrupted
 */
export class NetworkConnection {
    constructor() {
        /**
         * If true, content within element remains hidden
         */
        this.available = true;
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
    }
    componentDidLoad() {
        this.loaded.emit(this.host);
        // this.ready = true;
    }
    componentWillLoad() {
        this.ready = true;
    }
    onOnline() {
        this.available = true;
        this.changed.emit(this.host);
    }
    onOffline() {
        this.available = false;
        this.changed.emit(this.host);
    }
    render() {
        return (h("div", { hidden: this.available },
            h("slot", null)));
    }
    static get is() { return "nel-network-connection"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-network-connection.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-network-connection.css"]
    }; }
    static get properties() { return {
        "available": {
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
                "text": "If true, content within element remains hidden"
            },
            "attribute": "available",
            "reflect": true,
            "defaultValue": "true"
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
            "cancelable": false,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired after network status change"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get elementRef() { return "host"; }
    static get listeners() { return [{
            "name": "online",
            "method": "onOnline",
            "target": "window",
            "capture": false,
            "passive": false
        }, {
            "name": "offline",
            "method": "onOffline",
            "target": "window",
            "capture": false,
            "passive": false
        }]; }
}
