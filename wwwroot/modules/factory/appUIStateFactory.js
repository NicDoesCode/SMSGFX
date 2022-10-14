import AppUIState from "../models/appUIState.js";

export default class AppUIStateFactory {


    static create() {
        return new AppUIState();
    }


}