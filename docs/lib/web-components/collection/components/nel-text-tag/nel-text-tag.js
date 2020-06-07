import { Component, Element, Event, h, Listen, Method, Prop } from "@stencil/core";
import { RGB } from "@buckneri/js-lib-color";
/**
 * Similar in function to mark element
 */
export class TextTag {
    constructor() {
        /**
         * Sets the background color of the element
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
         * Sets the text label  to be applied to the element
         */
        this.label = "";
        /**
         * If true, allows the element to receive focus
         */
        this.selectable = false;
    }
    componentDidLoad() {
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    onClick(ev) {
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
        if (this.deletable && (ev.code === "Backspace" || ev.code === "Delete")) {
            this.deleting.emit(this.host);
        }
    }
    /**
     * Removes element from DOM
     */
    async delete() {
        this.deleted.emit(this.host);
        const parent = this.host.parentNode;
        this.host.insertAdjacentText("beforebegin", this.host.textContent || "");
        parent.removeChild(this.host);
        parent.normalize();
        return Promise.resolve(true);
    }
    render() {
        const cls = this.selectable ? "selectable" : "";
        const tab = this.selectable ? 0 : undefined;
        const _foreColor = (new RGB(this.color)).brightness > RGB.brightnessThreshold
            ? "#000000"
            : "#ffffff";
        const styles = {
            "background-color": this.color,
            color: _foreColor
        };
        return (h("mark", { class: cls, tabindex: tab, style: styles },
            h("slot", null),
            h("span", null, this.label ? " " + this.label : "")));
    }
    static get is() { return "nel-text-tag"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-text-tag.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-text-tag.css"]
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
                "text": "Sets the background color of the element"
            },
            "attribute": "color",
            "reflect": true,
            "defaultValue": "\"#eeeeee\""
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
                "text": "Sets the text label  to be applied to the element"
            },
            "attribute": "label",
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
            "reflect": false
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
                "text": "Fired before element is removed from DOM"
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
            "cancelable": true,
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
    static get methods() { return {
        "delete": {
            "complexType": {
                "signature": "() => Promise<boolean>",
                "parameters": [],
                "references": {
                    "Promise": {
                        "location": "global"
                    }
                },
                "return": "Promise<boolean>"
            },
            "docs": {
                "text": "Removes element from DOM",
                "tags": []
            }
        }
    }; }
    static get elementRef() { return "host"; }
    static get listeners() { return [{
            "name": "click",
            "method": "onClick",
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
