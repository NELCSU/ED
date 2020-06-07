import { Component, Element, Event, h, Listen, Prop, Watch } from "@stencil/core";
/**
 * Similar in behaviour to li element
 */
export class ListItem {
    constructor() {
        /**
         * Sets the bullet color of the element. Default is #eeeeee
         */
        this.color = "#eeeeee";
        /**
         * If true, allows the element to be delete using keyboard
         */
        this.deletable = false;
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.disabled = false;
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        /**
         * If true, allows the element to receive focus
         */
        this.selectable = false;
    }
    validateClear(newValue) {
        if (newValue) {
            this.deleted.emit(this.host);
            const parent = this.host.parentNode;
            parent.removeChild(this.host);
        }
    }
    componentDidLoad() {
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    onclick(ev) {
        if (this.disabled || !this.selectable) {
            ev.preventDefault();
            return;
        }
        if (this.host.classList.contains("selected")) {
            this.host.classList.remove("selected");
        }
        else {
            this.host.classList.add("selected");
        }
        this.selected.emit(this.host);
    }
    onKeyDown(ev) {
        if (this.disabled || !this.selectable || ev.keyCode === 229) {
            ev.stopImmediatePropagation();
            ev.preventDefault();
            return;
        }
        if (this.deletable && ev.code === "Delete") {
            this.deleting.emit(this.host);
        }
    }
    render() {
        const tab = this.selectable ? 0 : undefined;
        const bcls = `bullet${this.selectable && !this.disabled ? " selectable" : ""}`;
        const tcls = `text${this.selectable && !this.disabled ? " selectable" : ""}`;
        const bst = {
            "background-color": this.color,
            border: `1px solid ${this.color}`
        };
        return (h("div", { class: "list-item", tabindex: tab },
            h("div", { class: bcls, style: bst }),
            h("div", { class: tcls },
                h("slot", null))));
    }
    static get is() { return "nel-list-item"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-list-item.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-list-item.css"]
    }; }
    static get properties() { return {
        "color": {
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
                "text": "Sets the bullet color of the element. Default is #eeeeee"
            },
            "attribute": "color",
            "reflect": true,
            "defaultValue": "\"#eeeeee\""
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
                "text": "Removes element from DOM"
            },
            "attribute": "clear",
            "reflect": true
        },
        "deletable": {
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
                "text": "If true, allows the element to be delete using keyboard"
            },
            "attribute": "deletable",
            "reflect": true,
            "defaultValue": "false"
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
        "selectable": {
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
                "text": "If true, allows the element to receive focus"
            },
            "attribute": "selectable",
            "reflect": true,
            "defaultValue": "false"
        }
    }; }
    static get events() { return [{
            "method": "deleting",
            "name": "deleting",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired when delete key pressed on selected element"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }, {
            "method": "deleted",
            "name": "deleted",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired after element is removed from DOM"
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
            "method": "selected",
            "name": "selected",
            "bubbles": true,
            "cancelable": false,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired after element receives focus"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get elementRef() { return "host"; }
    static get watchers() { return [{
            "propName": "clear",
            "methodName": "validateClear"
        }]; }
    static get listeners() { return [{
            "name": "click",
            "method": "onclick",
            "target": undefined,
            "capture": false,
            "passive": false
        }, {
            "name": "keydown",
            "method": "onKeyDown",
            "target": undefined,
            "capture": false,
            "passive": false
        }]; }
}
