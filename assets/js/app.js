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
  var raw=JSON.parse(document.getElementById("quiz-data").textContent),k=box.dataset.level,root=box.dataset.root,i=0,score=0,done=false,detail=[];
  var ids=raw.map(function(q,n){return Array.isArray(q)?k+":"+(n+1):String(q.id);});
  var Q=raw.map(function(q){return Array.isArray(q)?q:[q.t,q.c,q.e,q.o];});
  function shuffle(n){var a=[];for(var j=0;j<n;j++)a.push(j);return a.sort(function(){return Math.random()-.5;});}
  function render(){
    done=false;var q=Q[i];
    var opts=q[3]?shuffle(q[3].length).map(function(o){return [o,q[3][o]];}):[[1,"Es estafa"],[0,"No es estafa"]];
    /* ====== AUDIO: si la pregunta trae un 5º dato (q[4]) es el nombre del archivo ======
       dentro de la carpeta /assets/audios. Se arma el botón "Reproducir audio" + el <audio>. */
    var audioHtml=q[4]?'<div class="audioq"><button type="button" class="btn alt audio-play">▶ Reproducir audio</button><audio class="audio-el" preload="none" src="'+root+'assets/audios/'+encodeURIComponent(q[4])+'"></audio></div>':'';
    /* ================================================================================ */
    box.innerHTML='<div class="bar" aria-hidden="true"><span id="bar"></span></div><p class="meta">Pregunta '+(i+1)+' de '+Q.length+'</p><p class="q">'+TEM.esc(q[0])+'</p>'+audioHtml+'<div class="opts">'+
      opts.map(function(o,p){return '<button type="button" class="opt" data-a="'+o[0]+'">'+(q[3]?"ABC".charAt(p)+") ":"")+TEM.esc(o[1])+'</button>';}).join("")+
      '</div><div id="fb" aria-live="polite"></div><p><button type="button" class="btn" id="nx" hidden></button></p>';
    document.getElementById("bar").style.transform="scaleX("+(i/Q.length)+")";
  }
  function finish(){
    var head='<p class="meta">Tu resultado</p><p class="score-big">'+score+'<span>/'+Q.length+'</span></p>';
    TEM.getUser().then(function(u){
      var card=u?'<div class="card" id="sv"><h3>Guardá tu resultado, '+TEM.esc(TEM.abbr(u.name))+'</h3><p class="meta">Queda guardado en tu cuenta y lo ves en “Mi perfil”.</p><button type="button" class="btn" id="savebtn">Guardar mi resultado</button></div>'
        :'<div class="card"><h3>Ingresá para guardar tu resultado</h3><p class="meta">Con tu cuenta tu puntaje queda guardado.</p><a class="btn" href="'+root+'ingresar.html">Ingresar o crear cuenta</a></div>';
      box.innerHTML=head+card+'<p><button type="button" class="btn alt" id="again">Volver a intentarlo</button></p>';
    });
  }
  box.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b)return;
    /* ====== AUDIO: reproducir / pausar el audio de la pregunta actual ====== */
    if(b.classList.contains("audio-play")){
      var au=b.parentElement.querySelector("audio");
      if(au.paused){au.currentTime=0;au.play();b.textContent="⏸ Pausar audio";}
      else{au.pause();b.textContent="▶ Reproducir audio";}
      au.onended=function(){b.textContent="▶ Reproducir audio";};
      return;
    }
    /* ========================================================================= */
    if(b.classList.contains("opt")&&!done){
      done=true;var q=Q[i],ok=Number(b.dataset.a)===q[1];if(ok)score++;detail.push({id:ids[i],ok:ok});
      [].forEach.call(box.querySelectorAll(".opt"),function(o){o.disabled=true;if(Number(o.dataset.a)===q[1])o.classList.add("correct");});
      if(!ok)b.classList.add("wrong");
      document.getElementById("fb").innerHTML='<div class="fb '+(ok?"ok":"no")+'"><b>'+(ok?"¡Muy bien! ":"Cuidado. ")+'</b>'+TEM.esc(q[2])+'</div>';
      document.getElementById("bar").style.transform="scaleX("+((i+1)/Q.length)+")";
      var nx=document.getElementById("nx");nx.hidden=false;nx.textContent=i<Q.length-1?"Siguiente":"Ver mi resultado";nx.focus();
    }else if(b.id==="nx"){if(i<Q.length-1){i++;render();}else finish();}
    else if(b.id==="again"){i=0;score=0;detail=[];render();}
    else if(b.id==="savebtn"){
      b.disabled=true;var sc=score;
      TEM.save(k,sc,Q.length,detail).then(function(w){
        document.getElementById("sv").innerHTML=w==="ok"?'<h3>¡Listo!</h3><p>Tu resultado '+sc+'/'+Q.length+' quedó guardado en tu cuenta.</p><a class="btn" href="'+root+'perfil.html">Ver mis resultados</a>':'<h3>No se pudo guardar</h3><p>Probá de nuevo en un momento.</p><button type="button" class="btn" id="savebtn">Reintentar</button>';
      });
    }
  });
  render();
})();
})();
