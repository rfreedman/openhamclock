# dxcc-data

This directory contains the current DXCC entity data from https://www.country-files.com

The cty-3607/country.dat file is used to produce the entities-data.json file that lives in the src/utils folder,
which is used to map callsign prefixes to entities, providing data such as contient, CQ zone, and ITU zone.

## Updating
To update the entities-data.json file when there is new data available at  https://www.country-files.com,

1. Download the cty-xxxx.zip file, unzip it, and copy/move the resulting folder here. 
The current folder is cty-3607 and was released on January 31, 2026. Remove the 'old' cty-xxxx folder.

2. Edit the 'file_path' in process.py to point to the new country.dat file.

3. Run 'process.py' (or 'python process.py' if you need to) - this will output the JSON data to the console.
When you are happy with the output, run it again, and redirect the output to  file, e.g. `process.py > etities-data.json`

4. Install the JavaScript dependencies for the test.mjs file by running `npm install`

7. If you can, determine what changed in the country.dat file, and use the test.mjs to try to test the things that have changed. 

8. When you are satisfied that everything is correct, copy the entities-data.json file to the src/utils folder
