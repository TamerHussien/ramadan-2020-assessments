import { VideoRequest, Votes } from "./video.model";

const listOfVidsElem = document.getElementById('listOfRequests');
const SUPER_USER_ID = '19840222';
const state = {
  sortBy :'newFirst',
  searchTerm: '',
  filterBy: 'all',
  userId: '',
  isSuperUser: false,
}
function appendVideoPost(videoInfo: VideoRequest, isPrepend = false) {
    const videoContainerElm = document.createElement('div');
    videoContainerElm.innerHTML =  `
    <div class="card mb-3">
      ${state.isSuperUser
        ? `<div class="card-header d-flex justify-content-between">
      <select id="admin_change_status_${videoInfo._id}">
        <option value="new">new</option>
        <option value="planned">planned</option>
        <option value="done">done</option>
      </select>
      <div class="input-group ml-2 mr-5 ${videoInfo.status !== 'done'? 'd-none': ''}" id="admin_video_res_container_${videoInfo._id}">
      <input type="text" class="form-control" 
      id="admin_video_res_${videoInfo._id}"
      placeholder="paste here youtube video id">
      <div class="input-group-append">
        <button class="btn btn-outline-secondary"
        id="admin_save_video_res_${videoInfo._id}"
         type="button">Save</button>
      </div>
      </div>
      <button class="btn btn-danger"
      id="admin_delete_video_res_${videoInfo._id}"
      >Delete</button>
      </div> `: ''
    }
              <div class="card-body d-flex justify-content-between flex-row">
                <div class="d-flex flex-column">
                  <h3>${videoInfo.topic_title}</h3>
                  <p class="text-muted mb-2">${videoInfo.topic_details}</p>
                  <p class="mb-0 text-muted">
                    ${videoInfo.expected_result && `<strong>Expected results:</strong> ${videoInfo.expected_result}`
                    }
                  </p>
                </div>
                ${videoInfo.status === 'done'? `<div class="ml-auto mr-3">
                  <iframe width="240" height="135" src="http://www.youtube.com/embed/${videoInfo.video_ref.link}" frameborder="0" allowfullscreen></iframe>
                </div>`: ''}
                <div class="d-flex flex-column text-center">
                  <a class="btn btn-link" id="votes_ups_${videoInfo._id}">🔺</a>
                  <h3 id="score_votes_${videoInfo._id}">${videoInfo.votes.ups.length - videoInfo.votes.downs.length}</h3>
                  <a class="btn btn-link" id="votes_downs_${videoInfo._id}">🔻</a>
                </div>
              </div>
              <div class="card-footer d-flex flex-row justify-content-between">
                <div class="${videoInfo.status === 'done'? 'text-success': videoInfo.status === 'planned'? 'text-primary':''}">
                  <span>${videoInfo.status.toUpperCase()} ${videoInfo.status === 'done'? `on ${new Date(videoInfo.video_ref.date).toLocaleDateString()}`: ''}</span>
                  &bullet; added by <strong>${videoInfo.author_name}</strong> on
                  <strong>${new Date(videoInfo.submit_date).toLocaleDateString()}</strong>
                </div>
                <div
                  class="d-flex justify-content-center flex-column 408ml-auto mr-2"
                >
                  <div class="badge badge-success">
                  ${videoInfo.target_level}
                  </div>
                </div>
              </div>
            </div>
    `;
    if(isPrepend) {
      listOfVidsElem.prepend(videoContainerElm)
    } else {
      listOfVidsElem.appendChild(videoContainerElm)
    }
if (state.isSuperUser) {
    const adminChangeElm = document.getElementById(`admin_change_status_${videoInfo._id}`);
    const adminVideoResElm = document.getElementById(`admin_video_res_${videoInfo._id}`);
    const adminSaveElm = document.getElementById(`admin_save_video_res_${videoInfo._id}`);
    const adminDeleteElm = document.getElementById(`admin_delete_video_res_${videoInfo._id}`);
    const  adminVideoResContainer= document.getElementById(`admin_video_res_container_${videoInfo._id}`);
    
    (<HTMLInputElement>adminChangeElm).value = videoInfo.status;
    (<HTMLInputElement>adminVideoResElm).value = videoInfo.video_ref.link;

    adminChangeElm.addEventListener('change', (e) => {
      const val = (<HTMLInputElement>e.target).value;
      if(val === 'done') {
        adminVideoResContainer.classList.remove('d-none');
      } else {
        updateVideoStatus(videoInfo._id, val);
    }
  })

  adminSaveElm.addEventListener('click', (e) => {
    e.preventDefault();
    if(!(<HTMLInputElement>adminVideoResElm).value) {
      adminVideoResElm.classList.add('is-invalid');
      adminVideoResElm.addEventListener('input', () => adminVideoResElm.classList.remove('is-invalid'))
      return
    }
    updateVideoStatus(videoInfo._id, 'done', (<HTMLInputElement>adminVideoResElm).value);
    
  });

  adminDeleteElm.addEventListener('click', (e) => {
    console.log(e)
    e.preventDefault();
    const isSure = confirm(`Are You sure you want to delete ${videoInfo.topic_title}`)
    if(!isSure) return;
    fetch('http://localhost:7777/video-request', {
        method: 'DELETE',
        headers: {'content-Type': 'application/json'},
        body: JSON.stringify({id: videoInfo._id}),
    }).then(res => res.json()).then(data => {
      window.location.reload();
    })
  })
}
    applyVoteStyle(videoInfo.votes,videoInfo._id, videoInfo.status==="done" )

    const scoreVotesElem = document.getElementById(`score_votes_${videoInfo._id}`);
    const votesElms = document.querySelectorAll(`[id^=votes_][id$=_${videoInfo._id}]`);


    votesElms.forEach((elm) => {
      if(state.isSuperUser || videoInfo.status === 'done') {
        return;
      }
      elm.addEventListener('click',  (e) => {
        e.preventDefault();
        const [, vote_type, id] = elm.getAttribute('id').split('_');
        fetch('http://localhost:7777/video-request/vote', {
            method: 'PUT',
            headers: {'content-Type': 'application/json'},
            body: JSON.stringify({id, vote_type, user_id: state.userId}),
        }).then(res => res.json()).then((data: Votes) => {
            scoreVotesElem.innerText = (data.ups.length - data.downs.length).toString()
            applyVoteStyle(data, id,videoInfo.status === 'done' ,vote_type)
        })
      })
    })
}

