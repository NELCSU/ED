import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Organises child elements vertically or horizontally
 */
export declare class Slicer implements ComponentInterface {
    private _slicer;
    private host;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    clear: boolean;
    validateClear(newValue: boolean): void;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    disabled: boolean;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * Fired after child elements are removed via clear() method
     */
    cleared: EventEmitter;
    /**
     * Fired when error occurs
     */
    errored: EventEmitter;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    /**
     * Fired when slicer item state changes occur
     */
    selected: EventEmitter;
    componentDidLoad(): any;
    componentWillLoad(): void;
    onclick(ev: MouseEvent): void;
    render(): JSX.NelSlicer;
}
