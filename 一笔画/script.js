/**
 * 走遍天下无重复：一笔画与欧拉图 — 少儿奥数趣味互动课堂
 * Core Logic, Canvas Graph Engines, Custom Synthesized Sound & Visual Animations
 */

// 全局状态
let soundEnabled = true;
let highestUnlockedLevel = 1;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 播放纯前端合成音效
function playSound(type) {
    if (!soundEnabled) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    } else if (type === 'success') {
        // 大调上行和弦 (C5 -> E5 -> G5)
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.08, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.25);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.3);
        });
    } else if (type === 'error') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(130, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'fanfare') {
        // 通关交响
        const chords = [261.63, 329.63, 392.00, 523.25, 659.25];
        chords.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            gain.gain.setValueAtTime(0.06, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.06 + 0.5);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.6);
        });
    }
}

// 粒子爆炸效果系统
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeParticleCanvas);
resizeParticleCanvas();

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 4;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * -6 - 2;
        this.gravity = 0.15;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
    }
    update() {
        this.x += this.speedX;
        this.speedY += this.gravity;
        this.y += this.speedY;
        this.alpha -= this.decay;
    }
    draw() {
        pCtx.save();
        pCtx.globalAlpha = this.alpha;
        pCtx.fillStyle = this.color;
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
    }
}

function spawnSuccessParticles(x, y) {
    const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
    for (let i = 0; i < 40; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, color));
    }
}

function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        } else {
            particles[i].draw();
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();


// 初始化与加载
window.addEventListener('DOMContentLoaded', () => {
    initSoundToggle();
    initLevelNav();
    loadProgress();
    
    // 初始化关卡引擎
    initL1();
    initL2();
    initL3();
    initL4();
    initL5();
    initL6();
    initL7();
});

// 音效控制
function initSoundToggle() {
    const btn = document.getElementById('soundToggleBtn');
    btn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const icon = btn.querySelector('.icon');
        const label = btn.querySelector('.label');
        if (soundEnabled) {
            icon.textContent = '🔊';
            label.textContent = '音效: 开';
            playSound('click');
        } else {
            icon.textContent = '🔇';
            label.textContent = '音效: 关';
        }
    });
}

// 关卡进度管理
function loadProgress() {
    const saved = localStorage.getItem('euler_math_unlocked_level');
    if (saved) {
        highestUnlockedLevel = parseInt(saved);
        updateLevelIndicators();
    }
}

function unlockLevel(lvlNum) {
    if (lvlNum > highestUnlockedLevel) {
        highestUnlockedLevel = lvlNum;
        localStorage.setItem('euler_math_unlocked_level', highestUnlockedLevel);
        updateLevelIndicators();
    }
}

function updateLevelIndicators() {
    const indicators = document.querySelectorAll('.level-indicator');
    indicators.forEach(ind => {
        const lvl = parseInt(ind.getAttribute('data-level'));
        if (lvl <= highestUnlockedLevel) {
            ind.classList.remove('locked');
            if (lvl < highestUnlockedLevel) {
                ind.classList.add('completed');
            }
        }
    });
}

function initLevelNav() {
    const indicators = document.querySelectorAll('.level-indicator');
    indicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const lvl = parseInt(ind.getAttribute('data-level'));
            if (lvl <= highestUnlockedLevel) {
                switchLevelTo(lvl);
            } else {
                playSound('error');
                alert(`🔒 这一关还没解锁哦！请先答对前面的题目解锁吧。`);
            }
        });
    });
}

function switchLevelTo(levelNum) {
    playSound('click');
    document.querySelectorAll('.level-indicator').forEach(ind => {
        const lvl = parseInt(ind.getAttribute('data-level'));
        ind.classList.remove('active');
        if (lvl === levelNum) ind.classList.add('active');
    });
    
    document.querySelectorAll('.level-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`level-${levelNum}`).classList.add('active');
    
    // 刷新对应关卡画布尺寸与渲染
    if (levelNum === 1) resizeCanvasL1();
    if (levelNum === 2) resetL2Drawing();
    if (levelNum === 3) resetL3Drawing();
    if (levelNum === 4) resetL4Drawing();
    if (levelNum === 5) renderL5();
    if (levelNum === 6) renderL6();
    if (levelNum === 7) resetL7Level();
}


/* =================== LEVEL 1: 奇点与偶点探测器 =================== */
let l1ActiveTab = 'A';
const l1Canvas = document.getElementById('l1-canvas');
const l1Ctx = l1Canvas.getContext('2d');
let l1Nodes = [];
let l1Edges = [];
let l1HoverNode = null;
let l1PulseTime = 0;

// 格子房数据 (H, I, J, L 是奇点)
const l1GraphA = {
    nodes: [
        { id: 'A', label: 'A', x: 150, y: 70 },
        { id: 'B', label: 'B', x: 350, y: 70 },
        { id: 'C', label: 'C', x: 150, y: 150 },
        { id: 'D', label: 'D', x: 350, y: 150 },
        { id: 'E', label: 'E', x: 250, y: 190 },
        { id: 'F', label: 'F', x: 50, y: 240 },
        { id: 'G', label: 'G', x: 450, y: 240 },
        { id: 'H', label: 'H', x: 150, y: 240 },
        { id: 'I', label: 'I', x: 250, y: 240 },
        { id: 'J', label: 'J', x: 350, y: 240 },
        { id: 'K', label: 'K', x: 150, y: 310 },
        { id: 'L', label: 'L', x: 250, y: 310 },
        { id: 'M', label: 'M', x: 350, y: 310 }
    ],
    edges: [
        { u: 'A', v: 'B' }, { u: 'A', v: 'C' }, { u: 'B', v: 'D' },
        { u: 'C', v: 'E' }, { u: 'D', v: 'E' },
        { u: 'E', v: 'F' }, { u: 'E', v: 'G' },
        { u: 'F', v: 'H' }, { u: 'H', v: 'I' }, { u: 'I', v: 'J' }, { u: 'J', v: 'G' },
        { u: 'H', v: 'K' }, { u: 'I', v: 'L' }, { u: 'J', v: 'M' },
        { u: 'K', v: 'L' }, { u: 'L', v: 'M' }
    ]
};

// 小洋房数据 (B, D, C, H 是奇点)
const l1GraphB = {
    nodes: [
        { id: 'A', label: 'A', x: 120, y: 100 },
        { id: 'B', label: 'B', x: 100, y: 180 },
        { id: 'C', label: 'C', x: 300, y: 180 },
        { id: 'D', label: 'D', x: 280, y: 100 },
        { id: 'E', label: 'E', x: 100, y: 280 },
        { id: 'F', label: 'F', x: 170, y: 280 },
        { id: 'G', label: 'G', x: 230, y: 280 },
        { id: 'H', label: 'H', x: 300, y: 280 },
        { id: 'I', label: 'I', x: 370, y: 250 },
        { id: 'J', label: 'J', x: 370, y: 140 }
    ],
    edges: [
        { u: 'A', v: 'D' }, { u: 'A', v: 'B' }, { u: 'D', v: 'C' },
        { u: 'B', v: 'C' }, { u: 'B', v: 'E' }, { u: 'C', v: 'H' },
        { u: 'E', v: 'F' }, { u: 'G', v: 'H' },
        { u: 'D', v: 'J' }, { u: 'H', v: 'I' }, { u: 'J', v: 'I' }
    ]
};

function initL1() {
    // 标签切换
    document.getElementById('l1-tab-a').addEventListener('click', () => setL1Tab('A'));
    document.getElementById('l1-tab-b').addEventListener('click', () => setL1Tab('B'));
    
    // 事件
    l1Canvas.addEventListener('mousemove', handleL1MouseMove);
    l1Canvas.addEventListener('click', handleL1Click);
    l1Canvas.addEventListener('touchstart', handleL1TouchStart, {passive: false});
    
    setL1Tab('A');
    requestAnimationFrame(renderLoopL1);
}

function setL1Tab(tab) {
    l1ActiveTab = tab;
    document.getElementById('l1-tab-a').classList.toggle('active', tab === 'A');
    document.getElementById('l1-tab-b').classList.toggle('active', tab === 'B');
    
    const source = tab === 'A' ? l1GraphA : l1GraphB;
    l1Nodes = JSON.parse(JSON.stringify(source.nodes)).map(n => {
        n.clicked = false;
        n.degree = source.edges.filter(e => e.u === n.id || e.v === n.id).length;
        n.isOdd = n.degree % 2 !== 0;
        return n;
    });
    l1Edges = JSON.parse(JSON.stringify(source.edges));
    
    document.getElementById('l1-q1-text').innerHTML = `请在左图【${tab === 'A' ? '格子房' : '小洋房'}】中找出所有的奇点，点击将它们点亮。`;
    updateL1Counter();
    
    // 清理反馈
    document.getElementById('l1-feedback-1').style.display = 'none';
    document.getElementById('l1-check-btn').disabled = true;
}

function updateL1Counter() {
    const totalOdds = l1Nodes.filter(n => n.isOdd).length;
    const foundOdds = l1Nodes.filter(n => n.isOdd && n.clicked).length;
    document.getElementById('l1-odd-found').textContent = foundOdds;
    document.getElementById('l1-odd-total').textContent = totalOdds;
    
    // 当找到所有的奇点后，解锁确定按钮
    const incorrectClicks = l1Nodes.filter(n => !n.isOdd && n.clicked).length;
    if (foundOdds === totalOdds && incorrectClicks === 0) {
        document.getElementById('l1-check-btn').disabled = false;
    } else {
        document.getElementById('l1-check-btn').disabled = true;
    }
}

function resizeCanvasL1() {
    // 保持高分屏清晰度
}

function handleL1MouseMove(e) {
    const rect = l1Canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    l1HoverNode = null;
    for (const node of l1Nodes) {
        const dist = Math.hypot(node.x - x, node.y - y);
        if (dist < 18) {
            l1HoverNode = node;
            break;
        }
    }
}

function handleL1TouchStart(e) {
    e.preventDefault();
    const rect = l1Canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    l1HoverNode = null;
    for (const node of l1Nodes) {
        const dist = Math.hypot(node.x - x, node.y - y);
        if (dist < 22) {
            l1HoverNode = node;
            // 触发点击
            toggleL1Node(node, touch.clientX, touch.clientY);
            break;
        }
    }
}

function handleL1Click(e) {
    if (l1HoverNode) {
        toggleL1Node(l1HoverNode, e.clientX, e.clientY);
    }
}

function toggleL1Node(node, clientX, clientY) {
    node.clicked = !node.clicked;
    if (node.clicked) {
        if (node.isOdd) {
            playSound('success');
            spawnSuccessParticles(clientX, clientY);
        } else {
            playSound('error');
        }
    } else {
        playSound('click');
    }
    updateL1Counter();
}

function renderLoopL1() {
    l1PulseTime += 0.05;
    
    l1Ctx.clearRect(0, 0, l1Canvas.width, l1Canvas.height);
    
    // 1. 画线 (连接线段)
    l1Ctx.lineWidth = 4;
    l1Ctx.lineCap = 'round';
    l1Ctx.strokeStyle = '#c7d2fe';
    for (const edge of l1Edges) {
        const uNode = l1Nodes.find(n => n.id === edge.u);
        const vNode = l1Nodes.find(n => n.id === edge.v);
        l1Ctx.beginPath();
        l1Ctx.moveTo(uNode.x, uNode.y);
        l1Ctx.lineTo(vNode.x, vNode.y);
        l1Ctx.stroke();
        
        // 能量光流动画 (hover的时候流动)
        if (l1HoverNode && (l1HoverNode.id === edge.u || l1HoverNode.id === edge.v)) {
            const flowStart = l1HoverNode.id === edge.u ? uNode : vNode;
            const flowEnd = l1HoverNode.id === edge.u ? vNode : uNode;
            const percent = (l1PulseTime % 1);
            const px = flowStart.x + (flowEnd.x - flowStart.x) * percent;
            const py = flowStart.y + (flowEnd.y - flowStart.y) * percent;
            
            l1Ctx.fillStyle = '#8b5cf6';
            l1Ctx.beginPath();
            l1Ctx.arc(px, py, 6, 0, Math.PI*2);
            l1Ctx.fill();
        }
    }
    
    // 2. 画顶点
    for (const node of l1Nodes) {
        l1Ctx.save();
        
        const isHover = l1HoverNode && l1HoverNode.id === node.id;
        const radius = isHover ? 18 : 14;
        
        // 阴影发光效果
        if (node.clicked) {
            l1Ctx.shadowBlur = 15;
            l1Ctx.shadowColor = node.isOdd ? '#ec4899' : '#ef4444';
        } else if (isHover) {
            l1Ctx.shadowBlur = 10;
            l1Ctx.shadowColor = '#6366f1';
        }
        
        // 填充颜色
        if (node.clicked) {
            l1Ctx.fillStyle = node.isOdd ? 'url(#gradPinkL1)' : '#ef4444';
            const grad = l1Ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, radius);
            grad.addColorStop(0, '#fbcfe8');
            grad.addColorStop(1, node.isOdd ? '#ec4899' : '#dc2626');
            l1Ctx.fillStyle = grad;
            l1Ctx.strokeStyle = '#fff';
            l1Ctx.lineWidth = 3;
        } else {
            l1Ctx.fillStyle = '#ffffff';
            l1Ctx.strokeStyle = isHover ? '#6366f1' : '#a5b4fc';
            l1Ctx.lineWidth = 3;
        }
        
        l1Ctx.beginPath();
        l1Ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        l1Ctx.fill();
        l1Ctx.stroke();
        
        // 画度数小徽章 (Hover时展示)
        if (isHover) {
            l1Ctx.shadowBlur = 0;
            l1Ctx.fillStyle = node.isOdd ? '#ec4899' : '#10b981';
            l1Ctx.beginPath();
            l1Ctx.arc(node.x + 15, node.y - 15, 10, 0, Math.PI*2);
            l1Ctx.fill();
            
            l1Ctx.fillStyle = '#fff';
            l1Ctx.font = 'bold 11px Outfit';
            l1Ctx.textAlign = 'center';
            l1Ctx.textBaseline = 'middle';
            l1Ctx.fillText(node.degree, node.x + 15, node.y - 15);
        }
        
        // 标示字母
        l1Ctx.shadowBlur = 0;
        l1Ctx.fillStyle = node.clicked ? '#ffffff' : '#334155';
        l1Ctx.font = 'bold 11px Outfit, Noto Sans SC';
        l1Ctx.textAlign = 'center';
        l1Ctx.textBaseline = 'middle';
        l1Ctx.fillText(node.label, node.x, node.y);
        
        l1Ctx.restore();
    }
    
    // 渲染 U形门拱门 (仅在图B中)
    if (l1ActiveTab === 'B') {
        l1Ctx.strokeStyle = '#c7d2fe';
        l1Ctx.lineWidth = 4;
        l1Ctx.beginPath();
        l1Ctx.arc(200, 280, 30, Math.PI, 0); // 门拱
        l1Ctx.stroke();
    }
    
    requestAnimationFrame(renderLoopL1);
}

