"use strict";
exports.__esModule = true;
var listOfVidsElem = document.getElementById('listOfRequests');
function setDate(date) {
    return new Date(date);
}
function appendVideoPost(videoInfo, isPrepend) {
    if (isPrepend === void 0) { isPrepend = false; }
    var videoContainerElm = document.createElement('div');
    videoContainerElm.innerHTML = "\n    <div class=\"card mb-3\">\n              <div class=\"card-body d-flex justify-content-between flex-row\">\n                <div class=\"d-flex flex-column\">\n                  <h3>" + videoInfo.topic_title + "</h3>\n                  <p class=\"text-muted mb-2\">" + videoInfo.topic_details + "</p>\n                  <p class=\"mb-0 text-muted\">\n                    " + (videoInfo.expected_result && "<strong>Expected results:</strong> " + videoInfo.expected_result) + "\n                  </p>\n                </div>\n                <div class=\"d-flex flex-column text-center\">\n                  <a class=\"btn btn-link\" id=\"votes_ups_" + videoInfo._id + "\">\uD83D\uDD3A</a>\n                  <h3 id=\"score_votes_" + videoInfo._id + "\">" + (videoInfo.votes.ups - videoInfo.votes.downs) + "</h3>\n                  <a class=\"btn btn-link\" id=\"votes_downs_" + videoInfo._id + "\">\uD83D\uDD3B</a>\n                </div>\n              </div>\n              <div class=\"card-footer d-flex flex-row justify-content-between\">\n                <div>\n                  <span class=\"text-info\">" + videoInfo.status.toUpperCase() + "</span>\n                  &bullet; added by <strong>" + videoInfo.author_name + "</strong> on\n                  <strong>" + setDate(videoInfo.submit_date) + "</strong>\n                </div>\n                <div\n                  class=\"d-flex justify-content-center flex-column 408ml-auto mr-2\"\n                >\n                  <div class=\"badge badge-success\">\n                  " + videoInfo.target_level + "\n                  </div>\n                </div>\n              </div>\n            </div>\n    ";
    if (isPrepend) {
        listOfVidsElem.prepend(videoContainerElm);
    }
    else {
        listOfVidsElem.appendChild(videoContainerElm);
    }
    var votesUpsElem = document.getElementById("votes_ups_" + videoInfo._id);
    var votesDownsElem = document.getElementById("votes_downs_" + videoInfo._id);
    var scoreVotesElem = document.getElementById("score_votes_" + videoInfo._id);
    votesUpsElem.addEventListener('click', function (e) {
        fetch('http://localhost:7777/video-request/vote', {
            method: 'PUT',
            headers: { 'content-Type': 'application/json' },
            body: JSON.stringify({ id: videoInfo._id, vote_type: 'ups' })
        }).then(function (res) { return res.json(); }).then(function (data) {
            return scoreVotesElem.innerText = (data.ups - data.downs).toString();
        });
    });
    votesDownsElem.addEventListener('click', function (e) {
        fetch('http://localhost:7777/video-request/vote', {
            method: 'PUT',
            headers: { 'content-Type': 'application/json' },
            body: JSON.stringify({ id: videoInfo._id, vote_type: 'downs' })
        }).then(function (res) { return res.json(); }).then(function (data) {
            return scoreVotesElem.innerText = (data.ups - data.downs).toString();
        });
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var formVidReq = document.getElementById('formVideoRequest');
    fetch('http://localhost:7777/video-request').then(function (res) { return res.json(); }).then(function (data) {
        return data.forEach(function (item) {
            appendVideoPost(item);
        });
    });
    formVidReq.addEventListener('submit', function (e) {
        e.preventDefault();
        var formData = new FormData(formVidReq);
        fetch('http://localhost:7777/video-request', {
            method: 'POST',
            body: formData
        }).then(function (bold) { return bold.json(); }).then(function (data) {
            appendVideoPost(data, true);
        });
    });
});
