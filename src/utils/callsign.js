/**
 * Callsign and Band Utilities
 * Band detection, mode detection, callsign parsing
 */

import entities from './entities-data.json' with { type: 'json' };


/**
 * HF Amateur Bands
 */
export const HF_BANDS = ['160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '11m', '10m', '6m', '2m', '70cm'];

/**
 * Continents for DX filtering
 */
export const CONTINENTS = [
  { code: 'NA', name: 'North America' },
  { code: 'SA', name: 'South America' },
  { code: 'EU', name: 'Europe' },
  { code: 'AF', name: 'Africa' },
  { code: 'AS', name: 'Asia' },
  { code: 'OC', name: 'Oceania' },
  { code: 'AN', name: 'Antarctica' }
];

/**
 * Digital/Voice Modes
 */
export const MODES = ['CW', 'SSB', 'FT8', 'FT4', 'RTTY', 'PSK', 'AM', 'FM'];

/**
 * Get band from frequency (in kHz)
 */
export const getBandFromFreq = (freq) => {
  const f = parseFloat(freq);
  // Handle MHz input (convert to kHz)
  const freqKhz = f < 1000 ? f * 1000 : f;
  if (freqKhz >= 1800 && freqKhz <= 2000) return '160m';
  if (freqKhz >= 3500 && freqKhz <= 4000) return '80m';
  if (freqKhz >= 5330 && freqKhz <= 5405) return '60m';
  if (freqKhz >= 7000 && freqKhz <= 7300) return '40m';
  if (freqKhz >= 10100 && freqKhz <= 10150) return '30m';
  if (freqKhz >= 14000 && freqKhz <= 14350) return '20m';
  if (freqKhz >= 18068 && freqKhz <= 18168) return '17m';
  if (freqKhz >= 21000 && freqKhz <= 21450) return '15m';
  if (freqKhz >= 24890 && freqKhz <= 24990) return '12m';
  if (freqKhz >= 26000 && freqKhz <= 28000) return '11m'; // CB band
  if (freqKhz >= 28000 && freqKhz <= 29700) return '10m';
  if (freqKhz >= 50000 && freqKhz <= 54000) return '6m';
  if (freqKhz >= 144000 && freqKhz <= 148000) return '2m';
  if (freqKhz >= 420000 && freqKhz <= 450000) return '70cm';
  return 'other';
};

/**
 * Get band color for map visualization
 */
export const getBandColor = (freq) => {
  const f = parseFloat(freq);
  if (f >= 1.8 && f < 2) return '#ff6666';      // 160m - red
  if (f >= 3.5 && f < 4) return '#ff9966';      // 80m - orange
  if (f >= 7 && f < 7.5) return '#ffcc66';      // 40m - yellow
  if (f >= 10 && f < 10.5) return '#99ff66';    // 30m - lime
  if (f >= 14 && f < 14.5) return '#66ff99';    // 20m - green
  if (f >= 18 && f < 18.5) return '#66ffcc';    // 17m - teal
  if (f >= 21 && f < 21.5) return '#66ccff';    // 15m - cyan
  if (f >= 24 && f < 25) return '#6699ff';      // 12m - blue
  if (f >= 26 && f < 28) return '#8866ff';      // 11m - violet (CB band)
  if (f >= 28 && f < 30) return '#9966ff';      // 10m - purple
  if (f >= 50 && f < 54) return '#ff66ff';      // 6m - magenta
  return '#4488ff';                              // default blue
};

/**
 * Detect mode from comment text
 */
export const detectMode = (comment) => {
  if (!comment) return null;
  const upper = comment.toUpperCase();
  if (upper.includes('FT8')) return 'FT8';
  if (upper.includes('FT4')) return 'FT4';
  if (upper.includes('CW')) return 'CW';
  if (upper.includes('SSB') || upper.includes('LSB') || upper.includes('USB')) return 'SSB';
  if (upper.includes('RTTY')) return 'RTTY';
  if (upper.includes('PSK')) return 'PSK';
  if (upper.includes('AM')) return 'AM';
  if (upper.includes('FM')) return 'FM';
  return null;
};


const matchPrimaryPrefix = (callsign) => entities.filter((item) =>  callsign.startsWith(item.primary_prefix));

const matchSecondaryPrefix = (callsign) => entities.filter((item) => {
    const match = item.additional_prefixes.filter((prefix) => callsign.startsWith(prefix));
    return(match && match.length > 0);
})

const getAllMatches = (callsign) => {
    const primary = matchPrimaryPrefix(callsign);
    const secondaries = matchSecondaryPrefix(callsign);
    let allMatches = primary.concat(secondaries);
    allMatches = [...new Set(allMatches)];
    return allMatches;
}

const findLongestMatch = (callsign, allMatches) => {
    let longestPrefix = "";
    let matchWithLongestPrefix = {};

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

    return matchWithLongestPrefix;
}

export const getCallsignInfo = (callsign) => {
    const allMatches = getAllMatches(callsign);
    return findLongestMatch(callsign, allMatches);
}

export default {
  HF_BANDS,
  CONTINENTS,
  MODES,
  getBandFromFreq,
  getBandColor,
  detectMode,
  getCallsignInfo
};
