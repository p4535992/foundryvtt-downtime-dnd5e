import CONSTANTS from "./constants.js";

export default class CategoryApp extends FormApplication {
    constructor(object = {}, options = {}) {
        super(object, options);
        // game.users.apps.push(this);
        // this.item = data.item;
        this.category = object.category;
        this.actor = object.actor;
        this.editing = object.editMode;
        this.world = object.world;
        this.sheet = object.sheet || object.actor.sheet;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "downtime-dnd5e-downtime-category-app",
            template: `modules/${CONSTANTS.MODULE_ID}/templates/category-app.hbs`,
            title: game.i18n.localize("downtime-dnd5e.CreateEditCategoryAppTitle"),
            width: 400,
            resizable: false,
            closeOnSubmit: true,
        });
    }

    async getData(options = {}) {
        let originalData = super.getData();

        return mergeObject(originalData, {
            actor: originalData.object.actor,
            category: originalData.object.category,
        });
    }

    // Called on submission, handle doing stuff.
    async _updateObject(event, formData) {
        let actorId = formData.actorId;
        let actor = game.actors.get(actorId);
        let allCategories = [];
        if (this.world) {
            allCategories = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories) || [];
        } else {
            allCategories = actor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories) || [];
        }

        let newCategory = {};

        // Build category data
        newCategory.id = formData.categoryId;
        newCategory.name = formData.nameInput || game.i18n.localize("downtime-dnd5e.UnnamedCategory");
        newCategory.description = formData.descriptionInput || "";

        // See if category already exists
        let categoryIdx = allCategories.findIndex((obj) => obj.id === newCategory.id);

        // Update / Replace as necessary
        if (categoryIdx > -1) {
            allCategories[categoryIdx] = newCategory;
        } else {
            allCategories.push(newCategory);
        }

        // Update actor and flags
        if (this.world) {
            await game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldCategories, allCategories);
        } else {
            await actor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.categories, allCategories);
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        // add listeners here
    }
}
