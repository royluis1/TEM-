(function(){
var nav=document.getElementById("site-nav"),burger=document.getElementById("burger");
TEM.nav=function(){var u=TEM.user(),l=document.getElementById("login-link");if(l)l.textContent=u?"👤 "+TEM.abbr(u.name):"Ingresar";};
TEM.nav();
if(!nav)return;
var items=[].slice.call(nav.querySelectorAll(".has-sub"));
function btn(it){return it.querySelector(":scope > button");}
function close(it,ret){it.removeAttribute("data-open");btn(it).setAttribute("aria-expanded","false");if(ret)btn(it).focus();}
function closeAll(except){items.forEach(function(it){if(it!==except&&it.hasAttribute("data-open"))close(it);});}
function setMenu(on){document.body.toggleAttribute("data-menu",on);burger.setAttribute("aria-expanded",on?"true":"false");}
items.forEach(function(it){btn(it).addEventListener("click",function(){var was=it.hasAttribute("data-open");closeAll(it);if(was)close(it);else{it.setAttribute("data-open","");btn(it).setAttribute("aria-expanded","true");}});});
document.addEventListener("pointerdown",function(e){if(!nav.contains(e.target)&&!(burger&&burger.contains(e.target)))closeAll();});
document.addEventListener("keydown",function(e){
  if(e.key!=="Escape")return;
  var o=items.filter(function(i){return i.hasAttribute("data-open");})[0];
  if(o)close(o,true);else if(document.body.hasAttribute("data-menu")){setMenu(false);burger.focus();}
});
nav.addEventListener("focusout",function(e){if(e.relatedTarget&&!nav.contains(e.relatedTarget))closeAll();});
if(burger)burger.addEventListener("click",function(){setMenu(!document.body.hasAttribute("data-menu"));});
var sizes=[112.5,125,137.5],i=Math.max(0,sizes.indexOf(Number(TEM.get("tem_fs",112.5))));
function apply(){document.documentElement.style.fontSize=sizes[i]+"%";}
apply();
var fb=document.getElementById("fontbtn");
if(fb)fb.addEventListener("click",function(){i=(i+1)%sizes.length;apply();TEM.set("tem_fs",sizes[i]);});
})();
