import CONSTANTS from "./constants.js";
import { GMConfig } from "./settings/gmConfig.js";

export function registerSettings() {
  game.settings.registerMenu(CONSTANTS.MODULE_ID, "resetAllSettings", {
    name: `downtime-dnd5e.SettingReset.name`,
    hint: `downtime-dnd5e.SettingReset.hint`,
    icon: "fas fa-coins",
    type: ResetSettingsDialog,
    restricted: true,
  });

  game.settings.registerMenu(CONSTANTS.MODULE_ID, "config", {
    name: "Config",
    label: "Access Config Menu",
    hint: "Access the configuration menu to find additional options.",
    icon: "fas fa-desktop",
    type: GMConfig,
    restricted: true,
  });

  // Stores data about migrations. This gets updated to the module's current version
  // any time a migration is complete
  game.settings.register(CONSTANTS.MODULE_ID, "lastMigrationApplied", {
    scope: "world",
    config: false,
    default: 0,
    type: Number,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "showImportButton", {
    name: game.i18n.localize("downtime-dnd5e.SettingShowImportButton"),
    hint: game.i18n.localize("downtime-dnd5e.SettingShowImportButtonHint"),
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "gmOnlyMode", {
    name: game.i18n.localize("downtime-dnd5e.SettingGmOnlyMode"),
    hint: game.i18n.localize("downtime-dnd5e.SettingGmOnlyModeHint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "gmOnlyEditMode", {
    name: game.i18n.localize("downtime-dnd5e.SettingGmOnlyEditMode"),
    hint: game.i18n.localize("downtime-dnd5e.SettingGmOnlyEditModeHint"),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "enableTraining", {
    name: game.i18n.localize("downtime-dnd5e.SettingShowDowntimeTabPc"),
    hint: game.i18n.localize("downtime-dnd5e.SettingShowDowntimeTabPcHint"),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "enableTrainingNpc", {
    name: game.i18n.localize("downtime-dnd5e.SettingShowDowntimeTabNpc"),
    hint: game.i18n.localize("downtime-dnd5e.SettingShowDowntimeTabNpcHint"),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "tabName", {
    name: game.i18n.localize("downtime-dnd5e.SettingTabName"),
    hint: game.i18n.localize("downtime-dnd5e.SettingTabNameHint"),
    scope: "world",
    config: true,
    default: "Downtime",
    type: String,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "extraSheetWidth", {
    name: game.i18n.localize("downtime-dnd5e.SettingExtraSheetWidth"),
    hint: game.i18n.localize("downtime-dnd5e.SettingExtraSheetWidthHint"),
    scope: "client",
    config: true,
    default: 50,
    type: Number,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "totalToComplete", {
    name: game.i18n.localize("downtime-dnd5e.SettingDefaultCompletionTarget"),
    hint: game.i18n.localize("downtime-dnd5e.SettingDefaultCompletionTargetHint"),
    scope: "world",
    config: true,
    default: 300,
    type: Number,
  });

  game.settings.register(CONSTANTS.MODULE_ID, "announceCompletionFor", {
    name: game.i18n.localize("downtime-dnd5e.SettingAnnounceActivityCompletionFor"),
    hint: game.i18n.localize("downtime-dnd5e.SettingAnnounceActivityCompletionForHint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      pc: game.i18n.localize("downtime-dnd5e.PcsOnly"),
      npc: game.i18n.localize("downtime-dnd5e.NpcsOnly"),
      both: game.i18n.localize("downtime-dnd5e.PcsAndNpcs"),
      none: game.i18n.localize("downtime-dnd5e.None"),
    },
    default: "pc",
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, {
    scope: "world",
    config: false,
    default: [],
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories, {
    scope: "world",
    config: false,
    default: [],
  });
}

class ResetSettingsDialog extends FormApplication {
  constructor(...args) {
    //@ts-ignore
    super(...args);
    //@ts-ignore
    return new Dialog({
      title: game.i18n.localize(`downtime-dnd5e.SettingReset.dialogs.title`),
      content:
        '<p style="margin-bottom:1rem;">' + game.i18n.localize(`downtime-dnd5e.SettingReset.dialogs.content`) + "</p>",
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`downtime-dnd5e.SettingReset.dialogs.confirm`),
          callback: async () => {
            for (let setting of game.settings.storage
              .get("world")
              .filter((setting) => setting.key.startsWith(`${CONSTANTS.MODULE_ID}.`))) {
              console.log(`Reset setting '${setting.key}'`);
              await setting.delete();
            }
            //window.location.reload();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`downtime-dnd5e.SettingReset.dialogs.cancel`),
        },
      },
      default: "cancel",
    });
  }

  async _updateObject(event, formData) {
    // do nothing
  }
}