function checkL1ClickPhase() {
    const feedback = document.getElementById('l1-feedback-1');
    feedback.className = 'quiz-feedback success';
    feedback.innerHTML = `🎉 厉害！所有的奇点都找全啦！【奇点数量都是 4 个】。第二道选择题已解锁！`;
    feedback.style.display = 'block';
    playSound('success');
    
    // 解锁阶段二
    document.getElementById('l1-q2-card').classList.remove('locked');
    document.querySelectorAll('input[name="l1-q2"]').forEach(inp => inp.disabled = false);
    document.getElementById('l1-q2-btn').disabled = false;
    document.getElementById('l1-skip-btn').disabled = false;
}

function checkL1Radio() {
    const selected = document.querySelector('input[name="l1-q2"]:checked');
    const feedback = document.getElementById('l1-feedback-2');
    if (!selected) {
        playSound('error');
        alert('请先选择一个答案选项哦！');
        return;
    }
    
    if (selected.value === 'A') {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `🎉 恭喜答对！奇点的个数必须是偶数（2, 4, 6...个），因为任何一条线段都有两个端点，添加一条线段总会改变两个顶点的度数奇偶性，因此奇点的个数只能是偶数！解锁下一关！`;
        unlockLevel(2);
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `❌ 答错啦，再想一想。如果有1个奇点，那这条奇线的另一端连着什么呢？奇数个奇点是不成立的哦！`;
    }
    feedback.style.display = 'block';
}

function skipL1() {
    unlockLevel(2);
    switchLevelTo(2);
}


/* =================== LEVEL 2: 欧拉的一笔画秘籍 =================== */
const l2Canvas = document.getElementById('l2-canvas');
const l2Ctx = l2Canvas.getContext('2d');
let l2ActiveGraph = 'butterfly';
let l2Nodes = [];
let l2Edges = [];
let l2UserPath = []; // 存储用户画线的边ID
let l2CurrentNode = null; // 当前画线所在的端点
let l2IsDrawing = false;
let l2DiagnosisActive = false;

// 四个图形的顶点与边集数据
const l2Graphs = {
    butterfly: {
        nodes: [
            { id: 'T', x: 250, y: 80, label: 'A' },     // Body top
            { id: 'B', x: 250, y: 240, label: 'B' },    // Body bottom
            { id: 'LT', x: 170, y: 60, label: 'LT' },   // Left wing top
            { id: 'LM', x: 130, y: 160, label: 'LM' },  // Left wing mid
            { id: 'LB', x: 170, y: 260, label: 'LB' },  // Left wing bot
            { id: 'RT', x: 330, y: 60, label: 'RT' },   // Right wing top
            { id: 'RM', x: 370, y: 160, label: 'RM' },  // Right wing mid
            { id: 'RB', x: 330, y: 260, label: 'RB' }   // Right wing bot
        ],
        edges: [
            { id: 'T-B', u: 'T', v: 'B' },
            { id: 'LT-T', u: 'LT', v: 'T' }, { id: 'LM-T', u: 'LM', v: 'T' },
            { id: 'LM-B', u: 'LM', v: 'B' }, { id: 'LB-B', u: 'LB', v: 'B' },
            { id: 'LT-LM', u: 'LT', v: 'LM' }, { id: 'LB-LM', u: 'LB', v: 'LM' },
            { id: 'RT-T', u: 'RT', v: 'T' }, { id: 'RM-T', u: 'RM', v: 'T' },
            { id: 'RM-B', u: 'RM', v: 'B' }, { id: 'RB-B', u: 'RB', v: 'B' },
            { id: 'RT-RM', u: 'RT', v: 'RM' }, { id: 'RB-RM', u: 'RB', v: 'RM' }
        ],
        diagnose: "🦋 蝴蝶有 4 个奇点 (LT, LB, RT, RB)。一笔画图形最多只允许有2个奇点，所以蝴蝶<b>无法一笔画成</b>！"
    },
    fan: {
        nodes: [
            { id: 'Tip', x: 250, y: 260, label: 'Tip' },
            { id: 'A1', x: 120, y: 110, label: 'A1' },
            { id: 'A2', x: 200, y: 90, label: 'A2' },
            { id: 'A3', x: 300, y: 90, label: 'A3' },
            { id: 'A4', x: 380, y: 110, label: 'A4' }
        ],
        edges: [
            { id: 'T-A1', u: 'Tip', v: 'A1' }, { id: 'T-A2', u: 'Tip', v: 'A2' },
            { id: 'T-A3', u: 'Tip', v: 'A3' }, { id: 'T-A4', u: 'Tip', v: 'A4' },
            { id: 'A1-A2', u: 'A1', v: 'A2' }, { id: 'A2-A3', u: 'A2', v: 'A3' },
            { id: 'A3-A4', u: 'A3', v: 'A4' },
            { id: 'Arc-T', u: 'A1', v: 'Tip' }, // 扇骨弧面底部装饰?
            { id: 'Arc-T2', u: 'A4', v: 'Tip' }
        ],
        // 我们在下面微调以获得4个奇点
        diagnose: "🪁 扇子拥有 4 个奇点 (A1, A2, A3, A4 都连着奇数条线)。因此<b>无法一笔画成</b>！"
    },
    cpipe: {
        nodes: [
            { id: 'N1', x: 140, y: 120, label: 'N1' },
            { id: 'N2', x: 250, y: 80, label: 'N2' },
            { id: 'N3', x: 360, y: 120, label: 'N3' },
            { id: 'N4', x: 360, y: 220, label: 'N4' },
            { id: 'N5', x: 250, y: 260, label: 'N5' },
            { id: 'N6', x: 140, y: 220, label: 'N6' }
        ],
        edges: [
            { id: '1-2', u: 'N1', v: 'N2' }, { id: '2-3', u: 'N2', v: 'N3' },
            { id: '3-4', u: 'N3', v: 'N4' }, { id: '4-5', u: 'N4', v: 'N5' },
            { id: '5-6', u: 'N5', v: 'N6' }
        ],
        diagnose: "🧲 C形管是一个开链。它只有 2 个奇点 (N1, N6)！所以<b>可以一笔画成</b>，只要从一头画到另一头！"
    },
    cup: {
        nodes: [
            { id: 'LT', x: 180, y: 100, label: 'LT' },
            { id: 'RT', x: 320, y: 100, label: 'RT' },
            { id: 'LB', x: 180, y: 240, label: 'LB' },
            { id: 'RB', x: 320, y: 240, label: 'RB' },
            { id: 'HT', x: 370, y: 130, label: 'HT' },
            { id: 'HB', x: 370, y: 210, label: 'HB' }
        ],
        edges: [
            { id: 'LT-RT', u: 'LT', v: 'RT' }, { id: 'LT-LB', u: 'LT', v: 'LB' },
            { id: 'LB-RB', u: 'LB', v: 'RB' }, { id: 'RT-RB', u: 'RT', v: 'RB' },
            { id: 'RT-HT', u: 'RT', v: 'HT' }, { id: 'HT-HB', u: 'HT', v: 'HB' },
            { id: 'HB-RB', u: 'HB', v: 'RB' }
        ],
        diagnose: "🥛 马克杯有 4 个奇点 (RT, RB 和 把手节点 HT, HB)。所以<b>无法一笔画成</b>！"
    }
};

