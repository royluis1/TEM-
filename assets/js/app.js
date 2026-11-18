(function(){
var tableHtml=TEM.tableHtml;
/* pestañas */
(function(){
  var root=document.querySelector("[data-tabs]");if(!root)return;
  var tabs=[].slice.call(root.querySelectorAll('[role="tab"]')),panels=tabs.map(function(t){return document.getElementById(t.getAttribute("aria-controls"));});
  function show(i,focus){tabs.forEach(function(t,j){t.setAttribute("aria-selected",i===j?"true":"false");t.tabIndex=i===j?0:-1;panels[j].hidden=i!==j;});if(focus)tabs[i].focus();}
  tabs.forEach(function(t,i){
    t.addEventListener("click",function(){show(i);history.replaceState(null,"","#"+t.dataset.tab);});
    t.addEventListener("keydown",function(e){var n=tabs.length;if(e.key==="ArrowRight")show((i+1)%n,true);else if(e.key==="ArrowLeft")show((i+n-1)%n,true);});
  });
  function fromHash(){var idx=tabs.map(function(t){return t.dataset.tab;}).indexOf(location.hash.slice(1));show(idx<0?0:idx);}
  fromHash();
  root.addEventListener("click",function(e){var g=e.target.closest("[data-goto]");if(!g)return;var idx=tabs.map(function(t){return t.dataset.tab;}).indexOf(g.dataset.goto);if(idx>-1){show(idx);history.replaceState(null,"","#"+g.dataset.goto);root.scrollIntoView();}});
})();
/* evaluación */
(function(){
  var box=document.getElementById("quiz");if(!box)return;
  var Q=JSON.parse(document.getElementById("quiz-data").textContent),k=box.dataset.level,root=box.dataset.root,i=0,score=0,done=false;
  function shuffle(n){var a=[];for(var j=0;j<n;j++)a.push(j);return a.sort(function(){return Math.random()-.5;});}
  function render(){
    done=false;var q=Q[i];
    var opts=q[3]?shuffle(q[3].length).map(function(o){return [o,q[3][o]];}):[[1,"Es estafa"],[0,"Parece seguro"]];
    box.innerHTML='<div class="bar" aria-hidden="true"><span id="bar"></span></div><p class="meta">Pregunta '+(i+1)+' de '+Q.length+'</p><p class="q">'+TEM.esc(q[0])+'</p><div class="opts">'+
      opts.map(function(o,p){return '<button type="button" class="opt" data-a="'+o[0]+'">'+(q[3]?"ABC".charAt(p)+") ":"")+TEM.esc(o[1])+'</button>';}).join("")+
      '</div><div id="fb" aria-live="polite"></div><p><button type="button" class="btn" id="nx" hidden></button></p>';
    document.getElementById("bar").style.transform="scaleX("+(i/Q.length)+")";
  }
  function finish(){
    var head='<p class="meta">Tu resultado</p><p class="score-big">'+score+'<span>/'+Q.length+'</span></p>';
    TEM.getUser().then(function(u){
      var card;
      if(!TEM.ready)card='<div class="card" id="sv"><h3>Guardá tu resultado</h3><label for="nm">Tu nombre y apellido</label><input id="nm" type="text" maxlength="40" autocomplete="name" value="'+TEM.esc(u?u.name:"")+'"><p class="meta">Por ahora se guarda solo en este dispositivo.</p><button type="button" class="btn" id="savebtn">Guardar mi resultado</button></div>';
      else if(u)card='<div class="card" id="sv"><h3>Guardá tu resultado, '+TEM.esc(TEM.abbr(u.name))+'</h3><p class="meta">Va a aparecer en la tabla de concursantes con tu nombre y la inicial de tu apellido.</p><button type="button" class="btn" id="savebtn">Guardar mi resultado</button></div>';
      else card='<div class="card"><h3>Ingresá para guardar tu resultado</h3><p class="meta">Con tu cuenta, tu puntaje queda en la tabla de concursantes.</p><a class="btn" href="'+root+'ingresar.html">Ingresar o crear cuenta</a></div>';
      box.innerHTML=head+card+'<p><button type="button" class="btn alt" id="again">Volver a intentarlo</button></p>';
    });
  }
  box.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b)return;
    if(b.classList.contains("opt")&&!done){
      done=true;var q=Q[i],ok=Number(b.dataset.a)===q[1];if(ok)score++;
      [].forEach.call(box.querySelectorAll(".opt"),function(o){o.disabled=true;if(Number(o.dataset.a)===q[1])o.classList.add("correct");});
      if(!ok)b.classList.add("wrong");
      document.getElementById("fb").innerHTML='<div class="fb '+(ok?"ok":"no")+'"><b>'+(ok?"¡Muy bien! ":"Cuidado. ")+'</b>'+TEM.esc(q[2])+'</div>';
      document.getElementById("bar").style.transform="scaleX("+((i+1)/Q.length)+")";
      var nx=document.getElementById("nx");nx.hidden=false;nx.textContent=i<Q.length-1?"Siguiente":"Ver mi resultado";nx.focus();
    }else if(b.id==="nx"){if(i<Q.length-1){i++;render();}else finish();}
    else if(b.id==="again"){i=0;score=0;render();}
    else if(b.id==="savebtn"){
      var nm=document.getElementById("nm"),name=nm?nm.value.trim():"";
      if(nm&&!name){nm.focus();return;}
      b.disabled=true;var sc=score;
      TEM.save(k,sc,Q.length,name).then(function(w){
        document.getElementById("sv").innerHTML='<h3>¡Listo!</h3><p>Tu resultado '+sc+'/'+Q.length+(w==="shared"?' quedó guardado en la tabla general.':' quedó guardado en este dispositivo.')+'</p><a class="btn" href="'+root+'tabla.html">🏆 Ver tabla de concursantes</a>';
      });
    }
  });
  render();
})();
/* tabla de concursantes */
(function(){
  var box=document.getElementById("tabla");if(!box)return;var data=null,f="all";
  function draw(){
    var rows=data.rows.filter(function(r){return f==="all"||r.k===f;});
    box.innerHTML='<div class="chips" role="group" aria-label="Filtrar por nivel">'+[["all","Todos"],["nivel-1","Nivel 1"],["nivel-2","Nivel 2"],["nivel-3","Nivel 3"]].map(function(c){return '<button type="button" class="chip" data-f="'+c[0]+'" aria-pressed="'+(f===c[0])+'">'+c[1]+'</button>';}).join("")+'</div>'+
      '<p class="meta">'+(data.shared?"Resultados de todas las personas que rindieron.":(data.failed?"No se pudo cargar la tabla general. Se muestran los resultados de este dispositivo.":"Resultados guardados en este dispositivo."))+'</p>'+
      (rows.length?tableHtml(rows):'<div class="card">Todavía no hay resultados. ¡Sé la primera persona en rendir la evaluación!</div>');
  }
  box.addEventListener("click",function(e){var b=e.target.closest("[data-f]");if(b){f=b.dataset.f;draw();}});
  box.innerHTML='<p class="meta">Cargando…</p>';
  TEM.rows().then(function(d){data=d;draw();});
})();
})();
