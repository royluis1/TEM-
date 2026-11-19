(function(){
var box=document.getElementById("perfil");if(!box)return;var root=box.dataset.root;
function msg(id,t,bad){var m=document.getElementById(id);if(m){m.className="fb "+(bad?"no":"ok");m.textContent=t;}}
function cell(x){x=String(x);if("=+-@".indexOf(x.charAt(0))>=0)x="'"+x;return '"'+x.replace(/"/g,'""')+'"';}
function download(rows){
  var lines=[["Fecha","Nivel","Puntaje","Total","Detalle por pregunta"]].concat(rows.map(function(r){
    return [new Date(r.created_at).toLocaleString("es-AR"),TEM.LEVELS[r.nivel]||r.nivel,r.puntaje,r.total,(r.detalle||[]).map(function(d){return d.id+": "+(d.ok?"acierto":"error");}).join(" | ")];}));
  var csv="\ufeff"+lines.map(function(l){return l.map(cell).join(",");}).join("\r\n");
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="mis-resultados-tem.csv";
  document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
}
TEM.getUser().then(function(u){
  if(!u){box.innerHTML='<h1>Mi perfil</h1><div class="card"><p>Ingresá para ver tu perfil.</p><a class="btn" href="'+root+'ingresar.html">Ingresar</a></div>';return;}
  Promise.all([TEM.profile(u),TEM.groups(),TEM.mine()]).then(function(r){render(u,r[0]||{},r[1],r[2]);}).catch(function(e){box.innerHTML='<h1>Mi perfil</h1><div class="fb no">'+TEM.esc(TEM.errText(e))+'</div>';});
});
function render(u,p,gs,rows){
  var gopts='<option value="">Sin grupo</option>'+gs.map(function(g){return '<option value="'+g.id+'"'+(String(p.grupo_id)===String(g.id)?" selected":"")+'>'+TEM.esc(g.nombre)+'</option>';}).join("");
  box.innerHTML='<h1>👤 Mi perfil</h1><p class="lead">Estos datos solo los ves vos.</p>'+
  '<form class="card" id="pf"><h3>Mis datos</h3><label for="pn">Nombre y apellido</label><input id="pn" required maxlength="40" autocomplete="name" value="'+TEM.esc(p.full_name||u.name)+'"><label for="pe">Correo</label><input id="pe" readonly value="'+TEM.esc(u.email)+'"><label for="pg">Grupo</label><select id="pg">'+gopts+'</select><div id="m1" aria-live="polite"></div><button class="btn" type="submit">Guardar cambios</button></form>'+
  '<form class="card" id="pw"><h3>Cambiar contraseña</h3><label for="np">Nueva contraseña</label><input id="np" type="password" required minlength="8" autocomplete="new-password"><p class="meta">Mínimo 8 caracteres.</p><div id="m2" aria-live="polite"></div><button class="btn" type="submit">Cambiar contraseña</button></form>'+

'<div class="card"><h3>Mi progreso</h3>'+TEM.mineHtml(rows)+(rows.length?'<p><button class="btn alt" type="button" id="dl">Descargar mis resultados (CSV)</button></p>':'')+'</div>'+

  '<div class="card"><h3>Borrar mi cuenta</h3><p>Se elimina tu cuenta y todos tus resultados. No se puede deshacer.</p><button class="btn danger" type="button" id="del">Borrar mi cuenta</button></div>'+
  '<div class="actions"><button class="btn alt" type="button" id="out">Cerrar sesión</button></div><p class="meta"><a href="'+root+'privacidad.html">Política de privacidad</a></p>'+
  '<dialog id="dlg" aria-labelledby="dt"><h3 id="dt">¿Borrar tu cuenta?</h3><p>Se van a eliminar tu cuenta y todos tus resultados. No se puede deshacer.</p><div id="m3" aria-live="polite"></div><div class="actions" style="margin-bottom:0"><button class="btn alt" type="button" id="no" autofocus>Cancelar</button><button class="btn danger" type="button" id="yes">Sí, borrar mi cuenta</button></div></dialog>';
  var $=function(i){return document.getElementById(i);};
  $("pf").onsubmit=function(e){e.preventDefault();var b=e.target.querySelector("button");b.disabled=true;
    TEM.updateProfile(u,$("pn").value.trim(),$("pg").value).then(function(){msg("m1","Cambios guardados.");TEM.nav();}).catch(function(err){msg("m1",TEM.errText(err),true);}).then(function(){b.disabled=false;});};
  $("pw").onsubmit=function(e){e.preventDefault();var b=e.target.querySelector("button");b.disabled=true;
    TEM.updatePassword($("np").value).then(function(){$("np").value="";msg("m2","Contraseña cambiada.");}).catch(function(err){msg("m2",TEM.errText(err),true);}).then(function(){b.disabled=false;});};
  if($("dl"))$("dl").onclick=function(){download(rows);};
  $("out").onclick=function(){TEM.signOut().then(function(){location.href=root+"index.html";});};
  function doDelete(){var y=$("yes");y.disabled=true;TEM.deleteAccount().then(function(){location.href=root+"index.html";}).catch(function(err){y.disabled=false;msg("m3",TEM.errText(err),true);});}
  $("del").onclick=function(){var d=$("dlg");if(typeof d.showModal!=="function"){if(confirm("¿Borrar tu cuenta y todos tus resultados? No se puede deshacer."))doDelete();return;}d.showModal();};
  $("no").onclick=function(){$("dlg").close();};
  $("yes").onclick=doDelete;
}
})();
