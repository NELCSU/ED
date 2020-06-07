import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Displays a modal background for displaying messages above page content
 */
export declare class ModalView implements ComponentInterface {
    private host;
    /**
     * Aligns child elements. Defaults to center of viewport.
     */
    align: "bottom" | "center" | "top";
    /**
     * If true, displays the modal element
     */
    open: boolean;
    validateOpen(newValue: string): void;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
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
    componentWillRender(): any;
    render(): JSX.NelModalView;
}
