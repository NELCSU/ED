import { r as registerInstance, c as createEvent, h, g as getElement, H as Host } from './index-7913bf81.js';

const ExpandItem = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        this.closed = createEvent(this, "closed", 7);
        this.loaded = createEvent(this, "loaded", 6);
        this.opened = createEvent(this, "opened", 7);
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
        return (h("details", { tabindex: tab, open: this.open }, h("summary", { role: "button", tabindex: "-1" }, h("div", { class: "icon", style: iconStyle }, h("slot", { name: "icon" })), h("div", { class: "title" }, h("slot", { name: "title" }))), h("div", { style: contentStyle }, h("slot", { name: "content" }))));
    }
    get host() { return getElement(this); }
    static get watchers() { return {
        "open": ["validateOpen"]
    }; }
    static get style() { return ":host{width:100%}:host([disabled]),:host([disabled])>details{cursor:not-allowed;opacity:0.5;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host([hidden]){display:none !important}details{display:block;line-height:1.5;margin-bottom:8px;width:100%}summary{-ms-flex-align:center;align-items:center;cursor:pointer;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;padding:0.5rem 0.5rem 0.5rem 1rem}summary:focus{outline:none}summary::-webkit-details-marker{display:none}.title{width:100%}.title>::slotted(*){-ms-flex-align:center;align-items:center;display:-ms-flexbox;display:flex;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-pack:justify;justify-content:space-between;padding-left:10px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}"; }
};

const ItemCollection = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        this.cleared = createEvent(this, "cleared", 6);
        this.loaded = createEvent(this, "loaded", 6);
        this.sorted = createEvent(this, "sorted", 6);
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
        return (h("div", { class: cls, tabindex: tab }, h("slot", null)));
    }
    get host() { return getElement(this); }
    static get watchers() { return {
        "align": ["validateHAlign"],
        "clear": ["validateClear"],
        "sort": ["validateSort"]
    }; }
    static get style() { return ":host{max-height:inherit;max-width:inherit}:host([disabled]),:host([disabled])>.item-collection{cursor:not-allowed;opacity:0.5;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host([hidden]){display:none !important}.item-collection:focus{outline:none}.item-collection{-webkit-box-sizing:border-box;box-sizing:border-box;display:-ms-flexbox;display:flex;height:100%;max-height:inherit;min-width:inherit;min-height:1rem;min-width:4rem;width:100%}.horizontal{-ms-flex-align:start;align-items:flex-start;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-pack:start;justify-content:flex-start;overflow-x:auto;overflow-y:hidden}.resize-horizontal:focus{border:dashed 1px #ccc;resize:horizontal}.resize-vertical:focus{border:dashed 1px #ccc;resize:vertical}.vertical{-ms-flex-align:start;align-items:flex-start;-ms-flex-flow:column nowrap;flex-flow:column nowrap;-ms-flex-pack:start;justify-content:flex-start;overflow-x:hidden;overflow-y:auto}"; }
};

const ListItem = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        this.deleting = createEvent(this, "deleting", 7);
        this.deleted = createEvent(this, "deleted", 7);
        this.loaded = createEvent(this, "loaded", 6);
        this.selected = createEvent(this, "selected", 6);
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
        return (h("div", { class: "list-item", tabindex: tab }, h("div", { class: bcls, style: bst }), h("div", { class: tcls }, h("slot", null))));
    }
    get host() { return getElement(this); }
    static get watchers() { return {
        "clear": ["validateClear"]
    }; }
    static get style() { return ":host{max-height:inherit;max-width:inherit}:host([disabled]){cursor:not-allowed;opacity:0.5;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host([hidden]){display:none !important}.selectable{cursor:pointer}.list-item{-ms-flex-line-pack:center;align-content:center;-ms-flex-align:center;align-items:center;display:-ms-flexbox;display:flex;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-pack:start;justify-content:flex-start;margin:1px}.bullet{border-radius:50%;display:inline-block;height:0.8rem;width:0.8rem}.text{display:inline-block;margin-left:0.5rem}"; }
};

