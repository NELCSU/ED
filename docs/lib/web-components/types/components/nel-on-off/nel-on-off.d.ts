import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Similar in behaviour to the checkbox (without indeterminate state)
 */
export declare class OnOff implements ComponentInterface {
    private host;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    disabled: boolean;
    /**
     * If true, element is in the 'on' state
     */
    on: boolean;
    validateOpen(): void;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * Adjusts the size of the element, using CSS rem units of measurement
     */
    size: number;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    /**
     * Fired after element is toggled
     */
    changed: EventEmitter;
    componentDidLoad(): void;
    componentWillLoad(): void;
    onClick(): void;
    render(): JSX.NelOnOff;
}
