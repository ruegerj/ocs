export type KeyMap = {
    [action: string]: KeyBinding;
};

export type KeyBinding = {
    keyCode: number;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
};
