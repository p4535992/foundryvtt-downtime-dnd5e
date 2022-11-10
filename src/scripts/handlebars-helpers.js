import CONSTANTS from "./constants.js";
import CrashTrackingAndTraining from "./CrashTrackingAndTraining.js";

export function registerHelpers() {
	Handlebars.registerHelper(`${CONSTANTS.MODULE_NAME}-trainingCompletion`, function (trainingItem) {
		let percentComplete = Math.min(100, (100 * trainingItem.progress) / trainingItem.completionAt).toFixed(0);
		return percentComplete;
	});

	Handlebars.registerHelper(`${CONSTANTS.MODULE_NAME}-progressionStyle`, function (item, actor) {
		if (!item || !actor) {
			return "?";
		}

		let formatted = "";

		if (item.progressionStyle === "FIXED") {
			formatted = game.i18n.localize("downtime-5e.ProgressionStyleFixed");
		} else if (item.progressionStyle === "ABILITY") {
			formatted = CONFIG.DND5E.abilities[item.ability];
		} else if (item.progressionStyle === "SKILL") {
			formatted = CONFIG.DND5E.skills[item.skill].label;
		} else if (item.progressionStyle === "TOOL") {
			let toolId = item.tool;
			let tool = actor.items.filter((item) => {
				return item._id === toolId;
			})[0];
			if (tool) {
				formatted = tool.name;
			} else {
				formatted = "[" + game.i18n.localize("downtime-5e.InvalidTool") + "]";
			}
		} else if (item.progressionStyle === "MACRO") {
			formatted = game.i18n.localize("downtime-5e.ProgressionStyleMacro");
		}

		if (item.dc) {
			formatted += " (" + game.i18n.localize("downtime-5e.DC") + item.dc + ")";
		}

		return formatted;
	});

	Handlebars.registerHelper(`${CONSTANTS.MODULE_NAME}-trainingRollBtnClass`, function (trainingItem) {
		let className = "downtime-5e-training-roll";
		if (trainingItem.progress >= trainingItem.completionAt) {
			className = "downtime-5e-training-roll-disabled";
		}
		return className;
	});

	Handlebars.registerHelper(`${CONSTANTS.MODULE_NAME}-trainingRollBtnTooltip`, function (trainingItem) {
		let text = game.i18n.localize("downtime-5e.RollItemProgress");
		if (trainingItem.progress >= trainingItem.completionAt) {
			text = game.i18n.localize("downtime-5e.RollItemDisabled");
		}
		return text;
	});

	Handlebars.registerHelper(`${CONSTANTS.MODULE_NAME}-isInCategory`, function (actor, category) {
		let thisCategoryId = category.id;
		let allTrainingItems = actor.flags[CONSTANTS.MODULE_NAME]?.trainingItems || [];
		let matchingItems = [];
		for (var i = 0; i < allTrainingItems.length; i++) {
			let thisItem = allTrainingItems[i];
			if (thisItem.category == thisCategoryId) {
				matchingItems.push(thisItem);
			}
		}
		matchingItems.sort((a, b) => (a.name > b.name ? 1 : -1));
		return matchingItems;
	});

	Handlebars.registerHelper(`${CONSTANTS.MODULE_NAME}-isUncategorized`, function (actor) {
		let allTrainingItems = actor.flags[CONSTANTS.MODULE_NAME]?.trainingItems || [];
		let matchingItems = [];
		for (var i = 0; i < allTrainingItems.length; i++) {
			let thisItem = allTrainingItems[i];
			if (!thisItem.category) {
				matchingItems.push(thisItem);
			}
		}
		matchingItems.sort((a, b) => (a.name > b.name ? 1 : -1));
		return matchingItems;
	});

	Handlebars.registerHelper(`${CONSTANTS.MODULE_NAME}-getBarColor`, function (item) {
		// Derived from this: https://gist.github.com/mlocati/7210513
		let perc = Math.min(100, (100 * item.progress) / item.completionAt).toFixed(0);
		var r,
			g,
			b = 0;
		var a = 0.5;
		if (perc < 50) {
			r = 255;
			g = Math.round(5.1 * perc);
		} else {
			g = 255;
			r = Math.round(510 - 5.1 * perc);
		}
		return `rgba(${r},${g},${b},${a})`;
	});
}
