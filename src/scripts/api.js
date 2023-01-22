import { warn } from "./lib/lib.js";

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

	async updateActivityProgress(actorName, itemName, newProgress) {
		let actor = game.actors.getName(actorName);
		if (!actor) {
			warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
			return;
		}
		let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems");
		let itemIdx = allItems.findIndex((i) => i.name === itemName);
		if (itemIdx < 0) {
			warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + itemName, true);
			return;
		}

		newProgress = parseInt(newProgress);
		if (isNaN(newProgress)) {
			warn(game.i18n.localize("downtime-dnd5e.ProgressValueIsNanWarning"), true);
			return;
		}

		// Increase progress
		let thisItem = allItems[itemIdx];
		let alreadyCompleted = thisItem.progress >= thisItem.completionAt;
		thisItem = TrackingAndTraining.calculateNewProgress(
			thisItem,
			game.i18n.localize("downtime-dnd5e.LogActionMacro"),
			newProgress,
			true
		);
		// Log activity completion
		TrackingAndTraining.checkCompletion(actor, thisItem, alreadyCompleted);
		// Update flags and actor
		allItems[itemIdx] = thisItem;
		await actor.setFlag(CONSTANTS.MODULE_NAME, "trainingItems", allItems);
	},

	getActivitiesForActor(actorName) {
		let actor = game.actors.getName(actorName);
		if (actor) {
			let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
			return allItems;
		} else {
			warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
		}
	},

	getActivity(actorName, itemName) {
		let actor = game.actors.getName(actorName);
		if (!actor) {
			warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
			return;
		}
		let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
		let itemIdx = allItems.findIndex((i) => i.name === itemName);
		if (itemIdx < 0) {
			warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + itemName, true);
		} else {
			return allItems[itemIdx];
		}
	},
};
export default API;
