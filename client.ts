import { VideoRequest, Votes } from "./video.model";

const listOfVidsElem = document.getElementById('listOfRequests');

const state = {
  sortBy :'newFirst',
  searchTerm: '',
  userId: '',
}
function appendVideoPost(videoInfo: VideoRequest, isPrepend = false) {
    const videoContainerElm = document.createElement('div');
    videoContainerElm.innerHTML =  `
    <div class="card mb-3">
              <div class="card-body d-flex justify-content-between flex-row">
                <div class="d-flex flex-column">
                  <h3>${videoInfo.topic_title}</h3>
                  <p class="text-muted mb-2">${videoInfo.topic_details}</p>
                  <p class="mb-0 text-muted">
                    ${videoInfo.expected_result && `<strong>Expected results:</strong> ${videoInfo.expected_result}`
                    }
                  </p>
                </div>
                <div class="d-flex flex-column text-center">
                  <a class="btn btn-link" id="votes_ups_${videoInfo._id}">🔺</a>
                  <h3 id="score_votes_${videoInfo._id}">${videoInfo.votes.ups - videoInfo.votes.downs}</h3>
                  <a class="btn btn-link" id="votes_downs_${videoInfo._id}">🔻</a>
                </div>
              </div>
              <div class="card-footer d-flex flex-row justify-content-between">
                <div>
                  <span class="text-info">${videoInfo.status.toUpperCase()}</span>
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
    const votesUpsElem = document.getElementById(`votes_ups_${videoInfo._id}`);
    const votesDownsElem = document.getElementById(`votes_downs_${videoInfo._id}`);
    const scoreVotesElem = document.getElementById(`score_votes_${videoInfo._id}`);
    votesUpsElem.addEventListener('click', (e) => {
        fetch('http://localhost:7777/video-request/vote', {
            method: 'PUT',
            headers: {'content-Type': 'application/json'},
            body: JSON.stringify({id: videoInfo._id, vote_type: 'ups'}),
        }).then(res => res.json()).then((data: Votes) => 
            scoreVotesElem.innerText = (data.ups - data.downs).toString()
            )
    });

    votesDownsElem.addEventListener('click', (e) => {
        fetch('http://localhost:7777/video-request/vote', {
            method: 'PUT',
            headers: {'content-Type': 'application/json'},
            body: JSON.stringify({id: videoInfo._id, vote_type: 'downs'}),
        }).then(res => res.json()).then((data: Votes) => 
            scoreVotesElem.innerText = (data.ups - data.downs).toString()
            )
    });
}

function loadAllVidReqs(sortBy = 'newFirst', searchTerm = '') {
  fetch(`http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`).then(res => res.json()).then((data: VideoRequest[]) => {
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

    if(window.location.search) {
      state.userId = new URLSearchParams(window.location.search).get('id')
      formLoginElm.classList.add('d-none');
      appContentElm.classList.remove('d-none');
    }
    loadAllVidReqs()
    sortByElms.forEach(elm => {
      elm.addEventListener('click',function(e) {
        e.preventDefault();
        state.sortBy = this.querySelector('input').value;
        loadAllVidReqs(state.sortBy);
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
      loadAllVidReqs(state.sortBy, state.searchTerm)
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