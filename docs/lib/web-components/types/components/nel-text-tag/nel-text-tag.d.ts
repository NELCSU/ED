import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Similar in function to mark element
 */
export declare class TextTag implements ComponentInterface {
    private host;
    /**
     * Sets the background color of the element
     */
    color: string;
    /**
     * If true, allows the element to be delete using keyboard
     */
    deletable: boolean;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    disabled: boolean;
    /**
     * Sets the text label  to be applied to the element
     */
    label: string;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * If true, allows the element to receive focus
     */
    selectable: boolean;
    /**
     * Fired before element is removed from DOM
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
    componentDidLoad(): void;
    componentWillLoad(): void;
    onClick(ev: MouseEvent): void;
    onKeyDown(ev: KeyboardEvent): void;
    /**
     * Removes element from DOM
     */
    delete(): Promise<boolean>;
    render(): JSX.NelTextTag;
}
