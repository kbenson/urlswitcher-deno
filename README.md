# urlswitcher-deno
Simple program to load a specific browser based on URL characteristics

## Summary
Conditionally start different browsers or browsers profiles/arguments depending on whether the URL matches certain criteria.  See urlswitcher.ini for an example of how this might work.

## Compilation
deno compile --allow-env --allow-read --allow-run main.ts
Or, if you want to give it a specific name:
deno compile --allow-env --allow-read --allow-run main.ts -o NAME.exe

## Usage

### As a script
deno run --allow-env --allow-read --allow-run main.ts URL

### As an executable
urlswitcher-deno.exe URL

### urlswitcher.ini location
The default location for urlswitcher.ini is $HOME/.urlswitcher.ini on a UNIX like system or %USERPROFILE%\.urlswitcher.ini if you're on Windows.

### Setting Windows default URL handler
I found indications that Windows is fairly explicit about what's available to be a protocol handler, and how it needs to be installed through an .exe or MSI installer, so I cheated.  I looked in the registry for firefox, which is my default, and found and entry for firefox that looked to be where it registered itself as a URL handler, and changed what that was set to run.

Specifically, I changed "Computer\HKEY_CLASSES_ROOT\FirefoxURL-DEADBEEFDEADBEEF\shell\open\command" from:

    "C:\Program Files\Mozilla Firefox\firefox.exe" -osint -url "%1"

to

    "C:\Users\MyUser\bin\urlswitcher-deno.exe" "%1"

where the hexadecimal portion of the registry key is something I made up, and the path to urlswitcher-deno.exe should be wherever you put it.