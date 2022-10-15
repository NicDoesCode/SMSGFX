import Project from "../models/project.js";
import ProjectJsonSerialiser from "../serialisers/projectJsonSerialiser.js";

const fileNameRegex = /[^A-z0-9-]/g;

export default class ProjectUtil {


    /**
     * Saves an export JSON file containing the tiles and palettes to the user's computer.
     * @param {Project} project - Project to save to file.
     */
    static saveToFile(project) {
        const theDate = new Date();
        const fileDate = moment(theDate).format('YYYY-MM-DD-HHmmss');
        const fileTitle = project.title.replaceAll(fileNameRegex, '_');
        const fileName = `smsgfx-${fileTitle}-${fileDate}.json`;
        
        const serialisedData = ProjectJsonSerialiser.serialise(project, true);

        const file = new File([serialisedData], fileName, { type: 'application/json' });
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Loads a project from a blob.
     * @param {Blob} blob - The input data.
     * @returns {Promise<Project>}
     */
    static async loadFromBlob(blob) {
        const buf = await blob.arrayBuffer();
        const data = String.fromCharCode.apply(null, new Uint8Array(buf));
        return ProjectJsonSerialiser.deserialise(data);
    }


}
