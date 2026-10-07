const $ = id => document.getElementById(id);
const logs = $('logs');
let incidentRunning = false;
let telemetryTimer;
let clockTimer;
let chartTimer;
let selectedScenario = 'overload';
let demoRunning = false;
let telemetry = {cpu:42, mem:51, net:38, storage:64};
let chartData = Array.from({length:42}, (_,i)=>42 + Math.sin(i/3)*3 + (Math.random()*4-2));

const scenarios = {
  overload: { title:'SERVER OVERLOAD', node:'SERVER-02', root:'Application resource saturation', action:'Automated resource optimization', cpu:97, mem:89, net:83, storage:64, downtime:'14 min', loss:'$1,240', energy:'18%', response:'08.4s', detect:'03.1s', green:'18% estimated resource optimization after remediation.', analysis:'Baseline deviation +41.7% · resource saturation correlated across CPU and memory.' },
  network: { title:'NETWORK ANOMALY', node:'AWS-PROD', root:'Traffic pattern outside expected baseline', action:'Traffic rebalancing + service validation', cpu:68, mem:63, net:96, storage:64, downtime:'9 min', loss:'$860', energy:'12%', response:'06.8s', detect:'02.4s', green:'12% estimated resource optimization after remediation.', analysis:'Traffic deviation +58.2% · packet flow pattern differs from established baseline.' },
  storage: { title:'STORAGE ALERT', node:'DATABASE', root:'Storage threshold approaching critical level', action:'Storage cleanup + capacity rebalancing', cpu:61, mem:57, net:44, storage:94, downtime:'11 min', loss:'$1,020', energy:'15%', response:'07.2s', detect:'02.8s', green:'15% estimated resource optimization after remediation.', analysis:'Capacity threshold +18.4% · storage growth rate exceeds expected operating range.' }
};

const pad=n=>String(n).padStart(2,'0');
function now(){const d=new Date();return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}
function addLog(message,tag='SYS',type=''){const el=document.createElement('div');el.className=`log ${type}`;el.innerHTML=`<span class="time">${now()}</span><span class="tag">[${tag}]</span> ${message}`;logs.appendChild(el);while(logs.children.length>16)logs.removeChild(logs.firstChild);logs.scrollTop=logs.scrollHeight}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function setMetric(id,value){const v=Math.round(value); $(id).textContent=v+'%'; const bar=$(id.replace('Value','Bar')); if(bar)bar.style.width=v+'%'}
function setStep(n){document.querySelectorAll('.agent-steps span').forEach((el,i)=>el.classList.toggle('active',i===n-1))}
function updateAnalysis(title, text){$('agentAnalysis').innerHTML=`<span>${title}</span><b>${text}</b>`}
function setNormal(){
 document.body.classList.remove('incident'); incidentRunning=false;
 $('systemStatus').textContent='OPERATIONAL';$('systemStatus').className='good';$('systemStatus').style.color='';
 $('agentStatus').textContent='ACTIVE';$('agentStatus').className='good';$('agentStatus').style.color='';$('agentSub').textContent='Continuous monitoring';
 $('telemetryState').textContent='NORMAL';$('telemetryState').className='panel-state good';$('telemetryState').style.color='';
 $('agentBadge').textContent='● MONITORING';$('agentBadge').style.color='';
 $('agentMessage').innerHTML='Monitoring infrastructure...<br><span>All systems within expected parameters.</span>';$('agentProgress').style.width='100%';setStep(1);updateAnalysis('BASELINE','Within expected parameters');
 $('downtime').textContent='0 min';$('loss').textContent='$0';$('energy').textContent='0%';$('response').textContent='—';$('greenText').textContent='Optimización de recursos sin incidente activo.';
 $('reportStatus').textContent='SYSTEM OPERATIONAL';$('reportStatus').style.color='';$('rootCause').textContent='No anomaly';$('action').textContent='Continuous monitoring';$('detection').textContent='—';$('incidentId').textContent='IG-DEMO-000';$('nodeCount').textContent='4 / 4 online';$('explainBox').hidden=true;
 document.querySelectorAll('.server-node').forEach(n=>{n.classList.remove('alert','recovered');n.querySelector('i').textContent='ONLINE'});
 telemetry={cpu:42,mem:51,net:38,storage:64}; Object.entries(telemetry).forEach(([k,v])=>setMetric(k+'Value',v));
 $('chartTrend').textContent='STABLE';$('chartTrend').className='';
}
function startTelemetry(){clearInterval(telemetryTimer);telemetryTimer=setInterval(()=>{if(incidentRunning)return; telemetry.cpu=Math.max(25,Math.min(58,telemetry.cpu+(Math.random()*6-3)));telemetry.mem=Math.max(39,Math.min(62,telemetry.mem+(Math.random()*5-2.5)));telemetry.net=Math.max(24,Math.min(55,telemetry.net+(Math.random()*7-3.5)));telemetry.storage=Math.max(58,Math.min(70,telemetry.storage+(Math.random()*2-1))); setMetric('cpuValue',telemetry.cpu);setMetric('memValue',telemetry.mem);setMetric('netValue',telemetry.net);setMetric('storageValue',telemetry.storage); chartData.push(telemetry.cpu); if(chartData.length>42)chartData.shift(); drawChart();},900)}
function selectScenario(name){selectedScenario=name;document.querySelectorAll('.scenario').forEach(b=>b.classList.toggle('active',b.dataset.scenario===name)); addLog(`Scenario selected: ${scenarios[name].title}`,'DEMO','');}

