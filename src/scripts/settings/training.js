export async function _updateDowntimes(downtimes) {
    let changed = false;
    downtimes.forEach((downtime, i) => {
        // Handle old private
        // 12/3/2020 v0.3.3
        if ("private" in downtime) {
            // If previously updated, the "new" value might be here
            if (!("actPrivate" in downtime)) {
                downtime.actPrivate = downtime.private;
            }

            delete downtime.private;
            changed = true;
        }

        // Update tables, might not be present?
        // 12/3/2020 v0.3.3
        if ("complication" in downtime) {
            if ("table" in downtime.complication) {
                // Old format where table was the string id of the table
                if (typeof downtime.complication.table === "string" || downtime.complication.table instanceof String) {
                    let tid = "";
                    if (downtime.complication.table !== "") {
                        let table = game.tables.getName(downtime.complication.table);
                        if (!table) table = game.tables.get(downtime.complication.table);
                        tid = table.id;
                    }
                    downtime.complication.table = { id: tid };
                    changed = true;
                }
            }
        }
        // 12/23/2020 v0.4.0 transfer to new roll model
        if ("rollableGroups" in downtime) {
            let newRolls = downtime.rollableGroups.flatMap((group) => {
                if (group.rolls.length === 0) return;
                let g = group.group || "";
                let rolls = group.rolls.map((roll) => {
                    // new format is an object
                    if (!Array.isArray(roll)) return;
                    let typeRoll = determineOldType(roll); // Determine type
                    let dc = roll[1] || null; // Use old DC, or default to null
                    let rollVal = roll[0];
                    // ensure our DC is a number
                    if (typeof dc === "number") {
                        dc = dc.toString();
                    }

                    if (typeRoll === "CUSTOM") {
                        rollVal = rollVal.split("Formula: ")[1];
                    } else if (typeRoll === "SKILL_CHECK") {
                        let skills = CONFIG.DND5E.skills;
                        // returns shorthand of skill
                        rollVal = Object.keys(skills).find((key) => skills[key] === rollVal);
                    } else if (typeRoll === "TOOL_CHECK") {
                    } else {
                        //abiCheck, save
                        if (typeRoll === "ABILITY_CHECK") {
                            rollVal = rollVal.split(" Check")[0];
                        } else {
                            rollVal = rollVal.split(" Saving Throw")[0];
                        }
                        let abilities = CONFIG.DND5E.abilities;
                        // Returns shorthand of ability
                        rollVal = Object.keys(abilities)
                            .find((key) => abilities[key] === rollVal)
                            .toLowerCase();
                    }
                    changed = true;
                    return { type: typeRoll, roll: rollVal, group: g, dc: dc };
                });

                return rolls;
            });
            newRolls = newRolls.filter(Boolean);
            downtime.roll = newRolls;
        }
        // 12/23/2020 v0.4.0 transfer to new result model
        if ("results" in downtime) {
            // downtime.results[0] old format is an array
            // new format is object
            if (Array.isArray(downtime.results[0])) {
                let res = duplicate(downtime.results);

                let newRes = res.map((result) => {
                    return {
                        min: result[0], // lower bound
                        max: result[1], // high bound
                        details: result[2], // description
                        triggerComplication: false, // trigger complication if result occurs
                    };
                });

                downtime.result = newRes;
                changed = true;
            }
        }
        // 12/23/20 v0.4.0 transfer to new activity model
        if ("rollableGroups" in downtime && "rollableEvents" in downtime) {
            if (downtime?.type === "succFail") {
                downtime.type = "SUCCESS_COUNT";
            } else if (downtime?.type === "categories") {
                downtime.type = "ROLL_TOTAL";
            } else {
                downtime.type = "NO_ROLL";
            }
            // Load new model.
            downtimes[i] = {
                name: downtime.name || "New Downtime Activity",
                description: downtime.description || "My awesome downtime activity",
                chat_icon: downtime.img || "icons/svg/d20.svg",
                sheet_icon: downtime.rollIcon || "icons/svg/d20.svg",
                type: downtime.type, //* ACTIVITY_TYPES
                roll: downtime.roll, //* ACTIVITY_ROLL_MODEL
                result: downtime.result, //* ACTIVITY_RESULT_MODEL
                id: downtime.id.toString() || randomID(),
                complication: {
                    chance: downtime.complication.chance || 0,
                    roll_table: downtime.complication.table.id || "",
                },
                options: {
                    rolls_are_private: downtime.actPrivate || false,
                    complications_are_private: downtime.compPrivate || false,
                    ask_for_materials: downtime.useMaterials || false,
                    days_used: downtime.timeTaken || "",
                    hidden: false,
                },
            };

            changed = true;
        }
        // 3/20/2021 v0.4.3 added activity visibility
        if (downtime.options && !("hidden" in downtime.options)) {
            downtime.options.hidden = false;
            changed = true;
        }
    });

    return [downtimes, changed];
}
