import { join } from "https://deno.land/std@0.101.0/path/mod.ts";
import { parse } from "https://deno.land/x/xml/mod.ts";
import { globalData } from "./store.ts";
import { unZipFromURL } from "./unzipUtil.ts";
import { existsSync, moveSync } from "https://deno.land/std/fs/mod.ts";
import os from "https://deno.land/x/dos@v0.11.0/mod.ts";

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
            installed: isModInstalled(m.Name),
            ...m,
        })),
});

const getModInstallerFiles = (mod: string): Array<any> | undefined => {
    const files = globalData?.modinstallerData?.ModLinks?.ModList?.ModLink.find(
        ({ Name }: { Name: string }) => Name == mod
    )?.Files?.File;

    if (!files) return undefined;

    return Array.isArray(files) ? files : [files];
};

const isModInstalled = (mod: string): boolean => {
    const files = getModInstallerFiles(mod);

    if (!files) return false; // Is an empty mod installed or not ? Let's say no, but actually no one cares

    return files.reduce(
        (i: boolean, file: any) => i && (existsSync(`./${file.Name}`) || existsSync(`./Disabled/${file.Name}`)),
        true
    );
};

const downloadAndUnzip = async (modData: any) => {
    const tempDir = join(".", `__archive__content__`);

    if (existsSync(tempDir)) Deno.removeSync(tempDir, {recursive: true});
    Deno.mkdirSync(tempDir);

    try {
        await unZipFromURL(modData.Link, tempDir);

        // The heuristic to detect where files are is bad, but it's so stupid that all archives don't have
        // the same format that I don't even want to bother more than that
        getModInstallerFiles(modData.Name)?.map((file: any) => {
            if (existsSync(join(tempDir, file.Name))) moveSync(join(tempDir, file.Name), join(".", file.Name));
            else moveSync(join(tempDir, "hollow_knight_Data", "Managed", "Mods", file.Name), join(".", file.Name));
        });
    } catch (e) {}

    Deno.removeSync(tempDir, { recursive: true });
};

const doInstallMod = async (mod: string): Promise<boolean> => {
    if (!globalData?.modinstallerData?.ModLinks?.ModList?.ModLink) return Promise.resolve(false);

    const modData = globalData?.modinstallerData?.ModLinks?.ModList?.ModLink.find(
        ({ Name }: { Name: string }) => Name == mod
    );

    if (!modData?.Link) return Promise.resolve(false);

    if (modData.Dependencies)
        for (const s of Array.isArray(modData.Dependencies.string)
            ? modData.Dependencies.string
            : [modData.Dependencies.string])
            await installMod(s);

    console.log(`Installing ${mod}`);

    try {
        await downloadAndUnzip(modData);
        return Promise.resolve(true);
    } catch (e) {
        console.error(e);
        return Promise.resolve(false);
    }
};

export const installMod = async (mod: string): Promise<boolean> =>
    isModInstalled(mod) || mod === "Modding API" ? Promise.resolve(false) : doInstallMod(mod);

const removeDll = (dll: string): Promise<void> => Deno.remove(`./${dll}`).catch(() => Deno.remove(`./Disabled/${dll}`));

export const uninstallMod = async (mod: string): Promise<boolean> => {
    if (!globalData?.modinstallerData?.ModLinks?.ModList?.ModLink) return Promise.resolve(false);

    const files = getModInstallerFiles(mod);

    if (!files) return Promise.resolve(false);

    try {
        Promise.all(files.map((f: any) => removeDll(f.Name)));
        return Promise.resolve(true);
    } catch (e) {
        console.error(e);
        return Promise.resolve(false);
    }
};
