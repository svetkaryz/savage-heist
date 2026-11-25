(() => {
  const map = [
    '##########',
    '#....#...#',
    '#.#..#.#.#',
    '#.#......#',
    '#...##...#',
    '#.#......#',
    '#...#....#',
    '##########'
  ];
  const W = 10, H = 8, start = {x:1,y:6}, lootAt = {x:8,y:1};
  const patrol = [{x:6,y:3},{x:7,y:3},{x:8,y:3},{x:8,y:4},{x:7,y:4},{x:6,y:4}];
  const landmarks=[{x:3,y:2,symbol:'≋',name:'steam pipe'},{x:2,y:4,symbol:'▦',name:'freezer rack'},{x:7,y:6,symbol:'▤',name:'cargo crate'}];
  const $ = (id) => document.getElementById(id);
  const board = $('board');
  const bestScoreKey='savageHeistBestScore';
  let savedBest=0;try{savedBest=Number(localStorage.getItem(bestScoreKey))||0}catch{}
  const state = {player:{...start}, guard:{...patrol[0]}, patrolIndex:0, returningToPatrol:false, turn:1, heat:0, hasLoot:false, decoys:2, selectedTool:false, decoy:null, decoyTurns:0, done:false, log:[],bestScore:savedBest};
  const posKey = (x,y) => `${x},${y}`;
  const isWall = (x,y) => x<0 || y<0 || x>=W || y>=H || map[y][x] === '#';
  const same = (a,b) => a.x===b.x && a.y===b.y;
  const personMarkup=(type)=>`<span class="person ${type}-person" aria-hidden="true"><i class="cap"></i><i class="face"></i><i class="neck"></i><i class="body"><b class="badge"></b></i><i class="arm left"></i><i class="arm right"></i><i class="belt"></i><i class="leg left"></i><i class="leg right"></i></span>`;
  const manhattan = (a,b) => Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
  function addLog(message){state.log.unshift(message);state.log=state.log.slice(0,3);$('log').innerHTML=state.log.map((line,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span> &nbsp;${line}</li>`).join('');$('log-index').textContent=String(state.turn).padStart(2,'0')}
  function tileVisibleToGuard(){
    const g=state.guard,p=state.player;
    if(g.x===p.x){const step=Math.sign(p.y-g.y);for(let y=g.y+step;y!==p.y;y+=step)if(isWall(g.x,y))return false;return Math.abs(g.y-p.y)<=3}
    if(g.y===p.y){const step=Math.sign(p.x-g.x);for(let x=g.x+step;x!==p.x;x+=step)if(isWall(x,g.y))return false;return Math.abs(g.x-p.x)<=3}
    return false;
  }
  function sightTilesFrom(guard){const cells=new Set();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])for(let n=1;n<=3;n++){const x=guard.x+dx*n,y=guard.y+dy*n;if(isWall(x,y))break;cells.add(posKey(x,y))}return cells}
  function reachableWithin(from,maxSteps){const found=new Map([[posKey(from.x,from.y),0]]),queue=[{x:from.x,y:from.y,steps:0}];while(queue.length){const node=queue.shift();if(node.steps>=maxSteps)continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=node.x+dx,y=node.y+dy,key=posKey(x,y);if(isWall(x,y)||found.has(key))continue;found.set(key,node.steps+1);queue.push({x,y,steps:node.steps+1})}}return found}
  function pathStep(from,to){
    const queue=[{...from,first:null}],seen=new Set([posKey(from.x,from.y)]),dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    while(queue.length){const node=queue.shift();if(same(node,to))return node.first;for(const [dx,dy] of dirs){const x=node.x+dx,y=node.y+dy,k=posKey(x,y);if(isWall(x,y)||seen.has(k))continue;seen.add(k);queue.push({x,y,first:node.first||{x,y}})}}return null;
  }
  function moveGuard(){
    if(state.decoyTurns>0&&state.decoy){const step=pathStep(state.guard,state.decoy);if(step)state.guard=step;state.decoyTurns--;if(state.decoyTurns===0)state.decoy=null;return}
    if(state.heat>=25){state.returningToPatrol=true;const step=pathStep(state.guard,state.player);if(step)state.guard=step;return}
    if(state.returningToPatrol){const routePoint=patrol[state.patrolIndex];if(same(state.guard,routePoint)){state.returningToPatrol=false}else{const step=pathStep(state.guard,routePoint);if(step)state.guard=step;if(same(state.guard,routePoint))state.returningToPatrol=false;return}}
    state.patrolIndex=(state.patrolIndex+1)%patrol.length;state.guard={...patrol[state.patrolIndex]};
  }
  function finish(outcome){state.done=true;state.selectedTool=false;$('decoy-button').classList.remove('selected');$('overlay').hidden=false;const won=outcome==='won';$('overlay-stamp').textContent=won?'JOB COMPLETE':'CREW LOST';$('overlay-title').textContent=won?(state.heat<25?'Clean getaway.':'You got out. Barely.'):'The job went bad.';$('overlay-copy').textContent=won?'The ledger is yours. The city hasn’t heard a thing.':'The patrol closed in before you could make the exit.';if(won){const score=Math.max(100,1000-state.heat*5-state.turn*7),isNew=score>state.bestScore;state.bestScore=Math.max(score,state.bestScore);try{localStorage.setItem(bestScoreKey,String(state.bestScore))}catch{}$('best-score').textContent=String(state.bestScore);$('overlay-score').textContent=`RUN SCORE ${score}  /  BEST ${state.bestScore}${isNew?'  /  NEW BEST':''}`}else $('overlay-score').textContent='ROOK DIDN’T MAKE IT BACK';$('restart-overlay').focus()}
  function updateHeat(delta){state.heat=Math.max(0,Math.min(100,state.heat+delta));if(state.heat>=65)$('noise-state').textContent='LOUD';else if(state.heat>=25)$('noise-state').textContent='RISING';else $('noise-state').textContent='LOW';$('alert-text').innerHTML=`${state.heat}% <i>· ${state.heat>=65?'CRITICAL':state.heat>=25?'SUSPICIOUS':'QUIET'}</i>`;$('alert-fill').style.width=`${state.heat}%`;$('alert-fill').className=`alert-fill${state.heat>=65?' hot':state.heat>=25?' warm':''}`}
  function playerTurn(action){
    if(state.done)return;
    if(action==='move'&&tileVisibleToGuard()){updateHeat(28);addLog('Patrol spots movement. Heat is up.')}else if(state.heat>0&&!tileVisibleToGuard())updateHeat(-7);
    moveGuard();
    if(tileVisibleToGuard()){updateHeat(20);addLog('Guard has a line on you. Keep moving.')}else if(state.heat===0&&action==='move')addLog('You move through the cold aisle.');
    state.turn++;
    if(same(state.guard,state.player)||manhattan(state.guard,state.player)===1&&state.heat>=45){finish('lost');return}
    if(state.heat>=100){finish('lost');return}
    if(same(state.player,lootAt)&&!state.hasLoot){state.hasLoot=true;addLog('Ledger secured. Now get back to the exit.');$('objective-check-1').textContent='✓';$('objective-check-1').classList.add('done')}
    if(state.hasLoot&&same(state.player,start)){addLog('Extraction confirmed. Rook is out.');$('objective-check-2').textContent='✓';$('objective-check-2').classList.add('done');finish('won');return}
    render();
  }
  function moveTo(x,y){if(state.done||isWall(x,y)||manhattan(state.player,{x,y})!==1)return;if(state.selectedTool)return;state.player={x,y};playerTurn('move')}
  function useDecoy(x,y){if(state.done||!state.selectedTool)return;const reachable=reachableWithin(state.player,4);if(isWall(x,y)||!reachable.has(posKey(x,y))||same(state.player,{x,y})||same(state.guard,{x,y})){addLog('Choose open floor within four moves, away from the guard.');return}state.decoys--;state.decoy={x,y};state.decoyTurns=3;state.returningToPatrol=true;state.selectedTool=false;$('decoy-button').classList.remove('selected');$('tool-hint').textContent=state.decoys?`Decoys left: ${state.decoys}. Choose reachable open floor away from the guard.`:'No decoys left.';addLog('Decoy thrown. Patrol is checking the noise.');playerTurn('decoy')}
  function render(){
    board.innerHTML='';const sight=sightTilesFrom(state.guard),reachable=state.selectedTool?reachableWithin(state.player,4):new Map();
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const landmark=landmarks.find(item=>item.x===x&&item.y===y);const tile=document.createElement('button');tile.type='button';tile.className='tile '+(isWall(x,y)?'wall':'floor');tile.setAttribute('role','gridcell');if(landmark){tile.classList.add('prop');tile.dataset.prop=landmark.symbol}tile.setAttribute('aria-label',isWall(x,y)?'Wall':`${same(state.player,{x,y})?'Rook, ':same(state.guard,{x,y})?'Guard, ':x===lootAt.x&&y===lootAt.y&&!state.hasLoot?'Ledger, ':x===start.x&&y===start.y?'Exit, ':''}floor tile${landmark?', beside '+landmark.name:''}, row ${y+1}, column ${x+1}${sight.has(posKey(x,y))?', in guard sight':''}`);
      if(x===start.x&&y===start.y)tile.classList.add('exit');
      if(x===lootAt.x&&y===lootAt.y&&!state.hasLoot)tile.classList.add('loot');
      if(state.decoy&&x===state.decoy.x&&y===state.decoy.y)tile.classList.add('decoy');
      if(same(state.guard,{x,y})){tile.classList.add('guard');tile.insertAdjacentHTML('beforeend',personMarkup('guard'))}
      if(same(state.player,{x,y})){tile.classList.add('player');tile.insertAdjacentHTML('beforeend',personMarkup('rook'))}
      if(tileVisibleToGuard()&&same(state.player,{x,y}))tile.classList.add('spotted');
      if(sight.has(posKey(x,y))&&!isWall(x,y))tile.classList.add('in-sight');
      if(state.selectedTool&&reachable.has(posKey(x,y)))tile.classList.add('reachable');
      tile.addEventListener('click',()=>state.selectedTool?useDecoy(x,y):moveTo(x,y));board.appendChild(tile);
    }
    $('turn-count').textContent=String(state.turn).padStart(2,'0');$('decoy-count').textContent=`${state.decoys}×`;$('decoy-button').disabled=state.decoys<=0||state.done;$('decoy-button').setAttribute('aria-pressed',String(state.selectedTool));$('best-score').textContent=state.bestScore?String(state.bestScore):'—';
    $('status-text').textContent=state.hasLoot?'Ledger secured. Double back to the green extraction tile.':state.selectedTool?'Pick a lit floor tile. The guard moves after you throw.':'Stay out of the patrol’s sight. Take the ledger, then double back.';
    $('status-icon').textContent=state.hasLoot?'↩':'!';
  }
  function restart(){state.player={...start};state.guard={...patrol[0]};state.patrolIndex=0;state.returningToPatrol=false;state.turn=1;state.heat=0;state.hasLoot=false;state.decoys=2;state.selectedTool=false;state.decoy=null;state.decoyTurns=0;state.done=false;state.log=[];$('objective-check-1').textContent='○';$('objective-check-2').textContent='○';$('objective-check-1').classList.remove('done');$('objective-check-2').classList.remove('done');$('overlay').hidden=true;$('noise-state').textContent='LOW';$('tool-hint').textContent='Select, then choose a reachable floor tile within 4 moves.';updateHeat(0);addLog('Rook is inside. Patrol is walking its loop.');render()}
  const intro=$('intro');let introClosed=false;function closeIntro(){if(introClosed)return;introClosed=true;document.querySelectorAll('header,main,footer').forEach(el=>el.inert=false);intro.classList.add('closing');window.setTimeout(()=>intro.remove(),280)}
  if(intro&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.querySelectorAll('header,main,footer').forEach(el=>el.inert=true);$('start-heist').addEventListener('click',closeIntro);$('start-heist').focus()}
  else if(intro)closeIntro();
  document.addEventListener('keydown',e=>{if(!introClosed){if(e.key==='Enter'||e.key===' '){e.preventDefault();closeIntro()}return}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='Escape'){if(state.selectedTool){state.selectedTool=false;$('decoy-button').classList.remove('selected');render()}return}const dirs={w:[0,-1],ArrowUp:[0,-1],s:[0,1],ArrowDown:[0,1],a:[-1,0],ArrowLeft:[-1,0],d:[1,0],ArrowRight:[1,0]};const dir=dirs[e.key];if(dir&&!state.selectedTool){moveTo(state.player.x+dir[0],state.player.y+dir[1])}});
  $('decoy-button').addEventListener('click',()=>{if(state.done||state.decoys<=0)return;state.selectedTool=!state.selectedTool;$('decoy-button').classList.toggle('selected',state.selectedTool);$('tool-hint').textContent=state.selectedTool?'Choose a lit floor tile within four steps. Esc cancels.':'Select, then click a floor tile within 4 steps.';render()});
  $('restart-top').addEventListener('click',restart);$('restart-overlay').addEventListener('click',restart);
  addLog('Rook is inside. Patrol is walking its loop.');updateHeat(0);render();
})();
