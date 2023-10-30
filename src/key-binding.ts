export class KeyCombination {
    public static empty(): KeyCombination {
        return new KeyCombination(-1);
    }

    public static fromEvent(event: KeyboardEvent): KeyCombination {
        return new KeyCombination(
            event.keyCode,
            event.ctrlKey,
            event.altKey,
            event.shiftKey,
        );
    }

    constructor(
        public keyCode: number,
        public ctrl?: boolean,
        public alt?: boolean,
        public shift?: boolean,
    ) {}
}
