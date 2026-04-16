// this is for the position of the pct text! it defines the position of the pct text
function progressPctTextPosition(rectShapeLayerName) {
    return (`const progressBar = thisComp.layer('${rectShapeLayerName}');const progressBarHeight = comp("MasterComp").layer("constants").effect("barHeight")("Slider");

const gap = 10;

const progressBarW = progressBar.content("Rectangle 1").content("Rectangle Path 1").size[0] + progressBar.transform.position[0] + gap;
const x = progressBarW;
const y = progressBar.transform.position[1] + progressBarHeight/2;

[x, y];`)
}


function setPositionForMemberShapeLayer(membersCompNames, memberName, memberCompName, songName) {
    var membersExpression = arrayToExpressionArray(membersCompNames);

    // language=JavaScript
    return `
        const members = ${membersExpression};
        const currentCompName = thisComp.name;
        const memberCompName = thisComp.name;

        const barHeight = comp("MasterComp").layer("constants").effect("barHeight")("Slider");
        const gap = comp("MasterComp").layer("constants").effect("barGap")("Slider");
        const startY = comp('MasterComp').layer('constants').effect('startY')('Slider');
        const startX = comp('MasterComp').layer('constants').effect('startX')('Slider');
        const maxBarWidth = comp("MasterComp").layer('constants').effect('barMaxWidth')('Slider');
        const progressAnimDur = comp("MasterComp").layer("constants").effect("animationDuration")('Slider');
        const ySwapAnimDur = comp("MasterComp").layer("constants").effect("ySwapAnimDur")('Slider');

        const parentLayer = comp("${songName}");
        const memberIndex = members.indexOf(memberCompName);


        function getLiveWidth(t, member) {
            const maxVotesValue = comp("${songName}").layer("controller").effect("maxVote")("Slider");
            const memberName = member.split("-")[1];
            const memberVotes = comp("${songName}").layer("controller").effect(memberName)("Slider");
            const memberLayerInParent = comp("${songName}").layer(member);
            const memberST = memberLayerInParent.startTime;
            const memberET = memberST + progressAnimDur;
            const curProgress = Math.round((memberVotes / maxVotesValue) * maxBarWidth);
            return easeOut(t, memberST, memberET, 0, curProgress);
        }

        function getStrictRankAtTime(t) {
            let tempRank = 0;
            const thisBarWidthAtTime = getLiveWidth(t, memberCompName);

            members.forEach(function (member) {
                let memberComp;
                try {
                    memberComp = parentLayer.layer(member);
                } catch (err) {
                    return;
                }

                if (memberComp.name !== currentCompName && memberComp.startTime < t) {
                    // iterator member's current width at time!
                    const iterMemAtTW = getLiveWidth(t, member) + (memberIndex * 0.0001);
                    if (iterMemAtTW > thisBarWidthAtTime) {
                        tempRank++;
                    }
                }
            });

            return tempRank;
        }


        const memberComp = comp("${songName}").layer(memberCompName);
        const parentTime = time + memberComp.startTime;

        const samples = 11;
        const step = ySwapAnimDur / (samples - 1);
        // smoothed rank!
        let rank = 0;
        for (let i = 0; i < samples; i++) {
            let sampleTime = parentTime - (ySwapAnimDur) + (i * step);
            rank += getStrictRankAtTime(sampleTime);
        }
        rank /= samples;

        const thisY = startY + rank * (barHeight + gap);
        [startX, thisY];
    `;
}


// this sets the position of the member name in the memberBar shape layer!
function setPositionForMemberName(memberBarLayerName) {
    return (`const progressBar = thisComp.layer('${memberBarLayerName}');
const gap = 10;

const progressBarHeight = comp("MasterComp").layer("constants").effect("barHeight")("Slider");
const progressBarStart = progressBar.transform.position[0];
const progressBarY = progressBar.transform.position[1];
const textWidth = sourceRectAtTime(time, false).width;

const x = progressBarStart - textWidth - gap;
const y = progressBarY + progressBarHeight/2;

[x, y];`)
}

function leftCenterAnchorPoint() {
    return (`const r = sourceRectAtTime(time, false);[r.left, r.top + r.height / 2];`);
}

function topCenterAnchorPoint() {
    return (`const r = sourceRectAtTime(time, false);[r.left + r.width / 2, r.top];`);
}

function deadCenterAnchorPoint() {
    return `const r = sourceRectAtTime(time, false); [r.left + r.width / 2, r.top + r.height / 2];`;
}

function topRightAnchorPoint() {
    return `const r = sourceRectAtTime(time, false); [r.left + r.width, r.top];`;
}

function topLeftAnchorPoint() {
    return `const r = sourceRectAtTime(time, false); [r.left, r.top];`;
}

