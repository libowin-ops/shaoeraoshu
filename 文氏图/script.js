/**
 * 奇妙的重叠与文氏图 — 少儿奥数趣味互动课堂
 * Core Logic & Interactive Visualizations
 */

// 全局状态
let soundEnabled = true;
let highestUnlockedLevel = 1;
let currentVennPreset = 1;
let activeLampMode = 24;
let isChallengeRunning = false;
let challengeInterval = null;

// 音效引擎 (Web Audio API Synthesizer)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!soundEnabled) return;
    
    // 恢复 AudioContext（因浏览器策略需要用户交互）
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'success') {
        // 愉快的高音双音符 (C5 -> E5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.setValueAtTime(0.1, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'error') {
        // 低沉的警告音
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'fanfare') {
        // 毕业庆祝和弦
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g);
            g.connect(audioCtx.destination);
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, now + idx * 0.1);
            g.gain.setValueAtTime(0.08, now + idx * 0.1);
            g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);
            o.start(now + idx * 0.1);
            o.stop(now + idx * 0.1 + 0.5);
        });
    }
}

// 页面加载初始化
window.addEventListener('DOMContentLoaded', () => {
    initSoundToggle();
    initLevelNav();
    
    // Level 1 初始化
    initLevel1();
    
    // Level 2 初始化
    syncVennFromInputs();
    setupVennHover();
    
    // Level 3 初始化
    initLevel3MushroomGarden();
    
    // Level 4 初始化
    switchLampMode(24);
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

// 导航与关卡切换
function initLevelNav() {
    const indicators = document.querySelectorAll('.level-indicator');
    indicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const lvl = parseInt(ind.getAttribute('data-level'));
            // 允许自由切换已解锁的关卡
            if (lvl <= highestUnlockedLevel) {
                switchLevelTo(lvl);
            } else {
                playSound('error');
                alert(`🔒 这一关还没有解锁哦！请先答对当前关卡的题目吧。`);
            }
        });
    });
}

