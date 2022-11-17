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

	crashTNT: {},

	async updateActivityProgress(actorName, itemName, newProgress) {
		let actor = game.actors.getName(actorName);
		if (!actor) {
			ui.notifications.warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"));
			return;
		}
		let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems");
		let itemIdx = allItems.findIndex((i) => i.name === itemName);
		if (itemIdx < 0) {
			ui.notifications.warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + itemName);
			return;
		}

		newProgress = parseInt(newProgress);
		if (isNaN(newProgress)) {
			ui.notifications.warn(game.i18n.localize("downtime-dnd5e.ProgressValueIsNanWarning"));
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
			ui.notifications.warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"));
		}
	},

	getActivity(actorName, itemName) {
		let actor = game.actors.getName(actorName);
		if (!actor) {
			ui.notifications.warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"));
			return;
		}
		let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
		let itemIdx = allItems.findIndex((i) => i.name === itemName);
		if (itemIdx < 0) {
			ui.notifications.warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + itemName);
		} else {
			return allItems[itemIdx];
		}
	},
};
export default API;
