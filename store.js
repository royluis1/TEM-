(function(){
var S=window.TEM={};
S.esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
S.abbr=function(n){var p=String(n).trim().split(/\s+/);return p.length>1?p[0]+" "+p[p.length-1].charAt(0).toUpperCase()+".":p[0];};
S.get=function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}};
S.set=function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
S.user=function(){return S.get("tem_user",null);};
S.login=function(name,email){S.set("tem_user",{name:name,email:email||""});};
S.logout=function(){try{localStorage.removeItem("tem_user");}catch(e){}};
S.hasApi=function(){return /^https?:/.test(window.TEM_API||"");};
S.LEVELS={"nivel-1":"Nivel 1","nivel-2":"Nivel 2","nivel-3":"Nivel 3"};
S.save=function(name,k,s,t){
  var a=S.get("tem_res",[]);a.push({name:name,k:k,s:s,t:t,ts:Date.now()});S.set("tem_res",a.slice(-300));
  if(!S.hasApi())return Promise.resolve("local");
  return fetch(window.TEM_API,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({name:name,k:k,s:s,t:t})}).then(function(){return "shared";}).catch(function(){return "local";});
};
S.localRows=function(){var m={};S.get("tem_res",[]).forEach(function(r){var key=r.name.toLowerCase()+"|"+r.k;if(!m[key]||r.s>=m[key].s)m[key]=r;});return Object.keys(m).map(function(k){var r=m[k];return {name:S.abbr(r.name),k:r.k,s:r.s,t:r.t,ts:r.ts};});};
S.rows=function(){
  if(!S.hasApi())return Promise.resolve({rows:S.localRows(),shared:false});
  return fetch(window.TEM_API+"?action=list").then(function(r){return r.json();}).then(function(j){return {rows:j.rows||[],shared:true};}).catch(function(){return {rows:S.localRows(),shared:false,failed:true};});
};
})();
