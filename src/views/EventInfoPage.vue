<template>
  <main>
    <div class="event-page-layout event-info-page-layout container">
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
        <section id="event-overview" class="event-info-section section-padding container">
          <div class="event-info-grid">
            <article class="glass-card event-overview-card">
              <div class="event-info-label">{{ copy.overview.eyebrow }}</div>
              <h2>{{ copy.overview.name }}</h2>
              <dl class="event-info-list">
                <div
                  v-for="item in copy.overview.items"
                  :key="item.label"
                >
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl>
            </article>

            <article class="glass-card event-overview-card">
              <div class="event-info-label">{{ copy.categories.eyebrow }}</div>
              <h2>{{ copy.categories.title }}</h2>
              <div class="event-category-list">
                <div
                  v-for="category in copy.categories.items"
                  :key="category.title"
                >
                  <h3>{{ category.title }}</h3>
                  <p>{{ category.body }}</p>
                </div>
              </div>
            </article>
          </div>
        </section>

    <section id="event-schedule" class="event-info-section section-padding container">
      <div class="sec-title">
        <span>Schedule</span>
        <h2>{{ copy.schedule.title }}</h2>
      </div>
      <div class="event-schedule-timeline">
        <article
          v-for="(item, index) in copy.schedule.items"
          :key="item.title"
          class="event-schedule-item"
        >
          <div class="event-schedule-marker">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="glass-card event-schedule-card">
            <span>{{ item.period }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </div>
        </article>
      </div>
    </section>

    <BenefitsSection :current-language="currentLanguage" />

    <section id="event-merit-details" class="event-info-section section-padding container">
      <div class="sec-title">
        <span>Merit Details</span>
        <h2>{{ copy.meritDetails.title }}</h2>
      </div>
      <div class="event-detail-grid">
        <article
          v-for="item in copy.meritDetails.items"
          :key="item.title"
          class="glass-card event-detail-card"
        >
          <div class="event-detail-media" aria-hidden="true"></div>
          <div>
            <div class="event-info-label">{{ item.eyebrow }}</div>
            <h3>{{ item.title }}</h3>
            <p
              v-for="body in item.body"
              :key="body"
            >
              {{ body }}
            </p>
          </div>
        </article>
      </div>
    </section>

    <section id="event-judges" class="event-info-section section-padding container">
      <div class="sec-title">
        <span>Judge Board</span>
        <h2>{{ judgeCopy.title }}</h2>
      </div>
      <nav class="event-judge-index" :aria-label="judgeCopy.indexLabel">
        <a
          v-for="(judge, index) in judgeCopy.items"
          :key="judge.name"
          class="event-judge-index-link"
          :href="`#event-judge-${index + 1}`"
        >
          {{ judge.name }}
        </a>
      </nav>
      <div class="event-judge-detail-list">
        <article
          v-for="(judge, index) in judgeCopy.items"
          :key="judge.name"
          :id="`event-judge-${index + 1}`"
          class="glass-card event-judge-detail-card"
        >
          <div class="event-judge-profile-side">
            <div class="event-judge-detail-avatar" aria-hidden="true">{{ judge.name.slice(0, 1) }}</div>
            <h3>{{ judge.name }}</h3>
            <p v-if="judge.reading" class="event-judge-reading">{{ judge.reading }}</p>
          </div>
          <div class="event-judge-detail-content">
            <p class="event-judge-role">{{ judge.role }}</p>
            <p
              v-for="body in judge.body"
              :key="body"
            >
              {{ body }}
            </p>
          </div>
        </article>
      </div>
    </section>

    <section id="event-participation" class="event-info-section section-padding container">
      <div class="sec-title">
        <span>Participation</span>
        <h2>{{ copy.participation.title }}</h2>
      </div>
      <div class="event-info-grid">
        <article
          v-for="item in copy.participation.items"
          :key="item.title"
          class="glass-card event-overview-card"
        >
          <div class="event-info-label">{{ item.eyebrow }}</div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>
      </div>
      <MobileSectionNav
        :active-href="activeHref"
        :items="copy.nav.items"
        :label="copy.nav.label"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BenefitsSection from '../components/BenefitsSection.vue'
import MobileSectionNav from '../components/MobileSectionNav.vue'
import type { LanguageCode } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
}>()

