import {
    disableMod,
    enableMod,
    fetchModInstallerList,
    getActiveMods,
    getAvailableMods,
    getDisabledMods,
    installMod,
    uninstallMod,
} from "./api.ts";
import * as path from "https://deno.land/std@0.101.0/path/mod.ts";

import { Application, Context, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const getMods = () => ({ mods: [...getActiveMods(), ...getDisabledMods()] });

export async function openUrl(url: string): Promise<void> {
    const programAliases = {
        windows: "explorer",
        darwin: "open",
        linux: "sensible-browser",
    };
    const process = Deno.run({ cmd: [programAliases[Deno.build.os], url] });
    await process.status();
}

export const run = async (port: number, openBrowser: boolean = true) => {
    const router = new Router();
    router
        .get("/mods/installed", context => {
            context.response.body = getMods();
        })
        .get("/mods/available", context => {
            context.response.body = getAvailableMods();
        })
        .get("/mod/:mod/enable", context => {
            if (context?.params.mod) {
                context.response.status = enableMod(context.params.mod) ? 200 : 500;
            } else {
                context.response.status = 400;
            }
        })
        .get("/mod/:mod/disable", context => {
            if (context?.params.mod) {
                context.response.status = disableMod(context.params.mod) ? 200 : 500;
            } else {
                context.response.status = 400;
            }
        })
        .get("/mod/:mod/install", async context => {
            if (context?.params.mod) {
                context.response.status = (await installMod(context.params.mod)) ? 200 : 500;
            } else {
                context.response.status = 400;
            }
        })
        .get("/mod/:mod/uninstall", async context => {
            if (context?.params.mod) {
                context.response.status = (await uninstallMod(context.params.mod)) ? 200 : 500;
            } else {
                context.response.status = 400;
            }
        });

    const app = new Application();
    app.use(oakCors()); // Enable CORS for All Routes
    app.use(router.routes());

    // static content
    app.use(async (context: Context, next: any) => {
        try {
            await send(context, context.request.url.pathname, {
                root: path.join(Deno.cwd(), `./DenoModManager_Data/`),
                index: "index.html",
            });
        } catch {
            next();
        }
    });

    let success = true;

    console.info(`Starting mod manager...`);

    await fetchModInstallerList();

    setTimeout(() => {
        if (success) {
            if (openBrowser) openUrl(`http://localhost:${port}`);
            console.info(`Mod manager is running, please visit http://localhost:${port} ☺`);
        }
    }, 1000);

    try {
        await app.listen({ port: port });
    } catch (e) {
        console.error(e);
        success = false;
    }
};
