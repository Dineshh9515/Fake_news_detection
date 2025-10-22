const textEl = document.getElementById('text');
const analyzeBtn = document.getElementById('analyze');
const clearBtn = document.getElementById('clear');
const resultEl = document.getElementById('result');
const labelEl = document.getElementById('label');
const confEl = document.getElementById('confidence');
const breakdownEl = document.getElementById('breakdown');
const needleEl = document.getElementById('needle');

function setLoading(isLoading){
  if(isLoading){
    analyzeBtn.classList.add('loading');
    analyzeBtn.disabled = true;
  }else{
    analyzeBtn.classList.remove('loading');
    analyzeBtn.disabled = false;
  }
}

function setNeedle(label, confidence){
  // Map Fake (0deg) to Not Fake (180deg)
  const angle = label === 'Not Fake' ? 180 * confidence : 180 * (1 - confidence);
  needleEl.style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

async function predict(){
  const text = textEl.value.trim();
  if(!text){
    textEl.focus();
    return;
  }
  setLoading(true);
  try{
    const res = await fetch('/api/predict',{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ text })
    });

    // Try to safely parse JSON; handle empty/non-JSON bodies gracefully
    const raw = await res.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch(_) { data = null; }

    if(!res.ok){
      const msg = (data && (data.error || data.detail)) || `Request failed (${res.status})`;
      throw new Error(msg);
    }

    if(!data){
      throw new Error('Empty response from server');
    }

    resultEl.classList.remove('hidden');
    labelEl.textContent = data.label;
    confEl.textContent = `Confidence: ${(data.confidence*100).toFixed(1)}%`;
    setNeedle(data.label, data.confidence);

    breakdownEl.innerHTML = '';
    (data.all || []).forEach(item => {
      const row = document.createElement('div');
      row.className = 'row';
      const left = document.createElement('div');
      left.textContent = item.label;
      const right = document.createElement('div');
      right.textContent = `${(item.score*100).toFixed(1)}%`;
      row.appendChild(left); row.appendChild(right);
      breakdownEl.appendChild(row);
    });
  }catch(err){
    alert(err.message || 'Something went wrong');
  }finally{
    setLoading(false);
  }
}

analyzeBtn.addEventListener('click', predict);
clearBtn.addEventListener('click', () => {
  textEl.value='';
  resultEl.classList.add('hidden');
});

textEl.addEventListener('keydown', e => {
  if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='enter'){
    predict();
  }
});
