(function(){
  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  const g=document.getElementById('gallery');
  if(g){
    const files=Array.from({length:60},(_,i)=>`/gallery/${i+1}.jpg`);
    files.forEach(src=>{const img=new Image(); img.onload=()=>{const fig=document.createElement('figure'); img.style.borderRadius='16px'; img.style.boxShadow='0 10px 30px rgba(0,0,0,.25)'; fig.appendChild(img); g.appendChild(fig);}; img.src=src;});
  }
  const r=document.getElementById('reviews');
  if(r){
    fetch('/data/reviews.json').then(x=>x.json()).then(list=>{
      list.forEach(v=>{
        const d=document.createElement('div'); d.className='review';
        d.innerHTML=`<div class="stars" style="margin-bottom:6px">★★★★★</div><p>${v.text}</p><p><strong>— ${v.name}</strong></p>`;
        r.appendChild(d);
      });
    }).catch(()=>{});
  }
})();