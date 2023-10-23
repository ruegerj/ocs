export type KeyMap = {
    [action: string]: KeyBinding;
};

export type KeyBinding = {
    keyCode: number;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
};

export type Message<TData = Record<string, unknown>> = {
    request: 'load-map' | 'save-map';
    data?: TData;
};

export type KeyboardEventListener = (this: Node, event: KeyboardEvent) => void;

export type FocusoutEventListener = (this: Node, event: FocusEvent) => void;