function switchLevelTo(levelNum) {
    playSound('click');
    
    // 更新导航高亮
    document.querySelectorAll('.level-indicator').forEach(ind => {
        const lvl = parseInt(ind.getAttribute('data-level'));
        ind.classList.remove('active');
        if (lvl === levelNum) {
            ind.classList.add('active');
        }
    });
    
    // 更新面板可见性
    document.querySelectorAll('.level-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    const activePanel = document.getElementById(`level-${levelNum}`);
    activePanel.classList.add('active');
    
    // 渲染特定关卡的自适应动画
    if (levelNum === 1) {
        renderWoodenBoards();
    } else if (levelNum === 2) {
        animateVennDots();
    } else if (levelNum === 3) {
        // 蘑菇重新跳动一下
        document.querySelectorAll('.mushroom').forEach(m => {
            m.classList.add('bounce');
            setTimeout(() => m.classList.remove('bounce'), 1000);
        });
    }
}

function unlockLevel(levelNum) {
    if (levelNum > highestUnlockedLevel) {
        highestUnlockedLevel = levelNum;
        const ind = document.querySelector(`.level-indicator[data-level="${levelNum}"]`);
        if (ind) {
            ind.classList.remove('locked');
        }
        // 标记前一关完成
        const prevInd = document.querySelector(`.level-indicator[data-level="${levelNum - 1}"]`);
        if (prevInd) {
            prevInd.classList.add('completed');
        }
    }
    switchLevelTo(levelNum);
}


/* =================== LEVEL 1: 线段重叠逻辑 =================== */
const boardCountRange = document.getElementById('boardCountRange');
const boardLengthRange = document.getElementById('boardLengthRange');
const overlapRange = document.getElementById('overlapRange');

function initLevel1() {
    const inputs = [boardCountRange, boardLengthRange, overlapRange];
    inputs.forEach(inp => {
        inp.addEventListener('input', () => {
            document.getElementById('boardCountVal').textContent = boardCountRange.value;
            document.getElementById('boardLengthVal').textContent = boardLengthRange.value;
            document.getElementById('overlapVal').textContent = overlapRange.value;
            
            // 限制重叠范围不超过单板的一半，避免视觉错乱
            const maxOverlap = Math.floor(parseInt(boardLengthRange.value) / 2);
            if (parseInt(overlapRange.value) > maxOverlap) {
                overlapRange.value = maxOverlap;
                document.getElementById('overlapVal').textContent = maxOverlap;
            }
            
            renderWoodenBoards();
        });
    });
    
    // 初始化渲染
    renderWoodenBoards();
}

function renderWoodenBoards() {
    const N = parseInt(boardCountRange.value);
    const L = parseInt(boardLengthRange.value);
    const O = parseInt(overlapRange.value);
    
    const container = document.getElementById('boardContainer');
    container.innerHTML = '';
    
    // 计算缩放比例以适应容器
    const containerWidth = container.clientWidth || 500;
    const totalRealLength = N * L - (N - 1) * O;
    const scale = (containerWidth - 40) / Math.max(totalRealLength, 150); // 留出一点边距
    
    // 渲染木板
    for (let i = 0; i < N; i++) {
        const board = document.createElement('div');
        board.className = 'wood-board';
        board.style.width = `${L * scale}px`;
        board.style.left = `${(i * (L - O)) * scale + 20}px`;
        // 交替高度，展现叠放效果
        board.style.top = i % 2 === 0 ? '12px' : '36px';
        board.style.zIndex = i + 1;
        board.textContent = `${L}cm`;
        container.appendChild(board);
    }
    
    // 渲染重叠指示虚线
    for (let i = 0; i < N - 1; i++) {
        const line = document.createElement('div');
        line.className = 'overlap-line';
        // 重叠部分的中心点位置
        const leftPos = ((i * (L - O)) + L - O/2) * scale + 20;
        line.style.left = `${leftPos}px`;
        container.appendChild(line);
    }
    
    // 渲染刻度尺
    renderRuler(totalRealLength, scale);
    
    // 更新推导公式
    document.getElementById('f-count').textContent = N;
    document.getElementById('f-length').textContent = L;
    document.getElementById('f-overlap-count').textContent = N - 1;
    document.getElementById('f-overlap-count-text').textContent = N - 1;
    document.getElementById('f-overlap').textContent = O;
    document.getElementById('f-result').textContent = totalRealLength;
}

function renderRuler(totalLen, scale) {
    const ruler = document.getElementById('rulerX');
    ruler.innerHTML = '';
    
    // 动态生成尺子刻度 (以50cm为大刻度，10cm为小刻度)
    const step = totalLen > 300 ? 50 : 25;
    for (let x = 0; x <= totalLen; x += 5) {
        if (x % step === 0 || x === totalLen || x === 0) {
            const tick = document.createElement('div');
            tick.className = 'ruler-tick major';
            tick.style.left = `${x * scale + 20}px`;
            
            const label = document.createElement('div');
            label.className = 'ruler-label';
            label.style.left = `${x * scale + 20}px`;
            label.textContent = `${Math.round(x)}`;
            
            ruler.appendChild(tick);
            ruler.appendChild(label);
        } else if (x % 10 === 0) {
            const tick = document.createElement('div');
            tick.className = 'ruler-tick';
            tick.style.left = `${x * scale + 20}px`;
            ruler.appendChild(tick);
        }
    }
}

// 检查线段题目答案
function checkQuestion(id, correctAnswer) {
    const input = document.getElementById(`${id}-input`);
    const feedback = document.getElementById(`${id}-feedback`);
    const userAns = parseInt(input.value);
    
    if (isNaN(userAns)) {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 请先输入数字答案！';
        return;
    }
    
    if (userAns === correctAnswer) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.textContent = '🎉 太棒了！回答完全正确！';
        
        // 标记完成并解锁下一题
        document.getElementById(`${id}-card`).classList.add('completed');
        
        if (id === 'q1') {
            unlockQuizCard('q2');
        } else if (id === 'q2') {
            unlockQuizCard('q3');
            document.getElementById('q3-hint-action').style.display = 'block';
        } else if (id === 'q3') {
            // 三道题全对，解锁下一关 Level 2
            unlockLevel(2);
        }
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 算得不太对哦，再仔细想想或者拖动左侧模拟器算算看！';
    }
}

function unlockQuizCard(id) {
    const card = document.getElementById(`${id}-card`);
    if (!card) return;
    card.classList.remove('locked');
    const input = card.querySelector('input');
    if (input) input.disabled = false;
    card.querySelectorAll('button').forEach(btn => btn.disabled = false);
}

// 题目3的解密演示切换
let q3DemoShown = false;
function toggleQ3Demo() {
    playSound('click');
    const box = document.getElementById('q3DemoBox');
    q3DemoShown = !q3DemoShown;
    box.style.display = q3DemoShown ? 'block' : 'none';
}


/* =================== LEVEL 2: 文氏图逻辑 =================== */

