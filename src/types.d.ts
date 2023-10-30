import { KeyCombination } from './key-binding';

export type KeyBindingMap = {
    [action: string]: KeyCombination;
};

export type Message<TData = Record<string, unknown>> = {
    request: 'load-map' | 'save-map' | 'reload-map';
    data?: TData;
};

export type KeyboardEventListener = (this: Node, event: KeyboardEvent) => void;

export type FocusoutEventListener = (this: Node, event: FocusEvent) => void;
