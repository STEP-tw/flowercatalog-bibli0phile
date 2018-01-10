// const commentFile = fs.readFileSync('./../data/comments.json');
// let userComment = (JSON.parse(commentFile));

const getComments = function (userComment) {
 let comments = '';
 userComment.forEach(feedback=>{
   comments+=feedback['date']+' ';
   comments+=feedback['name']+' ';
   comments+=feedback['comment']+' ';
   comments=`${comments} \n`;
 })
 console.log(comments);
 return comments;
}

const comments = function () {
  function requestListener(){
    let usercomments = JSON.parse(this.responseText);
    let comment = document.getElementById('usercomments');
    comment.innerText = getComments(usercomments);
  }
  // console.log(`jhcditckcxitdxkckdik`);
  var oReq = new XMLHttpRequest();
  oReq.addEventListener('load',requestListener);
  oReq.open('get','/comments');
  oReq.send();
}

// exports.comments = comments;
window.onload = comments;
