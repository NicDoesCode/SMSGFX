const fileNameRegex = /[^A-z0-9-\.]/g;

export default class FileUtil {

    static getCleanFileName(fileName) {
        return fileName.replaceAll(fileNameRegex, '_');
    }

}