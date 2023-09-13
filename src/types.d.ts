export type KeyMap = {
    [key: number]: {
        action: string;
        ctrl?: boolean;
        alt?: boolean;
        shift?: boolean;
    };
};