function markNode(node,state){document.querySelectorAll('.server-node').forEach(n=>n.classList.remove('alert','recovered')); if(node){node.classList.add(state); const label=node.querySelector('i'); if(label)label.textContent=state==='alert'?'CRITICAL':'ONLINE'}}
function setIncidentUI(s,node){
 document.body.classList.add('incident');$('systemStatus').textContent='ANOMALY DETECTED';$('systemStatus').className='';$('systemStatus').style.color='var(--red)';
 $('agentStatus').textContent='ANALYZING';$('agentStatus').className='';$('agentStatus').style.color='var(--yellow)';$('agentSub').textContent='Root cause analysis';$('agentBadge').textContent='● INCIDENT RESPONSE';$('agentBadge').style.color='var(--yellow)';
 $('telemetryState').textContent='DEGRADED';$('telemetryState').className='panel-state';$('telemetryState').style.color='var(--red)';$('nodeCount').textContent='3 / 4 online';markNode(node,'alert');
 setMetric('cpuValue',s.cpu);setMetric('memValue',s.mem);setMetric('netValue',s.net);setMetric('storageValue',s.storage);
 $('agentMessage').innerHTML=`Anomaly detected on ${s.node}.<br><span>Analyzing root cause...</span>`;$('agentProgress').style.width='24%';setStep(2);updateAnalysis('ANOMALY SCORE',s.analysis);$('chartTrend').textContent='DEVIATION';$('chartTrend').className='hot';
 chartData = Array.from({length:28},(_,i)=>42+i*1.9+Math.sin(i)*3); chartData.push(s.cpu); drawChart();
}

