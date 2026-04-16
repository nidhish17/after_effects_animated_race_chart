function arrayToExpressionArray(arr) {
    var i;
    var parts = [];

    for (i = 0; i < arr.length; i++) {
        parts.push('"' + arr[i] + '"');
    }

    return "[" + parts.join(", ") + "]";
}


function getOrImportFootage (filePath, targetFolder) {
    var normalizedPath = String(filePath).replace(/^\s+|\s+$/g, "");

    if (normalizedPath.charAt(0) === "\"" && normalizedPath.charAt(normalizedPath.length - 1) === "\"") {
        normalizedPath = normalizedPath.substring(1, normalizedPath.length - 1);
    }

    try {
        var file = new File(normalizedPath);

        if (!file.exists && normalizedPath.indexOf("\\") !== -1) {
            file = new File(normalizedPath.replace(/\\/g, "/"));
        }

        if (!file.exists) {
            alert("Horizontal Poll Chart Generator\n\nFile not found:\n" + normalizedPath);
            return null;
        }

        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);

            if (
                item instanceof FootageItem &&
                item.file &&
                item.file.fsName === file.fsName
            ) {
                return item;
            }
        }

        var importOptions = new ImportOptions(file);
        var footage = app.project.importFile(importOptions);

        if (targetFolder) {
            footage.parentFolder = targetFolder;
        }

        return footage;
    } catch (error) {
        alert("Horizontal Poll Chart Generator\n\nImage import failed:\n" + normalizedPath + "\n\n" + (error && error.message ? error.message : String(error)));
        return null;
    }
}

function getCompByName(name) {
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item instanceof CompItem && item.name === name) {
            return item;
        }
    }
    return null;
}

function addTextLayer(comp, text, layerName, font, fontSize, color) {
    var layer = comp.layers.addText(text);
    layer.name = layerName;

    var textDoc = layer.property("Source Text").value;
    textDoc.font = font;
    textDoc.fontSize = fontSize;

    // Only apply the color if one was actually passed into the function!
    if (color) {
        textDoc.applyFill = true;
        textDoc.fillColor = color;
    }

    layer.property("Source Text").setValue(textDoc);

    return layer;
}

function clearProject() {
    var items = app.project.items;
    // loop backwards since removing shifts indices
    for (var i = items.length; i >= 1; i--) {
        items[i].remove();
    }
}

function trimComp(comp, startTime, endTime) {
    comp.workAreaStart = startTime;
    comp.workAreaDuration = endTime - startTime;
    comp.duration = endTime;
}

function calculateMasterCompDuration (songs, votesData) {
    // 1 second of freeze frame!
    var freezeFrame = 1;
    var masterDuration = 0;
    songs.forEach(function (song) {
        masterDuration += votesData[song].votes.length + freezeFrame;
    });

    return masterDuration;
}

function addDeepGlow2 (layer, radius, exposure, requiredForTxt) {
    var deepGlow2 = layer.Effects.addProperty("Deep Glow 2");
    deepGlow2.property("Radius").setValue(radius);
    deepGlow2.property("Exposure").setValue(exposure);
    deepGlow2.property("Unmult").setValue(requiredForTxt || true);
}
