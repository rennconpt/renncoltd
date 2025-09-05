(function(){
  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

  // Gallery lazy loader
  const g=document.getElementById('gallery');
  if(g){
    const files=Array.from({length:200},(_,i)=>`/gallery/${i+1}.jpg`);
    files.forEach(src=>{const img=new Image(); img.onload=()=>{const fig=document.createElement('figure'); img.style.borderRadius='16px'; img.style.boxShadow='0 10px 30px rgba(0,0,0,.25)'; img.style.width='100%'; fig.appendChild(img); g.appendChild(fig);}; img.src=src;});
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
    function perView(){ return window.innerWidth<=640?1: (window.innerWidth<=900?2:3); }
    function cardW(){ const card=track.querySelector('.review'); return card?card.getBoundingClientRect().width+16:0; }
    function maxIndex(){ const pv=perView(); return Math.max(0, track.children.length - pv); }
    function scrollToIndex(i){ index=(i<0?maxIndex():i>maxIndex()?0:i); track.scrollTo({left:index*cardW(), behavior:'smooth'}); }
    left.addEventListener('click', ()=>scrollToIndex(index-1));
    right.addEventListener('click', ()=>scrollToIndex(index+1));
    let timer=setInterval(()=>scrollToIndex(index+1), 4000);
    track.addEventListener('mouseenter', ()=>clearInterval(timer));
    track.addEventListener('mouseleave', ()=>timer=setInterval(()=>scrollToIndex(index+1), 4000));
    window.addEventListener('resize', ()=>scrollToIndex(index));
  }
})();