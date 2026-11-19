(function(){
var nav=document.getElementById("site-nav"),burger=document.getElementById("burger");
TEM.nav=function(){TEM.getUser().then(function(u){var l=document.getElementById("login-link");if(!l)return;l.textContent=u?"👤 "+TEM.abbr(u.name):"Ingresar";l.setAttribute("href",l.getAttribute("href").replace(/(ingresar|perfil)\.html$/,u?"perfil.html":"ingresar.html"));});};
TEM.nav();
if(!nav)return;
var items=[].slice.call(nav.querySelectorAll(".has-sub"));
function btn(it){return it.querySelector(":scope > button");}
var courses=items.filter(function(it){return btn(it).textContent.trim()==="Cursos";})[0];
var coursesPanel=courses&&courses.querySelector(":scope > .menu-panel");
if(coursesPanel&&!coursesPanel.querySelector('a[href*="Herramientas-Digitales/index.html"]')){
  var allCourses=[].filter.call(coursesPanel.querySelectorAll("a"),function(a){var title=a.querySelector("b");return title&&title.textContent.trim()==="Todos los cursos";})[0];
  if(allCourses){
    var courseLink=document.createElement("a"),courseTitle=document.createElement("b"),courseDescription=document.createElement("span");
    courseLink.href=new URL("Herramientas-Digitales/index.html",allCourses.href).href;
    courseTitle.textContent="Herramientas digitales";
    courseDescription.textContent="Dos clases para vender con redes";
    courseLink.appendChild(courseTitle);courseLink.appendChild(courseDescription);coursesPanel.appendChild(courseLink);
  }
}
function close(it,ret){it.removeAttribute("data-open");collapse(it);btn(it).setAttribute("aria-expanded","false");if(ret)btn(it).focus();}
function closeAll(except){items.forEach(function(it){if(it!==except&&it.hasAttribute("data-open"))close(it);});}
function setMenu(on){document.body.toggleAttribute("data-menu",on);burger.setAttribute("aria-expanded",on?"true":"false");}
function collapse(it){[].forEach.call(it.querySelectorAll(".sub-btn"),function(b){b.setAttribute("aria-expanded","false");document.getElementById(b.getAttribute("aria-controls")).hidden=true;});}
[].forEach.call(nav.querySelectorAll(".sub-btn"),function(b){b.addEventListener("click",function(){var open=b.getAttribute("aria-expanded")==="true";b.setAttribute("aria-expanded",open?"false":"true");document.getElementById(b.getAttribute("aria-controls")).hidden=open;});});
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