const ModalView = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        this.closed = createEvent(this, "closed", 7);
        this.loaded = createEvent(this, "loaded", 6);
        this.opened = createEvent(this, "opened", 7);
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
        return (h("div", { class: "modal-view" }, h("div", { class: cls }, h("slot", null))));
    }
    get host() { return getElement(this); }
    static get watchers() { return {
        "open": ["validateOpen"]
    }; }
    static get style() { return ":host{pointer-events:none}.modal-view{opacity:0;-webkit-transition:opacity 500ms;transition:opacity 500ms}:host([open]){pointer-events:auto}:host([open])>.modal-view{background-color:rgba(0, 0, 0, 0.5);bottom:0;display:block;left:0;opacity:1;position:fixed;right:0;top:0;-webkit-transition:opacity 500ms;transition:opacity 500ms;z-index:10000}.modal-content{position:absolute}.bottom{bottom:0%;left:50%;-webkit-transform:translate(-50%, 0%);transform:translate(-50%, 0%)}.center{left:50%;top:50%;-webkit-transform:translate(-50%, -50%);transform:translate(-50%, -50%)}.top{left:50%;top:0%;-webkit-transform:translate(-50%, 0%);transform:translate(-50%, 0%)}"; }
};

const NetworkConnection = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        /**
         * If true, content within element remains hidden
         */
        this.available = true;
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        this.loaded = createEvent(this, "loaded", 6);
        this.changed = createEvent(this, "changed", 6);
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
        return (h("div", { hidden: this.available }, h("slot", null)));
    }
    get host() { return getElement(this); }
    static get style() { return ":host([hidden]){display:none !important}"; }
};

const OnOff = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        this.loaded = createEvent(this, "loaded", 6);
        this.changed = createEvent(this, "changed", 7);
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
        return (h(Host, { "aria-checked": this.on ? "true" : "false" }, h("span", null, h("style", null, st), h("input", { type: "checkbox", checked: this.on, value: "" }))));
    }
    get host() { return getElement(this); }
    static get watchers() { return {
        "on": ["validateOpen"]
    }; }
    static get style() { return ":host{display:inline-block}:host([disabled]){cursor:not-allowed;opacity:0.5;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host([hidden]){display:none !important}input{-moz-appearance:none;-webkit-appearance:none;appearance:none;background-color:var(--bg-color, #eeeeee);border:1px solid var(--color, #999999);border-radius:2rem;cursor:pointer;outline:none;position:relative;-webkit-transition:background 450ms ease;transition:background 450ms ease}input:before,input:after{border-radius:100%;content:\"\";display:block;position:absolute;-webkit-transform:translate(-1px, -1px);transform:translate(-1px, -1px);transition:background 450ms ease, -webkit-transform 450ms ease;-webkit-transition:background 450ms ease, -webkit-transform 450ms ease;transition:background 450ms ease, transform 450ms ease;transition:background 450ms ease, transform 450ms ease, -webkit-transform 450ms ease}input:before{background-color:var(--color, #999999)}:host([on])>span>input{background-color:var(--bg-color-on, #555555);border-color:var(--color-on, #000000)}:host([on])>span>input:before{background-color:var(--color-on, #000000);-webkit-transform:translate(99%, -1px);transform:translate(99%, -1px)}"; }
};

