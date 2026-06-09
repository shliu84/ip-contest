<template>
  <main class="home">
    <nav class="site-nav" aria-label="主导航">
      <a class="brand" href="/">
        <span class="brand-mark">IP</span>
        <span>IP Contest 2026</span>
      </a>
      <div class="nav-links">
        <a href="#about">赛事介绍</a>
        <a href="#schedule">赛程安排</a>
        <a href="#tracks">参赛方向</a>
      </div>
    </nav>

    <section class="hero-section" id="about">
      <div class="hero-copy">
        <p class="eyebrow">2026 知识产权创新挑战赛</p>
        <h1>让创意成为可被保护、可被交易、可被看见的资产。</h1>
        <p class="lede">
          IP Contest 2026 面向学生、设计师、开发者、品牌团队与创业者，征集具有原创价值和商业潜力的知识产权项目。
        </p>
        <div class="hero-actions">
          <a class="button primary" href="#tracks">查看参赛方向</a>
          <a class="button secondary" href="#schedule">了解赛程</a>
        </div>
      </div>
      <div class="hero-visual" aria-label="赛事视觉">
        <img src="/src/assets/hero.png" alt="" />
      </div>
    </section>

    <section class="stats" aria-label="赛事亮点">
      <div>
        <strong>3</strong>
        <span>个参赛方向</span>
      </div>
      <div>
        <strong>2026</strong>
        <span>年度创新项目征集</span>
      </div>
      <div>
        <strong>IP</strong>
        <span>保护、运营与转化</span>
      </div>
    </section>

    <section class="content-band" id="schedule">
      <div class="section-heading">
        <p class="eyebrow">Schedule</p>
        <h2>赛程安排</h2>
      </div>
      <div class="timeline">
        <article>
          <span>01</span>
          <h3>项目征集</h3>
          <p>提交项目简介、创作说明、核心视觉或原型材料。</p>
        </article>
        <article>
          <span>02</span>
          <h3>初审评估</h3>
          <p>围绕原创性、市场潜力、保护策略和完成度进行评审。</p>
        </article>
        <article>
          <span>03</span>
          <h3>终审展示</h3>
          <p>入围团队进行公开展示，获得专家反馈与后续资源对接。</p>
        </article>
      </div>
    </section>

    <section class="content-band tracks-band" id="tracks">
      <div class="section-heading">
        <p class="eyebrow">Tracks</p>
        <h2>参赛方向</h2>
      </div>
      <div class="track-grid">
        <article>
          <h3>原创内容 IP</h3>
          <p>角色、故事、插画、影像、音乐、游戏设定等具备持续开发潜力的内容资产。</p>
        </article>
        <article>
          <h3>品牌与产品 IP</h3>
          <p>品牌识别、产品设计、包装方案、消费场景和可授权商业化项目。</p>
        </article>
        <article>
          <h3>技术与数字 IP</h3>
          <p>软件工具、交互体验、数字藏品、AI 应用和可形成权利布局的技术创意。</p>
        </article>
      </div>
    </section>
  </main>
</template>
