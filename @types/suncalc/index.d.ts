declare module 'suncalc' {
    interface MoonIllumination {
        fraction: number; // Fraction illuminée (0 = nouvelle lune, 1 = pleine lune)
        phase: number; // Phase (0 = nouvelle lune, 0.5 = pleine lune)
        angle: number; // Angle de l'arc illuminé (en radians)
    }

    interface MoonPosition {
        azimuth: number; // Azimut de la lune (en radians)
        altitude: number; // Altitude de la lune (en radians)
        distance: number; // Distance jusqu'à la lune (en km)
    }

    interface MoonTimes {
        rise?: Date; // Heure de lever de la lune
        set?: Date; // Heure de coucher de la lune
        alwaysUp?: boolean;
        alwaysDown?: boolean;
    }

    interface SunPosition {
        azimuth: number; // Azimut du soleil (en radians)
        altitude: number; // Altitude du soleil (en radians)
    }

    interface SunTimes {
        sunrise: Date;
        sunset: Date;
        sunriseEnd: Date;
        sunsetStart: Date;
        dawn: Date;
        dusk: Date;
        nauticalDawn: Date;
        nauticalDusk: Date;
        nightEnd: Date;
        night: Date;
        goldenHourEnd: Date;
        goldenHour: Date;
    }

    interface TimesResult extends SunTimes {
        solarNoon: Date;
        nadir: Date;
    }

    // Fonctions principales
    export function getMoonIllumination(date: Date): MoonIllumination;
    export function getMoonPosition(date: Date, lat: number, lng: number): MoonPosition;
    export function getMoonTimes(date: Date, lat: number, lng: number, inUTC?: boolean): MoonTimes;
    export function getPosition(date: Date, lat: number, lng: number): SunPosition;
    export function getTimes(date: Date, lat: number, lng: number, inUTC?: boolean): TimesResult;
    export function getSunPosition(date: Date, lat: number, lng: number): SunPosition;
}