var SlicerModifier;
(function (SlicerModifier) {
    SlicerModifier[SlicerModifier["NO_KEY"] = 0] = "NO_KEY";
    SlicerModifier[SlicerModifier["CTRL_KEY"] = 1] = "CTRL_KEY";
    SlicerModifier[SlicerModifier["SHIFT_KEY"] = 2] = "SHIFT_KEY";
})(SlicerModifier || (SlicerModifier = {}));
class Slicer {
    constructor(list) {
        this._ = new Map();
        this._selectionCount = 0;
        if (list) {
            if (Array.isArray(list)) {
                list.forEach((item) => {
                    if (!this._.has(item)) {
                        this._.set(item, { filtered: false, selected: false });
                    }
                });
            }
            else if (!this._.has(list)) {
                this._.set(list, { filtered: false, selected: false });
            }
        }
    }
    get members() {
        const result = [];
        this._.forEach((value, key) => {
            result.push(key);
        });
        return result;
    }
    get selection() {
        const result = [];
        if (this._selectionCount > 0) {
            this._.forEach((value, key) => {
                if (value.selected) {
                    result.push(key);
                }
            });
        }
        return result;
    }
    add(key) {
        if (!this._.has(key)) {
            let state = { filtered: false, selected: false };
            if (this._selectionCount > 0) {
                state.filtered = true;
            }
            this._.set(key, state);
        }
        return this;
    }
    clear() {
        this._.forEach((_, key) => {
            this._.set(key, { filtered: false, selected: false });
        });
        this._selectionCount = 0;
        this.lastSelection = undefined;
        return this;
    }
    has(key) {
        return this._.has(key);
    }
    remove(key) {
        const state = this._.get(key);
        if (state && state.selected) {
            --this._selectionCount;
        }
        this._.delete(key);
        if (this._selectionCount === 0) {
            this.clear();
        }
        else if (this.lastSelection === key) {
            this.lastSelection = this.selection[0];
        }
        return this;
    }
    toggle(item, modifier = SlicerModifier.NO_KEY) {
        if (modifier === SlicerModifier.SHIFT_KEY) {
            return this.toggleRange(item);
        }
        else if (modifier === SlicerModifier.CTRL_KEY) {
            return this.toggleCumulative(item);
        }
        else {
            return this.toggleSingle(item);
        }
    }
    toggleCumulative(key) {
        const state = this._.get(key);
        if (state) {
            state.selected = !state.selected;
            if (state.selected) {
                ++this._selectionCount;
            }
            else {
                --this._selectionCount;
            }
            this._.set(key, state);
        }
        if (this._selectionCount === 0 || this._selectionCount === this._.size) {
            this.clear();
        }
        else {
            this._.forEach((value, key) => {
                value.filtered = !value.selected;
                this._.set(key, value);
            });
            this.lastSelection = key;
        }
        return this;
    }
    toggleRange(item) {
        if (item === this.lastSelection) {
            this.clear();
        }
        else {
            let state = 0;
            this._selectionCount = 0;
            this._.forEach((value, key) => {
                if (state === 1) {
                    if (item === key || this.lastSelection === key) {
                        state = -1;
                    }
                    if (this.lastSelection === undefined) {
                        state = -1;
                        value = { filtered: true, selected: false };
                    }
                    else {
                        value = { filtered: false, selected: true };
                        ++this._selectionCount;
                    }
                }
                else if (state === 0) {
                    if (item === key || this.lastSelection === key) {
                        state = 1;
                        value = { filtered: false, selected: true };
                        ++this._selectionCount;
                    }
                    else {
                        value = { filtered: true, selected: false };
                    }
                }
                else {
                    value = { filtered: true, selected: false };
                }
                this._.set(key, value);
            });
            this.lastSelection = item;
            if (this._selectionCount === 0 || this._selectionCount === this._.size) {
                this.clear();
            }
        }
        return this;
    }
    toggleSingle(item) {
        const state = this._.get(item);
        if (state) {
            if (state.selected) {
                this.clear();
            }
            else {
                this._.forEach((value, key) => {
                    if (item === key) {
                        value.selected = !value.selected;
                        value.filtered = !value.selected;
                    }
                    else {
                        value = { filtered: true, selected: false };
                    }
                    this._.set(key, value);
                });
                this._selectionCount = 1;
                this.lastSelection = item;
            }
        }
        return this;
    }
}

const Slicer$1 = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._slicer = new Slicer();
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
        this.cleared = createEvent(this, "cleared", 6);
        this.errored = createEvent(this, "errored", 6);
        this.loaded = createEvent(this, "loaded", 6);
        this.selected = createEvent(this, "selected", 6);
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
        return (h("div", { class: "slicer", tabindex: tab }, h("slot", null)));
    }
    get host() { return getElement(this); }
    static get watchers() { return {
        "clear": ["validateClear"]
    }; }
    static get style() { return ":host{max-height:inherit;max-width:inherit}:host([disabled]),:host([disabled])>.slicer{cursor:not-allowed;opacity:0.5;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host([hidden]){display:none !important}.slicer{-ms-flex-align:stretch;align-items:stretch;border-color:var(--border-color, #000);border-style:var(--border-style, solid);border-width:var(--border-width, 1px);-webkit-box-sizing:border-box;box-sizing:border-box;display:-ms-flexbox;display:flex;-ms-flex-flow:column nowrap;flex-flow:column nowrap;-ms-flex-positive:1;flex-grow:1;-ms-flex-pack:start;justify-content:flex-start;max-height:inherit;min-width:inherit;min-height:1rem;min-width:4rem;overflow-x:hidden;overflow-y:auto;padding:var(--padding, 10px);width:var(--width, 100%)}.slicer:focus{outline:none}::slotted(.slicer-item){cursor:pointer;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}"; }
};