// this is the function that will handle showing the poll! and animating the poll!
function memberBarSizeAnimation(compName, memberName) {
    // the member name is used to select the member's votes for that particular song!
    // you would need compName where this data exists and from there you can select the correct data via memberName
    // compName here is just the songName! (race template where data controller exists!)
    return (`const animationDuration = comp('MasterComp').layer('constants').effect('animationDuration')('Slider');
const thisMemberVotes = comp('${compName}').layer('controller').effect('${memberName}')('Slider');
const maxMemberVotes = comp('${compName}').layer('controller').effect('maxVote')('Slider');
const maxBarWidth = comp('MasterComp').layer('constants').effect('barMaxWidth')('Slider');

const thisMemberBarValue = (thisMemberVotes / maxMemberVotes) * maxBarWidth;

const startTimeSec = thisLayer.startTime;
const endTime = startTimeSec + animationDuration;

const width = easeOut(time, startTimeSec, endTime, 0, thisMemberBarValue);

[width, comp('MasterComp').layer('constants').effect('barHeight')('Slider')]`);
}

function setMemberImagePosition(memberProgressBarName) {
    // language=JavaScript
    return `
        const imageRightMargin = comp("MasterComp").layer("constants").effect("imgMarginR")("Slider") || 6;
        const progressBar = thisComp.layer("${memberProgressBarName}");
        const thisImageW = thisLayer.width * (transform.scale[0] / 100);

        const startX = comp("MasterComp").layer("constants").effect("startX")("Slider");
        const currentBarEndX = progressBar.content("Rectangle 1").content("Rectangle Path 1").size[0] + startX - thisImageW / 2;

        const barHeight = comp("MasterComp").layer("constants").effect("barHeight")("Slider");
        const progressBarY = progressBar.transform.position[1];

        const x = currentBarEndX;
        const y = Math.round(progressBarY + barHeight / 2);

        [x - imageRightMargin, y];
    `
}

function setMemberImageScale() {
    return (`const barHeight = comp("MasterComp").layer("constants").effect("barHeight")("Slider");
    const imageScale = barHeight * 0.08;

[imageScale, imageScale];`)
}

function setMatteLayerExpressions(matteLayer, memberProgressBarName) {
    matteLayer.property("Position").expression = "thisComp.layer(\"" + memberProgressBarName + "\").transform.position";
    matteLayer.content("Rectangle 1").content("Rectangle Path 1").size.expression = "thisComp.layer(\"" + memberProgressBarName + "\").content(\"Rectangle 1\").content(\"Rectangle Path 1\").size";
}

function progressPctSourceTxtExpression(songCompName, memberName) {
    return (`const totalVotes = comp("${songCompName}").layer("controller").effect("totalVotes")("Slider");
const thisMemberVotes = comp("${songCompName}").layer("controller").effect("${memberName}")("Slider");
const progressAnimDur = comp("MasterComp").layer("constants").effect("animationDuration")("Slider");

const pctValue = (thisMemberVotes/totalVotes) * 100;

const startTimeSec = thisLayer.startTime;
const endTime = startTimeSec + progressAnimDur;

const pct = easeOut(time, startTimeSec, endTime, 0, pctValue);
pct.toFixed(1) + "%";`)
}


function setSongNamePosition() {
    return `
        const x = thisComp.width / 2;
        [x, 30];
    `;
}

function setTopPosition(alignment, opts) {
    // Defaults
    var top = (opts && opts.top !== undefined) ? opts.top : 30;
    var left = (opts && opts.left !== undefined) ? opts.left : 30;
    var right = (opts && opts.right !== undefined) ? opts.right : 30;
    var offsetY = (opts && opts.offsetY !== undefined) ? opts.offsetY : 0;
    var offsetX = (opts && opts.offsetX !== undefined) ? opts.offsetX : 0;

    switch (alignment) {
        case "left":
            return `
                // Anchor: Top-Left
                var x = ${left} + ${offsetX};
                var y = ${top} + ${offsetY};
                [x, y];
            `;

        case "right":
            return `
                // Anchor: Top-Right
                var x = thisComp.width - ${right} + ${offsetX};
                var y = ${top} + ${offsetY};
                [x, y];
            `;

        case "center":
        default:
            return `
                // Anchor: Top-Center
                var x = thisComp.width / 2 + ${offsetX};
                var y = ${top} + ${offsetY};
                [x, y];
            `;
    }
}

function setMemberCompOpacity(memberCompName) {
    return `
        const memberComp = comp("${memberCompName}");
        const memberProgress = parseInt(memberComp.layer("progressPct").text.sourceText);
        const layerOpacity = memberProgress < 1 ? 0 : 100;
        
        [layerOpacity];
    `;
}