function initL2() {
    // 图形选择按钮
    document.querySelectorAll('.graph-selector .selector-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.graph-selector .selector-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            l2ActiveGraph = btn.getAttribute('data-graph');
            resetL2Drawing();
        });
    });
    
    // 事件
    l2Canvas.addEventListener('mousedown', handleL2MouseDown);
    l2Canvas.addEventListener('mousemove', handleL2MouseMove);
    window.addEventListener('mouseup', handleL2MouseUp);
    
    l2Canvas.addEventListener('touchstart', handleL2TouchStart, {passive: false});
    l2Canvas.addEventListener('touchmove', handleL2TouchMove, {passive: false});
    window.addEventListener('touchend', handleL2TouchEnd);
    
    document.getElementById('l2-reset').addEventListener('click', resetL2Drawing);
    document.getElementById('l2-explain').addEventListener('click', toggleL2Diagnosis);
    
    resetL2Drawing();
    requestAnimationFrame(renderLoopL2);
}

function resetL2Drawing() {
    const data = l2Graphs[l2ActiveGraph];
    l2Nodes = JSON.parse(JSON.stringify(data.nodes)).map(n => {
        n.degree = data.edges.filter(e => e.u === n.id || e.v === n.id).length;
        n.isOdd = n.degree % 2 !== 0;
        return n;
    });
    l2Edges = JSON.parse(JSON.stringify(data.edges)).map(e => {
        e.drawn = false;
        return e;
    });
    l2UserPath = [];
    l2CurrentNode = null;
    l2IsDrawing = false;
    l2DiagnosisActive = false;
    document.getElementById('l2-explain-box').style.display = 'none';
    playSound('click');
}

function toggleL2Diagnosis() {
    l2DiagnosisActive = !l2DiagnosisActive;
    const box = document.getElementById('l2-explain-box');
    if (l2DiagnosisActive) {
        playSound('success');
        box.style.display = 'block';
        box.innerHTML = `🩺 <b>欧拉医生诊断</b>：<br>${l2Graphs[l2ActiveGraph].diagnose}`;
    } else {
        playSound('click');
        box.style.display = 'none';
    }
}

// 获取画布鼠标/触摸坐标
function getL2Coords(e) {
    const rect = l2Canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        cx: clientX,
        cy: clientY
    };
}

function handleL2MouseDown(e) {
    const coords = getL2Coords(e);
    startL2Draw(coords.x, coords.y, coords.cx, coords.cy);
}

function handleL2TouchStart(e) {
    e.preventDefault();
    const coords = getL2Coords(e);
    startL2Draw(coords.x, coords.y, coords.cx, coords.cy);
}

function startL2Draw(x, y, cx, cy) {
    // 寻找最近的端点起笔
    for (const node of l2Nodes) {
        if (Math.hypot(node.x - x, node.y - y) < 20) {
            l2CurrentNode = node;
            l2IsDrawing = true;
            playSound('click');
            break;
        }
    }
}

function handleL2MouseMove(e) {
    if (!l2IsDrawing || !l2CurrentNode) return;
    const coords = getL2Coords(e);
    trackL2Draw(coords.x, coords.y, coords.cx, coords.cy);
}

function handleL2TouchMove(e) {
    e.preventDefault();
    if (!l2IsDrawing || !l2CurrentNode) return;
    const coords = getL2Coords(e);
    trackL2Draw(coords.x, coords.y, coords.cx, coords.cy);
}

function trackL2Draw(x, y, cx, cy) {
    // 磁吸检测：是否滑到另一个相邻端点
    for (const node of l2Nodes) {
        if (node.id === l2CurrentNode.id) continue;
        if (Math.hypot(node.x - x, node.y - y) < 18) {
            // 查找连接这两个顶点的边
            const edge = l2Edges.find(e => 
                (e.u === l2CurrentNode.id && e.v === node.id) || 
                (e.v === l2CurrentNode.id && e.u === node.id)
            );
            
            if (edge) {
                if (!edge.drawn) {
                    edge.drawn = true;
                    l2UserPath.push(edge.id);
                    l2CurrentNode = node;
                    playSound('click');
                    spawnSuccessParticles(cx, cy);
                    
                    // 检查通关
                    checkL2PathComplete();
                } else {
                    // 重复走过的边，触发红色警告
                    edge.errorTime = 20; // 动画帧数
                    playSound('error');
                }
            }
            break;
        }
    }
}

function handleL2MouseUp() {
    l2IsDrawing = false;
}

function handleL2TouchEnd() {
    l2IsDrawing = false;
}

function checkL2PathComplete() {
    const allDrawn = l2Edges.every(e => e.drawn);
    if (allDrawn) {
        playSound('success');
        alert("🎉 哇！你太棒了！一笔画成功啦！");
        // 自动勾选答案
        const pipeCheckbox = document.querySelector('input[name="l2-q1"][value="cpipe"]');
        pipeCheckbox.checked = true;
    }
}

function renderLoopL2() {
    l2Ctx.clearRect(0, 0, l2Canvas.width, l2Canvas.height);
    
    // 1. 画边线
    for (const edge of l2Edges) {
        const uNode = l2Nodes.find(n => n.id === edge.u);
        const vNode = l2Nodes.find(n => n.id === edge.v);
        
        l2Ctx.save();
        l2Ctx.lineWidth = 5;
        l2Ctx.lineCap = 'round';
        
        if (edge.errorTime && edge.errorTime > 0) {
            // 抖动重复路径错误警告
            l2Ctx.strokeStyle = '#ef4444';
            l2Ctx.lineWidth = 7;
            edge.errorTime--;
        } else if (edge.drawn) {
            l2Ctx.strokeStyle = '#f59e0b'; // 金色代表画过的路径
            l2Ctx.shadowBlur = 8;
            l2Ctx.shadowColor = '#f59e0b';
        } else {
            l2Ctx.strokeStyle = '#c7d2fe';
        }
        
        l2Ctx.beginPath();
        l2Ctx.moveTo(uNode.x, uNode.y);
        l2Ctx.lineTo(vNode.x, vNode.y);
        l2Ctx.stroke();
        l2Ctx.restore();
    }
    
    // 2. 画端点
    for (const node of l2Nodes) {
        l2Ctx.save();
        const isCurrent = l2CurrentNode && l2CurrentNode.id === node.id;
        const radius = isCurrent ? 15 : 12;
        
        // 诊断模式高亮奇点
        if (l2DiagnosisActive && node.isOdd) {
            l2Ctx.shadowBlur = 12 + Math.sin(Date.now() / 150) * 4;
            l2Ctx.shadowColor = '#ef4444';
            l2Ctx.fillStyle = '#fef2f2';
            l2Ctx.strokeStyle = '#ef4444';
            l2Ctx.lineWidth = 3.5;
        } else if (isCurrent) {
            l2Ctx.shadowBlur = 10;
            l2Ctx.shadowColor = '#a855f7';
            l2Ctx.fillStyle = '#a855f7';
            l2Ctx.strokeStyle = '#ffffff';
            l2Ctx.lineWidth = 3;
        } else {
            l2Ctx.fillStyle = '#ffffff';
            l2Ctx.strokeStyle = '#818cf8';
            l2Ctx.lineWidth = 2.5;
        }
        
        l2Ctx.beginPath();
        l2Ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        l2Ctx.fill();
        l2Ctx.stroke();
        
        // 诊断时显示红色的度数
        if (l2DiagnosisActive && node.isOdd) {
            l2Ctx.fillStyle = '#ef4444';
            l2Ctx.font = 'bold 11px Outfit';
            l2Ctx.textAlign = 'center';
            l2Ctx.textBaseline = 'middle';
            l2Ctx.fillText(node.degree, node.x, node.y);
        }
        
        l2Ctx.restore();
    }
    
    // 特殊形状装饰
    if (l2ActiveGraph === 'butterfly') {
        // 画触角
        l2Ctx.strokeStyle = '#c7d2fe';
        l2Ctx.lineWidth = 3;
        l2Ctx.beginPath();
        l2Ctx.moveTo(250, 80);
        l2Ctx.quadraticCurveTo(230, 40, 210, 45);
        l2Ctx.moveTo(250, 80);
        l2Ctx.quadraticCurveTo(270, 40, 290, 45);
        l2Ctx.stroke();
        
        l2Ctx.fillStyle = '#c7d2fe';
        l2Ctx.beginPath();
        l2Ctx.arc(210, 45, 4, 0, Math.PI*2);
        l2Ctx.arc(290, 45, 4, 0, Math.PI*2);
        l2Ctx.fill();
    }
    
    requestAnimationFrame(renderLoopL2);
}

