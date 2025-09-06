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


// r23-clean8: mixed image/video hero slider rotation
(function(){
  const slider = document.getElementById('hero-slider');
  if(!slider) return;
  const slides = Array.from(slider.querySelectorAll('.slide'));
  if(!slides.length) return;

  let i = slides.findIndex(s=>s.classList.contains('active'));
  if(i<0){ i=0; slides[0].classList.add('active'); }

  function next(){
    slides[i].classList.remove('active');
    i = (i+1) % slides.length;
    slides[i].classList.add('active');
    // restart video if it's a video slide
    if(slides[i].tagName === 'VIDEO'){
      try { slides[i].currentTime = 0; slides[i].play(); } catch(e){}
    }
  }
  setInterval(next, 5000);
})();


// r23-clean9: simple slider rotation (anim -> img1 -> img2 -> img3 -> anim)
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;
  const slides = Array.from(wrap.querySelectorAll('.slide'));
  if(!slides.length) return;
  let i = slides.findIndex(s=>s.classList.contains('active'));
  if(i<0){ i=0; slides[0].classList.add('active'); }

  function setActive(n){
    slides[i].classList.remove('active');
    // Pause any playing video in old slide
    const oldVid = slides[i].querySelector('video'); if(oldVid){ try{ oldVid.pause(); }catch(e){} }
    i = n % slides.length;
    slides[i].classList.add('active');
    // Play video if new slide has one
    const newVid = slides[i].querySelector('video'); if(newVid){ try{ newVid.currentTime=0; newVid.play(); }catch(e){} }
  }

  setInterval(()=> setActive((i+1)%slides.length), 5000);
})();


// r23-clean10: play logo animation once, then loop photos only
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;
  const slides = Array.from(wrap.querySelectorAll('.slide'));
  if(slides.length < 2) return;

  let i = 0; // start at animation slide (index 0)
  let animPlayed = false;

  function show(n){
    slides[i].classList.remove('active');
    const oldVid = slides[i].querySelector('video'); if(oldVid){ try{ oldVid.pause(); }catch(e){} }
    i = n;
    slides[i].classList.add('active');
    const newVid = slides[i].querySelector('video'); if(newVid){ try{ newVid.currentTime=0; newVid.play(); }catch(e){} }
  }

  // When animation finishes (or after a timeout), go to first photo
  const anim = slides[0].querySelector('video');
  if(anim){
    anim.addEventListener('ended', ()=>{ animPlayed = true; show(1); });
    // fallback in case 'ended' won't fire due to loop attr; remove loop to allow ended
    anim.removeAttribute('loop');
  }
  // safety: advance after 4.5s if no 'ended' fires
  setTimeout(()=>{ if(!animPlayed){ animPlayed=true; show(1); } }, 4500);

  // After start, loop photos (1..slides.length-1)
  setInterval(()=>{
    if(!animPlayed) return; // wait until after the intro
    const isLastPhoto = (i >= 1) && (i === slides.length - 1);
    show(isLastPhoto ? 1 : i + 1);
  }, 5000);
})();


// r23-clean11: rock-solid 'intro once' + photo loop; fix autoplay policies
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;
  const slides = Array.from(wrap.querySelectorAll('.slide')); if(slides.length < 2) return;

  // Identify intro video explicitly
  const introSlide = slides[0];
  const introVid = document.getElementById('intro-anim') || introSlide.querySelector('video');
  if(introVid){ introVid.removeAttribute('loop'); }

  let i = 0;
  let introFinished = false;

  function show(n){
    slides[i].classList.remove('active');
    const oldVid = slides[i].querySelector('video'); if(oldVid){ try{ oldVid.pause(); }catch(e){} }
    i = n % slides.length;
    slides[i].classList.add('active');
    const newVid = slides[i].querySelector('video');
    if(newVid){
      try{
        newVid.currentTime = 0;
        const playPromise = newVid.play();
        if(playPromise && playPromise.catch){ playPromise.catch(()=>{}); }
      }catch(e){}
    }
  }

  // Advance after intro video finishes or after a max timeout
  if(introVid){
    introVid.addEventListener('ended', ()=>{ introFinished = true; show(1); });
    // safety timeout in case 'ended' doesn't fire
    setTimeout(()=>{ if(!introFinished){ introFinished = true; show(1); } }, 6000);
  }else{
    introFinished = true; show(1);
  }

  // Photo loop only (1..end)
  setInterval(()=>{
    if(!introFinished) return;
    const atEnd = (i >= 1) && (i === slides.length - 1);
    show(atEnd ? 1 : i + 1);
  }, 5000);
})();


