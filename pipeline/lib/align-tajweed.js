const fs=require('fs');
const all=JSON.parse(fs.readFileSync('quran-full.json','utf8'));
const qw=JSON.parse(fs.readFileSync('qulwords.json','utf8'));
const LETTER=/[ء-يٮ-ۓۺ-ۿ]/;
const PAUSE=/[ؕۖ-ۜ۝۞۩۟۠]/;
const NORM={'ٱ':'ا','آ':'ا','أ':'ا','إ':'ا','ٲ':'ا','ٳ':'ا','ـ':'ا','ٰ':'ا','ٓ':'ا','ٮ':'ب',
 'ة':'ه','ۃ':'ه','ہ':'ه','ھ':'ه','ي':'ى','ی':'ى','ئ':'ى','ك':'ك','ک':'ك','ؤ':'و','ۇ':'و'};
const norm=c=>NORM[c]||c;

function unwrap(taj){
  const re=/<tajweed class=([a-z_]+)>|<\/tajweed>|<span class=end>|<\/span>/g;
  let plain='',rules=[],i=0,m;const stack=[];
  const push=t=>{const r=stack[stack.length-1]||null;for(const c of t){plain+=c;rules.push(r);}};
  while((m=re.exec(taj))!==null){push(taj.slice(i,m.index));i=re.lastIndex;
    if(m[1]!==undefined)stack.push(m[1]);
    else if(m[0]==='<span class=end>')stack.push('__end');else stack.pop();}
  push(taj.slice(i));return {plain,rules};
}
function tokenize(s){
  const toks=[];let cur=null;
  for(let i=0;i<s.length;i++){const c=s[i];
    if(/\s/.test(c)){if(cur){toks.push(cur);cur=null;}continue;}
    if(!cur)cur={text:'',idx:[]};
    cur.text+=c;cur.idx.push(i);
    if(PAUSE.test(c)&&i+1<s.length&&LETTER.test(s[i+1])){toks.push(cur);cur=null;}}
  if(cur)toks.push(cur);
  return toks.filter(t=>LETTER.test(t.text));
}

// QUL words ko ayah ke hisab se group karo
const byAyah={};
for(const w of qw) (byAyah[w.s+':'+w.a]=byAyah[w.s+':'+w.a]||[]).push(w);

let ok=0,skip=0,found=0,missed=0;
const out={};   // word id -> marks array
const unaligned=[];
for(const v of all){
  const {plain,rules}=unwrap(v.tajweed);
  const uw=tokenize(plain).filter(t=>!t.idx.every(i=>rules[i]==='__end'));
  let iw=byAyah[v.k]||[];
  // har ayah ka aakhri "lafz" ayah number ka glyph hai — usay nikal do
  const marker = iw.length ? iw[iw.length-1] : null;
  if(marker && !LETTER.test(marker.t)) iw = iw.slice(0,-1);
  if(uw.length!==iw.length){ skip++; unaligned.push({k:v.k,u:uw.length,q:iw.length}); continue; }
  ok++;
  for(let n=0;n<iw.length;n++){
    const src=uw[n], dst=[...iw[n].t];
    const seen={},segs=[];
    src.idx.forEach(i=>{const c=plain[i]; if(!LETTER.test(c))return;
      const L=norm(c); seen[L]=(seen[L]||0)+1;
      const r=rules[i]; if(r&&r!=='__end') segs.push({rule:r,letter:L,occ:seen[L]});});
    if(!segs.length) continue;
    const marks=new Array(dst.length).fill(null);
    for(const s of segs){
      let cnt=0,hit=-1;
      for(let p=0;p<dst.length;p++){ if(!LETTER.test(dst[p]))continue;
        if(norm(dst[p])===s.letter){cnt++;if(cnt===s.occ){hit=p;break;}}}
      if(hit<0){ for(let p=dst.length-1;p>=0;p--){if(/[اوىيٰ]/.test(dst[p])){hit=p;break;}} }
      if(hit<0){missed++;continue;}
      found++; marks[hit]=s.rule;
      for(let q=hit+1;q<dst.length&&!LETTER.test(dst[q]);q++) marks[q]=s.rule;
    }
    if(marks.some(Boolean)) out[iw[n].id]=marks;
  }
}
fs.writeFileSync('wordmarks.json',JSON.stringify(out));
fs.writeFileSync('unaligned2.json',JSON.stringify(unaligned,null,1));
console.log('ALIGNED ayahs :',ok,'/',all.length,'=',(ok/all.length*100).toFixed(2)+'%');
console.log('needs review  :',skip);
console.log('marks placed  :',found,'| missed:',missed);
console.log('words with rang:',Object.keys(out).length);
