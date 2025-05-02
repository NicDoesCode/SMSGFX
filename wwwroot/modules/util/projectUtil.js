import Project from "../models/project.js";
import ProjectJsonSerialiser from "../serialisers/projectJsonSerialiser.js";
import FileUtil from "./fileUtil.js";
import GeneralUtil from "./generalUtil.js";
import TileMapUtil from "./tileMapUtil.js";


const rxProjectId = /^[A-z0-9]+$/;


export default class ProjectUtil {


    /**
     * Saves an export JSON file containing the tiles and palettes to the user's computer.
     * @param {Project} project - Project to save to file.
     */
    static saveToFile(project) {
        const theDate = new Date();
        const fileDate = moment(theDate).format('YYYY-MM-DD-HHmmss');
        const title = project.title ? project.title : 'project';
        const fileTitle = FileUtil.getCleanFileName(title);
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
        const text = await blob.text();
        return ProjectJsonSerialiser.deserialise(text);
    }

    /**
     * Generates a new project ID.
     * @returns {string}
     */
    static generateProjectId() {
        return GeneralUtil.generateRandomString(16);
    }


    /**
     * Checks and repairs a project.
     * @param {Project} project - Project to check and repair.
     */
    static checkAndRepairProject(project) {
        ProjectUtil.ensureProjectHasId(project);
        TileMapUtil.checkAndRepairTileMaps(project.tileMapList, project.systemType);
    }

    /**
     * Makes sure that a project has an ID.
     * @param {Project} project - Project to check.
     */
    static ensureProjectHasId(project) {
        if (!project.id || !rxProjectId.test(project.id)) {
            project.id = ProjectUtil.generateProjectId();
        }
        return project;
    }

    /**
     * Validates a project ID.
     * @param {Project|string} project - Project or ID to check.
     */
    static isValidProjectId(projectOrId) {
        const projectId = projectOrId instanceof Project ? projectOrId.id ?? null : projectOrId;
        return rxProjectId.test(projectId);
    }


}
