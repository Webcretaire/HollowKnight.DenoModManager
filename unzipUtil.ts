import { join, extname } from "https://deno.land/std@0.101.0/path/mod.ts";
import { writeAll } from "https://deno.land/std@0.101.0/io/mod.ts";
import { existsSync, moveSync } from "https://deno.land/std/fs/mod.ts";

export const downloadFileToTemp = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const filename = response.headers.get("Content-Disposition")!.split(";")[1].split("=")[1].replaceAll('"', "");
    const blob = await response.blob();

    // We convert the blob into a typed array
    // so we can use it to write the data into the file
    const arrayBufferFromBlobResponse = await blob.arrayBuffer();
    const uint8ArrayEncodeFileData = new Uint8Array(arrayBufferFromBlobResponse);

    const tempFilePath = join(".", filename);

    // We then create a new file and write into it
    const file = Deno.createSync(tempFilePath);
    await writeAll(file, uint8ArrayEncodeFileData);

    // We can finally close the file
    Deno.close(file.rid);

    return filename;
};

export const unZipFromFile = async (
    filePath: string,
    destinationPath: string | null = "./",
    options: any = {}
): Promise<string | false> => {
    // check if the zip file is exist
    if (!existsSync(filePath)) {
        console.error(`Zip file ${filePath} doesn't exist`);
        return false;
    }
    // check destinationPath is not null and set './' as destinationPath
    if (!destinationPath) {
        destinationPath = "./";
    }
    //get the file name from filePath
    const fullFileName = filePath.split("/");
    // the file name with aut extension
    const fileNameWithOutExt = fullFileName[fullFileName.length - 1].split(".")[0];
    // get the extract file and add fileNameWithOutExt whene options.includeFileName is true
    const fullDestinationPath = options.includeFileName ? join(destinationPath, fileNameWithOutExt) : destinationPath;

    // return the unzipped file path or false whene the unzipping Process failed
    return (await unzipProcess(filePath, fullDestinationPath)) ? fullDestinationPath : false;
};

const unzipProcess = async (zipSourcePath: string, destinationPath: string): Promise<boolean> => {
    const unzipCommandProcess = Deno.run({
        cmd:
            Deno.build.os === "windows"
                ? [
                      "PowerShell",
                      "Expand-Archive",
                      "-Path",
                      zipSourcePath,
                      "-DestinationPath",
                      destinationPath,
                      "-Force",
                  ]
                : ["unzip", zipSourcePath, "-d", destinationPath],
        stdout: "piped",
        stderr: "piped",
    });

    return (await unzipCommandProcess.status()).success;
};

export const unZipFromURL = async (
    fileURL: string,
    destinationPath: string = "./",
    options: any = {}
): Promise<string | false> => {
    // download the file to temp
    const downloadedFilePath = await downloadFileToTemp(fileURL);

    if (extname(downloadedFilePath) === ".zip") {
        // unzip the temp file
        const p = await unZipFromFile(downloadedFilePath, destinationPath, options);
        // remove the temp file
        Deno.removeSync(downloadedFilePath);
        // return the unzipped file path
        return p;
    } else {
        const to = join(destinationPath, downloadedFilePath);
        if (to.replaceAll("/", "\\") != downloadedFilePath.replaceAll("/", "\\")) {
            try {
                moveSync(downloadedFilePath, to);
            } catch (e) {
                console.error(e);
                return Promise.resolve(false);
            }
        }

        return Promise.resolve(downloadedFilePath);
    }
};
