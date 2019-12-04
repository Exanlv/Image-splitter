import { read } from 'jimp';
import { writeFileSync, existsSync } from 'fs';

let settings: {[setting: string]: string} = {};

for (let i in process.argv) {
    let match = process.argv[i].match(/(.*):(.*)/);

    if (match) {
        settings[match[1]] = match[2];
    }
}

const requiredSettings: string[] = ['file'];

for (let i in requiredSettings) {
    if (!settings[requiredSettings[i]]) {
        throw `Missing required setting '${requiredSettings[i]}'`;
    }
}

const filePath: string[] = settings['file'].replace(/\//g, '\\').split('\\');
const fileInfo: string[] = filePath[filePath.length - 1].match(/(.{1,})\.(.{1,})/);

if (!fileInfo) {
    throw 'Invalid file';
}

if (!existsSync(settings['file'])) {
    throw 'File does not exist';
}

const fileName = fileInfo[1];
const fileExtension = fileInfo[2];

const exportName = settings['name'] || fileName;

const outputEmoteConfig = settings['size'].split('*') || [5, 5];


(async() => {
    const image = await read(settings['file']);

    const outputSettings = {
        verticalEmotes: Number(outputEmoteConfig[0]),
        horizontalEmotes: Number(outputEmoteConfig[1])
    };

    const emoteSizes = {
        height: image.bitmap.height / outputSettings.verticalEmotes,
        width: image.bitmap.width / outputSettings.horizontalEmotes
    };

    const currentPositions = {
        x: 0,
        y: 0
    };

    let emoteString = '';

    while (currentPositions.y < outputSettings.verticalEmotes) {
        while (currentPositions.x < outputSettings.horizontalEmotes) {
            let imageClone = image.clone();
            imageClone.crop(currentPositions.x * emoteSizes.width, currentPositions.y * emoteSizes.height, emoteSizes.width, emoteSizes.height);

            imageClone.write(`${exportName}-${currentPositions.x}${currentPositions.y}.${fileExtension}`);
            emoteString += `:${exportName}${currentPositions.x}${currentPositions.y}:`;

            currentPositions.x++;
        }

        emoteString += '\n';

        currentPositions.x = 0;
        currentPositions.y++;
    }

    writeFileSync(`${exportName}.txt`, emoteString);
})();