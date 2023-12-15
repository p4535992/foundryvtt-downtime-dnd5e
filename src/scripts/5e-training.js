// Imports
import { preloadTemplates } from "./load-templates.js";
import { registerSettings } from "./settings.js";
import { registerHelpers } from "./handlebars-helpers.js";
import { migrateToVersion1 } from "./migrations/migrationNumber1.js";
import AuditLog from "./AuditLog.js";
import TrackingAndTraining from "./TrackingAndTraining.js";
import { setApi } from "../module.js";
import CONSTANTS from "./constants.js";
import API from "./api.js";

// Register Game Settings
export const initHooks = () => {
  // warn("Init Hooks processing");
  // setup all the hooks
  preloadTemplates();
  registerSettings();
  registerHelpers();
};

export const setupHooks = () => {
  // warn("Setup Hooks processing");
  //@ts-ignore
  // setApi(API);
};

export const readyHooks = () => {
  API.crashTNT = crashTNT();
  setApi(API);
  migrateAllActors();
};

// The Meat And Potatoes
async function addTrainingTab(app, html, data) {
  // Determine if we should show the downtime tab
  let showTrainingTab = false;
  let showToUser = game.users.current.isGM || !game.settings.get(CONSTANTS.MODULE_NAME, "gmOnlyMode");
  if (data.isCharacter && data.editable) {
    showTrainingTab = game.settings.get(CONSTANTS.MODULE_NAME, "enableTraining") && showToUser;
  } else if (data.isNPC && data.editable) {
    showTrainingTab = game.settings.get(CONSTANTS.MODULE_NAME, "enableTrainingNpc") && showToUser;
  }

  if (showTrainingTab) {
    // Get our actor and our flags
    let actor = game.actors.contents.find((a) => a._id === data.actor._id);

    // Update the nav menu
    let tabName = game.settings.get(CONSTANTS.MODULE_NAME, "tabName");
    let trainingTabBtn = $('<a class="item" data-tab="training">' + tabName + "</a>");
    let tabs = html.find('.tabs[data-group="primary"]');
    tabs.append(trainingTabBtn);

    // Get the data to render the template
    const templateData = getTemplateData(data);

    // Create the tab content
    let sheet = html.find(".sheet-body");
    let trainingTabHtml = $(
      await renderTemplate(`modules/${CONSTANTS.MODULE_NAME}/templates/training-section.hbs`, templateData)
    );
    sheet.append(trainingTabHtml);

    // Set up our big list of dropdown options
    activateTabListeners(actor, html);

    // Set Training Tab as Active
    html.find('.tabs .item[data-tab="training"]').click((ev) => {
      app.activateTrainingTab = true;
    });

    // Unset Training Tab as Active
    html.find('.tabs .item:not(.tabs .item[data-tab="training"])').click((ev) => {
      app.activateTrainingTab = false;
    });
  }

  //Tab is ready
  Hooks.call(`TrainingTabReady`, app, html, data);
}

