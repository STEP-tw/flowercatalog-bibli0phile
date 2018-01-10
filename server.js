let fs = require('fs');
const http = require('http');
const timeStamp = require('./time.js').timeStamp;
const WebApp = require('./webapp');
let registered_users = [{userName:'sayima'},{userName:'ishu'}];
let toS = o=>JSON.stringify(o,null,2);
let userComments = fs.readFileSync('./data/comments.json');
userComments = JSON.parse(userComments);

let contentTypes = {
  '.jpg': 'image/jpg',
  '.pdf': 'text/pdf',
  '.gif':'image/gif',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.txt': 'text/plain',
  '.json':'application/json'
}

let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};


const isFile = function(filePath){
  try {
    let stat = fs.statSync(filePath);
    return stat.isFile();
  } catch (e) {
    return false;
  }
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

let app = WebApp.create();

let redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/','/login.html']) && req.user) res.redirect('/guestBook.html');
}

let redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(['/','/guestBook.html','/logout']) && !req.user) res.redirect('/login.html');
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



app.use(logRequest)
app.use(loadUser);
app.use(redirectLoggedInUserToHome);
app.use(redirectLoggedOutUserToLogin);
app.postUse(showFile);

app.get('/guestBook.html',(req,res)=>{
  console.log(req.user.userName);
  res.setHeader('Content-type','text/html');
  let guestBookFile = getFileContent('./guestBook.html').toString('utf8');
  guestBookFile = guestBookFile.replace('>username',`>${req.user.userName}`);
  res.write(guestBookFile);
  res.end();
});

app.get('/logout',(req,res)=>{
  res.setHeader('Set-Cookie',[`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/index.html');
});

app.get('/comments',(req,res)=>{
  res.write(JSON.stringify(userComments));
  res.end();
})

app.post('/login.html',(req,res)=>{
  let user = registered_users.find(u=>u.userName==req.body.userName);
  if(!user) {
    res.redirect('/login.html');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/guestBook.html');
});

app.post('/guestBook.html',(req,res)=>{
  let date = new Date();
  let comments= { date: date.toLocaleString(),
    name:req.user.userName,
    comment:req.body.comment
  }
  userComments.unshift(comments);
  fs.writeFile('./data/comments.json',JSON.stringify(userComments,null,2));
  res.redirect('/comments.html');
  res.end();
})


const PORT = 5000;
let server = http.createServer(app);
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
