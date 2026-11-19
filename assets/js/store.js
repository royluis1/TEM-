(function(){
var S=window.TEM={},C=window.TEM_CFG||{};
S.LEVELS={"nivel-1":"Nivel 1","nivel-2":"Nivel 2","nivel-3":"Nivel 3"};
S.esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
S.abbr=function(n){var p=String(n).trim().split(/\s+/);return p.length>1?p[0]+" "+p[p.length-1].charAt(0).toUpperCase()+".":p[0];};
S.recovery=/[#&]type=recovery/.test(location.hash);
S.ready=!!(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY&&window.supabase);
var sb=S.ready?window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY):null;
function nob(){return Promise.reject(new Error("NO_BACKEND"));}
function back(){return location.origin+"/ingresar.html";}
function ck(r){if(r&&r.error)throw r.error;return r;}
S.errText=function(e){var m=String(e&&e.message||e);
  if(/NO_BACKEND/.test(m))return "El ingreso todavía no está conectado al servidor.";
  if(/Invalid login/i.test(m))return "Correo o contraseña incorrectos.";
  if(/already registered/i.test(m))return "Ese correo ya tiene una cuenta. Probá ingresar.";
  if(/Password should/i.test(m))return "La contraseña es muy corta.";
  if(/not confirmed/i.test(m))return "Falta confirmar tu correo. Revisá tu bandeja de entrada.";
  if(/only request this after/i.test(m))return "Esperá un minuto antes de pedir otro enlace.";
  if(/rate limit|too many/i.test(m))return "Esperá unos minutos antes de volver a intentar.";
  return "No se pudo completar. Probá de nuevo.";};
/* sesión */
S.getUser=function(){
  if(!sb)return Promise.resolve(null);
  return sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;if(!s)return null;var m=s.user.user_metadata||{};return {id:s.user.id,email:s.user.email,name:m.full_name||s.user.email};});
};
S.signUp=function(name,email,pass,grupoId){
  if(!sb)return nob();
  return sb.auth.signUp({email:email,password:pass,options:{data:{full_name:name,grupo_id:grupoId||""},emailRedirectTo:back()}}).then(function(r){ck(r);return r.data;});
};
S.signIn=function(email,pass){if(!sb)return nob();return sb.auth.signInWithPassword({email:email,password:pass}).then(function(r){ck(r);return r.data;});};
S.resend=function(email){if(!sb)return nob();return sb.auth.resend({type:"signup",email:email,options:{emailRedirectTo:back()}}).then(ck);};
S.signOut=function(){return sb?sb.auth.signOut():Promise.resolve();};
S.resetPassword=function(email){if(!sb)return nob();return sb.auth.resetPasswordForEmail(email,{redirectTo:back()}).then(ck);};
S.updatePassword=function(pass){if(!sb)return nob();return sb.auth.updateUser({password:pass}).then(ck);};
S.onRecovery=function(cb){if(sb)sb.auth.onAuthStateChange(function(ev){if(ev==="PASSWORD_RECOVERY")cb();});};
/* resultados */
S.save=function(k,s,t,detalle){
  if(!sb)return Promise.resolve("error");
  return sb.from("resultados").insert({nivel:k,puntaje:s,total:t,detalle:detalle||[]}).then(function(r){return r.error?"error":"ok";});
};
S.mine=function(){
  if(!sb)return Promise.resolve([]);
  return sb.from("resultados").select("nivel,puntaje,total,detalle,created_at").order("created_at",{ascending:false}).then(function(r){return r.data||[];});
};
S.mineHtml=function(rows){
  return '<div class="scroll"><table><caption class="sr-only">Mis resultados</caption><thead><tr><th>Nivel</th><th>Puntaje</th><th>Fecha</th></tr></thead><tbody>'+
  rows.map(function(r){return '<tr><td>'+(S.LEVELS[r.nivel]||"")+'</td><td class="score">'+r.puntaje+'/'+r.total+'</td><td>'+new Date(r.created_at).toLocaleDateString("es-AR")+'</td></tr>';}).join("")+'</tbody></table></div>';
};
/* grupos y perfil */
S.groups=function(){if(!sb)return Promise.resolve([]);return sb.from("grupos").select("id,nombre").order("nombre").then(function(r){return r.data||[];});};
S.profile=function(u){if(!sb)return Promise.resolve(null);return sb.from("profiles").select("full_name,grupo_id").eq("id",u.id).maybeSingle().then(function(r){return r.data;});};
S.updateProfile=function(u,name,grupoId){
  if(!sb)return nob();
  return sb.from("profiles").update({full_name:name,grupo_id:grupoId?Number(grupoId):null}).eq("id",u.id).then(ck).then(function(){return sb.auth.updateUser({data:{full_name:name}});}).then(ck);
};
S.deleteAccount=function(){if(!sb)return nob();return sb.rpc("borrar_mi_cuenta").then(ck).then(function(){return sb.auth.signOut({scope:"local"});});};
})();
