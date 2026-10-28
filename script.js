(() => {
  const landing = document.getElementById('gloryLanding');
  const loadingTrack = document.getElementById('loadingTrack');
  const loadingFill = document.getElementById('loadingFill');
  const loadingCaption = document.getElementById('loadingCaption');
  const glowButton = document.getElementById('glowButton');
  const boothApp = document.getElementById('boothApp');
  const video = document.getElementById('camera');
  const placeholder = document.getElementById('cameraPlaceholder');
  const startCameraBtn = document.getElementById('startCameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const resultModal = document.getElementById('resultModal');
  const warningModal = document.getElementById('warningModal');
  const downloadBtn = document.getElementById('downloadBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const countdownEl = document.getElementById('countdown');
  const cameraStatus = document.getElementById('cameraStatus');
  const stripPhotos = document.getElementById('stripPhotos');
  const frameOverlay = document.getElementById('frameOverlay');
  const message = document.getElementById('message');
  const SHOT_COUNT = 3;
  const LOADING_DURATION = 2600;
  const COUNTDOWN_SECONDS = 3;
  const FRAME_SRC = 'assets/frames/glory-original.png';
  const FRAME = { width:910, height:2048, x:114, slotWidth:682, slotHeight:443, y:[106,596,1085] };
  let stream = null;
  let shots = [];
  let running = false;
  let sessionComplete = false;

  const setMessage = text => { message.textContent = text; };
  function startLandingLoader(){
    const start = performance.now();
    function tick(now){
      const progress = Math.min(100, ((now-start)/LOADING_DURATION)*100);
      loadingFill.style.width = `${progress}%`;
      loadingTrack.setAttribute('aria-valuenow', String(Math.round(progress)));
      if(progress < 100) requestAnimationFrame(tick);
      else { loadingTrack.classList.add('hidden'); loadingCaption.classList.add('hidden'); glowButton.classList.remove('hidden'); }
    }
    requestAnimationFrame(tick);
  }
  glowButton.addEventListener('click', () => {
    warningModal.classList.remove('hidden');
    document.getElementById('warningNext').focus();
  });
  document.getElementById('warningNext').addEventListener('click', () => {
    warningModal.classList.add('hidden');
    resultModal.classList.remove('hidden');
    document.getElementById('resultContinue').focus();
  });
  document.getElementById('resultContinue').addEventListener('click', () => {
    resultModal.classList.add('hidden');
    landing.classList.add('hidden');
    boothApp.classList.remove('hidden');
    window.scrollTo(0,0);
  });
  async function enableCamera(){
    if(!navigator.mediaDevices?.getUserMedia){ setMessage('Camera access needs HTTPS or localhost. Open this site through Live Server.'); return; }
    try{
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});
      video.srcObject = stream;
      video.style.display = 'block';
      placeholder.classList.add('hidden');
      cameraStatus.textContent = 'CAMERA READY';
      startCameraBtn.textContent = 'CAMERA READY ✓';
      startCameraBtn.disabled = true;
      captureBtn.disabled = false;
      setMessage('Camera ready! Press TAKE PHOTOS when you are ready.');
    }catch(error){
      console.error(error);
      setMessage(error.name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access in your browser settings.' : error.name === 'NotFoundError' ? 'No camera was found on this device.' : 'Could not open the camera. Check browser permissions and try again.');
    }
  }
  const wait = ms => new Promise(resolve => setTimeout(resolve,ms));
  async function countdown(){
    countdownEl.classList.remove('hidden');
    for(let n=COUNTDOWN_SECONDS;n>0;n--){countdownEl.textContent=n;await wait(1000);}
    countdownEl.textContent='✦'; await wait(250); countdownEl.classList.add('hidden');
  }
  function captureFrame(){
    const width=video.videoWidth||1280, height=video.videoHeight||960;
    const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
    const ctx=canvas.getContext('2d'); ctx.translate(width,0); ctx.scale(-1,1); ctx.drawImage(video,0,0,width,height);
    return canvas.toDataURL('image/jpeg',0.94);
  }
  async function runSession(){
    if(!stream||running||sessionComplete)return;
    running=true; captureBtn.disabled=true; startCameraBtn.disabled=true;
    try{
      while(shots.length<SHOT_COUNT){
        setMessage(`Get ready for photo ${shots.length+1} of ${SHOT_COUNT}…`);
        await countdown();
        if(!video.videoWidth) await wait(300);
        shots.push(captureFrame()); renderPreview();
        if(shots.length<SHOT_COUNT) await wait(650);
      }
      sessionComplete=true;
      setMessage('Your GLORY photo strip is ready! Download it or retake your photos.');
      downloadBtn.classList.remove('hidden'); retakeBtn.classList.remove('hidden');
    }catch(error){console.error(error);setMessage('Something went wrong while taking photos. Please try again.');}
    finally{running=false;startCameraBtn.disabled=!!stream;updateControls();}
  }
  function renderPreview(){
    stripPhotos.innerHTML='';
    for(let i=0;i<SHOT_COUNT;i++){
      const slot=document.createElement('div');slot.className='photo-slot';
      if(shots[i]){const img=document.createElement('img');img.src=shots[i];img.alt=`Photo ${i+1}`;slot.appendChild(img);}
      stripPhotos.appendChild(slot);
    }
    updateControls();
  }
  function updateControls(){
    captureBtn.disabled=!stream||running||sessionComplete;
    downloadBtn.disabled=!sessionComplete;
    retakeBtn.disabled=running||shots.length===0;
  }
  function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Could not load image: ${src}`));img.src=src;});}
  async function makeStripCanvas(){
    const canvas=document.createElement('canvas');canvas.width=FRAME.width;canvas.height=FRAME.height;
    const ctx=canvas.getContext('2d');
    for(let i=0;i<SHOT_COUNT;i++){
      const img=await loadImage(shots[i]);
      const x=FRAME.x,y=FRAME.y[i],w=FRAME.slotWidth,h=FRAME.slotHeight;
      const target=w/h, source=img.width/img.height;let sx=0,sy=0,sw=img.width,sh=img.height;
      if(source>target){sw=img.height*target;sx=(img.width-sw)/2;}else{sh=img.width/target;sy=(img.height-sh)/2;}
      ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h); ctx.restore();
    }
    const frame=await loadImage(FRAME_SRC);ctx.drawImage(frame,0,0,FRAME.width,FRAME.height);
    return canvas;
  }
  function canvasToBlob(canvas){
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG conversion failed')),'image/png'));
  }
  function showSaveImageDialog(blob){
    const url=URL.createObjectURL(blob);
    const overlay=document.createElement('div');
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
    overlay.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(20,15,15,.85);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
    const box=document.createElement('div');
    box.style.cssText='background:#fffcee;border-radius:18px;padding:16px;max-width:440px;width:100%;max-height:94vh;overflow:auto;text-align:center;color:#5b4c46;font-family:system-ui,sans-serif;';
    const title=document.createElement('p');title.textContent='Save your GLORY photo ✨';title.style.cssText='font-weight:700;margin:4px 0 10px;';
    const help=document.createElement('p');help.textContent='iPhone / iPad: แตะรูปค้างไว้ แล้วเลือก Save to Photos / บันทึกไปยังรูปภาพ';help.style.cssText='font-size:13px;line-height:1.5;';
    const img=document.createElement('img');img.src=url;img.alt='Your GLORY photo strip';img.style.cssText='display:block;max-width:100%;max-height:55vh;object-fit:contain;margin:auto;';
    const open=document.createElement('a');open.href=url;open.target='_blank';open.rel='noopener';open.textContent='OPEN IMAGE';open.style.cssText='display:inline-block;margin:12px 8px;padding:10px 14px;border-radius:20px;background:#5b4c46;color:white;text-decoration:none;';
    const close=document.createElement('button');close.type='button';close.textContent='CLOSE';close.style.cssText='padding:10px 14px;border-radius:20px;border:1px solid #5b4c46;background:white;color:#5b4c46;';
    close.addEventListener('click',()=>{overlay.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
    box.append(title,help,img,open,close);overlay.appendChild(box);document.body.appendChild(overlay);
  }
  async function downloadStrip(){
    if(!sessionComplete)return;
    downloadBtn.disabled=true;downloadBtn.textContent='PREPARING…';
    try{
      const canvas=await makeStripCanvas();
      const blob=await canvasToBlob(canvas);
      const file=new File([blob],'glory-photobooth.png',{type:'image/png'});
      const mobile=/iPad|iPhone|iPod|Android/i.test(navigator.userAgent)||
        (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
      if(mobile && navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
        try{
          await navigator.share({files:[file],title:'GLORY Photobooth'});
          setMessage('เลือก Save Image / Save to Files ในเมนูแชร์เพื่อบันทึกรูป');
          return;
        }catch(err){
          if(err.name==='AbortError'){setMessage('ยกเลิกการแชร์รูปแล้ว');return;}
          console.warn('Share failed; showing image save option',err);
        }
      }
      if(mobile){
        showSaveImageDialog(blob);
        setMessage('แตะรูปค้างไว้เพื่อบันทึกภาพ หรือเลือก OPEN IMAGE');
      }else{
        const url=URL.createObjectURL(blob);
        const link=document.createElement('a');link.download='glory-photobooth.png';link.href=url;
        document.body.appendChild(link);link.click();link.remove();
        setTimeout(()=>URL.revokeObjectURL(url),60000);
        setMessage('Downloaded! Your GLORY photo strip is saved to your device.');
      }
    }catch(error){console.error(error);setMessage('Could not export the strip. Please try again in a recent browser.');}
    finally{downloadBtn.textContent='DOWNLOAD PHOTO STRIP ↓';downloadBtn.disabled=!sessionComplete;}
  }
  function resetSession(){shots=[];sessionComplete=false;renderPreview();downloadBtn.classList.add('hidden');retakeBtn.classList.add('hidden');setMessage('Ready for a fresh set! Press TAKE PHOTOS.');updateControls();}
  startCameraBtn.addEventListener('click',enableCamera);
  captureBtn.addEventListener('click',runSession);
  downloadBtn.addEventListener('click',downloadStrip);
  retakeBtn.addEventListener('click',resetSession);
  frameOverlay.addEventListener('error',()=>console.warn('Could not load GLORY frame PNG.'));
  renderPreview();updateControls();startLandingLoader();
})();
