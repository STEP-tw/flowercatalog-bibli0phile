let fs = require('fs');
const http = require('http');
// const getComments = require(comments.js).getComments;
const timeStamp = require('./time.js').timeStamp;
const WebApp = require('./webapp');
const commentFile = fs.readFileSync('./data/comments.json')
let registered_users = [{userName:'sayima'},{userName:'ishu'}];
let toS = o=>JSON.stringify(o,null,2);

let contentTypes = {
  '.jpg': 'image/jpg',
  '.pdf': 'text/pdf',
  '.gif':'image/gif',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript'
}

let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};
let app = WebApp.create();
let redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/','/login']) && req.user) res.redirect('/guestBook.html');
}
let redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(['/','/guestBook.html','/logout']) && !req.user) res.redirect('/login');
}

const isFile = function(filePath){
  try {
    let stat = fs.statSync(filePath);
    return stat.isFile();
  } catch (e) {
    return false;
  }
}

let logRequest = (req,res)=>{
  let text = ['------------------------------',
    `${timeStamp()}`,
    `${req.method} ${req.url}`,
    `HEADERS=> ${toS(req.headers)}`,
    `COOKIES=> ${toS(req.cookies)}`,
    `BODY=> ${toS(req.body)}`,''].join('\n');
  fs.appendFile('request.log',text,()=>{});

  console.log(`${req.method} ${req.url}`);
}


let showFile = (req,res)=>{
  let filePath = `public${req.url}`
  if(req.method === 'GET' && isFile(filePath)){
    let fileEx = filePath.slice(filePath.lastIndexOf("."));
    res.setHeader('content-type',contentTypes[fileEx]);
    res.write(getFileContent(filePath));
    res.end();
  }
}

let getFileContent = function(filePath) {
  return fs.readFileSync(filePath);
}

app.use(logRequest)
app.use(loadUser);
app.use(redirectLoggedInUserToHome);
app.use(redirectLoggedOutUserToLogin);
app.postUse(showFile);

app.get('/login',(req,res)=>{
  res.setHeader('Content-type','text/html');
  res.write(getFileContent('./login.html'));
  res.end();
});

app.get('/comments.html',(req,res)=>{
  let commentFile = getFileContent('./comments.html');
  res.write(commentFile);
  res.end();
})

app.post('/comments.html',(req,res)=>{
  res.redirect('/guestBook.html');
  return;
});

app.post('/login',(req,res)=>{
  let user = registered_users.find(u=>u.userName==req.body.userName);
  if(!user) {
    res.redirect('/login');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/guestBook.html');
});

app.get('/guestBook.html',(req,res)=>{
  res.setHeader('Content-type','text/html');
  res.write(getFileContent('./guestBook.html'));
  res.end();
});

app.post('/guestBook.html',(req,res)=>{
  let comments= { name:req.user.userName,
    comment:req.body.comment
  }
  let userComment = (JSON.parse(commentFile));
  userComment.unshift(comments);
  fs.writeFileSync('./data/comments.json',JSON.stringify(userComment));
  res.redirect('/index.html');
  res.end();
})

app.get('/logout',(req,res)=>{
  res.setHeader('Set-Cookie','');
  delete req.user.sessionid;
  res.redirect('/index.html');
});

const PORT = 5000;
let server = http.createServer(app);
// server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
