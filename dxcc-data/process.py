#! /usr/bin/env python

from more_itertools import peekable
import re
import struct
import json

lines = []

def process_line(line):
    line = line.strip()
    if  line.startswith('&'):
       lines_size = len(lines)
       lines[lines_size - 1] += f" | {line.lstrip('&')}"
    else:
       lines.append(line.replace('*', ' '))

def remove_concat_markers(line):
    # look for a semicolon followed one or more spaces, a pipe, and then any non-whitespace char
    # having found that, remove it, and return the result

    # Regex breakdown:
    # ;       - Matches the literal semicolon
    # \s*     - Matches 0 or more whitespace characters (spaces)
    # \|      - Matches the literal pipe (escaped because | is a special regex character)
    # \s*     - Matches 0 or more whitespace characters (spaces)
    # \S+     - Matches one or more non-whitespace characters
    pattern = r";\s*\|\s*\S+"

    # Replace the matched pattern with just a comma
    return re.sub(r';\s*\|\s*', ',', line)


def commaDelimtedToJSonArray(comma_delimited_string):
    list_of_items = [item.strip() for item in comma_delimited_string.split(',')]
    json_array_string = json.dumps(list_of_items)

    # Output the result
    # print("Original string:", comma_delimited_string)
    # print("Python list:", list_of_items)
    # print("JSON array string:", json_array_string)
    return json_array_string

def dataToJSonObject(data):
    entity = data[0:32].rstrip().rstrip(':')
    itu_zone = data[33:35]
    cq_zone = data[38:40]
    continent = data[43:45]
    primary_prefix = data[57:59].rstrip(':')
    additional_prefixes = data[64:len(data)-1]

    json = ""
    json += "  {\n"
    json += f'    "entity": "{entity}",\n'
    json += f'    "continent": "{continent}",\n'
    json += f'    "itu_zone": "{itu_zone}",\n'
    json += f'    "cq_zone": "{cq_zone}",\n'
    json += f'    "primary_prefix": "{primary_prefix}",\n'
    json += f'    "additional_prefixes": {commaDelimtedToJSonArray(additional_prefixes)}\n'
    json += "  }"

    return json



# process the country.dat file, producing a fixed-width file (like the original)
# but with all data for continent on one line
file_path = 'cty-3607/country.dat'

with open(file_path, 'r') as f:
    print("[")

    for current_line in f:
        process_line(current_line)

    for idx, l in enumerate(lines):
        entry = remove_concat_markers(l)
        terminator = ',' if idx < len(lines) - 1 else ''
        print(f"{dataToJSonObject(entry)}{terminator}")       

    print("]")


    # print(f"{len(lines)} entries")
    # 346