function checkL2() {
    const feedback = document.getElementById('l2-feedback');
    const checked = Array.from(document.querySelectorAll('input[name="l2-q1"]:checked')).map(i => i.value);
    
    if (checked.length === 1 && checked[0] === 'cpipe') {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `🎉 答对啦！只有【C形管】可以一笔画成（只有2个奇点）。其余图形都有4个奇点，无法一笔画。欧拉的一笔画定理规则展示在下方！解锁下一关！`;
        document.getElementById('l2-rule-summary').style.display = 'block';
        unlockLevel(3);
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `❌ 答错啦，请再试一试。提醒：数一数每个图形的奇点个数。只有奇点个数为 0 或 2 的图形才能一笔画。`;
    }
    feedback.style.display = 'block';
}

function skipL2() {
    unlockLevel(3);
    switchLevelTo(3);
}


/* =================== LEVEL 3: 商场通道逃脱计划 =================== */
const l3Canvas = document.getElementById('l3-canvas');
const l3Ctx = l3Canvas.getContext('2d');
let l3Nodes = [];
let l3Edges = [];
let l3IsDrawing = false;
let l3CurrentNode = null;
let l3WalkUnlocked = false;

// 原始数据
const l3OriginalGraph = {
    nodes: [
        { id: 'E', label: 'E门', x: 100, y: 260 },
        { id: 'A', label: 'A门', x: 100, y: 100 },
        { id: 'F', label: 'F门', x: 230, y: 260 },
        { id: 'B', label: 'B门', x: 230, y: 100 },
        { id: 'D', label: 'D门', x: 380, y: 260 },
        { id: 'C', label: 'C门', x: 380, y: 100 },
        { id: 'G', label: '通道G', x: 305, y: 180 }
    ],
    edges: [
        { id: 'E-A', u: 'E', v: 'A' }, { id: 'A-B', u: 'A', v: 'B' }, 
        { id: 'B-F', u: 'B', v: 'F' }, { id: 'F-E', u: 'F', v: 'E' },
        { id: 'B-C', u: 'B', v: 'C' }, { id: 'C-D', u: 'C', v: 'D' }, 
        { id: 'D-F', u: 'D', v: 'F' },
        { id: 'B-G', u: 'B', v: 'G' }, { id: 'C-G', u: 'C', v: 'G' }, 
        { id: 'D-G', u: 'D', v: 'G' }, { id: 'F-G', u: 'F', v: 'G' }
    ]
};

function initL3() {
    l3Canvas.addEventListener('mousedown', handleL3MouseDown);
    l3Canvas.addEventListener('mousemove', handleL3MouseMove);
    window.addEventListener('mouseup', handleL3MouseUp);
    
    l3Canvas.addEventListener('touchstart', handleL3TouchStart, {passive: false});
    l3Canvas.addEventListener('touchmove', handleL3TouchMove, {passive: false});
    window.addEventListener('touchend', handleL3TouchEnd);
    
    document.getElementById('l3-reset').addEventListener('click', resetL3Drawing);
    
    resetL3Drawing();
    requestAnimationFrame(renderLoopL3);
}

function resetL3Drawing() {
    l3Nodes = JSON.parse(JSON.stringify(l3OriginalGraph.nodes));
    l3Edges = JSON.parse(JSON.stringify(l3OriginalGraph.edges)).map(e => {
        e.drawn = false;
        return e;
    });
    l3IsDrawing = false;
    l3CurrentNode = null;
    hideL3Bubble();
}

function checkL3() {
    const rad = document.querySelector('input[name="l3-q1"]:checked');
    const feedback = document.getElementById('l3-feedback');
    if (!rad) {
        playSound('error');
        alert("请选择一个答案选项！");
        return;
    }
    
    if (rad.value === 'B') {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `🎉 答对了！C和D是奇点，分别连接3条线，其余都是偶点。要一笔画走完，必须从一个奇点出发，从另一个奇点出来！左图的画线区域已解锁，请拖动小人完成一笔画！`;
        document.getElementById('l3-hint-action').style.display = 'block';
        l3WalkUnlocked = true;
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `❌ 答错啦，请数一数各点的连接数。A(2条), B(4条), C(3条), D(3条), E(2条), F(4条), G(4条)。所以奇点是C和D哦。`;
        l3WalkUnlocked = false;
    }
    feedback.style.display = 'block';
}

function handleL3MouseDown(e) {
    if (!l3WalkUnlocked) return;
    const coords = getL3Coords(e);
    startL3Draw(coords.x, coords.y);
}

function handleL3TouchStart(e) {
    if (!l3WalkUnlocked) return;
    e.preventDefault();
    const coords = getL3Coords(e);
    startL3Draw(coords.x, coords.y);
}

function startL3Draw(x, y) {
    // 磁吸检测
    for (const node of l3Nodes) {
        if (Math.hypot(node.x - x, node.y - y) < 22) {
            // 起点约束验证：只能从C或者D起笔！
            if (l3Edges.every(e => !e.drawn) && node.id !== 'C' && node.id !== 'D') {
                playSound('error');
                showL3Bubble(node.x, node.y, "🤔 唔！这里的通道是偶数条。如果我从这里起笔，后面就会被困住！我要从奇大门（C或D）进商场才行哦！");
                return;
            }
            l3CurrentNode = node;
            l3IsDrawing = true;
            hideL3Bubble();
            playSound('click');
            break;
        }
    }
}

function handleL3MouseMove(e) {
    if (!l3IsDrawing || !l3CurrentNode) return;
    const coords = getL3Coords(e);
    trackL3Draw(coords.x, coords.y, coords.cx, coords.cy);
}

function handleL3TouchMove(e) {
    e.preventDefault();
    if (!l3IsDrawing || !l3CurrentNode) return;
    const coords = getL3Coords(e);
    trackL3Draw(coords.x, coords.y, coords.cx, coords.cy);
}

function trackL3Draw(x, y, cx, cy) {
    for (const node of l3Nodes) {
        if (node.id === l3CurrentNode.id) continue;
        if (Math.hypot(node.x - x, node.y - y) < 20) {
            const edge = l3Edges.find(e => 
                (e.u === l3CurrentNode.id && e.v === node.id) || 
                (e.v === l3CurrentNode.id && e.u === node.id)
            );
            if (edge) {
                if (!edge.drawn) {
                    edge.drawn = true;
                    l3CurrentNode = node;
                    playSound('click');
                    spawnSuccessParticles(cx, cy);
                    checkL3Win();
                } else {
                    edge.errorTime = 18;
                    playSound('error');
                }
            }
            break;
        }
    }
}

function handleL3MouseUp() {
    l3IsDrawing = false;
}
function handleL3TouchEnd() {
    l3IsDrawing = false;
}

function showL3Bubble(x, y, text) {
    const bubble = document.getElementById('l3-bubble');
    const containerRect = l3Canvas.parentNode.getBoundingClientRect();
    bubble.style.display = 'block';
    bubble.innerHTML = text;
    bubble.style.left = (x - 40) + 'px';
    bubble.style.top = (y - 95) + 'px';
}

function hideL3Bubble() {
    document.getElementById('l3-bubble').style.display = 'none';
}

function checkL3Win() {
    const won = l3Edges.every(e => e.drawn);
    if (won) {
        playSound('success');
        alert("🎉 商场逃脱成功！你太棒了，完美的一笔画路线！解锁下一关！");
        unlockLevel(4);
    }
}

function renderLoopL3() {
    l3Ctx.clearRect(0, 0, l3Canvas.width, l3Canvas.height);
    
    // 1. 画商场墙体通道
    for (const edge of l3Edges) {
        const uNode = l3Nodes.find(n => n.id === edge.u);
        const vNode = l3Nodes.find(n => n.id === edge.v);
        
        l3Ctx.save();
        l3Ctx.lineWidth = 6;
        l3Ctx.lineCap = 'round';
        if (edge.errorTime && edge.errorTime > 0) {
            l3Ctx.strokeStyle = '#ef4444';
            edge.errorTime--;
        } else if (edge.drawn) {
            l3Ctx.strokeStyle = '#f59e0b';
            l3Ctx.shadowBlur = 8;
            l3Ctx.shadowColor = '#f59e0b';
        } else {
            l3Ctx.strokeStyle = '#c7d2fe';
        }
        l3Ctx.beginPath();
        l3Ctx.moveTo(uNode.x, uNode.y);
        l3Ctx.lineTo(vNode.x, vNode.y);
        l3Ctx.stroke();
        l3Ctx.restore();
    }
    
    // 2. 画大门顶点
    for (const node of l3Nodes) {
        l3Ctx.save();
        const isCurrent = l3CurrentNode && l3CurrentNode.id === node.id;
        const radius = isCurrent ? 14 : 11;
        
        if (isCurrent) {
            l3Ctx.shadowBlur = 10;
            l3Ctx.shadowColor = '#10b981';
            l3Ctx.fillStyle = '#10b981';
            l3Ctx.strokeStyle = '#ffffff';
            l3Ctx.lineWidth = 3;
        } else {
            l3Ctx.fillStyle = '#ffffff';
            l3Ctx.strokeStyle = '#6366f1';
            l3Ctx.lineWidth = 2.5;
        }
        
        l3Ctx.beginPath();
        l3Ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        l3Ctx.fill();
        l3Ctx.stroke();
        
        // 标字
        l3Ctx.fillStyle = isCurrent ? '#fff' : '#1e293b';
        l3Ctx.font = 'bold 9px Outfit, Noto Sans SC';
        l3Ctx.textAlign = 'center';
        l3Ctx.textBaseline = 'middle';
        l3Ctx.fillText(node.label[0], node.x, node.y);
        
        l3Ctx.restore();
    }
    
    requestAnimationFrame(renderLoopL3);
}

