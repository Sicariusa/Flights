import { FeatureCollection } from "geojson";
import { IMapGeoBounds, IStateVectorData } from "../model/opensky-model";
import { Expression, StyleSpecification, SymbolLayout, SymbolPaint } from "mapbox-gl";
type StyleFunction = Expression; // Assuming Expression fits your needs

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

export const createFeatures = (stateVectors: IStateVectorData | undefined)=>{
    if(!stateVectors){
        throw new Error('No state vectors found fe create Features');
    }
    if(!stateVectors.states){
        throw new Error('No states found fe create Features');
    }
    let featureCollection: FeatureCollection = {
        type : 'FeatureCollection',
        features: []
    }
    return featureCollection;
}

export const getSymbolLayout = (zoom: number)=>{
    let showText = false;
    if( zoom > 7){
        showText = true;
    }
    let iconSize = 1.0;
    if(zoom > 6 )
    {
        iconSize = 1.2;
    } else if (zoom > 8){
        iconSize = 1.5;
    }
    //Deprecation usually means there's a newer, preferred way of doing things, 
    //or the functionality has been integrated into a different part of the API.
    const symbolLayout : SymbolLayout ={
        'icon-image': 'flight-icon',
        'icon-allow-overlap': true,
        'icon-rotate': ['get', 'rotation'],
        'icon-size': iconSize,
        'text-field': showText ? getText() : '',
        'text-optional': true,
        'text-allow-overlap': true,
        'text-anchor': showText ? 'top': 'center',
        'text-offset': showText ? [0,1] : [0, 0],      
    }
    return symbolLayout;
}

export const getText = () => {
    let text : string | Expression | StyleFunction = [
        'format',
        ['get', 'callsign'],{'font-scale': 1.0},
        '\n',{},
        ['get', 'altitude'],{'font-scale': 0.75, 'text-color': '#fff'},
        '\n',{},
        ['get', 'velocity'],{'font-scale': 0.75, 'text-color': '#fff'}
    ] as StyleFunction
    return text 

}

export const getSymbolPaint = () =>{
   let symbolpaint : SymbolPaint = {
        'icon-color': ['get', 'color'], //color is a property in the state vector
        'text-color': ['get', 'color'],
        'text-halo-width': 2,
        'text-halo-color': '#000',
        'text-halo-blur': 2,
   }
    return symbolpaint;
}