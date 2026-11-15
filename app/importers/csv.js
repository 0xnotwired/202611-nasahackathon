const MAX_BYTES=5*1024*1024,MAX_ROWS=10001,MAX_COLUMNS=64,MAX_FIELD=16384;
export const fail=(code,field)=>({ok:false,error:{code,field,message:`Import rejected: ${code} (${field})`}});
// UTF8 file/identity fingerprints must not collapse lone surrogates to U+FFFD.
export function isWellFormed(text){
 for(let i=0;i<text.length;i++){
  const c=text.charCodeAt(i);
  if(c>=0xd800&&c<=0xdbff){const next=text.charCodeAt(++i);if(!(next>=0xdc00&&next<=0xdfff))return false;}
  else if(c>=0xdc00&&c<=0xdfff)return false;
 }
 return true;
}
/** Delimited text is data only. No evaluation, DOM, filesystem or remote access. */
export function csv(input,delimiter) {
 if(typeof input!=='string'||!input.length)return fail('input','text');
 if(input.length>MAX_BYTES)return fail('capacity','text');
 if(!isWellFormed(input))return fail('invalid_encoding','text');
 if(new TextEncoder().encode(input).length>MAX_BYTES)return fail('capacity','text');
 let text=input.charCodeAt(0)===0xfeff?input.slice(1):input;
 if(text.includes('\0'))return fail('csv_syntax','text');
 const rows=[];let cells=[],value='',state='start',bad=false,physical=1,start=1;
 function cell(){cells.push(value);value='';if(cells.length>MAX_COLUMNS)throw 'capacity';}
 function row(){cell();if(cells.length!==1||cells[0]!==''||bad)rows.push({cells,bad,row:start});cells=[];bad=false;if(rows.length>MAX_ROWS)throw 'capacity';}
 try {
  for(let i=0;i<text.length;i++){
   const c=text[i],newline=c==='\r'||c==='\n';
   if(state==='quoted'){
    if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else state='after';}
    else {value+=c;if(newline){if(c==='\r'&&text[i+1]==='\n'){value+='\n';i++;}physical++;}}
   }else if(newline){row();if(c==='\r'&&text[i+1]==='\n')i++;physical++;start=physical;state='start';}
   else if(c===delimiter){cell();state='start';}
   else if(c==='"'){if(state==='start')state='quoted';else{bad=true;value+=c;}}
   else {if(state==='after')bad=true;value+=c;state='plain';}
   if(value.length>MAX_FIELD)throw 'capacity';
  }
  if(state==='quoted')return fail('csv_syntax','text');
  if(value||cells.length||bad||state==='after')row();
 }catch(code){return fail(code==='capacity'?'capacity':'csv_syntax','text');}
 if(!rows.length)return fail('header','header');
 const header=rows.shift();const names=header.cells;
 if(header.bad||names.some(n=>!n||n.length>128||/[\u0000-\u001f]/.test(n)||['__proto__','constructor','prototype'].includes(n))||new Set(names).size!==names.length)return fail('header','header');
 return {ok:true,value:{headers:names,rows}};
}