function activateTabListeners(actor, html) {
  let actorTools = TrackingAndTraining.getActorTools(actor.id);
  const ABILITIES = TrackingAndTraining.formatAbilitiesForDropdown();
  const SKILLS = TrackingAndTraining.formatSkillsForDropdown();
  const DROPDOWN_OPTIONS = { abilities: ABILITIES, skills: SKILLS, tools: actorTools };

  // NEW CATEGORY
  html.find(".downtime-dnd5e-new-category").click(async (event) => {
    event.preventDefault();
    // console.log("Create Category excuted!");
    await TrackingAndTraining.addCategory(actor.id);
  });

  // EDIT CATEGORY
  html.find(".downtime-dnd5e-edit-category").click(async (event) => {
    event.preventDefault();
    // console.log("Edit Category excuted!");
    let fieldId = event.currentTarget.id;
    let categoryId = fieldId.replace("downtime-dnd5e-edit-category-", "");
    await TrackingAndTraining.editCategory(actor.id, categoryId);
  });

  // DELETE CATEGORY
  html.find(".downtime-dnd5e-delete-category").click(async (event) => {
    event.preventDefault();
    // console.log("Delete Category excuted!");
    let fieldId = event.currentTarget.id;
    let categoryId = fieldId.replace("downtime-dnd5e-delete-category-", "");
    await TrackingAndTraining.deleteCategory(actor.id, categoryId);
  });

  // ADD NEW DOWNTIME ACTIVITY
  html.find(".downtime-dnd5e-add").click(async (event) => {
    event.preventDefault();
    // console.log("Create Item excuted!");
    await TrackingAndTraining.addItem(actor.id, DROPDOWN_OPTIONS);
  });

  // EDIT DOWNTIME ACTIVITY
  html.find(".downtime-dnd5e-edit").click(async (event) => {
    event.preventDefault();
    // console.log("Edit Item excuted!");
    let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
    let itemId = event.currentTarget.id.replace("downtime-dnd5e-edit-", "");
    if (!itemId) {
      ui.notifications.warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), { permanent: true });
      return;
    }
    await TrackingAndTraining.editFromSheet(actor.id, itemId, DROPDOWN_OPTIONS);
  });

  // DELETE DOWNTIME ACTIVITY
  html.find(".downtime-dnd5e-delete").click(async (event) => {
    event.preventDefault();
    // console.log("Delete Item excuted!");
    let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
    let itemId = event.currentTarget.id.replace("downtime-dnd5e-delete-", "");
    if (!itemId) {
      ui.notifications.warn(game.i18n.localize("downtime-dnd5e.NoIdWarning", { permanent: true }));
      return;
    }
    await TrackingAndTraining.deleteFromSheet(actor.id, itemId);
  });

  // EDIT PROGRESS VALUE
  html.find(".downtime-dnd5e-override").change(async (event) => {
    event.preventDefault();
    // console.log("Progress Override excuted!");
    let field = event.currentTarget;
    let itemId = event.currentTarget.id.replace("downtime-dnd5e-override-", "");
    if (!itemId) {
      ui.notifications.warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), { permanent: true });
      return;
    }
    let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
    let thisItem = allItems.filter((obj) => obj.id === itemId)[0];
    if (isNaN(field.value)) {
      field.value = thisItem.progress;
      ui.notifications.warn(game.i18n.localize("downtime-dnd5e.InvalidNumberWarning"));
    } else {
      TrackingAndTraining.updateItemProgressFromSheet(actor.id, itemId, field.value);
    }
  });

  // ROLL TO TRAIN
  html.find(".downtime-dnd5e-roll").click(async (event) => {
    event.preventDefault();
    // console.log("Roll Item excuted!");
    let itemId = event.currentTarget.id.replace("downtime-dnd5e-roll-", "");
    if (!itemId) {
      ui.notifications.warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), { permanent: true });
      return;
    }
    await TrackingAndTraining.progressItem(actor.id, itemId);
  });

  // TOGGLE DESCRIPTION
  // Modified version of _onItemSummary from dnd5e system located in
  // dnd5e/module/actor/sheets/base.js
  html.find(".downtime-dnd5e-toggle-desc").click(async (event) => {
    event.preventDefault();
    // console.log("Toggle Acvtivity Info excuted!");

    // Set up some variables
    let fieldId = event.currentTarget.id;
    let itemId = fieldId.replace("downtime-dnd5e-toggle-desc-", "");
    if (!itemId) {
      ui.notifications.warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), { permanent: true });
      return;
    }
    let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
    let item = allItems.filter((obj) => obj.id === itemId)[0];
    let desc = item.description || "";
    let li = $(event.currentTarget).parents(".item");

    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      let div = $(`<div class="item-summary">${desc}</div>`);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  });

  // EXPORT
  html.find(".downtime-dnd5e-export").click(async (event) => {
    event.preventDefault();
    console.log("Export excuted!");
    let actorId = actor.id;
    TrackingAndTraining.exportItems(actor.id);
  });

  // IMPORT
  html.find(".downtime-dnd5e-import").click(async (event) => {
    event.preventDefault();
    console.log("Import excuted!");
    let actorId = actor.id;
    await TrackingAndTraining.importItems(actor.id);
  });

  // OPEN AUDIT LOG
  html.find(".downtime-dnd5e-audit").click(async (event) => {
    event.preventDefault();
    // console.log("GM Audit excuted!");
    new AuditLog(actor).render(true);
  });
}

function getTemplateData(data) {
  let notShowToUserEditMode = game.settings.get(CONSTANTS.MODULE_NAME, "gmOnlyEditMode") && !game.users.current.isGM;
  let showImportButton = game.settings.get(CONSTANTS.MODULE_NAME, "showImportButton");
  data.showImportButton = showImportButton;
  data.showToUserEditMode = !notShowToUserEditMode;
  return data;
}