const StatusBadge = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        this.loaded = createEvent(this, "loaded", 6);
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
        return (h("div", { class: "status-badge" }, h("div", { class: "icon" }, h("div", { class: ico })), h("div", { class: "text" }, h("span", null, this.pre), h("slot", null), h("span", null, this.suf)), h("div", { class: "label" }, this.label ? " " + this.label : "")));
    }
    get host() { return getElement(this); }
    static get style() { return ":host([disabled]){cursor:not-allowed;opacity:0.5;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host([hidden]){display:none !important}.status-badge{-ms-flex-align:center;align-items:center;background-color:var(--background-color, #fff);border:1px solid var(--color, #330066);color:var(--color, #330066);display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;height:var(--height, 8rem);-ms-flex-pack:justify;justify-content:space-between;margin:0.25rem;padding:0.25rem;width:var(--width, 8rem)}.status-badge>.icon{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;-ms-flex-pack:end;justify-content:flex-end;width:100%}.status-badge>.label{font-variant-caps:all-small-caps;font-size:1.2rem;font-weight:bold}.status-badge>.text{font-size:2rem}.diamond{border:0.5rem solid transparent;border-bottom-color:#ff0000;height:0;position:relative;top:-0.5rem;width:0}.diamond:after{content:\"\";border:0.5rem solid transparent;border-top-color:#ff0000;height:0;left:-0.5rem;position:absolute;top:0.5rem;width:0}.triangle{width:0;height:0;border-left:0.5rem solid transparent;border-right:0.5rem solid transparent;border-bottom:1rem solid #ffd700}.circle{background:#009900;border-radius:50%;height:1rem;width:1rem}"; }
};

const TextInput = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this._mask = /.*/gi;
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.cleartext = true;
        /**
         * If false, element is partly greyed out and not responding to user input
         */
        this.disabled = false;
        /**
         * Sets a regular expression to restrict data entry to allowed characters
         */
        this.mask = "";
        /**
         * Maximum length of text entry
         */
        this.maxlength = -1;
        /**
         * Minimum length of text entry
         */
        this.minlength = -1;
        /**
         * Sets a regular expression to validate text
         */
        this.pattern = "";
        /**
         * Sets a visual text prompt as a palceholder within text box
         */
        this.placeholder = "";
        /**
         * True when element can correctly respond to external programmatic access
         */
        this.ready = false;
        /**
         * Width of text entry
         */
        this.width = 20;
        this.loaded = createEvent(this, "loaded", 6);
    }
    validateMask(newValue) {
        this._mask = new RegExp(newValue);
    }
    componentDidLoad() {
        this._input = this.host.shadowRoot.querySelector("input");
        this._mask = new RegExp(this.mask);
        this.loaded.emit(this.host);
    }
    componentWillLoad() {
        this.ready = true;
    }
    onInput() {
        this.value = this._input.value;
    }
    onKeyDown(ev) {
        if (this.disabled || ev.keyCode === 229) {
            return false;
        }
        if (!this._editKeyPressed(ev) && !this._mask.test(ev.key)) {
            ev.preventDefault();
            ev.stopPropagation();
            return false;
        }
        return true;
    }
    onPaste(ev) {
        if (!this.disabled && ev.clipboardData) {
            const paste = ev.clipboardData.getData("text/plain");
            if (!this._mask.test(paste)) {
                ev.preventDefault();
                ev.stopPropagation();
                return false;
            }
            return true;
        }
        return false;
    }
    onSearch() {
        const input = new InputEvent("input", { bubbles: true, cancelable: true });
        this.host.dispatchEvent(input);
    }
    _editKeyPressed(ev) {
        return ev.code === "Delete" || ev.code === "Backspace" ||
            ev.code === "ArrowLeft" || ev.code === "ArrowRight";
    }
    render() {
        return (h("input", { type: this.cleartext ? "search" : "password", maxlength: this.maxlength, minlength: this.minlength, pattern: this.pattern, placeholder: this.placeholder, size: this.width, value: this.value }));
    }
    get host() { return getElement(this); }
    static get watchers() { return {
        "mask": ["validateMask"]
    }; }
    static get style() { return ":host([disabled]){cursor:not-allowed;opacity:0.5;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host([hidden]){display:none !important}input{border:2px solid #aaa;-webkit-box-sizing:border-box;box-sizing:border-box;padding:4px;outline:transparent;-webkit-transition:border-color 0.25s ease, color 0.25s ease;transition:border-color 0.25s ease, color 0.25s ease;z-index:9}input:focus{border:2px solid #000}input::-webkit-input-placeholder{color:#aaa}input::-moz-placeholder{color:#aaa}input:-ms-input-placeholder{color:#aaa}input::-ms-input-placeholder{color:#aaa}input::placeholder{color:#aaa}input::-webkit-search-cancel-button{cursor:pointer}"; }
};

