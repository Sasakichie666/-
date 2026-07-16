// network.js
// ============================================================
// 联机通信模块
// 负责 PeerJS 初始化、房间创建/加入、消息收发与状态同步
// 依赖全局：GameState, AudioEngine, cards.js, game.js 中的函数
// ============================================================

'use strict';

// ---------- 辅助函数 ----------

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let s = '';
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

// ---------- 状态同步广播 ----------

function broadcastState() {
    if (!GameState.isHost) return;

    const meldedMap = {};
    GameState.players.forEach(pid => {
        if (pid === GameState.myPlayerId) meldedMap[pid] = [...GameState.myMelded];
        else meldedMap[pid] = [...(GameState._oppMelded[pid] || [])];
    });

    const data = {
        type: 'sync',
        fieldCards: GameState.fieldCards,
        deckCount: GameState.deck.length,
        currentPlayerIndex: GameState.currentPlayerIndex,
        phase: GameState.phase,
        koikoiPending: GameState.koikoiPending,
        players: GameState.players,
        playerNames: GameState.playerNames,
        oppHandCounts: {},
        meldedMap,
        scores: GameState.scores,
    };

    GameState.players.forEach(pid => {
        if (pid !== GameState.myPlayerId) {
            data.oppHandCounts[pid] = (GameState._oppHands[pid] || []).length;
        }
    });

    Object.values(GameState.connections).forEach(conn => conn.send(JSON.stringify(data)));
}

// ---------- 客户端同步处理 ----------

function handleSync(data) {
    GameState.fieldCards = data.fieldCards;
    GameState.currentPlayerIndex = data.currentPlayerIndex;
    GameState.phase = data.phase;
    GameState.koikoiPending = data.koikoiPending || false;
    GameState.players = data.players;
    GameState.playerNames = data.playerNames;
    GameState.scores = data.scores || {};

    if (data.meldedMap) {
        GameState.myMelded = data.meldedMap[GameState.myPlayerId] || [];
    }

    GameState._oppMelded = {};
    if (data.meldedMap) {
        GameState.players.forEach(pid => {
            if (pid !== GameState.myPlayerId) {
                GameState._oppMelded[pid] = data.meldedMap[pid] || [];
            }
        });
    }

    GameState._oppHands = {};
    for (const [pid, cnt] of Object.entries(data.oppHandCounts || {})) {
        if (pid !== GameState.myPlayerId) {
            GameState._oppHands[pid] = new Array(cnt).fill('?');
        }
    }

    GameState.deck = new Array(data.deckCount).fill('?');

    if (GameState.players[GameState.currentPlayerIndex] !== GameState.myPlayerId) {
        GameState.selectedHandCard = null;
    }

    renderAll();
}

// ---------- 主机端玩家操作处理 ----------

