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


// r23-clean17: aspect-ratio fitter (no crop, no stretch)
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;
  function fit(){
    const boxW = wrap.clientWidth, boxH = wrap.clientHeight;
    const imgs = wrap.querySelectorAll('img.hero-img');
    imgs.forEach(img => {
      const iw = img.naturalWidth || img.videoWidth || img.width;
      const ih = img.naturalHeight || img.videoHeight || img.height;
      if(!iw || !ih || !boxW || !boxH) return;
      const imgAR = iw/ih, boxAR = boxW/boxH;
      if(imgAR > boxAR){
        // image is wider than box -> fit width, limit height
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.maxHeight = '100%';
      }else{
        // image is taller than box -> fit height, limit width
        img.style.height = '100%';
        img.style.width = 'auto';
        img.style.maxWidth = '100%';
      }
    });
  }
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  const ro = new ResizeObserver(fit); ro.observe(wrap);
})(); 


// r23-clean18: background-slide loader + loop (no crop)
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;
  const slides = Array.from(wrap.querySelectorAll('.bg-slide'));
  slides.forEach(s => { const url = s.getAttribute('data-bg'); if(url){ const img = new Image(); img.src = url; s.style.backgroundImage = 'url("'+url+'")'; } });
  const introSlide = wrap.querySelector('.slide.anim');
  const intro = document.getElementById('intro-anim');

  let i = -1; // -1 = intro

  function setActive(idx){
    wrap.querySelectorAll('.bg-slide.active, .slide.anim.active').forEach(el=>el.classList.remove('active'));
    if(idx === -1){
      if(introSlide){ introSlide.classList.add('active'); if(intro){ try{ intro.currentTime=0; intro.play(); }catch(e){} } }
    } else {
      const s = slides[idx % slides.length]; if(s){ s.classList.add('active'); }
    }
  }

  function startLoop(){
    i = 0;
    setActive(i);
    setInterval(()=>{ i = (i+1) % slides.length; setActive(i); }, 4500);
  }

  if(intro){
    intro.addEventListener('ended', startLoop, { once:true });
    // Safety: if 'ended' doesn't fire (mobile), start after 4.5s
    setTimeout(()=>{
      if(i === -1){ startLoop(); }
    }, 5000);
  }else{
    startLoop();
  }
})(); 


// r23-clean19: ensure intro plays first, then loop BG slides; only one visible
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;
  const bgSlides = Array.from(wrap.querySelectorAll('.bg-slide'));
  bgSlides.forEach(s=>{
    const url = s.getAttribute('data-bg');
    if(url){ s.style.backgroundImage = 'url("'+url+'")'; const i=new Image(); i.src=url; }
  });
  const introSlide = wrap.querySelector('.slide.anim');
  const intro = document.getElementById('intro-anim');

  let idx = -1; // -1=video
  function setActive(next){
    const all = wrap.querySelectorAll('.bg-slide, .slide.anim');
    all.forEach(el=>el.classList.remove('active'));
    if(next===-1 && introSlide){ introSlide.classList.add('active'); }
    else { const s = bgSlides[next % bgSlides.length]; if(s){ s.classList.add('active'); }}
  }

  function startLoop(){
    if(bgSlides.length===0) return;
    idx = 0;
    setActive(idx);
    setInterval(()=>{ idx = (idx+1) % bgSlides.length; setActive(idx); }, 4500);
  }

  // Start with intro
  setActive(-1);
  if(intro){
    intro.muted = true; intro.playsInline = true; intro.autoplay = true;
    const tryPlay = ()=>{ try{ const p = intro.play(); if(p && p.catch){ p.catch(()=>{}); } }catch(e){} };
    intro.addEventListener('canplay', tryPlay, {once:true});
    tryPlay();
    intro.addEventListener('ended', startLoop, {once:true});
    // Absolute fallback: start after 5s no matter what
    setTimeout(()=>{ if(idx===-1){ startLoop(); } }, 5200);
  } else {
    startLoop();
  }
})(); 


