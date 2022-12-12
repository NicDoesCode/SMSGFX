import Project from "../models/project.js";
import ProjectJsonSerialiser from "../serialisers/projectJsonSerialiser.js";

export default class UndoManager {


    /** Maximum amount of undo and redo steps supported. */
    get stepCount() {
        return this.stepCount;
    }

    /** Gets whether there are any undo steps available. */
    get canUndo() {
        return this.#undoStates.length > 0;
    }

    /** Gets whether there are any redo steps available. */
    get canRedo() {
        return this.#redoStates.length > 0;
    }


    /** @type {import("../serialisers/projectJsonSerialiser.js").ProjectSerialisable[]} */
    #undoStates;
    /** @type {import("../serialisers/projectJsonSerialiser.js").ProjectSerialisable[]} */
    #redoStates;
    #stepCount;


    /**
     * Initialises a new instance of the undo manager class.
     * @param {number?} stepCount - The amount of states to be stored, between 0 and 100, if omitted 20 is assumed.
     */
    constructor(stepCount) {
        if (typeof stepCount !== 'number') stepCount = 20;
        if (stepCount < 0 || stepCount > 100) throw new Error('Step count must be between 0 and 100.');
        this.#stepCount = stepCount;
        this.#undoStates = [];
        this.#redoStates = [];
    }


    /**
     * Records the current project state to the undo cache.
     * @param {Project} projectState - Project state to record.
     */
    addUndoState(projectState) {
        this.clearRedo();
        this.#addUndo(projectState);
    }

    /**
     * Clears the redo state cache.
     */
    clearRedo() {
        this.#redoStates = [];
    }

    /**
     * Clears the undo and redo state cache.
     */
    clearUndo() {
        this.#undoStates = [];
        this.#redoStates = [];
    }

    /**
     * Rolls back and returns the last project state in the undo cache, records the current state to redo cache. 
     * @param {Project} currentProjectState - Current project state that will be added to the redo cache.
     * @returns {Project|null}
     */
    undo(currentProjectState) {
        this.#addRedo(currentProjectState);
        const serialisedUndo = this.#undoStates.pop();
        return ProjectJsonSerialiser.fromSerialisable(serialisedUndo);
    }

    /**
     * Rolls back and returns the last project state in the redo cache, records the current state to undo cache. 
     * @param {Project} currentProjectState - Current project state that will be added to the undo cache.
     * @returns {Project|null}
     */
    redo(currentProjectState) {
        this.#addUndo(currentProjectState);
        const serialisedRedo = this.#redoStates.pop();
        return ProjectJsonSerialiser.fromSerialisable(serialisedRedo);
    }


    /** @param {Project} projectStateToPush */
    #addUndo(projectStateToPush) {
        while (this.#undoStates.length >= this.#stepCount) {
            this.#undoStates = this.#undoStates.slice(1);
        }
        const serialised = ProjectJsonSerialiser.toSerialisable(projectStateToPush);
        this.#undoStates.push(serialised);
    }

    /** @param {Project} projectStateToPush */
    #addRedo(projectStateToPush) {
        while (this.#redoStates.length >= this.#stepCount) {
            this.#redoStates = this.#redoStates.slice(1);
        }
        const serialised = ProjectJsonSerialiser.toSerialisable(projectStateToPush);
        this.#redoStates.push(serialised);
    }


}