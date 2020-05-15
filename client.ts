import { VideoRequest, Votes } from "./video.model";

const listOfVidsElem = document.getElementById('listOfRequests');

function setDate(date: string): Date {
return new Date(date)
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
                  <strong>${setDate(videoInfo.submit_date)}</strong>
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

document.addEventListener('DOMContentLoaded', function() {
    const formVidReq = document.getElementById('formVideoRequest') as HTMLFormElement;

   
    
    fetch('http://localhost:7777/video-request').then(res => res.json()).then((data: VideoRequest[]) => 
    data.forEach(item =>
        {
            appendVideoPost(item);
        })
    );


    formVidReq.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(formVidReq)
      fetch('http://localhost:7777/video-request', {
        method: 'POST', 
        body: formData 
     }).then((bold) => bold.json()).then((data: VideoRequest) => {
        appendVideoPost(data, true);
      })
    })
  })