// Determines whether or not the sheet should have its width adjusted.
// If the setting for extra width is set, and if the sheet is of a type for which
// we have training enabled, this returns true.
function adjustSheetWidth(app) {
  let settingEnabled = !!game.settings.get(CONSTANTS.MODULE_NAME, "extraSheetWidth");
  let sheetHasTab =
    (app.object.type === "npc" && game.settings.get(CONSTANTS.MODULE_NAME, "enableTrainingNpc")) ||
    (app.object.type === "character" && game.settings.get(CONSTANTS.MODULE_NAME, "enableTraining"));
  let currentWidth = app.position.width;
  let defaultWidth = app.options.width;
  let sheetIsSmaller = currentWidth < defaultWidth + game.settings.get(CONSTANTS.MODULE_NAME, "extraSheetWidth");
  let sheetIsMonsterBlock = app.options.classes.includes("monsterblock");

  return settingEnabled && sheetHasTab && sheetIsSmaller && !sheetIsMonsterBlock;
}

async function migrateAllActors() {
  const LATEST_MIGRATION = 1;

  let updatesRequired = [];

  // Start loop through actors
  for (var i = 0; i < game.actors.contents.length; i++) {
    let a = game.actors.contents[i];

    // If the user can't update the actor, skip it
    let currentUserId = game.userId;
    let currentUserOwnsActor = a.permission[currentUserId] === 3;
    let currentUserIsGm = game.user.isGM;
    if (!currentUserOwnsActor && !currentUserIsGm) {
      console.log(game.i18n.localize("downtime-dnd5e.Skipping") + ": " + a.data.name);
      continue;
    }

    // Flag items that need to be updated
    let itemsToUpdate = 0;
    let allTrainingItems = a.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
    for (var j = 0; j < allTrainingItems.length; j++) {
      let itemSchemaVersion = allTrainingItems[j].schemaVersion;
      if (itemSchemaVersion === undefined) {
        // Should only happen if it's coming from versions prior to 0.6.0
        allTrainingItems[j].updateMe = true;
        allTrainingItems[j].schemaVersion = 0;
        itemsToUpdate++;
      } else if (allTrainingItems[j].schemaVersion < LATEST_MIGRATION) {
        // If the latest is newer, gotta update
        allTrainingItems[j] = true;
        itemsToUpdate++;
      }
    }

    // If items need to be updated, add them to the updatesRequired array
    if (itemsToUpdate > 0) {
      updatesRequired.push({ actor: a, items: allTrainingItems });
    }
  }

  if (updatesRequired.length > 0) {
    // Prompt to see if the user wants to update their actors.
    let doUpdate = false;
    let content = `<h3>${game.i18n.localize("downtime-dnd5e.MigrationPromptTitle")}</h3>
                   <p>${game.i18n.format("downtime-dnd5e.MigrationPromptText1")}</p>
                   <h3>${game.i18n.localize("downtime-dnd5e.MigrationPromptBackupWarning")}</h3>
                   <p>${game.i18n.format("downtime-dnd5e.MigrationPromptText2")}</p>
                   <hr>
                   <p>${game.i18n.format("downtime-dnd5e.MigrationPromptText3", { num: updatesRequired.length })}</p>`;
    // Insert dialog
    new Dialog({
      title: `${CONSTANTS.MODULE_NAME}`,
      content: content,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize("downtime-dnd5e.MigrationPromptYes"),
          callback: () => (doUpdate = true),
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize("downtime-dnd5e.MigrationPromptNo"),
          callback: () => (doUpdate = false),
        },
      },
      default: "no",
      close: async (html) => {
        // If they said yes, we migrate
        if (doUpdate) {
          for (var i = 0; i < updatesRequired.length; i++) {
            let thisUpdate = updatesRequired[i];
            let a = thisUpdate.actor;
            let allTrainingItems = thisUpdate.items;

            // Backup old data and store in backup flag
            let backup = { trainingItems: allTrainingItems, timestamp: new Date() };
            ui.notifications.notify(game.i18n.localize("downtime-dnd5e.BackingUpDataFor") + ": " + a.data.name);
            console.log(game.i18n.localize("downtime-dnd5e.BackingUpDataFor") + ": " + a.data.name);
            await a.setFlag(CONSTANTS.MODULE_NAME, "backup", backup);

            // Alert that we're migrating actor
            ui.notifications.notify(game.i18n.localize("downtime-dnd5e.UpdatingDataFor") + ": " + a.data.name);
            console.log(game.i18n.localize("downtime-dnd5e.UpdatingDataFor") + ": " + a.data.name);

            // Loop through items and update if they need updates
            for (var j = 0; j < allTrainingItems.length; j++) {
              if (allTrainingItems[j].updateMe) {
                try {
                  if (allTrainingItems[j].schemaVersion < 1) {
                    allTrainingItems[j] = migrateToVersion1(allTrainingItems[j]);
                  }
                  // Repeat line for new versions as needed
                } catch (err) {
                  console.error(err);
                  ui.notifications.warn(
                    game.i18n.localize("downtime-dnd5e.ProblemUpdatingDataFor") + ": " + a.data.name
                  );
                  console.error(game.i18n.localize("downtime-dnd5e.ProblemUpdatingDataFor") + ": " + a.data.name);
                }
                delete allTrainingItems[j].updateMe;
              }
            }
            await a.setFlag(CONSTANTS.MODULE_NAME, "trainingItems", allTrainingItems);
            ui.notifications.notify(game.i18n.localize("downtime-dnd5e.SuccessUpdatingDataFor") + ": " + a.data.name);
            console.log(game.i18n.localize("downtime-dnd5e.SuccessUpdatingDataFor") + ": " + a.data.name);
          }
        }
      },
    }).render(true);
  }
}

