const $ = id => document.getElementById(id);
const logs = $('logs');
let incidentRunning = false;
let telemetryTimer;
let clockTimer;
let selectedScenario = 'overload';

const scenarios = {
  overload: { title:'SERVER OVERLOAD', node:'SERVER-02', root:'Application resource saturation', action:'Automated resource optimization', cpu:97, mem:89, net:83, storage:64, downtime:'14 min', loss:'$1,240', energy:'18%', response:'08.4s', detect:'03.1s', green:'18% estimated resource optimization after remediation.' },
  network: { title:'NETWORK ANOMALY', node:'AWS-PROD', root:'Traffic pattern outside expected baseline', action:'Traffic rebalancing + service validation', cpu:68, mem:63, net:96, storage:64, downtime:'9 min', loss:'$860', energy:'12%', response:'06.8s', detect:'02.4s', green:'12% estimated resource optimization after remediation.' },
  storage: { title:'STORAGE ALERT', node:'DATABASE', root:'Storage threshold approaching critical level', action:'Storage cleanup + capacity rebalancing', cpu:61, mem:57, net:44, storage:94, downtime:'11 min', loss:'$1,020', energy:'15%', response:'07.2s', detect:'02.8s', green:'15% estimated resource optimization after remediation.' }
};

const pad=n=>String(n).padStart(2,'0');
function now(){const d=new Date();return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`}
function addLog(message,tag='SYS',type=''){const el=document.createElement('div');el.className=`log ${type}`;el.innerHTML=`<span class="time">${now()}</span><span class="tag">[${tag}]</span> ${message}`;logs.appendChild(el);while(logs.children.length>15)logs.removeChild(logs.firstChild);logs.scrollTop=logs.scrollHeight}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function setMetric(id,value){$(id).textContent=value+'%';$(id.replace('Value','Bar')).style.width=value+'%'}
function setStep(n){document.querySelectorAll('.agent-steps span').forEach((el,i)=>el.classList.toggle('active',i===n-1))}
function setNormal(){
 document.body.classList.remove('incident');
 $('systemStatus').textContent='OPERATIONAL';$('systemStatus').className='good';$('agentStatus').textContent='ACTIVE';$('agentStatus').className='good';$('agentSub').textContent='Continuous monitoring';$('telemetryState').textContent='NORMAL';$('telemetryState').className='panel-state good';$('agentBadge').textContent='● MONITORING';$('agentBadge').style.color='';
 $('agentMessage').innerHTML='Monitoring infrastructure...<br><span>All systems within expected parameters.</span>';$('agentProgress').style.width='100%';setStep(1);
 $('downtime').textContent='0 min';$('loss').textContent='$0';$('energy').textContent='0%';$('response').textContent='—';$('greenText').textContent='Optimización de recursos sin incidente activo.';
 $('reportStatus').textContent='SYSTEM OPERATIONAL';$('reportStatus').style.color='';$('rootCause').textContent='No anomaly';$('action').textContent='Continuous monitoring';$('detection').textContent='—';$('incidentId').textContent='IG-DEMO-000';$('nodeCount').textContent='4 / 4 online';
 document.querySelectorAll('.server-node').forEach(n=>{n.classList.remove('alert');n.querySelector('i').textContent='ONLINE'});
 setMetric('cpuValue',42);setMetric('memValue',51);setMetric('netValue',38);setMetric('storageValue',64);
}
function startTelemetry(){clearInterval(telemetryTimer);telemetryTimer=setInterval(()=>{if(incidentRunning)return;const base=[42,51,38,64];base.forEach((v,i)=>{const x=Math.max(18,Math.min(78,v+Math.round(Math.random()*8-4)));setMetric(['cpuValue','memValue','netValue','storageValue'][i],x)})},1700)}
function selectScenario(name){selectedScenario=name;document.querySelectorAll('.scenario').forEach(b=>b.classList.toggle('active',b.dataset.scenario===name));}

async function runScenario(){
 if(incidentRunning)return;
 incidentRunning=true;
 const s=scenarios[selectedScenario];
 document.body.classList.add('incident');
 $('incidentBtn').disabled=true;$('runScenario').disabled=true;$('incidentBtn').textContent='ANALIZANDO...';$('runScenario').textContent='● AI-GUARD EN EJECUCIÓN';
 $('systemStatus').textContent='ANOMALY DETECTED';$('systemStatus').className='';$('systemStatus').style.color='var(--red)';$('agentStatus').textContent='ANALYZING';$('agentStatus').className='';$('agentStatus').style.color='var(--yellow)';$('agentSub').textContent='Root cause analysis';$('agentBadge').textContent='● INCIDENT RESPONSE';$('agentBadge').style.color='var(--yellow)';$('telemetryState').textContent='DEGRADED';$('telemetryState').style.color='var(--red)';
 $('nodeCount').textContent='3 / 4 online';
 const node=[...document.querySelectorAll('.server-node')].find(n=>n.textContent.includes(s.node)) || document.querySelector('.server-b');
 node.classList.add('alert');node.querySelector('i').textContent='CRITICAL';
 addLog(`Abnormal pattern detected on ${s.node}`,'ALERT','alert');
 setMetric('cpuValue',s.cpu);setMetric('memValue',s.mem);setMetric('netValue',s.net);setMetric('storageValue',s.storage);$('agentMessage').innerHTML=`Anomaly detected on ${s.node}.<br><span>Analyzing root cause...</span>`;$('agentProgress').style.width='24%';setStep(2);await wait(1200);
 addLog(`Correlation engine identified: ${s.root}`,'AI','warn');$('agentMessage').innerHTML='Root cause identified.<br><span>Assessing business impact and response path.</span>';$('agentProgress').style.width='50%';setStep(3);await wait(1150);
 addLog(`Executing: ${s.action}`,'REMEDIATION','warn');$('agentMessage').innerHTML='Executing remediation...<br><span>Rebalancing resources and validating service health.</span>';$('agentProgress').style.width='76%';setStep(4);await wait(1200);
 addLog('Service health restored — telemetry back within baseline','AI','ok');setMetric('cpuValue',41);setMetric('memValue',48);setMetric('netValue',36);setMetric('storageValue',64);$('agentProgress').style.width='100%';$('agentMessage').innerHTML='Incident resolved successfully.<br><span>Infrastructure returned to expected parameters.</span>';$('systemStatus').textContent='OPERATIONAL';$('systemStatus').className='good';$('systemStatus').style.color='';$('agentStatus').textContent='ACTIVE';$('agentStatus').className='good';$('agentStatus').style.color='';$('agentSub').textContent='Continuous monitoring';$('telemetryState').textContent='RECOVERED';$('telemetryState').style.color='var(--green)';$('agentBadge').textContent='● MONITORING';$('agentBadge').style.color='';
 $('downtime').textContent=s.downtime;$('loss').textContent=s.loss;$('energy').textContent=s.energy;$('response').textContent=s.response;$('greenText').textContent=s.green;$('reportStatus').textContent='INCIDENT RESOLVED';$('reportStatus').style.color='var(--green)';$('incidentId').textContent='IG-DEMO-'+Math.floor(100+Math.random()*900);$('detection').textContent=s.detect;$('rootCause').textContent=s.root;$('action').textContent=s.action;$('nodeCount').textContent='4 / 4 online';node.querySelector('i').textContent='ONLINE';setStep(4);
 await wait(500);incidentRunning=false;$('incidentBtn').disabled=false;$('runScenario').disabled=false;$('incidentBtn').innerHTML='<span>⚡</span> SIMULAR INCIDENTE';$('runScenario').textContent='▶ EJECUTAR ESCENARIO SELECCIONADO';
}

function reset(){incidentRunning=false;setNormal();logs.innerHTML='';addLog('Command Center initialized','SYSTEM','ok');addLog('47 monitored assets synchronized','MONITOR','');addLog('AI-GUARD is watching for anomalies','AI','');$('incidentBtn').disabled=false;$('runScenario').disabled=false;$('incidentBtn').innerHTML='<span>⚡</span> SIMULAR INCIDENTE';$('runScenario').textContent='▶ EJECUTAR ESCENARIO SELECCIONADO';startTelemetry()}
function updateClock(){$('clock').textContent=now()}
function getDemoUrl(){return window.location.href.split('?')[0]}
function visitorMode(){const u=new URL(window.location.href);u.searchParams.set('visitor','1');window.open(u.toString(),'_blank','noopener')}

$('incidentBtn').addEventListener('click',runScenario);$('runScenario').addEventListener('click',runScenario);$('resetBtn').addEventListener('click',reset);document.querySelectorAll('.scenario').forEach(b=>b.addEventListener('click',()=>selectScenario(b.dataset.scenario)));
$('copyUrl').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(getDemoUrl());$('copyUrl').textContent='✓ ENLACE COPIADO';setTimeout(()=>$('copyUrl').textContent='COPIAR ENLACE',1600)}catch{window.prompt('Copia este enlace:',getDemoUrl())}});$('openVisitor').addEventListener('click',visitorMode);
$('demoUrl').textContent=getDemoUrl();setInterval(updateClock,1000);updateClock();
setNormal();addLog('Command Center initialized','SYSTEM','ok');addLog('47 monitored assets synchronized','MONITOR','');addLog('AI-GUARD is watching for anomalies','AI','');startTelemetry();
