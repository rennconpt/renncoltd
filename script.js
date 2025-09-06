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
    setTimeout(()=>{ if(!introFinished){ introFinished = True; show(1); } }, 6000);
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
