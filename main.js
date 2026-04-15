// Configuration
const SERVER_URL = 'http://localhost:3000'; // Make sure the Node server is running here

// Lobby Logic
document.addEventListener('DOMContentLoaded', () => {
  const lobbyView = document.getElementById('lobby-view');
  const joinView = document.getElementById('join-view');
  const waitingView = document.getElementById('waiting-view');
  const practiceSelectView = document.getElementById('practice-select-view');
  
  const btnPracticeSelect = document.getElementById('btn-practice-select');
  const btnJoinMultiplayer = document.getElementById('btn-join-multiplayer');
  const btnTeacherMode = document.getElementById('btn-teacher-mode');
  const btnBackLobby = document.getElementById('btn-back-lobby');
  const btnBackLobbyFromPractice = document.getElementById('btn-back-lobby-from-practice');
  const btnSubmitJoin = document.getElementById('btn-submit-join');

  let socket = null;

  // Navigation
  if (btnPracticeSelect) {
    btnPracticeSelect.addEventListener('click', () => {
      lobbyView.classList.add('hidden');
      practiceSelectView.classList.remove('hidden');
    });
  }

  if (btnBackLobbyFromPractice) {
    btnBackLobbyFromPractice.addEventListener('click', () => {
      practiceSelectView.classList.add('hidden');
      lobbyView.classList.remove('hidden');
    });
  }

  // Handle stage buttons in practice mode
  document.querySelectorAll('#practice-select-view .stage-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stage = btn.getAttribute('data-stage');
      localStorage.setItem('gameMode', 'practice');
      localStorage.setItem('currentStage', stage);
      window.location.href = './game.html';
    });
  });

  if (btnTeacherMode) {
    btnTeacherMode.addEventListener('click', () => {
      window.location.href = './teacher.html';
    });
  }

  if (btnJoinMultiplayer) {
    btnJoinMultiplayer.addEventListener('click', () => {
      lobbyView.classList.add('hidden');
      joinView.classList.remove('hidden');
    });
  }

  if (btnBackLobby) {
    btnBackLobby.addEventListener('click', () => {
      joinView.classList.add('hidden');
      lobbyView.classList.remove('hidden');
    });
  }

  if (btnSubmitJoin) {
    btnSubmitJoin.addEventListener('click', () => {
      const name = document.getElementById('join-name').value.trim();
      const code = document.getElementById('join-code').value.trim();
      const errorMsg = document.getElementById('join-error');

      if (!name || code.length !== 4) {
        errorMsg.textContent = "請輸入有效的暱稱與4碼房間代號！";
        errorMsg.classList.remove('hidden');
        return;
      }

      // Initialize Socket
      socket = io(SERVER_URL);
      
      socket.on('connect', () => {
        socket.emit('join_room', { roomCode: code, name: name }, (res) => {
          if (res.success) {
            // Joined successfully
            joinView.classList.add('hidden');
            waitingView.classList.remove('hidden');
            document.getElementById('waiting-room-code').textContent = code;
            errorMsg.classList.add('hidden');
            
            // Store details for game.html
            localStorage.setItem('gameMode', 'multiplayer');
            localStorage.setItem('playerName', name);
            localStorage.setItem('roomCode', code);
          } else {
            errorMsg.textContent = res.message || "加入失敗，請確認代號是否正確。";
            errorMsg.classList.remove('hidden');
            socket.disconnect();
          }
        });
      });

      socket.on('stage_started', (stageId) => {
        // Teacher started game, redirect to game view
        localStorage.setItem('currentStage', stageId);
        window.location.href = './game.html';
      });

      socket.on('room_closed', () => {
        alert('老師已關閉房間');
        window.location.reload();
      });
      
      socket.on('connect_error', () => {
        errorMsg.textContent = "無法連線到伺服器，請確認伺服器已啟動。";
        errorMsg.classList.remove('hidden');
      });
    });
  }
});
