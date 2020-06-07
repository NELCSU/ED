import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Displays content when network connectivity is interrupted
 */
export declare class NetworkConnection implements ComponentInterface {
    private host;
    /**
     * If true, content within element remains hidden
     */
    available: boolean;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * Fired after network status change
     */
    changed: EventEmitter;
    componentDidLoad(): any;
    componentWillLoad(): void;
    onOnline(): void;
    onOffline(): void;
    render(): JSX.NelNetworkConnection;
}
