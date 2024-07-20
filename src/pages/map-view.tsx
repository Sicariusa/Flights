import mapboxgl, { FullscreenControl, GeolocateControl, NavigationControl } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import './../map.css'
import flightLand from './../resources/flight-land.svg'
import flightIcon from './../resources/flight.svg'
import flightTakeOff from './../resources/flight-takeoff.svg'
import { createFeatures, getMapGeoBounds, svgToImage } from "../helper/helper";
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
        const bounds = getMapGeoBounds(map.getBounds() || new mapboxgl.LngLatBounds());
        const stateVectors = await getStateVectors(bounds);
        if(stateVectors === null || stateVectors === undefined || !stateVectors) {
            throw new Error ('Failed to fetch state vectors fe load asln ');
        }
        const features = createFeatures(stateVectors);
        map.addSource('flight-source', {
            type: 'geojson',
            data: features
        });
        

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