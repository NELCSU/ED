import { Component, Element, Event, h, Listen, Prop, Watch } from "@stencil/core";
/**
 * Similar in function to detail/summary elements
 */
export class ExpandItem {
    constructor() {
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.disabled = false;
        /**
         * If true, main contents of element are visible
         */
        this.open = false;
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        /**
         * Adjusts the size of the marker, using CSS rem units of measurement
         */
        this.size = 2;
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
        const su = this.host.shadowRoot.querySelector("summary");
        const dt = this.host.shadowRoot.querySelector("details");
        su.addEventListener("click", (ev) => {
            if (this.disabled) {
                ev.preventDefault();
                ev.stopPropagation();
                return false;
            }
            return true;
        });
        dt.addEventListener("toggle", (ev) => {
            ev.preventDefault();
            ev.stopImmediatePropagation();
            return false;
        });
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    onClick(ev) {
        if (this.disabled) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
        this.open = !this.host.open;
        return true;
    }
    onKeyDown(ev) {
        if (this.disabled) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
        if (ev.keyCode === 229) {
            return false;
        }
        switch (ev.code) {
            case "Space":
                this.open = !this.open;
                break;
        }
        return true;
    }
    render() {
        const tab = this.disabled ? undefined : 0;
        const contentStyle = {
            padding: `0.75rem 0.75rem 0.75rem ${this.size + 1.5}rem`
        };
        const iconStyle = {
            "background-image": this.open
                ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' height='${this.size}rem' width='${this.size}rem' aria-hidden='true'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23005eb8'%3E%3C/circle%3E%3Cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M8 12h8'%3E%3C/path%3E%3C/svg%3E%0A")`
                : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' height='${this.size}rem' width='${this.size}rem' aria-hidden='true'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23005eb8'%3E%3C/circle%3E%3Cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M12 8v8M8 12h8'%3E%3C/path%3E%3C/svg%3E%0A")`,
            "background-position": "center",
            "background-repeat": "no-repeat",
            "border-radius": "50%",
            height: `${this.size}rem`,
            width: `${this.size}rem`
        };
        return (h("details", { tabindex: tab, open: this.open },
            h("summary", { role: "button", tabindex: "-1" },
                h("div", { class: "icon", style: iconStyle },
                    h("slot", { name: "icon" })),
                h("div", { class: "title" },
                    h("slot", { name: "title" }))),
            h("div", { style: contentStyle },
                h("slot", { name: "content" }))));
    }
    static get is() { return "nel-expand-item"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-expand-item.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-expand-item.css"]
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
        "open": {
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
                "text": "If true, main contents of element are visible"
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
                "text": "Adjusts the size of the marker, using CSS rem units of measurement"
            },
            "attribute": "size",
            "reflect": true,
            "defaultValue": "2"
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
