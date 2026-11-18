(function(){
var box=document.getElementById("login");if(!box)return;var root=box.dataset.root,mode="in";
function msg(t,bad){var m=document.getElementById("msg");if(m){m.className="fb "+(bad?"no":"ok");m.textContent=t;}}
function draw(){
  TEM.getUser().then(function(u){
    if(u){
      box.innerHTML='<h1>👤 Hola, '+TEM.esc(u.name)+'</h1><p class="lead">Tus resultados:</p><div id="mine"><p class="meta">Cargando…</p></div><div class="actions"><a class="btn" href="'+root+'cursos/index.html">Ir a los cursos</a><button class="btn alt" type="button" id="logout">Cerrar sesión</button></div>';
      TEM.mine(u).then(function(rows){document.getElementById("mine").innerHTML=rows.length?TEM.tableHtml(rows):'<div class="card">Todavía no rendiste ninguna evaluación.</div>';});
      document.getElementById("logout").onclick=function(){TEM.signOut().then(function(){TEM.nav();draw();});};
      return;
    }
    var up=mode==="up",rd=TEM.ready;
    box.innerHTML='<h1>'+(up?"Crear cuenta":"Ingresar")+'</h1><form class="card" id="lf">'+
      (up||!rd?'<label for="lu">Nombre y apellido</label><input id="lu" required maxlength="40" autocomplete="name">':'')+
      '<label for="le">Correo</label><input id="le" type="email" inputmode="email" required maxlength="80" autocomplete="email">'+
      (rd?'<label for="lp">Contraseña</label><input id="lp" type="password" required minlength="6" autocomplete="'+(up?"new-password":"current-password")+'">':'<p class="meta">Por ahora tus datos se guardan solo en este dispositivo.</p>')+
      '<div id="msg" aria-live="polite"></div><button class="btn" type="submit">'+(up?"Crear cuenta":"Ingresar")+'</button></form>'+
      (rd?'<p>'+(up?'¿Ya tenés cuenta? <a href="#" id="sw">Ingresar</a>':'¿Primera vez? <a href="#" id="sw">Crear cuenta</a>')+'</p>':'');
    var sw=document.getElementById("sw");if(sw)sw.onclick=function(e){e.preventDefault();mode=up?"in":"up";draw();};
    document.getElementById("lf").onsubmit=function(e){
      e.preventDefault();var g=function(i){var x=document.getElementById(i);return x?x.value.trim():"";},btn=e.target.querySelector("button");btn.disabled=true;
      var p=(up||!rd)?TEM.signUp(g("lu"),g("le"),g("lp")):TEM.signIn(g("le"),g("lp"));
      p.then(function(d){
        if(up&&rd&&!(d&&d.session)){btn.disabled=false;msg("Te mandamos un correo para confirmar tu cuenta. Abrilo y después ingresá.");return;}
        TEM.nav();draw();
      }).catch(function(err){btn.disabled=false;msg(TEM.errText(err),true);});
    };
  });
}
draw();
})();
