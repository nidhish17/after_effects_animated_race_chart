// this is for the position of the pct text! it defines the position of the pct text
function progressPctTextPosition(rectShapeLayerName) {
  return "const progressBar = thisComp.layer('" + rectShapeLayerName + "');const progressBarHeight = comp(\"MasterComp\").layer(\"constants\").effect(\"barHeight\")(\"Slider\");\n\nconst gap = 10;\n\nconst progressBarW = progressBar.content(\"Rectangle 1\").content(\"Rectangle Path 1\").size[0] + progressBar.transform.position[0] + gap;\nconst x = progressBarW;\nconst y = progressBar.transform.position[1] + progressBarHeight/2;\n\n[x, y];";
}
function setPositionForMemberShapeLayer(membersCompNames, memberName, memberCompName, songName) {
  var membersExpression = arrayToExpressionArray(membersCompNames);

  // language=JavaScript
  return "\n        const members = " + membersExpression + ";\n        const currentCompName = thisComp.name;\n        const memberCompName = thisComp.name;\n\n        const barHeight = comp(\"MasterComp\").layer(\"constants\").effect(\"barHeight\")(\"Slider\");\n        const gap = comp(\"MasterComp\").layer(\"constants\").effect(\"barGap\")(\"Slider\");\n        const startY = comp('MasterComp').layer('constants').effect('startY')('Slider');\n        const startX = comp('MasterComp').layer('constants').effect('startX')('Slider');\n        const maxBarWidth = comp(\"MasterComp\").layer('constants').effect('barMaxWidth')('Slider');\n        const progressAnimDur = comp(\"MasterComp\").layer(\"constants\").effect(\"animationDuration\")('Slider');\n        const ySwapAnimDur = comp(\"MasterComp\").layer(\"constants\").effect(\"ySwapAnimDur\")('Slider');\n\n        const parentLayer = comp(\"" + songName + "\");\n        const memberIndex = members.indexOf(memberCompName);\n\n\n        function getLiveWidth(t, member) {\n            const maxVotesValue = comp(\"" + songName + "\").layer(\"controller\").effect(\"maxVote\")(\"Slider\");\n            const memberName = member.split(\"-\")[1];\n            const memberVotes = comp(\"" + songName + "\").layer(\"controller\").effect(memberName)(\"Slider\");\n            const memberLayerInParent = comp(\"" + songName + "\").layer(member);\n            const memberST = memberLayerInParent.startTime;\n            const memberET = memberST + progressAnimDur;\n            const curProgress = Math.round((memberVotes / maxVotesValue) * maxBarWidth);\n            return easeOut(t, memberST, memberET, 0, curProgress);\n        }\n\n        function getStrictRankAtTime(t) {\n            let tempRank = 0;\n            const thisBarWidthAtTime = getLiveWidth(t, memberCompName);\n\n            members.forEach(function (member) {\n                let memberComp;\n                try {\n                    memberComp = parentLayer.layer(member);\n                } catch (err) {\n                    return;\n                }\n\n                if (memberComp.name !== currentCompName && memberComp.startTime < t) {\n                    // iterator member's current width at time!\n                    const iterMemAtTW = getLiveWidth(t, member) + (memberIndex * 0.0001);\n                    if (iterMemAtTW > thisBarWidthAtTime) {\n                        tempRank++;\n                    }\n                }\n            });\n\n            return tempRank;\n        }\n\n\n        const memberComp = comp(\"" + songName + "\").layer(memberCompName);\n        const parentTime = time + memberComp.startTime;\n\n        const samples = 11;\n        const step = ySwapAnimDur / (samples - 1);\n        // smoothed rank!\n        let rank = 0;\n        for (let i = 0; i < samples; i++) {\n            let sampleTime = parentTime - (ySwapAnimDur) + (i * step);\n            rank += getStrictRankAtTime(sampleTime);\n        }\n        rank /= samples;\n\n        const thisY = startY + rank * (barHeight + gap);\n        [startX, thisY];\n    ";
}

// this sets the position of the member name in the memberBar shape layer!
function setPositionForMemberName(memberBarLayerName) {
  return "const progressBar = thisComp.layer('" + memberBarLayerName + "');\nconst gap = 10;\n\nconst progressBarHeight = comp(\"MasterComp\").layer(\"constants\").effect(\"barHeight\")(\"Slider\");\nconst progressBarStart = progressBar.transform.position[0];\nconst progressBarY = progressBar.transform.position[1];\nconst textWidth = sourceRectAtTime(time, false).width;\n\nconst x = progressBarStart - textWidth - gap;\nconst y = progressBarY + progressBarHeight/2;\n\n[x, y];";
}
function leftCenterAnchorPoint() {
  return "const r = sourceRectAtTime(time, false);[r.left, r.top + r.height / 2];";
}
function topCenterAnchorPoint() {
  return "const r = sourceRectAtTime(time, false);[r.left + r.width / 2, r.top];";
}
function deadCenterAnchorPoint() {
  return "const r = sourceRectAtTime(time, false); [r.left + r.width / 2, r.top + r.height / 2];";
}
function topRightAnchorPoint() {
  return "const r = sourceRectAtTime(time, false); [r.left + r.width, r.top];";
}
function topLeftAnchorPoint() {
  return "const r = sourceRectAtTime(time, false); [r.left, r.top];";
}

