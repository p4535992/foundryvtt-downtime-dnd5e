export default class Category {
  constructor() {
    this.id = randomID();
    this.name = game.i18n.localize("downtime-dnd5e.NewCategory");
    this.description = "";
  }
}