// 预设题目数据
const vennPresets = {
    1: { name: "例题1: 课外活动", text: "2（1）班学生都参加课外活动，有15人参加美术班，有23人参加舞蹈班。其中5人两个班都参加，2（1）班一共有多少人？", a: 15, b: 23, ab: 5, neither: 0, ans: 33, labelA: "美术班", labelB: "舞蹈班", m1: "只参加美术班 = 15 - 5 = 10人；只参加舞蹈班 = 23 - 5 = 18人；都参加 = 5人。总人数 = 10 + 18 + 5 = 33人。", m2: "公式法：A + B - AB = 15 + 23 - 5 = 33人。" },
    2: { name: "例题2: 田径运动", text: "2（1）班学生参加田径运动会，每人限报两项，其中有25人参加径赛，有20人参加田赛。两项都参加有10人，两项都没参加的有11人，2（1）班共有学生多少人？", a: 25, b: 20, ab: 10, neither: 11, ans: 46, labelA: "径赛", labelB: "田赛", m1: "只参加径赛 = 25 - 10 = 15人；只参加田赛 = 20 - 10 = 10人；都参加 = 10人；都不参加 = 11人。总人数 = 15 + 10 + 10 + 11 = 46人。", m2: "公式法：A + B - AB + 都不参加 = 25 + 20 - 10 + 11 = 46人。" },
    3: { name: "例题3: 数学测试", text: "一次数学测试，全班36人中，做对第一道题目的有21人，做对第二道的有18人，每人至少做对两道题中的一道。两道题都做对的有几人？", a: 21, b: 18, ab: 3, neither: 0, ans: 3, labelA: "做对题1", labelB: "做对题2", m1: "设都做对为X人。只做对第一道 = 21 - X；只做对第二道 = 18 - X；都做对 = X。方程为：(21 - X) + (18 - X) + X = 36，求得 X = 3人。", m2: "直接应用变体公式：都做对的人数 AB = A + B - 总数 = 21 + 18 - 36 = 3人。" },
    4: { name: "例题4: 象棋与围棋", text: "二（5）班有42名同学，会下象棋的有21名同学，会下围棋的有17名同学，两种棋都不会的有10名。两种棋都会下的同学有多少名？", a: 21, b: 17, ab: 6, neither: 10, ans: 6, labelA: "会下象棋", labelB: "会下围棋", m1: "下棋的总人数 = 42 - 10 = 32人。这32人会下象棋或围棋。都下的人数 = 21 + 17 - 32 = 6人。", m2: "总公式变体：双料人数 AB = A + B + 都不参加 - 总数 = 21 + 17 + 10 - 42 = 6人。" },
    5: { name: "例题5: 春游带水壶", text: "有101个同学带着水壶或水果去春游，其中带水壶的有78人，带水果的有71人。只带水壶的人有多少人？", a: 78, b: 71, ab: 48, neither: 0, ans: 30, labelA: "带水壶", labelB: "带水果", m1: "两样都带的人数 = 78 + 71 - 101 = 48人。只带水壶的人数 = 78 - 48 = 30人。", m2: "同理，只带水果的人数 = 71 - 48 = 23人。只带水壶人数 = 水壶总数 - 双带人数 = 78 - 48 = 30人。" }
};

