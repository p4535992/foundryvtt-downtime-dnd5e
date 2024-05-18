import { preloadTemplates } from "./load-templates.js";
import { registerSettings } from "./settings.js";
import { registerHelpers } from "./handlebars-helpers.js";
import { migrateToVersion1 } from "./migrations/migrationNumber1.js";
import AuditLog from "./AuditLog.js";
import TrackingAndTraining from "./TrackingAndTraining.js";
import CONSTANTS from "./constants.js";
import API from "./api.js";
import { debug, error, info, warn, log } from "./lib/lib.js";

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
};

export const readyHooks = () => {
    API.crashTNT = crashTNT();
    game.modules.get(CONSTANTS.MODULE_ID).api = API;
    migrateAllActors();
};

// The Meat And Potatoes
async function addTrainingTab(app, html, data) {
    // Determine if we should show the downtime tab
    const enableCharacter = game.settings.get(CONSTANTS.MODULE_ID, "enableTraining");
    const enableNpc = game.settings.get(CONSTANTS.MODULE_ID, "enableTrainingNpc");
    const gmOnlyMode = game.settings.get(CONSTANTS.MODULE_ID, "gmOnlyMode");

    let showToUser = game.user.isGM || (app.object.isOwner && gmOnlyMode);

    if (!showToUser) return;
    if (data.isCharacter && !enableCharacter) return;
    if (data.isNPC && !enableNpc) return;

    // Get our actor and our flags
    let actor = game.actors.contents.find((a) => a._id === data.actor._id);

    // Update the nav menu
    let tabName = game.settings.get(CONSTANTS.MODULE_ID, "tabName");
    let trainingTabBtn = $('<a class="item" data-tab="training">' + tabName + "</a>");
    let tabs = html.find('.tabs[data-group="primary"]');
    tabs.append(trainingTabBtn);

    // Get the data to render the template
    const templateData = getTemplateData(data);

    // Create the tab content
    let trainingTabHtml = '';
    let sheet = html.find(".tab-body");
    if (app instanceof ActorSheet5eCharacter2) {
        sheet = html.find(".sheet-body");
        trainingTabHtml = $(
            await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/training-section-v2.hbs`, templateData),
        );
    } else {
        trainingTabHtml = $(
            await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/training-section.hbs`, templateData)
        );
    }
    sheet.append(trainingTabHtml);

    // Set up our big list of dropdown options
    activateTabListeners(actor, app, html, data);

    // Set Training Tab as Active
    html.find('.tabs .item[data-tab="training"]').click((ev) => {
        app.activateTrainingTab = true;
    });

    // Unset Training Tab as Active
    html.find('.tabs .item:not(.tabs .item[data-tab="training"])').click((ev) => {
        app.activateTrainingTab = false;
    });

    //Tab is ready
    Hooks.call(`TrainingTabReady`, app, html, data);
}

