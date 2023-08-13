import CONSTANTS from "./constants.js";

export default class TrackedItem {
  constructor() {
    this.id = randomID();
    this.name = game.i18n.localize("downtime-dnd5e.NewItem");
    this.img = "icons/svg/book.svg";
    this.category = "";
    this.description = "";
    this.progressionStyle = "ABILITY";
    this.ability = "int";
    this.skill = null;
    this.tool = null;
    this.fixedIncrease = null;
    this.macroName = null;
    this.dc = null;
    this.progress = 0;
    this.completionAt = game.settings.get(CONSTANTS.MODULE_NAME, "totalToComplete");
    this.changes = [];
    this.schemaVersion = 1;
  }
}
