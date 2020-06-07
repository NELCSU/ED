import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Organises child elements vertically or horizontally
 */
export declare class ItemCollection implements ComponentInterface {
    private host;
    /**
     * Aligns child elements within collection. Defaults to vertical list.
     */
    align: "horizontal" | "vertical";
    validateHAlign(newValue: "horizontal" | "vertical"): void;
    /**
     * Clears out all child elements from collection
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
     * Displays the element resize handle (bottom right corner) if true
     */
    resizable: boolean;
    /**
     * Sorts child elements in collection based on text content
     */
    sort: "ASC" | "DESC";
    validateSort(newValue: "ASC" | "DESC"): void;
    /**
     * Fired after child elements are removed via clear() method
     */
    cleared: EventEmitter;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    /**
     * Fired after child elements are sorted
     */
    sorted: EventEmitter;
    componentDidLoad(): any;
    componentWillLoad(): void;
    render(): JSX.NelItemCollection;
}
