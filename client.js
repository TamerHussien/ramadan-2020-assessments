"use strict";
exports.__esModule = true;
var listOfVidsElem = document.getElementById('listOfRequests');
var state = {
    sortBy: 'newFirst',
    searchTerm: '',
    userId: ''
};
function appendVideoPost(videoInfo, isPrepend) {
    if (isPrepend === void 0) { isPrepend = false; }
    var videoContainerElm = document.createElement('div');
    videoContainerElm.innerHTML = "\n    <div class=\"card mb-3\">\n              <div class=\"card-body d-flex justify-content-between flex-row\">\n                <div class=\"d-flex flex-column\">\n                  <h3>" + videoInfo.topic_title + "</h3>\n                  <p class=\"text-muted mb-2\">" + videoInfo.topic_details + "</p>\n                  <p class=\"mb-0 text-muted\">\n                    " + (videoInfo.expected_result && "<strong>Expected results:</strong> " + videoInfo.expected_result) + "\n                  </p>\n                </div>\n                <div class=\"d-flex flex-column text-center\">\n                  <a class=\"btn btn-link\" id=\"votes_ups_" + videoInfo._id + "\">\uD83D\uDD3A</a>\n                  <h3 id=\"score_votes_" + videoInfo._id + "\">" + (videoInfo.votes.ups - videoInfo.votes.downs) + "</h3>\n                  <a class=\"btn btn-link\" id=\"votes_downs_" + videoInfo._id + "\">\uD83D\uDD3B</a>\n                </div>\n              </div>\n              <div class=\"card-footer d-flex flex-row justify-content-between\">\n                <div>\n                  <span class=\"text-info\">" + videoInfo.status.toUpperCase() + "</span>\n                  &bullet; added by <strong>" + videoInfo.author_name + "</strong> on\n                  <strong>" + new Date(videoInfo.submit_date).toLocaleDateString() + "</strong>\n                </div>\n                <div\n                  class=\"d-flex justify-content-center flex-column 408ml-auto mr-2\"\n                >\n                  <div class=\"badge badge-success\">\n                  " + videoInfo.target_level + "\n                  </div>\n                </div>\n              </div>\n            </div>\n    ";
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
function loadAllVidReqs(sortBy, searchTerm) {
    if (sortBy === void 0) { sortBy = 'newFirst'; }
    if (searchTerm === void 0) { searchTerm = ''; }
    fetch("http://localhost:7777/video-request?sortBy=" + sortBy + "&searchTerm=" + searchTerm).then(function (res) { return res.json(); }).then(function (data) {
        listOfVidsElem.innerHTML = '';
        data.forEach(function (item) {
            appendVideoPost(item);
        });
    });
}
function debounce(fn, time) {
    var timeout;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return fn.apply(_this, args); }, time);
    };
}
function checkValidity(formData) {
    var topic = formData.get('topic_title');
    var topicDetails = formData.get('topic_details');
    if (!topic || topic.toString().length > 30) {
        document.querySelector('[name=topic_title]').classList.add('is-invalid');
    }
    if (!topicDetails) {
        document.querySelector('[name=topic_details]').classList.add('is-invalid');
    }
    var allInvalidElms = document.getElementById('formVideoRequest').querySelectorAll('.is-invalid');
    if (allInvalidElms.length) {
        allInvalidElms.forEach(function (elm) {
            elm.addEventListener('input', function () {
                this.classList.remove('is-invalid');
            });
        });
        return false;
    }
    return true;
}
document.addEventListener('DOMContentLoaded', function () {
    var formVidReq = document.getElementById('formVideoRequest');
    var sortByElms = document.querySelectorAll('[id*=sort_by_]');
    var searchBoxElm = document.getElementById('search_box');
    var formLoginElm = document.querySelector('.form-login');
    var appContentElm = document.querySelector('.app-content');
    if (window.location.search) {
        state.userId = new URLSearchParams(window.location.search).get('id');
        formLoginElm.classList.add('d-none');
        appContentElm.classList.remove('d-none');
    }
    loadAllVidReqs();
    sortByElms.forEach(function (elm) {
        elm.addEventListener('click', function (e) {
            e.preventDefault();
            state.sortBy = this.querySelector('input').value;
            loadAllVidReqs(state.sortBy);
            this.classList.add('active');
            if (state.sortBy === 'topVotedFirst') {
                document.getElementById('sort_by_new').classList.remove('active');
            }
            else {
                document.getElementById('sort_by_top').classList.remove('active');
            }
        });
    });
    searchBoxElm.addEventListener('input', debounce(function (e) {
        state.searchTerm = e.target.value;
        loadAllVidReqs(state.sortBy, state.searchTerm);
    }, 300));
    formVidReq.addEventListener('submit', function (e) {
        e.preventDefault();
        var formData = new FormData(formVidReq);
        formData.append('author_id', state.userId);
        var isValid = checkValidity(formData);
        if (!isValid) {
            return;
        }
        fetch('http://localhost:7777/video-request', {
            method: 'POST',
            body: formData
        }).then(function (bold) { return bold.json(); }).then(function (data) {
            appendVideoPost(data, true);
        });
    });
});