function updateVideoStatus(id: string, status: string, resVideo = '') {
  fetch('http://localhost:7777/video-request', {
    method: 'PUT',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({id, status, resVideo})
  }).then((res) => res.json())
  .then(data => window.location.reload())
}

function applyVoteStyle(votes: Votes, video_id: string,isDisabled: boolean ,vote_type?: string) {
  const votesUpsElem = document.getElementById(`votes_ups_${video_id}`);
  const votesDownsElem = document.getElementById(`votes_downs_${video_id}`);
  if(isDisabled) {
    votesUpsElem.style.opacity = '0.5';
    votesUpsElem.style.cursor = 'not-allowed'
    votesDownsElem.style.opacity = '0.5'
    votesDownsElem.style.cursor = 'not-allowed'
  }
  if(!vote_type) {
    if(votes.ups.indexOf(state.userId) !== -1) {
      vote_type = 'ups'
    } else if (votes.downs.indexOf(state.userId) !== -1) {
      vote_type = 'downs'
    } else {
      return;
    }
  }

 

  const voteDirElm = vote_type === 'ups'? votesUpsElem : votesDownsElem;
  const otherDirElm = vote_type === 'ups'? votesDownsElem : votesUpsElem;

  if(votes[vote_type].includes(state.userId)) {
    voteDirElm.style.opacity = '1';
    otherDirElm.style.opacity = '0.5';
  } else  {
    otherDirElm.style.opacity = '1';
  }

}

function loadAllVidReqs(sortBy = 'newFirst', searchTerm = '', filterBy = 'all') {
  fetch(`http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}&filterBy=${filterBy}`).then(res => res.json()).then((data: VideoRequest[]) => {
  listOfVidsElem.innerHTML = '';
    data.forEach(item =>
        {
            appendVideoPost(item);
        })
      }
    );
}

function debounce(fn:Function, time: number) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), time);
  }
}

function checkValidity(formData: FormData): boolean {
  const topic = formData.get('topic_title');
  const topicDetails = formData.get('topic_details');
  if(!topic || topic.toString().length > 30) {
    document.querySelector('[name=topic_title]').classList.add('is-invalid')
  }
  if(!topicDetails) {
    document.querySelector('[name=topic_details]').classList.add('is-invalid')
  }
  const allInvalidElms = document.getElementById('formVideoRequest').querySelectorAll('.is-invalid');
  
  if(allInvalidElms.length) {
    allInvalidElms.forEach((elm)   => {
      elm.addEventListener('input', function() {
        this.classList.remove('is-invalid')
      })
    })
    return false;
  }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    const formVidReq = document.getElementById('formVideoRequest') as HTMLFormElement;
    const sortByElms = document.querySelectorAll('[id*=sort_by_]');
    const searchBoxElm = document.getElementById('search_box') as HTMLInputElement;
    const formLoginElm = document.querySelector('.form-login');
    const appContentElm = document.querySelector('.app-content');
    const filterByElms = document.querySelectorAll('[id*=filter_by_]')

    if(window.location.search) {
      state.userId = new URLSearchParams(window.location.search).get('id')
      if(state.userId === SUPER_USER_ID) {
        state.isSuperUser = true;
        document.querySelector('.normal-user-content').classList.add('d-none')
      }
      formLoginElm.classList.add('d-none');
      appContentElm.classList.remove('d-none');
    }
    loadAllVidReqs()
    filterByElms.forEach(elm => {
      elm.addEventListener('click', (e) => {
        const [,, filterBy] = elm.getAttribute('id').split('_');
        state.filterBy = filterBy;
        filterByElms.forEach(elm => elm.classList.remove('active'));
        elm.classList.add('active');
        loadAllVidReqs(state.searchTerm, state.searchTerm, state.filterBy);
      })
    })
    sortByElms.forEach(elm => {
      elm.addEventListener('click',function(e) {
        e.preventDefault();
        state.sortBy = this.querySelector('input').value;
        loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);
        this.classList.add('active');
        if(state.sortBy === 'topVotedFirst'){
          document.getElementById('sort_by_new').classList.remove('active');
        } else {
          document.getElementById('sort_by_top').classList.remove('active');
        }
      })
    })
    
    searchBoxElm.addEventListener('input', debounce((e: Event) => {
      state.searchTerm  = (<HTMLInputElement>e.target).value;
      loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy)
    }, 300))

    formVidReq.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(formVidReq)
      formData.append('author_id', state.userId);
      const isValid = checkValidity(formData);
      if (!isValid){ return}
      fetch('http://localhost:7777/video-request', {
        method: 'POST', 
        body: formData 
     }).then((bold) => bold.json()).then((data: VideoRequest) => {
        appendVideoPost(data, true);
      })
    })
  })