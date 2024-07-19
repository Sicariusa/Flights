import { IMapGeoBounds } from "../model/opensky-model";

export const svgToImage = (path: string, width: number, height: number) => {
    return new Promise(resolve => {
        const img = new Image(width, height);
        img.src = path;
       img.addEventListener('load', () => resolve(img));
    });
}
// Function to get geographic bounds from a Mapbox map and map it to our model (interface)
export const getMapGeoBounds = (bounds: mapboxgl.LngLatBounds) => {
    // Initialize the IMapGeoBounds object with default values
    let mapGeoBounds: IMapGeoBounds = {
        northernLatitude: 0.0,
        southernLatitude: 0.0,
        easternLongitude: 0.0,
        westernLongitude: 0.0
    };
    
    // Set the northern latitude from the northeast corner of the bounds
    mapGeoBounds.northernLatitude = bounds!.getNorthEast().lat;

    // Set the eastern longitude from the northeast corner of the bounds
    mapGeoBounds.easternLongitude = bounds!.getNorthEast().lng;

    // Set the southern latitude from the southwest corner of the bounds
    mapGeoBounds.southernLatitude = bounds!.getSouthWest().lat;

    // Set the western longitude from the southwest corner of the bounds
    mapGeoBounds.westernLongitude = bounds!.getSouthWest().lng;

    // Return the mapped geographic bounds
    return mapGeoBounds;
}