function loadVennPreset(presetId) {
    playSound('click');
    currentVennPreset = presetId;
    
    // 高亮预设按钮
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-preset-${presetId}`).classList.add('active');
    
    // 更新题目文字
    const data = vennPresets[presetId];
    document.getElementById('venn-q-num').textContent = `例${presetId}`;
    document.getElementById('venn-question-text').textContent = data.text;
    
    // 清空回答和逐步解释
    document.getElementById('venn-answer-input').value = '';
    document.getElementById('venn-feedback').style.display = 'none';
    document.getElementById('vennStepBox').style.display = 'none';
    
    // 同步计算器数值
    document.getElementById('calc-a').value = data.a;
    document.getElementById('calc-b').value = data.b;
    document.getElementById('calc-ab').value = data.ab;
    document.getElementById('calc-neither').value = data.neither;
    
    // 更新文氏图标签名字
    document.getElementById('titleOnlyA').textContent = `只${data.labelA}`;
    document.getElementById('titleBoth').textContent = `两样都会`;
    document.getElementById('titleOnlyB').textContent = `只${data.labelB}`;
    
    syncVennFromInputs();
}

function syncVennFromInputs() {
    const A = parseInt(document.getElementById('calc-a').value) || 0;
    const B = parseInt(document.getElementById('calc-b').value) || 0;
    const AB = parseInt(document.getElementById('calc-ab').value) || 0;
    const neither = parseInt(document.getElementById('calc-neither').value) || 0;
    
    // 数据合理性微调
    if (AB > A) {
        alert("⚠️ 都参加的人数不能大于参加A的总人数！已自动调整。");
        document.getElementById('calc-ab').value = A;
        return syncVennFromInputs();
    }
    if (AB > B) {
        alert("⚠️ 都参加的人数不能大于参加B的总人数！已自动调整。");
        document.getElementById('calc-ab').value = B;
        return syncVennFromInputs();
    }
    
    const onlyA = A - AB;
    const onlyB = B - AB;
    
    // 更新 SVG 上的数值
    document.getElementById('labelOnlyA').textContent = onlyA;
    document.getElementById('labelBoth').textContent = AB;
    document.getElementById('labelOnlyB').textContent = onlyB;
    document.getElementById('labelNeither').textContent = neither;
    
    // 渲染漂浮小图标
    renderFloatingIcons(onlyA, onlyB, AB, neither);
}

function renderFloatingIcons(onlyA, onlyB, AB, neither) {
    const container = document.getElementById('floatingContainer');
    container.innerHTML = '';
    
    // 根据当前预设分配 emoji 样式
    let emojiA = '🎨', emojiB = '💃';
    if (currentVennPreset === 2) { emojiA = '🏃‍♂️'; emojiB = '👟'; }
    if (currentVennPreset === 3) { emojiA = '📝'; emojiB = '💯'; }
    if (currentVennPreset === 4) { emojiA = '♟️'; emojiB = '⚪'; }
    if (currentVennPreset === 5) { emojiA = '🥤'; emojiB = '🍎'; }
    
    // 为防止小球堆叠过多，限制显示上限
    const maxRender = 15;
    const scaleCount = (cnt) => Math.min(cnt, maxRender);
    
    // 辅助生成特定圆盘内的随机坐标
    function getRandomPointInCircle(cx, cy, r, excludeCx, excludeCy, excludeR) {
        let attempts = 0;
        while (attempts < 100) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * (r - 20); // 往内缩进20px，防止碰到边缘
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist;
            
            // 如果需要排除另一个圆
            if (excludeCx) {
                const distToExclude = Math.sqrt(Math.pow(px - excludeCx, 2) + Math.pow(py - excludeCy, 2));
                if (distToExclude >= excludeR) {
                    return { x: px, y: py };
                }
            } else {
                return { x: px, y: py };
            }
            attempts++;
        }
        return { x: cx, y: cy }; // 兜底
    }
    
    // 辅助生成交集重叠区域的随机坐标
    function getRandomPointInIntersection() {
        let attempts = 0;
        while (attempts < 150) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * 80;
            // 在中间重叠区
            const px = 250 + Math.cos(angle) * dist * 0.4; // 压扁点
            const py = 180 + Math.sin(angle) * dist * 0.8;
            
            // 验证是否同时在 Circle A 和 Circle B 内
            const distToA = Math.sqrt(Math.pow(px - 190, 2) + Math.pow(py - 180, 2));
            const distToB = Math.sqrt(Math.pow(px - 310, 2) + Math.pow(py - 180, 2));
            
            if (distToA < 100 && distToB < 100) {
                return { x: px, y: py };
            }
            attempts++;
        }
        return { x: 250, y: 180 };
    }
    
    // 辅助生成外部区域随机坐标
    function getRandomPointOutside() {
        let attempts = 0;
        while (attempts < 100) {
            const px = Math.random() * 440 + 30;
            const py = Math.random() * 290 + 30;
            
            const distToA = Math.sqrt(Math.pow(px - 190, 2) + Math.pow(py - 180, 2));
            const distToB = Math.sqrt(Math.pow(px - 310, 2) + Math.pow(py - 180, 2));
            
            // 必须在矩形框内，且在两个圆之外
            if (distToA > 115 && distToB > 115 && px < 460 && py < 310) {
                return { x: px, y: py };
            }
            attempts++;
        }
        return { x: 440, y: 80 };
    }
    
    function createDot(pt, emoji) {
        const dot = document.createElement('div');
        dot.className = 'floating-dot';
        dot.style.left = `${pt.x - 12}px`;
        dot.style.top = `${pt.y - 12}px`;
        dot.textContent = emoji;
        container.appendChild(dot);
    }
    
    // 1. 只参加 A (Circle A = (190, 180, 100), 排除 B = (310, 180, 100))
    for (let i = 0; i < scaleCount(onlyA); i++) {
        const pt = getRandomPointInCircle(190, 180, 100, 310, 180, 100);
        createDot(pt, emojiA);
    }
    
    // 2. 只参加 B (Circle B = (310, 180, 100), 排除 A = (190, 180, 100))
    for (let i = 0; i < scaleCount(onlyB); i++) {
        const pt = getRandomPointInCircle(310, 180, 100, 190, 180, 100);
        createDot(pt, emojiB);
    }
    
    // 3. 都参加 (A & B 重叠部分)
    for (let i = 0; i < scaleCount(AB); i++) {
        const pt = getRandomPointInIntersection();
        createDot(pt, '⭐');
    }
    
    // 4. 都不参加 (外部)
    for (let i = 0; i < scaleCount(neither); i++) {
        const pt = getRandomPointOutside();
        createDot(pt, '💤');
    }
}

// 飘浮小人初始微动
function animateVennDots() {
    const dots = document.querySelectorAll('.floating-dot');
    dots.forEach((dot, idx) => {
        dot.style.animationDelay = `${idx * 0.15}s`;
    });
}

// SVG 区域 hover 解释
function setupVennHover() {
    const hoverInfo = document.getElementById('hoverInfoBox');
    
    const circleA = document.getElementById('circleA');
    const circleB = document.getElementById('circleB');
    const intersection = document.getElementById('intersectionPath');
    const outerRect = document.getElementById('vennOuterRect');
    
    function showInfo(text) {
        hoverInfo.innerHTML = text;
        hoverInfo.style.background = '#e0f2fe';
        hoverInfo.style.borderColor = '#7dd3fc';
        hoverInfo.style.color = '#0369a1';
    }
    
    function resetInfo() {
        hoverInfo.innerHTML = "💡 移动鼠标到圆圈上，查看各区域的意义！";
        hoverInfo.style.background = '#f8fafc';
        hoverInfo.style.borderColor = '#e2e8f0';
        hoverInfo.style.color = varColor('--text-muted');
    }
    
    // 获取CSS变量兜底
    function varColor(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    
    circleA.addEventListener('mouseenter', (e) => {
        // 由于SVG圆重叠，这里需要具体判断
        showInfo(`🔵 <b>蓝色圈内（左侧整体）</b>：代表所有参加 <b>${vennPresets[currentVennPreset].labelA}</b> 的学生。`);
    });
    circleA.addEventListener('mouseleave', resetInfo);
    
    circleB.addEventListener('mouseenter', () => {
        showInfo(`💗 <b>粉色圈内（右侧整体）</b>：代表所有参加 <b>${vennPresets[currentVennPreset].labelB}</b> 的学生。`);
    });
    circleB.addEventListener('mouseleave', resetInfo);
    
    intersection.addEventListener('mouseenter', (e) => {
        e.stopPropagation(); // 阻止冒泡到圆形
        showInfo(`🟣 <b>重叠部分（中间交集）</b>：代表 <b>两样都参加</b> 的双料小学霸们！这里需要扣除重复计算。`);
        intersection.style.opacity = '0.4';
    });
    intersection.addEventListener('mouseleave', () => {
        resetInfo();
        intersection.style.opacity = '0';
    });
    
    outerRect.addEventListener('mouseenter', () => {
        showInfo(`⬜ <b>长方形框框（全班范围）</b>：代表全班所有学生。圈圈外面代表<b>两样都不参加</b>的同学。`);
    });
    outerRect.addEventListener('mouseleave', resetInfo);
}

// 检查双圈答案
function checkVennQuestion() {
    const input = document.getElementById('venn-answer-input');
    const feedback = document.getElementById('venn-feedback');
    const userAns = parseInt(input.value);
    const preset = vennPresets[currentVennPreset];
    
    if (isNaN(userAns)) {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 请输入您的答案！';
        return;
    }
    
    if (userAns === preset.ans) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.textContent = '🎉 答对啦！真聪明！';
        
        // 显示步骤卡
        const stepBox = document.getElementById('vennStepBox');
        document.getElementById('venn-m1-text').textContent = preset.m1;
        document.getElementById('venn-m2-text').textContent = preset.m2;
        stepBox.style.display = 'block';
        
        // 如果通关了前5个例题中的一部分，按步骤推进
        if (currentVennPreset === 5) {
            document.getElementById('unlockL3Btn').style.opacity = '1';
            document.getElementById('unlockL3Btn').classList.add('primary');
            unlockLevel(3);
        } else {
            // 自动推荐下一个例题
            setTimeout(() => {
                loadVennPreset(currentVennPreset + 1);
            }, 5000);
        }
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 答案不太对哦。调整左下角的计算器，看看文氏图的数值变化吧！';
    }
}


/* =================== LEVEL 3: 小白兔蘑菇园逻辑 =================== */

function initLevel3MushroomGarden() {
    const mushroomsLayer = document.getElementById('mushroomsLayer');
    mushroomsLayer.innerHTML = '';
    
    // 蘑菇放置坐标参数配置
    const coords = {
        'a-only': [
            {x: 60, y: 120}, {x: 80, y: 70}, {x: 100, y: 160}, {x: 120, y: 100},
            {x: 130, y: 200}, {x: 70, y: 180}, {x: 140, y: 140}, {x: 100, y: 120}
        ],
        'b-only': [
            {x: 340, y: 120}, {x: 370, y: 80}, {x: 390, y: 150}, {x: 420, y: 100},
            {x: 410, y: 200}, {x: 360, y: 170}, {x: 430, y: 160}, {x: 380, y: 210},
            {x: 330, y: 70}, {x: 350, y: 150}, {x: 410, y: 60}, {x: 400, y: 120},
            {x: 370, y: 130}, {x: 430, y: 220}, {x: 350, y: 220}, {x: 440, y: 130}
        ],
        'both': [
            {x: 210, y: 80}, {x: 230, y: 120}, {x: 250, y: 60}, {x: 270, y: 140},
            {x: 220, y: 190}, {x: 240, y: 160}, {x: 260, y: 100}, {x: 280, y: 200},
            {x: 230, y: 220}, {x: 260, y: 220}
        ]
    };
    
    // 生成 A 独有 (红色)
    coords['a-only'].forEach(pt => createMushroom(pt.x, pt.y, 'a-only', 'hue-rotate(0deg)'));
    
    // 生成 B 独有 (蓝色)
    coords['b-only'].forEach(pt => createMushroom(pt.x, pt.y, 'b-only', 'hue-rotate(140deg)'));
    
    // 生成重叠 (紫色)
    coords['both'].forEach(pt => createMushroom(pt.x, pt.y, 'both', 'hue-rotate(260deg)'));
    
    // 随机生成 86 个圈外金色蘑菇 (Neither)
    for (let i = 0; i < 86; i++) {
        let attempts = 0;
        while (attempts < 300) {
            const rx = Math.random() * 470 + 15;
            const ry = Math.random() * 250 + 15;
            
            // 避开圆圈 A (140, 140, 110) 和 B (360, 140, 110) 区域以防重叠
            const distToA = Math.sqrt(Math.pow(rx - 130, 2) + Math.pow(ry - 140, 2));
            const distToB = Math.sqrt(Math.pow(rx - 370, 2) + Math.pow(ry - 140, 2));
            
            if (distToA > 115 && distToB > 115) {
                createMushroom(rx, ry, 'neither', 'hue-rotate(45deg) saturate(1.5)');
                break;
            }
            attempts++;
        }
    }
    
    setupMushroomHover();
}

function createMushroom(x, y, zone, filterStyle) {
    const el = document.createElement('div');
    el.className = 'mushroom';
    el.setAttribute('data-zone', zone);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.filter = filterStyle;
    el.textContent = '🍄';
    document.getElementById('mushroomsLayer').appendChild(el);
}

function setupMushroomHover() {
    const zones = document.querySelectorAll('.garden-zone');
    const infoCard = document.getElementById('zoneInfoCard');
    const infoTitle = document.getElementById('zoneInfoTitle');
    const infoDesc = document.getElementById('zoneInfoDesc');
    
    const zoneTexts = {
        'a-only': { title: "园地 A 独有区域 🔴", desc: "这里有 8 个红色蘑菇。它们只长在园地 A 里面，不在园地 B 中（18 - 10 = 8个）。" },
        'b-only': { title: "园地 B 独有区域 🔵", desc: "这里有 16 个蓝色蘑菇。它们只长在园地 B 里面，不在园地 A 中（26 - 10 = 16个）。" },
        'both': { title: "A 与 B 的公共重合部分 🟣", desc: "这里有 10 个紫色蘑菇。它们既属于园地 A，也属于园地 B（公共重叠部分）。" },
        'neither': { title: "园地 A 和 B 以外的草地 🟡", desc: "这里散落着 86 个金色的小蘑菇。它们在两个圈圈的外面，属于长方形草地的其余部分（120 - 34 = 86个）。" }
    };
    
    zones.forEach(zone => {
        const zoneType = zone.getAttribute('data-zone');
        
        zone.addEventListener('mouseenter', () => {
            // 高亮当前区域内所有蘑菇
            document.querySelectorAll(`.mushroom[data-zone="${zoneType}"]`).forEach(m => {
                m.classList.add('bounce');
            });
            
            // 更新看板信息
            infoTitle.textContent = zoneTexts[zoneType].title;
            infoDesc.textContent = zoneTexts[zoneType].desc;
            infoCard.style.background = '#fef08a';
            infoCard.style.borderColor = '#facc15';
        });
        
        zone.addEventListener('mouseleave', () => {
            document.querySelectorAll(`.mushroom[data-zone="${zoneType}"]`).forEach(m => {
                m.classList.remove('bounce');
            });
            
            infoTitle.textContent = "蘑菇总数统计 🐇";
            infoDesc.textContent = "总共有 120 个蘑菇生长在长方形地块中。把鼠标移到不同区域看看吧！";
            infoCard.style.background = '#fdf8e2';
            infoCard.style.borderColor = '#fde047';
        });
    });
}

// 检查蘑菇关卡问题
function checkL3Question(id, correctAnswer) {
    const input = document.getElementById(`${id}-input`);
    const feedback = document.getElementById(`${id}-feedback`);
    const userAns = parseInt(input.value);
    
    if (isNaN(userAns)) {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 请输入计算答案！';
        return;
    }
    
    if (userAns === correctAnswer) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.textContent = '🎉 答对啦！非常正确！';
        document.getElementById(`${id}-card`).classList.add('completed');
        
        // 阶梯式解锁后面的子题目
        if (id === 'l3q1') {
            unlockQuizCard('l3q2');
        } else if (id === 'l3q2') {
            unlockQuizCard('l3q3');
        } else if (id === 'l3q3') {
            unlockQuizCard('l3q4');
        } else if (id === 'l3q4') {
            // 全通，解锁第四关
            unlockLevel(4);
        }
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 数量数得不对哦，把鼠标悬停在左侧对应区域算一算！';
    }
}


/* =================== LEVEL 4: 霓虹灯泡逻辑 =================== */
let lampStates = []; // 存储所有灯泡状态 true: 亮, false: 灭

function switchLampMode(num) {
    playSound('click');
    activeLampMode = num;
    
    // 切换按钮高亮
    document.querySelectorAll('.matrix-mode-selector button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-lamp-${num}`).classList.add('active');
    
    // 更新倍数选择副按钮的名称
    const secondaryBtn = document.getElementById('btn-multiple-secondary');
    if (num === 24) {
        secondaryBtn.textContent = '按 4 的倍数开关';
        document.getElementById('challengeRunnerBox').style.display = 'none';
    } else if (num === 60) {
        secondaryBtn.textContent = '按 5 的倍数开关';
        document.getElementById('challengeRunnerBox').style.display = 'none';
    } else {
        secondaryBtn.textContent = '按 5 的倍数开关';
        document.getElementById('challengeRunnerBox').style.display = 'block';
    }
    
    // 解锁对应的例题卡片
    if (num === 24) {
        unlockQuizCard('l4q1');
    } else if (num === 60) {
        unlockQuizCard('l4q2');
    } else {
        unlockQuizCard('l4q3');
    }
    
    resetLamps();
}

