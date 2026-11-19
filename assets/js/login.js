(function(){
var box=document.getElementById("login");if(!box)return;
var root=box.dataset.root,mode="in",pending="",recovery=TEM.recovery;
TEM.onRecovery(function(){recovery=true;draw();});
function msg(t,bad){var m=document.getElementById("msg");if(m){m.className="fb "+(bad?"no":"ok");m.textContent=t;}}
function lock(e){e.preventDefault();var b=e.target.querySelector("button[type=submit]");b.disabled=true;return b;}
function val(i){var x=document.getElementById(i);return x?x.value.trim():"";}
function draw(){
  TEM.getUser().then(function(u){
    if(recovery&&u){
      box.innerHTML='<h1>Nueva contraseña</h1><form class="card" id="nf"><label for="np">Nueva contraseña</label><input id="np" type="password" required minlength="8" autocomplete="new-password"><p class="meta">Mínimo 8 caracteres.</p><div id="msg" aria-live="polite"></div><button class="btn" type="submit">Guardar contraseña</button></form>';
      document.getElementById("nf").onsubmit=function(e){var b=lock(e);TEM.updatePassword(document.getElementById("np").value).then(function(){recovery=false;history.replaceState(null,"",location.pathname);location.replace(root+"perfil.html");}).catch(function(err){b.disabled=false;msg(TEM.errText(err),true);});};
      return;
    }
    if(u){location.replace(root+"perfil.html");return;}
    if(pending){
      box.innerHTML='<h1>✉️ Revisá tu correo</h1><div class="card"><p>Te mandamos un enlace a <b>'+TEM.esc(pending)+'</b>. Abrilo para confirmar tu cuenta y después ingresá.</p><p class="meta">Si no lo ves, mirá en Spam.</p><div id="msg" aria-live="polite"></div><div class="actions" style="margin:0"><button class="btn" type="button" id="rs">Reenviar correo</button><button class="btn alt" type="button" id="back">Ya confirmé, ingresar</button></div></div>';
      document.getElementById("rs").onclick=function(){TEM.resend(pending).then(function(){msg("Listo, te lo enviamos de nuevo.");}).catch(function(e){msg(TEM.errText(e),true);});};
      document.getElementById("back").onclick=function(){pending="";mode="in";draw();};
      return;
    }
    if(mode==="forgot"){
      box.innerHTML='<h1>Recuperar contraseña</h1><form class="card" id="ff"><p>Escribí tu correo y te mandamos un enlace para elegir una contraseña nueva.</p><label for="fe">Correo electrónico</label><input id="fe" type="email" inputmode="email" required maxlength="80" autocomplete="email"><div id="msg" aria-live="polite"></div><button class="btn" type="submit">Enviar enlace</button></form><p><a href="#" id="bk">← Volver a ingresar</a></p>';
      document.getElementById("bk").onclick=function(e){e.preventDefault();mode="in";draw();};
      document.getElementById("ff").onsubmit=function(e){var b=lock(e);TEM.resetPassword(val("fe")).then(function(){b.disabled=false;msg("Si ese correo tiene cuenta, te mandamos un enlace. Revisá también spam.");}).catch(function(err){b.disabled=false;msg(TEM.errText(err),true);});};
      return;
    }
    var up=mode==="up";
    (up?TEM.groups():Promise.resolve([])).then(function(gs){
      var sel=gs.length?'<label for="lg">Grupo</label><select id="lg"><option value="">Todavía no sé</option>'+gs.map(function(g){return '<option value="'+g.id+'">'+TEM.esc(g.nombre)+'</option>';}).join("")+'</select>':'';
      box.innerHTML='<h1>'+(up?"Crear cuenta":"Ingresar")+'</h1><form class="card" id="lf">'+
        (up?'<label for="lu">Nombre y apellido</label><input id="lu" required maxlength="40" autocomplete="name">'+sel:'')+
        '<label for="le">Correo electrónico</label><input id="le" type="email" inputmode="email" required maxlength="80" autocomplete="email">'+
        '<label for="lp">Contraseña</label><input id="lp" type="password" required minlength="8" autocomplete="'+(up?"new-password":"current-password")+'">'+
        (up?'<p class="meta">Mínimo 8 caracteres. Te vamos a mandar un correo para confirmar tu cuenta.</p><label class="check"><input type="checkbox" id="lc" required><span>Leí y acepto la <a href="'+root+'privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</span></label>':'')+
        '<div id="msg" aria-live="polite"></div><button class="btn" type="submit">'+(up?"Crear cuenta":"Ingresar")+'</button></form>'+
        '<p>'+(up?'¿Ya tenés cuenta? <a href="#" id="sw">Ingresar</a>':'¿Primera vez? <a href="#" id="sw">Crear cuenta</a> · <a href="#" id="fg">Olvidé mi contraseña</a>')+'</p>'+
        '<p class="meta"><a href="'+root+'privacidad.html">Política de privacidad</a></p>';
      document.getElementById("sw").onclick=function(e){e.preventDefault();mode=up?"in":"up";draw();};
      var fg=document.getElementById("fg");if(fg)fg.onclick=function(e){e.preventDefault();mode="forgot";draw();};
      document.getElementById("lf").onsubmit=function(e){
        var b=lock(e),email=val("le"),pw=document.getElementById("lp").value;
        var p=up?TEM.signUp(val("lu"),email,pw,val("lg")):TEM.signIn(email,pw);
        p.then(function(d){
          if(up&&!(d&&d.session)){pending=email;draw();return;}
          TEM.nav();location.replace(root+"perfil.html");
        }).catch(function(err){b.disabled=false;msg(TEM.errText(err),true);});
      };
    });
  });
}
draw();
})();