// this is the function that will handle showing the poll! and animating the poll!
function memberBarSizeAnimation(compName, memberName) {
  // the member name is used to select the member's votes for that particular song!
  // you would need compName where this data exists and from there you can select the correct data via memberName
  // compName here is just the songName! (race template where data controller exists!)
  return "const animationDuration = comp('MasterComp').layer('constants').effect('animationDuration')('Slider');\nconst thisMemberVotes = comp('" + compName + "').layer('controller').effect('" + memberName + "')('Slider');\nconst maxMemberVotes = comp('" + compName + "').layer('controller').effect('maxVote')('Slider');\nconst maxBarWidth = comp('MasterComp').layer('constants').effect('barMaxWidth')('Slider');\n\nconst thisMemberBarValue = (thisMemberVotes / maxMemberVotes) * maxBarWidth;\n\nconst startTimeSec = thisLayer.startTime;\nconst endTime = startTimeSec + animationDuration;\n\nconst width = easeOut(time, startTimeSec, endTime, 0, thisMemberBarValue);\n\n[width, comp('MasterComp').layer('constants').effect('barHeight')('Slider')]";
}
function setMemberImagePosition(memberProgressBarName) {
  // language=JavaScript
  return "\n        const imageRightMargin = comp(\"MasterComp\").layer(\"constants\").effect(\"imgMarginR\")(\"Slider\") || 6;\n        const progressBar = thisComp.layer(\"" + memberProgressBarName + "\");\n        const thisImageW = thisLayer.width * (transform.scale[0] / 100);\n\n        const startX = comp(\"MasterComp\").layer(\"constants\").effect(\"startX\")(\"Slider\");\n        const currentBarEndX = progressBar.content(\"Rectangle 1\").content(\"Rectangle Path 1\").size[0] + startX - thisImageW / 2;\n\n        const barHeight = comp(\"MasterComp\").layer(\"constants\").effect(\"barHeight\")(\"Slider\");\n        const progressBarY = progressBar.transform.position[1];\n\n        const x = currentBarEndX;\n        const y = Math.round(progressBarY + barHeight / 2);\n\n        [x - imageRightMargin, y];\n    ";
}
function setMemberImageScale() {
  return "const barHeight = comp(\"MasterComp\").layer(\"constants\").effect(\"barHeight\")(\"Slider\");\n    const imageScale = barHeight * 0.08;\n\n[imageScale, imageScale];";
}
function setMatteLayerExpressions(matteLayer, memberProgressBarName) {
  matteLayer.property("Position").expression = "thisComp.layer(\"" + memberProgressBarName + "\").transform.position";
  matteLayer.content("Rectangle 1").content("Rectangle Path 1").size.expression = "thisComp.layer(\"" + memberProgressBarName + "\").content(\"Rectangle 1\").content(\"Rectangle Path 1\").size";
}
function progressPctSourceTxtExpression(songCompName, memberName) {
  return "const totalVotes = comp(\"" + songCompName + "\").layer(\"controller\").effect(\"totalVotes\")(\"Slider\");\nconst thisMemberVotes = comp(\"" + songCompName + "\").layer(\"controller\").effect(\"" + memberName + "\")(\"Slider\");\nconst progressAnimDur = comp(\"MasterComp\").layer(\"constants\").effect(\"animationDuration\")(\"Slider\");\n\nconst pctValue = (thisMemberVotes/totalVotes) * 100;\n\nconst startTimeSec = thisLayer.startTime;\nconst endTime = startTimeSec + progressAnimDur;\n\nconst pct = easeOut(time, startTimeSec, endTime, 0, pctValue);\npct.toFixed(1) + \"%\";";
}
function setSongNamePosition() {
  return "\n        const x = thisComp.width / 2;\n        [x, 30];\n    ";
}
function setTopPosition(alignment, opts) {
  // Defaults
  var top = opts && opts.top !== undefined ? opts.top : 30;
  var left = opts && opts.left !== undefined ? opts.left : 30;
  var right = opts && opts.right !== undefined ? opts.right : 30;
  var offsetY = opts && opts.offsetY !== undefined ? opts.offsetY : 0;
  var offsetX = opts && opts.offsetX !== undefined ? opts.offsetX : 0;
  switch (alignment) {
    case "left":
      return "\n                // Anchor: Top-Left\n                var x = " + left + " + " + offsetX + ";\n                var y = " + top + " + " + offsetY + ";\n                [x, y];\n            ";
    case "right":
      return "\n                // Anchor: Top-Right\n                var x = thisComp.width - " + right + " + " + offsetX + ";\n                var y = " + top + " + " + offsetY + ";\n                [x, y];\n            ";
    case "center":
    default:
      return "\n                // Anchor: Top-Center\n                var x = thisComp.width / 2 + " + offsetX + ";\n                var y = " + top + " + " + offsetY + ";\n                [x, y];\n            ";
  }
}
function setMemberCompOpacity(memberCompName) {
  return "\n        const memberComp = comp(\"" + memberCompName + "\");\n        const memberProgress = parseInt(memberComp.layer(\"progressPct\").text.sourceText);\n        const layerOpacity = memberProgress < 1 ? 0 : 100;\n        \n        [layerOpacity];\n    ";
}
