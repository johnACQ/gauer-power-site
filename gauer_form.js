(function(){
  var f=document.getElementById('quoteForm');if(!f)return;
  var btn=f.querySelector('button');if(btn){btn.setAttribute('data-label',btn.textContent);}
  f.addEventListener('submit',function(e){
    e.preventDefault();
    btn.disabled=true;btn.textContent='Sending...';
    var data={};new FormData(f).forEach(function(v,k){data[k]=v});
    data._subject=f.getAttribute('data-subject')||'New Gauer Power quote request';
    data.Page=location.pathname;
    fetch('https://formsubmit.co/ajax/john@apexacq.co',{
      method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(data)
    }).then(function(r){if(!r.ok){throw new Error('send failed')}return r.json()}).then(function(){
      var card=f.closest('.form-card');
      card.innerHTML='<h3 style="color:var(--gold)">Got it. We\'ll be in touch.</h3><p class="s" style="margin-bottom:0">Thanks for reaching out to Gauer Power. We\'ll call you back shortly. Need it sorted now? Tap to call <a href="tel:+12509089208" style="color:var(--gold);font-weight:800">(250) 908-9208</a>.</p>';
    }).catch(function(){
      btn.disabled=false;btn.textContent=btn.getAttribute('data-label')||'Get My Free Quote';
      alert('Something went wrong. Please call us at (250) 908-9208.');
    });
  });
})();
