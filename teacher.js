const SERVER_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const btnCreateRoom = document.getElementById('btn-create-room');
  const teacherSetup = document.getElementById('teacher-setup');
  const teacherDashboard = document.getElementById('teacher-dashboard');
  
  const displayRoomCode = document.getElementById('display-room-code');
  const playerCount = document.getElementById('player-count');
  const leaderboard = document.getElementById('leaderboard');
  const stageBtns = document.querySelectorAll('.stage-btn');

  let socket = null;

  if (btnCreateRoom) {
    btnCreateRoom.addEventListener('click', () => {
      socket = io(SERVER_URL);

      socket.on('connect', () => {
        socket.emit('create_room', (res) => {
          if (res.success) {
            teacherSetup.classList.add('hidden');
            teacherDashboard.classList.remove('hidden');
            displayRoomCode.textContent = res.roomCode;
          }
        });
      });

      // Update player list when someone joins or leaves
      socket.on('player_joined', updateLeaderboard);
      socket.on('player_left', updateLeaderboard);
      socket.on('score_updated', updateLeaderboard);

      socket.on('connect_error', () => {
        alert("無法連線到伺服器，請確認伺服器已啟動 (`node server.js`)。");
        socket.disconnect();
      });
    });
  }

  function updateLeaderboard(players) {
    playerCount.textContent = players.length;
    
    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    leaderboard.innerHTML = '';
    sortedPlayers.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${p.name}</span> <span style="font-weight: bold; color: var(--primary-color);">${p.score} 分</span>`;
      leaderboard.appendChild(li);
    });
  }

  // Handle stage buttons
  stageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stageId = parseInt(btn.getAttribute('data-stage'));
      if (socket) {
        socket.emit('start_stage', stageId);
        // Highlight active button
        stageBtns.forEach(b => b.style.borderColor = 'var(--glass-border)');
        btn.style.borderColor = 'var(--primary-color)';
        btn.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';
      }
    });
  });
});
