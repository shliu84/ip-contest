<template>
  <main>
    <div class="event-page-layout container">
      <aside
        class="event-page-nav"
        :aria-label="copy.nav.label"
        :style="navProgressStyle"
      >
        <div class="event-page-nav-title">ON THIS PAGE</div>
        <a
          v-for="item in copy.nav.items"
          :key="item.href"
          class="event-page-nav-link"
          :class="{ active: activeHref === item.href }"
          :href="item.href"
          @click="activeHref = item.href"
        >
          {{ item.label }}
        </a>
      </aside>

      <div class="event-page-content">
        <section id="about-foreword" class="foreword-section section-padding container">
          <article class="glass-card foreword-card">
            <div class="foreword-heading">
              <span>Foreword</span>
              <h2>{{ copy.foreword.title }}</h2>
            </div>
            <div class="foreword-signature">
              <div class="foreword-photo-placeholder" aria-hidden="true">
                <span>PHOTO</span>
              </div>
              <h3>{{ copy.foreword.name }}</h3>
              <p>{{ copy.foreword.role }}</p>
            </div>
            <div class="foreword-body">
              <p
                v-for="paragraph in copy.foreword.opening"
                :key="paragraph"
              >
                {{ paragraph }}
              </p>
              <ul class="foreword-list">
                <li
                  v-for="item in copy.foreword.focusItems"
                  :key="item.title"
                >
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.text }}</span>
                </li>
              </ul>
              <p
                v-for="paragraph in copy.foreword.closing"
                :key="paragraph"
              >
                {{ paragraph }}
              </p>
            </div>
          </article>
        </section>
        <section id="about-purpose" class="purpose-section section-padding container">
          <div class="sec-title">
            <span>Purpose</span>
            <h2>{{ copy.purpose.title }}</h2>
          </div>
          <div class="purpose-grid">
            <article
              v-for="item in copy.purpose.items"
              :key="item.title"
              class="glass-card purpose-card"
            >
              <h3>{{ item.title }}</h3>
              <div class="purpose-row">
                <div class="purpose-illustration-placeholder" aria-hidden="true"></div>
                <div class="purpose-content">
                  <p>{{ item.body }}</p>
                  <p v-if="item.note" class="purpose-note">{{ item.note }}</p>
                </div>
              </div>
            </article>
          </div>
        </section>
        <section id="about-organizer" class="organizer-section section-padding container">
          <div class="sec-title">
            <span>Organizer</span>
            <h2>{{ copy.organizer.title }}</h2>
          </div>
          <article class="glass-card organizer-card featured">
            <div class="organization-image-placeholder" aria-hidden="true"></div>
            <div>
              <h3>{{ copy.organizer.name }}</h3>
              <p
                v-for="paragraph in copy.organizer.body"
                :key="paragraph"
              >
                {{ paragraph }}
              </p>
            </div>
          </article>
        </section>
        <section id="about-co-organizer" class="organizer-section section-padding container">
          <div class="sec-title">
            <span>Co-organizer</span>
            <h2>{{ copy.coOrganizer.title }}</h2>
          </div>
          <div class="co-organizer-grid">
            <article
              v-for="organization in copy.coOrganizer.organizations"
              :key="organization.name"
              class="glass-card organizer-card"
            >
              <div class="organization-image-placeholder" aria-hidden="true"></div>
              <div>
                <h3>{{ organization.name }}</h3>
                <p>{{ organization.body }}</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
  t: (key: TranslationKey) => string
}>()

const activeHref = ref('#about-foreword')
const navProgress = ref(0)
const navProgressStyle = computed(() => ({ '--event-nav-progress': String(navProgress.value) }))
const observedSectionIds = ['about-foreword', 'about-purpose', 'about-organizer', 'about-co-organizer']