function handlePlayerAction(d, conn) {
    const pid = d.playerId;

    if (d.action === 'pair') {
        const oh = GameState._oppHands[pid] || [];
        if (!oh.includes(d.handCardId)) {
            addLog(`无效配对请求，玩家${pid}缺少手牌${d.handCardId}`);
            broadcastState();
            return;
        }
        GameState._oppHands[pid] = oh.filter(id => id !== d.handCardId);
        if (!removeFieldCardById(d.fieldCardId)) removeFieldCard(d.fieldIndex);

        if (!GameState._oppMelded[pid]) GameState._oppMelded[pid] = [];
        GameState._oppMelded[pid].push(d.handCardId, d.fieldCardId);

        afterAction(pid, false, 'pair');

    } else if (d.action === 'discard') {
        const oh = GameState._oppHands[pid] || [];
        if (oh.includes(d.cardId)) {
            GameState._oppHands[pid] = oh.filter(id => id !== d.cardId);
            if (d.coverIndex >= 0 && GameState.fieldCards.length >= 8) {
                const fc = GameState.fieldCards[d.coverIndex];
                if (typeof fc === 'string') GameState.fieldCards[d.coverIndex] = { cards: [fc], top: d.cardId };
                else { fc.cards.push(fc.top); fc.top = d.cardId; }
            } else {
                GameState.fieldCards.push(d.cardId);
            }
        }
        afterAction(pid, false, 'discard');

    } else if (d.action === 'agari') {
        const agariCheck = checkAgari(GameState._oppHands[pid] || [], GameState._oppMelded[pid] || []);
        const isKoikoi = GameState.playerKoikoiUsed[pid];
        const totalScore = isKoikoi ? agariCheck.totalScore * 2 : agariCheck.totalScore;
        const agariId = Date.now() + '_' + Math.random();
        const agariData = {
            playerName: GameState.playerNames[pid] || pid.substring(0, 6),
            playerId: pid,
            meldedCombos: agariCheck.meldedCombos,
            handCombos: agariCheck.handCombos,
            meldedScore: agariCheck.meldedScore,
            handScore: agariCheck.handScore,
            totalScore,
            agariId,
            isKoikoi,
        };
        showAgariDetailModal(agariData);
        Object.values(GameState.connections).forEach(c => {
            if (c.peer !== pid) c.send(JSON.stringify({ type: 'agariDetail', ...agariData }));
        });

    } else if (d.action === 'koikoi') {
        const hand = GameState._oppHands[pid] || [];
        const melded = GameState._oppMelded[pid] || [];
        const handCombos = detectCombos(hand);
        const meldedCombos = detectCombos(melded);
        const allNames = new Set([...handCombos.map(c => c.name), ...meldedCombos.map(c => c.name)]);
        GameState.playerPrevCombos[pid] = allNames;
        GameState.playerKoikoiUsed[pid] = true;

        if (GameState.deck.length) {
            const drawn = GameState.deck.pop();
            GameState._oppHands[pid].push(drawn);
            const targetConn = GameState.connections[pid];
            if (targetConn) targetConn.send(JSON.stringify({ type: 'drawResult', cards: [drawn] }));
        }

        Object.values(GameState.connections).forEach(c => {
            if (c.peer !== pid) c.send(JSON.stringify({ type: 'koikoiUsed', playerId: pid }));
        });

        GameState.koikoiPending = false;
        afterAction(pid, true);

    } else if (d.type === 'confirmDraw') {
        handleDraw();
        broadcastState();
        renderAll();
    }
}

// ---------- Peer 连接设置 ----------

function setupPeerAsHost(roomCode) {
    const peerId = 'hanafuda-' + roomCode;
    const options = {
        debug: 0,
        secure: true,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ],
            iceCandidatePoolSize: 2
        }
    };

    GameState.peer = new Peer(peerId, options);

    GameState.peer.on('open', id => {
        GameState.myPlayerId = id;
        GameState.players = [id];
        GameState.playerNames[id] = '房主';
        GameState.scores[id] = 0;
        document.getElementById('room-id-display').textContent = '房间: ' + roomCode;
        document.getElementById('game-area').style.display = '';
        renderAll();
        addLog(`房间创建成功 ${roomCode} (${GameState.maxPlayers}人)`);
    });

    GameState.peer.on('connection', conn => {
        conn.on('open', () => {
            if (GameState.players.length >= GameState.maxPlayers) {
                conn.close();
                return;
            }
            GameState.connections[conn.peer] = conn;
            const newName = '玩家' + GameState.players.length;
            GameState.players.push(conn.peer);
            GameState.playerNames[conn.peer] = newName;
            GameState.scores[conn.peer] = 0;
            addLog(`${newName} 加入`);

            conn.send(JSON.stringify({
                type: 'welcome',
                players: GameState.players,
                playerNames: GameState.playerNames,
                roomId: roomCode,
                yourId: conn.peer,
                scores: GameState.scores
            }));

            broadcastState();
            renderAll();
        });

        conn.on('data', raw => {
            const d = JSON.parse(raw);
            if (d.type === 'playerAction') {
                handlePlayerAction(d, conn);
            } else if (d.type === 'confirmAgari') {
                confirmAgari(d.playerId, d.score, d.agariId);
            } else if (d.type === 'confirmDraw') {
                handleDraw();
                broadcastState();
                renderAll();
            }
        });

        conn.on('close', () => {
            delete GameState.connections[conn.peer];
            GameState.players = GameState.players.filter(p => p !== conn.peer);
            addLog('玩家离开');
            broadcastState();
            renderAll();
        });

        conn.on('error', err => {
            addLog('连接错误: ' + err);
        });
    });

    GameState.peer.on('error', err => {
        if (err.type === 'unavailable-id') {
            addLog('房间码被占用，重新生成...');
            createRoom();
        } else {
            addLog('错误: ' + err.message);
        }
    });
}

