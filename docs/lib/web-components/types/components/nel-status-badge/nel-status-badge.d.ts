import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Displays a status badge
 */
export declare class StatusBadge implements ComponentInterface {
    private host;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    disabled: boolean;
    /**
     * Sets the text label to be applied to the element
     */
    label: string;
    /**
     * Sets the prefix label to be applied to the element
     */
    pre: string;
    /**
     * Sets the Red-Amber-Green icon to be applied to the element
     */
    rag: number;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * Sets the suffix label to be applied to the element
     */
    suf: string;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    componentDidLoad(): void;
    componentWillLoad(): void;
    render(): JSX.NelStatusBadge;
}
