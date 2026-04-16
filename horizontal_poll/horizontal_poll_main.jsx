#include "vendor/extendscript-polyfills.js";
#include "../dist/ae_expressions.js";
#include "./utils.js";

(function () {

    var SETTINGS = {
        compWidth: 1920, compHeight: 1080,
        pixelAspect: 1,
        frameRate: 90,
        backgroundColor: [0.08, 0.08, 0.1],
        duration: 30,
        barHeight: 100,
        imageFolderName: "images"
    };

    function showError(message) {
        alert("Horizontal Poll Chart Generator\n\n" + message);
    }

    function formatError(error) {
        var details = [];
        var message = error && error.message ? error.message : String(error);

        details.push(message);

        if (error && error.line) {
            details.push("Line: " + error.line);
        }

        if (error && error.fileName) {
            details.push("File: " + error.fileName);
        }

        if (error && error.source) {
            details.push("Source: " + error.source);
        }

        return details.join("\n");
    }

    function consoleLog (message) {
        $.writeln(message);
    }

    function trimString(value) {
        return String(value).replace(/^\s+|\s+$/g, "");
    }

    function parseJson(text) {
        if (typeof JSON !== "undefined" && JSON.parse) {
            return JSON.parse(text);
        }
        consoleLog("JSON not available");
        return eval("(" + text + ")");
    }

    function parseData(file) {
        if (!file) {
            showError("No File Selected");
            return;
        }

        if (!file.open("r")) {
            throw new Error("Could not open JSON file: " + file.fsName);
        }

        file.encoding = "UTF-8";
        var rawContent = file.read();
        file.close();

        if (!rawContent || !rawContent.replace(/\s+/g, "")) {
            throw new Error("JSON file is empty.");
        }

        return parseJson(rawContent);
    }

    function createComp (name, customDur) {
        var duration = customDur || SETTINGS.duration;
        if (!trimString(name)) {
            showError("comp name not specified!");
            return;
        }

        if (!app.project) {
            app.newProject();
        }

        return app.project.items.addComp(
            name,
            SETTINGS.compWidth,
            SETTINGS.compHeight,
            SETTINGS.pixelAspect,
            duration,
            SETTINGS.frameRate
        );
    }

    function getOrCreateFolder(folderName, parentFolder) {
        var items;
        var i;
        var item;
        var expectedParent;
        var folder;

        if (!app.project) {
            app.newProject();
        }

        items = app.project.items;
        expectedParent = parentFolder || app.project.rootFolder;

        for (i = 1; i <= items.length; i++) {
            item = items[i];

            if (item instanceof FolderItem && item.name === folderName && item.parentFolder === expectedParent) {
                return item;
            }
        }

        folder = items.addFolder(folderName);
        folder.parentFolder = expectedParent;
        return folder;
    }

    function createDataLayer (comp, data, nullLayerName) {
        if (!comp) {
            throw new Error("Composition is missing while creating the data layer.");
        }

        var controller = comp.layers.addNull();
        controller.name = nullLayerName || "controller";
        controller.source.name = nullLayerName || "controller";
        var effectsGroup = controller.property("ADBE Effect Parade");

        if (!effectsGroup) {
            throw new Error("Could not access the Effects group on the controller layer.");
        }

        Object.keys(data).forEach(function (key) {
            var sliderControlEffect = effectsGroup.addProperty("ADBE Slider Control");
            sliderControlEffect.name = key;
            sliderControlEffect.property(1).setValue(data[key]);
        });

        return controller;
    }

    function addRectShape(comp, shapeLayerName, memberName, songCompName, membersCompNames, color, memberCompName) {
        var shapeLayer = comp.layers.addShape();
        shapeLayer.name = shapeLayerName;

        var rootVectorsGroup = shapeLayer.property("ADBE Root Vectors Group");
        var group = rootVectorsGroup.addProperty("ADBE Vector Group");
        var groupIndex = group.propertyIndex;
        group = shapeLayer.property("ADBE Root Vectors Group").property(groupIndex);
        group.name = "Rectangle 1";

        var vectorsGroup = group.property("ADBE Vectors Group");
        var rect = vectorsGroup.addProperty("ADBE Vector Shape - Rect");
        var rectIndex = rect.propertyIndex;
        group = shapeLayer.property("ADBE Root Vectors Group").property(groupIndex);
        vectorsGroup = group.property("ADBE Vectors Group");
        rect = vectorsGroup.property(rectIndex);
        rect.name = "Rectangle Path 1";

        var fill = vectorsGroup.addProperty("ADBE Vector Graphic - Fill");
        var fillIndex = fill.propertyIndex;
        group = shapeLayer.property("ADBE Root Vectors Group").property(groupIndex);
        vectorsGroup = group.property("ADBE Vectors Group");
        rect = vectorsGroup.property(rectIndex);
        fill = vectorsGroup.property(fillIndex);
        fill.name = "Fill 1";

        fill.property("ADBE Vector Fill Color").setValue(color);
        rect.property("ADBE Vector Rect Size").expression = memberBarSizeAnimation(songCompName, memberName);

        rect.property("Roundness").setValue(10);

        group.property("ADBE Vector Transform Group").property("ADBE Vector Anchor").expression =
            "var w = content(\"Rectangle 1\").content(\"Rectangle Path 1\").size[0];\n" +
            "var h = content(\"Rectangle 1\").content(\"Rectangle Path 1\").size[1];\n" +
            "\n" +
            "[-w/2, -h/2];";

        shapeLayer.property("Transform").property("Position").expression = setPositionForMemberShapeLayer(membersCompNames, memberName, memberCompName, songCompName);

        return {
            name: shapeLayerName,
            layer: shapeLayer,
            group: group,
            rect: rect
        };
    }

    function createMemberComp (memberCompName, targetFolder, memberName, songCompName, membersCompNames, memberImagePath, memberColor) {
        // memberCompName contains song name followed by a '-' and the memberName eg:- (Dream-Asa);
        // members -> array ['asa', 'ahyeon', 'ruka',...];

        // songCompName is just songName itself!

        // define the startY position of the bar (it would automatically take the next position if a
        // previous bar is revealed! not all bars same at the same place / startY)

        var memberComp = createComp(memberCompName);
        if (targetFolder) {
            memberComp.parentFolder = targetFolder;
        }

        // {layer, group, rect} = memberBar
        var memberBar = addRectShape(memberComp, memberCompName + "Progress", memberName, songCompName, membersCompNames, memberColor, memberCompName);
        var progressPctText = addTextLayer(memberComp, "0%", "progressPct", "JosefinSans-Italic", 50, memberColor);
        // Anchor point expression for pct% text
        progressPctText.property("Anchor Point").expression =
            "const r = sourceRectAtTime(time, false);" +
            "[r.left, r.top + r.height / 2];";
        progressPctText.property("Source Text").expression = progressPctSourceTxtExpression(songCompName, memberName);
        addDeepGlow2(progressPctText, 45, 0.64, true);


        var memberBarShapeLayerName = memberCompName + "Progress";
        progressPctText.property("Position").expression = progressPctTextPosition(memberBarShapeLayerName);

        // memberName text layer
        // name of the member!
        var memberNameLayer = addTextLayer(memberComp, memberName, memberCompName, "ForteMT", 35);
        memberNameLayer.property("Anchor Point").expression = leftCenterAnchorPoint();
        memberNameLayer.property("Position").expression = setPositionForMemberName(memberBarShapeLayerName);
        addDeepGlow2(memberNameLayer, 35, 0.5, true);

        var matteLayer = memberBar.layer.duplicate();
        matteLayer.name = "matteLayer";

        var memberImage = getOrImportFootage(memberImagePath, getOrCreateFolder(SETTINGS.imageFolderName));
        var imageLayer = memberComp.layers.add(memberImage);

        setMatteLayerExpressions(matteLayer, memberBar.name);

        matteLayer.moveBefore(imageLayer);
        imageLayer.setTrackMatte(matteLayer, TrackMatteType.ALPHA);

        var imageScale = imageLayer.property("Scale");
        imageScale.expression = setMemberImageScale();
        imageScale.expressionEnabled = false;

        var imagePosition = imageLayer.property("Position");
        imagePosition.expression = setMemberImagePosition(memberBar.name);
        imagePosition.expressionEnabled = false;

        imageLayer.property("Anchor Point").expression = deadCenterAnchorPoint();

        imagePosition.expressionEnabled = true;
        imageScale.expressionEnabled = true;

        return memberComp;
    }

    function initMasterComp (songs, votesData) {
        var masterCompName = "MasterComp";
        var masterCompDuration = calculateMasterCompDuration(songs, votesData);
        var masterComp = createComp(masterCompName, masterCompDuration);
        createDataLayer(masterComp, {
            barHeight: 100,
            startX: 210, startY: 150,
            animationDuration: 1,
            ySwapAnimDur: 0.4,
            barMaxWidth: 1570, // given that the position of the bar starts from 240 (XPosition)
            barGap: 20, // gap between the bars!
            imgMarginR: 6,
        }, "constants");

        // create images folder where the all the members images or any images will be stored!
        getOrCreateFolder(SETTINGS.imageFolderName);

        return masterComp;
    }

    function importImages(memberImages) {
        var imagesFolder = getOrCreateFolder(SETTINGS.imageFolderName);
        Object.keys(memberImages).forEach(function (member) {
            var imagePath = memberImages[member];
            getOrImportFootage(imagePath, imagesFolder);
        });
    }

    function run () {
        var jsonFile = File.openDialog("Select the bar chart JSON data file", "*.json");

        if (!jsonFile) {
            return;
        }

        // songs and votes data of members!
        var votesData = parseData(jsonFile);
        var raceTemplateFolder = getOrCreateFolder("race_template");
        var membersRootFolder = getOrCreateFolder("member_comps");

        consoleLog(votesData);
        if (!votesData || !votesData["songs"]) {
            throw new Error("Invalid JSON format. Expected a top-level 'songs' object.");
        }

        var songNames = Object.keys(votesData["songs"]);


        // create master composition
        var masterComp = initMasterComp(songNames, votesData["songs"]);

        var totalVotesTextLayer = addTextLayer(masterComp, "Total Votes", "total votes text", "JosefinSans-Italic", 30);
        totalVotesTextLayer.property("Anchor Point").expression = topRightAnchorPoint();
        totalVotesTextLayer.property("Position").expression = setTopPosition("right");

        var groupNameLayer = addTextLayer(masterComp, votesData["groupName"], "group name", "BlackOpsOne-Regular", 50, votesData["groupNameColor"]);
        groupNameLayer.property("Anchor Point").expression = topLeftAnchorPoint();
        groupNameLayer.property("Position").expression = setTopPosition("left");
        addDeepGlow2(groupNameLayer, 30, 0.5, true);


        var songCompStartTimeInMC = 0;
        songNames.forEach(function (song) {
            var songData = votesData["songs"][song];

            if (!songData) {
                throw new Error("Missing song data for: " + song);
            }

            var totalVotes = songData["totalVotes"];
            var memberVotes = songData["votes"];
            var memberImages = songData["images"];
            importImages(memberImages);

            // the member who has the max votes;
            // this will be used for calculation of each member's bar width!
            var controllerData = {
                maxVote: 0,
                totalVotes: totalVotes
            };
            var songMembersFolder = getOrCreateFolder(song, membersRootFolder);

            var songComp = createComp(song);
            songComp.parentFolder = raceTemplateFolder;

            // create song name text layer~!
            var songNameLayer = addTextLayer(songComp, songComp.name, "songNameText", "BlackOpsOne-Regular", 60, songData["songColor"]);
            songNameLayer.property("Anchor Point").expression = topCenterAnchorPoint();
            songNameLayer.property("Position").expression = setSongNamePosition();
            addDeepGlow2(songNameLayer, 45, 0.7, true);


            var membersCompNames = [];

            memberVotes.forEach(function (memberVotes) {
                var memberName = memberVotes["member"];
                var memberVotesValue = memberVotes["votes"];
                var memberCompName = song + "-" + memberName;
                membersCompNames.push(memberCompName);


                if (memberVotesValue > controllerData["maxVote"]) {
                    controllerData["maxVote"] = memberVotesValue;
                }

                controllerData[memberName] = memberVotesValue;
            }); // end of memberVotes loop

            createDataLayer(songComp, controllerData);
            var totalVotesLayer = addTextLayer(songComp, controllerData.totalVotes, "totalVotes", "BlackOpsOne-Regular", 50);
            totalVotesLayer.property("Anchor Point").expression = topRightAnchorPoint();
            totalVotesLayer.property("Position").expression = setTopPosition("right", {offsetY: 40});

            var startTime = 0;
            var previousLayer = null;
            memberVotes.forEach(function (memberVotes) {
                var memberName = memberVotes["member"];
                var memberImagePath = songData["images"][memberName];
                var memberColor = songData["colors"][memberName];
                consoleLog(memberImagePath);

                var memberComp = createMemberComp(song + "-" + memberName, songMembersFolder, memberName, songComp.name, membersCompNames, memberImagePath, memberColor);
                var memberLayer = songComp.layers.add(memberComp);
                memberLayer.startTime = startTime;
                memberLayer.transform.opacity.expression = setMemberCompOpacity(memberComp.name);
                if (previousLayer !== null) {
                    memberLayer.moveAfter(previousLayer);
                }

                previousLayer = memberLayer
                startTime++
            }); // end of memberVotes loop
            previousLayer = null;
            startTime = 0;

            var freezeFrame = 1;
            var songCompEndTime = memberVotes.length + freezeFrame;
            trimComp(songComp, 0, songCompEndTime);

            var songCompInMC = masterComp.layers.add(songComp);
            songCompInMC.startTime = songCompStartTimeInMC;
            songCompStartTimeInMC += songCompEndTime;
        }); // end of songNames loop

        // masterComp.layer.add();

    }

    try {
        $.writeln("starting script. GoodLuck!");
        clearProject();
        run();
    } catch (error) {
        showError(error && error.message ? error.message : String(error));
    }

})();