// r23-clean12: ensure hero images never crop on any device
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;
  const imgs = Array.from(wrap.querySelectorAll('.slide img'));
  function fit(){
    const rect = wrap.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    imgs.forEach(img => {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if(!iw || !ih) return;
      const ir = iw/ih, sr = W/H;
      if(ir > sr){
        // limited by width
        img.style.width = '100%';
        img.style.height = 'auto';
      }else{
        // limited by height
        img.style.height = '100%';
        img.style.width = 'auto';
      }
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center center';
    });
  }
  // run after images load
  imgs.forEach(img => {
    if(img.complete) return;
    img.addEventListener('load', fit);
  });
  window.addEventListener('resize', fit);
  setTimeout(fit, 50);
  setTimeout(fit, 500);
})();


// r23-clean14: simple show/hide slider (intro once, then photos loop)
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;
  const slides = Array.from(wrap.querySelectorAll('.slide')); if(slides.length < 2) return;
  const intro = document.getElementById('intro-anim');

  let i = 0; // start on intro
  let introDone = false;

  function show(n){
    slides[i].classList.remove('active');
    const oldVid = slides[i].querySelector('video'); if(oldVid){ try{ oldVid.pause(); }catch(e){} }
    i = n % slides.length;
    slides[i].classList.add('active');
    const newVid = slides[i].querySelector('video'); if(newVid){ try{ newVid.currentTime=0; newVid.play(); }catch(e){} }
  }

  if(intro){
    intro.removeAttribute('loop'); // play once
    intro.addEventListener('ended', ()=>{ introDone = true; show(1); });
    setTimeout(()=>{ if(!introDone){ introDone = true; show(1); } }, 6000);
  }else{
    introDone = true; show(1);
  }

  setInterval(()=>{
    if(!introDone) return;
    const lastPhoto = slides.length - 1;
    show(i >= lastPhoto ? 1 : i + 1);
  }, 5000);
})();


// === r23 full hero fix controller ===
(function(){
  const stage = document.getElementById('hero-stage'); if(!stage) return;
  const vid   = document.getElementById('heroVid');
  const img   = document.getElementById('heroImg');

  const slides = ['/assets/hero-1.jpg','/assets/hero-2.jpg','/assets/hero-3.jpg'];
  slides.forEach(src => { const i = new Image(); i.src = src; });

  let loopTimer = null, iPos = 0;

  function startCollageLoop(){
    if (vid && vid.parentNode) {
      try { vid.pause(); } catch(e){}
      vid.parentNode.removeChild(vid);
    }
    img.style.display = 'block';
    img.src = slides[iPos];
    loopTimer = setInterval(()=>{
      iPos = (iPos + 1) % slides.length;
      img.src = slides[iPos];
    }, 4500);
  }

  function holdFinalFrameThenSwap(){
    setTimeout(startCollageLoop, 2200); // let end-card breathe
  }

  if (vid) {
    vid.muted = true;
    vid.setAttribute('playsinline','');
    vid.setAttribute('webkit-playsinline','');
    vid.autoplay = true;

    const kick = () => { try{ const p = vid.play(); if(p && p.catch) p.catch(()=>{});}catch(e){} };
    kick();
    vid.addEventListener('canplay', kick, { once:true });
    window.addEventListener('touchstart', kick, { once:true, passive:true });
    window.addEventListener('click', kick, { once:true });

    let ended = false;
    vid.addEventListener('ended', () => { ended = true; holdFinalFrameThenSwap(); }, { once:true });

    const watch = () => {
      if (!document.getElementById('heroVid')) return;
      const d = isFinite(vid.duration) ? vid.duration : 0;
      if (d > 0 && vid.currentTime >= d - 0.06) { holdFinalFrameThenSwap(); return; }
      requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);

    vid.addEventListener('loadedmetadata', () => {
      const d = isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 7;
      setTimeout(() => {
        if (document.getElementById('heroVid')) holdFinalFrameThenSwap();
      }, Math.round(d*1000) + 4000);
    }, { once:true });
  } else {
    startCollageLoop();
  }
})(); 