function skipL3() {
    unlockLevel(4);
    switchLevelTo(4);
}


/* =================== LEVEL 4: 双色两笔画风筝 =================== */
const l4Canvas = document.getElementById('l4-canvas');
const l4Ctx = l4Canvas.getContext('2d');
let l4Nodes = [];
let l4Edges = [];
let l4StrokeCount = 1; // 当前正在画第几笔 (最多2笔)
let l4IsDrawing = false;
let l4CurrentNode = null;
let l4DrawEnabled = false;

// 风筝图数据
const l4Graph = {
    nodes: [
        { id: 'Top', x: 250, y: 60, label: 'A' },
        { id: 'Left', x: 130, y: 160, label: 'B' },
        { id: 'Right', x: 370, y: 160, label: 'C' },
        { id: 'Bottom', x: 250, y: 210, label: 'D' },
        { id: 'Tail', x: 250, y: 310, label: 'E' }
    ],
    edges: [
        { id: 'Top-Left', u: 'Top', v: 'Left' },
        { id: 'Top-Right', u: 'Top', v: 'Right' },
        { id: 'Left-Bottom', u: 'Left', v: 'Bottom' },
        { id: 'Right-Bottom', u: 'Right', v: 'Bottom' },
        { id: 'Top-Bottom', u: 'Top', v: 'Bottom' },
        { id: 'Left-Tail', u: 'Left', v: 'Tail' },
        { id: 'Right-Tail', u: 'Right', v: 'Tail' },
        { id: 'Bottom-Tail', u: 'Bottom', v: 'Tail' }
    ]
};

function initL4() {
    l4Canvas.addEventListener('mousedown', handleL4MouseDown);
    l4Canvas.addEventListener('mousemove', handleL4MouseMove);
    window.addEventListener('mouseup', handleL4MouseUp);
    
    l4Canvas.addEventListener('touchstart', handleL4TouchStart, {passive: false});
    l4Canvas.addEventListener('touchmove', handleL4TouchMove, {passive: false});
    window.addEventListener('touchend', handleL4TouchEnd);
    
    document.getElementById('l4-reset').addEventListener('click', resetL4Drawing);
    document.getElementById('l4-next-stroke').addEventListener('click', startNextStrokeL4);
    
    resetL4Drawing();
    requestAnimationFrame(renderLoopL4);
}

function resetL4Drawing() {
    l4Nodes = JSON.parse(JSON.stringify(l4Graph.nodes));
    l4Edges = JSON.parse(JSON.stringify(l4Graph.edges)).map(e => {
        e.drawn = false;
        e.strokeId = 0; // 记录哪一笔画的
        return e;
    });
    l4StrokeCount = 1;
    l4CurrentNode = null;
    l4IsDrawing = false;
    document.getElementById('l4-next-stroke').disabled = true;
    document.getElementById('l4-next-stroke').textContent = '✏️ 开始下一笔';
}

function startNextStrokeL4() {
    if (l4StrokeCount === 1) {
        l4StrokeCount = 2;
        l4CurrentNode = null; // 允许重新起笔
        document.getElementById('l4-next-stroke').disabled = true;
        document.getElementById('l4-next-stroke').textContent = '🎨 正在画第2笔';
        playSound('click');
    }
}

function checkL4Answers() {
    const odds = parseInt(document.getElementById('l4-input-odds').value);
    const strokes = parseInt(document.getElementById('l4-input-strokes').value);
    const feedback = document.getElementById('l4-feedback');
    
    if (isNaN(odds) || isNaN(strokes)) {
        playSound('error');
        alert("请输入数字哦！");
        return;
    }
    
    if (odds === 4 && strokes === 2) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `🎉 答对啦！图形共有 4 个奇点 (A, B, C, E)。根据定理，一笔画最少需要奇点数的一半笔数：4 ÷ 2 = 2 笔！下面你可以直接在左侧挑战两笔画！`;
        document.getElementById('l4-rule-summary').style.display = 'block';
        l4DrawEnabled = true;
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `❌ 答错啦，请再数一数。奇点是连接奇数条线的点，比如顶端的 A(3条)、B(3条)、C(3条)、E(3条)。所以奇点数是 4。笔数 = 奇点数 ÷ 2 = 2。`;
        l4DrawEnabled = false;
    }
    feedback.style.display = 'block';
}

function handleL4MouseDown(e) {
    if (!l4DrawEnabled) return;
    const coords = getL2Coords(e);
    startL4Draw(coords.x, coords.y);
}
function handleL4TouchStart(e) {
    if (!l4DrawEnabled) return;
    e.preventDefault();
    const coords = getL2Coords(e);
    startL4Draw(coords.x, coords.y);
}

function startL4Draw(x, y) {
    // 寻找最近的顶点起笔
    for (const node of l4Nodes) {
        if (Math.hypot(node.x - x, node.y - y) < 22) {
            // 如果已经在当前笔中画过，则不能更改起点，必须连着画
            if (l4CurrentNode && l4CurrentNode.id !== node.id) return;
            l4CurrentNode = node;
            l4IsDrawing = true;
            playSound('click');
            break;
        }
    }
}

function handleL4MouseMove(e) {
    if (!l4IsDrawing || !l4CurrentNode) return;
    const coords = getL2Coords(e);
    trackL4Draw(coords.x, coords.y, coords.cx, coords.cy);
}
function handleL4TouchMove(e) {
    e.preventDefault();
    if (!l4IsDrawing || !l4CurrentNode) return;
    const coords = getL2Coords(e);
    trackL4Draw(coords.x, coords.y, coords.cx, coords.cy);
}

function trackL4Draw(x, y, cx, cy) {
    for (const node of l4Nodes) {
        if (node.id === l4CurrentNode.id) continue;
        if (Math.hypot(node.x - x, node.y - y) < 20) {
            const edge = l4Edges.find(e => 
                (e.u === l4CurrentNode.id && e.v === node.id) || 
                (e.v === l4CurrentNode.id && e.u === node.id)
            );
            if (edge) {
                if (!edge.drawn) {
                    edge.drawn = true;
                    edge.strokeId = l4StrokeCount; // 标记第几笔画的
                    l4CurrentNode = node;
                    playSound('click');
                    spawnSuccessParticles(cx, cy);
                    
                    // 按钮提示开始下一笔
                    if (l4StrokeCount === 1) {
                        document.getElementById('l4-next-stroke').disabled = false;
                    }
                    
                    checkL4Win();
                } else {
                    edge.errorTime = 18;
                    playSound('error');
                }
            }
            break;
        }
    }
}

function handleL4MouseUp() {
    l4IsDrawing = false;
}
function handleL4TouchEnd() {
    l4IsDrawing = false;
}

function checkL4Win() {
    const allDrawn = l4Edges.every(e => e.drawn);
    if (allDrawn && l4StrokeCount <= 2) {
        playSound('success');
        alert("🎉 恭喜通关！你成功地在 2 笔内画完了风筝！解锁下一关！");
        unlockLevel(5);
    }
}

function renderLoopL4() {
    l4Ctx.clearRect(0, 0, l4Canvas.width, l4Canvas.height);
    
    // 1. 画风筝线
    for (const edge of l4Edges) {
        const uNode = l4Nodes.find(n => n.id === edge.u);
        const vNode = l4Nodes.find(n => n.id === edge.v);
        
        l4Ctx.save();
        l4Ctx.lineWidth = 5;
        l4Ctx.lineCap = 'round';
        if (edge.errorTime && edge.errorTime > 0) {
            l4Ctx.strokeStyle = '#ef4444';
            edge.errorTime--;
        } else if (edge.drawn) {
            l4Ctx.strokeStyle = edge.strokeId === 1 ? '#3b82f6' : '#a855f7'; // 第一笔蓝色，第二笔紫色
            l4Ctx.shadowBlur = 8;
            l4Ctx.shadowColor = l4Ctx.strokeStyle;
        } else {
            l4Ctx.strokeStyle = '#c7d2fe';
        }
        l4Ctx.beginPath();
        l4Ctx.moveTo(uNode.x, uNode.y);
        l4Ctx.lineTo(vNode.x, vNode.y);
        l4Ctx.stroke();
        l4Ctx.restore();
    }
    
    // 2. 画顶点
    for (const node of l4Nodes) {
        l4Ctx.save();
        const isCurrent = l4CurrentNode && l4CurrentNode.id === node.id;
        const radius = isCurrent ? 14 : 11;
        
        if (isCurrent) {
            l4Ctx.shadowBlur = 10;
            l4Ctx.shadowColor = l4StrokeCount === 1 ? '#3b82f6' : '#a855f7';
            l4Ctx.fillStyle = l4StrokeCount === 1 ? '#3b82f6' : '#a855f7';
            l4Ctx.strokeStyle = '#ffffff';
            l4Ctx.lineWidth = 3;
        } else {
            l4Ctx.fillStyle = '#ffffff';
            l4Ctx.strokeStyle = '#818cf8';
            l4Ctx.lineWidth = 2.5;
        }
        
        l4Ctx.beginPath();
        l4Ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        l4Ctx.fill();
        l4Ctx.stroke();
        
        // 字母
        l4Ctx.fillStyle = isCurrent ? '#fff' : '#1e293b';
        l4Ctx.font = 'bold 9px Outfit, Noto Sans SC';
        l4Ctx.textAlign = 'center';
        l4Ctx.textBaseline = 'middle';
        l4Ctx.fillText(node.label, node.x, node.y);
        l4Ctx.restore();
    }
    
    requestAnimationFrame(renderLoopL4);
}

