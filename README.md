# Downtime Dnd5e

![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/foundryvtt-downtime-dnd5e/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) 

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fdowntime-dnd5e&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=downtime-dnd5e) 

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-downtime-dnd5e%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-downtime-dnd5e%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fdowntime-dnd5e%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/downtime-dnd5e/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/foundryvtt-downtime-dnd5e/total?style=for-the-badge)

[![Translation status](https://weblate.foundryvtt-hub.com/widgets/downtime-dnd5e/-/287x66-black.png)](https://weblate.foundryvtt-hub.com/engage/downtime-dnd5e/)

### If you want to buy me a coffee [![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/p4535992)


So this is another downtime project because [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training) is no Longer Being Maintained and [Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking) is not been updated for a while.

This project was created as a continuation of the crash project [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training)  but with the code rewritten to follow "standard" development rules like use the module id as prefix for the css rule, the standard folder structure ecc.

I will try on god time will to "merge" these two modules.

Does your group do a lot of downtime activities? Got a lot of factions? Need a simple quest log or timer? Do you have a hard time keeping track of... well... anything? Then this is the mod for you!

_Downtime 5e_ is a module for the dnd5e system in Foundry VTT that adds a tab to all actor sheets (character and NPC) that lets you add and keep track of just about anything you can keep track of with a number and a progress bar. Finally working on that History proficiency? It's in here. Learning how to use thieves tools? In here. Need to keep track of how much of the town's water supply you've accidentally (I hope) poisoned? Quest progress! Countdown timers! Faction reputation! If you can measure it with a percentage, you can track it with this module.

## NOTE: This module is under maintenance, I have no plans to update or add features. However, I will try to fix any bugs as possible. Any contribution is welcome.

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/p4535992/foundryvtt-downtime-dnd5e/master/src/module.json`
4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

## NOTE: Difference between [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training), [Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking) and [Downtime Dnd5e](https://github.com/p4535992/foundryvtt-downtime-dnd5e)

[Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking) **is not touched for over 10 months**  mod focuses more on the implementation of "skill challenge" type downtime activities like the ones you find in xanathar's guide to everything. it lets you construct activities that are made up of multiple rolls, maybe for different skills/abilities/etc that you have to choose between, creating a sort of branching structure with varying dc's for each one. it gives you different outputs depending on how many successes/failures you get and how the activity is configured

[Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training) **is no Longer Being Maintained** mod is more of a general progress tracking tool. it's a little bit more flexible/less specifically scoped and the activities you can create are nowhere near as complex as his, but it's more useful for tracking things that take multiple days/weeks to complete and things that are less "one and done".

[Downtime Dnd5e](https://github.com/p4535992/foundryvtt-downtime-dnd5e) This project was created as a continuation of the crash project [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training)  but with the code rewritten to follow "standard" development rules like use the module id as prefix for the css rule, the standard folder structure ecc.

## How To Use

Check out the [wiki](/wiki/Home.md) for instructions, screenshots, sample macros, compatibility info, API documentation, and more!

**Note on the execution of the macro behavior:** executes Macro command, giving speaker, actor, token, character, and event constants. This is recognized as the macro itself. Pass an event as the first argument. Is the same concept used from [Item Macro](https://github.com/Foundry-Workshop/Item-Macro/), but without the item, also the main reference is not the item, but the actor, we used the actor set as character by default or the first owned actor by the user, same concept of [Item Piles](https://github.com/fantasycalendar/FoundryVTT-ItemPiles). The macro is launched under as a asynchronus call so  `await ` command are good.

## Api

`game.modules.get('downtime-dnd5e').api.updateActivityProgress(actorName, itemName, newProgress) => Promise<Void>`

`game.modules.get('downtime-dnd5e').api.getActivitiesForActor(actorName) => List of Activities Objects`

`game.modules.get('downtime-dnd5e').api.getActivity(actorName, itemName) => Activity Object`

# Build

## Install all packages

```bash
npm install
```

### dev

`dev` will let you develop you own code with hot reloading on the browser

```bash
npm run dev
```

## npm build scripts

### build

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run build
```

### build-watch

`build-watch` will build and watch for changes, rebuilding automatically.

```bash
npm run build-watch
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

### lint and lint:fix

`lint` launch the eslint process based on the configuration [here](./.eslintrc.json)

```bash
npm run-script lint
```

`lint:fix` launch the eslint process with the fix argument

```bash
npm run-script lint:fix
```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/foundryvtt-downtime-dnd5e/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

- [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training) with [Creative Commons Attribution 4.0 International License.](https://github.com/crash1115/5e-training/blob/master/LICENSE)

- [Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking) with [MIT](https://github.com/Ethck/Ethck-s-Downtime-Tracking/blob/master/LICENSE)

This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Attributions and Special Thanks

- Thanks to KLO#1490 for Korean translations
- Thanks to MS-PBS for Spanish translations
- Thanks Varriount for some CSS fixes
- Thanks to crash1115 for the module [Crash's Tracking & Training (formerly known as Crash's Downtime Tracking)](https://github.com/crash1115/5e-training)
- Thanks to Ethck for the module [Ethck's 5e Downtime Tracking](https://github.com/Ethck/Ethck-s-Downtime-Tracking)