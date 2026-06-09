<template>
<canvas id="lineCanvas"></canvas>

    <header>
        <div class="logo">ASIA IP <strong>2026</strong> <span data-i18n="logoSub">アジアIPコンテスト</span></div>
        <div class="header-actions">
            <nav>
                <ul>
                    <li><a href="#hero" data-i18n="navHome">ホーム</a></li>
                    <li><a href="#about" data-i18n="navAbout">コンテストとは</a></li>
                    <li><a href="#news" data-i18n="navNews">お知らせ</a></li>
                    <li><a href="#timeline" data-i18n="navTimeline">スケジュール</a></li>
                    <li><a href="#tracks" data-i18n="navTracks">募集部門</a></li>
                    <li><a href="#prizes" data-i18n="navPrizes">賞について</a></li>
                </ul>
            </nav>
            <div class="lang-switcher" aria-label="Language selector">
                <button class="lang-btn active" type="button" data-lang="ja">日</button>
                <button class="lang-btn" type="button" data-lang="zh">中</button>
                <button class="lang-btn" type="button" data-lang="en">EN</button>
            </div>
        </div>
    </header>

    <main>
        <section id="hero" class="hero container">
            <div class="hero-badge" data-i18n="heroBadge">FOR ASIA CHARACTER CREATORS</div>
            <h1 data-i18n-html="heroTitle">ASIA IP CONTEST<br>in TOKYO 2026</h1>
            <p data-i18n="heroLead">プロを目指すアジアのクリエイターたちの挑戦を応援する</p>
            <div class="cta-group">
                <a href="#" class="btn btn-primary" data-i18n="ctaEntry">応募する</a>
                <a href="#about" class="btn btn-outline" data-i18n="ctaAbout">コンテストについて</a>
            </div>
        </section>

        <section id="about" class="section-padding container">
            <div class="glass-card about-card">
                <div class="about-kicker" data-i18n="aboutKicker">ASIA IP CONTEST とは？</div>
                <h2 data-i18n="aboutTitle">プロを目指すアジアのクリエイターたちの挑戦を応援する</h2>
                <p data-i18n="aboutText1">ASIA IP CONTESTは、アジアクリエイターと企業をつなげる場を創造し、プロを目指すクリエイターたちの挑戦を応援するコンテスト＆展示会です。</p>
                <p data-i18n="aboutText2">世界は広く、多くの発見があります。そしてどんな人にもチャンスが眠っています。あなたの力でキャラクター市場を前進させることができるかもしれません！</p>
                <p data-i18n="aboutText3">勇気を持って挑戦してみましょう！</p>
            </div>
        </section>

        <section id="news" class="section-padding container">
            <div class="sec-title">
                <span>News</span>
                <h2 data-i18n="newsTitle">お知らせ</h2>
            </div>
            <div class="news-list">
                <article class="glass-card news-item">
                    <div class="news-date">2026.06.01</div>
                    <div>
                        <h3 data-i18n="news1Title">ASIA IP CONTEST in TOKYO 2026 公式サイトを公開しました。</h3>
                        <p data-i18n="news1Text">コンテストの最新情報は本サイトで順次お知らせします。</p>
                    </div>
                </article>
                <article class="glass-card news-item">
                    <div class="news-date">2026.06.01</div>
                    <div>
                        <h3 data-i18n="news2Title">作品募集を開始しました。</h3>
                        <p data-i18n="news2Text">アジアのキャラクタークリエイターからの挑戦をお待ちしています。</p>
                    </div>
                </article>
            </div>
        </section>

        <section id="timeline" class="section-padding container">
            <div class="sec-title">
                <span>Timeline</span>
                <h2 data-i18n="timelineTitle">赛事日程</h2>
            </div>
            <div class="timeline-wrapper">
                <div class="time-node">
                    <div class="time-dot"></div>
                    <h3>06.01 - 08.31</h3>
                    <p data-i18n-html="timeline1">全球作品征集期<br>(Entry Period)</p>
                </div>
                <div class="time-node">
                    <div class="time-dot" style="opacity: 0.5;"></div>
                    <h3>09.01 - 09.15</h3>
                    <p data-i18n-html="timeline2">大众人气票选<br>(Public Voting)</p>
                </div>
                <div class="time-node">
                    <div class="time-dot" style="opacity: 0.5;"></div>
                    <h3>09.16 - 09.30</h3>
                    <p data-i18n-html="timeline3">专业评委复审<br>(Jury Review)</p>
                </div>
                <div class="time-node">
                    <div class="time-dot" style="opacity: 0.5;"></div>
                    <h3>10.15</h3>
                    <p data-i18n-html="timeline4">颁奖典礼与公布<br>(Award Ceremony)</p>
                </div>
            </div>
        </section>

        <section id="tracks" class="section-padding container">
            <div class="sec-title">
                <span>Categories</span>
                <h2 data-i18n="tracksTitle">征集赛道</h2>
            </div>
            <div class="tracks-grid">
                <div class="glass-card track-card">
                    <div class="track-icon">✦</div>
                    <h3 data-i18n="track1Title">平面视觉IP</h3>
                    <p data-i18n="track1Text">角色原画、吉祥物设计、二次元虚拟偶像三视图等。强调线条的张力与色彩的极致运用。</p>
                </div>
                <div class="glass-card track-card">
                    <div class="track-icon">⟡</div>
                    <h3 data-i18n="track2Title">潮玩与立体IP</h3>
                    <p data-i18n="track2Text">盲盒企划、手办原型建模、机甲模型设计。需提交3D渲染图或多角度展示。</p>
                </div>
                <div class="glass-card track-card">
                    <div class="track-icon">✧</div>
                    <h3 data-i18n="track3Title">插画与世界观</h3>
                    <p data-i18n="track3Text">オリジナルキャラクターIPをもとにした背景イラスト、絵本、漫画ネーム、世界観設定など。</p>
                </div>
            </div>
        </section>

        <section id="prizes" class="section-padding container">
            <div class="sec-title">
                <span>Prizes & Awards</span>
                <h2 data-i18n="prizesTitle">奖项设置</h2>
            </div>
            <div class="prize-layout">
                <div class="glass-card prize-card">
                    <div class="prize-title" data-i18n="silverTitle">银奖 (Silver)</div>
                    <div class="prize-amount"><span>¥</span> 50,000</div>
                    <p style="color: var(--text-sub); font-size: 0.9rem;" data-i18n="silverText">2名 / 颁发证书与定制奖杯</p>
                </div>
                <div class="glass-card prize-card gold">
                    <div class="prize-title" data-i18n="goldTitle">金賞 (Gold)</div>
                    <div class="prize-amount"><span>¥</span> 150,000</div>
                    <p style="color: var(--text-sub); font-size: 0.9rem; font-weight: bold;" data-i18n="goldText">1名 / 商业化孵化特权 + 奖杯</p>
                </div>
                <div class="glass-card prize-card">
                    <div class="prize-title" data-i18n="popularTitle">人气奖 (Popular)</div>
                    <div class="prize-amount"><span>¥</span> 20,000</div>
                    <p style="color: var(--text-sub); font-size: 0.9rem;" data-i18n="popularText">3名 / 颁发证书与限定周边</p>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p data-i18n="footer">Asia IP Design Contest 2026. All rights reserved. 灵感无界 · 创造未来.</p>
        </div>
    </footer>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