function skipL4() {
    unlockLevel(5);
    switchLevelTo(5);
}


/* =================== LEVEL 5: 盒子的“拉链”变形记 =================== */
const l5Canvas = document.getElementById('l5-canvas');
const l5Ctx = l5Canvas.getContext('2d');
let l5Nodes = [];
let l5Edges = [];
let l5ActiveTool = 'add'; // 'add' | 'del'
let l5AddStartNode = null;

// 立体方框点线数据
const l5BaseGraph = {
    nodes: [
        { id: 'A', x: 130, y: 90, label: 'A' },
        { id: 'B', x: 370, y: 90, label: 'B' },
        { id: 'C', x: 370, y: 310, label: 'C' },
        { id: 'D', x: 130, y: 310, label: 'D' },
        { id: 'E', x: 190, y: 150, label: 'E' },
        { id: 'F', x: 310, y: 150, label: 'F' },
        { id: 'G', x: 310, y: 250, label: 'G' },
        { id: 'H', x: 190, y: 250, label: 'H' }
    ],
    edges: [
        { u: 'A', v: 'B' }, { u: 'B', v: 'C' }, { u: 'C', v: 'D' }, { u: 'D', v: 'A' }, // Outer
        { u: 'E', v: 'F' }, { u: 'F', v: 'G' }, { u: 'G', v: 'H' }, { u: 'H', v: 'E' }, // Inner
        { u: 'A', v: 'E' }, { u: 'B', v: 'F' }, { u: 'C', v: 'G' }, { u: 'D', v: 'H' }  // Connectors
    ]
};

function initL5() {
    document.getElementById('l5-tool-add').addEventListener('click', () => setL5Tool('add'));
    document.getElementById('l5-tool-del').addEventListener('click', () => setL5Tool('del'));
    document.getElementById('l5-reset').addEventListener('click', resetL5Graph);
    
    l5Canvas.addEventListener('click', handleL5CanvasClick);
    
    resetL5Graph();
}

function resetL5Graph() {
    l5Nodes = JSON.parse(JSON.stringify(l5BaseGraph.nodes));
    l5Edges = JSON.parse(JSON.stringify(l5BaseGraph.edges)).map((e, idx) => {
        e.id = `e-${idx}`;
        return e;
    });
    l5AddStartNode = null;
    updateL5Metrics();
}

function setL5Tool(tool) {
    l5ActiveTool = tool;
    document.getElementById('l5-tool-add').classList.toggle('active', tool === 'add');
    document.getElementById('l5-tool-del').classList.toggle('active', tool === 'del');
    l5AddStartNode = null;
    playSound('click');
}

function updateL5Metrics() {
    // 重新计算顶点的度数和奇偶性
    l5Nodes.forEach(node => {
        node.degree = l5Edges.filter(e => e.u === node.id || e.v === node.id).length;
        node.isOdd = node.degree % 2 !== 0;
    });
    
    const odds = l5Nodes.filter(n => n.isOdd).length;
    document.getElementById('l5-odds-count').textContent = odds;
    
    const canDraw = (odds === 0 || odds === 2);
    const statusLabel = document.getElementById('l5-draw-status');
    statusLabel.textContent = canDraw ? '可以一笔画! 🎉' : '不能 ❌';
    statusLabel.className = canDraw ? 'badge warning' : 'badge error';
    
    renderL5();
}

function handleL5CanvasClick(e) {
    const rect = l5Canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 1. 点击顶点 (拉链连线模式)
    if (l5ActiveTool === 'add') {
        let clickedNode = null;
        for (const node of l5Nodes) {
            if (Math.hypot(node.x - x, node.y - y) < 18) {
                clickedNode = node;
                break;
            }
        }
        
        if (clickedNode) {
            if (!l5AddStartNode) {
                l5AddStartNode = clickedNode;
                playSound('click');
            } else {
                if (l5AddStartNode.id !== clickedNode.id) {
                    // 判断这条线是否已存在
                    const exists = l5Edges.some(e => 
                        (e.u === l5AddStartNode.id && e.v === clickedNode.id) || 
                        (e.v === l5AddStartNode.id && e.u === clickedNode.id)
                    );
                    if (!exists) {
                        l5Edges.push({
                            id: `e-add-${Date.now()}`,
                            u: l5AddStartNode.id,
                            v: clickedNode.id,
                            isAdded: true
                        });
                        playSound('success');
                        spawnSuccessParticles(e.clientX, e.clientY);
                    } else {
                        playSound('error');
                    }
                }
                l5AddStartNode = null;
                updateL5Metrics();
            }
        } else {
            l5AddStartNode = null;
            updateL5Metrics();
        }
    }
    
    // 2. 点击线条 (剪刀模式)
    else if (l5ActiveTool === 'del') {
        let clickedEdgeIdx = -1;
        let minDist = 15; // 允许距离线条的最大像素
        
        l5Edges.forEach((edge, idx) => {
            const uNode = l5Nodes.find(n => n.id === edge.u);
            const vNode = l5Nodes.find(n => n.id === edge.v);
            
            // 计算点到线段的距离
            const d = distToSegment(x, y, uNode.x, uNode.y, vNode.x, vNode.y);
            if (d < minDist) {
                minDist = d;
                clickedEdgeIdx = idx;
            }
        });
        
        if (clickedEdgeIdx !== -1) {
            l5Edges.splice(clickedEdgeIdx, 1);
            playSound('success');
            // 粒子消散效果
            spawnSuccessParticles(e.clientX, e.clientY);
            updateL5Metrics();
        } else {
            playSound('click');
        }
    }
}

// 辅助数学公式：点到线段的距离
function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = Math.hypot(x2 - x1, y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

function renderL5() {
    l5Ctx.clearRect(0, 0, l5Canvas.width, l5Canvas.height);
    
    // 1. 画线
    l5Ctx.lineCap = 'round';
    for (const edge of l5Edges) {
        const uNode = l5Nodes.find(n => n.id === edge.u);
        const vNode = l5Nodes.find(n => n.id === edge.v);
        
        l5Ctx.save();
        if (edge.isAdded) {
            l5Ctx.strokeStyle = '#f59e0b'; // 黄色代表拉链增加的线
            l5Ctx.lineWidth = 4;
            l5Ctx.setLineDash([6, 4]); // 虚线表示后加的
        } else {
            l5Ctx.strokeStyle = '#c7d2fe';
            l5Ctx.lineWidth = 4;
        }
        
        l5Ctx.beginPath();
        l5Ctx.moveTo(uNode.x, uNode.y);
        l5Ctx.lineTo(vNode.x, vNode.y);
        l5Ctx.stroke();
        l5Ctx.restore();
    }
    
    // 如果有正准备拉线的虚线
    if (l5ActiveTool === 'add' && l5AddStartNode) {
        l5Ctx.save();
        l5Ctx.strokeStyle = '#f59e0b';
        l5Ctx.lineWidth = 3;
        l5Ctx.setLineDash([4, 4]);
        
        // 动态跟随鼠标需要处理mousemove，但由于我们用click实现，这里简易画发光
        l5Ctx.shadowBlur = 10;
        l5Ctx.shadowColor = '#f59e0b';
        l5Ctx.beginPath();
        l5Ctx.arc(l5AddStartNode.x, l5AddStartNode.y, 22, 0, Math.PI*2);
        l5Ctx.stroke();
        l5Ctx.restore();
    }
    
    // 2. 画顶点
    for (const node of l5Nodes) {
        l5Ctx.save();
        const isStartNode = l5AddStartNode && l5AddStartNode.id === node.id;
        
        // 奇点显示红色，偶点显示绿色
        if (node.isOdd) {
            l5Ctx.shadowBlur = 8;
            l5Ctx.shadowColor = '#ef4444';
            l5Ctx.fillStyle = '#ef4444'; // 奇点红
        } else {
            l5Ctx.shadowBlur = 6;
            l5Ctx.shadowColor = '#10b981';
            l5Ctx.fillStyle = '#10b981'; // 偶点绿
        }
        
        if (isStartNode) {
            l5Ctx.shadowBlur = 15;
            l5Ctx.shadowColor = '#f59e0b';
            l5Ctx.fillStyle = '#f59e0b';
        }
        
        l5Ctx.strokeStyle = '#ffffff';
        l5Ctx.lineWidth = 2.5;
        l5Ctx.beginPath();
        l5Ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
        l5Ctx.fill();
        l5Ctx.stroke();
        
        // 写度数字
        l5Ctx.fillStyle = '#ffffff';
        l5Ctx.font = 'bold 11px Outfit';
        l5Ctx.textAlign = 'center';
        l5Ctx.textBaseline = 'middle';
        l5Ctx.fillText(node.degree, node.x, node.y);
        
        l5Ctx.restore();
    }
}

function checkL5Answers() {
    const inputDel = parseInt(document.getElementById('l5-input-del').value);
    const inputAdd = parseInt(document.getElementById('l5-input-add').value);
    const feedback = document.getElementById('l5-feedback');
    
    if (isNaN(inputDel) || isNaN(inputAdd)) {
        playSound('error');
        alert("请输入整数数量！");
        return;
    }
    
    if (inputDel === 3 && inputAdd === 3) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `🎉 答对啦！最少删除线段 3 条，最少增加线段 3 条。你可以点击左上角的“模式按钮”在魔盒上试一试：加 3 条线让所有顶点偶化，或者删 3 条线！解锁下一关！`;
        document.getElementById('l5-rule-summary').style.display = 'block';
        unlockLevel(6);
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `❌ 答错啦，请再看一下上面的奇偶转换提示。8个奇点要减少到2个，需要改变 6 个顶点的度数奇偶性，因此最少要增/减 6 ÷ 2 = 3 条线哦。`;
    }
    feedback.style.display = 'block';
}

function skipL5() {
    unlockLevel(6);
    switchLevelTo(6);
}


