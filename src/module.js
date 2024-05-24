/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import JavaScript modules
// Import TypeScript modules
import { registerSettings } from "./scripts/settings.js";
import { initHooks, readyHooks, setupHooks } from "./scripts/5e-training.js";
import CONSTANTS from "./scripts/constants.js";
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", async () => {
    // log(`${CONSTANTS.MODULE_ID} | Initializing ${CONSTANTS.MODULE_ID}`);
    // Register custom module settings
    registerSettings();
    initHooks();
    // Preload Handlebars templates
    // await preloadTemplates();
});
/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
    // Do anything after initialization but before ready
    setupHooks();
});
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", async () => {
    // Do anything once the module is ready
    // if (!game.modules.get('lib-wrapper')?.active && game.user?.isGM) {
    //   let word = 'install and activate';
    //   if (game.modules.get('lib-wrapper')) word = 'activate';
    //   throw Logger.error(`Requires the 'libWrapper' module. Please ${word} it.`);
    // }
    // if (!game.modules.get('socketLib')?.active && game.user?.isGM) {
    //   let word = 'install and activate';
    //   if (game.modules.get('socketLib')) word = 'activate';
    //   throw Logger.error(`Requires the 'socketLib' module. Please ${word} it.`);
    // }
    readyHooks();
});
/* ------------------------------------ */
/* Other Hooks							*/
/* ------------------------------------ */
Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(CONSTANTS.MODULE_ID);
});