// r23-clean20: play intro fully, then remove it; no repeats behind photos
(function(){
  const wrap = document.getElementById('hero-slider'); if(!wrap) return;

  // If somehow multiple hero-sliders exist, keep the first and remove the rest
  const dupes = document.querySelectorAll('#hero-slider'); 
  if(dupes.length > 1){ for(let i=1;i<dupes.length;i++){ dupes[i].parentNode && dupes[i].parentNode.removeChild(dupes[i]); } }

  const bgSlides = Array.from(wrap.querySelectorAll('.bg-slide'));
  bgSlides.forEach(s=>{
    const url = s.getAttribute('data-bg');
    if(url){ s.style.backgroundImage = 'url("'+url+'")'; const i=new Image(); i.src=url; }
  });
  const introSlide = wrap.querySelector('.slide.anim');
  const intro = document.getElementById('intro-anim');

  let idx = -1; // -1 = intro

  function showOnly(el){
    wrap.querySelectorAll('.bg-slide, .slide.anim').forEach(e=>e.classList.remove('active'));
    if(el){ el.classList.add('active'); }
  }

  function setActiveIndex(i){
    idx = i;
    if(i === -1) showOnly(introSlide);
    else showOnly(bgSlides[i % bgSlides.length]);
  }

  function startLoop(){
    if(bgSlides.length===0) return;
    // Remove intro from DOM completely to avoid any z-order surprises
    if(intro){ try{ intro.pause(); }catch(e){} }
    if(introSlide && introSlide.parentNode){ introSlide.parentNode.removeChild(introSlide); }
    let i = 0;
    setActiveIndex(i);
    setInterval(()=>{ i = (i+1) % bgSlides.length; setActiveIndex(i); }, 4500);
  }

  // Start with intro
  setActiveIndex(-1);

  if(intro){
    intro.muted = true; intro.playsInline = true; intro.autoplay = true;
    const tryPlay = ()=>{ try{ const p=intro.play(); if(p&&p.catch){ p.catch(()=>{}); } }catch(e){} };
    intro.addEventListener('canplay', tryPlay, {once:true});
    tryPlay();

    intro.addEventListener('ended', startLoop, { once: true });

    // Fallback uses actual duration (metadata) plus buffer; minimum 7s
    const setFallback = ()=>{
      const dur = isFinite(intro.duration) && intro.duration>0 ? intro.duration : 7;
      const ms = Math.max(7000, Math.round(dur*1000) + 600);
      setTimeout(()=>{ 
        // If intro is still present (no 'ended' fired), start loop now
        if(document.getElementById('intro-anim')) startLoop(); 
      }, ms);
    };
    if(isFinite(intro.duration) && intro.duration>0){ setFallback(); }
    else { intro.addEventListener('loadedmetadata', setFallback, {once:true}); setTimeout(setFallback, 9000); }
  } else {
    startLoop();
  }
})(); 


// r23-clean21: minimal hero controller
(function(){
  const stage = document.getElementById('hero-stage'); if(!stage) return;
  const vid = document.getElementById('heroVid');
  const img = document.getElementById('heroImg');
  const slides = ['/assets/hero-1.jpg','/assets/hero-2.jpg','/assets/hero-3.jpg'];

  // Preload
  const cache = slides.map(src=>{ const i=new Image(); i.src=src; return i; });

  let timer = null, pos = 0;

  function startImageLoop(){
    // Hide and remove the video entirely
    if(vid){
      try{ vid.pause(); }catch(e){} 
      if(vid.parentNode){ vid.parentNode.removeChild(vid); }
    }
    // Show the image element
    img.style.display = 'block';
    img.src = slides[pos];
    // Rotate
    timer = setInterval(()=>{
      pos = (pos+1) % slides.length;
      img.src = slides[pos];
    }, 4500);
  }

  // Start with the intro video
  if(vid){
    vid.muted = true; vid.playsInline = true; vid.autoplay = true;
    const tryPlay = ()=>{ try{ const p=vid.play(); if(p&&p.catch){ p.catch(()=>{}); } }catch(e){} };
    vid.addEventListener('canplay', tryPlay, {once:true});
    tryPlay();

    // When the video actually ends, switch to images
    vid.addEventListener('ended', startImageLoop, {once:true});

    // Fallback: wait for real duration (or min 7s) then switch if needed
    const fallback = ()=>{
      const dur = (isFinite(vid.duration) && vid.duration>0) ? vid.duration : 7;
      const ms = Math.max(7000, Math.round(dur*1000) + 400);
      setTimeout(()=>{
        if(document.getElementById('heroVid')) startImageLoop();
      }, ms);
    };
    if(isFinite(vid.duration) && vid.duration>0) fallback();
    else { vid.addEventListener('loadedmetadata', fallback, {once:true}); setTimeout(fallback, 9000); }
  } else {
    startImageLoop();
  }
})(); 
