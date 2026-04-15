const SERVER_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const gameMode = localStorage.getItem('gameMode') || 'practice';
  let currentStageId = parseInt(localStorage.getItem('currentStage')) || 1;
  const playerName = localStorage.getItem('playerName') || '玩家';
  const roomCode = localStorage.getItem('roomCode');

  let socket = null;
  let score = 0;
  
  const ui = {
    title: document.getElementById('stage-title'),
    score: document.getElementById('player-score'),
    status: document.getElementById('connection-status'),
    dialogBox: document.getElementById('dialog-box'),
    speaker: document.getElementById('speaker-name'),
    text: document.getElementById('dialog-text'),
    btnNext: document.getElementById('btn-next-dialog'),
    overlay: document.getElementById('question-overlay'),
    minigameOverlay: document.getElementById('minigame-overlay'),
    minigameContent: document.getElementById('minigame-content'),
    qText: document.getElementById('question-text'),
    qOptions: document.getElementById('question-options'),
    gameArea: document.getElementById('game-area')
  };

  // Content Data based on the textbook implementation plan
  const stages = {
    1: {
      title: "第一章：學堂裡的階級",
      bg: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      script: [
        { speaker: "系統", text: "1910年代的臺灣街道，畫面上出現了不同的學校。" },
        { speaker: "主角", text: "我想就讀師資最好的『小學校』，但負責人說這裡原則上只收日本人..." },
        { speaker: "系統", text: "為了升學，你發現普通中學極少。總督府主要發展醫學、農工商等職業學校。" },
        { speaker: "主角", text: "聽說1928年創辦了『臺北帝國大學』，但臺灣籍學生極少，許多人選擇赴日留學。" },
        { type: "question", question: "總督府建立現代教育體系，並設立公學校、小學校，其『差別待遇』原則為何？", 
          options: [
            { text: "依據成績分發，無關族群", correct: false },
            { text: "原則上日本人念小學校，臺灣人念公學校", correct: true },
            { text: "原住民與臺灣人皆唸小學校", correct: false }
          ]
        },
        { type: "question", question: "主角從公學校畢業了想要繼續升學。當時總督府主要鼓勵臺灣人就讀哪一種類型的學校以培養初級技術人才？", 
          options: [
            { text: "普通中學", correct: false },
            { text: "職業學校（如醫學、師範、農工商）", correct: true },
            { text: "大學", correct: false }
          ]
        },
        { type: "question", question: "1928年創立的最高學府，也是當時唯一的大學是？", 
          options: [
            { text: "臺北帝國大學", correct: true },
            { text: "臺灣大學", correct: false },
            { text: "臺中中學校", correct: false }
          ]
        }
      ]
    },
    2: {
      title: "第二章：島嶼的處方籤",
      bg: "https://images.unsplash.com/photo-1519494140681-8007eb23bcce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      script: [
        { speaker: "系統", text: "1920年代，受到一戰後『民族自決』思潮刺激，知識份子展開政治社會運動。" },
        { speaker: "蔣渭水", text: "臺灣島這位病人得了重病，必須開立臨床講義處方籤！" },
        { type: "question", question: "蔣渭水將「臺灣島」視為病人，請問在《臨床講義》中，這位病人到底得了什麼病？", 
          options: [
            { text: "霍亂", correct: false },
            { text: "智識之營養不良", correct: true },
            { text: "近視", correct: false }
          ]
        },
        { type: "interactive", minigame: "clinical_notes" },
        { speaker: "系統", text: "接下來，請回顧社會運動的發展順序與組織理念。" },
        { type: "question", question: "哪一項運動是臺灣首次爭取政治權利的開端，且持續最久（1921-1934）？", 
          options: [
            { text: "臺灣民眾黨", correct: false },
            { text: "臺灣議會設置請願運動", correct: true },
            { text: "臺灣地方自治聯盟", correct: false }
          ]
        },
        { type: "question", question: "蔣渭水等人成立了哪一個組織，發行《臺灣民報》並舉辦文化演講來啟蒙大眾？", 
          options: [
            { text: "臺灣文化協會", correct: true },
            { text: "臺灣農民組合", correct: false }
          ]
        },
        { type: "question", question: "玩家切換至鄉村青年視角。哪一個組織不僅宣傳民權，還積極扶助農、工運動，為基層爭取權益？", 
          options: [
            { text: "臺灣地方自治聯盟", correct: false },
            { text: "臺灣民眾黨", correct: true },
            { text: "臺灣文化協會", correct: false }
          ]
        }
      ]
    },
    3: {
      title: "第三章：摩登時代的陰影",
      bg: "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      script: [
        { speaker: "系統", text: "來到都市，你看到了自來水廠、下水道、火車站與林百貨。" },
        { speaker: "主角", text: "表面上生活很進步，但總督府的政策背後是否隱藏著目的？讓我們用『放大鏡』找出來！" },
        { type: "interactive", minigame: "magnifier_clues" },
        { speaker: "系統", text: "1937年中日戰爭爆發，皇民化運動全面展開，推行改日本姓名、穿和服。" },
        { type: "question", question: "火車站等公共場所設立時鐘，引進星期制，是為了培養民眾的什麼習慣？", 
          options: [
            { text: "守法習慣", correct: false },
            { text: "健康習慣", correct: false },
            { text: "守時習慣", correct: true }
          ]
        },
        { type: "question", question: "總督府興建自來水廠、下水道，並實施檢疫，主要是為了建立？", 
          options: [
            { text: "現代衛生觀念", correct: true },
            { text: "都會休閒文化", correct: false }
          ]
        },
        { type: "question", question: "1937年後推行日本化運動，吳濁流小說《先生媽》中，主角堅持穿臺灣衫並將和服剪碎。她抵抗的是當時哪一項政策？", 
          options: [
            { text: "民族自決", correct: false },
            { text: "皇民化運動", correct: true },
            { text: "內地延長主義", correct: false }
          ]
        }
      ]
    },
    4: {
      title: "總結：島嶼回憶錄",
      bg: "https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      script: [
        { speaker: "系統", text: "恭喜您完成了一連串的時空探索！現在，我們來進行最後的『歷史漫談』總複習。" },
        { type: "interactive", minigame: "fill_in_the_blank" }
      ]
    }
  };

  let currentScriptIndex = 0;
  let activeStageData = null;

  function initSocket() {
    if (gameMode === 'multiplayer' && roomCode) {
      socket = io(SERVER_URL);
      ui.status.textContent = `連線狀態: 已連線 (房號: ${roomCode})`;
      ui.status.style.color = '#4ade80';

      // Join back invisibly just to restore socket link if refreshed
      socket.emit('join_room', { roomCode, name: playerName }, () => {
        // Teacher starts new stage
        socket.on('stage_started', (stageId) => {
          loadStage(stageId);
        });
      });
    } else {
      ui.status.textContent = "連線狀態: 單機練習模式";
    }
  }

  function loadStage(stageId) {
    currentStageId = stageId;
    activeStageData = stages[stageId];
    if (!activeStageData) return;

    ui.title.textContent = activeStageData.title;
    ui.gameArea.style.backgroundImage = `url('${activeStageData.bg}')`;
    currentScriptIndex = 0;
    ui.dialogBox.classList.remove('hidden');
    ui.overlay.classList.add('hidden');
    
    playNextScript();
  }

  function playNextScript() {
    if (currentScriptIndex >= activeStageData.script.length) {
      ui.dialogBox.classList.remove('hidden');
      ui.overlay.classList.add('hidden');
      ui.minigameOverlay.classList.add('hidden');
      
      ui.speaker.textContent = "系統";
      if (gameMode === 'practice') {
        ui.text.innerHTML = "本關卡結束！<br><br><a href='./index.html' style='color: var(--primary-color);'>👉 返回首頁換關卡</a>";
      } else {
        ui.text.textContent = "本關卡結束！請等待老師發布下一關。";
      }
      ui.btnNext.style.display = "none";
      return;
    }

    const snippet = activeStageData.script[currentScriptIndex];
    if (snippet.type === "question") {
      showQuestion(snippet);
    } else if (snippet.type === "interactive") {
      showMinigame(snippet.minigame);
    } else {
      ui.dialogBox.classList.remove('hidden');
      ui.overlay.classList.add('hidden');
      ui.minigameOverlay.classList.add('hidden');
      ui.speaker.textContent = snippet.speaker;
      ui.text.textContent = snippet.text;
      ui.btnNext.style.display = "inline-block";
    }
  }

  function showQuestion(qData) {
    ui.dialogBox.classList.add('hidden');
    ui.overlay.classList.remove('hidden');
    ui.minigameOverlay.classList.add('hidden');
    
    ui.qText.textContent = qData.question;
    ui.qOptions.innerHTML = '';

    qData.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.textContent = opt.text;
      btn.onclick = () => handleAnswer(opt.correct);
      ui.qOptions.appendChild(btn);
    });
  }

  function handleAnswer(isCorrect) {
    if (isCorrect) {
      score += 10;
      ui.score.textContent = score;
      alert("答對了！獲得 10 分！");
      if (socket) {
        socket.emit('submit_score', { stageId: currentStageId, scoreEarned: 10 });
      }
    } else {
      alert("答錯了！請再接再厲！");
    }

    currentScriptIndex++;
    playNextScript();
  }

  function showMinigame(minigameId) {
    ui.dialogBox.classList.add('hidden');
    ui.overlay.classList.add('hidden');
    ui.minigameOverlay.classList.remove('hidden');
    ui.minigameContent.innerHTML = '';

    if (minigameId === 'clinical_notes') {
      ui.minigameContent.innerHTML = `
        <h3 style="margin-bottom: 20px;">臨床講義：調配處方籤</h3>
        <p>請為被診斷為「智識之營養不良」的臺灣開立處方。選出並組合三種「極量」的解藥：</p>
        <div style="display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; justify-content: center;">
          <button class="btn btn-secondary rx-item">吃西藥</button>
          <button class="btn btn-secondary rx-item" data-correct="true">正規學校教育</button>
          <button class="btn btn-secondary rx-item" data-correct="true">圖書館</button>
          <button class="btn btn-secondary rx-item" data-correct="true">讀報社</button>
          <button class="btn btn-secondary rx-item">求神問卜</button>
        </div>
        <div style="margin-top: 30px;">
          <button id="rx-submit" class="btn">提交配方</button>
        </div>
      `;
      let selected = [];
      const items = ui.minigameContent.querySelectorAll('.rx-item');
      items.forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('btn-secondary');
          btn.style.backgroundColor = btn.style.backgroundColor === 'var(--primary-color)' ? '' : 'var(--primary-color)';
        });
      });

      document.getElementById('rx-submit').addEventListener('click', () => {
        let correctCount = 0;
        let incorrectCount = 0;
        items.forEach(btn => {
          if(btn.style.backgroundColor === 'var(--primary-color)') {
            if(btn.getAttribute('data-correct') === 'true') correctCount++;
            else incorrectCount++;
          }
        });
        
        if (correctCount === 3 && incorrectCount === 0) {
          alert('配方完全正確！教育、圖書館與報紙是解救社會的最佳良藥。獲得 20 分！');
          score += 20;
          ui.score.textContent = score;
          if (socket) socket.emit('submit_score', { stageId: currentStageId, scoreEarned: 20 });
          currentScriptIndex++;
          playNextScript();
        } else {
          alert('配方有誤！請再思考一下蔣渭水的理念是什麼？');
        }
      });
    }

    if (minigameId === 'magnifier_clues') {
      ui.minigameContent.innerHTML = `
        <h3 style="margin-bottom: 20px;">現代化的真相</h3>
        <p>請使用右下角的調查按鈕，找出不合理的「特許證明」與政策目的。</p>
        <div style="position: relative; width: 80%; height: 200px; background: rgba(255,255,255,0.1); border-radius: 12px; margin-top: 20px;">
          <div id="clue1" style="position: absolute; top: 30%; left: 20%; cursor: url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'red\\' stroke-width=\\'2\\'><circle cx=\\'11\\' cy=\\'11\\' r=\\'8\\'/><line x1=\\'21\\' y1=\\'21\\' x2=\\'16.65\\' y2=\\'16.65\\'/></svg>') 16 16, auto; width: 60px; height: 60px; border: 2px dashed rgba(255,255,255,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center;">📝</div>
        </div>
      `;
      
      document.getElementById('clue1').addEventListener('click', () => {
        alert('發現「鴉片吸食特許證明」！\n原來漸禁政策並沒有根絕誠意，反而是專賣制度的一種搖錢樹。');
        score += 15;
        ui.score.textContent = score;
        if (socket) socket.emit('submit_score', { stageId: currentStageId, scoreEarned: 15 });
        currentScriptIndex++;
        playNextScript();
      });
    }

    if (minigameId === 'fill_in_the_blank') {
      ui.minigameContent.innerHTML = `
        <h3 style="margin-bottom: 20px;">歷史漫談：對話填空</h3>
        <p style="font-size: 1.2rem; line-height: 2;">
          1920年代，受到 <select id="fill1" style="font-size: 1.1rem; padding: 5px;"><option value="">請選擇</option><option value="內地延長">內地延長</option><option value="民族自決">民族自決</option><option value="皇民化">皇民化</option></select> 
          思潮刺激，展開了政治社會運動；但後來因為1937年 
          <select id="fill2" style="font-size: 1.1rem; padding: 5px;"><option value="">請選擇</option><option value="中日戰爭">中日戰爭</option><option value="霧社事件">霧社事件</option><option value="第一次世界大戰">第一次世界大戰</option></select> 
          爆發，運動受到打壓而結束。
        </p>
        <div style="margin-top: 30px;">
          <button id="fill-submit" class="btn">提交結算</button>
        </div>
      `;

      document.getElementById('fill-submit').addEventListener('click', () => {
        const f1 = document.getElementById('fill1').value;
        const f2 = document.getElementById('fill2').value;
        
        if (f1 === "民族自決" && f2 === "中日戰爭") {
          score += 30;
          ui.score.textContent = score;
          if (socket) socket.emit('submit_score', { stageId: currentStageId, scoreEarned: 30 });
          alert('完全正確！感謝您的遊玩！這就是當時臺灣的歷史記憶。');
          currentScriptIndex++;
          playNextScript();
        } else {
          alert('似乎有哪裡不對喔！請回想一下二三章的內容！');
        }
      });
    }
  }

  ui.btnNext.addEventListener('click', () => {
    currentScriptIndex++;
    playNextScript();
  });

  // Initialization
  initSocket();
  if (gameMode === 'practice' || currentStageId) {
    loadStage(currentStageId);
  } else {
    ui.text.textContent = "等待老師發送關卡...";
    ui.btnNext.style.display = "none";
  }
});