/* =================== LEVEL 6: 城市清道夫与里程表 =================== */
const l6Canvas = document.getElementById('l6-canvas');
const l6Ctx = l6Canvas.getContext('2d');
let l6Nodes = [];
let l6Edges = [];

// 邮路数据图 (Page 8 例题)
const l6BaseGraph = {
    nodes: [
        { id: 'N0_3', x: 80, y: 80, label: 'N0_3' },
        { id: 'N0_0', x: 80, y: 280, label: '邮局' },
        { id: 'N1_3', x: 200, y: 80, label: 'N1_3' },
        { id: 'N1_0', x: 200, y: 280, label: 'N1_0' },
        { id: 'N2_3', x: 270, y: 80, label: 'N2_3' },
        { id: 'N2_2', x: 270, y: 150, label: 'N2_2' },
        { id: 'N2_1', x: 270, y: 210, label: 'N2_1' },
        { id: 'N2_0', x: 270, y: 280, label: 'N2_0' },
        { id: 'N3_3', x: 390, y: 80, label: 'N3_3' },
        { id: 'N3_2', x: 390, y: 150, label: 'N3_2' },
        { id: 'N3_1', x: 390, y: 210, label: 'N3_1' },
        { id: 'N3_0', x: 390, y: 280, label: 'N3_0' }
    ],
    edges: [
        // 横向 top / bottom
        { u: 'N0_3', v: 'N1_3', weight: 2 },
        { u: 'N1_3', v: 'N2_3', weight: 1 },
        { u: 'N2_3', v: 'N3_3', weight: 2 },
        { u: 'N0_0', v: 'N1_0', weight: 2 },
        { u: 'N1_0', v: 'N2_0', weight: 1 },
        { u: 'N2_0', v: 'N3_0', weight: 2 },
        // 纵向 columns
        { u: 'N0_3', v: 'N0_0', weight: 3 },
        { u: 'N1_3', v: 'N1_0', weight: 3 },
        { u: 'N2_3', v: 'N2_2', weight: 1 },
        { u: 'N2_2', v: 'N2_1', weight: 1 },
        { u: 'N2_1', v: 'N2_0', weight: 1 },
        { u: 'N3_3', v: 'N3_2', weight: 1 },
        { u: 'N3_2', v: 'N3_1', weight: 1 },
        { u: 'N3_1', v: 'N3_0', weight: 1 },
        // 中间 box 横向
        { u: 'N2_2', v: 'N3_2', weight: 2 },
        { u: 'N2_1', v: 'N3_1', weight: 2 }
    ]
};

function initL6() {
    document.getElementById('l6-reset').addEventListener('click', resetL6Graph);
    l6Canvas.addEventListener('click', handleL6CanvasClick);
    
    resetL6Graph();
}

function resetL6Graph() {
    l6Nodes = JSON.parse(JSON.stringify(l6BaseGraph.nodes));
    l6Edges = JSON.parse(JSON.stringify(l6BaseGraph.edges)).map((e, idx) => {
        e.id = `e-l6-${idx}`;
        e.duplicated = false;
        return e;
    });
    updateL6Metrics();
}

function handleL6CanvasClick(e) {
    const rect = l6Canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let clickedEdgeIdx = -1;
    let minDist = 15;
    
    l6Edges.forEach((edge, idx) => {
        const uNode = l6Nodes.find(n => n.id === edge.u);
        const vNode = l6Nodes.find(n => n.id === edge.v);
        const d = distToSegment(x, y, uNode.x, uNode.y, vNode.x, vNode.y);
        if (d < minDist) {
            minDist = d;
            clickedEdgeIdx = idx;
        }
    });
    
    if (clickedEdgeIdx !== -1) {
        l6Edges[clickedEdgeIdx].duplicated = !l6Edges[clickedEdgeIdx].duplicated;
        if (l6Edges[clickedEdgeIdx].duplicated) {
            playSound('success');
            spawnSuccessParticles(e.clientX, e.clientY);
        } else {
            playSound('click');
        }
        updateL6Metrics();
    }
}

function updateL6Metrics() {
    // 重新计算顶点度数。一条线被重复走，意味着它在图中贡献了双倍度数。
    l6Nodes.forEach(node => {
        node.degree = l6Edges.filter(e => e.u === node.id || e.v === node.id).reduce((sum, e) => {
            return sum + (e.duplicated ? 2 : 1);
        }, 0);
        node.isOdd = node.degree % 2 !== 0;
    });
    
    const odds = l6Nodes.filter(n => n.isOdd).length;
    const duplicatedDistance = l6Edges.filter(e => e.duplicated).reduce((sum, e) => sum + e.weight, 0);
    const totalDistance = 26 + duplicatedDistance; // 26是原始总重
    
    document.getElementById('l6-odds-val').textContent = odds;
    document.getElementById('l6-dup-val').textContent = duplicatedDistance;
    document.getElementById('l6-total-val').textContent = totalDistance;
    
    renderL6();
    
    // 如果奇点归零且总长度是最优的 30km
    if (odds === 0 && totalDistance === 30) {
        playSound('fanfare');
        alert("🎉 最优邮政线路设计完成！重复里程为 4km，总里程 30km！答题已解锁！");
        const ansInput = document.getElementById('l6-input-ans');
        ansInput.value = 30;
    }
}

function renderL6() {
    l6Ctx.clearRect(0, 0, l6Canvas.width, l6Canvas.height);
    
    // 1. 画路段边线
    l6Ctx.lineCap = 'round';
    for (const edge of l6Edges) {
        const uNode = l6Nodes.find(n => n.id === edge.u);
        const vNode = l6Nodes.find(n => n.id === edge.v);
        
        // 原始路线 (底线)
        l6Ctx.strokeStyle = '#c7d2fe';
        l6Ctx.lineWidth = 6;
        l6Ctx.beginPath();
        l6Ctx.moveTo(uNode.x, uNode.y);
        l6Ctx.lineTo(vNode.x, vNode.y);
        l6Ctx.stroke();
        
        // 如果被重复走
        if (edge.duplicated) {
            l6Ctx.save();
            l6Ctx.strokeStyle = '#f59e0b'; // 金色代表清扫车开两遍的路
            l6Ctx.lineWidth = 12; // 绘制得更粗
            l6Ctx.beginPath();
            l6Ctx.moveTo(uNode.x, uNode.y);
            l6Ctx.lineTo(vNode.x, vNode.y);
            l6Ctx.stroke();
            
            // 画中心分割虚线
            l6Ctx.strokeStyle = '#ffffff';
            l6Ctx.lineWidth = 2;
            l6Ctx.setLineDash([4, 4]);
            l6Ctx.beginPath();
            l6Ctx.moveTo(uNode.x, uNode.y);
            l6Ctx.lineTo(vNode.x, vNode.y);
            l6Ctx.stroke();
            l6Ctx.restore();
        }
        
        // 标出路段权重公里数
        l6Ctx.save();
        l6Ctx.fillStyle = '#64748b';
        l6Ctx.font = 'bold 11px Outfit';
        l6Ctx.textAlign = 'center';
        l6Ctx.textBaseline = 'middle';
        
        // 计算边缘中点位置
        const mx = (uNode.x + vNode.x) / 2;
        const my = (uNode.y + vNode.y) / 2;
        
        // 稍微平移文字避免与线段重合
        let offset = 8;
        const dx = vNode.x - uNode.x;
        const dy = vNode.y - uNode.y;
        const len = Math.hypot(dx, dy);
        const nx = -dy / len;
        const ny = dx / len;
        
        l6Ctx.fillText(`${edge.weight}km`, mx + nx * offset, my + ny * offset);
        l6Ctx.restore();
    }
    
    // 2. 画路口顶点
    for (const node of l6Nodes) {
        l6Ctx.save();
        
        if (node.isOdd) {
            l6Ctx.shadowBlur = 8;
            l6Ctx.shadowColor = '#ef4444';
            l6Ctx.fillStyle = '#ef4444';
        } else {
            l6Ctx.fillStyle = '#10b981';
        }
        
        l6Ctx.strokeStyle = '#ffffff';
        l6Ctx.lineWidth = 2.5;
        l6Ctx.beginPath();
        l6Ctx.arc(node.x, node.y, 11, 0, Math.PI * 2);
        l6Ctx.fill();
        l6Ctx.stroke();
        
        // 字母或“邮”字
        l6Ctx.fillStyle = '#ffffff';
        l6Ctx.font = 'bold 9px Outfit, Noto Sans SC';
        l6Ctx.textAlign = 'center';
        l6Ctx.textBaseline = 'middle';
        if (node.label === '邮局') {
            l6Ctx.fillText('邮', node.x, node.y);
        } else {
            // 只显示度数
            l6Ctx.fillText(node.degree, node.x, node.y);
        }
        
        l6Ctx.restore();
    }
}

function checkL6Answers() {
    const inputVal = parseInt(document.getElementById('l6-input-ans').value);
    const feedback = document.getElementById('l6-feedback');
    
    if (isNaN(inputVal)) {
        playSound('error');
        alert("请输入数字公里数！");
        return;
    }
    
    if (inputVal === 30) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `🎉 答对啦！最优的里程方案正是 30 千米（原始 26km + 4km 重复段）。这被称为“中国邮路问题”！解锁最终的走廊穿门挑战！`;
        document.getElementById('l6-rule-summary').style.display = 'block';
        unlockLevel(7);
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `❌ 答错啦，请再想一想。原始路程是26km，至少要额外重复 4km 的长度。加油！`;
    }
    feedback.style.display = 'block';
}

function skipL6() {
    unlockLevel(7);
    switchLevelTo(7);
}


/* =================== LEVEL 7: 小吃货穿门挑战 =================== */
const l7Canvas = document.getElementById('l7-canvas');
const l7Ctx = l7Canvas.getContext('2d');
let l7Rooms = [];
let l7Doors = [];
let l7ClosedDoorId = null; // 关闭的门ID ('d3' 或 'd4')
let l7CurrentRoom = null; // 当前兔子所在的房间
let l7LevelUnlocked = false; // 答对题才能开启跳房子游戏

