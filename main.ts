// my own interpreter of the kit's tiny stack ISA (ISA.md); T[o] is the pops of opcode o.
import fs from'node:fs'
const T='00011223xxxxxxxx222222212221222x222xxxxxxxxxxxxx01100xxxxxxxxxxx12xxxxxxxxxxxxxx1101'
let s
function run(p,i){
const D=new Int32Array(257),C=new Int32Array(64),M=new Int32Array(256)
let sp=0,cp=0,pc=0,ip=0,n=0
s=''
for(;;){
if(++n>1e6)return 10
const o=p[pc],q=+T[o]
const m=o<3?o*o:o>47&o<52?2:0
if(pc<0|pc+m>=p.length)return 9
if(!(sp>=q))return q!=q?5:2
pc+=m+1
if(o>15&o<35&q>1){
const b=D[sp-1],a=D[sp-2]
if(o>18&o<23&!b)return 4
D[--sp-1]=o<19?[a+b,a-b,Math.imul(a,b)][o-16]:o<23?[a/b,a%b,(a>>>0)/(b>>>0),(a>>>0)%(b>>>0)][o-19]:o<27?[a&b,a|b,a^b][o-24]:o<31?[a<<b,a>>b,a>>>b][o-28]:[a==b,a<b,a>>>0<b>>>0][o-32]
}else switch(o){
case 0:return 0
case 1:case 2:D[sp++]=o<2?p[pc-1]<<24>>24:p[pc-4]|p[pc-3]<<8|p[pc-2]<<16|p[pc-1]<<24;break
case 3:sp--;break
case 4:case 6:D[sp]=D[sp-o/2+1];sp++;break
case 5:case 7:{const k=o>>1,t=D[sp-k];D.copyWithin(sp-k,sp-k+1,sp);D[sp-1]=t}break
case 23:case 27:D[sp-1]=o<24?-D[sp-1]:~D[sp-1];break
case 48:case 49:case 50:{const j=((p[pc-2]|p[pc-1]<<8)<<16)>>16;if(o<49||!D[--sp]==(o<50))pc+=j}break
case 51:if(cp>63)return 7;C[cp++]=pc;pc=p[pc-2]|p[pc-1]<<8;break
case 52:if(!cp)return 8;pc=C[--cp];break
case 64:case 65:{const a=D[sp-1];if(a>>>0>255)return 6;if(o<65)D[sp-1]=M[a];else{M[a]=D[sp-2];sp-=2}}break
case 80:case 81:{const t=o<81?''+D[sp-1]:String.fromCharCode(D[sp-1]&255);if(s.length+t.length>65536)return 11;s+=t;sp--}break
case 82:D[sp++]=ip<i.length?i[ip++]:-1;break
case 83:return D[--sp]&255
}
if(sp>256)return 3
}}
const{MAKEFUN_INPUT_DIR:I='/input',MAKEFUN_OUTPUT_DIR:Q='/output'}=process.env
for(const d of fs.readdirSync(I)){
const u=I+'/'+d+'/',c=run(fs.readFileSync(u+'program.bin'),fs.readFileSync(u+'input.bin')),o=Q+'/'+d
fs.mkdirSync(o,{recursive:!0})
fs.writeFileSync(o+'/stdout.bin',s,'latin1')
fs.writeFileSync(o+'/exit.txt',''+c)
}
