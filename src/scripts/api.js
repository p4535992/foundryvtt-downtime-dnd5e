import Category from "./Category.js";
import TrackingAndTraining from "./TrackingAndTraining.js";
import CONSTANTS from "./constants.js";
import { getActorAsync, getActorSync, getUserCharacter, isRealNumber, warn } from "./lib/lib.js";

const API = {
    // renderDialogMMMForXXXArr(...inAttributes) {
    //     // if (!Array.isArray(inAttributes)) {
    //     //   throw error('renderDialogMMMForXXXArr | inAttributes must be of type array');
    //     // }
    //     this.renderDialogMMMForXXX();
    // },
    // renderDialogMMMForXXX() {
    //     //@ts-ignore
    //     MaxwelMaliciousMaladies.displayDialog();
    // },

    /** @deprecated remain for retrocompatibility */
    crashTNT: {}, // remain for retrocompatibility

    /**
     * @deprecated
     * @param {Actor|string} actor
     * @param {string} activityName
     * @param {number|string} newProgress
     * @returns {Promise<void>}
     */
    async updateActivityProgress(actor, activityName, newProgress) {
        return await this.updateActivity(actor, activityName, newProgress);
    },

    /**
     * @param {Actor|string} actor
     * @param {string} activityName
     * @param {number|string} newProgress
     * @returns {Promise<void>}
     */
    async updateActivity(actor, activityName, newProgress) {
        let actorTmp = await getActorAsync(actor, false, false);
        if (!actorTmp) {
            warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
            return;
        }
        let allItems = actorTmp.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        let itemIdx = allItems.findIndex((i) => i.name === activityName);
        if (itemIdx < 0) {
            warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + activityName, true);
            return;
        }

        let newProgressI = parseInt(newProgress);
        if (!isRealNumber(newProgressI)) {
            warn(game.i18n.localize("downtime-dnd5e.ProgressValueIsNanWarning"), true);
            return;
        }

        // Increase progress
        let thisItem = allItems[itemIdx];
        if (!thisItem) {
            warn(game.i18n.localize("downtime-dnd5e.InvalidItemWarning"), true);
            return;
        }
        let alreadyCompleted = thisItem.progress >= thisItem.completionAt;
        thisItem = TrackingAndTraining.calculateNewProgress(
            thisItem,
            game.i18n.localize("downtime-dnd5e.LogActionMacro"),
            newProgressI,
            true,
        );
        // Log activity completion
        TrackingAndTraining.checkCompletion(actorTmp, thisItem, alreadyCompleted);
        // Update flags and actor
        allItems[itemIdx] = thisItem;
        await actorTmp.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
    },

    /**
     * @deprecated
     * @param {Actor|string} actor
     * @returns {Activity[]}
     */
    getActivitiesForActor(actor) {
        return this.getActivities(actor);
    },

    /**
     * @param {Actor|string} actor
     * @returns {Activity[]}
     */
    getActivities(actor) {
        let actorTmp = getActorSync(actor, false, false);
        if (actorTmp) {
            let allItems = getProperty(actorTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.trainingItems}`) || [];
            return allItems;
        } else {
            warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
            return [];
        }
    },

    /**
     *
     * @param {Actor|string} actor
     * @param {string} activityName
     * @returns {Activity}
     */
    getActivity(actor, activityName) {
        let actorTmp = getActorSync(actor, false, false);
        if (!actorTmp) {
            warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
            return;
        }
        let allItems = getProperty(actorTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.trainingItems}`) || [];
        let itemIdx = allItems.findIndex((i) => i.name === activityName);
        if (itemIdx < 0) {
            warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + activityName, true);
            return;
        } else {
            return allItems[itemIdx];
        }
    },

    /**
     * @param {Actor|string} actor
     * @returns {Category[]}
     */
    getCategories(actor) {
        let actorTmp = getActorSync(actor, false, false);
        if (actorTmp) {
            let allCategories =
                getProperty(actorTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.categories}`) || [];
            return allCategories;
        } else {
            warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
            return [];
        }
    },

    /**
     * @deprecated
     * @param {string} activityName
     * @param {number|string} newProgress
     * @param {Actor|string} explicitActor
     * @returns {Promise<void>}
     */
    async updateWorldActivityProgress(activityName, newProgress, explicitActor) {
        return await this.updateWorldActivity(activityName, newProgress, explicitActor);
    },

    /**
     *
     * @param {string} activityName
     * @param {number|string} newProgress
     * @param {Actor|string} explicitActor
     * @returns {Promise<void>}
     */
    async updateWorldActivity(activityName, newProgress, explicitActor) {
        let actorTmp = explicitActor ? await getActorAsync(explicitActor, false, false) : getUserCharacter(game.user);
        if (!actorTmp) {
            warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
            return;
        }
        let allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        let itemIdx = allItems.findIndex((i) => i.name === activityName);
        if (itemIdx < 0) {
            warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + activityName, true);
            return;
        }

        let newProgressI = parseInt(newProgress);
        if (!isRealNumber(newProgressI)) {
            warn(game.i18n.localize("downtime-dnd5e.ProgressValueIsNanWarning"), true);
            return;
        }

        // Increase progress
        let thisItem = allItems[itemIdx];
        if (!thisItem) {
            warn(game.i18n.localize("downtime-dnd5e.InvalidItemWarning"), true);
            return;
        }
        let alreadyCompleted = thisItem.progress >= thisItem.completionAt;
        thisItem = TrackingAndTraining.calculateNewProgress(
            thisItem,
            game.i18n.localize("downtime-dnd5e.LogActionMacro"),
            newProgressI,
            true,
        );
        // Log activity completion
        TrackingAndTraining.checkCompletion(actorTmp, thisItem, alreadyCompleted);
        // Update flags and actor
        allItems[itemIdx] = thisItem;
        await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, allItems);
    },

    /**
     *
     * @returns {Activity[]}
     */
    getWorldActivities() {
        let allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        return allItems;
    },

    /**
     *
     * @param {string} activityName
     * @returns {Activity}
     */
    getWorldActivity(activityName) {
        let allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        let itemIdx = allItems.findIndex((i) => i.name === activityName);
        if (itemIdx < 0) {
            warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + activityName, true);
            return;
        } else {
            return allItems[itemIdx];
        }
    },

    /**
     *
     * @returns {Category[]}
     */
    getWorldCategories() {
        let allCategories = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories) || [];
        return allCategories;
    },
};
export default API;
