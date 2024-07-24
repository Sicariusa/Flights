export interface IMapGeoBounds {
    northernLatitude: number;
    southernLatitude: number;
    easternLongitude: number;
    westernLongitude: number;
}
// Define the IStateVector interface for creating state vectors
export interface IStateVector {
    icao24: string;
    callsign: string | null;
    originCountry: string;
    timePosition: number | null;
    lastContact: number;
    longitude: number | null;
    latitude: number | null;
    baro_Altitude: number | null;
    on_ground: boolean;
    velocity: number | null;
    true_track: number | null;
    vertical_rate: number | null;
    sensors: number[] | null;
    geo_altitude: number | null;
    squawk: string | null;
    spi: boolean;
    position_source: number;
}
export interface IStateVectorData {
    time: number;
    states: Array<IStateVector>;
}

export interface IStateVectorRawData {
    time: number;
    states: Array<Array<any>>;
}