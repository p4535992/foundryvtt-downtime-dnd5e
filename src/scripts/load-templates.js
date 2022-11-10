export const preloadTemplates = async function () {
	const templatePaths = [
		"modules/5e-training/templates/partials/ability.hbs",
		"modules/5e-training/templates/partials/skill.hbs",
		"modules/5e-training/templates/partials/tool.hbs",
		"modules/5e-training/templates/partials/macro.hbs",
		"modules/5e-training/templates/partials/fixed.hbs",
	];
	return loadTemplates(templatePaths);
};
