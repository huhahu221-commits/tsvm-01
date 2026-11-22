// tiny-stack-vm-01: an interpreter of make.fun's tiny stack ISA (kit generator/subject/ISA.md), written from the spec.
// T[opcode] is how many values it pops ('x' where no opcode names the byte); F[opcode-16] is the arithmetic ops'.
import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs'
const T='00011223xxxxxxxx222222212221222x222xxxxxxxxxxxxx01100xxxxxxxxxxx12xxxxxxxxxxxxxx1101'
const F=[(a,b)=>a+b,(a,b)=>a-b,(a,b)=>Math.imul(a,b),(a,b)=>(a/b)|0,(a,b)=>(a%b)|0,(a,b)=>Math.floor((a>>>0)/(b>>>0))|0,(a,b)=>((a>>>0)%(b>>>0))|0,,(a,b)=>a&b,(a,b)=>a|b,(a,b)=>a^b,,(a,b)=>a<<(b&31),(a,b)=>a>>(b&31),(a,b)=>a>>>(b&31),,(a,b)=>a===b?1:0,(a,b)=>a<b?1:0,(a,b)=>a>>>0<b>>>0?1:0]
let O
function run(p,i){
const D=new Int32Array(257),C=new Int32Array(64),M=new Int32Array(256)
let sp=0,cp=0,pc=0,ip=0,st=0
O=[]
for(;;){
if(st===1e6)return 10
if(pc>>>0>=p.length)return 9
const op=p[pc],po=+T[op]
if(!(po>=0))return 5
const im=op<3?op**2:op>47&&op<52?2:0
if(pc+im>=p.length)return 9
st++
const nx=pc+1+im
if(sp<po)return 2
pc=nx
if(F[op-16]){
const b=D[sp-1],a=D[sp-2]
if(op>18&&op<23&&!b)return 4
D[sp-2]=F[op-16](a,b);sp--
}else switch(op){
case 0:return 0
case 1:D[sp++]=p[nx-1]<<24>>24;break
case 2:D[sp++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;break
case 3:sp--;break
case 4:D[sp]=D[sp-1];sp++;break
case 5:{const t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t}break
case 6:D[sp]=D[sp-2];sp++;break
case 7:{const t=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=t}break
case 23:D[sp-1]=-D[sp-1];break
case 27:D[sp-1]=~D[sp-1];break
case 48:case 49:case 50:{
const j=((p[nx-2]|p[nx-1]<<8)<<16)>>16
if(op<49||!D[--sp]===(op===49))pc=nx+j
break
}
case 51:if(cp===64)return 7;C[cp++]=nx;pc=p[nx-2]|p[nx-1]<<8;break
case 52:if(!cp)return 8;pc=C[--cp];break
case 64:if(D[sp-1]>>>0>255)return 6;D[sp-1]=M[D[sp-1]];break
case 65:if(D[sp-1]>>>0>255)return 6;M[D[sp-1]]=D[sp-2];sp-=2;break
case 80:{const t=''+D[sp-1];if(O.length+t.length>65536)return 11;sp--;O.push(...Buffer.from(t))}break
case 81:if(O.length>65535)return 11;O.push(D[--sp]&255);break
case 82:D[sp++]=ip<i.length?i[ip++]:-1;break
case 83:return D[--sp]&255
}
if(sp>256)return 3
}}
const I=process.env.MAKEFUN_INPUT_DIR??'/input',Q=process.env.MAKEFUN_OUTPUT_DIR??'/output'
for(const id of readdirSync(I)){
const c=run(readFileSync(I+'/'+id+'/program.bin'),readFileSync(I+'/'+id+'/input.bin')),d=Q+'/'+id
mkdirSync(d,{recursive:true})
writeFileSync(d+'/stdout.bin',Buffer.from(O))
writeFileSync(d+'/exit.txt',''+c)
}
