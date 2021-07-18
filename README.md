# Deno Mod Manager

Mod manager for Hollow Knight, it is an alternative UI to the community [Mod Installer](https://github.com/ricardosouzag/ModInstaller), based on Deno and a web interface (it uses the exact same source for its mods). The UI is based on Nuxt (Vue.JS) and Bootstrap-Vue.

## Compatibility

This project is tested (and pre-built) for Windows only, but it should work on any platform (as Deno is cross-platform and it uses portable web tools only)

## Installation

**Prerequisite:** This tool manages your mods, but doesn't install the modding API, please refer to pinned messages in the Hollow Knight community discord to enable mods on your game in the first place

Grab a [release](https://github.com/Webcretaire/HollowKnight.DenoModManager/releases) and unzip it in `<YourHollowKnightInstallFolder>/hollow_knight_Data/Managed/Mods` (if this directory doesn't exist, re-read the prerequisite above).

## Usage

Run `DenoModManager.exe`, which should open a browser tab to the web UI automatically (if it doesn't just click the link that is provided by the exe file)

## Troubleshooting

If the default port used by this tool is already in use, you can open a Powershell window (or any shell really), navigate to your mod folder, and type `.\DenoModManager.exe -p << choose any available port >>` to run it with a different port