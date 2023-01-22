This page aims to provide a little bit more information about how to use the module and what its functions do.

# Module Settings
WIP

# The Character Sheet Tab
No matter what you decide to call the tab, all of this module's features live inside it. The tab will be displayed only on actor types specified by the module settings, and only to users who have permission to edit the sheet. 

It might look a little different depending on what sheet module you're using, but the tab will look something like this:

![](./images/char_sheet.png)

Let's walk through each of the elements on the page and explain what they do!

## Module Controls
The bar of buttons just below the sheet navigation bar contains the following:
- Export: Allows you to export the current actor's tracked items.
- Import: Allows you to import tracked items from a JSON file.
- Change Log: Opens up a window showing a log of the changes made to each of the actor's tracked items.
- Add Category: Opens the Create Category dialog.
- Add Item: Opens the Create Tracked Item dialog.

All of these buttons are visible to both players and GM's.

## Tracked Items List
Below the Module Controls you'll find the list of items the actor is tracking. These will be divided by category, and ordered within each category A-Z.

**Category Headers**
- Hovering over a category header will display a popup containing the category's description.
- Clicking the pencil icon on the right side of the category will open the Edit Category Dialog.
- Clicking the trash icon on the right side of the category will delete the category. Deleting a category marks all its items as Uncategorized.

**Tracked Items**
- Clicking on the item's image will roll the item.
- A white checkmark will be overlaid on top of the image when the item is complete. When this happens, clicking the item no longer rolls it.
- Clicking on the item's name will expand the item's row to display the description.
- The type column displays what kind of progression system the item uses. It'll show the skill/tool/ability name and a DC, if applicable.
- You can edit the item's progress directly by editing the fraction right in the row.
- The progress bar automatically fills up as the item's progress increases.
- Clicking the pencil icon will open the Edit Tracked item dialog.
- Clicking the trash icon will delete the item.

# Creating & Editing Tracked Items
The Create / Edit Tracked Item dialog is the main interface for creating and editing tracked items. There are a few variations depending on what kind of item you're working with:

![](./images/edit_item_fixed.png)
![](./images/edit_item_macro.png)
![](./images/edit_item_tool.png)

## General Information
**ID:** This field is readonly, which means you can't enter anything into it. It's here to allow you to easily grab the item's ID if you need it for code reasons.

**Name:** The name of the tracked item.

**Image:** The image that displays in the Item List on the tab. Clicking the button to the right will open a file browser so you can select something.

**Category:** A dropdown menu containing a list of all the actor's categories. If no custom categories have been created, "None" will be the only option.

**Description:** The item's description.

**Current Progress:** The item's current progress. This should be a number between 0 and the Completion Target (if no DC is set) or Required Successes (if DC has been set).

**Progression Type:** A dropdown menu containing each of the available types of item progression options. The option you choose will change the fields below it. Each option is described in more detail in the type-specific section.

## Details - Fixed Value 
**Increase Amount:** The amount that rolling the item increases progress by.

**Completion Target:** The total amount of progress needed to complete the item. This should be a number above 0.

## Details - Skill / Ability / Tool Check
**Skill / Ability / Tool:** The type of check that you want to roll when rolling the activity. Abilities and Skills are the standard 5e options. Options for the Tool dropdown are based on the tools in the actor's inventory. If there are no tools in the inventory, the dropdown will be empty.

**DC:** An optional field. If you want the check to have a DC associated with it, you can enter it here. It should be a number.

**Completion Target:** The total amount of progress needed to complete the item. This should be a number above 0. Only displays if no DC is set.

**Successes Required:** The total number of successful checks that need to be made to complete the item. This should be a number above 0. Only displays if a DC is set.

## Details - Macro
**Macro Name:** The name of the macro to run when the item is rolled. The bad news is that macros run by tracked items don't inherently increase their progress values unless you tell them to. The good news is that means the sky's the limit, and you can get as creative as you want with them! This wiki contains some sample macros to get you started, or you can take a look at the API page to see what functionality is available to you if you need more details on the functions available.

**Completion Target:** The total amount of progress needed to complete the item. This should be a number above 0. Again, only updated by the macro if you include the code to do so.

# Creating & Editing Categories
The Create / Edit Category dialog is the main interface for creating and editing categories. It looks like this:

![](./images/edit_category.png)

**Name:** The name of the tracked item.

**Description:** The item's description.

# The Change Log
The Change Log displays all the progress updates that have been made to the current actor's tracked items. This can players figure out what adjustments to make if they rolled the wrong thing and didn't see how much progress was increased, and can help GM's keep track of the changes being made.

Players will see a list of actions. GM's have the option to dismiss items from the log. Dismissing items doesn't revert them. It only prevents them from appearing in the log and cluttering it up.

**Time:** Displays the time the action was taken in UTC.

**User:** The user who triggered the action

**Item:** The action the item was taken on

**Action:** What got done to the item.
* _Fixed Value_ means the item was increased by some flat value (look at the progress column to see what that value was).
* _Roll XXX (Adv/Disadv/Normal)_ means some roll was made. It'll tell you what the roll was, and whether it was made with advantage or disadvantage
* _Macro / External Code_ means the progress was changed via some external means. It could be a macro, or a module, or potentially a console command.
* _Adjust Progress (+/-/=)_ shows up when the progress value was changed by altering the progress value directly from the Tracked Item List
> NOTE: As of 0.6.0 there is no Change Log entry created when editing progress via the Edit Tracked Item dialog.

**Progress Change:** Displays the old progress, the new progress, and the overall change.

![](./images/change_log.png)

# Export
You can export the current actor's tracked items to a JSON file by clicking the export button in the Module Controls bar. This will open a window that lets you choose where to save the file and what to name it. This is handy for backing up your data, troubleshooting, and transferring activities between actors.

# Import
> WARNING: Importing items is meant to be a troubleshooting/data restoration tool. You use this feature at your own risk, and I take no responsibility for any lost data due to misunderstandings or accidents. As of 0.6.0, there are no checks in place to make sure the file you've selected is a valid JSON file containing objects that look like tracked items. Importing a file that doesn't contain tracked items and ONLY tracked items could break some stuff. Be careful what you import. If you do break something, I can help you fix it - but there's no guarantee that I can get your old data back. File a bug report and attach a copy of the file you imported so I can take a look.

You can also import tracked items from a JSON file to the current actor by clicking the import button in the Module Controls bar. This will open a window that lets you select the file you'd like to import. After you select your file, you'll be asked if you want to overwrite the actor's current items, or combine the new import with the current items. Overwriting will completely replace all current tracked items with the contents of your chosen JSON file - you won't be able to get them back. Combining will add everything in the JSON file to the current list of tracked items.

When merging, sometimes you'll get a notification that says it detected duplicate entries. Usually this message pops up when an imported item has the same ID as an existing one. If this is the case, the imported item will be assigned a new ID and added to the list as normal. You just get alerted so you know it happened.