function activateTabListeners(actor, app, html, data) {
    let actorTools = TrackingAndTraining.getActorTools(actor.id);
    const ABILITIES = TrackingAndTraining.formatAbilitiesForDropdown();
    const SKILLS = TrackingAndTraining.formatSkillsForDropdown();
    const DROPDOWN_OPTIONS = { abilities: ABILITIES, skills: SKILLS, tools: actorTools };
    let allTrainingItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems);

    // NEW CATEGORY
    html.find(".downtime-dnd5e-new-category").click(async (event) => {
        event.preventDefault();
        // debug("Create Category excuted!");
        await TrackingAndTraining.addCategory(actor.id);
    });

    // NEW WORLD CATEGORY
    html.find(".downtime-dnd5e-world-new-category").click(async (event) => {
        event.preventDefault();
        // debug("Create World Category excuted!");
        await TrackingAndTraining.addCategory(actor.id, true);
    });

    // EDIT CATEGORY
    html.find(".downtime-dnd5e-edit-category").click(async (event) => {
        event.preventDefault();
        // debug("Edit Category excuted!");
        let fieldId = event.currentTarget.id;
        let categoryId = fieldId.replace("downtime-dnd5e-edit-category-", "");
        await TrackingAndTraining.editCategory(actor.id, categoryId);
    });

    // EDIT WORLD CATEGORY
    html.find(".downtime-dnd5e-world-edit-category").click(async (event) => {
        event.preventDefault();
        // debug("Edit Category excuted!");
        let fieldId = event.currentTarget.id;
        let categoryId = fieldId.replace("downtime-dnd5e-world-edit-category-", "");
        await TrackingAndTraining.editCategory(actor.id, categoryId, true);
    });

    // DELETE CATEGORY
    html.find(".downtime-dnd5e-delete-category").click(async (event) => {
        event.preventDefault();
        // debug("Delete Category excuted!");
        let fieldId = event.currentTarget.id;
        let categoryId = fieldId.replace("downtime-dnd5e-delete-category-", "");
        await TrackingAndTraining.deleteCategory(actor.id, categoryId);
    });

    // DELETE WORLD CATEGORY
    html.find(".downtime-dnd5e-world-delete-category").click(async (event) => {
        event.preventDefault();
        // debug("Delete Category excuted!");
        let fieldId = event.currentTarget.id;
        let categoryId = fieldId.replace("downtime-dnd5e-world-delete-category-", "");
        await TrackingAndTraining.deleteCategory(actor.id, categoryId, true);
    });

    // ADD NEW DOWNTIME ACTIVITY
    html.find(".downtime-dnd5e-add").click(async (event) => {
        event.preventDefault();
        // debug("Create Item excuted!");
        await TrackingAndTraining.addItem(actor.id, DROPDOWN_OPTIONS);
    });

    // ADD WORLD NEW DOWNTIME ACTIVITY
    html.find(".downtime-dnd5e-world-add").click(async (event) => {
        event.preventDefault();
        // debug("Create Item excuted!");
        await TrackingAndTraining.addItem(actor.id, DROPDOWN_OPTIONS, true);
    });

    // EDIT DOWNTIME ACTIVITY
    html.find(".downtime-dnd5e-edit").click(async (event) => {
        event.preventDefault();
        // debug("Edit Item excuted!");
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-edit-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        await TrackingAndTraining.editFromSheet(actor.id, itemId, DROPDOWN_OPTIONS);
    });

    // EDIT WORLD DOWNTIME ACTIVITY
    html.find(".downtime-dnd5e-world-edit").click(async (event) => {
        event.preventDefault();
        // debug("Edit Item excuted!");
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-world-edit-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        await TrackingAndTraining.editFromSheet(actor.id, itemId, DROPDOWN_OPTIONS, true);
    });

    // DELETE DOWNTIME ACTIVITY
    html.find(".downtime-dnd5e-delete").click(async (event) => {
        event.preventDefault();
        // debug("Delete Item excuted!");
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-delete-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning", true));
            return;
        }
        await TrackingAndTraining.deleteFromSheet(actor.id, itemId);
    });

    // DELETE WORLD DOWNTIME ACTIVITY
    html.find(".downtime-dnd5e-world-delete").click(async (event) => {
        event.preventDefault();
        // debug("Delete Item excuted!");
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-world-delete-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning", true));
            return;
        }
        await TrackingAndTraining.deleteFromSheet(actor.id, itemId, true);
    });

    // MOVE DOWNTIME ACTIVITY
    html.find(".downtime-dnd5e-move").click(async (event) => {
        event.preventDefault();
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-move-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        // let actor = game.actors.get(actorId);
        let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        // let thisItem = allItems.filter((obj) => obj.id === itemId)[0];

        // Set up some variables
        let world = false;
        let trainingIdx = parseInt(event.currentTarget.dataset.tid);
        let tflags = duplicate(allItems);

        let activity = tflags[trainingIdx];

        let move = 0;
        if ($(event.target).hasClass("fa-chevron-up")) {
            move = -1;
        } else {
            move = 1;
        }
        // loop to bottom
        if (trainingIdx === 0 && move === -1) {
            tflags.push(tflags.shift());
            // loop to top
        } else if (trainingIdx === tflags.length - 1 && move === 1) {
            tflags.unshift(tflags.pop());
            // anywhere in between
        } else {
            tflags[trainingIdx] = tflags[trainingIdx + move];
            tflags[trainingIdx + move] = activity;
        }

        if (world) {
            await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, tflags);
            app.render(true);
        } else {
            await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, tflags);
            app.render(true);
        }
    });

    // MOVE WORLD DOWNTIME ACTIVITY
    html.find(".downtime-dnd5e-world-move").click(async (event) => {
        event.preventDefault();
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-world-move-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        // let actor = game.actors.get(actorId);
        let allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        // let thisItem = allItems.filter((obj) => obj.id === itemId)[0];

        // Set up some variables
        let world = true;
        let trainingIdx = parseInt(event.currentTarget.dataset.tid);
        let tflags = duplicate(allItems);

        let activity = tflags[trainingIdx];

        let move = 0;
        if ($(event.target).hasClass("fa-chevron-up")) {
            move = -1;
        } else {
            move = 1;
        }
        // loop to bottom
        if (trainingIdx === 0 && move === -1) {
            tflags.push(tflags.shift());
            // loop to top
        } else if (trainingIdx === tflags.length - 1 && move === 1) {
            tflags.unshift(tflags.pop());
            // anywhere in between
        } else {
            tflags[trainingIdx] = tflags[trainingIdx + move];
            tflags[trainingIdx + move] = activity;
        }

        if (world) {
            await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, tflags);
            app.render(true);
        } else {
            await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, tflags);
            app.render(true);
        }
    });

    // EDIT PROGRESS VALUE
    html.find(".downtime-dnd5e-override").change(async (event) => {
        event.preventDefault();
        // debug("Progress Override excuted!");
        let field = event.currentTarget;
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-override-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
        let thisItem = allItems.filter((obj) => obj.id === itemId)[0];
        if (isNaN(field.value)) {
            field.value = thisItem.progress;
            warn(game.i18n.localize("downtime-dnd5e.InvalidNumberWarning"), true);
        } else {
            TrackingAndTraining.updateItemProgressFromSheet(actor.id, itemId, field.value);
        }
    });

    // EDIT WORLD PROGRESS VALUE
    html.find(".downtime-dnd5e-world-override").change(async (event) => {
        event.preventDefault();
        // debug("Progress Override excuted!");
        let field = event.currentTarget;
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-world-override-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        let allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
        let thisItem = allItems.filter((obj) => obj.id === itemId)[0];
        if (isNaN(field.value)) {
            field.value = thisItem.progress;
            warn(game.i18n.localize("downtime-dnd5e.InvalidNumberWarning"), true);
        } else {
            TrackingAndTraining.updateItemProgressFromSheet(actor.id, itemId, field.value, true);
        }
    });

    // ROLL TO TRAIN
    html.find(".downtime-dnd5e-roll").click(async (event) => {
        event.preventDefault();
        // debug("Roll Item excuted!");
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-roll-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        await TrackingAndTraining.progressItem(actor.id, itemId);
    });

    // ROLL WORLD TO TRAIN
    html.find(".downtime-dnd5e-world-roll").click(async (event) => {
        event.preventDefault();
        // debug("Roll Item excuted!");
        let itemId = event.currentTarget.id.replace("downtime-dnd5e-world-roll-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        await TrackingAndTraining.progressItem(actor.id, itemId, true);
    });

    // TOGGLE DESCRIPTION
    // Modified version of _onItemSummary from dnd5e system located in
    // dnd5e/module/actor/sheets/base.js
    html.find(".downtime-dnd5e-toggle-desc").click(async (event) => {
        event.preventDefault();
        // debug("Toggle Acvtivity Info excuted!");

        // Set up some variables
        let fieldId = event.currentTarget.id;
        let itemId = fieldId.replace("downtime-dnd5e-toggle-desc-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
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

    // TOGGLE WORLD DESCRIPTION
    // Modified version of _onItemSummary from dnd5e system located in
    // dnd5e/module/actor/sheets/base.js
    html.find(".downtime-dnd5e-world-toggle-desc").click(async (event) => {
        event.preventDefault();
        // debug("Toggle Acvtivity Info excuted!");

        // Set up some variables
        let fieldId = event.currentTarget.id;
        let itemId = fieldId.replace("downtime-dnd5e-world-toggle-desc-", "");
        if (!itemId) {
            warn(game.i18n.localize("downtime-dnd5e.NoIdWarning"), true);
            return;
        }
        let allItems = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
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
        debug("Export excuted!");
        let actorId = actor.id;
        TrackingAndTraining.exportItems(actor.id);
    });

    // IMPORT
    html.find(".downtime-dnd5e-import").click(async (event) => {
        event.preventDefault();
        debug("Import excuted!");
        let actorId = actor.id;
        await TrackingAndTraining.importItems(actor.id);
    });

    // OPEN AUDIT LOG
    html.find(".downtime-dnd5e-audit").click(async (event) => {
        event.preventDefault();
        // debug("GM Audit excuted!");
        new AuditLog(actor).render(true);
    });
}

function getTemplateData(data) {
    let actor = data.actor;
    let notShowToUserEditMode = game.settings.get(CONSTANTS.MODULE_ID, "gmOnlyEditMode") && !game.users.current.isGM;
    let showImportButton = game.settings.get(CONSTANTS.MODULE_ID, "showImportButton");

    let categoriesActor = getProperty(actor, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.categories}`) || [];
    let categoriesWorld = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories) || [];

    let categoriesActorIds = [];
    for (const c of categoriesActor) {
        categoriesActorIds.push(c.id);
    }
    let categoriesWorldIds = [];
    for (const c of categoriesWorld) {
        categoriesWorldIds.push(c.id);
    }

    let activities = getProperty(actor, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.trainingItems}`) || [];
    let activitiesCategorized = activities.filter(
        (activity) => activity.category && categoriesActorIds.includes(activity.category),
    );
    let activitiesUnCategorized = activities.filter(
        (activity) => !activity.category || !categoriesActorIds.includes(activity.category),
    );
    if (!game.user.isGM) {
        activitiesCategorized = activitiesCategorized.filter((activity) => !activity.hidden);
        activitiesUnCategorized = activitiesUnCategorized.filter((activity) => !activity.hidden);
    }

    let activitiesWorld = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities) || [];
    let activitiesWorldCategorized = activitiesWorld.filter(
        (activity) => activity.category && categoriesWorldIds.includes(activity.category),
    );
    let activitiesWorldUnCategorized = activitiesWorld.filter(
        (activity) => !activity.category || !categoriesWorldIds.includes(activity.category),
    );

    if (!game.user.isGM) {
        activitiesWorldCategorized = activitiesWorldCategorized.filter((activity) => !activity.hidden);
        activitiesWorldUnCategorized = activitiesWorldUnCategorized.filter((activity) => !activity.hidden);
    }

    data.showImportButton = showImportButton;
    data.showToUserEditMode = !notShowToUserEditMode;
    data.isGM = game.user.isGM;
    data.activitiesCategorized = activitiesCategorized;
    data.activitiesUnCategorized = activitiesUnCategorized;
    data.activitiesWorldCategorized = activitiesWorldCategorized;
    data.activitiesWorldUnCategorized = activitiesWorldUnCategorized;

    data.categoriesActor = categoriesActor;
    data.categoriesWorld = categoriesWorld;

    return data;
}

// Determines whether or not the sheet should have its width adjusted.
// If the setting for extra width is set, and if the sheet is of a type for which
// we have training enabled, this returns true.
function adjustSheetWidth(app) {
    let settingEnabled = !!game.settings.get(CONSTANTS.MODULE_ID, "extraSheetWidth");
    let sheetHasTab =
        (app.object.type === "npc" && game.settings.get(CONSTANTS.MODULE_ID, "enableTrainingNpc")) ||
        (app.object.type === "character" && game.settings.get(CONSTANTS.MODULE_ID, "enableTraining"));
    let currentWidth = app.position.width;
    let defaultWidth = app.options.width;
    let sheetIsSmaller = currentWidth < defaultWidth + game.settings.get(CONSTANTS.MODULE_ID, "extraSheetWidth");
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
            debug(game.i18n.localize("downtime-dnd5e.Skipping") + ": " + a.data.name);
            continue;
        }

        // Flag items that need to be updated
        let itemsToUpdate = 0;
        let allTrainingItems = a.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
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
            title: `${CONSTANTS.MODULE_ID}`,
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
                        info(game.i18n.localize("downtime-dnd5e.BackingUpDataFor") + ": " + a.data.name, true);
                        debug(game.i18n.localize("downtime-dnd5e.BackingUpDataFor") + ": " + a.data.name);
                        await a.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.backup, backup);

                        // Alert that we're migrating actor
                        info(game.i18n.localize("downtime-dnd5e.UpdatingDataFor") + ": " + a.data.name, true);
                        debug(game.i18n.localize("downtime-dnd5e.UpdatingDataFor") + ": " + a.data.name);

                        // Loop through items and update if they need updates
                        for (var j = 0; j < allTrainingItems.length; j++) {
                            if (allTrainingItems[j].updateMe) {
                                try {
                                    if (allTrainingItems[j].schemaVersion < 1) {
                                        allTrainingItems[j] = migrateToVersion1(allTrainingItems[j]);
                                    }
                                    // Repeat line for new versions as needed
                                } catch (err) {
                                    error(
                                        game.i18n.localize("downtime-dnd5e.ProblemUpdatingDataFor") +
                                            ": " +
                                            a.data.name,
                                        true,
                                        err,
                                    );
                                }
                                delete allTrainingItems[j].updateMe;
                            }
                        }
                        await a.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allTrainingItems);
                        info(game.i18n.localize("downtime-dnd5e.SuccessUpdatingDataFor") + ": " + a.data.name, true);
                        debug(game.i18n.localize("downtime-dnd5e.SuccessUpdatingDataFor") + ": " + a.data.name);
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
        let newPos = { width: app.position.width + game.settings.get(CONSTANTS.MODULE_ID, "extraSheetWidth") };
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
            path: `modules/${CONSTANTS.MODULE_ID}/templates/partials/training-section-contents.hbs`,
            title: () => game.settings.get(CONSTANTS.MODULE_ID, "tabName"),
            getData: (data) => getTemplateData(data),
            enabled: (data) => {
                const showToUser = game.users.current.isGM || !game.settings.get(CONSTANTS.MODULE_ID, "gmOnlyMode");
                return data.editable && showToUser && game.settings.get(CONSTANTS.MODULE_ID, "enableTraining");
            },
            onRender: ({ app, element, data }) => {
                activateTabListeners(data.actor, app, $(element), data);
            },
            tabContentsClasses: ["downtime-dnd5e"],
            activateDefaultSheetListeners: false,
        }),
    );
    api.registerNpcTab(
        new api.models.HandlebarsTab({
            tabId: "downtime-dnd5e-training-tab",
            path: `modules/${CONSTANTS.MODULE_ID}/templates/partials/training-section-contents.hbs`,
            title: () => game.settings.get(CONSTANTS.MODULE_ID, "tabName"),
            getData: (data) => getTemplateData(data),
            enabled: (data) => {
                const showToUser = game.users.current.isGM || !game.settings.get(CONSTANTS.MODULE_ID, "gmOnlyMode");
                return data.editable && showToUser && game.settings.get(CONSTANTS.MODULE_ID, "enableTrainingNpc");
            },
            onRender: ({ app, element, data }) => {
                activateTabListeners(data.actor, app, $(element), data);
            },
            tabContentsClasses: ["downtime-dnd5e"],
            activateDefaultSheetListeners: false,
        }),
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
			warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
			return;
		}
		let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems);
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
		await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, allItems);
		*/
    }

    function getActivitiesForActor(actorName) {
        return API.getActivitiesForActor(actorName);
        /*
		let actor = game.actors.getName(actorName);
		if (actor) {
			let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
			return allItems;
		} else {
			warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"),true);
		}
		*/
    }

    function getActivity(actorName, itemName) {
        return API.getActivity(actorName, itemName);
        /*
		let actor = game.actors.getName(actorName);
		if (!actor) {
			warn(game.i18n.localize("downtime-dnd5e.ActorNotFoundWarning"), true);
			return;
		}
		let allItems = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems) || [];
		let itemIdx = allItems.findIndex((i) => i.name === itemName);
		if (itemIdx < 0) {
			warn(game.i18n.localize("downtime-dnd5e.ItemNotFoundWarning") + ": " + itemName, true);
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
