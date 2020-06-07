import { ComponentInterface, EventEmitter } from "../../stencil-public-runtime";
import { JSX } from "../../components";
/**
 * Similar in behaviour to the input element
 */
export declare class TextInput implements ComponentInterface {
    private _input;
    private _mask;
    private host;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    cleartext: boolean;
    /**
     * If false, element is partly greyed out and not responding to user input
     */
    disabled: boolean;
    /**
     * Sets a regular expression to restrict data entry to allowed characters
     */
    mask: string;
    validateMask(newValue: string): void;
    /**
     * Maximum length of text entry
     */
    maxlength: number;
    /**
     * Minimum length of text entry
     */
    minlength: number;
    /**
     * Sets a regular expression to validate text
     */
    pattern: string;
    /**
     * Sets a visual text prompt as a palceholder within text box
     */
    placeholder: string;
    /**
     * True when element can correctly respond to external programmatic access
     */
    ready: boolean;
    /**
     * Sets the value of the text box
     */
    value: string;
    /**
     * Width of text entry
     */
    width: number;
    /**
     * Fired when element can correctly respond to external programmatic access
     */
    loaded: EventEmitter;
    componentDidLoad(): void;
    componentWillLoad(): void;
    onInput(): void;
    onKeyDown(ev: KeyboardEvent): boolean;
    onPaste(ev: ClipboardEvent): boolean;
    onSearch(): void;
    private _editKeyPressed;
    render(): JSX.NelTextInput;
}
