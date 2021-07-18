import { join } from "https://deno.land/std@0.101.0/path/mod.ts";
import { parse } from "https://deno.land/x/xml/mod.ts";
import { globalData } from "./store.ts";
import { unZipFromURL } from "https://deno.land/x/zip@v1.1.0/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";

export interface Mod {
    dll: string;
    active?: boolean;
    modInstallerData?: Object;
}

const findModInstallerData = (dll: string): Object | null => {
    if (!globalData?.modinstallerData?.ModLinks?.ModList?.ModLink) return Promise.resolve(false);

    const mData = globalData?.modinstallerData?.ModLinks?.ModList?.ModLink.filter(({ Files }: { Files: any }) =>
        (Array.isArray(Files.File) ? Files.File : [Files.File]).find(({ Name }: { Name: string }) => Name === dll)
    );

    return mData.length == 1 ? mData[0] : null;
};

const formatMods = (folder: string): Mod[] =>
    Array.from(Deno.readDirSync(folder))
        .filter((file: Deno.DirEntry) => file.isFile && file.name.endsWith(".dll"))
        .map((mod: Deno.DirEntry) => {
            const m: Mod = {
                dll: mod.name,
            };

            const mData = findModInstallerData(mod.name);
            if (mData) m.modInstallerData = mData;

            return m;
        });

export const getActiveMods = (): Mod[] => formatMods(Deno.cwd()).map((m: Mod) => ({ active: true, ...m }));

export const getDisabledMods = (): Mod[] =>
    formatMods(join(Deno.cwd(), "./Disabled")).map((m: Mod) => ({ active: false, ...m }));

export const moveMod = (mod: string, enable = true): boolean => {
    const enabledPath = join(Deno.cwd(), `./${mod}`);
    const disabledPath = join(Deno.cwd(), `./Disabled/${mod}`);
    const to = enable ? enabledPath : disabledPath;
    const from = enable ? disabledPath : enabledPath;

    try {
        Deno.renameSync(from, to);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const enableMod = (mod: string): boolean => moveMod(mod, true);

export const disableMod = (mod: string): boolean => moveMod(mod, false);

export const fetchModInstallerList = () =>
    fetch("https://raw.githubusercontent.com/ricardosouzag/ModInstaller/master/modlinks.xml")
        .then(res => res.text())
        .then(raw => (globalData.modinstallerData = parse(raw)));

export const getAvailableMods = () => ({
    mods: globalData?.modinstallerData?.ModLinks?.ModList?.ModLink.filter((m: any) => m.Name != "Modding API")
        .sort((a: any, b: any) => a.Name.localeCompare(b.Name, undefined, { numeric: false, sensitivity: "base" }))
        .map((m: any) => ({
            installed: Array.isArray(m.Files.File) // XML is dumb, so 2 cases here...
                ? m.Files.File.reduce((i: boolean, file: any) => i && existsSync(`./${file.Name}`), true)
                : existsSync(`./${m.Files.File.Name}`),
            ...m,
        })),
});

export const installMod = async (mod: string): Promise<boolean> => {
    if (!globalData?.modinstallerData?.ModLinks?.ModList?.ModLink) return Promise.resolve(false);

    const url = globalData?.modinstallerData?.ModLinks?.ModList?.ModLink.find(
        ({ Name }: { Name: string }) => Name == mod
    )?.Link;

    if (!url) return Promise.resolve(false);

    try {
        await unZipFromURL(url, "../../..");
        return Promise.resolve(true);
    } catch (e) {
        console.error(e);
        return Promise.resolve(false);
    }
};

const removeDll = (dll: string): Promise<void> =>  Deno.remove(`./${dll}`).catch(() => Deno.remove(`./Disabled/${dll}`));

export const uninstallMod = async (mod: string): Promise<boolean> => {
    if (!globalData?.modinstallerData?.ModLinks?.ModList?.ModLink) return Promise.resolve(false);

    const files = globalData?.modinstallerData?.ModLinks?.ModList?.ModLink.find(
        ({ Name }: { Name: string }) => Name == mod
    )?.Files?.File;

    if (!files) return Promise.resolve(false);

    try {
        Promise.all(Array.isArray(files) ? files.map((f: any) => removeDll(f.Name)) : [removeDll(files.Name)]);
        return Promise.resolve(true);
    } catch (e) {
        console.error(e);
        return Promise.resolve(false);
    }
};