function resetLamps() {
    if (challengeInterval) clearInterval(challengeInterval);
    isChallengeRunning = false;
    document.getElementById('speedIndicator').textContent = '当前小朋友: -';
    document.getElementById('challengeProgress').style.width = '0%';
    
    const matrix = document.getElementById('lightMatrix');
    matrix.innerHTML = '';
    matrix.className = `light-matrix matrix-${activeLampMode}`;
    
    lampStates = new Array(activeLampMode).fill(true); // 全部初始为亮 (true)
    
    for (let i = 1; i <= activeLampMode; i++) {
        const card = document.createElement('div');
        card.className = 'bulb-card on';
        card.id = `bulb-${i}`;
        card.setAttribute('onclick', `toggleSingleBulb(${i})`);
        
        const bulb = document.createElement('span');
        bulb.className = 'bulb-icon';
        bulb.textContent = '💡';
        
        const num = document.createElement('span');
        num.className = 'bulb-num';
        num.textContent = i;
        
        card.appendChild(bulb);
        card.appendChild(num);
        matrix.appendChild(card);
    }
    
    updateLampStats();
}

function toggleSingleBulb(idx) {
    playSound('click');
    const card = document.getElementById(`bulb-${idx}`);
    lampStates[idx - 1] = !lampStates[idx - 1];
    
    if (lampStates[idx - 1]) {
        card.classList.add('on');
    } else {
        card.classList.remove('on');
    }
    
    updateLampStats();
}