const activeHref = ref('#event-overview')
const navProgress = ref(0)
const navProgressStyle = computed(() => ({ '--event-nav-progress': String(navProgress.value) }))
const observedSectionIds = [
  'event-overview',
  'event-schedule',
  'benefits',
  'event-merit-details',
  'event-judges',
  'event-participation',
]

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
    title: '举办信息',
    lead: '确认 ASIA IP CONTEST in Tokyo 2026 的赛事概要、募集部门、日程与参赛相关信息。',
    nav: {
      label: '页面内导航',
      items: [
        { label: '赛事概要', href: '#event-overview' },
        { label: '赛事日程', href: '#event-schedule' },
        { label: '参赛优势', href: '#benefits' },
        { label: '参赛特典与展示', href: '#event-merit-details' },
        { label: '审查员', href: '#event-judges' },
        { label: '参赛与合作', href: '#event-participation' },
      ],
    },
    overview: {
      eyebrow: 'Contest',
      name: 'ASIA IP CONTEST in Tokyo 2026',
      items: [
        { label: '赛事名', value: 'ASIA IP CONTEST in Tokyo 2026（亚洲 IP 大赛 in Tokyo 2026）' },
        { label: '主题', value: '待公布' },
        { label: '参加费', value: '个人部门：JPY 10,000 / 法人部门：JPY 100,000' },
      ],
    },
    categories: {
      eyebrow: 'Categories',
      title: '募集部门',
      items: [
        {
          title: '个人部门（2D、3D、AI）',
          body: '以原创角色为对象进行募集。企业创作者也可以个人名义参加。',
        },
        {
          title: '企业角色部门',
          body: '可使用自社原创角色参赛，新角色和既有角色均可报名，也是展示企业角色资产的机会。',
        },
      ],
    },
    schedule: {
      title: '赛事日程',
      items: [
        { period: 'Entry', title: '全球作品征集期', body: '募集期间：2026年7月1日 - 2026年10月7日。' },
        { period: 'Online', title: '线上展示', body: '2026年10月起，投稿作品将在官方网站线上会场依次公开。' },
        { period: 'Review', title: '专业评委复审', body: '2026年10月 - 2026年11月，专业评委将对作品进行综合评审。' },
        { period: 'Exhibition', title: '线下会场展示', body: '2026年11月，优秀作品将在东京六本木会场进行特别展示。' },
        { period: 'Award', title: '颁奖典礼与公布', body: '2026年11月，公布结果并举办相关活动。' },
      ],
    },
    participation: {
      title: '参赛与合作',
      items: [
        {
          eyebrow: 'Partner Creator',
          title: '招募合作创作者',
          body: '正在招募 ASIA IP CONTEST 官方认可的参加创作者。',
        },
        {
          eyebrow: 'Sponsor',
          title: '招募赞助商',
          body: '赞助相关咨询请联系：info@ipcon-acg.com',
        },
      ],
    },
    meritDetails: {
      title: '参赛特典与展示',
      items: [
        {
          eyebrow: 'Certificate',
          title: '参加证明书',
          body: [
            '所有参赛者都将获得记载赞助商与评审员姓名的数字参加证明书。',
            '获奖者将获得记载主办、共办与评审员姓名的数字奖状。',
          ],
        },
        {
          eyebrow: 'Online Venue',
          title: '线上会场展示',
          body: [
            '线上展示将展示全部投稿作品。',
            '除作品外，也会刊登创作者的 SNS 账号和主页 URL，帮助观众与创作者建立联系。',
            '往届线上会场：2023 年线上会场 / 2024 年线上会场。',
          ],
        },
        {
          eyebrow: 'OMAKE Award',
          title: '商品化机会',
          body: [
            '入选 OMAKE 奖的作品，有机会签订扭蛋商品化合约。',
            '该企划由株式会社斎藤企画提供。斎藤企画从事扭蛋和周边商品的企划、销售，以及玩具自动贩卖机的运营与管理。',
            '如企业对其他投稿作品产生咨询，将进行个别对应。',
          ],
        },
        {
          eyebrow: 'Roppongi',
          title: '线下展示与奖状语言',
          body: [
            '优秀作品将在东京六本木的实体会场进行特别展示。',
            '会场地址：〒107-0052 东京都港区赤坂6-19-46 TBKビル。',
            '获奖数字奖状语言可从日语、简体中文、繁体中文中选择。',
          ],
        },
      ],
    },
  },
  ja: {
    title: '開催情報',
    lead: 'ASIA IP CONTEST in Tokyo 2026のイベント概要、募集部門、スケジュール、参加に関する情報をまとめています。',
    nav: {
      label: 'ページ内ナビゲーション',
      items: [
        { label: '開催概要', href: '#event-overview' },
        { label: 'スケジュール', href: '#event-schedule' },
        { label: '参加メリット', href: '#benefits' },
        { label: '応募特典・展示', href: '#event-merit-details' },
        { label: '審査員', href: '#event-judges' },
        { label: '参加・協賛', href: '#event-participation' },
      ],
    },
    overview: {
      eyebrow: 'Contest',
      name: 'ASIA IP CONTEST in Tokyo 2026',
      items: [
        { label: 'イベント名', value: 'ASIA IP CONTEST in Tokyo 2026（アジアIPコンテスト in Tokyo 2026）' },
        { label: 'テーマ', value: '決定次第公開' },
        { label: '参加費', value: '個人部門：JPY 10,000 / 法人部門：JPY 100,000' },
      ],
    },
    categories: {
      eyebrow: 'Categories',
      title: '募集部門',
      items: [
        {
          title: '個人部門（2D、3D、AI）',
          body: 'オリジナルキャラクターを対象に募集します。企業クリエイターの場合でも個人名義で参加できます。',
        },
        {
          title: '企業キャラクター部門',
          body: '自社オリジナルキャラクターで応募できます。新規、既存問わず応募可能で、自社キャラクターをアピールする場になります。',
        },
      ],
    },
    schedule: {
      title: 'スケジュール',
      items: [
        { period: 'Entry', title: 'グローバル作品募集期間', body: '募集期間：2026年7月1日 - 2026年10月7日。' },
        { period: 'Online', title: 'オンライン展示', body: '2026年10月より、応募作品は公式ページのオンライン会場で順次公開予定です。' },
        { period: 'Review', title: '専門審査員による審査', body: '2026年10月〜2026年11月に、専門審査員が作品を総合的に審査します。' },
        { period: 'Exhibition', title: 'リアル会場展示', body: '2026年11月、上位作品は東京・六本木の会場で特別展示予定です。' },
        { period: 'Award', title: '授賞式・結果発表', body: '2026年11月、結果発表と関連イベントを予定しています。' },
      ],
    },
    participation: {
      title: '参加・協賛について',
      items: [
        {
          eyebrow: 'Partner Creator',
          title: 'パートナークリエイター募集中',
          body: 'ASIA IP CONTEST公認の参加クリエイターを募集しています。',
        },
        {
          eyebrow: 'Sponsor',
          title: 'スポンサー募集中',
          body: 'スポンサーに関するお問い合わせ：info@ipcon-acg.com',
        },
      ],
    },
    meritDetails: {
      title: '応募特典・展示について',
      items: [
        {
          eyebrow: 'Certificate',
          title: '参加証明書の交付',
          body: [
            '参加者全員に、スポンサーと審査員の名前が記入されたデジタル参加証明書をお送りいたします。',
            '入賞者には、主催、共催、審査員の名前が記入されたデジタル賞状をお送りいたします。',
          ],
        },
        {
          eyebrow: 'Online Venue',
          title: 'オンライン会場に出品作品を展示',
          body: [
            'オンライン展示では、ご応募いただいた作品を全て展示いたします。',
            '作品だけでなく、各クリエイター達と繋がれるように、SNSのアカウントやホームページのURLも掲載します。',
            '過去オンライン会場：2023年オンライン会場 / 2024年オンライン会場。',
          ],
        },
        {
          eyebrow: 'OMAKE Award',
          title: '商品化できるチャンス',
          body: [
            'OMAKE賞に選ばれた作品は、カプセルトイの商品化契約ができます。',
            '本企画は株式会社斎藤企画による提供です。斎藤企画はカプセルトイ及び物販商品を企画、販売し、玩具自販機の運営・管理も行っています。',
            'その他応募作品に対し、企業から問い合わせが来た場合は個別に対応いたします。',
          ],
        },
        {
          eyebrow: 'Roppongi',
          title: 'リアル会場展示と賞状言語',
          body: [
            '上位作品は、美術の街東京六本木の会場で特別展示されます。',
            '会場住所：〒107-0052 東京都港区赤坂6-19-46 TBKビル。',
            '賞状の言語は、日本語 / 中国語 簡体字 / 繁体字からお選びいただけます。',
          ],
        },
      ],
    },
  },
  en: {
    title: 'Event Info',
    lead: 'Find event details, categories, schedule, and participation information for ASIA IP CONTEST in Tokyo 2026.',
    nav: {
      label: 'On this page',
      items: [
        { label: 'Overview', href: '#event-overview' },
        { label: 'Schedule', href: '#event-schedule' },
        { label: 'Benefits', href: '#benefits' },
        { label: 'Merit Details', href: '#event-merit-details' },
        { label: 'Judge Board', href: '#event-judges' },
        { label: 'Participation', href: '#event-participation' },
      ],
    },
    overview: {
      eyebrow: 'Contest',
      name: 'ASIA IP CONTEST in Tokyo 2026',
      items: [
        { label: 'Event name', value: 'ASIA IP CONTEST in Tokyo 2026' },
        { label: 'Theme', value: 'To be announced' },
        { label: 'Entry fee', value: 'Individual categories: JPY 10,000 / Corporate category: JPY 100,000' },
      ],
    },
    categories: {
      eyebrow: 'Categories',
      title: 'Categories',
      items: [
        {
          title: 'Individual categories (2D, 3D, AI)',
          body: 'Original character works are accepted. Corporate creators may also participate under an individual name.',
        },
        {
          title: 'Corporate character category',
          body: 'Companies may submit original corporate characters, whether new or existing, as an opportunity to present their character assets.',
        },
      ],
    },
    schedule: {
      title: 'Schedule',
      items: [
        { period: 'Entry', title: 'Global submission period', body: 'Submission period: July 1, 2026 - October 7, 2026.' },
        { period: 'Online', title: 'Online exhibition', body: 'From October 2026, submitted works will be published progressively in the online venue on the official website.' },
        { period: 'Review', title: 'Professional jury review', body: 'From October to November 2026, professional judges will conduct a comprehensive review of submitted works.' },
        { period: 'Exhibition', title: 'Physical venue exhibition', body: 'In November 2026, top works are planned for special exhibition at a venue in Roppongi, Tokyo.' },
        { period: 'Award', title: 'Award ceremony and results', body: 'In November 2026, results announcements and related events are planned.' },
      ],
    },
    participation: {
      title: 'Participation and Sponsorship',
      items: [
        {
          eyebrow: 'Partner Creator',
          title: 'Partner creators wanted',
          body: 'We are recruiting official participating creators for ASIA IP CONTEST.',
        },
        {
          eyebrow: 'Sponsor',
          title: 'Sponsors wanted',
          body: 'For sponsorship inquiries, contact: info@ipcon-acg.com',
        },
      ],
    },
    meritDetails: {
      title: 'Applicant Benefits and Exhibition',
      items: [
        {
          eyebrow: 'Certificate',
          title: 'Participation certificate',
          body: [
            'Every participant will receive a digital participation certificate listing the sponsors and judges.',
            'Award winners will receive a digital award certificate listing the organizers, co-organizers, and judges.',
          ],
        },
        {
          eyebrow: 'Online Venue',
          title: 'All submissions shown online',
          body: [
            'The online exhibition will present every submitted work.',
            'SNS accounts and website URLs will also be listed so visitors can connect with each creator.',
            'Past online venues: 2023 Online Venue / 2024 Online Venue.',
          ],
        },
        {
          eyebrow: 'OMAKE Award',
          title: 'Merchandising opportunity',
          body: [
            'Works selected for the OMAKE Award may proceed to a capsule toy merchandising contract.',
            'This program is presented by Saito Kikaku Co., Ltd., a company engaged in capsule toy and merchandise planning, sales, and toy vending machine operation and management.',
            'If companies inquire about other submitted works, the organizers will respond individually.',
          ],
        },
        {
          eyebrow: 'Roppongi',
          title: 'Physical exhibition and certificate language',
          body: [
            'Top works will be specially exhibited at a venue in Roppongi, Tokyo, a district known for art.',
            'Venue address: TBK Building, 6-19-46 Akasaka, Minato-ku, Tokyo 107-0052.',
            'Digital award certificates can be issued in Japanese, Simplified Chinese, or Traditional Chinese.',
          ],
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
  overview: {
    eyebrow: string
    name: string
    items: Array<{ label: string; value: string }>
  }
  categories: {
    eyebrow: string
    title: string
    items: Array<{ title: string; body: string }>
  }
  schedule: {
    title: string
    items: Array<{ period: string; title: string; body: string }>
  }
  participation: {
    title: string
    items: Array<{ eyebrow: string; title: string; body: string }>
  }
  meritDetails: {
    title: string
    items: Array<{ eyebrow: string; title: string; body: string[] }>
  }
}>

const detailedJudgesByLanguage: Record<LanguageCode, {
  title: string
  indexLabel: string
  items: Array<{
    name: string
    reading?: string
    role: string
    body: string[]
  }>
}> = {
  zh: {
    title: '审查员',
    indexLabel: '审查员索引',
    items: [
      {
        name: '关口 贡',
        role: '“ASIA IP CONTEST”执行委员会会长 / 一般社团法人 日中动漫游戏产业联合会 理事长',
        body: [
          '曾任三丽鸥设计师，在三丽鸥授权事业部担任总监，负责授权设计相关管理超过 30 年。',
          '2018 年就任日中动漫游戏产业联合会理事长，并在中华圈开展研讨会、设计顾问等活动。',
        ],
      },
      {
        name: '远藤 贵司',
        role: 'Anichina 株式会社 代表董事社长兼 CEO / 一般社团法人 日中动漫游戏产业联合会 理事',
        body: [
          '学生时代即在秋叶原开始动画周边商品相关业务，后经历专职投资人阶段。',
          '现经营专注日本市场的调研与营销企业 Anichina，参与众多中国品牌在日本市场的本地化与品牌传播。',
        ],
      },
      {
        name: '金城',
        role: '广东省动漫艺术家协会会长',
        body: [
          '中国美术家协会理事、中国教育部高等教育机构动画教育指导委员会副主任，曾创设《漫友》杂志、中国动漫金龙奖、CIAC 全国插画扶持计划。',
          '担任手冢治虫作品《铁臂阿童木》《我的孙悟空》中文版出版制作人，并于 2019 年策展“从水墨诞生的中国动画日本展”。',
          '2025 年获日本外务省在外公馆长表彰。',
        ],
      },
      {
        name: '顾子易（建国）',
        role: '动画作家、导演',
        body: [
          'ASIA IP CONTEST 审查员、金海豚国际动画节审查员、昆明传媒学院客座教授。',
          '1956 年生于上海，参与《哪吒闹海》《黑猫警长》《九色鹿》等经典作品，之后担任《神探カチュート》《西游记・平顶山》等中外合作作品导演。',
          '来日后参与《哆啦A梦》《樱桃小丸子》制作，持续活跃于动画、美术设计、水墨画、教育与国际交流领域。',
        ],
      },
      {
        name: 'Taebong Cho',
        role: '韩国文化内容授权协会会长',
        body: [
          '2012 年至今担任韩国文化内容授权协会会长，2001 年至今担任 COCON Group Company 代表董事社长。',
          '曾任金・张法律事务所经理，并参与全球未来研究协会、韩国中小企业联合会内容产业委员会、光州 ACE Fair 执行委员会等组织。',
          '同时是 LIMA（国际授权产业商品化协会）与 LESI（国际许可经营者协会）会员。',
        ],
      },
      {
        name: '林 秀则',
        role: '林数字工务店 CG 导演 / CEO',
        body: [
          '1990 年进入白组，之后任职旭 Production，2001 年转为自由职业，2004 年成立有限会社林数字工务店。',
          '以 3DS-MAX 为主要工具，制作特摄、动画、企业 PV、大型展示影像等，也作为和太鼓演奏者参与结合投影映射的舞台演出。',
          '代表实绩包括《奥特曼》系列、《假面骑士》系列、《机动战士高达UC》《剧场版 刀剑神域》《进击的巨人》真人电影版、《剧场版 歌之王子殿下♪》等。',
        ],
      },
      {
        name: '佐藤 进哉',
        role: '有限会社 Pickup 代表董事社长',
        body: [
          '26 年前开始关注动画、游戏的力量，21 年前创立 Pickup，提供动画、声优、游戏的一站式制作。',
          '擅长动画制作、游戏声优选角、声优音乐和声优现场活动制作，曾率先成功推动 Microsoft 企业角色拟人化宣传。',
          '代表实绩包括动画《全力兔子》制作、选角与音响制作，《苍天之拳 REGENESIS》音响制作，游戏《六本木サディスティックナイト》《アトリエオンライン》等选角与音响制作。',
        ],
      },
      {
        name: '孙弋涵',
        reading: 'ソン・イハン',
        role: 'MING STUDIO CEO / 前 NetEase 开发者',
        body: [
          '2021 年创立 MING STUDIO 并担任 CEO，公司核心成员来自 NetEase、字节跳动、Lilith Games。',
          '专注 VR 游戏开发，开发中的《MechaForce》Demo 获海外用户 98% 好评。',
          '曾开发多个世界级 IP 手机游戏，对游戏 IP 化有深入理解，日本《Fami通》新闻稿平均获得超过 50 万 PV。',
        ],
      },
      {
        name: 'Frank Yokoyama',
        role: '创意总监',
        body: [
          '兼具创意总监、艺术总监、平面设计师、艺术家、讲师与审查员等多重身份。',
          '曾制作大型海外音乐人活动，举办个展“in the Garage / Some Girls Do”，并参与世界级偶像活动制作。',
          '以“从伴手礼到品牌”“从现场销售到活动”为信条，持续向社会推出多样化项目。',
        ],
      },
      {
        name: '谭正',
        reading: 'タン・セイ',
        role: '角色创作者',
        body: [
          '2004 年毕业于中央美术学院动画系第一届，毕业后创立“动客”。',
          '长期从事动画新闻、策展、品牌 IP 设计、漫画编辑与评论，目前在四川成都活动。',
        ],
      },
      {
        name: '胡蓉',
        reading: 'フー・ロン',
        role: '漫画家 / NoWall 株式会社 代表董事社长',
        body: [
          '中国早期漫画家之一，江苏如皋出身，15 岁获得江苏省“十大杰出青年”奖并出道。',
          '1996 年作品《倩女幽魂》获东亚漫画峰会“审查员特别奖”，也是中国漫画家获得国际奖项的先驱之一。',
          '曾任北京电影学院特别讲师、中国人民邮电出版社漫画杂志《尚漫》特别编辑长，目前在日本推动日中文化交流与无国界漫画文化。',
        ],
      },
      {
        name: '山吉 敏郎',
        role: '角色艺术总监',
        body: [
          '曾获日本经济新闻广告奖，并三年连续、共四次获得 GOOD DESIGN 奖。',
          '进入东京赤坂 POTATO HOUSE 后，以角色设计师与艺术总监身份活跃，曾参与社区商店角色标志开发及多家企业角色制作。',
          '客户实绩包括 Nintendo、Coca-Cola、东京迪士尼度假区、USJ JAPAN、docomo、softbank、au、楽天、集英社、KIRIN、SEIKO、タカラトミー等。',
        ],
      },
      {
        name: 'MOMO',
        role: '角色设计师 / 剧本作家',
        body: [
          'Fate/Grand Order 官方插画大赛最高奖获得者。',
          '负责豪华声优阵容媒体混合项目的综合导演工作。',
          '为日本大型谜题出版社制作带角色剧情的谜题书系列，并参与店铺型解谜内容、故事创作及大型酒店连锁官方角色制作。',
        ],
      },
      {
        name: '夏瑛',
        reading: 'カ・エイ',
        role: '浙江大学影视动漫游戏研究中心副主任',
        body: [
          '早稻田大学国际经营学硕士，自 1999 年起从事内容产业研究与实践，并在浙江大学取得中国首个日本动漫产业研究方向博士学位。',
          '2006 年起任浙江大学影视动漫游戏研究中心副主任，长期致力于日中交流。',
          '曾任 ASIAGRAPH CG Art Gallery 国际审查员、数字好莱坞大学大学院特任教授、公益财团法人日中友好会馆留学生事业部部长。',
        ],
      },
      {
        name: 'Arisbek Nuhan',
        reading: 'アリスベク・ヌハン',
        role: '动画导演、编剧 / ASIA IP CONTEST in Tokyo 2024 获奖者',
        body: [
          '哈萨克族，1987 年出生于中国新疆阿勒泰市。2015 年毕业于北京电影学院动画学院硕士课程，获艺术学硕士学位。',
          '代表作包括动画短片《我从草原来》和 IP 角色《ユキモン・アラ（雪怪阿乐）》。',
          '《我从草原来》获第 15 届北京电影学院动画学院奖最佳导演奖，并入围第 43 届美国学生奥斯卡外国动画短片部门；《雪怪阿乐》获 2021 年中国文化艺术政府奖第四届动漫奖最佳动漫角色奖，并获 2024 年 ASIA IP CONTEST 法人角色部门优胜及 OMAKE 奖。',
        ],
      },
    ],
  },
  ja: {
    title: '審査員',
    indexLabel: '審査員インデックス',
    items: [
      {
        name: '関口 貢',
        role: '「ASIA IP CONTEST」実行委員会会長 / 一般社団法人 日中動漫遊戯産業連合会 理事長',
        body: [
          '元サンリオデザイナー。サンリオライセンス事業部でディレクターとしてライセンスデザインに関する一連の管理を30年以上担う。',
          '2018年に日中動漫遊戯産業連合会の理事長に就任し、中華圏でのセミナーやデザインコンサルタントとして活動している。',
        ],
      },
      {
        name: '遠藤 貴司',
        role: 'アニチャイナ株式会社 代表取締役社長兼CEO / 一般社団法人日中動漫遊戯産業連合会 理事',
        body: [
          '学生時代に秋葉原でアニメグッズの商売を始める。専業投資家を経て、現在は日本市場特化型のリサーチ・マーケティング企業アニチャイナ株式会社を経営。',
          '中国ブランドの取り扱い実績多数。日本市場のローカライズブランディングも行う。',
        ],
      },
      {
        name: '金城',
        reading: 'キン・ジョウ',
        role: '広東省アニメ芸術家協会会長',
        body: [
          '中国美術家協会理事、中国教育部高等教育機関アニメーション教育指導委員会副主任。『漫友』雑誌、中国アニメーション金竜賞、CIAC全国イラスト支援プログラムを創設。',
          '中共中央宣伝部「五個一工程賞」最終審査委員、2019年および2024年中国美術賞最終審査委員を務める。',
          '手塚治虫の作品『鉄腕アトム』『ぼくの孫悟空』の中国語版出版プロデューサー。2019年には「水墨から生まれた——中国アニメ日本展」のキュレーターを担当。2025年、日本外務省より在外公館長表彰を受賞。',
        ],
      },
      {
        name: '顧子易（建国）',
        role: 'アニメーション作家・監督',
        body: [
          'ASIA IP CONTEST審査員、金イルカ国際アニメーションフェスティバル審査員、昆明メディア学院客員教授。',
          '1956年上海生まれ。『哪吒鬧海』『黒猫警長』『九色鹿』などの名作に参加後、『神探カチュート』『西遊記・平頂山』など中外合作作品の監督を担当。',
          '来日後は『ドラえもん』『ちびまる子ちゃん』の制作にも携わる。アニメ、美術デザイン、水墨画など幅広く活動し、教育・国際交流にも積極的に取り組んでいる。',
        ],
      },
      {
        name: 'Taebong Cho',
        role: '韓国文化コンテンツライセンス協会 会長',
        body: [
          '会長 - 韓国文化コンテンツライセンス協会（2012年〜現在）。代表取締役社長 - ココン・グループ・カンパニー（2001年〜現在）。',
          '金・張法律事務所マネージャーを経て、グローバル未来研究協会委員長、韓国中小企業連合会コンテンツ産業委員会委員、光州エースフェア実行委員会委員などを歴任。',
          'LIMA（国際ライセンシング産業マーチャンダイザー協会）、LESI（国際ライセンス経営者協会）会員。',
        ],
      },
      {
        name: '林 秀則',
        role: '林デジタル工務店 CGディレクター / CEO',
        body: [
          '1990年株式会社白組入社、1998年株式会社旭プロダクション入社、2001年フリーランス転向、2004年有限会社林デジタル工務店設立。',
          '3DS-MAXをメインツールとしたCGスタジオを設立し、特撮やアニメ、企業PV、大型展示映像などを手がけている。和太鼓奏者としてプロジェクションマッピング等を絡めた舞台演出にも関わる。',
          '主な実績にウルトラマンシリーズ、仮面ライダーシリーズ、劇場版ソードアート・オンライン、機動戦士ガンダムUC、劇場版 進撃の巨人（実写版）、劇場版うたの☆プリンスさまっ♪、エヴァンゲリオン プロジェクションマッピング映像など。',
        ],
      },
      {
        name: '佐藤 進哉',
        role: '有限会社ピックアップ代表取締役社長',
        body: [
          '26年前からアニメ、ゲームの力に着目し、21年前ピックアップを設立。アニメ、声優、ゲームをワンストップで制作。',
          'アニメ制作、ゲーム声優キャスティング、声優楽曲、声優ライブイベントも制作。米Microsoftのキャラクターで擬人化プロモーションを初めて成功させた。',
          '主な実績にアニメ「全力ウサギ」プロデュース・キャスティング・音響制作、「蒼天の拳 REGENESIS」音響制作、ゲーム「六本木サディスティックナイト」「アトリエオンライン」キャスティング・音響制作など。',
        ],
      },
      {
        name: '孫弋涵',
        reading: 'ソン・イハン',
        role: 'MING STUDIO CEO / 元NetEase開発者',
        body: [
          '2021年にMING STUDIOを設立し、CEOとして開発の指揮を執っている。会社の中核メンバーはネットイース、バイトダンス、リリスゲーム出身者で構成されている。',
          'VRゲームの開発に専念しており、現在開発中の「MechaForce」デモ版は海外ユーザーから98%の高評価を得ている。',
          '日本「ファミ通」でのプレスリリースが平均50万回超のPV数を獲得。これまで世界トップレベルの複数のIPのモバイルゲームを開発し、ゲームのIP化の考え方に深い理解を持つ。',
        ],
      },
      {
        name: 'フランク・ヨコヤマ',
        role: 'クリエイティブディレクター',
        body: [
          'クリエイティブディレクター、アートディレクター、グラフィックデザイナー、アーティスト、講師、審査員と様々な顔を持つ。',
          '昨年は超大物海外ミュージシャンのイベントをプロデュースし、個展「in the Garage / Some Girls Do」を開催。今年は年末に開催される世界的アイドルのイベントをプロデュース。',
          '「お土産からブランドまで」「手売りからイベントまで」をモットーに世の中に様々なモノを送り出す。',
        ],
      },
      {
        name: '谭正',
        reading: 'タン・セイ',
        role: 'キャラクタークリエイター',
        body: [
          '2004年に中央美術学院アニメーション学科の一期生として卒業し、卒業後に「動客」を創設。',
          'アニメジャーナリスト、キュレーター、ブランドIPデザイナー、漫画の編集やレビューを行ってきた。現在は四川省成都にて活動中。',
        ],
      },
      {
        name: '胡蓉',
        reading: 'フー・ロン',
        role: '漫画家 / ノーウォール株式会社 代表取締役社長',
        body: [
          '中国初代漫画家、江蘇省如皋市出身。15歳の時に江蘇省「十大杰出青年」賞を獲得しデビュー。',
          '1996年9月16日作品『倩女幽魂』は東アジア漫画サミットで「審査員特別賞」を獲得し、中国漫画家の国際賞受賞の先駆けとなる。中国連環画の技法を漫画に落とし込んだことで伝統の継承者及び開拓者として認められる。',
          '北京映画大学の特別講師、中国人民郵電出版社の漫画雑誌『尚漫』特別編集長などを歴任。現在は日本でノーウォール株式会社の代表取締役社長として、日中間の国際文化交流の架け橋となっている。',
        ],
      },
      {
        name: '山吉 敏郎',
        role: 'キャラクターアートディレクター',
        body: [
          '日本経済新聞広告賞受賞。GOOD DESIGN賞3年連続、全4回受賞。',
          '東京赤坂のPOTATO HOUSEに入社し、キャラクターデザイナー&アートディレクターとして活躍。コミュニティストアのキャラクターマーク開発をきっかけに各社のキャラクターを手掛ける。',
          'クライアント実績はNintendo、Coca-Cola、東京オリエンタルランド、USJ JAPAN、docomo、softbank、au、楽天、集英社、KIRIN、SEIKO、タカラトミーなど多数。',
        ],
      },
      {
        name: 'MOMO',
        role: 'キャラクターデザイナー / シナリオライター',
        body: [
          'Fate/grand order公式イラストコンテント最優秀賞受賞。',
          '豪華声優陣によるメディアミックスプロジェクトの総合ディレクションを担当。',
          '日本の最大手パズル出版社よりキャラクターシナリオ付きのパズルブックシリーズ、店舗型謎解きコンテンツ・ストーリー作成、大手ホテルチェーン公式キャラクター制作など、キャラクターデザインを中心に演出、脚本執筆まで幅広く活動する。',
        ],
      },
      {
        name: '夏瑛',
        reading: 'カ・エイ',
        role: '浙江大学影視動漫遊戯研究センター副センター長',
        body: [
          '早稲田大学国際経営学修士。1999年よりコンテンツ産業の研究と実践に携わり、浙江大学で中国初の日本動漫産業を研究する博士号を取得。',
          '2006年より浙江大学影視動漫遊戯研究センター副センター長。デジタルコンテンツ協会主催のASIAGRAPH CGアートギャラリー国際審査員（2009年〜2019年）、デジタルハリウッド大学大学院特任教授（2017年4月〜2025年3月）を務める。',
          '元公益財団法人日中友好会館留学生事業部部長、天為俳句会同人、日本俳人協会会員。',
        ],
      },
      {
        name: 'アリスベク・ヌハン',
        reading: 'Arisbek Nuhan',
        role: 'アニメーション監督・脚本家 / ASIA IPコンテスト in Tokyo 2024 受賞者',
        body: [
          'カザフ族。1987年8月、中国新疆ウイグル自治区アラタイ市に生まれる。2015年に北京電影学院アニメーション学院にて修士課程を修了し、芸術学修士号を取得。',
          '代表作には、アニメーション短編作品『私、草原から来ました』およびIPキャラクター『ユキモン・アラ（雪怪阿乐）』などがある。',
          '『私、草原から来ました』は2015年第15回北京電影学院アニメーション学院賞最優秀監督賞を受賞し、2016年第43回アメリカ・アカデミー学生映画賞外国語アニメーション短編部門にノミネート。『ユキモン・アラ』は2021年中国文化芸術政府賞第4回アニメーション賞最優秀アニメキャラクター賞、2024年「ASIA IPコンテスト in Tokyo 2024」法人キャラクター部門優勝およびOMAKE賞を受賞。',
        ],
      },
    ],
  },
  en: {
    title: 'Judge Board',
    indexLabel: 'Judge index',
    items: [
      {
        name: 'Mitsugu Sekiguchi',
        role: 'Chairperson, ASIA IP CONTEST Executive Committee / Chairperson, Japan-China Animation, Comic and Game Industry Association',
        body: [
          'Former Sanrio designer. At Sanrio’s licensing division, he managed licensed design as a director for more than 30 years.',
          'In 2018, he became chairperson of the Japan-China Animation, Comic and Game Industry Association and has been active in seminars and design consulting across Chinese-speaking markets.',
        ],
      },
      {
        name: 'Takashi Endo',
        role: 'President and CEO, Anichina Inc. / Director, Japan-China Animation, Comic and Game Industry Association',
        body: [
          'Started an anime goods business in Akihabara as a student, later worked as a full-time investor, and now runs Anichina, a research and marketing company specialized in the Japanese market.',
          'Has extensive experience handling Chinese brands and supports localization branding for the Japanese market.',
        ],
      },
      {
        name: 'Jincheng',
        role: 'Chairperson, Guangdong Animation Artists Association',
        body: [
          'Director of the China Artists Association and deputy director of the Animation Education Steering Committee under China’s Ministry of Education. Founder of Comic Fans magazine, the Golden Dragon Award, and the CIAC national illustration support program.',
          'Publishing producer for the Chinese editions of Osamu Tezuka’s Astro Boy and My Son Goku, and curator of the 2019 Japan exhibition “Chinese Animation Born from Ink Painting.”',
          'Received a Commendation from the Head of a Japanese Overseas Diplomatic Mission in 2025.',
        ],
      },
      {
        name: 'Gu Ziyi (Jianguo)',
        role: 'Animation creator and director',
        body: [
          'Judge for ASIA IP CONTEST, judge for the Golden Dolphin International Animation Festival, and visiting professor at Kunming University of Communication.',
          'Born in Shanghai in 1956. Participated in classics including Nezha Conquers the Dragon King, Black Cat Detective, and Nine-Colored Deer, then directed international co-productions including Shentan Kachute and Journey to the West: Pingding Mountain.',
          'After moving to Japan, he also worked on Doraemon and Chibi Maruko-chan, while continuing work across animation, art design, ink painting, education, and international exchange.',
        ],
      },
      {
        name: 'Taebong Cho',
        role: 'Chairperson, Korea Culture Contents Licensing Association',
        body: [
          'Chairperson of Korea Culture Contents Licensing Association since 2012 and president of COCON Group Company since 2001.',
          'Former manager at Kim & Chang Law Office, with committee roles in the Global Future Research Association, Korea Federation of SMEs content industry committee, and Gwangju ACE Fair executive committee.',
          'Member of LIMA and LESI.',
        ],
      },
      {
        name: 'Hidenori Hayashi',
        role: 'CG Director / CEO, Hayashi Digital Studio',
        body: [
          'Joined Shirogumi in 1990, Asahi Production in 1998, became freelance in 2001, and founded Hayashi Digital Studio in 2004.',
          'Runs a CG studio centered on 3DS Max, producing tokusatsu, anime, corporate videos, and large-scale exhibition visuals. Also works as a professional taiko performer on stage productions involving projection mapping.',
          'Major credits include Ultraman, Kamen Rider, Sword Art Online the Movie, Mobile Suit Gundam UC, Attack on Titan live-action film, Uta no Prince-sama the Movie, and Evangelion projection mapping visuals.',
        ],
      },
      {
        name: 'Shinya Sato',
        role: 'President and Representative Director, Pick Up Co., Ltd.',
        body: [
          'Focused on the power of anime and games for 26 years and founded Pick Up 21 years ago, providing one-stop production for anime, voice actors, and games.',
          'Works across anime production, game voice casting, voice actor music, and live events, and successfully led an early personified promotion for a Microsoft corporate character.',
          'Credits include Zenryoku Usagi, Souten no Ken REGENESIS, 1000-chan, Rinkai!, Roppongi Sadistic Night, Atelier Online, and related casting and sound production.',
        ],
      },
      {
        name: 'Sun Yihan',
        role: 'CEO, MING STUDIO / Former NetEase developer',
        body: [
          'Founded MING STUDIO in 2021 and leads development as CEO. Core members come from NetEase, ByteDance, and Lilith Games.',
          'Focused on VR game development. The demo version of the in-development MechaForce has received 98% positive feedback from overseas users.',
          'Has developed multiple top-level IP mobile games and has deep insight into turning games into IP. Press releases in Japan’s Famitsu have averaged more than 500,000 page views.',
        ],
      },
      {
        name: 'Frank Yokoyama',
        role: 'Creative Director',
        body: [
          'Works across many roles including creative director, art director, graphic designer, artist, lecturer, and judge.',
          'Produced an event for a major overseas musician, held the solo exhibition “in the Garage / Some Girls Do,” and is producing a world-class idol event planned for year-end.',
          'Works from “souvenirs to brands” and from “hand-selling to events,” creating a wide range of projects for the market.',
        ],
      },
      {
        name: 'Tan Zheng',
        role: 'Character Creator',
        body: [
          'Graduated in 2004 as a member of the first class of the Animation Department at the Central Academy of Fine Arts, then founded Dongke.',
          'Has worked as an animation journalist, curator, brand IP designer, manga editor, and reviewer. Currently active in Chengdu, Sichuan.',
        ],
      },
      {
        name: 'Hu Rong',
        role: 'Manga artist / President and Representative Director, NoWall Inc.',
        body: [
          'One of China’s early-generation manga artists, from Rugao, Jiangsu. Debuted after receiving the Jiangsu “Top Ten Outstanding Youth” award at age 15.',
          'Her work A Chinese Ghost Story won the Judges’ Special Award at the East Asia Manga Summit in 1996, making her a pioneer among Chinese manga artists receiving international recognition.',
          'Former special lecturer at Beijing Film Academy and special editor-in-chief of Shang Man. Now based in Japan as president of NoWall Inc., working as a bridge for Japan-China cultural exchange.',
        ],
      },
      {
        name: 'Toshiro Yamayoshi',
        role: 'Character Art Director',
        body: [
          'Winner of the Nikkei Advertising Award and four GOOD DESIGN Awards, including three consecutive years.',
          'Joined POTATO HOUSE in Akasaka, Tokyo, and has worked as a character designer and art director, beginning with character mark development for Community Store.',
          'Client credits include Nintendo, Coca-Cola, Tokyo Disney Resort, USJ Japan, docomo, SoftBank, au, Rakuten, Shueisha, KIRIN, SEIKO, and Takara Tomy.',
        ],
      },
      {
        name: 'MOMO',
        role: 'Character Designer / Scenario Writer',
        body: [
          'Grand prize winner in the Fate/Grand Order official illustration contest.',
          'Directed a media mix project featuring a prominent voice actor cast.',
          'Works across character design, creative direction, direction, and scriptwriting, including puzzle book series with character scenarios, in-store puzzle experiences, story creation, and official characters for major hotel chains.',
        ],
      },
      {
        name: 'Xia Ying',
        role: 'Deputy Director, Zhejiang University Film, Animation and Game Research Center',
        body: [
          'Holds a master’s degree in international management from Waseda University and has worked in content industry research and practice since 1999. Earned China’s first doctorate researching the Japanese anime industry at Zhejiang University.',
          'Deputy director of Zhejiang University Film, Animation and Game Research Center since 2006. Served as an international judge for ASIAGRAPH CG Art Gallery from 2009 to 2019 and as a specially appointed professor at Digital Hollywood University Graduate School from 2017 to 2025.',
          'Former head of the International Student Division at the Japan-China Friendship Center, member of Ten’i Haiku Association and the Association of Haiku Poets.',
        ],
      },
      {
        name: 'Arisbek Nuhan',
        role: 'Animation director and screenwriter / ASIA IP CONTEST in Tokyo 2024 award winner',
        body: [
          'Kazakh. Born in Altay, Xinjiang, China in August 1987. Completed the master’s program at Beijing Film Academy School of Animation in 2015 and received an MFA.',
          'Representative works include the animated short I Came from the Grassland and the IP character Yukimon Ara.',
          'I Came from the Grassland won Best Director at the 15th Beijing Film Academy Animation Academy Awards and was nominated for the foreign animation short category at the 43rd Student Academy Awards. Yukimon Ara won the 2021 China Culture and Art Government Award for Best Animation Character and the 2024 ASIA IP CONTEST Corporate Character Category Grand Prize and OMAKE Award.',
        ],
      },
    ],
  },
}

const copy = computed(() => pageCopy[props.currentLanguage])
const judgeCopy = computed(() => detailedJudgesByLanguage[props.currentLanguage])
</script>