// r23-full-hero-fixed2b: robust fallback if video can't play
(function(){
  const vid = document.getElementById('heroVid');
  const img = document.getElementById('heroImg');
  if(!vid || !img) return;

  function startLoop(){
    if (vid && vid.parentNode) { try{vid.pause()}catch(_){ } vid.parentNode.removeChild(vid); }
    img.style.display = 'block';
  }

  // If video errors or stalls, fallback quickly
  vid.addEventListener('error', startLoop, { once:true });
  vid.addEventListener('stalled', ()=> setTimeout(startLoop, 600), { once:true });

  // If not ready to play within 1.2s, fallback too (prevents blank)
  setTimeout(()=>{
    const ready = vid.readyState >= 3; // HAVE_FUTURE_DATA
    if(!ready && document.getElementById('heroVid')) startLoop();
  }, 1200);

  // Usual autoplay kickers
  const kick = ()=>{ try{ const p=vid.play(); if(p&&p.catch){ p.catch(()=>{});} }catch(_){}};
  kick();
  vid.addEventListener('canplay', kick, { once:true });
  window.addEventListener('touchstart', kick, { once:true, passive:true });
  window.addEventListener('click', kick, { once:true });
})(); 


// r23-full-hero-fixed3: robust intro playback + smooth crossfade collage
(function(){
  const stage = document.getElementById('hero-stage'); if(!stage) return;
  const vid = document.getElementById('heroVid');
  const imgA = document.getElementById('heroImgA');
  const imgB = document.getElementById('heroImgB');
  const kickBtn = document.getElementById('heroKick');

  const slides = ['/assets/hero-1.jpg','/assets/hero-2.jpg','/assets/hero-3.jpg'];
  slides.forEach(src => { const i = new Image(); i.src = src; });

  let pos = 0, showingA = true, loopTimer = null;

  function crossfadeTo(src){
    const show = showingA ? imgB : imgA;
    const hide = showingA ? imgA : imgB;
    show.src = src;
    show.classList.add('show');
    hide.classList.remove('show');
    showingA = !showingA;
  }

  function startCollage(){
    // Remove video entirely to avoid any overlap
    if(vid && vid.parentNode){ try{vid.pause();}catch(e){} vid.parentNode.removeChild(vid); }
    // Prime first image
    imgA.src = slides[pos];
    imgA.classList.add('show');
    // Crossfade loop
    loopTimer = setInterval(()=>{
      pos = (pos + 1) % slides.length;
      crossfadeTo(slides[pos]);
    }, 4500);
  }

  function holdThenStart(){
    // Hold last frame ~2.2s for readability, then start collage
    setTimeout(startCollage, 2200);
  }

  // Autoplay helpers
  function tryPlay(){
    try{
      const p = vid.play();
      if(p && p.catch){ p.catch(()=>{}); }
    }catch(e){}
  }
  // If autoplay blocked, show a tap overlay
  function showKick(){ kickBtn && kickBtn.classList.add('visible'); }
  function hideKick(){ kickBtn && kickBtn.classList.remove('visible'); }

  if(vid){
    vid.muted = true; vid.playsInline = true; // iOS/Safari
    tryPlay();
    vid.addEventListener('canplay', tryPlay, {once:true});
    window.addEventListener('touchstart', tryPlay, {once:true, passive:true});
    window.addEventListener('click', tryPlay, {once:true});
    if(kickBtn){ kickBtn.addEventListener('click', ()=>{ tryPlay(); }, {once:true}); }

    // If not ready in ~1.2s, reveal the kick overlay
    setTimeout(()=>{
      if(document.getElementById('heroVid') && vid.readyState < 3){
        showKick();
      }
    }, 1200);

    // Once playing, hide the kick
    vid.addEventListener('playing', hideKick);

    // Natural end → hold → collage
    vid.addEventListener('ended', holdThenStart, {once:true});

    // Frame guard: if we reach last frames, proceed
    const guard = ()=>{
      if(!document.getElementById('heroVid')) return;
      const d = isFinite(vid.duration) ? vid.duration : 0;
      if(d>0 && vid.currentTime >= d - 0.06){ holdThenStart(); return; }
      requestAnimationFrame(guard);
    };
    requestAnimationFrame(guard);

    // Absolute fallback: if codec fails or stalls → go straight to collage (no blank)
    vid.addEventListener('error', startCollage, {once:true});
    vid.addEventListener('stalled', ()=> setTimeout(startCollage, 600), {once:true});
    setTimeout(()=>{
      if(document.getElementById('heroVid') && vid.readyState < 2){ startCollage(); }
    }, 2500);
  } else {
    startCollage();
  }
})();


