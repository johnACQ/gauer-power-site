(function(){
  var RAIL='https://profound-truth-production-4190.up.railway.app';
  // pageview beacon (counts only, no PII)
  try{
    navigator.sendBeacon(RAIL+'/webhook/gauer-pv',
      JSON.stringify({page:location.pathname,ref:document.referrer||''}));
  }catch(e){}

  // --- click-id + utm capture -------------------------------------------
  // Grabs ad click ids on first landing and keeps them for the whole session,
  // so a lead that lands on /panel and converts on /contact still carries its
  // gclid. Without this there is no way to tie a booked job back to a keyword.
  var TRACK=['gclid','gbraid','wbraid','fbclid','msclkid',
             'utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  function attribution(){
    var out={},qs=null;
    try{qs=new URLSearchParams(location.search)}catch(e){}
    TRACK.forEach(function(k){
      var v=qs?qs.get(k):null;
      try{
        if(v){sessionStorage.setItem('gp_'+k,v)}
        else{v=sessionStorage.getItem('gp_'+k)}
      }catch(e){}
      if(v){out[k]=v}
    });
    try{
      if(!sessionStorage.getItem('gp_landing')){
        sessionStorage.setItem('gp_landing',location.pathname);
        sessionStorage.setItem('gp_referrer',document.referrer||'');
      }
      out.landing_page=sessionStorage.getItem('gp_landing')||location.pathname;
      out.referrer=sessionStorage.getItem('gp_referrer')||document.referrer||'';
    }catch(e){
      out.landing_page=location.pathname;
      out.referrer=document.referrer||'';
    }
    return out;
  }
  attribution(); // run on load so the click id is stored even if they never convert

  // --- form wiring ------------------------------------------------------
  // Pages now carry two quote forms (hero + footer), so bind every one.
  var seen=[],forms=document.querySelectorAll('form.quote-form, #quoteForm');
  Array.prototype.forEach.call(forms,function(f){
    if(seen.indexOf(f)>-1)return; seen.push(f);
    var btn=f.querySelector('button');
    if(btn){btn.setAttribute('data-label',btn.textContent);}
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(btn){btn.disabled=true;btn.textContent='Sending...';}
      var data={};new FormData(f).forEach(function(v,k){data[k]=v});
      data._subject=f.getAttribute('data-subject')||'New Gauer Power quote request';
      data.Page=location.pathname;
      var attr=attribution();
      Object.keys(attr).forEach(function(k){data[k]=attr[k]});
      // fast lane: instant Slack + SMS alert (fire-and-forget; email below is the backup)
      try{
        fetch(RAIL+'/webhook/gauer-lead',{
          method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
          body:JSON.stringify({token:'gauer-bridge-lead-2026',name:data.Name,phone:data.Phone,
            town:data.Town,job:data.Job,page:location.pathname,attribution:attr})
        }).catch(function(){});
      }catch(e){}
      fetch('https://formsubmit.co/ajax/john@apexacq.co',{
        method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(data)
      }).then(function(r){if(!r.ok){throw new Error('send failed')}return r.json()}).then(function(){
        var card=f.closest('.form-card');
        card.innerHTML='<h3 style="color:var(--gold)">Got it. We\'ll be in touch.</h3><p class="s" style="margin-bottom:0">Thanks for reaching out to Gauer Power. We\'ll call you back shortly. Need it sorted now? Tap to call <a href="tel:+12509089208" style="color:var(--gold);font-weight:800">(250) 908-9208</a>.</p>';
      }).catch(function(){
        if(btn){btn.disabled=false;btn.textContent=btn.getAttribute('data-label')||'Get My Free Quote';}
        alert('Something went wrong. Please call us at (250) 908-9208.');
      });
    });
  });
})();
