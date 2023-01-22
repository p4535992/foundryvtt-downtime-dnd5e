Here are just a few sample macros to get you started. I'll be adding more over time.

### Roll a D20 and add result to progress
This is a simple macro that rolls a d20, then adds the result to the progress of actor Joe Smith's tracked item called Roll Lots of D20s.

```js
// Specify our actor and the item we want to deal with.
let actorName = `Joe Smith`;
let itemName = `Roll Lots of D20s`;

// This command takes the names we just specified and fetches the appropriate item.
let item = game.modules.get('downtime-dnd5e').api.getActivity(actorName, itemName);

// Roll the dice! Adding some flavor to describe what the roll is for while we're here.
let roll = new Roll('1d20').roll();
roll.toMessage({flavor:"Increasing our progress by 1d20"});

// Now let's get the result so we can use it.
// The parseInt around the roll ensures we get a number, rather than a string.
let result = parseInt(roll.result);

// Figure out what we want our new progress value to be.
// This is the item's current progress + the result of our d20 roll.
let newProgress = item.progress + result;

// Now we update! This function takes the name of the actor and item we specified at the start,
// then finds that item and sets its progress to some new value we specify.
game.modules.get('downtime-dnd5e').api.updateActivityProgress(actorName, itemName, newProgress);

// All done!
```

***

### Barebones Macro - Modify Tracked Item Progress
This is a template you can use to do whatever you want with. It contains the bare minimum you need to get by modifying an item's progress value.

```js
// Specify our actor and the item we want to deal with.
let actorName = `Actor Name`;
let itemName = `Item Name`;
let item = game.modules.get('downtime-dnd5e').api.getActivity(actorName, itemName);
let newProgressValue;

// Do stuff here.
// Make sure at some point you set newProgressValue equal to some integer before you hit the last line.
    
// Make the update
game.modules.get('downtime-dnd5e').api.updateActivityProgress(actorName, itemName, newProgressValue);
```

***

### Skill Check with DC and Variable Increase
Rolls a designated skill check. If the check meets the DC, progress is increased by an amount equal to some other defined roll.

```js
// ======= CONFIG ========

let actorName = `Test Doggo`; //The name of the actor who owns the activity to update.
let itemName = `Crafting Example`; // The name of the activity to update.
let checkDc = 15; // The DC of the check
let skillToRoll = `med`; // The abbreviation of the skill to roll.
let increaseBy = `1d10`; // The die roll to increase the progress by if the check succeeds.

// ==========================

// Get our actor and item
let item = game.modules.get('downtime-dnd5e').api.getActivity(actorName, itemName);
let actor = game.actors.getName(actorName);

// Make necessary rolls
let skillRoll = await actor.rollSkill(skillToRoll);
let total = skillRoll.total;

// If total is high enough, roll and increase progress
if(total >= checkDc){
    let increaseRoll = await new Roll(increaseBy).toMessage();
    let increase = increaseRoll._roll._total;
    let newProgress = item.progress + increase;
    game.modules.get('downtime-dnd5e').api.updateActivityProgress(actorName, itemName, newProgress);
}
```

***

### Add a new tracked item to an actor (v0.6.2)
Create a new tracked item on an actor. Comments should provide context on available values

```js
// Define our actor and get current tracked items
let actorName = "Test Actor";
let a = game.actors.getName(actorName);
let allTrackedItems = game.modules.get('downtime-dnd5e').api.getActivitiesForActor(actorName);

// Create a new tracked item
// ability, skill, tool, fixedIncrease, macroName are mutually exclusive. Only set one of them. Which you use will depend on what you set as progressionStyle.
let newItem = {
  id: randomID(),
  name: "Activity Name",
  img: "icons/svg/book.svg",
  description: "",
  category: "", // The id of the category. Can be found in the "5e-training", "categories" flags
  progressionStyle: "ABILITY", // "ABILITY", "SKILL", "TOOL", "MACRO", "FIXED"
  ability: "str", // ABILITY ONLY: any of the ability abbreviations
  skill: null, // SKILL ONLY: any of the skill abbreviations
  tool: null, // TOOL ONLY: this would be the ID of a tool on the actor's sheet
  fixedIncrease: null, // FIXED ONLY: this would be the flat value to increase progress by
  macroName: null, // MACRO ONLY: this would be the name of the macro to run
  dc: null, // ABILITY,SKILL,TOOL: if set, this will have DC
  progress: 0,
  completionAt: game.settings.get("5e-training", "totalToComplete"),
  changes: [],
  schemaVersion: 1 
};

// Add new activity to array
allTrackedItems.push(newItem);

// Set flag
a.setFlag("5e-training", "trainingItems", allTrackedItems);
```