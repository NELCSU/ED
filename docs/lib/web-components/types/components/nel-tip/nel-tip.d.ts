import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Displays a content tooltip
 */
export declare class Tip implements ComponentInterface {
    private host;
    private _for;
    private _left;
    private _padding;
    private _panel;
    private _pause;
    private _paused;
    private _pointer;
    private _position;
    private _progress;
    private _progressCount;
    private _timerProgress;
    private _tip;
    private _top;
    /**
     * Hides the visible tip after n milliseconds. 0 (disabled) is default
     */
    expires: number;
    validateExpires(): void;
    /**
     * If true, element is visible
     */
    for: string;
    validateFor(): void;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * If true, element is visible
     */
    show: boolean;
    validateShow(): void;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    /**
     * Fired after element is activated
     */
    changed: EventEmitter;
    componentDidLoad(): void;
    componentWillLoad(): void;
    private _clearTimer;
    private _startTimer;
    render(): JSX.NelTip;
}
