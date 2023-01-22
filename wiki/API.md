# Methods
These are the methods you can call from macros or your own module, if you so choose.

### game.modules.get('downtime-dnd5e').api.updateActivityProgress(actorName, itemName, newProgress)
Ex: `game.modules.get('downtime-dnd5e').api.updateActivity("Nazir", "Smithing Proficiency", 75)`

Params
- `actorName` is a string that matches the name of the actor that owns the Tracked Item you'd like to change. It's case sensitive.
- `itemName` is a string that matches the name of the Tracked Item you'd like to updatee. It's case sensitive.
- `newProgress` is an integer. This is the value you'd like to set the item's progress to.

Returns
- Nothing. This method will update the selected Tracked Item, replacing the value of the `progress` property with the value provided.



### game.modules.get('downtime-dnd5e').api.getActivitiesForActor(actorName)
Ex: `game.modules.get('downtime-dnd5e').api.getActivitiesForActor("Mary Sue")`

Params
- `actorName` is a string that matches the name of the actor you'd like to get activities for. It's case sensitive.

Returns
- An array of objects



### game.modules.get('downtime-dnd5e').api.getActivity(actorName, itemName)
Ex: `game.modules.get('downtime-dnd5e').api.getActivity("Val Fletcher", "Craft Magic Armor")`

Params
- `actorName` is a string that matches the name of the actor that owns the Tracked Item you're trying to get. It's case sensitive.
- `itemName` is a string that matches the name of the Tracked Item you're trying to get. It's case sensitive.

Returns
- An single object