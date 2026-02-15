#! /usr/bin/env node
import {program} from "commander";

import {
    lookupCallsign, 
    filterSpotsBySpotterContinent, 
    filterSpotsBySpotterItuZone,
    filterSpotsBySpotterCqZone,
    filterSpotsBySpotContinent,
    filterSpotsBySpotItuZone,
    filterSpotsBySpotCqZone 
} from "./dxClusterFilters.mjs"

var pass = 0;
var fail = 0;

// lookup entity for a callsign and print it
const testEntityForCallsign = (callsign) => {
    const entity = lookupCallsign(callsign);
    console.log(JSON.stringify(entity, null, 2));
}

// filter an array of spots including by spotter continent
const testFilterSpotsBySpotterContinent = (spots, continent, expected) => {
    console.log(`filtering spots ${JSON.stringify(spots, null, 2)} on continent: ${continent}\n`);
    console.log(`expecting result ${JSON.stringify(expected, null, 2)}\n`);

    const result = filterSpotsBySpotterContinent(spots, continent);

    const passOrFail = JSON.stringify(result, null, 2) == JSON.stringify(expected, null, 2) ? "pass" : "fail";
    console.log(`${passOrFail}\n\n`);

    if(passOrFail === '*** FAIL ***') {
        ++fail;
        console.log(`\ngot unexpected result: ${JSON.stringify(result, null, 2)}\n\n`);
    } else {
        ++pass;
    }
}

// filter an array of spots including by spotter ITU Zone and print the resulting array
const testFilterSpotsBySpotterItuZone = (spots, zone, expected) => {
    console.log(`filtering spots ${JSON.stringify(spots, null, 2)} on ITU Zone: ${zone}\n`);
    console.log(`expecting result ${JSON.stringify(expected, null, 2)}\n`);

    const result = filterSpotsBySpotterItuZone(spots, zone);

    const passOrFail = JSON.stringify(result, null, 2) == JSON.stringify(expected, null, 2) ? "pass" : "fail";
    console.log(`${passOrFail}\n\n`);

    if(passOrFail === '*** FAIL ***') {
        ++fail;
        console.log(`\ngot unexpected result: ${JSON.stringify(result, null, 2)}\n\n`);
    } else {
        ++pass;
    } 
}

// filter an array of spots, including by spotter CQ Zone and print the resulting array
const testFilterSpotsBySpotterCqZone = (spots, zone, expected) => {
    console.log(`filtering spots ${JSON.stringify(spots, null, 2)} on CQ Zone: ${zone}\n`);
    console.log(`expecting result ${JSON.stringify(expected, null, 2)}\n`);

    const result = filterSpotsBySpotterCqZone(spots, zone);

    const passOrFail = JSON.stringify(result, null, 2) == JSON.stringify(expected, null, 2) ? "pass" : "fail";
    console.log(`${passOrFail}\n\n`);

    if(passOrFail === '*** FAIL ***') {
        ++fail;
        console.log(`\ngot unexpected result: ${JSON.stringify(result, null, 2)}\n\n`);
    } else {
        ++pass;
    }
}

// filter an array of spots, excluding by DX continent, and print the resulting array
const testExcludeSpotsByDxContinent = (spots, continent, expected) => {
    console.log(`excluding spots ${JSON.stringify(spots, null, 2)} on dx continent: ${continent}\n`);
    console.log(`expecting result ${JSON.stringify(expected, null, 2)}\n`);

    const result = filterSpotsBySpotContinent(spots, continent);

    const passOrFail = JSON.stringify(result, null, 2) == JSON.stringify(expected, null, 2) ? "pass" : "fail";
    console.log(`${passOrFail}\n\n`);

    if(passOrFail === '*** FAIL ***') {
        ++fail;
        console.log(`\ngot unexpected result: ${JSON.stringify(result, null, 2)}\n\n`);
    } else {
        ++pass;
    } 
}

// filter an array of spots excluding by DX ITU Zone and print the resulting array
const testFilterSpotsByDxItuZone = (spots, zone, expected) => {
    console.log(`excluding spots ${JSON.stringify(spots, null, 2)} on dx ITU Zone: ${zone}\n`);
    console.log(`expecting result ${JSON.stringify(expected, null, 2)}\n`);

    const result = filterSpotsBySpotItuZone(spots, zone);

    const passOrFail = JSON.stringify(result, null, 2) == JSON.stringify(expected, null, 2) ? "pass" : "fail";
    console.log(`${passOrFail}\n\n`);

    if(passOrFail === '*** FAIL ***') {
        ++fail;
        console.log(`\ngot unexpected result: ${JSON.stringify(result, null, 2)}\n\n`);
    } else {
        ++pass;
    } 
}