// 波动点按倍数
function toggleMultiples(mult) {
    playSound('click');
    let delay = 0;
    
    for (let i = mult; i <= activeLampMode; i += mult) {
        setTimeout(() => {
            const card = document.getElementById(`bulb-${i}`);
            if (!card) return;
            
            lampStates[i - 1] = !lampStates[i - 1];
            if (lampStates[i - 1]) {
                card.classList.add('on');
            } else {
                card.classList.remove('on');
            }
            updateLampStats();
        }, delay);
        delay += 60; // 产生波浪般点亮/熄灭动画
    }
}

function updateLampStats() {
    const onCount = lampStates.filter(x => x === true).length;
    const offCount = activeLampMode - onCount;
    
    document.getElementById('stats-on').textContent = onCount;
    document.getElementById('stats-off').textContent = offCount;
}

// 100盏灯大挑战动画逻辑
function run100KidsChallenge() {
    if (isChallengeRunning) return;
    isChallengeRunning = true;
    playSound('click');
    
    // 先重置为全部亮起
    resetLamps();
    
    let kid = 1;
    const progressFill = document.getElementById('challengeProgress');
    const speedInd = document.getElementById('speedIndicator');
    
    challengeInterval = setInterval(() => {
        speedInd.textContent = `当前小朋友: ${kid} 号`;
        progressFill.style.width = `${kid}%`;
        
        // 开关倍数的灯泡
        for (let i = kid; i <= 100; i += kid) {
            const card = document.getElementById(`bulb-${i}`);
            lampStates[i - 1] = !lampStates[i - 1];
            if (lampStates[i - 1]) {
                card.classList.add('on');
            } else {
                card.classList.remove('on');
            }
        }
        updateLampStats();
        
        kid++;
        if (kid > 100) {
            clearInterval(challengeInterval);
            isChallengeRunning = false;
            speedInd.textContent = `🎉 挑战完成！`;
            playSound('success');
            
            // 高亮最终灭掉的灯泡 (完全平方数)
            highlightSquareBulbs();
        }
    }, 150); // 每0.15秒进来一个小朋友
}

