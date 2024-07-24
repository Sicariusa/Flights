import mapboxgl from 'mapbox-gl';
import { MapView } from './map-view';
//import MapView from './map-view'; // Default import

import './../map.css'
export const MapboxHome = () => {
    return (
        <div className="root"> 
            <MapView
                center = {new mapboxgl.LngLat(4.07778828, 49.7294997)}
                zoom = {4}
                
            ></MapView>


        </div>
    );
}