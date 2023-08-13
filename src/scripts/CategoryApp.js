import CONSTANTS from "./constants.js";

export default class CategoryApp extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "downtime-dnd5e-downtime-category-app",
      template: `modules/${CONSTANTS.MODULE_NAME}/templates/category-app.hbs`,
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
    let allCategories = actor.getFlag(CONSTANTS.MODULE_NAME, "categories") || [];
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
    await actor.setFlag(CONSTANTS.MODULE_NAME, "categories", allCategories);
  }

  activateListeners(html) {
    super.activateListeners(html);
    // add listeners here
  }
}
