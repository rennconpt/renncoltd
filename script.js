(function(){
  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

  // Gallery loader only on gallery page
  const onGallery = /\/gallery\.html$/.test(location.pathname) || location.pathname === '/gallery';
  const g=document.getElementById('gallery');
  if(onGallery && g){
    const files=Array.from({length:200},(_,i)=>`/gallery/${i+1}.jpg`);
    files.forEach(src=>{const img=new Image(); img.onload=()=>{const fig=document.createElement('figure'); fig.appendChild(img); g.appendChild(fig);}; img.src=src;});
  }

  // Reviews carousel
  const track=document.getElementById('reviews');
  if(track){
    fetch('/data/reviews.json').then(r=>r.json()).then(list=>{
      list.forEach(v=>{
        const d=document.createElement('div'); d.className='review';
        d.innerHTML=`<div class="stars" style="margin-bottom:6px">★★★★★</div><p>${v.text}</p><p><strong>— ${v.name}</strong></p>`;
        track.appendChild(d);
      });
      initCarousel();
    }).catch(()=>{});
  }

  function initCarousel(){
    const left=document.querySelector('.carousel .left');
    const right=document.querySelector('.carousel .right');
    let index=0;
    function perView(){ return window.innerWidth<=640?1: (window.innerWidth<=1024?2:4); }
    function cardW(){ const card=track.querySelector('.review'); return card?card.getBoundingClientRect().width+16:0; }
    function maxIndex(){ const pv=perView(); return Math.max(0, track.children.length - pv); }
    function scrollToIndex(i){
      if(i<0) i=maxIndex();
      if(i>maxIndex()) i=0;
      index=i;
      track.scrollTo({left:index*cardW(), behavior:'smooth'});
    }
    left.addEventListener('click', ()=>scrollToIndex(index-1));
    right.addEventListener('click', ()=>scrollToIndex(index+1));
    window.addEventListener('resize', ()=>scrollToIndex(index));
  }
})();

// r20 hero slider rotation
(function(){
  const slider = document.getElementById('hero-slider');
  if(!slider) return;
  const slides = Array.from(slider.querySelectorAll('img'));
  if(!slides.length) return;
  let i=0; slides[0].classList.add('active');
  setInterval(()=>{ slides[i].classList.remove('active'); i=(i+1)%slides.length; slides[i].classList.add('active'); }, 5000);
})();


// r24: animated counters
(function(){
  const counters = document.querySelectorAll('.counter .num');
  if(!counters.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target; const target = parseFloat(el.getAttribute('data-count'));
        const dur = 1200; const start = performance.now();
        const isFloat = String(target).includes('.');
        function tick(t){
          const p = Math.min(1,(t-start)/dur);
          const val = target * p;
          el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
          if(p<1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      }
    });
  }, {threshold:.4});
  counters.forEach(c=>io.observe(c));
})();

// r24: before/after slider
(function(){
  const ba = document.getElementById('ba'); if(!ba) return;
  const after = ba.querySelector('.after'), handle = ba.querySelector('.handle'), knob = ba.querySelector('.knob');
  let x = 50, dragging=false;
  function setX(px){
    const rect = ba.getBoundingClientRect();
    x = Math.max(0, Math.min(100, ((px-rect.left)/rect.width)*100));
    after.style.clipPath = `inset(0 0 0 ${x}%)`;
    handle.style.left = `${x}%`; knob.style.left = `${x}%`;
  }
  ['mousedown','touchstart'].forEach(ev=>ba.addEventListener(ev, e=>{dragging=true; setX((e.touches?e.touches[0].clientX:e.clientX));}));
  ['mousemove','touchmove'].forEach(ev=>window.addEventListener(ev, e=>{ if(dragging) setX((e.touches?e.touches[0].clientX:e.clientX)); }));
  ['mouseup','touchend','mouseleave'].forEach(ev=>window.addEventListener(ev, ()=>dragging=false));
})();

// r24: lightbox for all gallery images and 3D renders
(function(){
  const lb = document.getElementById('lb'); if(!lb) return;
  const img = lb.querySelector('img'), left = lb.querySelector('.left'), right = lb.querySelector('.right'), closeBtn = lb.querySelector('.close');
  let items = [], idx = 0;
  function open(i){ idx=i; img.src = items[idx].src; lb.classList.add('open'); }
  function close(){ lb.classList.remove('open'); }
  function next(){ idx=(idx+1)%items.length; img.src=items[idx].src; }
  function prev(){ idx=(idx-1+items.length)%items.length; img.src=items[idx].src; }
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if(t.tagName==='IMG' && (t.closest('.gallery') || t.closest('.card') && t.src.includes('/assets/3d/'))){
      items = Array.from(document.querySelectorAll('.gallery img, .card img[src*="/assets/3d/"]'));
      open(items.indexOf(t));
    }
    if(t===lb) close();
  });
  closeBtn.addEventListener('click', close);
  right.addEventListener('click', next);
  left.addEventListener('click', prev);
  document.addEventListener('keydown', (e)=>{ if(!lb.classList.contains('open')) return; if(e.key==='Escape') close(); if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); });
})();

// r24: reviews auto-rotate with pause on hover (keeping arrows functional)
(function(){
  const track=document.getElementById('reviews'); if(!track) return;
  let index=0, timer=null;
  function cardW(){ const card=track.querySelector('.review'); return card?card.getBoundingClientRect().width+16:0; }
  function perView(){ return window.innerWidth<=640?1:(window.innerWidth<=1024?2:4); }
  function maxIndex(){ return Math.max(0, track.children.length - perView()); }
  function scrollToIndex(i){
    if(i<0) i=maxIndex();
    if(i>maxIndex()) i=0;
    index=i;
    track.scrollTo({left:index*cardW(), behavior:'smooth'});
  }
  const leftBtn=document.querySelector('.carousel .left'), rightBtn=document.querySelector('.carousel .right');
  if(leftBtn&&rightBtn){
    leftBtn.addEventListener('click', ()=>scrollToIndex(index-1));
    rightBtn.addEventListener('click', ()=>scrollToIndex(index+1));
  }
  function start(){ timer=setInterval(()=>scrollToIndex(index+1), 5500); }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } }
  start();
  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
})();