function highlightSquareBulbs() {
    // 平方数列表：1, 4, 9, 16, 25, 36, 49, 64, 81, 100
    const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    squares.forEach(num => {
        const card = document.getElementById(`bulb-${num}`);
        if (card) {
            card.style.borderColor = '#10b981';
            card.style.boxShadow = '0 0 15px #10b981';
            card.style.transform = 'scale(1.08)';
        }
    });
}

// 检查电灯题目答案
function checkL4Question(id, correctAnswer) {
    const input = document.getElementById(`${id}-input`);
    const feedback = document.getElementById(`${id}-feedback`);
    const userAns = parseInt(input.value);
    
    if (isNaN(userAns)) {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 请输入答案！';
        return;
    }
    
    if (userAns === correctAnswer) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.textContent = '🎉 回答完全正确！';
        document.getElementById(`${id}-card`).classList.add('completed');
        document.getElementById(`${id}-explain`).style.display = 'block';
        
        if (id === 'l4q1') {
            unlockQuizCard('l4q2');
        } else if (id === 'l4q2') {
            unlockQuizCard('l4q3');
        }
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 算得不太对，看一眼左边亮着（💡）的灯泡实际数数看！';
    }
}

function checkL4Challenge() {
    const input = document.getElementById('l4q3-input');
    const feedback = document.getElementById('l4q3-feedback');
    const ans = input.value.trim();
    
    if (ans.includes('平方') || ans.includes('完全平方') || ans.includes('1,4,9') || ans.includes('1、4、9')) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.textContent = '🎉 完美通关！熄灭的正好是完全平方数（1, 4, 9, 16, 25, 36, 49, 64, 81, 100）！因为它们的约数个数是奇数个（比如 16=1x16, 2x8, 4x4，约数有1,2,4,8,16共5个），所以会被按奇数次，从开变关！';
        document.getElementById('l4q3-card').classList.add('completed');
        unlockLevel(5);
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 规律不对哦。提示：观察灭掉的数字 1, 4, 9, 16... 它们都是什么数？';
    }
}


