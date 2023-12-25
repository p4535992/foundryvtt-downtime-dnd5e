import CONSTANTS from "./constants.js";
import TrackingAndTraining from "./TrackingAndTraining.js";

export function registerHelpers() {
  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-trainingCompletion`, function (trainingItem) {
    let percentComplete = Math.min(100, (100 * trainingItem.progress) / trainingItem.completionAt).toFixed(0);
    return percentComplete;
  });

  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-progressionStyle`, function (item, actor) {
    if (!item || !actor) {
      return "?";
    }

    let formatted = "";

    if (item.progressionStyle === "FIXED") {
      formatted = game.i18n.localize("downtime-dnd5e.ProgressionStyleFixed");
    } else if (item.progressionStyle === "ABILITY") {
      formatted = CONFIG.DND5E.abilities[item.ability].label;
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
        formatted = "[" + game.i18n.localize("downtime-dnd5e.InvalidTool") + "]";
      }
    } else if (item.progressionStyle === "MACRO") {
      formatted = game.i18n.localize("downtime-dnd5e.ProgressionStyleMacro");
    }

    if (item.dc) {
      formatted += " (" + game.i18n.localize("downtime-dnd5e.DC") + item.dc + ")";
    }

    return formatted;
  });

  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-trainingRollBtnClass`, function (trainingItem) {
    let className = "downtime-dnd5e-roll";
    if (trainingItem.progress >= trainingItem.completionAt) {
      className = "downtime-dnd5e-roll-disabled";
    }
    return className;
  });

  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-worldTrainingRollBtnClass`, function (trainingItem) {
    let className = "downtime-dnd5e-world-roll";
    if (trainingItem.progress >= trainingItem.completionAt) {
      className = "downtime-dnd5e-world-roll-disabled";
    }
    return className;
  });

  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-trainingRollBtnTooltip`, function (trainingItem) {
    let text = game.i18n.localize("downtime-dnd5e.RollItemProgress");
    if (trainingItem.progress >= trainingItem.completionAt) {
      text = game.i18n.localize("downtime-dnd5e.RollItemDisabled");
    }
    return text;
  });

  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-worldTrainingRollBtnTooltip`, function (trainingItem) {
    let text = game.i18n.localize("downtime-dnd5e.RollItemProgress");
    if (trainingItem.progress >= trainingItem.completionAt) {
      text = game.i18n.localize("downtime-dnd5e.RollItemDisabled");
    }
    return text;
  });

  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-isInCategory`, function (actor, category) {
    let thisCategoryId = category.id;
    let allTrainingItems = getProperty(actor, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.trainingItems}`) || [];
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

  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-isInWorldCategory`, function (actor, category) {
    let thisCategoryId = category.id;
    let allTrainingItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
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

  // Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-isUncategorized`, function (actor) {
  //   let allTrainingItems = actor.flags[CONSTANTS.MODULE_ID]?.trainingItems || [];
  //   let matchingItems = [];
  //   for (var i = 0; i < allTrainingItems.length; i++) {
  //     let thisItem = allTrainingItems[i];
  //     if (!thisItem.category) {
  //       matchingItems.push(thisItem);
  //     }
  //   }
  //   matchingItems.sort((a, b) => (a.name > b.name ? 1 : -1));
  //   return matchingItems;
  // });

  Handlebars.registerHelper(`${CONSTANTS.MODULE_ID}-getBarColor`, function (item) {
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
