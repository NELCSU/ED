import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
/**
 * Similar in behaviour to li element
 */
export declare class ListItem implements ComponentInterface {
    host: HTMLElement;
    /**
     * Sets the bullet color of the element. Default is #eeeeee
     */
    color: string;
    /**
     * Removes element from DOM
     */
    clear: boolean;
    validateClear(newValue: boolean): void;
    /**
     * If true, allows the element to be delete using keyboard
     */
    deletable: boolean;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    disabled: boolean;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * If true, allows the element to receive focus
     */
    selectable: boolean;
    /**
     * Fired when delete key pressed on selected element
     */
    deleting: EventEmitter;
    /**
     * Fired after element is removed from DOM
     */
    deleted: EventEmitter;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    /**
     * Fired after element receives focus
     */
    selected: EventEmitter;
    componentDidLoad(): any;
    componentWillLoad(): void;
    onclick(ev: MouseEvent): void;
    onKeyDown(ev: KeyboardEvent): void;
    render(): any;
}