// r23-full-hero-fixed4: single-init robust hero
(function(){
  if (window.__heroInit) return; // prevent duplicate init
  window.__heroInit = true;

  const stage = document.getElementById('hero-stage'); if(!stage) return;
  const vid   = document.getElementById('heroVid');
  const imgA  = document.getElementById('heroImgA');
  const imgB  = document.getElementById('heroImgB');
  const kick  = document.getElementById('heroKick');

  const slides = ['/assets/hero-1.jpg','/assets/hero-2.jpg','/assets/hero-3.jpg'];
  slides.forEach(src => { const i = new Image(); i.src = src; });

  let pos = 0, showA = true, loopTimer = null, fadeRAF = null;

  function showKick(){ kick && kick.classList.add('visible'); }
  function hideKick(){ kick && kick.classList.remove('visible'); }

  function cleanupVideo(){
    if(vid){
      try{ vid.pause(); }catch(_){}
      vid.removeAttribute('src');
      while(vid.firstChild) vid.removeChild(vid.firstChild);
      if(vid.parentNode) vid.parentNode.removeChild(vid);
    }
    hideKick();
  }

  function crossfadeTo(nextSrc){
    const show = showA ? imgB : imgA;
    const hide = showA ? imgA : imgB;
    show.src = nextSrc;
    // Force reflow before toggling to ensure CSS transition runs
    // and use rAF for smoother timing
    if (fadeRAF) cancelAnimationFrame(fadeRAF);
    fadeRAF = requestAnimationFrame(()=>{
      hide.classList.remove('show');
      requestAnimationFrame(()=> show.classList.add('show'));
    });
    showA = !showA;
  }

  function startCollage(){
    cleanupVideo();
    imgA.src = slides[pos];
    imgA.classList.add('show');
    if (loopTimer) clearInterval(loopTimer);
    loopTimer = setInterval(()=>{
      pos = (pos+1) % slides.length;
      crossfadeTo(slides[pos]);
    }, 4500);
  }

  function holdThenStart(){
    setTimeout(startCollage, 2200);
  }

  // Autoplay + error handling
  if (vid){
    // Ensure attributes
    vid.muted = true;
    vid.setAttribute('playsinline','');
    vid.setAttribute('webkit-playsinline','');
    vid.autoplay = true;

    // Add a <source> if missing (defensive)
    if (!vid.querySelector('source')){
      const s = document.createElement('source');
      s.src = '/assets/hero-anim.mp4';
      s.type = 'video/mp4';
      vid.appendChild(s);
      vid.load();
    }

    const tryPlay = () => {
      try{
        const p = vid.play();
        if (p && p.catch) p.catch(()=>{});
      }catch(_){}
    };

    // Try to play on multiple signals
    tryPlay();
    vid.addEventListener('canplay', tryPlay, {once:true});
    window.addEventListener('touchstart', tryPlay, {once:true, passive:true});
    window.addEventListener('click', tryPlay, {once:true});

    if (kick){
      // If not ready in 1s, show tap overlay
      setTimeout(()=>{
        if (document.getElementById('heroVid') && vid.readyState < 2){
          showKick();
        }
      }, 1000);
      kick.addEventListener('click', ()=>{ tryPlay(); hideKick(); }, {once:true});
    }

    // When video plays, hide the overlay
    vid.addEventListener('playing', hideKick);

    // Natural end → hold → collage
    vid.addEventListener('ended', holdThenStart, {once:true});

    // Frame guard (ensures we don't cut early)
    const guard = ()=>{
      const alive = document.getElementById('heroVid');
      if (!alive) return;
      const d = isFinite(vid.duration) ? vid.duration : 0;
      if (d>0 && vid.currentTime >= d - 0.06){ holdThenStart(); return; }
      requestAnimationFrame(guard);
    };
    requestAnimationFrame(guard);

    // If decoding fails or stalls, fallback to collage quickly (no blank)
    const failToCollage = () => {
      // Show poster for a moment then start collage
      setTimeout(startCollage, 400);
    };
    vid.addEventListener('error', failToCollage, {once:true});
    vid.addEventListener('stalled', failToCollage, {once:true});

    // If still not 'playing' after 2.5s, fallback
    setTimeout(()=>{
      if (document.getElementById('heroVid') && vid.readyState < 2){
        failToCollage();
      }
    }, 2500);
  } else {
    startCollage();
  }
})(); 
