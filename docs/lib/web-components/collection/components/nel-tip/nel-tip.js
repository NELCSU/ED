import { Component, Element, Event, h, Host, Prop, Watch } from "@stencil/core";
import { positionPop } from "@buckneri/spline";
/**
 * Displays a content tooltip
 */
export class Tip {
    constructor() {
        this._left = 0;
        this._padding = 20;
        this._paused = false;
        this._pointer = "";
        this._position = { orientX: "left", orientY: "top", x: -1, y: -1 };
        this._top = 0;
        /**
         * Hides the visible tip after n milliseconds. 0 (disabled) is default
         */
        this.expires = 0;
        /**
         * If true, element is visible
         */
        this.for = "";
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        /**
         * If true, element is visible
         */
        this.show = false;
    }
    validateExpires() {
        this._progressCount = 0;
        if (this.expires) {
            this._panel.classList.remove("hidden");
            this._progress.classList.remove("hidden");
        }
        else {
            this._panel.classList.add("hidden");
            this._progress.classList.add("hidden");
        }
    }
    validateFor() {
        if (this.for) {
            this._for = document.getElementById(this.for);
            this._position = positionPop(this._for, this._tip);
            let adjLeft = this._position.orientY === "middle"
                ? (this._position.orientX === "left" ? -this._padding : this._padding) * 0.5
                : (this._position.orientX === "left" ? this._padding : -this._padding) * 1.5;
            let adjTop = this._position.orientY === "top"
                ? -this._padding
                : this._position.orientY === "bottom"
                    ? this._padding
                    : 0;
            this._top = this._position.y + adjTop;
            this._left = this._position.x + adjLeft;
            this._pointer = `${this._position.orientY}-${this._position.orientX}`;
        }
    }
    validateShow() {
        this._tip.style.opacity = this.show ? "1" : "0";
        if (this.show) {
            this._startTimer();
        }
        else {
            this._clearTimer();
        }
        this.changed.emit(this.host);
    }
    componentDidLoad() {
        this.loaded.emit(this.host);
        this._tip = this.host.shadowRoot.querySelector(".tip");
        this._panel = this._tip.querySelector(".tip-panel");
        this._progress = this._tip.querySelector(".tip-progress");
        this._pause = this._panel.querySelector(".tip-action");
        this._pause.addEventListener("click", () => {
            if (this._paused) {
                this._startTimer();
                this._paused = false;
            }
            else {
                this._pause.textContent = "resume";
                this._paused = true;
                clearInterval(this._timerProgress);
                this._timerProgress = null;
            }
        });
    }
    componentWillLoad() {
        this.ready = true;
    }
    _clearTimer() {
        clearInterval(this._timerProgress);
        this._paused = false;
        this._timerProgress = null;
    }
    _startTimer() {
        if (this.show && this.expires) {
            this._pause.textContent = "pause";
            if (!this._paused) {
                this._progressCount = this.expires / 100;
                this._progress.max = this.expires;
                this._progress.value = 0;
            }
            this._timerProgress = setInterval(() => {
                this._progress.value += this._progressCount;
                if (this._progress.value >= this._progress.max) {
                    this._clearTimer();
                    this.show = false;
                }
            }, this._progressCount);
        }
    }
    render() {
        const pos = { left: `${this._left}px`, top: `${this._top}px` };
        const cls = `tip`;
        const clsWrapper = `tip-wrapper ${this._pointer}`;
        const clsPanel = `tip-panel${this.expires ? "" : " hidden"}`;
        const clsBar = `tip-progress${this.expires ? "" : " hidden"} ${this._position.orientY}`;
        return (h(Host, null,
            h("div", { class: cls, style: pos },
                h("div", { class: clsWrapper },
                    h("progress", { class: clsBar, max: "100", value: "0" }),
                    h("div", { class: "tip-message" },
                        h("slot", null)),
                    h("div", { class: clsPanel },
                        h("span", { class: "tip-action" }, "pause"))))));
    }
    static get is() { return "nel-tip"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["nel-tip.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["nel-tip.css"]
    }; }
    static get properties() { return {
        "expires": {
            "type": "number",
            "mutable": true,
            "complexType": {
                "original": "number",
                "resolved": "number",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "Hides the visible tip after n milliseconds. 0 (disabled) is default"
            },
            "attribute": "expires",
            "reflect": true,
            "defaultValue": "0"
        },
        "for": {
            "type": "string",
            "mutable": true,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": "If true, element is visible"
            },
            "attribute": "for",
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
        "show": {
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
                "text": "If true, element is visible"
            },
            "attribute": "show",
            "reflect": true,
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
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": "Fired after element is activated"
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
    static get elementRef() { return "host"; }
    static get watchers() { return [{
            "propName": "expires",
            "methodName": "validateExpires"
        }, {
            "propName": "for",
            "methodName": "validateFor"
        }, {
            "propName": "show",
            "methodName": "validateShow"
        }]; }
}
