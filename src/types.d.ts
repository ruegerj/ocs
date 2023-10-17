export type KeyMap = {
    [action: string]: KeyBinding;
};

export type KeyBinding = {
    keyCode: number;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
};

export type KeyboardEventListener = (this: Node, event: KeyboardEvent) => void;

export type FocusoutEventListener = (this: Node, event: FocusEvent) => void;
