import CONSTANTS from "./constants.js";

export const preloadTemplates = async function () {
  const templatePaths = [
    `modules/${CONSTANTS.MODULE_ID}/templates/partials/ability.hbs`,
    `modules/${CONSTANTS.MODULE_ID}/templates/partials/skill.hbs`,
    `modules/${CONSTANTS.MODULE_ID}/templates/partials/tool.hbs`,
    `modules/${CONSTANTS.MODULE_ID}/templates/partials/macro.hbs`,
    `modules/${CONSTANTS.MODULE_ID}/templates/partials/fixed.hbs`,
    `modules/${CONSTANTS.MODULE_ID}/templates/partials/training-section-contents.hbs`,
  ];
  return loadTemplates(templatePaths);
};
