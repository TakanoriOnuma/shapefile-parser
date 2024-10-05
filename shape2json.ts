import shapefile from "shapefile";
import { fileURLToPath } from "node:url";
import path from "path";
import { promises as fsPromises } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_NAME = "P17-12_13_FireStationJurisdiction";

shapefile
  .read(
    path.resolve(__dirname, `./data/source/${FILE_NAME}.shp`),
    path.resolve(__dirname, `./data/source/${FILE_NAME}.dbf`),
    { encoding: "shift-jis" },
  )
  .then((result) => {
    console.log(result);
    fsPromises.writeFile(
      path.resolve(__dirname, `./data/output/${FILE_NAME}.geojson`),
      JSON.stringify(result, null, 2),
    );
  });
