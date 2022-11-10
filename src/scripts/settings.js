import CONSTANTS from "./constants.js";

export function registerSettings() {
	// Stores data about migrations. This gets updated to the module's current version
	// any time a migration is complete
	game.settings.register(CONSTANTS.MODULE_NAME, "lastMigrationApplied", {
		scope: "world",
		config: false,
		default: 0,
		type: Number,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "showImportButton", {
		name: game.i18n.localize("downtime-5e.SettingShowImportButton"),
		hint: game.i18n.localize("downtime-5e.SettingShowImportButtonHint"),
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "gmOnlyMode", {
		name: game.i18n.localize("downtime-5e.SettingGmOnlyMode"),
		hint: game.i18n.localize("downtime-5e.SettingGmOnlyModeHint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "gmOnlyEditMode", {
		name: game.i18n.localize("downtime-5e.SettingGmOnlyEditMode"),
		hint: game.i18n.localize("downtime-5e.SettingGmOnlyEditModeHint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "enableTraining", {
		name: game.i18n.localize("downtime-5e.SettingShowDowntimeTabPc"),
		hint: game.i18n.localize("downtime-5e.SettingShowDowntimeTabPcHint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "enableTrainingNpc", {
		name: game.i18n.localize("downtime-5e.SettingShowDowntimeTabNpc"),
		hint: game.i18n.localize("downtime-5e.SettingShowDowntimeTabNpcHint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "tabName", {
		name: game.i18n.localize("downtime-5e.SettingTabName"),
		hint: game.i18n.localize("downtime-5e.SettingTabNameHint"),
		scope: "world",
		config: true,
		default: "Downtime",
		type: String,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "extraSheetWidth", {
		name: game.i18n.localize("downtime-5e.SettingExtraSheetWidth"),
		hint: game.i18n.localize("downtime-5e.SettingExtraSheetWidthHint"),
		scope: "client",
		config: true,
		default: 50,
		type: Number,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "totalToComplete", {
		name: game.i18n.localize("downtime-5e.SettingDefaultCompletionTarget"),
		hint: game.i18n.localize("downtime-5e.SettingDefaultCompletionTargetHint"),
		scope: "world",
		config: true,
		default: 300,
		type: Number,
	});

	game.settings.register(CONSTANTS.MODULE_NAME, "announceCompletionFor", {
		name: game.i18n.localize("downtime-5e.SettingAnnounceActivityCompletionFor"),
		hint: game.i18n.localize("downtime-5e.SettingAnnounceActivityCompletionForHint"),
		scope: "world",
		config: true,
		type: String,
		choices: {
			pc: game.i18n.localize("downtime-5e.PcsOnly"),
			npc: game.i18n.localize("downtime-5e.NpcsOnly"),
			both: game.i18n.localize("downtime-5e.PcsAndNpcs"),
			none: game.i18n.localize("downtime-5e.None"),
		},
		default: "pc",
	});
}
