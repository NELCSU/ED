import { EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Similar in function to detail/summary elements
 */
export declare class ExpandItem {
    private host;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    disabled: boolean;
    /**
     * If true, main contents of element are visible
     */
    open: boolean;
    validateOpen(newValue: string): void;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * Adjusts the size of the marker, using CSS rem units of measurement
     */
    size: number;
    /**
     * Fired when element's open property is false either via UI or programmatically
     */
    closed: EventEmitter;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    /**
     * Fired when element's open property is true either via UI or programmatically
     */
    opened: EventEmitter;
    componentDidLoad(): any;
    componentWillLoad(): void;
    onClick(ev: MouseEvent): boolean;
    onKeyDown(ev: KeyboardEvent): boolean;
    render(): JSX.NelExpandItem;
}
