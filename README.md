# urlswitcher-deno
Simple program to load a specific browser based on URL characteristics

## Summary
Conditionally start different browsers or browsers profiles/arguments depending on whether the URL matches certain criteria.  See urlswitcher.ini for an example of how this might work.

## Compilation
deno compile --allow --allow-read --allow-run main.ts
Or, if you want to give it a specific name:
no compile --allow --allow-read --allow-run main.ts -o NAME.exe

## Usage

### As a script
deno run --allow --allow-read --allow-run main.ts URL

### As an executable
urlswitcher-deno.exe URL