async function runScenario(opts={}){
 if(incidentRunning)return;
 incidentRunning=true; demoRunning=!!opts.demo;
 const s=scenarios[selectedScenario];
 $('incidentBtn').disabled=true;$('runScenario').disabled=true;$('demoModeBtn').disabled=true;$('resetBtn').disabled=true;$('incidentBtn').textContent='ANALIZANDO...';$('runScenario').textContent='● AI-GUARD EN EJECUCIÓN';
 const node=[...document.querySelectorAll('.server-node')].find(n=>n.textContent.includes(s.node)) || document.querySelector('.server-b');
 setIncidentUI(s,node); addLog(`Abnormal pattern detected on ${s.node}`,'ALERT','alert');
 await wait(opts.fast?650:1200);
 addLog(`Correlation engine identified: ${s.root}`,'AI','warn');$('agentMessage').innerHTML='Root cause identified.<br><span>Assessing business impact and response path.</span>';$('agentProgress').style.width='50%';setStep(3);updateAnalysis('ROOT CAUSE',s.root); await wait(opts.fast?650:1150);
 addLog(`Executing: ${s.action}`,'REMEDIATION','warn');$('agentMessage').innerHTML='Executing remediation...<br><span>Rebalancing resources and validating service health.</span>';$('agentProgress').style.width='76%';setStep(4);updateAnalysis('RESPONSE',s.action); await wait(opts.fast?750:1200);
 addLog('Service health restored — telemetry back within baseline','AI','ok');
 telemetry={cpu:41,mem:48,net:36,storage:64};Object.entries(telemetry).forEach(([k,v])=>setMetric(k+'Value',v));chartData.push(41);if(chartData.length>42)chartData.shift();drawChart();
 $('agentProgress').style.width='100%';$('agentMessage').innerHTML='Incident resolved successfully.<br><span>Infrastructure returned to expected parameters.</span>';$('systemStatus').textContent='OPERATIONAL';$('systemStatus').className='good';$('systemStatus').style.color='';$('agentStatus').textContent='ACTIVE';$('agentStatus').className='good';$('agentStatus').style.color='';$('agentSub').textContent='Continuous monitoring';$('telemetryState').textContent='RECOVERED';$('telemetryState').style.color='var(--green)';$('agentBadge').textContent='● MONITORING';$('agentBadge').style.color='';
 $('downtime').textContent=s.downtime;$('loss').textContent=s.loss;$('energy').textContent=s.energy;$('response').textContent=s.response;$('greenText').textContent=s.green;$('reportStatus').textContent='INCIDENT RESOLVED';$('reportStatus').style.color='var(--green)';$('incidentId').textContent='IG-DEMO-'+Math.floor(100+Math.random()*900);$('detection').textContent=s.detect;$('rootCause').textContent=s.root;$('action').textContent=s.action;$('nodeCount').textContent='4 / 4 online';markNode(node,'recovered');setStep(4);updateAnalysis('RECOVERY VERIFIED','Telemetry returned to expected parameters.');$('chartTrend').textContent='RECOVERED';$('chartTrend').className='recovered';
 await wait(500);incidentRunning=false;demoRunning=false;$('incidentBtn').disabled=false;$('runScenario').disabled=false;$('demoModeBtn').disabled=false;$('resetBtn').disabled=false;$('incidentBtn').innerHTML='<span>⚡</span> SIMULAR INCIDENTE';$('runScenario').textContent='▶ EJECUTAR ESCENARIO SELECCIONADO';
}

async function demoMode(){if(incidentRunning)return; demoRunning=true; selectScenario(['overload','network','storage'][Math.floor(Math.random()*3)]); addLog('Demo Mode armed — controlled scenario starting','DEMO','ok'); await wait(500); await runScenario({demo:true,fast:false});}
function reset(){clearInterval(chartTimer);demoRunning=false;setNormal();logs.innerHTML='';addLog('Command Center initialized','SYSTEM','ok');addLog('47 monitored assets synchronized','MONITOR','');addLog('AI-GUARD is watching for anomalies','AI','');chartData=Array.from({length:42},()=>42+Math.random()*4-2);drawChart();$('demoModeBtn').disabled=false;$('resetBtn').disabled=false;startTelemetry()}
function updateClock(){$('clock').textContent=now()}
function getDemoUrl(){return window.location.href.split('?')[0]}
function visitorMode(){const u=new URL(window.location.href);u.searchParams.set('visitor','1');window.open(u.toString(),'_blank','noopener')}
function applyVisitorMode(){const isVisitor=new URLSearchParams(window.location.search).get('visitor')==='1'; if(!isVisitor)return; document.body.classList.add('visitor-mode'); const eyebrow=document.querySelector('.eyebrow'); if(eyebrow) eyebrow.innerHTML='<span class="live-dot"></span> AI-GUARD / VISITOR MODE'; const title=document.querySelector('.hero h1'); if(title) title.innerHTML='Pon a prueba a <em>AI-GUARD.</em>'; const copy=document.querySelector('.hero p'); if(copy) copy.textContent='Selecciona un escenario y observa cómo InsightGuard detecta, analiza y responde ante una anomalía simulada.'; const actions=document.querySelector('.hero-actions'); if(actions) actions.style.display='none'; const qr=document.querySelector('.qr-section'); if(qr) qr.style.display='none'; const kicker=document.querySelector('.scenario-panel .section-kicker'); if(kicker) kicker.textContent='INTERACTIVE DEMO'; const run=document.getElementById('runScenario'); if(run) run.textContent='▶ EJECUTAR SIMULACIÓN'; document.querySelector('.metrics')?.scrollIntoView({behavior:'smooth',block:'start'});}

