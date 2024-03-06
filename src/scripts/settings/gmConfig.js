import CONSTANTS from "../constants.js";
import { warn, info, error, log, debug } from "../lib/lib.js";
import { _updateDowntimes } from "./training.js";

export class GMConfig extends FormApplication {
    constructor(...args) {
        super(...args);
        game.users.apps.push(this);
        this.activities = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = "Modify Global Downtime Events";
        options.id = CONSTANTS.MODULE_ID;
        options.template = `modules/${CONSTANTS.MODULE_ID}/templates/additional/gmConfig.hbs`;
        options.closeOnSubmit = false;
        options.popOut = true;
        options.width = 600;
        options.height = "auto";
        return options;
    }

    async getData() {
        return {
            activities: this.activities,
        };
    }

    render(force, context = {}) {
        return super.render(force, context);
    }

    activateListeners(html) {
        super.activateListeners(html);
        for (let row of this.element.find("#rollableEventsTable > tbody > .rollableEvent")) {
            $(row)
                .find("#deleteRollable")
                .click((event) => this.handleRollableDelete(event, row));
        }
        this.element.find(".addWorldDowntime").click((event) => this.addWorldDowntime(event));
        this.element.find(".training-edit").click((event) => this.editWorldDowntime(event));

        this.element.find(".import").click((event) => this.importActivities(event));
        this.element.find(".export").click((event) => this.exportActivities(event));

        this.element.find(".activity-move").click((event) => this.moveWorldDowntime(event));
        this.element.find(".downtime-dnd5e-move").click((event) => this.moveWorldDowntime(event));

        this.element.find(".duplicate-actor-act").click(() => this.duplicateActorActivities());
    }

    importActivities(event) {
        const input = $('<input type="file">');
        input.on("change", this.importWorldActivities);
        input.trigger("click");
    }

    importWorldActivities() {
        const file = this.files[0];
        if (!file) return;

        readTextFromFile(file).then(async (result) => {
            let settings = JSON.parse(JSON.parse(result).value);
            let [newDowntimes, changed] = await _updateDowntimes(settings);
            game.settings.set(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities, newDowntimes);
        });
    }

    exportActivities(event) {
        const data = game.data.settings.find(
            (setting) => setting.key === `${CONSTANTS.MODULE_ID}.${CONSTANTS.SETTINGS.worldActivities}`,
        );
        const jsonData = JSON.stringify(data, null, 2);
        saveDataToFile(jsonData, "application/json", `${CONSTANTS.MODULE_ID}-world-activities.json`);
        info("Downtime: Saved Activity Data.", true);
    }

    duplicateActorActivities() {
        new LocalActivityTransfer().render(true);
    }

    async _updateObject(event, formData) {
        return;
    }
}

class LocalActivityTransfer extends FormApplication {
    constructor(...args) {
        super(...args);
        game.users.apps.push(this);
        this.activities = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.SETTINGS.worldActivities);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = "Copy Activities Between Actors";
        options.id = CONSTANTS.MODULE_ID;
        options.template = `modules/${CONSTANTS.MODULE_ID}/templates/additional/localActivityTransfer.hbs`;
        options.closeOnSubmit = false;
        options.popOut = true;
        options.width = 600;
        options.height = "auto";
        return options;
    }

    async getData() {
        let actorsFiltered = game.actors;
        // Filter item piles sheet
        actorsFiltered = actorsFiltered.filter((a) => !getProperty(a, `flags.item-piles.data.enabled`));
        return {
            activities: this.activities,
            actors: actorsFiltered,
        };
    }

    render(force, context = {}) {
        return super.render(force, context);
    }

    activateListeners(html) {
        this.element.find("#srcActor").change(() => this.changeActorAct());

        this.changeActorAct();

        this.element.find("#submit").click(() => this.submit());
    }

    changeActorAct() {
        let actorAct = this.element.find("#actorAct");
        actorAct.empty();

        let srcActorID = $(this.element.find("#srcActor")).val();
        let srcActor = game.actors.get(srcActorID);
        let srcActs = srcActor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems);

        if (srcActs?.length) {
            srcActs.forEach((act) => {
                actorAct.append(`<option value=` + act.id + `>` + act.name + `</option>`);
            });
        } else {
            info("Actor " + srcActor.name + " does not have any downtime activities.", true);
        }
    }

    async submit() {
        let srcActorID = this.element.find("#srcActor").val();
        let srcActor = game.actors.get(srcActorID);
        let srcActs = srcActor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems);

        let destActorID = this.element.find("#destActor").val();
        let destActor = game.actors.get(destActorID);
        let destActs = destActor.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems);

        let transferID = this.element.find("#actorAct").val();
        let activityToTransfer = srcActs.find((a) => a.id == transferID);

        if (srcActorID !== destActorID) {
            if (!destActs) destActs = [];
            let newActivities = destActs.concat([activityToTransfer]);
            await destActor.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.trainingItems, newActivities);
            info(`Successfully copied ${activityToTransfer.name} from ${srcActor.name} to ${destActor.name}.`, true);
        } else {
            error("Source Actor and Destination Actor are the same.", true);
            return;
        }
    }

    async _updateObject(event, formData) {
        return;
    }
}
