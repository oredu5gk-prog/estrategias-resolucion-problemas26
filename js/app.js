const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('#main-menu');
if(toggle&&menu){
  toggle.addEventListener('click',()=>{
    const open=menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded',String(open));
  });
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
  }));
}

const diagnostic=document.querySelector('.diagnostic');
const downloadButton=document.querySelector('#download-evidence');
const validationMessage=document.querySelector('#validation-message');
const evidenceCard=document.querySelector('#evidence-card');
const MIN_CHARS=200;
const answers=[1,2,3,4].map(n=>document.querySelector(`#answer-${n}`));

function updateCounter(textarea){
  const counter=document.querySelector(`#count-${textarea.id.split('-')[1]}`);
  if(!counter)return;
  const count=textarea.value.trim().length;
  counter.textContent=`${count} / ${MIN_CHARS} caracteres mínimos`;
  counter.classList.toggle('valid',count>=MIN_CHARS);
  counter.classList.toggle('invalid',count<MIN_CHARS);
}

answers.forEach(textarea=>{
  if(!textarea)return;
  textarea.addEventListener('input',()=>updateCounter(textarea));
  updateCounter(textarea);
});

function validateDiagnostic(){
  const name=document.querySelector('#student-name')?.value.trim()||'';
  const account=document.querySelector('#student-account')?.value.trim()||'';
  if(!name||!account){
    return 'Completa tu nombre completo y número de cuenta antes de descargar la evidencia.';
  }
  const incomplete=answers.filter(answer=>(answer?.value.trim().length||0)<MIN_CHARS);
  if(incomplete.length){
    return `Aún faltan ${incomplete.length} respuesta(s) con un mínimo de ${MIN_CHARS} caracteres.`;
  }
  return '';
}

if(downloadButton&&diagnostic&&evidenceCard){
  downloadButton.addEventListener('click',async()=>{
    validationMessage.className='validation-message';
    const error=validateDiagnostic();
    if(error){
      validationMessage.textContent=error;
      return;
    }
    if(typeof html2canvas==='undefined'){
      validationMessage.textContent='No fue posible preparar la captura. Verifica tu conexión a internet e inténtalo nuevamente.';
      return;
    }
    downloadButton.disabled=true;
    downloadButton.textContent='Preparando evidencia…';
    validationMessage.textContent='';
    try{
      const canvas=await html2canvas(evidenceCard,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false});
      const link=document.createElement('a');
      const name=document.querySelector('#student-name').value.trim().replace(/[^a-zA-ZÀ-ÿ0-9_-]+/g,'_').replace(/^_+|_+$/g,'');
      const account=document.querySelector('#student-account').value.trim().replace(/[^a-zA-Z0-9_-]+/g,'_');
      link.download=`Evidencia_Diagnostico_M1_${name||'Alumno'}_${account||'Cuenta'}.png`;
      link.href=canvas.toDataURL('image/png');
      link.click();
      validationMessage.textContent='Evidencia descargada correctamente.';
      validationMessage.className='validation-message success';
    }catch(error){
      console.error(error);
      validationMessage.textContent='No fue posible generar la captura. Inténtalo nuevamente.';
    }finally{
      downloadButton.disabled=false;
      downloadButton.textContent='Descargar evidencias';
    }
  });
}