/* =================== LEVEL 5: 终极奥数挑战逻辑 =================== */

function runAlgebraSteps() {
    playSound('click');
    const mergeArea = document.getElementById('eqMergeArea');
    mergeArea.style.display = 'block';
    
    document.getElementById('btn-run-algebra').style.display = 'none';
    document.getElementById('btn-reset-algebra').style.display = 'inline-block';
}

function resetAlgebra() {
    playSound('click');
    const mergeArea = document.getElementById('eqMergeArea');
    mergeArea.style.display = 'none';
    
    document.getElementById('btn-run-algebra').style.display = 'inline-block';
    document.getElementById('btn-reset-algebra').style.display = 'none';
}

function checkL5Question(id, correctAnswer) {
    const input = document.getElementById(`${id}-input`);
    const feedback = document.getElementById(`${id}-feedback`);
    const userAns = parseInt(input.value);
    
    if (isNaN(userAns)) {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 请输入答案！';
        return;
    }
    
    if (userAns === correctAnswer) {
        playSound('success');
        feedback.className = 'quiz-feedback success';
        feedback.textContent = '🎉 恭喜你！计算结果完全正确！';
        document.getElementById(`${id}-card`).classList.add('completed');
        
        // 显示毕业证书领取入口
        document.getElementById('graduationBox').style.display = 'block';
        document.getElementById('graduationBox').scrollIntoView({ behavior: 'smooth' });
    } else {
        playSound('error');
        feedback.className = 'quiz-feedback error';
        feedback.textContent = '❌ 算错啦。借助左侧的等式天平合并推导，重新算一下！';
    }
}


/* =================== GRADUATION 毕业证书 & 粒子特效 =================== */

const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrame = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height - 20;
        this.size = Math.random() * 8 + 6;
        this.color = `hsl(${Math.random() * 360}, 90%, 60%)`;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 5 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height) {
            this.y = -20;
            this.x = Math.random() * canvas.width;
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        // 绘制彩色小纸屑
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function startConfetti() {
    canvas.style.display = 'block';
    resizeCanvas();
    particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push(new ConfettiParticle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationFrame = requestAnimationFrame(animate);
    }
    animate();
}

function stopConfetti() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    canvas.style.display = 'none';
}

function generateCertificate() {
    const nameInput = document.getElementById('studentNameInput');
    const studentName = nameInput.value.trim() || '奥数小达人';
    
    document.getElementById('certStudentName').textContent = studentName;
    
    // 设置毕业日期为当前系统日期
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    document.getElementById('certDate').textContent = dateStr;
    
    // 打开弹窗并播放撒花
    document.getElementById('certModal').style.display = 'flex';
    playSound('fanfare');
    startConfetti();
}

function closeModal() {
    document.getElementById('certModal').style.display = 'none';
    stopConfetti();
}

// =================== 跳过问题直接判定正确逻辑 ===================
function skipQuestion(id, correctAnswer) {
    const input = document.getElementById(`${id}-input`);
    if (input) {
        input.value = correctAnswer;
    }
    if (id.startsWith('l3')) {
        checkL3Question(id, correctAnswer);
    } else if (id.startsWith('l4')) {
        checkL4Question(id, correctAnswer);
    } else if (id === 'l5q1') {
        checkL5Question(id, correctAnswer);
    } else {
        checkQuestion(id, correctAnswer);
    }
}

function skipVennQuestion() {
    const preset = vennPresets[currentVennPreset];
    const input = document.getElementById('venn-answer-input');
    if (input) {
        input.value = preset.ans;
    }
    checkVennQuestion();
}

function skipL4Challenge() {
    const input = document.getElementById('l4q3-input');
    if (input) {
        input.value = '平方数';
    }
    checkL4Challenge();
}

