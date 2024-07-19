
import {IMapGeoBounds, IStateVectorRawData, IStateVector, IStateVectorData} from './../model/opensky-model';

const baseUrl = 'https://opensky-network.org/api/states/all';
const username = '';
const password = '';

export const getStateVectors = async (mapGeoBounds: IMapGeoBounds)=>{
    const stateBounds =`?lamin =${mapGeoBounds.southernLatitude}&lomin=${mapGeoBounds.westernLongitude}&lamax=${mapGeoBounds.northernLatitude}&lomax=${mapGeoBounds.easternLongitude}`;
    const targetUrl = baseUrl + stateBounds;
    //lw fe 7aga bayza fa bsbb el url
    const response = await fetch(targetUrl, {
        headers:{
            Authorization: 'Basic' + btoa(`${username} :  ${password}`)
        }
    });
    if(response.ok){
        const data = await response.json();
        const rawData : IStateVectorRawData = data;
        const getStateVectors = mapRawData(rawData);
        if(!getStateVectors){
            throw new Error('Failed to fetch data');
        }
        if(!getStateVectors.states){
            throw new Error('Failed due to state');
        }
    }
    else{
        throw new Error('Failed abl fetch asln');
    }
}

export const mapRawData = (rawData: IStateVectorRawData) =>{
    const stateVectors: IStateVectorData = {
        time: rawData.time,
        states: []
    };
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
        return stateVectors;
    }
}
