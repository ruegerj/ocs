export const SHIFT = 16;
export const CTRL = 17;
export const ALT = 18;

const MODIFIER_KEYS = [SHIFT, CTRL, ALT];

const KEY_DISPLAY_NAME_LOOKUP = new Map<number, string>([
    [16, 'Shift'],
    [17, 'Ctrl'],
    [18, 'Alt'],
    [37, '◀︎'],
    [38, '▲'],
    [39, '▶︎'],
    [40, '▼'],
    [48, '0'],
    [49, '1'],
    [50, '2'],
    [51, '3'],
    [52, '4'],
    [53, '5'],
    [54, '6'],
    [55, '7'],
    [56, '8'],
    [57, '9'],
    [58, ','],
    [65, 'A'],
    [66, 'B'],
    [67, 'C'],
    [68, 'D'],
    [69, 'E'],
    [70, 'F'],
    [71, 'G'],
    [72, 'H'],
    [73, 'I'],
    [74, 'J'],
    [75, 'K'],
    [76, 'L'],
    [77, 'M'],
    [78, 'N'],
    [79, 'O'],
    [80, 'P'],
    [81, 'Q'],
    [82, 'R'],
    [83, 'S'],
    [84, 'T'],
    [85, 'U'],
    [86, 'V'],
    [87, 'W'],
    [88, 'X'],
    [89, 'Y'],
    [90, 'Z'],
    [91, 'OS'],
    [188, ','],
    [190, '.'],
]);

export function getKeyDisplayName(
    key: number,
    platform: chrome.runtime.PlatformOs,
): string {
    let displayName = KEY_DISPLAY_NAME_LOOKUP.get(key);

    if (!displayName) {
        return '';
    }

    // Win (Windows) / Command (Mac)
    if (key === 91) {
        displayName =
            platform == 'mac' ? 'CMD' : platform === 'win' ? 'Win' : 'OS';
    }

    return displayName;
}

export function isValidKey(key: number): boolean {
    if (MODIFIER_KEYS.includes(key)) {
        return false;
    }

    return KEY_DISPLAY_NAME_LOOKUP.has(key);
}
