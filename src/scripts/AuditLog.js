import CONSTANTS from "./constants.js";

export default class AuditLog extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "downtime-audit-log-form",
      template: `modules/${CONSTANTS.MODULE_ID}/templates/audit-dialog.hbs`,
      title: game.i18n.localize("downtime-dnd5e.ChangeLog"),
      width: 1200, //900,
      resizable: true,
      closeOnSubmit: true,
    });
  }

  async getData(options = {}) {
    let originalData = super.getData();
    let activities = originalData.object.flags[CONSTANTS.MODULE_ID].trainingItems || [];

    this.actor = game.actors.get(originalData.object._id);
    let changes = [];

    // Loop through each activity. If it's got no changes array, move on to the next one.
    //  If it DOES have a change array, loop through each entry and set up the info we need
    //  for display in the application. Most of it's one-to one, but we need to pull the activity name
    //  from the activity itself, and we do some math for the change. Once that's done,
    //   push the change into the array.
    for (var a = 0; a < activities.length; a++) {
      if (!activities[a].changes) {
        continue;
      }
      for (var c = 0; c < activities[a].changes.length; c++) {
        // Don't include the change if it's already been dismissed
        if (activities[a].changes[c].dismissed) {
          continue;
        }
        // calc difference and add a '+' if the change is positive
        let difference = activities[a].changes[c].newValue - activities[a].changes[c].oldValue;
        if (difference > 0) {
          difference = "+" + difference;
        }
        // Set up our display object
        let change = {
          timestamp: activities[a].changes[c].timestamp,
          user: activities[a].changes[c].user,
          activityName: activities[a].name,
          actionName: activities[a].changes[c].actionName,
          valueChanged: activities[a].changes[c].valueChanged,
          oldValue: activities[a].changes[c].oldValue,
          newValue: activities[a].changes[c].newValue,
          diff: difference,
          result: activities[a].changes[c].result,
          timeTaken: activities[a].changes[c].timeTaken,
          materials: activities[a].changes[c].materials,
        };
        changes.push(change);
      }
    }
    // Sort by time, oldest to newest
    changes.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

    this.changes = changes;

    return mergeObject(originalData, {
      isGm: game.user.isGM,
      changes: this.changes,
      // Downtime Ethck
      isGM: game.user.isGM,
      activities: activities,
    });
  }

  // Called on submission, handle doing stuff.
  async _updateObject(event, formData) {
    let actorId = formData.actorId;
    let actor = game.actors.get(actorId);
    let activities = await actor.getFlag(CONSTANTS.MODULE_ID, "trainingItems");

    // Same loop as before. Cycle through each activity, if it's got no change array,
    //  move on to the next one. If it does, cycle through it and see if the timestamp
    //  (which we use an ID since it's unique in this case) is present in the formData
    //  object as a key. If it is, it means this change has a checkbox present in the
    //  audit log. We wanna know its value so we can dismiss it. Or not.
    for (var a = 0; a < activities.length; a++) {
      if (!activities[a].changes) {
        continue;
      }
      for (var c = 0; c < activities[a].changes.length; c++) {
        let timestamp = activities[a].changes[c].timestamp;
        if (formData.hasOwnProperty(timestamp)) {
          activities[a].changes[c].dismissed = formData[timestamp];
        }
      }
    }

    // Update actor and flags
    await actor.setFlag(CONSTANTS.MODULE_ID, "trainingItems", activities);
  }

  activateListeners(html) {
    super.activateListeners(html);
    // add listeners here
    html.find("#filterActivity").change((event) => this.filterChanges(html, event));
    // TODO flags changes is not good
    // html.find(".change-delete").click((event) => this.handleDelete(html, event));
  }

  filterChanges(html, event) {
    event.preventDefault();
    // For every row
    html.find("tr > #activityName").each((i, target) => {
      let request = $(event.target).val();
      // Show all
      $(target).parent().show();
      // Hide if request val is not blank and activityName does not match requested activityName
      if (request !== "" && $(target).text().trim() !== request) {
        $(target).parent().hide();
      }
    });
  }

  /* TODO flags changes is not good
  async handleDelete(html, event) {
    event.preventDefault();
    let del = false;

    let dialogContent = await renderTemplate(
      `modules/${CONSTANTS.MODULE_ID}/templates/additional/delete-training-dialog.hbs`
    );

    new Dialog({
      title: `Delete Activity Entry`,
      content: dialogContent,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: "Delete",
          callback: () => (del = true),
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: "Cancel",
          callback: () => (del = false),
        },
      },
      default: "yes",
      close: async () => {
        if (del) {
          // Find our change index
          let fieldId = $(event.currentTarget).attr("id");
          let changeIdx = parseInt(fieldId.replace("downtime-dnd5e-", ""));
          // Remove the change
          this.changes.splice(changeIdx, 1);
          // Update Actor
          this.actor.unsetFlag(CONSTANTS.MODULE_ID, "changes");
          await this.actor.setFlag(CONSTANTS.MODULE_ID, "changes", this.changes);
          // Update HTML
          $(html)
            .find("#" + fieldId)
            .parent()
            .parent()
            .remove();
          this.render();
        }
      },
    }).render(true);
  }
  */
}