Hooks.on(`renderActorSheet`, (app, html, data) => {
  if (tidy5eApi?.isTidy5eSheet?.(app)) {
    return;
  }

  let widenSheet = adjustSheetWidth(app);
  if (widenSheet) {
    let newPos = { width: app.position.width + game.settings.get(CONSTANTS.MODULE_NAME, "extraSheetWidth") };
    app.setPosition(newPos);
  }
  addTrainingTab(app, html, data).then(function () {
    if (app.activateTrainingTab) {
      app._tabs[0].activate("training");
    }
  });
});

Hooks.on(`TrainingTabReady`, (app, html, data) => {
  // log("Downtime tab ready!");
});

/**
 * An instance of the Tidy 5e Sheet API.
 * This becomes available when the `tidy5e-sheet.ready` hook fires.
 */
let tidy5eApi = undefined;

Hooks.on("tidy5e-sheet.ready", (api) => {
  tidy5eApi = api;
  api.registerCharacterTab(
    new api.models.HandlebarsTab({
      tabId: "downtime-dnd5e-training-tab",
      path: `modules/${CONSTANTS.MODULE_NAME}/templates/partials/training-section-contents.hbs`,
      title: () => game.settings.get(CONSTANTS.MODULE_NAME, "tabName"),
      getData: (data) => getTemplateData(data),
      enabled: (data) => {
        const showToUser = game.users.current.isGM || !game.settings.get(CONSTANTS.MODULE_NAME, "gmOnlyMode");
        return data.editable && showToUser && game.settings.get(CONSTANTS.MODULE_NAME, "enableTraining");
      },
      onRender: ({ app, element, data }) => {
        activateTabListeners(data.actor, $(element));
      },
      tabContentsClasses: ["downtime-dnd5e"],
      activateDefaultSheetListeners: false,
    })
  );
  api.registerNpcTab(
    new api.models.HandlebarsTab({
      tabId: "downtime-dnd5e-training-tab",
      path: `modules/${CONSTANTS.MODULE_NAME}/templates/partials/training-section-contents.hbs`,
      title: () => game.settings.get(CONSTANTS.MODULE_NAME, "tabName"),
      getData: (data) => getTemplateData(data),
      enabled: (data) => {
        const showToUser = game.users.current.isGM || !game.settings.get(CONSTANTS.MODULE_NAME, "gmOnlyMode");
        return data.editable && showToUser && game.settings.get(CONSTANTS.MODULE_NAME, "enableTrainingNpc");
      },
      onRender: ({ app, element, data }) => {
        activateTabListeners(data.actor, $(element));
      },
      tabContentsClasses: ["downtime-dnd5e"],
      activateDefaultSheetListeners: false,
    })
  );
});

// Open up for other people to use
/** @deprecated remain for retrocompatibility */
export function crashTNT() {
  async function updateActivityProgress(actorName, itemName, newProgress) {
    await API.updateActivityProgress(actorName, itemName, newProgress);
    /*
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
		*/
  }

  function getActivitiesForActor(actorName) {
    return API.getActivitiesForActor(actorName);
    /*
		let actor = game.actors.getName(actorName);
		if (actor) {
			let allItems = actor.getFlag(CONSTANTS.MODULE_NAME, "trainingItems") || [];
			return allItems;
		} else {
			ui.notifications.warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"));
		}
		*/
  }

  function getActivity(actorName, itemName) {
    return API.getActivity(actorName, itemName);
    /*
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
		*/
  }

  return {
    updateActivityProgress: updateActivityProgress,
    getActivity: getActivity,
    getActivitiesForActor: getActivitiesForActor,
  };
}
