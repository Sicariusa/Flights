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
        map.on('mouseenter', 'flight-layer', (e) =>{
            map.getCanvas().style.cursor = 'pointer';

        });
        map.on('mouseleave', 'flight-layer', (e) =>{
            map.getCanvas().style.cursor = '';

        });
        
        map.on('click', 'flight-layer', (e) => {
            e.preventDefault();
            const icao24 = e.features![0].properties?.icao24;
            const fromOrigin = e.features![0].properties?.origin;
            
            const popupContent = `
                <div style="
                    background: linear-gradient(135deg, #4a90e2, #9013fe);
                    color: #ffffff;
                    padding: 0;
                    border-radius: 12px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                    max-width: 280px;
                    text-align: center;
                    width: 100%;
                ">
                    <div style="
                        margin-bottom: 10px;
                        padding: 15px;
                        font-size: 22px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        border-bottom: 2px solid rgba(255, 255, 255, 0.3);
                        background-color: rgba(0, 0, 0, 0.2);
                        border-top-left-radius: 12px;
                        border-top-right-radius: 12px;
                    ">
                        Flight Info
                    </div>
                    <div style="padding: 15px;">
                        <p style="margin: 10px 0; font-size: 16px;">
                            <i class="fas fa-plane" style="color: #ffcc00; margin-right: 8px;"></i>
                            <strong>ICAO24:</strong> ${icao24}
                        </p>
                        <p style="margin: 10px 0; font-size: 16px;">
                            <i class="fas fa-globe" style="color: #ffcc00; margin-right: 8px;"></i>
                            <strong>Origin:</strong> ${fromOrigin}
                        </p>
                    </div>
                </div>
            `;
        
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(map);
        });
        
        
        
         setMapInstance(map);
    }


    const updateData = setInterval(async () =>{
        updateFlights()
    }, 10000); // 12000 ms
    return () => {
        clearInterval(updateData)
    }

}, [mapInstance]);

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
                if(mapInstance.getLayer('flight-layer')){
                    mapInstance.removeLayer('flight-layer')
                    mapInstance.addLayer({
                        id:'flight-layer',
                        type:'symbol',
                        source:'flight-source',//taken from addSource method from features
                        layout: getSymbolLayout(mapInstance.getZoom()),
                        paint: getSymbolPaint()
                    })
                }
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