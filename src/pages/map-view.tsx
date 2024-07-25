import mapboxgl, { FullscreenControl, GeoJSONSource, GeolocateControl, NavigationControl } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import './../map.css'
import flightLand from './../resources/flight-land (2).svg'
import flightIcon from './../resources/flight (2).svg'
import flightTakeOff from './../resources/flight-takeoff (2).svg'
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
                console.log('Image added to map')
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
        layout: getSymbolLayout(map.getZoom()),
        paint: getSymbolPaint()
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
    const updateData = setInterval(async () =>{
        updateFlights()
    }, 12000); // 12000 ms
    return () => {
        clearInterval(updateData)
    }

}, [mapInstance]); // useEffect hook to run side effects in the component
    const updateFlights = async () =>{
        if(!mapInstance){ 
            throw new Error('Mafee4 map f update data')
        }
        try{
        const bounds = getMapGeoBounds(mapInstance.getBounds() as mapboxgl.LngLatBounds);
        const stateVectors = await getStateVectors(bounds);
        if(!stateVectors){
            console.error('Map instance is not available.');
        return;
        }
        const features = createFeatures(stateVectors);
        if(!features){
            console.error('Features is not available.');
            return;
        }
        const source: mapboxgl.GeoJSONSource = mapInstance.getSource('flight-source') as mapboxgl.GeoJSONSource
        if(!source){
            console.error('Source is not available.');
        return;
        }
        source.setData(features);
    } catch (error){
        console.error("error updating data")
    }
    }
    return (
        <div className="root">
            <div className="map-root" ref={mapContainer}></div>
        </div>
    )
}