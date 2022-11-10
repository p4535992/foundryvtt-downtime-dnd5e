export default class Category {
	constructor() {
		this.id = randomID();
		this.name = game.i18n.localize("downtime-5e.NewCategory");
		this.description = "";
	}
}