function drawChart(){const c=$('sparkline');if(!c)return;const rect=c.getBoundingClientRect();const dpr=window.devicePixelRatio||1;const w=Math.max(300,rect.width),h=Math.max(70,rect.height);c.width=w*dpr;c.height=h*dpr;const ctx=c.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(46,104,126,.28)';ctx.lineWidth=1;for(let y=10;y<h;y+=h/3){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}const min=20,max=100;ctx.beginPath();chartData.forEach((v,i)=>{const x=i*(w/(chartData.length-1));const y=h-10-((v-min)/(max-min))*(h-20);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.strokeStyle=document.body.classList.contains('incident')?'#ff6579':'#79dcff';ctx.lineWidth=2;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=8;ctx.stroke();ctx.shadowBlur=0;const last=chartData[chartData.length-1];const lx=w,ly=h-10-((last-min)/(max-min))*(h-20);ctx.fillStyle=document.body.classList.contains('incident')?'#ff6579':'#45e0a1';ctx.beginPath();ctx.arc(lx,ly,3.5,0,Math.PI*2);ctx.fill()}

$('incidentBtn').addEventListener('click',()=>runScenario());$('runScenario').addEventListener('click',()=>runScenario());$('demoModeBtn').addEventListener('click',demoMode);$('resetBtn').addEventListener('click',reset);document.querySelectorAll('.scenario').forEach(b=>b.addEventListener('click',()=>selectScenario(b.dataset.scenario)));
$('copyUrl').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(getDemoUrl());$('copyUrl').textContent='✓ ENLACE COPIADO';setTimeout(()=>$('copyUrl').textContent='COPIAR ENLACE',1600)}catch{window.prompt('Copia este enlace:',getDemoUrl())}});$('openVisitor').addEventListener('click',visitorMode);
$('explainBtn').addEventListener('click',()=>{const s=scenarios[selectedScenario];const box=$('explainBox');box.hidden=!box.hidden;box.innerHTML=`<b>AI-GUARD / EXPLANATION</b><p>La simulación representa un flujo de mantenimiento predictivo: monitoreo continuo → detección de desviación → análisis de causa → selección de respuesta → verificación de recuperación. En un entorno real, las fuentes de telemetría podrían conectarse a servidores, servicios cloud y herramientas de observabilidad.</p>`});
$('reportDemoBtn').addEventListener('click',()=>{$('report').scrollIntoView({behavior:'smooth',block:'center'});});
window.addEventListener('resize',drawChart);
$('demoUrl').textContent=getDemoUrl();applyVisitorMode();setInterval(updateClock,1000);updateClock();setNormal();addLog('Command Center initialized','SYSTEM','ok');addLog('47 monitored assets synchronized','MONITOR','');addLog('AI-GUARD is watching for anomalies','AI','');startTelemetry();drawChart();
