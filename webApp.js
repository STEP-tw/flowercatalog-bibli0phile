const qs = require('querystring');

const toKeyValue = kv=>{
    let parts = kv.split('=');
    return {key:parts[0].trim(),value:parts[1].trim()};
};

const accumulate = (o,kv)=> {
  o[kv.key] = kv.value;
  return o;
};
const parseBody = text=> qs.parse(text) || {};

let redirect = function(path){
  console.log(`redirecting to ${path}`);
  this.statusCode = 302;
  this.setHeader('location',path);
  this.end();
};
const parseCookies = text=> {
  try {
    return text && text.split(';').map(toKeyValue).reduce(accumulate,{}) || {};
  }catch(e){
    return {};
  }
}
let invoke = function(req,res){
  let handler = this._handlers[req.method][req.url];
  if(!handler){
    return;
  }
  handler(req,res);
}

const initialize = function(){
  this._handlers = {GET:{},POST:{}};
  this._preprocess = [];
  this._postprocess = [];
};
const get = function(url,handler){
  this._handlers.GET[url] = handler;
}
const post = function(url,handler){
  this._handlers.POST[url] = handler;
};
const use = function(handler){
  this._preprocess.push(handler);
};
const postUse = function(handler){
  this._postprocess.push(handler);
};

let urlIsOneOf = function(urls){
  return urls.includes(this.url);
}
const main = function(req,res){
  res.redirect = redirect.bind(res);
  req.urlIsOneOf = urlIsOneOf.bind(req);
  req.cookies = parseCookies(req.headers.cookie||'');
  let content="";
  req.on('data',data=>content+=data.toString())
  req.on('end',()=>{
    req.body = parseBody(content);
    content="";
    this._preprocess.forEach(middleware=>{
      if(res.finished) return;
      middleware(req,res);
    });
    if(res.finished) return;
    invoke.call(this,req,res);
    this._postprocess.forEach(postprocessor=>{
      if(res.finished) return;
      postprocessor(req,res);
    });
    if(!res.finished){
      res.statusCode = 404;
      res.write('File not found!');
      res.end();
    }
  });
};

let create = ()=>{
  let rh = (req,res)=>{
    main.call(rh,req,res)
  };
  initialize.call(rh);
  rh.get = get;
  rh.post = post;
  rh.use = use;
  rh.postUse = postUse;
  return rh;
}
exports.create = create;
