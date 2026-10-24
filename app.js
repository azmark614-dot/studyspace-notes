(() => {
const $ = id => document.getElementById(id);
const defaultSubjects = [
  {id:"ku", name:"کوردی", icon:"📘"},{id:"ar",name:"عەرەبی",icon:"📗"},
  {id:"en",name:"ئینگلیزی",icon:"🔤"},{id:"ph",name:"فەلسەفە",icon:"💭"},
  {id:"hi",name:"مێژوو",icon:"🏛️"},{id:"ec",name:"ئابووری",icon:"📊"},
  {id:"re",name:"ئایین",icon:"📖"},{id:"co",name:"بیرکاری",icon:"➗"},
  {id:"ge",name:"جۆگرافیا",icon:"🌍"},{id:"cs",name:"کۆمپیوتەر",icon:"💻"}
];
const symbols = ["0","1","2","3","4","5","6","7","8","9",
 "＋","−","×","÷","=","≠","≈","≤","≥","√","π","²","³","⁴","⁵","₀","₁","₂","₃",
 "½","⅓","⅔","¼","¾","%","(",")","[","]","{","}","x","y","θ","∑","∞","→","←","±","·","^"];
let state = loadState();
let selectedSubject = state.selectedSubject || "ku";
let currentNoteId = null;
let mode = "text";
let drawTool = "pen";
let drawing = false, lastPoint = null, undoStack = [];
const canvas = $("paperCanvas"), ctx = canvas.getContext("2d");
function loadState(){
  try { return JSON.parse(localStorage.getItem("studyspace-data-v1")) || {subjects:defaultSubjects,notes:[],theme:"light",language:"ku"}; }
  catch { return {subjects:defaultSubjects,notes:[],theme:"light",language:"ku"}; }
}
function persist(){
  try { localStorage.setItem("studyspace-data-v1",JSON.stringify(state)); $("saveStatus").textContent="پاشەکەوت کراوە"; }
  catch { $("saveStatus").textContent="هەڵە لە پاشەکەوت"; toast("پاشەکەوت نەکرا. تکایە backup بکە."); }
}
function toast(msg){const t=$("toast");t.textContent=msg;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,2400);}
function notesForSubject(){return state.notes.filter(n=>n.subjectId===selectedSubject)}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderSubjects(){
 const grid=$("subjectsGrid");grid.innerHTML="";
 state.subjects.forEach(s=>{const b=document.createElement("button");b.className="subject"+(s.id===selectedSubject?" selected":"");b.innerHTML=`<span class="emoji">${escapeHtml(s.icon)}</span><span>${escapeHtml(s.name)}</span><span class="arrow">›</span>`;b.onclick=()=>{selectedSubject=s.id;state.selectedSubject=s.id;currentNoteId=null;persist();renderAll();};grid.appendChild(b);});
 $("selectedSubjectTitle").textContent=(state.subjects.find(s=>s.id===selectedSubject)||{}).name||"StudySpace";
}
function renderNotes(){
 const list=$("notesList");list.innerHTML="";
 const notes=notesForSubject();
 if(!notes.length){const p=document.createElement("p");p.className="muted";p.textContent="هیچ تێبینییەک نییە. تێبینییەکی نوێ دروست بکە.";list.appendChild(p);}
 notes.forEach(n=>{const b=document.createElement("button");b.className="note-card"+(n.id===currentNoteId?" active":"");b.innerHTML=`<strong>${escapeHtml(n.title||"تێبینی بێ ناونیشان")}</strong><div class="note-preview">${escapeHtml((n.body||"").slice(0,90)||"✎ قەڵەم و کاغەز")}</div>`;b.onclick=()=>openNote(n.id);list.appendChild(b);});
}
function activeNote(){return state.notes.find(n=>n.id===currentNoteId)}
function newNote(){
 const n={id:"n"+Date.now()+Math.random().toString(16).slice(2,6),subjectId:selectedSubject,title:"",body:"",strokes:[],updated:Date.now()};
 state.notes.unshift(n);currentNoteId=n.id;persist();renderAll();$("noteTitle").focus();
}
function openNote(id){currentNoteId=id;renderAll();loadCanvas(activeNote()?.strokes||[]);}
function saveEditor(){
 const n=activeNote();if(!n)return;
 n.title=$("noteTitle").value;n.body=$("noteBody").value;n.strokes=readCanvasStrokes();n.updated=Date.now();persist();renderNotes();
}
let saveTimer;
function queueSave(){ $("saveStatus").textContent="خەریکی پاشەکەوتکردن…";clearTimeout(saveTimer);saveTimer=setTimeout(saveEditor,350);}
function renderAll(){
 renderSubjects();renderNotes();const n=activeNote();
 $("noteTitle").value=n?.title||"";$("noteBody").value=n?.body||"";
 $("deleteNoteBtn").disabled=!n;
 if(n)loadCanvas(n.strokes||[]);else clearCanvas();
}
function setMode(m){
 mode=m;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===m));
 $("textEditorWrap").hidden=m!=="text";$("paperTools").hidden=m!=="paper";$("canvasWrap").hidden=m!=="paper";$("mathSymbols").hidden=false;
 if(m==="paper")resizeCanvas();
}
function resizeCanvas(){
 const rect=canvas.getBoundingClientRect();if(!rect.width)return;
 const old=readCanvasStrokes();const ratio=window.devicePixelRatio||1;
 canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(420*ratio);
 ctx.setTransform(ratio,0,0,ratio,0,0);drawStrokes(old);
}
function readCanvasStrokes(){return activeNote()?.strokes||[]}
function clearCanvas(){ctx.clearRect(0,0,canvas.width,canvas.height)}
function drawStrokes(strokes){
 clearCanvas();const ratio=window.devicePixelRatio||1;ctx.save();ctx.setTransform(ratio,0,0,ratio,0,0);
 for(const s of strokes){if(!s.points?.length)continue;ctx.beginPath();ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=s.width||4;ctx.strokeStyle=s.tool==="highlight"?s.color:(s.color||"#183c91");ctx.globalAlpha=s.tool==="highlight"?0.35:1;ctx.moveTo(s.points[0].x,s.points[0].y);for(let i=1;i<s.points.length;i++)ctx.lineTo(s.points[i].x,s.points[i].y);if(s.points.length===1)ctx.lineTo(s.points[0].x+.1,s.points[0].y+.1);ctx.stroke();}
 ctx.restore();
}
function loadCanvas(strokes){if(!canvas)return;resizeCanvas();drawStrokes(strokes||[])}
function pointFromEvent(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function pointerDown(e){
 if(mode!=="paper"||!activeNote())return;drawing=true;canvas.setPointerCapture?.(e.pointerId);lastPoint=pointFromEvent(e);
 const n=activeNote();n.strokes=n.strokes||[];undoStack.push(JSON.stringify(n.strokes));if(undoStack.length>30)undoStack.shift();
 if(drawTool==="eraser"){eraseAt(lastPoint);return;}
 n.strokes.push({tool:drawTool,color:drawTool==="highlight"?$("highlightColor").value:$("penColor").value,width:drawTool==="eraser"?18:Number($("penWidth").value),points:[lastPoint]});drawStrokes(n.strokes);
}
function pointerMove(e){
 if(!drawing||!activeNote())return;const p=pointFromEvent(e),n=activeNote();
 if(drawTool==="eraser"){eraseAt(p);return;}
 const s=n.strokes[n.strokes.length-1];s.points.push(p);lastPoint=p;drawStrokes(n.strokes);
}
function pointerUp(){if(!drawing)return;drawing=false;lastPoint=null;saveEditor()}
function eraseAt(p){const n=activeNote();if(!n)return;const radius=Number($("penWidth").value)*2+8;n.strokes=(n.strokes||[]).filter(s=>!s.points.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<radius));drawStrokes(n.strokes)}
function initSymbols(){const box=$("mathSymbols");symbols.forEach(sym=>{const b=document.createElement("button");b.textContent=sym;b.onclick=()=>{const el=$("noteBody"),start=el.selectionStart,end=el.selectionEnd;el.setRangeText(sym,start,end,"end");el.focus();queueSave();};box.appendChild(b);});}
const mathTemplates = {
 problem: "Math problem\\nQuestion: \\n\\nGiven: \\n\\nFind: \\n\\nSolution: \\n\\nAnswer: \\n",
 steps: "Step-by-step solution\\n1. Given: \\n2. Rule/formula: \\n3. Substitute values: \\n4. Calculate: \\n5. Final answer: \\n",
 formula: "Formula card\\nFormula: \\nMeaning of symbols: \\nWhen to use it: \\nExample: \\n",
 practice: "Math practice\\n1) Question: \\n   Answer: \\n\\n2) Question: \\n   Answer: \\n\\n3) Question: \\n   Answer: \\n"
};
document.querySelectorAll("[data-math-template]").forEach(b=>b.onclick=()=>{
 const body=$("noteBody");
 if(!activeNote()) newNote();
 const current=$("noteBody").value;
 const addition=mathTemplates[b.dataset.mathTemplate];
 body.value=current ? current+"\\n\\n"+addition : addition;
 if(!$("noteTitle").value.trim()) $("noteTitle").value=({problem:"Math problem",steps:"Step-by-step solution",formula:"Formula card",practice:"Math practice"})[b.dataset.mathTemplate];
 queueSave(); body.focus(); toast("Math template added to your note.");
});
$("newNoteBtn").onclick=newNote;
$("addSubjectBtn").onclick=()=>{const name=prompt("ناوی بابەت بنووسە:");if(!name?.trim())return;const id="s"+Date.now();state.subjects.push({id,name:name.trim(),icon:"📚"});selectedSubject=id;state.selectedSubject=id;persist();renderAll();};
$("noteTitle").addEventListener("input",queueSave);$("noteBody").addEventListener("input",queueSave);
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");state.theme=document.body.classList.contains("dark")?"dark":"light";persist();};
$("languageSelect").value=state.language||"ku";$("languageSelect").onchange=e=>{state.language=e.target.value;persist();toast("Language setting saved. Full translations can be added in a later version.");};
$("penBtn").onclick=()=>{drawTool="pen";$("penBtn").classList.add("active");$("highlightBtn").classList.remove("active");$("eraserBtn").classList.remove("active");};
$("highlightBtn").onclick=()=>{drawTool=drawTool==="highlight"?"pen":"highlight";$("highlightBtn").classList.toggle("active",drawTool==="highlight");$("penBtn").classList.toggle("active",drawTool==="pen");$("eraserBtn").classList.remove("active");};
$("eraserBtn").onclick=()=>{drawTool="eraser";$("eraserBtn").classList.add("active");$("penBtn").classList.remove("active");$("highlightBtn").classList.remove("active");};
$("undoBtn").onclick=()=>{const n=activeNote();if(!n||!undoStack.length)return;n.strokes=JSON.parse(undoStack.pop());drawStrokes(n.strokes);saveEditor();};
$("clearCanvasBtn").onclick=()=>{if(!activeNote())return;if(confirm("هەموو نووسینی قەڵەم بسڕمەوە؟")){undoStack.push(JSON.stringify(activeNote().strokes||[]));activeNote().strokes=[];drawStrokes([]);saveEditor();}};
$("deleteNoteBtn").onclick=()=>{const n=activeNote();if(!n)return;if(confirm("ئەم تێبینییە بسڕمەوە؟")){state.notes=state.notes.filter(x=>x.id!==n.id);currentNoteId=null;persist();renderAll();}};
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString(),app:"StudySpace",schemaVersion:1},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="studyspace-backup.json";a.click();URL.revokeObjectURL(a.href);toast("Backup exported.");};
$("importBtn").onclick=()=>$("importFile").click();
$("importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!Array.isArray(data.subjects)||!Array.isArray(data.notes))throw Error("invalid");if(!confirm("Restore backup? Current app data will be replaced."))return;state={subjects:data.subjects,notes:data.notes,theme:data.theme||"light",language:data.language||"ku",selectedSubject:data.selectedSubject||data.subjects[0]?.id};selectedSubject=state.selectedSubject||"ku";document.body.classList.toggle("dark",state.theme==="dark");currentNoteId=null;persist();renderAll();toast("Backup restored.");}catch{toast("Backup file is invalid or damaged.");}e.target.value="";};
canvas.addEventListener("pointerdown",pointerDown);canvas.addEventListener("pointermove",pointerMove);canvas.addEventListener("pointerup",pointerUp);canvas.addEventListener("pointercancel",pointerUp);window.addEventListener("resize",()=>{if(mode==="paper")resizeCanvas();});
document.body.classList.toggle("dark",state.theme==="dark");
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
if(!state.subjects?.length)state.subjects=defaultSubjects;
if(!state.notes?.length){const n={id:"welcome",subjectId:"ku",title:"تێبینی نموونە",body:"ئەمە تێبینییەکی نموونەیە. دەتوانیت دەستکاری بکەیت یان تێبینییەکی نوێ دروست بکەیت.",strokes:[],updated:Date.now()};state.notes.push(n);}
currentNoteId=state.notes.find(n=>n.subjectId===selectedSubject)?.id||null;
if(!currentNoteId){const n={id:"welcome-"+Date.now(),subjectId:selectedSubject,title:"",body:"",strokes:[],updated:Date.now()};state.notes.unshift(n);currentNoteId=n.id;}
initSymbols();persist();renderAll();setMode("text");
})();