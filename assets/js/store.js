(function(){
var S=window.TEM={},C=window.TEM_CFG||{};
S.LEVELS={"nivel-1":"Nivel 1","nivel-2":"Nivel 2","nivel-3":"Nivel 3"};
S.esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
S.abbr=function(n){var p=String(n).trim().split(/\s+/);return p.length>1?p[0]+" "+p[p.length-1].charAt(0).toUpperCase()+".":p[0];};
S.get=function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}};
S.set=function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
S.ready=!!(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY&&window.supabase);
var sb=S.ready?window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY):null;
S.errText=function(e){var m=String(e&&e.message||e);
  if(/Invalid login/i.test(m))return "Correo o contraseña incorrectos.";
  if(/already registered/i.test(m))return "Ese correo ya tiene una cuenta. Probá ingresar.";
  if(/Password should/i.test(m))return "La contraseña tiene que tener al menos 6 caracteres.";
  if(/Email not confirmed/i.test(m))return "Falta confirmar tu correo. Revisá tu bandeja de entrada.";
  return "No se pudo completar. Probá de nuevo.";};
/* sesión */
S.getUser=function(){
  if(!sb)return Promise.resolve(S.get("tem_user",null));
  return sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;if(!s)return null;var m=s.user.user_metadata||{};return {id:s.user.id,email:s.user.email,name:m.full_name||s.user.email};});
};
S.signUp=function(name,email,pass){
  if(!sb){S.set("tem_user",{name:name,email:email});return Promise.resolve({});}
  return sb.auth.signUp({email:email,password:pass,options:{data:{full_name:name,display_name:S.abbr(name)}}}).then(function(r){if(r.error)throw r.error;return r.data;});
};
S.signIn=function(email,pass){return sb.auth.signInWithPassword({email:email,password:pass}).then(function(r){if(r.error)throw r.error;return r.data;});};
S.signOut=function(){if(!sb){try{localStorage.removeItem("tem_user");}catch(e){}return Promise.resolve();}return sb.auth.signOut();};
/* resultados */
S.save=function(k,s,t,name){
  var a=S.get("tem_res",[]);a.push({name:name||"",k:k,s:s,t:t,ts:Date.now()});S.set("tem_res",a.slice(-300));
  if(!sb)return Promise.resolve("local");
  return sb.from("resultados").insert({nivel:k,puntaje:s,total:t}).then(function(r){return r.error?"local":"shared";});
};
function localRows(){var m={};S.get("tem_res",[]).forEach(function(r){var key=r.name.toLowerCase()+"|"+r.k;if(!m[key]||r.s>=m[key].s)m[key]=r;});return Object.keys(m).map(function(k){var r=m[k];return {name:S.abbr(r.name||"Participante"),k:r.k,s:r.s,t:r.t,ts:r.ts};});}
S.rows=function(){
  if(!sb)return Promise.resolve({rows:localRows(),shared:false});
  return sb.from("tabla_concursantes").select("nombre,nivel,puntaje,total,created_at").then(function(r){
    if(r.error)return {rows:localRows(),shared:false,failed:true};
    return {shared:true,rows:r.data.map(function(x){return {name:x.nombre,k:x.nivel,s:x.puntaje,t:x.total,ts:new Date(x.created_at).getTime()};})};
  });
};
S.mine=function(u){
  if(!sb)return Promise.resolve(localRows().filter(function(r){return r.name===S.abbr(u.name);}));
  return sb.from("resultados").select("nivel,puntaje,total,created_at").order("created_at",{ascending:false}).then(function(r){
    return (r.data||[]).map(function(x){return {name:u.name,k:x.nivel,s:x.puntaje,t:x.total,ts:new Date(x.created_at).getTime()};});});
};
S.tableHtml=function(rows){
  rows=rows.slice().sort(function(a,b){return (b.s/b.t)-(a.s/a.t)||b.s-a.s||a.ts-b.ts;});
  return '<div class="scroll"><table><caption class="sr-only">Resultados</caption><thead><tr><th>#</th><th>Nombre</th><th>Nivel</th><th>Puntaje</th></tr></thead><tbody>'+
  rows.map(function(r,i){return '<tr><td>'+(i+1)+'</td><td>'+S.esc(r.name)+'</td><td>'+(S.LEVELS[r.k]||"")+'</td><td class="score">'+r.s+'/'+r.t+'</td></tr>';}).join("")+'</tbody></table></div>';
};
})();