// 圆形餐厅数据：五个房间 + 外部
const l7BaseRooms = [
    { id: 'A', x: 250, y: 90, label: 'A厅', degree: 3 },
    { id: 'B', x: 130, y: 190, label: 'B厅', degree: 3 },
    { id: 'C', x: 250, y: 190, label: 'C厅', degree: 4 },
    { id: 'D', x: 370, y: 190, label: 'D厅', degree: 4 }, // 包含入口门
    { id: 'E', x: 250, y: 290, label: 'E厅', degree: 3 },
    { id: 'Out', x: 440, y: 110, label: '外部', degree: 1 } // 外界
];

const l7BaseDoors = [
    { id: 'd1', label: '1号门', u: 'Out', v: 'D', x: 410, y: 190 }, // 入口
    { id: 'd2', label: '2号门', u: 'A', v: 'D', x: 310, y: 140 },
    { id: 'd3', label: '3号门', u: 'A', v: 'B', x: 190, y: 140 },
    { id: 'd4', label: '4号门', u: 'B', v: 'E', x: 190, y: 240 },
    { id: 'd5', label: '5号门', u: 'D', v: 'E', x: 310, y: 240 },
    { id: 'd6', label: '6号门', u: 'C', v: 'D', x: 310, y: 190 },
    { id: 'd7', label: '7号门', u: 'A', v: 'C', x: 250, y: 140 },
    { id: 'd8', label: '8号门', u: 'B', v: 'C', x: 190, y: 190 },
    { id: 'd9', label: '9号门', u: 'C', v: 'E', x: 250, y: 240 }
];

function initL7() {
    l7Canvas.addEventListener('click', handleL7CanvasClick);
    document.getElementById('l7-reset').addEventListener('click', resetL7Level);
    
    resetL7Level();
    requestAnimationFrame(renderLoopL7);
}

function resetL7Level() {
    l7Rooms = JSON.parse(JSON.stringify(l7BaseRooms));
    l7Doors = JSON.parse(JSON.stringify(l7BaseDoors)).map(d => {
        d.visited = false;
        d.errorTime = 0;
        return d;
    });
    l7ClosedDoorId = null;
    l7CurrentRoom = null;
    hideL7Bubble();
}

function checkL7Answers() {
    const rad = document.querySelector('input[name="l7-q1"]:checked');
    const feedback = document.getElementById('l7-feedback');
    
    if (!rad) {
        playSound('error');
        alert("请先做出选择哦！");
        return;
    }
    
    if (rad.value === 'close-3') {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `🎉 完全正确！关闭 3 号门（或 4 号门）会同时改变两个奇点大厅的门数（都变成 2 条线，即偶点），使得全图剩下“外部（起点，1条线）”和另一间房间是奇点，正好为 2 个奇点，满足一笔画定理！左边餐厅的 3 号门已被锁死，请拖动小兔子完成最后一跃通关吧！`;
        l7ClosedDoorId = 'd3'; // 锁死3号门
        l7LevelUnlocked = true;
        l7CurrentRoom = l7Rooms.find(r => r.id === 'Out'); // 兔子在外面等候
        document.getElementById('l7-rule-summary').style.display = 'block';
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `❌ 选错了，请看左边算式。关闭 7 号门并不能同时偶化 A 和 B 哦，因为 7 号门连接的是 A 和 C。请再想想。`;
        l7LevelUnlocked = false;
        l7ClosedDoorId = null;
    }
    feedback.style.display = 'block';
}

function handleL7CanvasClick(e) {
    if (!l7LevelUnlocked || !l7CurrentRoom) return;
    const rect = l7Canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 磁吸检测：用户点击了哪个房间想跳过去
    let targetRoom = null;
    for (const room of l7Rooms) {
        if (Math.hypot(room.x - x, room.y - y) < 30) {
            targetRoom = room;
            break;
        }
    }
    
    if (targetRoom) {
        if (targetRoom.id === l7CurrentRoom.id) return;
        
        // 寻找这两个房间之间相连且没有关闭、也没有被访问过的门
        const door = l7Doors.find(d => 
            d.id !== l7ClosedDoorId &&
            !d.visited &&
            ((d.u === l7CurrentRoom.id && d.v === targetRoom.id) || 
             (d.v === l7CurrentRoom.id && d.u === targetRoom.id))
        );
        
        if (door) {
            door.visited = true;
            l7CurrentRoom = targetRoom;
            playSound('click');
            spawnSuccessParticles(e.clientX, e.clientY);
            
            // 通关检查
            checkL7Win();
        } else {
            // 如果点了一个走不通的房间，抛出气泡
            playSound('error');
            showL7Bubble(targetRoom.x, targetRoom.y, "🚫 这里没有可以通行的饼干之门哦！");
        }
    }
}

function showL7Bubble(x, y, text) {
    const bubble = document.getElementById('l7-bubble');
    bubble.style.display = 'block';
    bubble.innerHTML = text;
    bubble.style.left = (x - 40) + 'px';
    bubble.style.top = (y - 95) + 'px';
    setTimeout(hideL7Bubble, 2000);
}

function hideL7Bubble() {
    document.getElementById('l7-bubble').style.display = 'none';
}

function checkL7Win() {
    // 除了关闭的门外，其余 8 扇门是否都被访问过了
    const activeDoors = l7Doors.filter(d => d.id !== l7ClosedDoorId);
    const allPassed = activeDoors.every(d => d.visited);
    if (allPassed) {
        playSound('fanfare');
        // 显示终极贺卡
        document.getElementById('victoryOverlay').style.display = 'flex';
    }
}

function renderLoopL7() {
    l7Ctx.clearRect(0, 0, l7Canvas.width, l7Canvas.height);
    
    // 1. 绘制房间边界 (环形大餐厅)
    l7Ctx.save();
    l7Ctx.strokeStyle = '#e2e8f0';
    l7Ctx.lineWidth = 8;
    l7Ctx.beginPath();
    l7Ctx.arc(250, 190, 120, 0, Math.PI*2); // 外环
    l7Ctx.stroke();
    l7Ctx.restore();
    
    // 2. 画门（饼干）
    l7Ctx.lineCap = 'round';
    for (const door of l7Doors) {
        l7Ctx.save();
        
        const isClosed = door.id === l7ClosedDoorId;
        
        if (isClosed) {
            l7Ctx.strokeStyle = '#ef4444'; // 红色围墙表示关门
            l7Ctx.lineWidth = 8;
            l7Ctx.shadowBlur = 8;
            l7Ctx.shadowColor = '#ef4444';
        } else if (door.visited) {
            l7Ctx.strokeStyle = '#cbd5e1'; // 变灰色表示吃过饼干了
            l7Ctx.lineWidth = 4;
        } else {
            l7Ctx.strokeStyle = '#f59e0b'; // 黄色代表饼干大门
            l7Ctx.lineWidth = 6;
            l7Ctx.shadowBlur = 6;
            l7Ctx.shadowColor = '#f59e0b';
        }
        
        // 画出各个门的示意图
        const uRoom = l7Rooms.find(r => r.id === door.u);
        const vRoom = l7Rooms.find(r => r.id === door.v);
        
        l7Ctx.beginPath();
        // 取两室中点稍微作为门点画一个横杠
        const mx = door.x;
        const my = door.y;
        
        l7Ctx.arc(mx, my, isClosed ? 10 : 7, 0, Math.PI*2);
        l7Ctx.stroke();
        
        // 门号标签
        if (!door.visited && !isClosed) {
            l7Ctx.fillStyle = '#d97706';
            l7Ctx.font = 'bold 9px Outfit';
            l7Ctx.fillText(door.label[0], mx - 3, my + 3);
        }
        l7Ctx.restore();
    }
    
    // 3. 画小动物厅顶点
    for (const room of l7Rooms) {
        l7Ctx.save();
        const isCurrent = l7CurrentRoom && l7CurrentRoom.id === room.id;
        const radius = isCurrent ? 24 : 18;
        
        if (isCurrent) {
            l7Ctx.shadowBlur = 12;
            l7Ctx.shadowColor = '#a855f7';
            l7Ctx.fillStyle = 'url(#gradVioletL7)';
            const grad = l7Ctx.createRadialGradient(room.x, room.y, 2, room.x, room.y, radius);
            grad.addColorStop(0, '#c084fc');
            grad.addColorStop(1, '#a855f7');
            l7Ctx.fillStyle = grad;
            l7Ctx.strokeStyle = '#ffffff';
            l7Ctx.lineWidth = 3.5;
        } else {
            l7Ctx.fillStyle = '#ffffff';
            l7Ctx.strokeStyle = '#c7d2fe';
            l7Ctx.lineWidth = 2.5;
        }
        
        l7Ctx.beginPath();
        l7Ctx.arc(room.x, room.y, radius, 0, Math.PI * 2);
        l7Ctx.fill();
        l7Ctx.stroke();
        
        // 文字
        l7Ctx.fillStyle = isCurrent ? '#ffffff' : '#475569';
        l7Ctx.font = 'bold 11px Noto Sans SC, Outfit';
        l7Ctx.textAlign = 'center';
        l7Ctx.textBaseline = 'middle';
        l7Ctx.fillText(room.label, room.x, room.y);
        
        l7Ctx.restore();
    }
    
    // 4. 绘制小兔子形象 (用emoji)
    if (l7CurrentRoom) {
        l7Ctx.save();
        l7Ctx.font = '24px Outfit';
        l7Ctx.fillText('🐰', l7CurrentRoom.x - 12, l7CurrentRoom.y - 20); // 漂浮在房间上
        l7Ctx.restore();
    }
    
    requestAnimationFrame(renderLoopL7);
}

function skipL7() {
    document.getElementById('victoryOverlay').style.display = 'flex';
    playSound('fanfare');
}

function restartCourse() {
    document.getElementById('victoryOverlay').style.display = 'none';
    localStorage.removeItem('euler_math_unlocked_level');
    highestUnlockedLevel = 1;
    updateLevelIndicators();
    switchLevelTo(1);
}
