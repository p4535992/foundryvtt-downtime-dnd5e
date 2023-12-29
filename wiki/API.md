
The api is reachable from the variable `game.modules.get('downtime-dnd5e').api` or from the socket libary `socketLib` on the variable `game.modules.get('downtime-dnd5e').socket` if present and active.

### The documentation can be out of sync with the API code checkout the code if you want to dig up [API](../src/scripts/api.js)

You can find some javascript examples here **=> [macros](./macros/) <=**

**Note on the execution of the macro:** executes Macro command, giving speaker, actor, token, character, and event constants. This is recognized as the macro itself. Pass an event as the first argument. Is the same concept used from [Item Macro](https://github.com/Foundry-Workshop/Item-Macro/), but without the item, also the main reference is not the item, but the actor, we used the actor set as character by default or the first owned actor by the user, same concept of [Item Piles](https://github.com/fantasycalendar/FoundryVTT-ItemPiles). The macro is launched under as a asynchronus call so  `await ` command are good.

So when you set up to run a macro with this module these arguments are already "setted":`
- **speaker**: The chat message speaker referenced to the actor.
- **actor**: The actor reference.
- **token**: The token (if present on the current scene), referenced to the actor.
- **character**: The character is the actor reference to the one setted to the specific player (cannot be the same of the actor reference).
- **event**: The javascript event passed from the module to the macro.
- **args**: Additional arguments passed from the module to the macro.

#### updateActivityProgress(actor, activityName, newProgress) ⇒ <code>Promise&lt;void&gt;</code>
#### updateActivity(actor, activityName, newProgress) ⇒ <code>Promise&lt;void&gt;</code>

This method will update the selected Tracked Item, replacing the value of the `progress` property with the value provided.

**Returns**: <code>Promise&lt;void&gt;</code> - Return nothing

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| actor | <code>Actor or string</code> | The reference to the actor can be the Actor object or the id or the uuid or the name of the actor (**it is advisable to not use the name it will remain for retro compatibility**) | |
| activityName | <code>string</code> | The activity name, is a string that matches the name of the Tracked Item you'd like to update. It's case sensitive. | |
| newProgress | <code>number or string</code> | The progress to apply is an integer. This is the value you'd like to set the item's progress to. (can be a number on string format too) |  |

**Example basic**:

```javascript

await game.modules.get('downtime-dnd5e').api.updateActivityProgress("Nazir", "Smithing Proficiency", 75)

```

or 

```javascript

await game.modules.get('downtime-dnd5e').api.updateActivity("Nazir", "Smithing Proficiency", 75)

```

#### getActivitiesForActor(actor) ⇒ <code>Activity[]</code>
#### getActivities(actor) ⇒ <code>Activity[]</code>

Return all the activities on the actor

**Returns**: <code>Activity[]</code> - Return all the activities on the actor

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| actor | <code>Actor or string</code> | The reference to the actor can be the Actor object or the id or the uuid or the name of the actor (**it is advisable to not use the name it will remain for retro compatibility**) | |

**Example basic**:

```javascript

game.modules.get('downtime-dnd5e').api.getActivitiesForActor("Nazir")

```

or

```javascript

game.modules.get('downtime-dnd5e').api.getActivities("Nazir")

```

#### getActivity(actor, activityName)  ⇒ <code>Activity</code>

Return a specific activity on the actor

**Returns**: <code>Activity</code> - Return a specific activity

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| actor | <code>Actor or string</code> | The reference to the actor can be the Actor object or the id or the uuid or the name of the actor (**it is advisable to not use the name it will remain for retro compatibility**) | |
| activityName | <code>string</code> | The activity name, is a string that matches the name of the Tracked Item you'd like to update. It's case sensitive. | |

**Example basic**:

```javascript

game.modules.get('downtime-dnd5e').api.getActivity("Nazir", "Smithing Proficiency")

```

#### getCategories(actor) ⇒ <code>Category[]</code>

Return all the categories on the actor

**Returns**: <code>Category[]</code> - Return all the categories on the actor

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| actor | <code>Actor or string</code> | The reference to the actor can be the Actor object or the id or the uuid or the name of the actor (**it is advisable to not use the name it will remain for retro compatibility**) | |

**Example basic**:

```javascript

game.modules.get('downtime-dnd5e').api.getCategories("Nazir")

```

#### updateWorldActivityProgress(activityName, newProgress, explicitActor) ⇒ <code>Promise&lt;void&gt;</code>
#### updateWorldActivity(activityName, newProgress, explicitActor) ⇒ <code>Promise&lt;void&gt;</code>

This method will update the selected Tracked Item, replacing the value of the `progress` property with the value provided.

**Returns**: <code>Promise&lt;void&gt;</code> - Return nothing

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| activityName | <code>string</code> | The activity name, is a string that matches the name of the Tracked Item you'd like to update. It's case sensitive. | |
| newProgress | <code>number or string</code> | The progress to apply is an integer. This is the value you'd like to set the item's progress to. (can be a number on string format too) |  |
| explicitActor | <code>Actor or string</code> | OPTIONAL: The reference to a explicit actor can be the Actor object or the id or the uuid or the name of the actor (**it is advisable to not use the name it will remain for retro compatibility**) | ATTENTION: If no explicit actor is benn set the actor connected to the player will be used |

**Example basic**:

```javascript

await game.modules.get('downtime-dnd5e').api.updateWorldActivityProgress("Smithing Proficiency", 75, "Nazir")

```

or 

```javascript

await game.modules.get('downtime-dnd5e').api.updateWorldActivity("Smithing Proficiency", 75, "Nazir")

```

#### getWorldActivities() ⇒ <code>Activity[]</code>

Return all the world activities on the actor

**Returns**: <code>Activity[]</code> - Return all the activities of the world

| Param | Type | Description | Note |
| --- | --- | --- | --- |

**Example basic**:

```javascript

game.modules.get('downtime-dnd5e').api.getWorldActivities()

```

#### getWorldActivity(activityName)  ⇒ <code>Activity</code>

Return a specific activity world

**Returns**: <code>Activity</code> - Return a specific activity

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| activityName | <code>string</code> | The activity name, is a string that matches the name of the Tracked Item you'd like to update. It's case sensitive. | |

**Example basic**:

```javascript

game.modules.get('downtime-dnd5e').api.getWorldActivity("Smithing Proficiency");

```

#### getWorldCategories() ⇒ <code>Category[]</code>

Return all the world categories on the actor

**Returns**: <code>Category[]</code> - Return all the categories of the world

| Param | Type | Description | Note |
| --- | --- | --- | --- |

**Example basic**:

```javascript

game.modules.get('downtime-dnd5e').api.getWorldCategories()

```