class RGB {
    constructor(value) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        value = value.toLowerCase().replace("#", "");
        let n;
        if (RGB.CSS[value] === undefined) {
            if (value.length === 3) {
                const r = value.substr(0, 1);
                this.r = this._n(parseInt(`${r}${r}`, 16));
                const g = value.substr(1, 1);
                this.g = this._n(parseInt(`${g}${g}`, 16));
                const b = value.substr(2, 1);
                this.b = this._n(parseInt(`${b}${b}`, 16));
            }
            else if (value.length === 6) {
                n = parseInt(value, 16);
                this.r = this._n(this._rshift(n));
                this.g = this._n(this._gshift(n));
                this.b = this._n(this._bshift(n));
            }
        }
        else {
            n = RGB.CSS[value];
            this.r = this._n(this._rshift(n));
            this.g = this._n(this._gshift(n));
            this.b = this._n(this._bshift(n));
        }
    }
    get brightness() {
        return (this.r * 299 + this.g * 587 + this.b * 114) / 1000;
    }
    colorDifference(compare) {
        return (Math.max(this.r, compare.r) - Math.min(this.r, compare.r)) +
            (Math.max(this.g, compare.g) - Math.min(this.g, compare.g)) +
            (Math.max(this.b, compare.b) - Math.min(this.b, compare.b));
    }
    toCSSString() {
        const value = parseInt(this.toHex(), 16);
        return Object.keys(RGB.CSS).find(key => RGB.CSS[key] === value);
    }
    toHex() {
        return this._hex(this.r) + this._hex(this.g) + this._hex(this.b);
    }
    toString() {
        return "#" + this.toHex();
    }
    _rshift(n) {
        return n >> 16 & 0xff;
    }
    _gshift(n) {
        return n >> 8 & 0xff;
    }
    _bshift(n) {
        return n >> 0 & 0xff;
    }
    _hex(value) {
        return (value < 16 ? "0" : "") + value.toString(16);
    }
    _n(n) {
        return n > 255 ? 255 : n < 0 ? 0 : n;
    }
}
RGB.brightnessThreshold = 125;
RGB.CSS = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
};
RGB.differenceThreshold = 500;

const TextTag = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        this.deleting = createEvent(this, "deleting", 7);
        this.deleted = createEvent(this, "deleted", 7);
        this.loaded = createEvent(this, "loaded", 6);
        this.selected = createEvent(this, "selected", 7);
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
        return (h("mark", { class: cls, tabindex: tab, style: styles }, h("slot", null), h("span", null, this.label ? " " + this.label : "")));
    }
    get host() { return getElement(this); }
    static get style() { return ":host([disabled]),:host([disabled])>mark{cursor:not-allowed;opacity:0.5;pointer-events:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host([hidden]){display:none !important}.selectable{cursor:pointer}.text-tag:focus{-webkit-box-shadow:0 0 0 4px #ffcd60;box-shadow:0 0 0 4px #ffcd60;outline:none}mark{-webkit-box-decoration-break:clone;border-radius:0.35em;box-decoration-break:clone;line-height:1.3rem;margin:auto 0.25rem;padding:0.2em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}mark>span{font-size:0.7em;font-weight:bold;text-transform:uppercase}"; }
};

export { ExpandItem as nel_expand_item, ItemCollection as nel_item_collection, ListItem as nel_list_item, ModalView as nel_modal_view, NetworkConnection as nel_network_connection, OnOff as nel_on_off, Slicer$1 as nel_slicer, StatusBadge as nel_status_badge, TextInput as nel_text_input, TextTag as nel_text_tag };
