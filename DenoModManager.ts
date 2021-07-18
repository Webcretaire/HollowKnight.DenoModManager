import * as path from "https://deno.land/std@0.101.0/path/mod.ts";
import { Args, parse } from "https://deno.land/std@0.101.0/flags/mod.ts";
import { run } from "./server.ts";

const cwd = path.normalize(Deno.cwd()).replaceAll("\\", "/");

if (!cwd.endsWith("/Managed/Mods")) {
    console.error(
        "It looks like you are not running this mod manager from a Hollow Knight Mod folder, please retry from <your Hollow Knight install path>/hollow_knight_Data/Managed/Mods"
    );
    Deno.exit(1);
}

const args: Args = parse(Deno.args, {
    alias: {
        port: "p",
        "open-browser": "o",
    },
    boolean: ["open-browser"],
    default: {
        port: 9308,
        "open-browser": true,
    },
});

run(args.port, args["open-browser"]);
