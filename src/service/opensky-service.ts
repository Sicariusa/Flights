
import {IMapGeoBounds, IStateVectorRawData, IStateVector, IStateVectorData} from './../model/opensky-model';
//https://www.flightaware.com/commercial/aeroapi/
const baseUrl = 'https://opensky-network.org/api';
const username = 'bedo2024';
const password = '12312300';

export const getStateVectors = async (mapGeoBounds: IMapGeoBounds) => {
    const stateBounds = `?lamin=${mapGeoBounds.southernLatitude}&lomin=${mapGeoBounds.westernLongitude}&lamax=${mapGeoBounds.northernLatitude}&lomax=${mapGeoBounds.easternLongitude}`;
    const targetUrl = `${baseUrl}/states/all${stateBounds}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(`${username}:${password}`)
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();
        const rawData: IStateVectorRawData = data;
        const stateVectors = mapRawData(rawData);

        if (!stateVectors || !stateVectors.states) {
            throw new Error('No state vectors found');
        }

        console.log('Number of states:', stateVectors.states.length);
        return stateVectors;

    } catch (error) {
        console.error('Error fetching state vectors:', error);
        throw error; // Rethrow the error to be handled by the calling code
    }
};
export const mapRawData = (rawData: IStateVectorRawData) =>{
    const stateVectorData: IStateVectorData = {
        time: rawData.time,
        states: []
    }
    if(!rawData.states){
       throw new Error('No states found');
    }
    for ( let rawStateVector of rawData.states){
        //lw fe 7aga bayza fa bsbb el sex ely fel model check el spelling
        const stateVector: IStateVector = {
            icao24: rawStateVector[0],
            callsign: rawStateVector[1],
            originCountry: rawStateVector[2],
            timePosition: rawStateVector[3],
            lastContact: rawStateVector[4],
            longitude: rawStateVector[5],
            latitude: rawStateVector[6],
            baro_Altitude: rawStateVector[7],
            on_ground: rawStateVector[8],
            velocity: rawStateVector[9],
            true_track: rawStateVector[10],
            vertical_rate: rawStateVector[11],
            sensors: rawStateVector[12],
            geo_altitude: rawStateVector[13],
            squawk: rawStateVector[14],
            spi: rawStateVector[15],
            position_source: rawStateVector[16]
        };
        stateVectorData.states.push(stateVector);
       
    }
    return stateVectorData;
   
}
