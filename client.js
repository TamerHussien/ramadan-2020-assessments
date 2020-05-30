"use strict";
exports.__esModule = true;
var listOfVidsElem = document.getElementById('listOfRequests');
var SUPER_USER_ID = '19840222';
var state = {
    sortBy: 'newFirst',
    searchTerm: '',
    userId: '',
    isSuperUser: false
};
function appendVideoPost(videoInfo, isPrepend) {
    if (isPrepend === void 0) { isPrepend = false; }
    var videoContainerElm = document.createElement('div');
    videoContainerElm.innerHTML = "\n    <div class=\"card mb-3\">\n      " + (state.isSuperUser
        ? "<div class=\"card-header d-flex justify-content-between\">\n      <select id=\"admin_change_status_" + videoInfo._id + "\">\n        <option value=\"new\">new</option>\n        <option value=\"planned\">planned</option>\n        <option value=\"done\">done</option>\n      </select>\n      <div class=\"input-group ml-2 mr-5 " + (videoInfo.status !== 'done' ? 'd-none' : '') + "\" id=\"admin_video_res_container_" + videoInfo._id + "\">\n      <input type=\"text\" class=\"form-control\" \n      id=\"admin_video_res_" + videoInfo._id + "\"\n      placeholder=\"paste here youtube video id\">\n      <div class=\"input-group-append\">\n        <button class=\"btn btn-outline-secondary\"\n        id=\"admin_save_video_res_" + videoInfo._id + "\"\n         type=\"button\">Save</button>\n      </div>\n      </div>\n      <button class=\"btn btn-danger\"\n      id=\"admin_delete_video_res_" + videoInfo._id + "\"\n      >Delete</button>\n      </div> " : '') + "\n              <div class=\"card-body d-flex justify-content-between flex-row\">\n                <div class=\"d-flex flex-column\">\n                  <h3>" + videoInfo.topic_title + "</h3>\n                  <p class=\"text-muted mb-2\">" + videoInfo.topic_details + "</p>\n                  <p class=\"mb-0 text-muted\">\n                    " + (videoInfo.expected_result && "<strong>Expected results:</strong> " + videoInfo.expected_result) + "\n                  </p>\n                </div>\n                <div class=\"d-flex flex-column text-center\">\n                  <a class=\"btn btn-link\" id=\"votes_ups_" + videoInfo._id + "\">\uD83D\uDD3A</a>\n                  <h3 id=\"score_votes_" + videoInfo._id + "\">" + (videoInfo.votes.ups.length - videoInfo.votes.downs.length) + "</h3>\n                  <a class=\"btn btn-link\" id=\"votes_downs_" + videoInfo._id + "\">\uD83D\uDD3B</a>\n                </div>\n              </div>\n              <div class=\"card-footer d-flex flex-row justify-content-between\">\n                <div>\n                  <span class=\"text-info\">" + videoInfo.status.toUpperCase() + "</span>\n                  &bullet; added by <strong>" + videoInfo.author_name + "</strong> on\n                  <strong>" + new Date(videoInfo.submit_date).toLocaleDateString() + "</strong>\n                </div>\n                <div\n                  class=\"d-flex justify-content-center flex-column 408ml-auto mr-2\"\n                >\n                  <div class=\"badge badge-success\">\n                  " + videoInfo.target_level + "\n                  </div>\n                </div>\n              </div>\n            </div>\n    ";
    if (isPrepend) {
        listOfVidsElem.prepend(videoContainerElm);
    }
    else {
        listOfVidsElem.appendChild(videoContainerElm);
    }
    if (state.isSuperUser) {
        var adminChangeElm = document.getElementById("admin_change_status_" + videoInfo._id);
        var adminVideoResElm_1 = document.getElementById("admin_video_res_" + videoInfo._id);
        var adminSaveElm = document.getElementById("admin_save_video_res_" + videoInfo._id);
        var adminDeleteElm = document.getElementById("admin_delete_video_res_" + videoInfo._id);
        var adminVideoResContainer_1 = document.getElementById("admin_video_res_container_" + videoInfo._id);
        adminChangeElm.value = videoInfo.status;
        adminVideoResElm_1.value = videoInfo.video_ref.link;
        adminChangeElm.addEventListener('change', function (e) {
            var val = e.target.value;
            if (val === 'done') {
                adminVideoResContainer_1.classList.remove('d-none');
            }
            else {
                updateVideoStatus(videoInfo._id, val);
            }
        });
        adminSaveElm.addEventListener('click', function (e) {
            e.preventDefault();
            if (!adminVideoResElm_1.value) {
                adminVideoResElm_1.classList.add('is-invalid');
                adminVideoResElm_1.addEventListener('input', function () { return adminVideoResElm_1.classList.remove('is-invalid'); });
                return;
            }
            updateVideoStatus(videoInfo._id, 'done', adminVideoResElm_1.value);
        });
        adminDeleteElm.addEventListener('click', function (e) {
            console.log(e);
            e.preventDefault();
            var isSure = confirm("Are You sure you want to delete " + videoInfo.topic_title);
            if (!isSure)
                return;
            fetch('http://localhost:7777/video-request', {
                method: 'DELETE',
                headers: { 'content-Type': 'application/json' },
                body: JSON.stringify({ id: videoInfo._id })
            }).then(function (res) { return res.json(); }).then(function (data) {
                window.location.reload();
            });
        });
    }
    applyVoteStyle(videoInfo.votes, videoInfo._id);
    var scoreVotesElem = document.getElementById("score_votes_" + videoInfo._id);
    var votesElms = document.querySelectorAll("[id^=votes_][id$=_" + videoInfo._id + "]");
    votesElms.forEach(function (elm) {
        if (state.isSuperUser) {
            return;
        }
        elm.addEventListener('click', function (e) {
            e.preventDefault();
            var _a = elm.getAttribute('id').split('_'), vote_type = _a[1], id = _a[2];
            fetch('http://localhost:7777/video-request/vote', {
                method: 'PUT',
                headers: { 'content-Type': 'application/json' },
                body: JSON.stringify({ id: id, vote_type: vote_type, user_id: state.userId })
            }).then(function (res) { return res.json(); }).then(function (data) {
                scoreVotesElem.innerText = (data.ups.length - data.downs.length).toString();
                applyVoteStyle(data, id, vote_type);
            });
        });
    });
}
function updateVideoStatus(id, status, resVideo) {
    if (resVideo === void 0) { resVideo = ''; }
    fetch('http://localhost:7777/video-request', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: id, status: status, resVideo: resVideo })
    }).then(function (res) { return res.json(); })
        .then(function (data) { return window.location.reload(); });
}
function applyVoteStyle(votes, video_id, vote_type) {
    var votesUpsElem = document.getElementById("votes_ups_" + video_id);
    var votesDownsElem = document.getElementById("votes_downs_" + video_id);
    if (state.isSuperUser) {
        votesUpsElem.style.opacity = '0.5';
        votesUpsElem.style.cursor = 'not-allowed';
        votesDownsElem.style.opacity = '0.5';
        votesDownsElem.style.cursor = 'not-allowed';
    }
    if (!vote_type) {
        if (votes.ups.indexOf(state.userId) !== -1) {
            vote_type = 'ups';
        }
        else if (votes.downs.indexOf(state.userId) !== -1) {
            vote_type = 'downs';
        }
        else {
            return;
        }
    }
    var voteDirElm = vote_type === 'ups' ? votesUpsElem : votesDownsElem;
    var otherDirElm = vote_type === 'ups' ? votesDownsElem : votesUpsElem;
    if (votes[vote_type].includes(state.userId)) {
        voteDirElm.style.opacity = '1';
        otherDirElm.style.opacity = '0.5';
    }
    else {
        otherDirElm.style.opacity = '1';
    }
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
        if (state.userId === SUPER_USER_ID) {
            state.isSuperUser = true;
            document.querySelector('.normal-user-content').classList.add('d-none');
        }
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
