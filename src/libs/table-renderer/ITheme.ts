interface ITableSeparators {
    vertical: string;
    horizontal: string;
    nw: string; // Nord-Ouest (coin supérieur gauche)
    ne: string; // Nord-Est (coin supérieur droit)
    sw: string; // Sud-Ouest (coin inférieur gauche)
    se: string; // Sud-Est (coin inférieur droit)
    n: string; // Nord (bordure haute)
    e: string; // Est (bordure droite)
    w: string; // Ouest (bordure gauche)
    s: string; // Sud (bordure basse)
}

interface ITableBorders {
    inner: boolean;
    rows: boolean;
    cols: boolean;
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
}

export interface ITheme {
    SEPARATORS: {
        outer: ITableSeparators;
        inner: {
            vertical: string;
            horizontal: string;
            intersection: string;
        };
    };
    BORDERS: ITableBorders;
}