let cleanup

onMounted(() => {
    const translations = {
                zh: {
                    lang: 'zh-CN',
                    title: 'ASIA IP CONTEST in TOKYO 2026 | 亚洲IP设计大赛',
                    logoSub: '亚洲IP设计大赛',
                    navHome: '首页',
                    navAbout: '大赛介绍',
                    navNews: '通知',
                    navTimeline: '赛事日程',
                    navTracks: '征集赛道',
                    navPrizes: '奖项设置',
                    heroBadge: 'FOR ASIA CHARACTER CREATORS',
                    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
                    heroLead: '支持以专业创作为目标的亚洲创作者勇敢挑战',
                    ctaEntry: '立即投稿',
                    ctaAbout: '了解大赛',
                    aboutKicker: 'ASIA IP CONTEST 是什么？',
                    aboutTitle: '支持以专业创作为目标的亚洲创作者勇敢挑战',
                    aboutText1: 'ASIA IP CONTEST 是一项连接亚洲创作者与企业的竞赛及展会，旨在创造交流与合作的机会，支持以专业创作为目标的创作者们发起挑战。',
                    aboutText2: '世界广阔，充满许多发现。每个人身上都隐藏着机会。你的力量，也许能够推动角色市场向前发展！',
                    aboutText3: '请带着勇气，尝试挑战吧！',
                    newsTitle: '通知',
                    news1Title: 'ASIA IP CONTEST in TOKYO 2026 官方网站已公开。',
                    news1Text: '大赛最新信息将在本网站陆续发布。',
                    news2Title: '作品征集已经开始。',
                    news2Text: '期待来自亚洲角色创作者的挑战。',
                    timelineTitle: '赛事日程',
                    timeline1: '全球作品征集期<br>(Entry Period)',
                    timeline2: '大众人气票选<br>(Public Voting)',
                    timeline3: '专业评委复审<br>(Jury Review)',
                    timeline4: '颁奖典礼与公布<br>(Award Ceremony)',
                    tracksTitle: '征集赛道',
                    track1Title: '角色设计',
                    track1Text: '角色原画、吉祥物设计、虚拟角色设定、三视图等，重视可持续发展的角色IP潜力。',
                    track2Title: '商品与立体企划',
                    track2Text: '潮玩、手办、周边商品、包装和展示方案等，可提交3D渲染图或多角度资料。',
                    track3Title: '插画与世界观',
                    track3Text: '基于原创角色IP的场景插画、绘本故事、漫画分镜和世界观设定。',
                    prizesTitle: '奖项设置',
                    silverTitle: '银奖 (Silver)',
                    silverText: '2名 / 颁发证书与定制奖杯',
                    goldTitle: '金奖 (Gold)',
                    goldText: '1名 / 商业化孵化特权 + 奖杯',
                    popularTitle: '人气奖 (Popular)',
                    popularText: '3名 / 颁发证书与限定周边',
                    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.'
                },
                ja: {
                    lang: 'ja',
                    title: 'ASIA IP CONTEST in TOKYO 2026 | アジアIPコンテスト',
                    logoSub: 'アジアIPコンテスト',
                    navHome: 'ホーム',
                    navAbout: 'コンテストとは',
                    navNews: 'お知らせ',
                    navTimeline: 'スケジュール',
                    navTracks: '募集部門',
                    navPrizes: '賞について',
                    heroBadge: 'FOR ASIA CHARACTER CREATORS',
                    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
                    heroLead: 'プロを目指すアジアのクリエイターたちの挑戦を応援する',
                    ctaEntry: '今すぐ応募 (Entry)',
                    ctaAbout: 'コンテストについて',
                    aboutKicker: 'ASIA IP CONTEST とは？',
                    aboutTitle: 'プロを目指すアジアのクリエイターたちの挑戦を応援する',
                    aboutText1: 'ASIA IP CONTESTは、アジアクリエイターと企業をつなげる場を創造し、プロを目指すクリエイターたちの挑戦を応援するコンテスト＆展示会です。',
                    aboutText2: '世界は広く、多くの発見があります。そしてどんな人にもチャンスが眠っています。あなたの力でキャラクター市場を前進させることができるかもしれません！',
                    aboutText3: '勇気を持って挑戦してみましょう！',
                    newsTitle: 'お知らせ',
                    news1Title: 'ASIA IP CONTEST in TOKYO 2026 公式サイトを公開しました。',
                    news1Text: 'コンテストの最新情報は本サイトで順次お知らせします。',
                    news2Title: '作品募集を開始しました。',
                    news2Text: 'アジアのキャラクタークリエイターからの挑戦をお待ちしています。',
                    timelineTitle: 'スケジュール',
                    timeline1: 'グローバル作品募集期間<br>(Entry Period)',
                    timeline2: '一般人気投票<br>(Public Voting)',
                    timeline3: '専門審査員による審査<br>(Jury Review)',
                    timeline4: '授賞式・結果発表<br>(Award Ceremony)',
                    tracksTitle: '募集部門',
                    track1Title: 'キャラクターデザイン',
                    track1Text: 'キャラクター原画、マスコットデザイン、バーチャルキャラクター設定、三面図など。継続的に展開できるキャラクターIPの可能性を重視します。',
                    track2Title: '商品・立体企画',
                    track2Text: 'デザイナーズトイ、フィギュア、グッズ、パッケージ、展示企画など。3Dレンダリングまたは多角度資料を提出できます。',
                    track3Title: 'イラスト・世界観',
                    track3Text: 'オリジナルキャラクターIPをもとにした背景イラスト、絵本、漫画ネーム、世界観設定など。',
                    prizesTitle: '賞について',
                    silverTitle: '銀賞 (Silver)',
                    silverText: '2名 / 証書と特製トロフィーを授与',
                    goldTitle: '金賞 (Gold)',
                    goldText: '1名 / 商業化インキュベーション特典 + トロフィー',
                    popularTitle: '人気賞 (Popular)',
                    popularText: '3名 / 証書と限定グッズを授与',
                    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.'
                },
                en: {
                    lang: 'en',
                    title: 'ASIA IP CONTEST in TOKYO 2026',
                    logoSub: 'ASIA IP CONTEST',
                    navHome: 'Home',
                    navAbout: 'About',
                    navNews: 'News',
                    navTimeline: 'Timeline',
                    navTracks: 'Categories',
                    navPrizes: 'Prizes',
                    heroBadge: 'FOR ASIA CHARACTER CREATORS',
                    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
                    heroLead: 'Supporting Asian creators who are challenging themselves to become professionals',
                    ctaEntry: 'Submit Now (Entry)',
                    ctaAbout: 'About the Contest',
                    aboutKicker: 'What is ASIA IP CONTEST?',
                    aboutTitle: 'Supporting Asian creators who are challenging themselves to become professionals',
                    aboutText1: 'ASIA IP CONTEST is a contest and exhibition that creates opportunities to connect Asian creators with companies, supporting creators who are challenging themselves to become professionals.',
                    aboutText2: 'The world is wide and full of discoveries. Opportunities are waiting inside everyone. Your talent may help move the character market forward!',
                    aboutText3: 'Take courage and give it a try!',
                    newsTitle: 'News',
                    news1Title: 'The official ASIA IP CONTEST in TOKYO 2026 website is now open.',
                    news1Text: 'Latest contest updates will be announced on this website.',
                    news2Title: 'Submissions are now open.',
                    news2Text: 'We look forward to seeing challenges from character creators across Asia.',
                    timelineTitle: 'Timeline',
                    timeline1: 'Global Entry Period<br>(Entry Period)',
                    timeline2: 'Public Voting<br>(Public Voting)',
                    timeline3: 'Jury Review<br>(Jury Review)',
                    timeline4: 'Award Ceremony & Results<br>(Award Ceremony)',
                    tracksTitle: 'Categories',
                    track1Title: 'Character Design',
                    track1Text: 'Character concept art, mascot design, virtual character settings, three-view sheets, and other works with long-term IP potential.',
                    track2Title: 'Products & 3D Planning',
                    track2Text: 'Designer toys, figures, merchandise, packaging, and exhibition concepts. 3D renders or multi-angle materials may be submitted.',
                    track3Title: 'Illustration & Worldbuilding',
                    track3Text: 'Scene illustrations, picture books, comic storyboards, and worldbuilding based on original character IP concepts.',
                    prizesTitle: 'Prizes',
                    silverTitle: 'Silver Award',
                    silverText: '2 winners / Certificate and custom trophy',
                    goldTitle: 'Gold Award',
                    goldText: '1 winner / Commercial incubation privileges + trophy',
                    popularTitle: 'Popular Award',
                    popularText: '3 winners / Certificate and limited merchandise',
                    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.'
                }
            };
    
            function getInitialLanguage() {
                const saved = localStorage.getItem('asiaIpContestLanguage');
                if (saved && translations[saved]) return saved;
                return 'ja';
            }
    
            function setLanguage(lang) {
                const copy = translations[lang] || translations.zh;
                document.documentElement.lang = copy.lang;
                document.title = copy.title;
                localStorage.setItem('asiaIpContestLanguage', lang);
    
                document.querySelectorAll('[data-i18n]').forEach((element) => {
                    const key = element.dataset.i18n;
                    if (copy[key]) element.textContent = copy[key];
                });
    
                document.querySelectorAll('[data-i18n-html]').forEach((element) => {
                    const key = element.dataset.i18nHtml;
                    if (copy[key]) element.innerHTML = copy[key];
                });
    
                document.querySelectorAll('.lang-btn').forEach((button) => {
                    const isActive = button.dataset.lang === lang;
                    button.classList.toggle('active', isActive);
                    button.setAttribute('aria-pressed', String(isActive));
                });
            }
    
            document.querySelectorAll('.lang-btn').forEach((button) => {
                button.addEventListener('click', () => setLanguage(button.dataset.lang));
            });
    
            setLanguage(getInitialLanguage());
    
            /**
             * 纯净版丝带特效（作为全站背景）
             * 主题色：#ED1566
             */
            const canvas = document.getElementById('lineCanvas');
            const ctx = canvas.getContext('2d');
            
            let width, height;
            let nodes = [];
            let animationFrameId;
            
            function init() {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
                nodes = [];
                
                // 节点数量适中
                const nodeCount = 12; 
                for (let i = 0; i < nodeCount; i++) {
                    nodes.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        baseY: Math.random() * height,
                        vx: (Math.random() - 0.5) * 1.5,
                        angle: Math.random() * Math.PI * 2,
                        angleSpeed: Math.random() * 0.01 + 0.005
                    });
                }
            }
    
            function animate() {
                animationFrameId = requestAnimationFrame(animate);
                ctx.clearRect(0, 0, width, height);
                
                let time = Date.now() * 0.001;
    
                for (let i = 0; i < nodes.length; i++) {
                    let n = nodes[i];
                    n.x += n.vx;
                    n.angle += n.angleSpeed;
                    n.y = n.baseY + Math.sin(n.angle) * 120;
                    
                    if (n.x < -100) n.x = width + 100;
                    if (n.x > width + 100) n.x = -100;
                }
    
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        let n1 = nodes[i];
                        let n2 = nodes[j];
                        
                        let dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
                        
                        // 随着屏幕变高，让连线距离稍微长一点保证丝带贯穿
                        if (dist < 600) { 
                            ctx.beginPath();
                            ctx.moveTo(n1.x, n1.y);
                            
                            let midX = (n1.x + n2.x) / 2;
                            let cp1x = midX + Math.sin(time + i) * 150;
                            let cp1y = n1.y - 100;
                            let cp2x = midX - Math.cos(time + j) * 150;
                            let cp2y = n2.y + 100;
                            
                            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, n2.x, n2.y);
                            
                            let opacity = (1 - (dist / 600)) * 0.35;
                            ctx.strokeStyle = `rgba(237, 21, 102, ${opacity})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                            
                            // 双轨丝带效果
                            ctx.beginPath();
                            ctx.moveTo(n1.x, n1.y + 10);
                            ctx.bezierCurveTo(cp1x, cp1y + 10, cp2x, cp2y + 10, n2.x, n2.y + 10);
                            ctx.strokeStyle = `rgba(237, 21, 102, ${opacity * 0.5})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            }
    
            window.addEventListener('resize', init);
            init();
            animationFrameId = requestAnimationFrame(animate);
    
            // 导航栏滚动效果：向下滚动时背景变得更白更实
            const handleScroll = () => {
                const header = document.querySelector('header');
                if (window.scrollY > 50) {
                    header.style.background = 'rgba(255, 255, 255, 0.85)';
                    header.style.boxShadow = '0 4px 20px rgba(237, 21, 102, 0.05)';
                } else {
                    header.style.background = 'rgba(255, 255, 255, 0.5)';
                    header.style.boxShadow = 'none';
                }
            };
    
            window.addEventListener('scroll', handleScroll);
    
            cleanup = () => {
                window.removeEventListener('resize', init);
                window.removeEventListener('scroll', handleScroll);
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
            };
    
})

onBeforeUnmount(() => {
    if (cleanup) cleanup()
})
</script>
