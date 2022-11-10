import CONSTANTS from "./constants.js";

export const preloadTemplates = async function () {
	const templatePaths = [
		`modules/${CONSTANTS.MODULE_NAME}/templates/partials/ability.hbs`,
		`modules/${CONSTANTS.MODULE_NAME}/templates/partials/skill.hbs`,
		`modules/${CONSTANTS.MODULE_NAME}/templates/partials/tool.hbs`,
		`modules/${CONSTANTS.MODULE_NAME}/templates/partials/macro.hbs`,
		`modules/${CONSTANTS.MODULE_NAME}/templates/partials/fixed.hbs`,
	];
	return loadTemplates(templatePaths);
};