// filter an array of spots excluding by DX ITU Zone and print the resulting array
const testFilterSpotsByDxCqZone = (spots, zone, expected) => {
    console.log(`excluding spots ${JSON.stringify(spots, null, 2)} on dx CQ Zone: ${zone}\n`);
    console.log(`expecting result ${JSON.stringify(expected, null, 2)}\n`);

    const result = filterSpotsBySpotCqZone(spots, zone);

    const passOrFail = JSON.stringify(result, null, 2) == JSON.stringify(expected, null, 2) ? "pass" : "fail";
    console.log(`${passOrFail}\n\n`);

    if(passOrFail === '*** FAIL ***') {
        ++fail;
        console.log(`\ngot unexpected result: ${JSON.stringify(result, null, 2)}\n\n`);
    } else {
        ++pass;
    } 
}


function main() {

    program
        .name('test')
        .description('test dxClusterFilters')
        .version('1.0.0');

    program.addHelpText('afterAll', '\n');

    program.command('lookup')
        .description('get entity for callsign\n')
        .argument('<callsign>', 'callsign to lookup')
        .action((callsign) => {
            callsign = callsign.toUpperCase();
            testEntityForCallsign(callsign);
        });

            
    program.command('filter-de-continent')
        .description('test filtering spots by spotter continent\n')
        .action(() => {
            // include spotters by continent, test K3EA -> NA and 5X3A -> AF
            var spots = [
                {spotter: 'K3EA'},
                {spotter: '5X3A'}
            ];

            var continent = 'NA'

            var expected = [
            {spotter: 'K3EA'} 
            ];

            testFilterSpotsBySpotterContinent(spots, continent, expected);

            continent = 'AF';
            expected = [
                {spotter: '5X3A'}
            ];
            testFilterSpotsBySpotterContinent(spots, continent, expected);
        });
  
    program.command('filter-de-itu-zone')
        .description('test filtering spots by spotter ITU Zone\n')
        .action(() => {
            spots = [
                {spotter: 'K3EA'},
                {spotter: '5X3A'}
            ];

            var ituZone = '08';

            var expected = [
            {spotter: 'K3EA'} 
            ];

            testFilterSpotsBySpotterItuZone(spots, ituZone, expected);

            ituZone = '48';
            expected = [
                {spotter: '5X3A'}
            ];
            testFilterSpotsBySpotterItuZone(spots, ituZone, expected);
        });

   
    program.command('filter-de-cq-zone')
        .description('test filtering spots by spotter CQ Zone\n')
        .action(() => {
            // include spotters by CQ Zone, test K3EA -> Zone 5 and 5X3A -> Zone 37

            spots = [
                {spotter: 'K3EA'},
                {spotter: '5X3A'}
            ];

            var cqZone = '05';

            var expected = [
            {spotter: 'K3EA'} 
            ];

            testFilterSpotsBySpotterCqZone(spots, cqZone, expected);

        
            cqZone = '37';
            expected = [
                {spotter: '5X3A'}
            ];
            testFilterSpotsBySpotterCqZone(spots, cqZone, expected);
        });

      
       program.command('exclude-dx-continent')
        .description('test exclduing spots by dx continent\n')
        .action(() => {
            var spots = [
                {dxCall: 'K3EA'},
                {dxCall: '5X3A'}
            ];

            var continent = 'NA'

            var expected = [
            {dxCall: '5X3A'} 
            ];

            testExcludeSpotsByDxContinent(spots, continent, expected);

            continent = 'AF';
            expected = [
                {dxCall: 'K3EA'}
            ];
            
            testExcludeSpotsByDxContinent(spots, continent, expected);
        });  
        
        program.command('exclude-dx-itu-zone')
            .description('test exluding spots by dx ITU zone\n')
            .action(() => {
                var spots = [
                    {dxCall: 'K3EA'},
                    {dxCall: '5X3A'}
                ];

                var ituZone = '08';

                var expected = [
                {dxCall: '5X3A'} 
                ];

                testFilterSpotsByDxItuZone(spots, ituZone, expected);

                ituZone = '48';
                expected = [
                    {dxCall: 'K3EA'}
                ];
                testFilterSpotsByDxItuZone(spots, ituZone, expected);
            });


        program.command('exclude-dx-cq-zone')
            .description('test exluding spots by dx CQ zone\n')
            .action(() => {   
                const spots = [
                    {dxCall: 'K3EA'},
                    {dxCall: '5X3A'}
                ];

                var cqZone = '05';

                var expected = [
                {dxCall: '5X3A'} 
                ];

                testFilterSpotsByDxCqZone(spots, cqZone, expected);

            
                cqZone = '37';
                expected = [
                    {dxCall: 'K3EA'}
                ];
                testFilterSpotsByDxCqZone(spots, cqZone, expected);   
            });

    console.log("\n");    
    program.parse();   
    console.log("\n");
}

main();


