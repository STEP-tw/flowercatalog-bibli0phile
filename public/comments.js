const getComments = function (userComment) {
 let comments = '';
 userComment.forEach(feedback=>{
   comments += `
   <b>date:</b>${feedback.date}<br>
   <b>name:</b>${feedback.name}<br>
   <b>comment:</b>${feedback.comment}<br>
   <br>`;
 })
 return comments;
}

const comments = function () {
  function requestListener(){
    let usercomments = JSON.parse(this.responseText);
    let comment = document.getElementById('usercomments');
    comment.innerHTML = getComments(usercomments);
  }
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load',requestListener);
  oReq.open('get','/comments');
  oReq.send();
}

window.onload = comments;