const updateNavState = () => {
  const anchorLine = window.innerHeight * 0.36
  let currentId = observedSectionIds[0]
  let currentIndex = 0
  for (const [index, id] of observedSectionIds.entries()) {
    const element = document.getElementById(id)
    if (element && element.getBoundingClientRect().top <= anchorLine) {
      currentId = id
      currentIndex = index
    }
  }
  activeHref.value = `#${currentId}`
  navProgress.value = currentIndex / Math.max(observedSectionIds.length - 1, 1)
}

onMounted(() => {
  updateNavState()
  window.addEventListener('scroll', updateNavState, { passive: true })
  window.addEventListener('resize', updateNavState)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateNavState)
  window.removeEventListener('resize', updateNavState)
})

const pageCopy = {
  zh: {
    title: '关于大赛',
    lead: '了解 ASIA IP CONTEST 如何连接亚洲创作者、企业与角色 IP 市场。',
    nav: {
      label: '页面内导航',
      items: [
        { label: '致辞', href: '#about-foreword' },
        { label: '大赛目的', href: '#about-purpose' },
        { label: '主办方', href: '#about-organizer' },
        { label: '共同主办方', href: '#about-co-organizer' },
      ],
    },
    foreword: {
      title: '致辞',
      name: '关口 贡',
      role: '一般社团法人 日中动漫游戏产业联合会 理事长',
      opening: [
        '即将在 2025 年迎来第三届的“亚洲 IP 大赛”，一直以来由众多设计师和创作者共同参与推动。今年我们自 4 月起启动企划，并围绕以下重点推进准备工作。',
      ],
      focusItems: [
        { title: '运营团队年轻化：', text: '激活整体运营体制。' },
        { title: '遴选新的评审员：', text: '引入更新鲜的视角。' },
        { title: '评审结果发表运营刷新：', text: '力求打造对参赛者更有意义的发表形式。' },
        { title: '提升参赛者价值：', text: '我们最优先思考的是，如何让本大赛对参赛者真正有意义。' },
      ],
      closing: [
        '据悉，全球内容产业规模约达 200 兆日元，美国位居首位，其次是中国，日本和韩国并列其后。在这一产业中，IP（角色）是漫画、动画、游戏、主题乐园、MD（商品化）等娱乐领域得以扩展的基础。',
        '从个人创意和绘画出发，发展到周边商品，再因企业参与而成长为商业项目；随着更多人参与，角色形象不断丰富，并逐渐独立成长，这一过程尤为重要。',
        '本大赛旨在为个人提供一个发布自身创意的平台。通过线上公开走向世界，并在日本进行实体展示；这是一个由参赛者作品共同支撑的比赛。我们期待更多创作者参与。',
        '“亚洲 IP 大赛”衷心期待大家积极参加。本大赛的重要目标，不只是提交作品，也包括以客观视角评价其他作品。',
        '我们所理解的 IP（知识产权），不同于单纯的艺术作品。只有当角色被更多人喜爱、产生共鸣时，才会真正形成商业价值。',
        '基于这一理念，本大赛特别设置了“ワクワク（我的推）奖”。这是请大家投票选出最让自己心动、最能产生共鸣的角色的奖项。',
        '投票系统也是本大赛的一大特色。每位参赛者拥有两票，一票投给自己的作品，另一票投给其他作品，让所有参赛者都能关注彼此的作品，并从多元视角探索 IP 的可能性。',
      ],
    },
    purpose: {
      title: '“ASIA IP CONTEST”的目的',
      items: [
        {
          title: '创造亚洲创作者的商业机会',
          body: '提升亚洲创作者的 IP 素养，是未来授权商业发展的必要基础。我们希望通过“ASIA IP CONTEST（亚洲 IP 大赛）”，让创作者进一步提高对角色权利的意识，并连接到新的商业创造。',
        },
        {
          title: '提升亚洲创作者的社会地位',
          body: '全球角色商业规模已经发展到 129,932 美元（约 2,000 亿日元以内）。在这样的环境下，我们认为，提升创作者技能，并作为专业人士通过角色商业维持生活的职业，应当获得更高的社会评价。',
          note: '※ Licensing International “2022 Global Licensing Industry Study”',
        },
        {
          title: '为更多创作者创造实绩舞台',
          body: '近年来，数字化快速推进，内容数量变得极其庞大。即使创作者将作品发布在投稿平台，也未必能被更多人看到。因此，我们认为需要一个能增加曝光、创造实绩的场所。',
        },
        {
          title: '运用下一代技术挑战 IP 行业',
          body: '2023 年 ChatGPT、Midjourney 等工具的出现改变了世界的动向。AI 图像生成技术飞速发展，人类已经无法回避这一技术。我们将活用 AI、元宇宙等最新技术进行挑战，探索角色与授权商业的新价值。',
        },
      ],
    },
    organizer: {
      title: '主办方介绍',
      name: '一般社团法人 日中动漫游戏产业联合会',
      body: [
        '2018 年，曾在株式会社三丽鸥授权事业部贡献 30 年以上的关口贡先生就任 ACG 理事长。ACG 通过参加中国国内 IP 相关展会、在 IP 峰会等场合进行授权商业讲演等方式，致力于促进日中交流，并开拓和普及知识产权的可能性。',
        '此外，自 2020 年起，认同 ACG 理念的 IP 相关企业陆续参与，支持年轻创作者创造 IP 的举措也正式启动。第一项举措便是举办“ASIA IP CONTEST（亚洲 IP 大赛）”，并继续开拓超越日本、中国等国家边界的创作者共同体。',
      ],
    },
    coOrganizer: {
      title: '共同主办方介绍',
      organizations: [
        {
          name: '株式会社 亚洲太平洋观光社',
          body: '株式会社亚洲太平洋观光社以促进日中两国相互理解为目标，从发行日中两国旅游、文化相关出版物，到策划和运营摄影展、书画展、音乐会、文化演出等多种文化活动。',
        },
        {
          name: 'AniChina 株式会社',
          body: '专注日本市场的全球营销企业。至今参与了包括中国角色品牌在内的 1000 多项商品与服务的 PR 和营销，通过 SEO、MEO、SNS、活动等组合方式进行广泛制作与推广。近期也在神经科学领域持续投入。',
        },
        {
          name: '有限会社 Potato House Creative',
          body: '由出身株式会社三丽鸥的横山丰创立，是一家拥有约 40 年实绩、从 IP 开发到商品制作均有涉猎的制作公司。公司以全球视角开拓 IP 行业未来，目前也参与了许多面向中国市场的 IP 开发。',
        },
      ],
    },
  },
  ja: {
    title: 'について',
    lead: 'ASIA IP CONTESTが、アジアのクリエイターと企業、そしてキャラクターIP市場をつなぐ理由。',
    nav: {
      label: 'ページ内ナビゲーション',
      items: [
        { label: 'ご挨拶', href: '#about-foreword' },
        { label: '目的', href: '#about-purpose' },
        { label: '主催紹介', href: '#about-organizer' },
        { label: '共催紹介', href: '#about-co-organizer' },
      ],
    },
    foreword: {
      title: 'ご挨拶',
      name: '関口 貢',
      role: '一般社団法人 日中動漫遊戯産業連合会 理事長',
      opening: [
        '2025年に三回目の開催を迎える「亜州IPコンテスト」は、多くのデザイナーやクリエイターの参加によって運営されてきました。本年は4月より企画をスタートし、以下の点に注力して準備を進めています。',
      ],
      focusItems: [
        { title: 'スタッフの若返り：', text: '運営体制の活性化を図ります。' },
        { title: '新たな審査員の人選：', text: '新鮮な視点を取り入れます。' },
        { title: '審査結果発表運営の刷新：', text: 'より参加者にとって有意義な発表形式を目指します。' },
        { title: '参加者への価値向上：', text: 'コンテストが参加者にとってどれだけ有意義な物になるかを最優先に考えています。' },
      ],
      closing: [
        '世界のコンテンツ産業約200兆円規模と聞いています、米国がトップ、次に中国、そして日本と韓国が並ぶ状況です。この中で、IP（キャラクター）は漫画、アニメ、ゲーム、テーマパーク、MD（マーチャンダイジング）といったエンターテイメントへと広がる基礎となります。',
        '個人のアイデアや絵から始まり、グッズ展開、そして企業が関わることでビジネスへと発展し、多くの人が関わることでキャラクターのイメージが豊かになり、独り立ちして行く過程が重要視されています。',
        '本コンテストは、そうした個人が自身のアイデアを発信できる場を提供することを目指しています。オンライン公開で世界へ、日本ではリアル展示、参加者の皆さんの作品によって成り立つコンテストです。多くのクリエイターの皆さんのご参加をお待ちしております。',
        '「亜州IPコンテスト」は、皆さんの積極的な参加を心よりお待ちしています。本コンテストの大きな目的は、単に作品を応募するだけでなく、客観的な視点で他の作品を評価することです。',
        '私たちが考えるIP（知的財産）は、単なるアート作品とは一線を画します。キャラクターが多くの人々に愛され、共感を呼ぶことで、初めてビジネスとしての価値が生まれると信じているからです。',
        'この考えに基づき、コンテストでは特別に「ワクワク（私の推し）賞」を設けています。これは、皆さんが「これだ！」と心惹かれた、最も共感できるキャラクターに投票していただく賞です。',
        '投票システムも本コンテストの大きな特徴です。お一人様二票を持ち、ご自身の作品に一票、その他の作品に一票投じることで、参加者全員が互いの作品に目を向け、多様な視点からIPの可能性を探る機会を提供します。',
      ],
    },
    purpose: {
      title: '「ASIA IP CONTEST」の目的',
      items: [
        {
          title: 'アジアクリエイターのビジネス機会の創出',
          body: 'アジアのクリエイターのIPリテラシーの向上は、今後のライセンスビジネスの発展に必要不可欠なものとなっています。私たちは本イベント「ASIA IP CONTEST（アジアIPコンテスト）」を通じて、クリエイターがキャラクターへの権利意識をより高めていくことで、ビジネス創出へ繋げていきます。',
        },
        {
          title: 'アジアクリエイターの社会的地位の向上',
          body: '世界におけるキャラクタービジネス規模は12万9932ドル（約2000億円弱）※にまで発展しました。そんな中、クリエイターとしてのスキルを高め、プロとしてキャラクタービジネスで生活できる職業は、社会的にもっと評価されるべきだと私たちは考えています。',
          note: '※Licensing International "2022 Global Licensing Industry Study"',
        },
        {
          title: 'より多くのクリエイターの実績の場づくり',
          body: '昨今、デジタル化が急速に進んだことでコンテンツの数はとても膨大になりました。クリエイターが投稿サイトに公開しても多くの方に見られるわけではない現状で、私たちは少しでも露出を増やし、実績を創る場が必要であると考えています。',
        },
        {
          title: '次世代テクノロジーの活用によるIP業界への挑戦',
          body: '2023年のChatGPTやMidjourneyなどの登場によって世界の動きが一変しました。AIの画像生成は凄まじい発展を見せ、人類はAI画像生成技術を決して避けては通れなくなりました。私たちはAIやメタバースなどの最新技術を活用し挑戦することによって、キャラクター、ライセンスビジネスの新たな価値を探求していきます。',
        },
      ],
    },
    organizer: {
      title: '主催紹介',
      name: '一般社団法人 日中動漫遊戯産業連合会',
      body: [
        '2018年、ACGの理事長に株式会社サンリオのライセンス事業部で30年以上貢献した実績のある関口貢氏が就任。中国国内のIP関連展示会への出展や、IPサミット等でライセンスビジネスに関する講演を行うなど、日中の交流と共に知的財産の可能性開拓と普及に尽力しています。',
        'また、2020年よりACGの理念に共感したIP関連の企業が参画したことで、IPを生み出す若手クリエイターを支援する施策も始動。その第一弾がこの「ASIA IP CONTEST（アジアIPコンテスト）」の開催であり、日本や中国など国の枠を超えたクリエイターの共同体を開拓していきます。',
      ],
    },
    coOrganizer: {
      title: '共催紹介',
      organizations: [
        {
          name: '株式会社アジア太平洋観光社',
          body: '株式会社アジア太平洋観光社は、日中両国の相互理解の促進を目指して、日中両国の観光、文化に関する出版物の発行から写真展、書画展、コンサート、文化公演に至る様々な文化活動の企画と運営を行っています。',
        },
        {
          name: 'アニチャイナ株式会社',
          body: '日本市場特化型のグローバルマーケティング企業。これまで中国キャラクターブランド含む1000以上の商品・サービスのPR・マーケティングに関わる。SEO、MEO、SNS、イベント等を組み合わせて幅広いプロデュースを行っている。最近は神経科学分野にも力を入れている。',
        },
        {
          name: '有限会社ポテトハウスクリエイティブ',
          body: '有限会社ポテトハウスクリエイティブは、株式会社サンリオ出身の横山豊が立ち上げた、IP開発から商品プロデュースまで手がける約40年の実績を持つ制作会社です。グローバルな視点でIP業界の未来を開拓しており、現在は中国市場に向けた多くのIP開発にも携わっています。',
        },
      ],
    },
  },
  en: {
    title: 'About Us',
    lead: 'Learn how ASIA IP CONTEST connects Asian creators, companies, and the character IP market.',
    nav: {
      label: 'On this page',
      items: [
        { label: 'Foreword', href: '#about-foreword' },
        { label: 'Purpose', href: '#about-purpose' },
        { label: 'Organizer', href: '#about-organizer' },
        { label: 'Co-organizers', href: '#about-co-organizer' },
      ],
    },
    foreword: {
      title: 'Foreword',
      name: 'Mitsugu Sekiguchi',
      role: 'Chairperson, Japan-China Animation, Comic and Game Industry Association',
      opening: [
        'The Asia IP Contest, which will be held for the third time in 2025, has been built through the participation of many designers and creators. This year, planning began in April, and we are preparing with particular focus on the following points.',
      ],
      focusItems: [
        { title: 'Younger staff structure:', text: 'We aim to energize the operating organization.' },
        { title: 'Selection of new judges:', text: 'We will bring in fresh perspectives.' },
        { title: 'Renewed results announcement operations:', text: 'We aim to create a more meaningful presentation format for participants.' },
        { title: 'Greater value for participants:', text: 'Our highest priority is making the contest truly meaningful for everyone who joins.' },
      ],
      closing: [
        'The global content industry is said to be worth approximately 200 trillion yen, led by the United States, followed by China, with Japan and Korea close behind. Within this landscape, IP, especially characters, forms the foundation for entertainment businesses such as manga, animation, games, theme parks, and merchandising.',
        'A character may begin with an individual idea or drawing, expand into goods, and then develop into business when companies become involved. As more people contribute, the character image becomes richer and eventually stands on its own. We believe this process is deeply important.',
        'This contest aims to provide a place where individuals can present their ideas. It is a contest built by the works of its participants, with online exposure to the world and physical exhibitions in Japan. We look forward to welcoming many creators.',
        'The Asia IP Contest sincerely welcomes your active participation. A major purpose of this contest is not only to submit your own work, but also to evaluate other works from an objective perspective.',
        'The IP, or intellectual property, that we envision is distinct from a simple artwork. We believe business value is created only when a character is loved by many people and inspires empathy.',
        'Based on this idea, the contest has created a special Wakuwaku, or My Favorite, Award. This award invites participants to vote for the character that most moves them and earns their strongest empathy.',
        'The voting system is also a major feature of this contest. Each participant has two votes: one for their own work and one for another work. This encourages all participants to look closely at one another’s creations and explore the potential of IP from diverse perspectives.',
      ],
    },
    purpose: {
      title: 'Purpose of ASIA IP CONTEST',
      items: [
        {
          title: 'Creating business opportunities for Asian creators',
          body: 'Improving IP literacy among Asian creators is essential for the future development of the licensing business. Through ASIA IP CONTEST, we aim to help creators build stronger awareness of character rights and connect that awareness to new business creation.',
        },
        {
          title: 'Improving the social status of Asian creators',
          body: 'The global character business has grown to a scale of 129,932 dollars, or just under 200 billion yen. In this environment, we believe that the profession of improving one’s creative skills and making a living in the character business as a professional deserves greater social recognition.',
          note: 'Source: Licensing International, “2022 Global Licensing Industry Study”',
        },
        {
          title: 'Creating achievement opportunities for more creators',
          body: 'As digitalization has accelerated, the amount of content has become enormous. Even when creators publish their work on submission platforms, it is not always seen by many people. We believe creators need more places to gain exposure and build a track record.',
        },
        {
          title: 'Challenging the IP industry through next-generation technology',
          body: 'The arrival of ChatGPT, Midjourney, and similar technologies in 2023 changed the world’s direction. AI image generation has advanced dramatically, and humanity can no longer avoid this technology. By actively using the latest technologies such as AI and the metaverse, we will explore new value in characters and licensing business.',
        },
      ],
    },
    organizer: {
      title: 'Organizer',
      name: 'Japan-China Animation, Comic and Game Industry Association',
      body: [
        'In 2018, Mitsugu Sekiguchi, who contributed for more than 30 years in Sanrio’s licensing business division, became chairperson of ACG. Through exhibitions at IP-related events in China and lectures on licensing business at IP summits, ACG works to promote exchange between Japan and China while exploring and expanding the potential of intellectual property.',
        'Since 2020, IP-related companies that share ACG’s philosophy have joined the initiative, launching programs to support young creators who generate IP. The first of these initiatives is ASIA IP CONTEST, which aims to develop a creator community that crosses national borders, including Japan and China.',
      ],
    },
    coOrganizer: {
      title: 'Co-organizers',
      organizations: [
        {
          name: 'Asia Pacific Tourism Co., Ltd.',
          body: 'Asia Pacific Tourism Co., Ltd. plans and operates a wide range of cultural activities to promote mutual understanding between Japan and China, from publishing tourism and culture-related materials to photography exhibitions, calligraphy and painting exhibitions, concerts, and cultural performances.',
        },
        {
          name: 'AniChina Inc.',
          body: 'A global marketing company specializing in the Japanese market. AniChina has been involved in PR and marketing for more than 1,000 products and services, including Chinese character brands, and produces broad campaigns combining SEO, MEO, social media, events, and more. Recently, the company has also been focusing on neuroscience.',
        },
        {
          name: 'Potato House Creative Ltd.',
          body: 'Founded by Yutaka Yokoyama, formerly of Sanrio, Potato House Creative is a production company with around 40 years of experience spanning IP development and product production. With a global perspective, it explores the future of the IP industry and is currently involved in many IP development projects for the Chinese market.',
        },
      ],
    },
  },
} satisfies Record<LanguageCode, {
  title: string
  lead: string
  nav: {
    label: string
    items: Array<{ label: string; href: string }>
  }
  foreword: {
    title: string
    name: string
    role: string
    opening: string[]
    focusItems: Array<{ title: string; text: string }>
    closing: string[]
  }
  purpose: {
    title: string
    items: Array<{ title: string; body: string; note?: string }>
  }
  organizer: {
    title: string
    name: string
    body: string[]
  }
  coOrganizer: {
    title: string
    organizations: Array<{ name: string; body: string }>
  }
}>

const copy = computed(() => pageCopy[props.currentLanguage])
</script>
