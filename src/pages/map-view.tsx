import mapboxgl, { FullscreenControl, GeolocateControl, NavigationControl, SymbolLayerSpecification } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import './../map.css'
import flightLand from './../resources/flight-land.svg'
import flightIcon from './../resources/flight.svg'
import flightTakeOff from './../resources/flight-takeoff.svg'
import { createFeatures, getMapGeoBounds, svgToImage, getSymbolLayout, getSymbolPaint } from "../helper/helper";
import { getStateVectors } from "../service/opensky-service";

interface IMapViewProps {
    center: mapboxgl.LngLat;
    zoom: number;
}
type MView = IMapViewProps

mapboxgl.accessToken= 'pk.eyJ1IjoiYWJkbzAiLCJhIjoiY2x5dDF4MjkwMGRtMTJqb3Q3MG81dGJpeCJ9.LRT9kWKN_D5kHOdH4o6qbA';

export const MapView = (props: MView)=>{
    const [mapInstance , setMapInstance] = useState<mapboxgl.Map>(); // useState hook to store the map instance
    
    const mapContainer = useRef<HTMLDivElement | null>(null); // useRef hook to store the map container reference
    
    
    const svgImages = [flightIcon, flightLand, flightTakeOff];
    const iconName = [
        'flight-icon',
        'flight-land',
        'flight-takeoff',
    ]
    
    
    useEffect(()=>{
        if(!mapInstance){
            if(!mapContainer.current) return;
        
        const map = new mapboxgl.Map({
            container: mapContainer.current || '',
            style: 'mapbox://styles/mapbox/dark-v10',
            center: props.center,
            zoom: props.zoom,
        });
        map.on('load', async () =>{
        svgImages.map((image, index) => {
            return svgToImage(image, 18, 18).then((img:any) => {
                map.addImage(iconName[index], img, {sdf: true});
            })
        })

        //load state vectors
        //edited
        const bounds = getMapGeoBounds(map.getBounds() as mapboxgl.LngLatBounds);
        const stateVectors: any = await getStateVectors(bounds);
        console.log(stateVectors?.states.length);
        if(!stateVectors){
           return;
        }
        const features = createFeatures(stateVectors);
        map.addSource('flight-source', {
            type: 'geojson',
            data: features
        });
        
       map.addLayer({
        id:'flight-layer',
        type:'symbol',
        source:'flight-source',//taken from addSource method from features
        layout: getSymbolLayout(map.getZoom()) as {
            'icon-image'?: string;
            'text-field'?: string
            'text-size'?: number;
            'icon-allow-overlap'?: boolean;
            'icon-rotate'?: number;
            'text-optional'?: boolean;
            'text-anchor'?: 'center' | 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
            //'text-offset'?: number[];
            'text-offset'?: [number, number];
            // Add other properties as needed
        },
        paint: getSymbolPaint() as {
            'icon-color'?: string;
            'text-color'?: string;
            'text-halo-width'?: number;
            'text-halo-color'?: string;
            'text-halo-blur'?: number;
            //'icon-translate'?: number[];
            //'icon-translate-anchor'?: 'map' | 'viewport';
            // Add other properties as needed
        }
    })
        

            map.addControl(
                new NavigationControl({
                    showCompass: true,
                    showZoom: true
                }),
                'bottom-right'
            )
            map.addControl(
                new FullscreenControl(),
                'top-right'
            )
            map.addControl(
                new GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            }),
            'bottom-right'
            )
        });
         setMapInstance(map);

     }
    }); // useEffect hook to run side effects in the component
    
    return (
        <div className="root">
            <div className="map-root" ref={mapContainer}></div>
        </div>
    )
}