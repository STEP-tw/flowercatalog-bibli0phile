let hideGif = function(){
  let gif = document.getElementById('gif');
  gif.style.visibility='hidden';
  setTimeout(makeVissible,500)
}

const makeVissible = function() {
  let gif = document.getElementById('gif');
  gif.style.visibility='visible';
}
