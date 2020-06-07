import { Component, Element, Event, h, Listen, Prop, Watch } from "@stencil/core";
import { Slicer as _Slicer, SlicerModifier } from "@buckneri/js-lib-slicer";
/**
 * Organises child elements vertically or horizontally
 */
export class Slicer {
    constructor() {
        this._slicer = new _Slicer();
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.clear = false;
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.disabled = false;
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
    }
    validateClear(newValue) {
        if (newValue) {
            this._slicer.clear();
            for (let el of Array.from(this.host.children)) {
                el.classList.remove("filtered");
                el.classList.remove("selected");
            }
            this.clear = false;
            this.cleared.emit(this.host);
        }
    }
    componentDidLoad() {
        const obs = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; ++i) {
                for (let j = 0; j < mutations[i].addedNodes.length; ++j) {
                    const el = mutations[i].addedNodes[j];
                    if (el.classList.contains("slicer-item")) {
                        const item = el.textContent;
                        if (this._slicer.has(item)) {
                            if (el && el.parentNode) {
                                el.parentNode.removeChild(el);
                            }
                            this.errored.emit(`Duplicate entry detected: ${item}`);
                        }
                        else {
                            this._slicer.add(item);
                        }
                    }
                }
            }
        });
        obs.observe(this.host, { childList: true });
        for (let el of Array.from(this.host.children)) {
            this._slicer.add(el.textContent);
        }
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    onclick(ev) {
        if (this.disabled) {
            ev.preventDefault();
            return;
        }
        const el = ev.target;
        if (el.classList.contains("slicer-item")) {
            this._slicer.toggle(el.textContent, ev.shiftKey
                ? SlicerModifier.SHIFT_KEY
                : ev.ctrlKey
                    ? SlicerModifier.CTRL_KEY
                    : SlicerModifier.NO_KEY);
            const selection = this._slicer.selection;
            if (selection.length === 0) {
                this.clear = true;
            }
            else {
                for (let el of Array.from(this.host.children)) {
                    if (selection.indexOf(el.textContent) === -1) {
                        el.classList.add("filtered");
                        el.classList.remove("selected");
                    }
                    else {
                        el.classList.remove("filtered");
                        el.classList.add("selected");
                    }
                }
            }
            this.selected.emit(selection);
        }
    }
    render() {
        const tab = this.disabled ? undefined : 0;
        return (h("div", { class: "slicer", tabindex: tab },
            h("slot", null)));
    }
    static get is() { return "nel-slicer"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-slicer.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-slicer.css"]
    }; }
    static get properties() { return {
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
                "text": "If false, element is partly greyed out and not responding to user input"
            },
            "attribute": "clear",
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
            "method": "errored",
            "name": "errored",
            "bubbles": true,
            "cancelable": false,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired when error occurs"
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
                "text": "Fired when slicer item state changes occur"
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
        }]; }
}
