import PersistentUIState from "../models/persistentUIState.js";

export default class PersistentUIStateFactory {


    static create() {
        return new PersistentUIState();
    }


}