function setupPeerAsClient() {
    const options = {
        debug: 0,
        secure: true,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ],
            iceCandidatePoolSize: 2
        }
    };

    GameState.peer = new Peer(options);
    GameState.peer.on('open', id => {
        GameState.myPlayerId = id;
    });
}

// ---------- 房间操作 ----------

function createRoom() {
    if (GameState.peer) GameState.peer.destroy();
    GameState.isHost = true;
    GameState.roomId = generateRoomCode();
    GameState.maxPlayers = parseInt(document.getElementById('player-count-select').value);
    setupPeerAsHost(GameState.roomId);
}

function joinRoom() {
    const code = document.getElementById('join-room-input').value.trim().toUpperCase();
    if (!code) return addLog('请输入房间号');
    if (GameState.peer) GameState.peer.destroy();

    GameState.isHost = false;
    GameState.roomId = code;
    setupPeerAsClient();

    GameState.peer.on('open', () => {
        const conn = GameState.peer.connect('hanafuda-' + code, { reliable: true });
        conn.on('open', () => {
            GameState.connections[conn.peer] = conn;
            document.getElementById('room-id-display').textContent = '房间: ' + code;
            document.getElementById('game-area').style.display = '';

            conn.on('data', raw => {
                const d = JSON.parse(raw);
                switch (d.type) {
                    case 'welcome':
                        GameState.players = d.players;
                        GameState.playerNames = d.playerNames;
                        GameState.myPlayerId = d.yourId;
                        GameState.scores = d.scores || {};
                        renderAll();
                        break;
                    case 'sync':
                        handleSync(d);
                        break;
                    case 'startGame':
                        GameState.fieldCards = d.fieldCards;
                        GameState.myHand = d.myHand;
                        GameState.myMelded = [];
                        GameState._oppHands = d.oppHands;
                        GameState._oppMelded = {};
                        GameState.currentPlayerIndex = d.currentPlayerIndex;
                        GameState.phase = 'playing';
                        GameState.scores = d.scores || GameState.scores;
                        document.getElementById('game-area').style.display = '';
                        renderAll();
                        addLog('游戏开始！');
                        if (GameState.players[GameState.currentPlayerIndex] === GameState.myPlayerId) {
                            AudioEngine.turnStart();
                        }
                        break;
                    case 'newRound':
                        GameState.myHand = d.myHand;
                        GameState.fieldCards = d.fieldCards;
                        GameState.currentPlayerIndex = d.currentPlayerIndex;
                        GameState.deck = new Array(d.deckCount).fill('?');
                        GameState.scores = d.scores || GameState.scores;
                        GameState.myMelded = [];
                        GameState.koikoiPending = false;
                        GameState.selectedHandCard = null;
                        GameState.phase = 'playing';
                        renderAll();
                        addLog('新回合开始');
                        if (GameState.players[GameState.currentPlayerIndex] === GameState.myPlayerId) {
                            AudioEngine.turnStart();
                        }
                        break;
                    case 'drawResult':
                        d.cards.forEach(card => GameState.myHand.push(card));
                        renderAll();
                        addLog('抽到: ' + d.cards.map(id => getCardDef(id)?.name).join(','));
                        break;
                    case 'canAgari':
                        GameState.koikoiPending = true;
                        showAgariModal();
                        break;
                    case 'agariDetail':
                        showAgariDetailModal(d);
                        break;
                    case 'koikoiUsed':
                        GameState.playerKoikoiUsed[d.playerId] = true;
                        addLog(`玩家 ${d.playerId.substring(0, 6)} 已使用KoiKoi`);
                        break;
                    case 'drawGame':
                        showDrawModal();
                        break;
                }
            });

            conn.on('close', () => {
                addLog('断开连接');
                location.reload();
            });
        });
        conn.on('error', () => addLog('无法连接房间'));
    });
}