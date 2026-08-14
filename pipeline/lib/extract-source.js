const {AlQuran, VerseMode} = require('alfurqan');
const fs = require('fs');
const decode = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"');
const out=[], ruleCount={}; let missIndo=0, missTaj=0;

for (let c=1;c<=114;c++){
  const list = AlQuran.verseByChapter(c);
  for (let i=0;i<list.length;i++){
    const vn=i+1;
    const indo=AlQuran.verse(c,vn,VerseMode.indopak);
    const uth =AlQuran.verse(c,vn,VerseMode.uthmani);
    const taj =AlQuran.verse(c,vn,VerseMode.uthmaniTajweed);
    if(!indo||!indo.text) missIndo++;
    if(!taj ||!taj.text ) missTaj++;
    const t = taj&&taj.text ? decode(taj.text) : '';
    for (const m of t.matchAll(/<tajweed class=([a-z_]+)>/g)) ruleCount[m[1]]=(ruleCount[m[1]]||0)+1;
    out.push({k:`${c}:${vn}`,p:indo?indo.pageNumber:null,j:indo?indo.juzNumber:null,
              indopak:indo?indo.text:'',uthmani:uth?uth.text:'',tajweed:t});
  }
}
fs.writeFileSync('quran-full.json', JSON.stringify(out));
console.log('AYAHS:',out.length,'| missing indopak:',missIndo,'| missing tajweed:',missTaj);
console.log('PAGES:',new Set(out.map(o=>o.p)).size,'| JUZ:',new Set(out.map(o=>o.j)).size);
console.log('\nTAJWEED RULES FOUND:');
Object.entries(ruleCount).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log('  '+k.padEnd(20),String(v).padStart(7)));
console.log('\nTOTAL ANNOTATIONS:',Object.values(ruleCount).reduce((a,b)=>a+b,0));
