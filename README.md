# little-notes
A simple notes app to write, organize, search, and save notes.

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#6955d9">
<title>Little Notes</title>
<style>
:root{--bg:#f5f5fb;--panel:#fff;--text:#25243a;--muted:#77778b;--line:#e4e3ef;--accent:#6955d9;--soft:#eeebff}
body.dark{--bg:#151522;--panel:#222233;--text:#f4f1ff;--muted:#b8b5ce;--line:#3b3a50;--accent:#b2a4ff;--soft:#37314f}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px system-ui,sans-serif}
header{background:var(--panel);padding:16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);gap:10px}
.brand{font-size:23px;font-weight:800;color:var(--accent)}
.wrap{max-width:1100px;margin:auto;padding:14px}
.layout{display:grid;grid-template-columns:225px minmax(0,1fr);gap:14px}
.panel,.editor{background:var(--panel);border:1px solid var(--line);border-radius:15px;padding:14px;min-width:0}
button,input,select{font:inherit}
button{cursor:pointer;border:1px solid var(--line);border-radius:9px;padding:9px 11px;background:var(--panel);color:var(--text)}
button.primary{background:var(--accent);color:white;border-color:var(--accent)}
.wide{width:100%;text-align:left;margin:4px 0}
input,select{width:100%;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--text);margin:5px 0 12px}
label{font-size:13px;color:var(--muted)}
h3{margin:7px 0 12px}
.muted{color:var(--muted);font-size:12px}
.subjects{display:grid;gap:4px;margin:8px 0 15px}
.subject-btn{display:flex;justify-content:space-between;text-align:start;gap:6px}
.subject-btn.active,.note.active{background:var(--soft);border-color:var(--accent)}
.note{border:1px solid var(--line);border-radius:10px;padding:11px;margin:7px 0;cursor:pointer;overflow-wrap:anywhere}
.note strong{display:block}
.note small{color:var(--muted)}
.toolbar{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.toolbar button{padding:8px 10px}
.color{width:29px;height:29px;padding:0}
.fields{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fields label{display:block}
#content{min-height:240px;border:1px solid var(--line);border-radius:10px;padding:13px;line-height:1.8;overflow-wrap:anywhere;outline:none}
#content:focus{border-color:var(--accent)}
#content:empty:before{content:attr(data-placeholder);color:var(--muted)}
#content ul,#content ol{padding-inline-start:28px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}
.tag{border-radius:18px;padding:5px 9px;font-size:12px;color:#29243a}
.actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
hr{border:0;border-top:1px solid var(--line);margin:14px 0}
@media(max-width:700px){.layout{grid-template-columns:1fr}.wrap{padding:8px}.panel,.editor{padding:11px}header{padding:11px}}
</style>
</head>
<body>
<header>
  <div><div class="brand">✦ Little Notes</div><div class="muted" id="subtitle">Your study space</div></div>
  <div style="display:flex;gap:5px">
    <select id="uiLang" style="width:auto;margin:0" onchange="setUILang()">
      <option value="en">English</option><option value="ku">کوردی</option><option value="ar">العربية</option>
    </select>
    <button onclick="toggleTheme()" id="themeBtn">🌙</button>
  </div>
</header>
<div class="wrap"><div class="layout">
<aside class="panel">
  <button class="primary wide" onclick="newNote()" id="newBtn">＋ New note</button>
  <input id="search" placeholder="🔍 Search notes..." oninput="renderNotes()">
  <h3 id="subjectHeading">Subjects</h3>
  <div id="subjects" class="subjects"></div>
  <button class="wide" onclick="addSubject()" id="addSubject">＋ Add subject</button>
  <hr>
  <button class="wide" onclick="showAll()" id="allBtn">📚 All notes</button>
  <button class="wide" onclick="showFavorites()" id="favBtn">⭐ Favorites</button>
  <button class="wide" onclick="exportData()" id="exportBtn">⬇ Export backup</button>
  <button class="wide" onclick="document.getElementById('importFile').click()" id="importBtn">⬆ Import backup</button>
  <input id="importFile" type="file" accept=".json,application/json" hidden onchange="importData(event)">
  <p class="muted" id="storageInfo">Saved in this browser on this device.</p>
</aside>
<main>
  <section class="panel" style="margin-bottom:12px">
    <h3 id="notesHeading">My notes</h3>
    <div id="noteList"></div><div id="count" class="muted"></div>
  </section>
  <section class="editor">
    <div class="fields">
      <label id="titleLabel">Title<input id="title" placeholder="Note title"></label>
      <label id="subjectLabel">Subject<select id="subject"></select></label>
      <label id="chapterLabel">Chapter<input id="chapter" placeholder="Chapter 1"></label>
      <label id="lessonLabel">Lesson<input id="lesson" placeholder="Lesson 1"></label>
    </div>
    <label id="questionLabel">Question / exam question</label>
    <input id="question" placeholder="Write a question to remember">
    <label id="writingLabel">Writing language</label>
    <select id="writingLang" onchange="setWritingDirection()">
      <option value="en">English — LTR</option>
      <option value="ku">کوردی — RTL</option>
      <option value="ar">العربية — RTL</option>
    </select>
    <div class="toolbar">
      <button onclick="cmd('bold')"><b>B</b></button>
      <button onclick="cmd('italic')"><i>I</i></button>
      <button onclick="cmd('underline')"><u>U</u></button>
      <button onclick="cmd('strikeThrough')"><s>S</s></button>
      <select style="width:auto;margin:0" onchange="fontSize(this.value);this.value=''">
        <option value="">Text size</option><option value="1">Small</option>
        <option value="3">Normal</option><option value="5">Large</option><option value="7">Extra large</option>
      </select>
      <select style="width:auto;margin:0" onchange="block(this.value);this.value=''">
        <option value="">Paragraph</option><option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="p">Normal</option>
      </select>
      <button onclick="cmd('removeFormat')">Clear format</button>
    </div>
    <div class="toolbar">
      <button onclick="cmd('insertUnorderedList')">• Bullets</button>
      <button onclick="cmd('insertOrderedList')">1. Numbered</button>
      <button onclick="insertTodo()">☑ To-do</button>
      <button onclick="insertDivider()">― Divider</button>
      <button onclick="cmd('justifyLeft')">⇤</button>
      <button onclick="cmd('justifyCenter')">↔</button>
      <button onclick="cmd('justifyRight')">⇥</button>
    </div>
    <label>Highlight color</label>
    <div class="toolbar">
      <button class="color" style="background:#fff176" onclick="highlight('#fff176')" title="Yellow"></button>
      <button class="color" style="background:#a5f3a5" onclick="highlight('#a5f3a5')" title="Green"></button>
      <button class="color" style="background:#91d9ff" onclick="highlight('#91d9ff')" title="Blue"></button>
      <button class="color" style="background:#ffadd2" onclick="highlight('#ffadd2')" title="Pink"></button>
      <button class="color" style="background:#d8b4fe" onclick="highlight('#d8b4fe')" title="Purple"></button>
      <button class="color" style="background:#ffbd91" onclick="highlight('#ffbd91')" title="Orange"></button>
      <button onclick="highlight('transparent')">Remove highlight</button>
    </div>
    <label>Text color</label>
    <div class="toolbar">
      <button class="color" style="background:#222" onclick="textColor('#222')" title="Black"></button>
      <button class="color" style="background:#e53935" onclick="textColor('#e53935')" title="Red"></button>
      <button class="color" style="background:#16803c" onclick="textColor('#16803c')" title="Green"></button>
      <button class="color" style="background:#2563eb" onclick="textColor('#2563eb')" title="Blue"></button>
      <button class="color" style="background:#9333ea" onclick="textColor('#9333ea')" title="Purple"></button>
      <button onclick="textColor('inherit')">Default color</button>
    </div>
    <label id="contentLabel">Note content</label>
    <div id="content" contenteditable="true" spellcheck="true" data-placeholder="Start writing here..."></div>
    <hr>
    <div class="fields">
      <label>Tag<input id="tagInput" placeholder="Exam, Important..."></label>
      <label>Tag color<select id="tagColor">
        <option value="#fecaca">Red</option><option value="#fed7aa">Orange</option>
        <option value="#fef08a">Yellow</option><option value="#bbf7d0">Green</option>
        <option value="#bfdbfe">Blue</option><option value="#e9d5ff">Purple</option>
        <option value="#fbcfe8">Pink</option>
      </select></label>
    </div>
    <div class="actions">
      <button onclick="addTag()">＋ Add tag</button>
      <button class="primary" onclick="saveNote()" id="saveBtn">💾 Save note</button>
      <button onclick="toggleFavorite()" id="favoriteBtn">☆ Favorite</button>
      <button onclick="deleteNote()" id="deleteBtn">🗑 Delete</button>
    </div>
    <div id="tagList" class="tags"></div>
    <p id="status" class="muted">Ready</p>
  </section>
</main>
</div></div>
<script>
const defaults=['کوردی','عەرەبی','ئینگلیزی','بیرکاری','جەگرافیا','مێژوو','ئابووری','فەلسەفە'];
const translations={
en:{subtitle:'Your study space',newBtn:'＋ New note',subjectHeading:'Subjects',addSubject:'＋ Add subject',allBtn:'📚 All notes',favBtn:'⭐ Favorites',exportBtn:'⬇ Export backup',importBtn:'⬆ Import backup',notesHeading:'My notes',titleLabel:'Title',subjectLabel:'Subject',chapterLabel:'Chapter',lessonLabel:'Lesson',questionLabel:'Question / exam question',writingLabel:'Writing language',contentLabel:'Note content',saveBtn:'💾 Save note',favoriteBtn:'☆ Favorite',deleteBtn:'🗑 Delete',storageInfo:'Saved in this browser on this device.',empty:'No notes yet. Create your first note!'},
ku:{subtitle:'شوێنی تایبەتی خوێندن',newBtn:'＋ تێبینی نوێ',subjectHeading:'بابەتەکان',addSubject:'＋ زیادکردنی بابەت',allBtn:'📚 هەموو تێبینییەکان',favBtn:'⭐ دڵخوازەکان',exportBtn:'⬇ هەناردەکردنی پاشەکەوت',importBtn:'⬆ هاوردەکردنی پاشەکەوت',notesHeading:'تێبینییەکانم',titleLabel:'ناونیشان',subjectLabel:'بابەت',chapterLabel:'بەش',lessonLabel:'وانە',questionLabel:'پرسیار / پرسیاری تاقیکردنەوە',writingLabel:'زمانی نووسین',contentLabel:'ناوەڕۆکی تێبینی',saveBtn:'💾 پاشەکەوتکردن',favoriteBtn:'☆ دڵخواز',deleteBtn:'🗑 سڕینەوە',storageInfo:'لە وێبگەڕی ئەم ئامێرەدا پاشەکەوت دەکرێت.',empty:'هێشتا تێبینی نییە.'},
ar:{subtitle:'مساحتك الدراسية',newBtn:'＋ ملاحظة جديدة',subjectHeading:'المواد',addSubject:'＋ إضافة مادة',allBtn:'📚 كل الملاحظات',favBtn:'⭐ المفضلة',exportBtn:'⬇ تصدير نسخة احتياطية',importBtn:'⬆ استيراد نسخة احتياطية',notesHeading:'ملاحظاتي',titleLabel:'العنوان',subjectLabel:'المادة',chapterLabel:'الفصل',lessonLabel:'الدرس',questionLabel:'سؤال / سؤال امتحان',writingLabel:'لغة الكتابة',contentLabel:'محتوى الملاحظة',saveBtn:'💾 حفظ الملاحظة',favoriteBtn:'☆ المفضلة',deleteBtn:'🗑 حذف',storageInfo:'يتم الحفظ في متصفح هذا الجهاز.',empty:'لا توجد ملاحظات بعد.'}
};
let notes=[],subjects=[...defaults],current=null,filter='all',tags=[],savedRange=null,uiLang='en';
try{notes=JSON.parse(localStorage.getItem('littleNotesNotes')||'[]');subjects=JSON.parse(localStorage.getItem('littleNotesSubjects')||'null')||[...defaults]}catch(e){notes=[];subjects=[...defaults]}
function persist(){try{localStorage.setItem('littleNotesNotes',JSON.stringify(notes));localStorage.setItem('littleNotesSubjects',JSON.stringify(subjects));document.getElementById('status').textContent='Saved ✓'}catch(e){document.getElementById('status').textContent='Storage full. Export a backup.'}}
function setUILang(){uiLang=document.getElementById('uiLang').value;const t=translations[uiLang];document.documentElement.lang=uiLang;document.documentElement.dir=uiLang==='en'?'ltr':'rtl';Object.keys(t).forEach(k=>{let el=document.getElementById(k);if(el)el.textContent=t[k]});renderSubjects();renderNotes();document.getElementById('subjectLabel').textContent=t.subjectLabel;document.getElementById('titleLabel').childNodes[0].textContent=t.titleLabel}
function toggleTheme(){document.body.classList.toggle('dark');document.getElementById('themeBtn').textContent=document.body.classList.contains('dark')?'☀️':'🌙';localStorage.setItem('littleNotesDark',document.body.classList.contains('dark'))}
if(localStorage.getItem('littleNotesDark')==='true')toggleTheme();
function renderSubjects(){let box=document.getElementById('subjects');box.innerHTML='';subjects.forEach(s=>{let b=document.createElement('button');b.className='subject-btn'+(filter===s?' active':'');b.textContent=s;b.onclick=()=>{filter=s;renderSubjects();renderNotes()};box.appendChild(b)});let sel=document.getElementById('subject'),v=sel.value;sel.innerHTML='';subjects.forEach(s=>{let o=document.createElement('option');o.value=s;o.textContent=s;sel.appendChild(o)});if(subjects.includes(v))sel.value=v}
function showAll(){filter='all';renderSubjects();renderNotes()}
function showFavorites(){filter='fav';renderSubjects();renderNotes()}
function renderNotes(){let q=document.getElementById('search').value.toLowerCase(),box=document.getElementById('noteList');box.innerHTML='';let list=notes.filter(n=>(filter==='all'||filter==='fav'&&n.favorite||filter!=='fav'&&filter!=='all'&&n.subject===filter)&&((n.title+' '+n.subject+' '+n.chapter+' '+n.lesson+' '+n.question+' '+n.text+' '+(n.tags||[]).map(t=>t.name).join(' ')).toLowerCase().includes(q)));list.forEach(n=>{let d=document.createElement('div');d.className='note'+(n.id===current?' active':'');let title=document.createElement('strong');title.textContent=(n.favorite?'⭐ ':'')+(n.title||'Untitled');let meta=document.createElement('small');meta.textContent=[n.subject,n.chapter,n.lesson].filter(Boolean).join(' · ');d.append(title,meta);d.onclick=()=>loadNote(n.id);box.appendChild(d)});document.getElementById('count').textContent=list.length+' notes';if(!list.length)box.textContent=translations[uiLang].empty}
function blank(){return {id:Date.now()+Math.random(),title:'',subject:subjects[0],chapter:'',lesson:'',question:'',language:'en',text:'',tags:[],favorite:false}}
function newNote(){current=null;tags=[];fill(blank());renderNotes()}
function fill(n){document.getElementById('title').value=n.title;document.getElementById('subject').value=n.subject;document.getElementById('chapter').value=n.chapter;document.getElementById('lesson').value=n.lesson;document.getElementById('question').value=n.question;document.getElementById('writingLang').value=n.language||'en';document.getElementById('content').innerHTML=n.text||'';tags=(n.tags||[]).map(t=>({...t}));setWritingDirection();renderTags();document.getElementById('favoriteBtn').textContent=n.favorite?'⭐ Favorite':'☆ Favorite';current=n.id}
function loadNote(id){let n=notes.find(n=>n.id===id);if(n)fill(n);renderNotes()}
function saveNote(){let title=document.getElementById('title').value.trim();let old=notes.find(n=>n.id===current);let n={id:current||Date.now()+Math.random(),title,subject:document.getElementById('subject').value,chapter:document.getElementById('chapter').value,lesson:document.getElementById('lesson').value,question:document.getElementById('question').value,language:document.getElementById('writingLang').value,text:document.getElementById('content').innerHTML,tags:tags,favorite:old?old.favorite:false,updated:new Date().toISOString()};if(old)notes[notes.indexOf(old)]=n;else notes.unshift(n);current=n.id;persist();renderNotes()}
function deleteNote(){if(current===null){document.getElementById('status').textContent='Select a saved note first';return}if(!confirm('Delete this note?'))return;notes=notes.filter(n=>n.id!==current);current=null;tags=[];fill(blank());persist();renderNotes()}
function toggleFavorite(){let n=notes.find(n=>n.id===current);if(!n){saveNote();n=notes.find(n=>n.id===current)}if(n){n.favorite=!n.favorite;document.getElementById('favoriteBtn').textContent=n.favorite?'⭐ Favorite':'☆ Favorite';persist();renderNotes()}}
function addSubject(){let s=prompt('Enter subject name:');if(s&&s.trim()&&!subjects.includes(s.trim())){subjects.push(s.trim());persist();renderSubjects()}}
function cmd(name){document.getElementById('content').focus();document.execCommand(name,false,null)}
function fontSize(v){if(v){document.getElementById('content').focus();document.execCommand('fontSize',false,v)}}
function block(v){if(v){document.getElementById('content').focus();document.execCommand('formatBlock',false,v)}}
function highlight(color){document.getElementById('content').focus();if(color==='transparent'){document.execCommand('removeFormat',false,null)}else{document.execCommand('hiliteColor',false,color)}}
function textColor(color){document.getElementById('content').focus();document.execCommand('foreColor',false,color)}
function setWritingDirection(){let rtl=['ku','ar'].includes(document.getElementById('writingLang').value);let c=document.getElementById('content');c.dir=rtl?'rtl':'ltr';c.style.textAlign=rtl?'right':'left'}
function insertTodo(){document.getElementById('content').focus();document.execCommand('insertHTML',false,'<div><label><input type="checkbox"> Task</label></div><div><br></div>')}
function insertDivider(){document.getElementById('content').focus();document.execCommand('insertHTML',false,'<hr><p><br></p>')}
function addTag(){let name=document.getElementById('tagInput').value.trim();if(!name)return;tags.push({name,color:document.getElementById('tagColor').value});document.getElementById('tagInput').value='';renderTags()}
function renderTags(){let box=document.getElementById('tagList');box.innerHTML='';tags.forEach((t,i)=>{let b=document.createElement('button');b.className='tag';b.style.background=t.color;b.textContent=t.name+' ×';b.onclick=()=>{tags.splice(i,1);renderTags()};box.appendChild(b)})}
function exportData(){let blob=new Blob([JSON.stringify({notes,subjects},null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='little-notes-backup.json';a.click();URL.revokeObjectURL(a.href)}
function importData(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let data=JSON.parse(r.result);if(!Array.isArray(data.notes)||!Array.isArray(data.subjects))throw Error();if(!confirm('Replace current notes with this backup?'))return;notes=data.notes;subjects=data.subjects;current=null;tags=[];persist();renderSubjects();renderNotes();fill(blank());alert('Backup imported!')}catch(err){alert('Invalid backup file.')}};r.readAsText(f);e.target.value=''}
renderSubjects();renderNotes();fill(blank());
</script>
</body>
</html>
# StudySpace — fresh starter build

A simple static web app starter for an Android tablet. Includes subject dashboard, typed notes, local saving, math symbol insertion, paper-like canvas drawing, pen/highlighter/eraser controls, undo, dark mode, and JSON backup/restore.

## Files
- `index.html` — app structure
- `style.css` — responsive design and themes
- `app.js` — note data, drawing tools, local storage, backup/restore
- `manifest.webmanifest` — PWA metadata
- `service-worker.js` — offline cache starter

## Run locally
Open `index.html` in a modern browser. Local storage and canvas work in a browser. PWA/offline caching requires serving over HTTPS or localhost and registering the service worker.

## Publish on GitHub Pages
1. Back up the existing repository and any notes.
2. Upload the contents of this folder to the repository root or the configured Pages publishing folder.
3. Commit the changes to the branch/folder configured in Settings → Pages.
4. Wait for deployment and open the published site.
5. Test on the actual Android tablet.

## Important limitations of this starter
- Language selector currently saves the selected language but does not translate every UI label.
- Notes are stored in this browser's local storage; clearing browser/site data can remove them. Use Export Backup regularly.
- The drawing canvas is a single page per note in this first build.
- This is a starter implementation and has not been verified on the user's device or deployed website yet.

## Install to Android home screen and use offline
This must be published on an HTTPS site (for example GitHub Pages). A local HTML file opened from Downloads cannot reliably install as a PWA or register its offline service worker.

1. Upload the contents of this folder, including the `icons` folder, to the GitHub Pages publishing folder.
2. Wait until the HTTPS website shows the new version.
3. On the Infinix XPad, open the HTTPS website in Chrome while online.
4. Open Chrome's ⋮ menu and choose **Install app** or **Add to Home screen** (the wording depends on Chrome).
5. Launch StudySpace from the new home-screen icon once while online. After the first successful load, the app shell should be cached for offline opening.
6. Create a test note, close the app, enable Airplane mode, reopen StudySpace and check the note. Keep using Export Backup regularly.

Note: offline access depends on the browser's storage not being cleared. Notes are local to the browser/app installation and are not automatically synced across devices. Test offline behavior before relying on it for important study notes.
