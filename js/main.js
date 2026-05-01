function verifyAge(isAdult) {
  const overlay = document.getElementById('ageVerificationOverlay');
  const notice = document.getElementById('underageNotice');
  const buttons = document.querySelector('.age-btns');
  const countdownEl = document.getElementById('countdown');

  if (isAdult) {
    // Si es mayor, ocultamos el modal y dejamos ver el welcomeOverlay
    overlay.style.animation = 'fadeOutOverlay 0.5s ease forwards';
    setTimeout(() => overlay.style.display = 'none', 550);
  } else {
    // Si es menor, mostramos advertencia y cerramos
    buttons.style.display = 'none';
    notice.style.display = 'block';
    
    let timeLeft = 5;
    const timer = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        // Intentamos cerrar la pestaña (solo funciona si el script la abrió)
        // Como respaldo, redirigimos a Google o una página segura
        window.location.href = "https://www.google.com";
        window.close(); 
      }
    }, 1000);
  }
}
 // =============================================
  // GLOBAL
  // =============================================
  let GC = 1000; // global credits
  let plays = 0, bestWin = 0;
  const BETS = [1,2,5,10,20,50,100,200];
  const fmt = n => Math.floor(n).toLocaleString('es-AR');
  const delay = ms => new Promise(r => setTimeout(r, ms));

  function setGC(n) {
    GC = Math.max(0, Math.floor(n));
    document.getElementById('gcr').textContent = fmt(GC);
    document.getElementById('slotsCredits').textContent = fmt(GC);
    sCredits = GC;
  }

  function addWin(amount) {
    plays++;
    document.getElementById('sPlays').textContent = plays;
    if(amount > bestWin) {
      bestWin = amount;
      document.getElementById('sBest').textContent = '$' + fmt(bestWin);
    }
  }

  function toast(msg, type='') {
    const c = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ' '+type : '');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  // =============================================
  // NAVIGATION
  // =============================================
  const SCREENS = ['lobby','slots','roulette','blackjack','poker','dice','baccarat','gastro'];
  const NAV_IDS = {slots:'nSlots',roulette:'nRoul',blackjack:'nBJ',poker:'nPok',dice:'nDice',baccarat:'nBacc',gastro:'nGastro'};
  const SI_IDS = {slots:'siSlots',roulette:'siRoul',blackjack:'siBJ',poker:'siPok',dice:'siDice',baccarat:'siBacc',gastro:'siGastro'};

  function go(id) {
    SCREENS.forEach(s => {
      document.getElementById('sc-'+s).classList.toggle('on', s===id);
      const na = document.getElementById(NAV_IDS[s]);
      if(na) na.classList.toggle('on', s===id);
      const si = document.getElementById(SI_IDS[s]);
      if(si) si.classList.toggle('on', s===id);
    });
    // sync tabs
    document.querySelectorAll('.tab').forEach((t,i) => t.classList.toggle('on', SCREENS[i]===id));
    document.querySelectorAll('.tab').forEach(t => {
      t.onclick = () => go(SCREENS[Array.from(document.querySelectorAll('.tab')).indexOf(t)]);
    });
  }

  // Re-wire tabs on load
  document.querySelectorAll('.tab').forEach((t,i) => {
    t.onclick = () => go(SCREENS[i]);
  });

  // =============================================
  // MODAL
  // =============================================
  function openModal(type) {
    const mc = document.getElementById('mcontent');
    if(type === 'login') {
      mc.innerHTML = `<div class="mtitle">Iniciar sesión</div><div class="msub">Accedé a tu cuenta</div>
      <input class="minput" type="email" placeholder="Email">
      <input class="minput" type="password" placeholder="Contraseña">
      <button class="mbtn" onclick="closeModal();toast('¡Bienvenido de vuelta! 👋')">Ingresar</button>
      <button class="mbtn o" onclick="closeModal()">Cancelar</button>`;
    } else if(type === 'register') {
      mc.innerHTML = `<div class="mtitle">Crear cuenta</div><div class="msub">Registrate y recibí $500 de bono</div>
      <input class="minput" type="text" placeholder="Nombre completo">
      <input class="minput" type="email" placeholder="Email">
      <input class="minput" type="password" placeholder="Contraseña">
      <input class="minput" id="regAge" type="number" placeholder="Tu edad" min="18" max="99" oninput="checkRegAge()">
      <div id="regAgeWarn" style="font-size:10px;color:#e03030;margin:-4px 0 6px;display:none;letter-spacing:.5px">⚠️ Debés tener al menos 18 años para registrarte.</div>
      <button class="mbtn" id="regSubmitBtn" onclick="submitRegister()">Registrarse gratis</button>
      <button class="mbtn o" onclick="closeModal()">Cancelar</button>
      <div style="margin-top:10px;font-size:10px;color:rgba(255,255,255,0.30);line-height:1.6;letter-spacing:.3px;text-align:center">🔞 Solo mayores de 18 años tienen permitido jugar.<br>El juego puede causar adicción. Jugá con responsabilidad.</div>`;
    } else if(type === 'vip') {
      mc.innerHTML = `<div style="font-size:36px;margin-bottom:8px">👑</div>
      <div class="mtitle">Programa VIP</div><div class="msub">Acumulá puntos con cada apuesta</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin-bottom:16px">
        ${['🥉 Bronce','🥈 Plata','🥇 Oro','💠 Platino','💎 Diamante'].map(l=>`<div style="background:var(--bgp);border:1px solid var(--bd);border-radius:8px;padding:7px 11px;font-size:12px;font-weight:700">${l}</div>`).join('')}
      </div>
      <button class="mbtn" onclick="closeModal();toast('👑 ¡Ya estás en el programa VIP!')">Unirme ahora</button>
      <button class="mbtn o" onclick="closeModal()">Cerrar</button>`;
    }
    document.getElementById('moverlay').classList.add('on');
  }
  function closeModal() { document.getElementById('moverlay').classList.remove('on'); }

  function checkRegAge(){
    const inp=document.getElementById('regAge');
    const warn=document.getElementById('regAgeWarn');
    const btn=document.getElementById('regSubmitBtn');
    if(!inp)return;
    const age=parseInt(inp.value)||0;
    const under=age>0&&age<18;
    const valid=age>=18;
    if(warn)warn.style.display=under?'block':'none';
    if(btn){btn.disabled=!valid;btn.style.opacity=valid?'1':'.4';btn.style.cursor=valid?'pointer':'not-allowed';}
  }

  function submitRegister(){
    const age=parseInt((document.getElementById('regAge')||{}).value)||0;
    if(age<18){return;}
    closeModal();
    setGC(GC+500);
    toast('🎁 ¡Cuenta creada! +$500 de bono de bienvenida');
  }

  // Navbar buttons
  document.querySelector('.nav').insertAdjacentHTML('beforeend', `<div style="display:flex;gap:8px;margin-left:10px">
    <button style="padding:7px 14px;border-radius:7px;background:transparent;border:1px solid var(--bd);color:var(--txs);font-family:Rajdhani,sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase" onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)'" onmouseout="this.style.borderColor='var(--bd)';this.style.color='var(--txs)'" onclick="openModal('login')">Iniciar sesión</button>
    <button style="padding:7px 14px;border-radius:7px;background:var(--gold);border:none;color:#080810;font-family:Rajdhani,sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;cursor:pointer;text-transform:uppercase" onclick="openModal('register')">Registrarse</button>
  </div>`);

  // =============================================
  // SLOTS
  // =============================================
  const SYMS = [
    {s:'🍒',w:28},{s:'🍋',w:22},{s:'🍊',w:18},{s:'🍇',w:12},
    {s:'🔔',w:9},{s:'⭐',w:5},{s:'💎',w:4},{s:'7️⃣',w:2}
  ];
  const PAYS = [
    {c:['7️⃣','7️⃣','7️⃣'],m:50,l:'JACKPOT'},{c:['💎','💎','💎'],m:30,l:'SÚPER'},
    {c:['⭐','⭐','⭐'],m:20,l:'GENIAL'},{c:['🔔','🔔','🔔'],m:15,l:''},
    {c:['🍇','🍇','🍇'],m:10,l:''},{c:['🍒','🍒','🍒'],m:8,l:''},
    {c:['🍊','🍊','🍊'],m:6,l:''},{c:['🍋','🍋','🍋'],m:5,l:''},
    {c:['🍒','🍒',null],m:2,l:''},{c:['💎',null,null],m:1.5,l:''},
  ];
  const BSTEPS = [1,2,5,10,20,50,100,200];
  let sCredits=1000, sBet=10, sLines=5, sSpinning=false, sAuto=false, sAutoT=null;
  let sHist=[], sBestWin=0, sGrid=[['🍒','🍋','🍊'],['🍒','🍋','🍊'],['🍒','🍋','🍊']];
  let sCells=[];

  // Build dots
  const pdots = document.getElementById('pdots');
  for(let i=0;i<20;i++){const d=document.createElement('div');d.className='pdot';pdots.appendChild(d);}
  function updDots(){pdots.querySelectorAll('.pdot').forEach((d,i)=>d.classList.toggle('on',i<sLines));}
  updDots();

  // Build reels
  function buildReels(){
    const rr=document.getElementById('reelrow');rr.innerHTML='';sCells=[];
    for(let c=0;c<3;c++){
      const col=document.createElement('div');col.className='reelcol';const cc=[];
      for(let r=0;r<3;r++){
        const cell=document.createElement('div');cell.className='cell'+(r===1?' cr':'');
        const sp=document.createElement('span');sp.className='sym';sp.textContent=sGrid[c][r];
        cell.appendChild(sp);col.appendChild(cell);cc.push(cell);
      }
      rr.appendChild(col);sCells.push(cc);
    }
  }
  buildReels();

  // Build paytable
  const ptg=document.getElementById('ptgrid');
  PAYS.forEach(p=>{
    const r=document.createElement('div');r.className='ptrow';
    r.innerHTML=`<span class="ptsyms">${p.c.map(x=>x||'').join(' ')}</span><span class="ptmult">×${p.m}${p.l?' · '+p.l:''}</span>`;
    ptg.appendChild(r);
  });

  function wRand(){const t=SYMS.reduce((a,s)=>a+s.w,0);let r=Math.random()*t;for(const s of SYMS){r-=s.w;if(r<=0)return s.s;}return SYMS[0].s;}
  function checkWin(cr){for(const p of PAYS){const[a,b,c]=p.c;if(a&&cr[0]!==a)continue;if(b&&cr[1]!==b)continue;if(c&&cr[2]!==c)continue;return p;}return null;}

  function updSlotsUI(){
    document.getElementById('slotsCredits').textContent=fmt(sCredits);
    document.getElementById('gcr').textContent=fmt(sCredits);
    GC=sCredits;
    document.getElementById('sbv').textContent=sBet;
    document.getElementById('totalBet').textContent=fmt(sBet*sLines);
  }

  async function spin(){
    if(sSpinning||sCredits<sBet*sLines){toast('⚠️ Créditos insuficientes','e');return;}
    sSpinning=true;const cost=sBet*sLines;sCredits-=cost;updSlotsUI();
    document.getElementById('spinBtn').disabled=true;
    document.getElementById('lastWin').textContent='0';
    const mb=document.getElementById('msgbox');mb.className='msg';mb.textContent='Girando...';
    sCells.forEach(col=>col.forEach(cell=>cell.classList.add('spin')));
    await delay(600);
    const ng=[];for(let c=0;c<3;c++){const col=[];for(let r=0;r<3;r++)col.push(wRand());ng.push(col);}sGrid=ng;
    for(let c=0;c<3;c++){await delay(200);sCells[c].forEach((cell,r)=>{cell.classList.remove('spin');cell.querySelector('.sym').textContent=sGrid[c][r];});}
    const center=sGrid.map(col=>col[1]);
    const win=checkWin(center);
    plays++;document.getElementById('sPlays').textContent=plays;
    if(win){
      const wa=Math.floor(sBet*sLines*win.m);sCredits+=wa;
      if(wa>sBestWin){sBestWin=wa;document.getElementById('sBest').textContent='$'+fmt(wa);}
      document.getElementById('lastWin').textContent=fmt(wa);
      sCells.forEach(col=>col[1].classList.add('win'));
      if(win.l==='JACKPOT'){mb.className='msg jp';mb.textContent='🎰 ¡JACKPOT! +$'+fmt(wa);toast('🎰 ¡JACKPOT! +$'+fmt(wa),'j');}
      else{mb.className='msg win';mb.textContent='✨ ¡Ganaste $'+fmt(wa)+'!';toast('✨ +$'+fmt(wa)+'!');}
      setTimeout(()=>sCells.forEach(col=>col[1].classList.remove('win')),1500);
      sHist.unshift({r:center,b:cost,w:wa});
    } else {
      mb.className='msg';mb.textContent='Sin premio — ¡Seguí intentando!';
      sHist.unshift({r:center,b:cost,w:0});
    }
    if(sHist.length>10)sHist.pop();
    updSlotsUI();sSpinning=false;document.getElementById('spinBtn').disabled=false;
    const hl=document.getElementById('histlist');
    hl.innerHTML=sHist.map(h=>`<div class="hi"><span class="hsyms">${h.r.join(' ')}</span><span class="hbet">-$${fmt(h.b)}</span><span class="hres ${h.w>0?'w':'l'}">${h.w>0?'+$'+fmt(h.w):'-$'+fmt(h.b)}</span></div>`).join('');
  }

  function toggleAuto(){
    sAuto=!sAuto;const btn=document.getElementById('autoBtn');
    btn.classList.toggle('run',sAuto);
    btn.textContent=sAuto?'⏹ Detener':'🔁 Auto';
    if(sAuto)runAuto();else clearTimeout(sAutoT);
  }
  async function runAuto(){
    if(!sAuto||sCredits<sBet*sLines){sAuto=false;document.getElementById('autoBtn').classList.remove('run');document.getElementById('autoBtn').textContent='🔁 Auto';return;}
    await spin();if(sAuto)sAutoT=setTimeout(runAuto,300);
  }

  document.getElementById('spinBtn').addEventListener('click',spin);
  document.getElementById('autoBtn').addEventListener('click',toggleAuto);
  document.getElementById('maxBtn').addEventListener('click',()=>{
    sBet=BSTEPS[BSTEPS.length-1];sLines=20;
    document.querySelectorAll('.lbtn').forEach(b=>b.classList.toggle('on',b.dataset.l==='20'));
    updSlotsUI();updDots();
  });
  document.getElementById('sbu').addEventListener('click',()=>{const i=BSTEPS.indexOf(sBet);if(i<BSTEPS.length-1){sBet=BSTEPS[i+1];updSlotsUI();}});
  document.getElementById('sbd').addEventListener('click',()=>{const i=BSTEPS.indexOf(sBet);if(i>0){sBet=BSTEPS[i-1];updSlotsUI();}});
  document.querySelectorAll('.lbtn').forEach(btn=>btn.addEventListener('click',()=>{
    sLines=parseInt(btn.dataset.l);
    document.querySelectorAll('.lbtn').forEach(b=>b.classList.toggle('on',b===btn));
    updSlotsUI();updDots();
  }));
  document.addEventListener('keydown',e=>{
    if(e.code==='Space'&&!sSpinning&&document.activeElement.tagName!=='INPUT'){e.preventDefault();spin();}
  });

  function togglePT(){const b=document.getElementById('ptbody');const a=document.getElementById('ptarr');const open=b.style.display!=='none';b.style.display=open?'none':'';a.classList.toggle('op',!open);}
  function toggleHist(){const b=document.getElementById('histlist');const a=document.getElementById('histarr');const open=b.style.display!=='none';b.style.display=open?'none':'';a.classList.toggle('op',!open);}

  // Jackpot tickers
  let jpG=50000,jpM=10000,jpN=1000,jpMi=100;
  setInterval(()=>{
    jpG+=Math.round(Math.random()*50);jpM+=Math.round(Math.random()*20);jpN+=Math.round(Math.random()*5);jpMi+=Math.round(Math.random()*1);
    document.getElementById('jpG').textContent='$'+fmt(jpG);document.getElementById('jpM').textContent='$'+fmt(jpM);
    document.getElementById('jpN').textContent='$'+fmt(jpN);document.getElementById('jpMi').textContent='$'+fmt(jpMi);
  },800);
  updSlotsUI();

  // =============================================
  // RULETA
  // =============================================
  const RED_N=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const RSEQ=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  let roulBets={}, roulBetAmt=10, roulSpinning=false, roulAngle=0;

  // Number grid
  const ng=document.getElementById('numgrid');
  for(let i=0;i<=36;i++){
    const b=document.createElement('button');
    b.className='nb '+(i===0?'g':RED_N.includes(i)?'r':'b');
    b.textContent=i;b.dataset.n=i;
    b.onclick=()=>{
      const k='n'+i;
      if(roulBets[k]){delete roulBets[k];b.classList.remove('on');}
      else{roulBets[k]=true;b.classList.add('on');}
      updRoulSel();
    };
    ng.appendChild(b);
  }

  function toggleOB(type, btn){
    if(roulBets[type]){delete roulBets[type];btn.classList.remove('on','onr','onb','ong');}
    else{
      roulBets[type]=true;
      btn.classList.remove('on','onr','onb','ong');
      if(type==='red')btn.classList.add('onr');
      else if(type==='black')btn.classList.add('onb');
      else if(type==='zero')btn.classList.add('ong');
      else btn.classList.add('on');
    }
    updRoulSel();
  }

  function clearRoulBets(){
    roulBets={};
    document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
    document.querySelectorAll('.ob-btn').forEach(b=>b.classList.remove('on','onr','onb','ong'));
    updRoulSel();
  }

  function updRoulSel(){
    const keys=Object.keys(roulBets);
    if(!keys.length){document.getElementById('roulSelList').textContent='Sin apuestas seleccionadas';return;}
    const labels={red:'Rojo',black:'Negro',even:'Par',odd:'Impar',low:'Bajo 1-18',high:'Alto 19-36','1to12':'1ª Docena','13to24':'2ª Docena','25to36':'3ª Docena',zero:'Cero (0)'};
    const parts=keys.map(k=>k.startsWith('n')?'Número '+k.slice(1):(labels[k]||k));
    document.getElementById('roulSelList').innerHTML='Apostando a: <strong style="color:var(--gold)">'+parts.join(', ')+'</strong> · Costo total: <strong style="color:var(--gold)">$'+fmt(keys.length*roulBetAmt)+'</strong>';
  }

  function adjRB(d){const i=BETS.indexOf(roulBetAmt);roulBetAmt=BETS[Math.max(0,Math.min(BETS.length-1,i+d))];document.getElementById('rbv').textContent='$'+roulBetAmt;updRoulSel();}

  // Canvas wheel
  const roulCanvas=document.getElementById('roulCanvas');
  const rctx=roulCanvas.getContext('2d');

  function drawWheel(ang){
    const ctx=rctx,w=210,cx=w/2,cy=w/2,r=w/2-3;
    ctx.clearRect(0,0,w,w);
    const n=RSEQ.length,arc=2*Math.PI/n;
    RSEQ.forEach((num,i)=>{
      const a=ang+i*arc;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,a,a+arc);ctx.closePath();
      ctx.fillStyle=num===0?'#22aa55':RED_N.includes(num)?'#cc2222':'#1a1a2e';
      ctx.fill();ctx.strokeStyle='#e2b84b33';ctx.lineWidth=0.5;ctx.stroke();
      ctx.save();ctx.translate(cx,cy);ctx.rotate(a+arc/2);
      ctx.fillStyle='#f0e6cc';ctx.font='bold 7px Rajdhani,sans-serif';ctx.textAlign='right';
      ctx.fillText(num,r-5,3);ctx.restore();
    });
    ctx.beginPath();ctx.arc(cx,cy,13,0,2*Math.PI);ctx.fillStyle='#0a0a18';ctx.fill();ctx.strokeStyle='#e2b84b';ctx.lineWidth=2;ctx.stroke();
    // pointer triangle at top
    ctx.beginPath();ctx.moveTo(cx,4);ctx.lineTo(cx-5,18);ctx.lineTo(cx+5,18);ctx.closePath();ctx.fillStyle='#e2b84b';ctx.fill();
  }
  drawWheel(0);

  async function roulSpin(){
    if(roulSpinning)return;
    const keys=Object.keys(roulBets);
    if(!keys.length){toast('⚠️ Seleccioná al menos una apuesta','e');return;}
    const cost=keys.length*roulBetAmt;
    if(GC<cost){toast('⚠️ Créditos insuficientes','e');return;}
    roulSpinning=true;document.getElementById('roulSpinBtn').disabled=true;
    setGC(GC-cost);

    const extraRots=8*Math.PI+Math.random()*2*Math.PI;
    const dur=4000;const t0=performance.now();const a0=roulAngle;
    await new Promise(res=>{
      function frame(now){
        const t=Math.min((now-t0)/dur,1);
        const ease=1-Math.pow(1-t,3);
        roulAngle=a0+extraRots*ease;
        drawWheel(roulAngle);
        if(t<1)requestAnimationFrame(frame);else res();
      }
      requestAnimationFrame(frame);
    });

    // Find winning number from angle
    const n=RSEQ.length,arc=2*Math.PI/n;
    // The pointer is at top (angle = -PI/2 relative to start, but we use 0 offset)
    // Find which segment is at angle 0 (top, where pointer is)
    let normAng=((-roulAngle) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);
    let idx=Math.floor(normAng/arc) % n;
    const winNum=RSEQ[idx];
    const isRed=RED_N.includes(winNum);
    const isBlack=!isRed&&winNum!==0;

    // Show ball
    const ball=document.getElementById('roulBall');
    ball.textContent=winNum;
    ball.className='roulball '+(winNum===0?'gn':isRed?'rd':'bk');
    document.getElementById('roulColor').textContent=winNum===0?'🟢 Verde':isRed?'🔴 Rojo':'⚫ Negro';

    // Calc winnings
    let totalReturn=0;
    keys.forEach(k=>{
      let won=false,mult=0;
      if(k==='red'&&isRed){won=true;mult=1;}
      else if(k==='black'&&isBlack){won=true;mult=1;}
      else if(k==='even'&&winNum!==0&&winNum%2===0){won=true;mult=1;}
      else if(k==='odd'&&winNum%2===1){won=true;mult=1;}
      else if(k==='low'&&winNum>=1&&winNum<=18){won=true;mult=1;}
      else if(k==='high'&&winNum>=19&&winNum<=36){won=true;mult=1;}
      else if(k==='1to12'&&winNum>=1&&winNum<=12){won=true;mult=2;}
      else if(k==='13to24'&&winNum>=13&&winNum<=24){won=true;mult=2;}
      else if(k==='25to36'&&winNum>=25&&winNum<=36){won=true;mult=2;}
      else if(k==='zero'&&winNum===0){won=true;mult=35;}
      else if(k.startsWith('n')&&parseInt(k.slice(1))===winNum){won=true;mult=35;}
      if(won)totalReturn+=roulBetAmt*(mult+1);
    });

    setGC(GC+totalReturn);
    plays++;document.getElementById('sPlays').textContent=plays;
    const profit=totalReturn-cost;
    if(profit>bestWin){bestWin=profit;document.getElementById('sBest').textContent='$'+fmt(bestWin);}
    if(totalReturn>0){toast('🎡 Salió '+winNum+'! Ganaste $'+fmt(profit>0?profit:totalReturn));}
    else{toast('😔 Salió '+winNum+'. ¡Mejor suerte!');}

    roulSpinning=false;document.getElementById('roulSpinBtn').disabled=false;
  }

  // =============================================
  // BLACKJACK
  // =============================================
  const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  let bjDeck=[],bjPlayer=[],bjDealer=[],bjBet=10,bjPhase='idle';

  function mkDeck(){const d=[];for(const s of SUITS)for(const r of RANKS)d.push({r,s,red:s==='♥'||s==='♦'});return d;}
  function shuffle(d){for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
  function cval(r){if(r==='A')return 11;if(['J','Q','K'].includes(r))return 10;return parseInt(r);}
  function hval(h){let v=h.reduce((s,c)=>s+cval(c.r),0);let a=h.filter(c=>c.r==='A').length;while(v>21&&a>0){v-=10;a--;}return v;}
  function drawC(){if(bjDeck.length<10)bjDeck=shuffle(mkDeck());return bjDeck.pop();}

  function mkCard(c,fd=false){
    const d=document.createElement('div');
    if(fd){d.className='playingcard fd';return d;}
    d.className='playingcard '+(c.red?'r':'b');
    d.innerHTML=`<div class="ct">${c.r}</div><div class="cs">${c.s}</div><div class="cb">${c.r}</div>`;
    return d;
  }

  function renderBJ(){
    const pc=document.getElementById('bjPC'),dc=document.getElementById('bjDC');
    pc.innerHTML='';dc.innerHTML='';
    bjPlayer.forEach(c=>pc.appendChild(mkCard(c)));
    bjDealer.forEach((c,i)=>{
      if(i===1&&bjPhase==='playing')dc.appendChild(mkCard(c,true));
      else dc.appendChild(mkCard(c));
    });
    const pv=hval(bjPlayer);document.getElementById('bjPS').textContent=pv>0?'('+pv+')':'';
    const vis=bjPhase==='playing'?[bjDealer[0]]:bjDealer;
    document.getElementById('bjDS').textContent=hval(vis)>0?'('+hval(vis)+(bjPhase==='playing'?'?':'')+')':'';
  }

  function setBJCtrl(playing){
    document.getElementById('bjDealBtn').disabled=playing;
    document.getElementById('bjHit').disabled=!playing;
    document.getElementById('bjStand').disabled=!playing;
    document.getElementById('bjDouble').disabled=!playing||bjPlayer.length>2;
  }

  function adjBJ(d){const i=BETS.indexOf(bjBet);bjBet=BETS[Math.max(0,Math.min(BETS.length-1,i+d))];document.getElementById('bjBet').textContent='$'+bjBet;}

  function bjDeal(){
    if(GC<bjBet){toast('⚠️ Créditos insuficientes','e');return;}
    setGC(GC-bjBet);bjDeck=shuffle(mkDeck());
    bjPlayer=[drawC(),drawC()];bjDealer=[drawC(),drawC()];
    bjPhase='playing';
    document.getElementById('bjST').className='bjstatus';
    document.getElementById('bjST').textContent='Tu turno';
    setBJCtrl(true);renderBJ();
    if(hval(bjPlayer)===21)bjStand();
  }

  function bjHit(){bjPlayer.push(drawC());renderBJ();if(hval(bjPlayer)>21)bjEnd();}

  async function bjStand(){
    bjPhase='dealer';renderBJ();
    while(hval(bjDealer)<17){await delay(700);bjDealer.push(drawC());renderBJ();}
    bjEnd();
  }

  function bjDouble(){
    if(GC<bjBet){toast('⚠️ Sin créditos para doblar','e');return;}
    setGC(GC-bjBet);bjBet*=2;document.getElementById('bjBet').textContent='$'+bjBet;
    bjPlayer.push(drawC());renderBJ();bjStand();
  }

  function bjEnd(){
    bjPhase='done';renderBJ();
    document.getElementById('bjDS').textContent='('+hval(bjDealer)+')';
    setBJCtrl(false);
    const pv=hval(bjPlayer),dv=hval(bjDealer);
    const st=document.getElementById('bjST');
    let msg='',cls='bjstatus',ret=0;
    if(pv>21){msg='💥 Te pasaste';cls+=' l';}
    else if(dv>21){msg='🎉 Dealer se pasó — ¡Ganaste!';cls+=' w';ret=bjBet*2;}
    else if(pv>dv){msg='🏆 ¡Ganaste!';cls+=' w';ret=bjBet*2;}
    else if(pv<dv){msg='😔 Ganó el dealer';cls+=' l';}
    else{msg='🤝 Empate — Te devolvemos la apuesta';cls+=' p';ret=bjBet;}
    st.className=cls;st.textContent=msg;
    if(ret>0){setGC(GC+ret);const p=ret-bjBet;if(p>bestWin){bestWin=p;document.getElementById('sBest').textContent='$'+fmt(bestWin);};}
    plays++;document.getElementById('sPlays').textContent=plays;
    toast(ret>bjBet?'🃏 ¡+$'+fmt(ret-bjBet)+'!':ret===bjBet?'🤝 Empate':'😔 Mejor suerte');
    bjBet=10;document.getElementById('bjBet').textContent='$'+bjBet;
  }

  // =============================================
  // VIDEO POKER
  // =============================================
  let pkDeck=[],pkHand=[],pkHeld=[],pkBet=10,pkPhase='idle';

  function mkPKDeck(){const d=[];for(const s of SUITS)for(const r of RANKS)d.push({r,s,red:s==='♥'||s==='♦'});return d;}

  function adjPK(d){const i=BETS.indexOf(pkBet);pkBet=BETS[Math.max(0,Math.min(BETS.length-1,i+d))];document.getElementById('pkBet').textContent='$'+pkBet;}

  function renderPK(){
    const cont=document.getElementById('pkCards');cont.innerHTML='';
    pkHand.forEach((c,i)=>{
      const d=document.createElement('div');
      d.className='pkcard '+(c.red?'r':'b')+(pkHeld[i]?' held':'');
      d.innerHTML=`<div class="ct">${c.r}</div><div class="cs">${c.s}</div><div class="cb">${c.r}</div>`;
      if(pkHeld[i])d.innerHTML+=`<div class="hb">GUARDAR</div>`;
      if(pkPhase==='hold'){d.onclick=()=>{pkHeld[i]=!pkHeld[i];renderPK();};}
      cont.appendChild(d);
    });
  }

  function evalPK(hand){
    const ranks=hand.map(c=>RANKS.indexOf(c.r));
    const suits=hand.map(c=>c.s);
    const rc={};ranks.forEach(r=>rc[r]=(rc[r]||0)+1);
    const counts=Object.values(rc).sort((a,b)=>b-a);
    const isFlush=new Set(suits).size===1;
    const sr=[...ranks].sort((a,b)=>a-b);
    const isStraight=sr[4]-sr[0]===4&&new Set(sr).size===5;
    const isAceLow=JSON.stringify(sr)==='[0,1,2,3,12]';
    const isRoyal=JSON.stringify(sr)==='[8,9,10,11,12]';
    if(isFlush&&isRoyal)return{n:'🎰 Escalera Real',m:250};
    if(isFlush&&(isStraight||isAceLow))return{n:'🃏 Escalera de Color',m:50};
    if(counts[0]===4)return{n:'4️⃣ Póker (cuatro iguales)',m:25};
    if(counts[0]===3&&counts[1]===2)return{n:'🏠 Full House',m:9};
    if(isFlush)return{n:'♠️ Color (Flush)',m:6};
    if(isStraight||isAceLow)return{n:'📈 Escalera',m:4};
    if(counts[0]===3)return{n:'3️⃣ Trío',m:3};
    if(counts[0]===2&&counts[1]===2)return{n:'2️⃣ Doble Par',m:2};
    if(counts[0]===2){
      const pr=parseInt(Object.entries(rc).find(([r,c])=>c===2)[0]);
      if(pr>=9||pr===0)return{n:'👑 Par de Jacks o mejor',m:1};
    }
    return{n:'',m:0};
  }

  function pkDeal(){
    if(pkPhase==='idle'){
      if(GC<pkBet){toast('⚠️ Créditos insuficientes','e');return;}
      setGC(GC-pkBet);pkDeck=shuffle(mkPKDeck());
      pkHand=[];for(let i=0;i<5;i++)pkHand.push(pkDeck.pop());
      pkHeld=[false,false,false,false,false];pkPhase='hold';
      document.getElementById('pkPhase').textContent='Hacé clic en las cartas que querés GUARDAR';
      document.getElementById('pkHand').textContent='';
      renderPK();
      document.getElementById('pkActions').innerHTML=`<button class="btn btn-gold" onclick="pkDraw()">🔄 CAMBIAR Y REVELAR</button>`;
    }
  }

  function pkDraw(){
    pkHand=pkHand.map((c,i)=>pkHeld[i]?c:pkDeck.pop());
    pkHeld=[false,false,false,false,false];pkPhase='idle';renderPK();
    const res=evalPK(pkHand);
    document.getElementById('pkHand').textContent=res.n||'Sin premio esta mano';
    document.getElementById('pkPhase').textContent='Resultado';
    if(res.m>0){
      const win=pkBet*res.m;setGC(GC+win);
      if(win>bestWin){bestWin=win;document.getElementById('sBest').textContent='$'+fmt(bestWin);}
      toast('✨ '+res.n+' → +$'+fmt(win));
    } else toast('😔 Sin premio');
    plays++;document.getElementById('sPlays').textContent=plays;
    document.getElementById('pkActions').innerHTML=`<button class="btn btn-gold" onclick="pkDeal()">🃏 NUEVA MANO</button>`;
  }

  // =============================================
  // DADOS
  // =============================================
  const DFACES=['⚀','⚁','⚂','⚃','⚄','⚅'];
  let diceBType=null,diceBetAmt=10,diceRolling=false;

  function selDice(el,type){document.querySelectorAll('.dbb').forEach(b=>b.classList.remove('on'));el.classList.add('on');diceBType=type;}
  function adjDice(d){const i=BETS.indexOf(diceBetAmt);diceBetAmt=BETS[Math.max(0,Math.min(BETS.length-1,i+d))];document.getElementById('diceBet').textContent='$'+diceBetAmt;}

  async function rollDice(){
    if(diceRolling)return;
    if(!diceBType){toast('⚠️ Elegí un tipo de apuesta','e');return;}
    if(GC<diceBetAmt){toast('⚠️ Créditos insuficientes','e');return;}
    diceRolling=true;document.getElementById('diceRollBtn').disabled=true;
    setGC(GC-diceBetAmt);
    const d1=document.getElementById('die1'),d2=document.getElementById('die2');
    d1.classList.add('rolling');d2.classList.add('rolling');
    for(let i=0;i<22;i++){await delay(55+i*3);d1.textContent=DFACES[Math.floor(Math.random()*6)];d2.textContent=DFACES[Math.floor(Math.random()*6)];}
    d1.classList.remove('rolling');d2.classList.remove('rolling');
    const v1=Math.floor(Math.random()*6)+1,v2=Math.floor(Math.random()*6)+1;
    d1.textContent=DFACES[v1-1];d2.textContent=DFACES[v2-1];
    const total=v1+v2;
    document.getElementById('diceTotal').textContent=total;
    let won=false,mult=0;
    if(diceBType==='high'&&total>=8&&total<=12){won=true;mult=1;}
    else if(diceBType==='low'&&total>=2&&total<=6){won=true;mult=1;}
    else if(diceBType==='seven'&&total===7){won=true;mult=4;}
    else if(diceBType==='even'&&total%2===0){won=true;mult=1;}
    else if(diceBType==='odd'&&total%2===1){won=true;mult=1;}
    else if(diceBType==='double'&&v1===v2){won=true;mult=5;}
    const msg=document.getElementById('diceMsg');
    if(won){
      const win=diceBetAmt*(mult+1);setGC(GC+win);
      msg.className='dicemsg w';msg.textContent='🎲 ¡'+total+'! Ganaste $'+fmt(win-diceBetAmt);
      toast('🎲 ¡'+total+'! +$'+fmt(win-diceBetAmt));
      if(win-diceBetAmt>bestWin){bestWin=win-diceBetAmt;document.getElementById('sBest').textContent='$'+fmt(bestWin);}
    } else {
      msg.className='dicemsg l';msg.textContent='Salió '+total+'. Sin suerte esta vez';
      toast('😔 Salió '+total+'.');
    }
    plays++;document.getElementById('sPlays').textContent=plays;
    diceRolling=false;document.getElementById('diceRollBtn').disabled=false;
  }

  // =============================================
  // BACCARAT
  // =============================================
  let baccSide=null,baccAmt=10,baccBusy=false;

  function baccCval(r){if(r==='A')return 1;if(['J','Q','K','10'].includes(r))return 0;return parseInt(r);}
  function baccHval(h){return h.reduce((s,c)=>s+baccCval(c.r),0)%10;}

  function selBacc(el,side){document.querySelectorAll('.baccbb').forEach(b=>b.classList.remove('on'));el.classList.add('on');baccSide=side;}
  function adjBacc(d){const i=BETS.indexOf(baccAmt);baccAmt=BETS[Math.max(0,Math.min(BETS.length-1,i+d))];document.getElementById('baccBet').textContent='$'+baccAmt;}

  function mkBaccCard(c){
    const d=document.createElement('div');
    d.className='bacccard '+(c.red?'r':'b');
    d.innerHTML=`<div>${c.r}</div><div style="text-align:center;font-size:18px">${c.s}</div><div style="transform:rotate(180deg)">${c.r}</div>`;
    return d;
  }

  async function baccDeal(){
    if(baccBusy)return;
    if(!baccSide){toast('⚠️ Elegí Jugador, Banca o Empate','e');return;}
    if(GC<baccAmt){toast('⚠️ Créditos insuficientes','e');return;}
    baccBusy=true;document.getElementById('baccDealBtn').disabled=true;
    setGC(GC-baccAmt);
    const deck=shuffle(mkDeck());
    let player=[deck.pop(),deck.pop()],banker=[deck.pop(),deck.pop()];
    const pc=document.getElementById('baccPlayer'),bc=document.getElementById('baccBanker');
    pc.innerHTML='';bc.innerHTML='';
    document.getElementById('baccPS').textContent='0';
    document.getElementById('baccBS').textContent='0';
    document.getElementById('baccST').textContent='Repartiendo...';
    document.getElementById('baccST').className='baccstatus';

    for(const c of player){await delay(350);pc.appendChild(mkBaccCard(c));}
    for(const c of banker){await delay(350);bc.appendChild(mkBaccCard(c));}

    let pv=baccHval(player),bv=baccHval(banker);
    document.getElementById('baccPS').textContent=pv;document.getElementById('baccBS').textContent=bv;

    // Third card
    if(pv<=5){await delay(500);player.push(deck.pop());pc.appendChild(mkBaccCard(player[2]));pv=baccHval(player);document.getElementById('baccPS').textContent=pv;}
    if(bv<=5){await delay(500);banker.push(deck.pop());bc.appendChild(mkBaccCard(banker[2]));bv=baccHval(banker);document.getElementById('baccBS').textContent=bv;}

    await delay(500);
    const st=document.getElementById('baccST');
    let ret=0;
    if(pv>bv){
      st.textContent='Jugador gana ('+pv+' vs '+bv+')';
      if(baccSide==='player'){ret=baccAmt*2;st.className='baccstatus w';}
      else st.className='baccstatus l';
    } else if(bv>pv){
      st.textContent='Banca gana ('+bv+' vs '+pv+')';
      if(baccSide==='banker'){ret=Math.floor(baccAmt*1.95+baccAmt);st.className='baccstatus w';}
      else st.className='baccstatus l';
    } else {
      st.textContent='¡Empate! ('+pv+' — '+bv+')';
      if(baccSide==='tie'){ret=baccAmt*9;st.className='baccstatus t';}
      else{ret=baccAmt;st.className='baccstatus p';}
    }
    setGC(GC+ret);
    plays++;document.getElementById('sPlays').textContent=plays;
    const prof=ret-baccAmt;
    if(prof>0){if(prof>bestWin){bestWin=prof;document.getElementById('sBest').textContent='$'+fmt(bestWin);}toast('🐉 ¡+$'+fmt(prof)+'!');}
    else if(ret===baccAmt)toast('🤝 Empate — Apuesta devuelta');
    else toast('😔 Sin suerte esta vez');
    baccBusy=false;document.getElementById('baccDealBtn').disabled=false;
  }

  // =============================================
  // PLAYERS FEED
  // =============================================
  const PNAMES=['Carlos M.','María G.','Lucas P.','Sofía R.','Diego F.','Ana L.','Pablo T.','Valeria S.','Martín C.','Laura V.'];
  const PGAMES=['Slots','Ruleta','Blackjack','Video Póker','Dados','Baccarat'];
  function renderPlayers(){
    const el=document.getElementById('players');
    const sh=[...PNAMES].sort(()=>Math.random()-.5).slice(0,5);
    el.innerHTML=sh.map(n=>`<div style="display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid var(--bd);font-size:11px"><span style="width:7px;height:7px;border-radius:50%;background:var(--grn);flex-shrink:0;animation:blink 2s infinite"></span><span style="color:var(--txs);flex:1">${n}</span><span style="color:var(--txm)">${PGAMES[Math.floor(Math.random()*PGAMES.length)]}</span></div>`).join('');
  }
  renderPlayers();setInterval(renderPlayers,7000);


  // Promo timer
  let ph=5,pm=59;
  setInterval(()=>{pm--;if(pm<0){pm=59;ph=Math.max(0,ph-1);}},1000);

  // =============================================
  // =============================================
  const MENU=[
    {cat:'entrada',ico:'🥗',name:'Ensalada César Premium',desc:'Lechuga romana, pollo grillado, crutones artesanales y aderezo especial de la casa',price:'$3.200',badge:''},
    {cat:'entrada',ico:'🍤',name:'Langostinos Salteados',desc:'Con manteca de ajo, limón y hierbas frescas. Servido con pan tostado artesanal',price:'$5.800',badge:'hot'},
    {cat:'entrada',ico:'🧀',name:'Tabla de Quesos y Fiambres',desc:'Brie, gorgonzola, manchego, jamón crudo, salami y pan casero artesanal',price:'$4.500',badge:''},
    {cat:'entrada',ico:'🍢',name:'Brochetas de Verduras',desc:'Pimientos, zucchini, cebolla morada y tomates cherry al horno con aceite de oliva',price:'$2.800',badge:'new'},
    {cat:'entrada',ico:'🦐',name:'Ceviche de Langostinos',desc:'Marinado en limón, cilantro, ají amarillo y cebolla morada con tostadas crujientes',price:'$6.200',badge:'vip'},
    {cat:'principal',ico:'🥩',name:'Bife de Chorizo 400g',desc:'Corte seleccionado, punto a elección, con guarnición de papas rústicas y chimichurri',price:'$8.500',badge:'hot'},
    {cat:'principal',ico:'🐟',name:'Salmón a la Plancha',desc:'Con risotto cremoso de limón, espárragos salteados y salsa de alcaparras',price:'$7.200',badge:''},
    {cat:'principal',ico:'🍝',name:'Pasta Bulevard',desc:'Fetuccine casero con crema, salmón ahumado, alcaparras y eneldo fresco',price:'$5.400',badge:'new'},
    {cat:'principal',ico:'🍗',name:'Pollo a la Mostaza',desc:'Suprema de pollo con salsa Dijon, papas rústicas y vegetales salteados con hierbas',price:'$4.800',badge:''},
    {cat:'principal',ico:'🥦',name:'Risotto de Hongos',desc:'Hongos de temporada, parmesano rallado, manteca y vino blanco. Opción vegetariana',price:'$4.200',badge:'new'},
    {cat:'postre',ico:'🍮',name:'Crème Brûlée',desc:'Clásico francés con vainilla de Madagascar, caramelo crocante y frutos rojos',price:'$2.200',badge:''},
    {cat:'postre',ico:'🍫',name:'Fondant de Chocolate',desc:'Corazón líquido 70% cacao, servido con helado de vainilla artesanal y salsa de frambuesa',price:'$2.600',badge:'hot'},
    {cat:'postre',ico:'🍰',name:'Cheesecake de Frutos Rojos',desc:'Base de galletita, crema suave de queso y coulis de frutos rojos del bosque',price:'$2.400',badge:'new'},
    {cat:'postre',ico:'🍨',name:'Helados Artesanales',desc:'3 bochas a elección entre 12 sabores. Producción propia con ingredientes naturales',price:'$1.800',badge:''},
    {cat:'bebida',ico:'🍷',name:'Copa de Vino Selección',desc:'Tintos y blancos de bodegas premium de Mendoza, San Juan y La Rioja',price:'$1.800',badge:''},
    {cat:'bebida',ico:'🍸',name:'Cóctel Bulevard',desc:'Preparación exclusiva con gin artesanal, maracuyá, jengibre y espuma de lima',price:'$2.500',badge:'hot'},
    {cat:'bebida',ico:'🥃',name:'Whisky Premium',desc:'Single malt seleccionado, servido con hielo artesanal tallado, en las rocas o puro',price:'$3.800',badge:'vip'},
    {cat:'bebida',ico:'☕',name:'Café de Especialidad',desc:'Granos de origen único, preparación en V60, aeropress o espresso doble',price:'$900',badge:'new'},
    {cat:'bebida',ico:'🍾',name:'Botella de Champagne',desc:'Brut Imperial. Ideal para celebrar tus grandes victorias de la noche',price:'$18.000',badge:'vip'},
    {cat:'snack',ico:'🍟',name:'Papas Fritas Casino',desc:'Extra crujientes, con sal marina gruesa y aderezo secreto de la casa',price:'$1.500',badge:'hot'},
    {cat:'snack',ico:'🥪',name:'Mini Sándwiches VIP',desc:'Bandeja de 6 minisándwiches: lomito, caprese y roast beef con mostaza antigua',price:'$2.800',badge:''},
    {cat:'snack',ico:'🫒',name:'Mix VIP de Frutos Secos',desc:'Aceitunas marinadas, maní japonés, almendras tostadas y castañas de cajú',price:'$1.200',badge:''},
  ];

  let gastroFilter='all';
  let orderCount=0;

  function renderGastro(){
    const grid=document.getElementById('gastroGrid');
    const items=gastroFilter==='all'?MENU:MENU.filter(i=>i.cat===gastroFilter);
    const catClass={entrada:'gc-entrada',principal:'gc-principal',postre:'gc-postre',bebida:'gc-bebida',snack:'gc-snack'};
    grid.innerHTML=items.map(it=>`
      <div class="gastro-card ${catClass[it.cat]||''}" onclick="addOrder('${it.name.replace(/'/g,'')}')">
        <div class="gastro-card-banner">${it.ico}</div>
        <div class="gastro-info">
          ${it.badge==='hot'?'<div class="gastro-badge gb-hot">🔥 Más pedido</div>':it.badge==='new'?'<div class="gastro-badge gb-new">✨ Nuevo</div>':it.badge==='vip'?'<div class="gastro-badge gb-vip">👑 VIP</div>':''}
          <div class="gastro-name">${it.name}</div>
          <div class="gastro-desc">${it.desc}</div>
          <div class="gastro-footer">
            <div class="gastro-price">${it.price}</div>
            <button class="gastro-add" onclick="event.stopPropagation();addOrder('${it.name.replace(/'/g,'')}')">+</button>
          </div>
        </div>
      </div>`).join('');
  }

  function addOrder(name){
    orderCount++;
    const el=document.getElementById('orderCount');
    if(el)el.textContent=orderCount;
    toast('🍽️ '+name+' — agregado al pedido');
  }

  document.getElementById('gastroCats').addEventListener('click',e=>{
    const btn=e.target.closest('.gcat');
    if(!btn)return;
    document.querySelectorAll('.gcat').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
    gastroFilter=btn.dataset.cat;
    renderGastro();
  });

  renderGastro();

  // Tournament countdown
  let tSecs=2*3600+47*60+30;
  setInterval(()=>{
    tSecs--;if(tSecs<0)tSecs=0;
    const h=Math.floor(tSecs/3600),m=Math.floor((tSecs%3600)/60),s=tSecs%60;
    const th=document.getElementById('th'),tm=document.getElementById('tm'),ts=document.getElementById('ts');
    if(th)th.textContent=String(h).padStart(2,'0');
    if(tm)tm.textContent=String(m).padStart(2,'0');
    if(ts)ts.textContent=String(s).padStart(2,'0');
  },1000);

  // Jackpot live update
  let jpGrand=50000;
  setInterval(()=>{
    jpGrand+=Math.floor(Math.random()*80+20);
    const el=document.getElementById('tk1');
    if(el)el.textContent='$'+jpGrand.toLocaleString('es-AR');
  },3000);

  // Welcome close
  function closeWelcome(){
    const ov=document.getElementById('welcomeOverlay');
    if(ov){ov.style.animation='fadeOutOverlay .5s ease forwards';setTimeout(()=>ov.style.display='none',550);}
  }
  setTimeout(closeWelcome,6000);

  // =============================================
  // DEPÓSITO RÁPIDO
  // =============================================
  let selectedPM=null;
  let depAmount=0;

  function openDepModal(amount){
    const ov=document.getElementById('depOverlay');
    ov.classList.add('on');
    if(amount){
      setDepAmount(amount);
    } else {
      document.getElementById('depAmountInput').value='';
      document.querySelectorAll('.dep-qa').forEach(q=>q.classList.remove('on'));
      depAmount=0;
      updateDepBtn();
    }
  }

  function closeDepModal(){
    document.getElementById('depOverlay').classList.remove('on');
  }

  function closeDep(e){
    if(e.target===document.getElementById('depOverlay'))closeDepModal();
  }

  function setDepAmount(amt){
    depAmount=amt;
    document.getElementById('depAmountInput').value=amt;
    document.querySelectorAll('.dep-qa').forEach(q=>{
      q.classList.toggle('on',parseInt(q.textContent.replace(/\D/g,''))===amt);
    });
    updateDepBtn();
  }

  function onDepInput(){
    const val=parseInt(document.getElementById('depAmountInput').value)||0;
    depAmount=val;
    document.querySelectorAll('.dep-qa').forEach(q=>{
      q.classList.toggle('on',parseInt(q.textContent.replace(/\D/g,''))===val);
    });
    updateDepBtn();
  }

  function selectPM(pm){
    if(selectedPM===pm){
      // toggle off
      document.getElementById('pm-'+pm).classList.remove('on');
      const f=document.getElementById('form-'+pm);
      if(f)f.classList.remove('open');
      selectedPM=null;
      updateDepBtn();
      return;
    }
    // close previous
    if(selectedPM){
      const prevEl=document.getElementById('pm-'+selectedPM);
      if(prevEl)prevEl.classList.remove('on');
      const prevF=document.getElementById('form-'+selectedPM);
      if(prevF)prevF.classList.remove('open');
    }
    selectedPM=pm;
    const el=document.getElementById('pm-'+pm);
    if(el)el.classList.add('on');
    const fm=document.getElementById('form-'+pm);
    if(fm){fm.classList.add('open');fm.scrollIntoView({behavior:'smooth',block:'nearest'});}
    updateDepBtn();
  }

  function fmtCard(inp){
    let v=inp.value.replace(/\D/g,'').substring(0,16);
    inp.value=v.replace(/(.{4})/g,'$1 ').trim();
  }
  function fmtExp(inp){
    let v=inp.value.replace(/\D/g,'');
    if(v.length>=3)v=v.substring(0,2)+'/'+v.substring(2,4);
    inp.value=v;
  }

  function validatePMForm(){
    if(!selectedPM)return true; // no form open, skip
    const pm=selectedPM;
    let ok=true;
    function chk(id,errId,test){
      const el=document.getElementById(id+'-'+pm);
      const er=document.getElementById(errId+'-'+pm);
      if(!el)return;
      const valid=test(el.value.trim());
      el.classList.toggle('err',!valid);
      if(er)er.classList.toggle('show',!valid);
      if(!valid)ok=false;
    }
    chk('f-card','err-card',v=>v.replace(/\s/g,'').length===16);
    chk('f-dni','err-dni',v=>/^\d{7,8}$/.test(v));
    chk('f-name','err-name',v=>v.length>2);
    chk('f-exp','err-exp',v=>/^\d{2}\/\d{2}$/.test(v));
    chk('f-cvv','err-cvv',v=>/^\d{3}$/.test(v));
    chk('f-email','err-email',v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    chk('f-phone','err-phone',v=>v.replace(/\D/g,'').length>=8);
    chk('f-addr','err-addr',v=>v.length>4);
    chk('f-cp','err-cp',v=>v.length>=4);
    return ok;
  }

  function updateDepBtn(){
    const btn=document.getElementById('depConfirmBtn');
    btn.disabled=depAmount<3000;
    if(depAmount>0&&depAmount<3000){
      btn.textContent='Mínimo $3.000';
    } else if(depAmount>=3000){
      btn.textContent='Confirmar $'+depAmount.toLocaleString('es-AR');
    } else {
      btn.textContent='Confirmar Depósito';
    }
  }

  function confirmDeposit(){
    if(depAmount<3000)return;
    if(!validatePMForm())return;
    const pmNames={'naranjax':'NaranjaX','mercadopago':'Mercado Pago','galicia':'Banco Galicia','macro':'Banco Macro','bna':'Banco Nación','bbva':'BBVA Argentina','santander':'Santander','brubank':'Brubank','personal-pay':'Personal Pay','ualá':'Ualá'};
    const pmName=pmNames[selectedPM]||selectedPM;
    closeDepModal();
    // Add to credits
    const crEl=document.getElementById('gcr');
    if(crEl){
      const current=parseInt(crEl.textContent.replace(/\D/g,''))||0;
      const newVal=current+depAmount;
      crEl.textContent=newVal.toLocaleString('es-AR');
    }
    toast('✅ ¡Depósito exitoso! +$'+depAmount.toLocaleString('es-AR')+' via '+pmName);
  }
