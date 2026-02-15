import entities from './entities-data.json' with { type: 'json' };

const matchPrimaryPrefix = (callsign) => entities.filter((item) =>  callsign.startsWith(item.primary_prefix)); 

const matchSecondaryPrefix = (callsign) => entities.filter((item) => {
    const match = item.additional_prefixes.filter((prefix) => callsign.startsWith(prefix));
    return(match && match.length > 0);
});

const getAllMatches = (callsign) => {
    const primary = matchPrimaryPrefix(callsign);
    const secondaries = matchSecondaryPrefix(callsign);
    var allMatches = primary.concat(secondaries);
    allMatches = [...new Set(allMatches)];
    return allMatches;
}

const findLongestMatch = (callsign, allMatches) => {
    var longestPrefix = "";
    var matchWithLongestPrefix = {};

    allMatches.forEach(item => {
        if(callsign.startsWith(item.primary_prefix) && item.primary_prefix.length > longestPrefix.length) {
            longestPrefix = item.primary_prefix;
            matchWithLongestPrefix = item;
        }

        item.additional_prefixes.forEach(addl => {
            if(callsign.startsWith(addl) && addl.length > longestPrefix.length) {
                longestPrefix = addl;
                matchWithLongestPrefix = item;
            }
        });

    });

    return {...matchWithLongestPrefix, longestPrefixMatch: longestPrefix};
}

export const lookupCallsign = (callsign) => {
    const allMatches = getAllMatches(callsign);
    return findLongestMatch(callsign, allMatches);
}

/** 
 * "Include by spotter (DE callsign)" filters (the OpenHamClock 'Zones' tab)
 */ 
export const filterSpotsBySpotterContinent = (spots, continent) => {
    return spots.filter((spot) => {
        const entity = lookupCallsign(spot.spotter);
        const result = entity.continent === continent;
        return result;
    });
}

export const filterSpotsBySpotterItuZone = (spots, zone) => {
       return spots.filter((spot) => {
        const entity = lookupCallsign(spot.spotter);
        const result = entity.itu_zone === zone;
        return result;
    }); 
}

export const filterSpotsBySpotterCqZone = (spots, zone) => {
       return spots.filter((spot) => {
        const entity = lookupCallsign(spot.spotter);
        const result = entity.cq_zone === zone;
        return result;
    }); 
}

/** 
 * "Exclude by spot (DX callsign)" filters (the OpenHamClock 'Exclude' tab)
 */ 
export const filterSpotsBySpotContinent = (spots, continent) => {
    return spots.filter((spot) => {
        const entity = lookupCallsign(spot.dxCall);
        const result = entity.continent !== continent;
        return result;
    });
}

export const filterSpotsBySpotItuZone = (spots, zone) => {
       return spots.filter((spot) => {
        const entity = lookupCallsign(spot.dxCall);
        const result = entity.itu_zone !== zone;
        return result;
    }); 
}

export const filterSpotsBySpotCqZone = (spots, zone) => {
       return spots.filter((spot) => {
        const entity = lookupCallsign(spot.dxCall);
        const result = entity.cq_zone !== zone;
        return result;
    }); 
}


export default {
    lookupCallsign,

    /* Include by Spotter (DE) filters */
    filterSpotsBySpotterContinent,
    filterSpotsBySpotterItuZone,
    filterSpotsBySpotterCqZone,
    
    /* Exclude by Spot (DX) filters */
    filterSpotsBySpotContinent,
    filterSpotsBySpotItuZone,
    filterSpotsBySpotCqZone    
}
