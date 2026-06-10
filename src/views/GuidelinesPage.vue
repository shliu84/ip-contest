<template>
  <main>
    <div class="event-page-layout guidelines-page-layout container">
      <aside
        class="event-page-nav"
        :aria-label="copy.nav.label"
        :style="navProgressStyle"
      >
        <div class="event-page-nav-title">
          <span>{{ copy.nav.titleEyebrow }}</span>
          <strong>{{ copy.nav.title }}</strong>
        </div>
        <a
          v-for="item in copy.nav.items"
          :key="item.href"
          class="event-page-nav-link"
          :class="[
            { active: activeHref === item.href },
            item.level === 1 ? 'event-page-nav-link-child' : 'event-page-nav-link-parent',
          ]"
          :href="item.href"
          @click="activeHref = item.href"
        >
          {{ item.label }}
        </a>
      </aside>

      <div class="event-page-content">
        <section
          v-for="group in copy.categoryGroups"
          :id="group.id"
          :key="group.id"
          class="guideline-section guideline-category-group section-padding container"
        >
          <div class="sec-title guideline-group-title">
            <span>{{ group.eyebrow }}</span>
            <h2>{{ group.title }}</h2>
            <p class="guideline-group-lead">{{ group.body }}</p>
            <a class="guideline-apply-link" href="/submissions/new">
              {{ copy.common.applyLabel }}
            </a>
          </div>
          <div class="guideline-category-stack">
            <article
              v-for="category in categoriesForGroup(group)"
              :id="category.id"
              :key="category.id"
              class="guideline-category-block"
            >
              <div class="sec-title guideline-category-title">
                <span>{{ category.eyebrow }}</span>
                <h2>{{ category.title }}</h2>
              </div>
              <div class="glass-card guideline-category-card">
                <div class="guideline-category-main">
                  <div class="guideline-award-box">
                    <span>{{ category.awardLabel }}</span>
                    <strong>{{ category.award }}</strong>
                    <p>{{ category.prize }}</p>
                  </div>
                  <dl class="guideline-meta-list">
                    <div>
                      <dt>{{ category.themeLabel }}</dt>
                      <dd>{{ category.theme }}</dd>
                    </div>
                  </dl>
                </div>
                <div class="guideline-requirements">
                  <h3>{{ copy.common.requirementsTitle }}</h3>
                  <ol>
                    <li
                      v-for="requirement in category.requirements"
                      :key="requirement"
                    >
                      <strong>{{ requirementLabel(requirement) }}</strong>
                      <span>{{ requirementBody(requirement) }}</span>
                    </li>
                  </ol>
                  <div class="guideline-sample-placeholder">
                    <span>{{ copy.common.sampleTitle }}</span>
                  </div>
                </div>
                <div class="guideline-file-table">
                  <div class="guideline-file-table-head">
                    <span>{{ copy.common.submissionFileHeader }}</span>
                    <span>{{ copy.common.submissionSpecHeader }}</span>
                  </div>
                  <div
                    v-for="row in submissionRowsForCategory(category)"
                    :key="row.file"
                    class="guideline-file-table-row"
                  >
                    <span>{{ row.file }}</span>
                    <span>{{ row.spec }}</span>
                  </div>
                  <p class="guideline-file-table-note">
                    {{ copy.common.winnerSubmissionNote }}
                  </p>
                </div>
                <div class="guideline-card-action">
                  <a class="guideline-apply-link" href="/submissions/new">
                    {{ copy.common.applyLabel }}
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="guideline-faq" class="guideline-section section-padding container">
          <div class="sec-title">
            <span>FAQ</span>
            <h2>{{ copy.faq.title }}</h2>
          </div>
          <div class="guideline-faq-list">
            <section
              v-for="group in copy.faq.groups"
              :key="group.title"
              class="glass-card guideline-faq-group"
            >
              <h3>{{ group.title }}</h3>
              <div
                v-for="item in group.items"
                :key="item.question"
                class="guideline-faq-item"
              >
                <p class="guideline-question">{{ item.question }}</p>
                <p class="guideline-answer">{{ item.answer }}</p>
              </div>
            </section>
          </div>
        </section>
      </div>

      <MobileSectionNav
        :active-href="activeHref"
        :items="copy.nav.items"
        :label="copy.nav.label"
        :title="copy.nav.title"
        :title-eyebrow="copy.nav.titleEyebrow"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import MobileSectionNav from '../components/MobileSectionNav.vue'
import type { LanguageCode, TranslationKey } from '../i18n/translations'

const props = defineProps<{
  currentLanguage: LanguageCode
  t: (key: TranslationKey) => string
}>()

type GuidelineCopy = {
  nav: {
    label: string
    titleEyebrow: string
    title: string
    items: Array<{ label: string; href: string; level?: number }>
  }
  categoryGroups: Array<{ id: string; eyebrow: string; title: string; body: string; categoryIds: string[] }>
  common: {
    requirementsTitle: string
    sampleTitle: string
    applyLabel: string
    submissionFileHeader: string
    submissionSpecHeader: string
    commonSubmissionRows: Array<{ file: string; spec: string }>
    winnerSubmissionNote: string
  }
  categories: Array<{
    id: string
    eyebrow: string
    parent: string
    title: string
    awardLabel: string
    award: string
    prize: string
    themeLabel: string
    theme: string
    requirements: string[]
    extraSubmissionRows?: Array<{ file: string; spec: string }>
  }>
  faq: {
    title: string
    groups: Array<{
      title: string
      items: Array<{ question: string; answer: string }>
    }>
  }
}

const navItemsByLanguage: Record<LanguageCode, GuidelineCopy['nav']['items']> = {
  zh: [
    { label: '个人部门', href: '#guideline-individual' },
    { label: '2D 部门', href: '#guideline-2d', level: 1 },
    { label: '3DCG 部门', href: '#guideline-3dcg', level: 1 },
    { label: 'AI 部门', href: '#guideline-ai', level: 1 },
    { label: '法人部门', href: '#guideline-corporate' },
    { label: '法人角色部门', href: '#guideline-corporation', level: 1 },
    { label: '常见问题', href: '#guideline-faq' },
  ],
  ja: [
    { label: '個人部門', href: '#guideline-individual' },
    { label: '2D部門', href: '#guideline-2d', level: 1 },
    { label: '3DCG部門', href: '#guideline-3dcg', level: 1 },
    { label: 'AI部門', href: '#guideline-ai', level: 1 },
    { label: '法人部門', href: '#guideline-corporate' },
    { label: '法人キャラクター部門', href: '#guideline-corporation', level: 1 },
    { label: 'FAQ', href: '#guideline-faq' },
  ],
  en: [
    { label: 'Individual Category', href: '#guideline-individual' },
    { label: '2D Category', href: '#guideline-2d', level: 1 },
    { label: '3DCG Category', href: '#guideline-3dcg', level: 1 },
    { label: 'AI Category', href: '#guideline-ai', level: 1 },
    { label: 'Corporate Category', href: '#guideline-corporate' },
    { label: 'Corporate Character', href: '#guideline-corporation', level: 1 },
    { label: 'FAQ', href: '#guideline-faq' },
  ],
}

const pageCopy: Record<LanguageCode, GuidelineCopy> = {
  zh: {
    nav: {
      label: '页面内导航',
      titleEyebrow: 'GUIDELINES',
      title: '募集要项',
      items: navItemsByLanguage.zh,
    },
    categoryGroups: [
      {
        id: 'guideline-individual',
        eyebrow: 'Individual',
        title: '个人部门',
        body: '以原创角色为对象参加 2D、3DCG、AI 相关部门。企业创作者也可以个人名义参加，公开展示时仅刊登个人名。',
        categoryIds: ['guideline-2d', 'guideline-3dcg', 'guideline-ai'],
      },
      {
        id: 'guideline-corporate',
        eyebrow: 'Corporate',
        title: '法人部门',
        body: '以企业自有原创角色参赛。新角色、既有角色均可报名，也是展示企业形象与角色资产的机会。',
        categoryIds: ['guideline-corporation'],
      },
    ],
    common: {
      requirementsTitle: '作品构成（重要）',
      sampleTitle: '作品构成范例',
      applyLabel: '立即报名',
      submissionFileHeader: '提交文件',
      submissionSpecHeader: '规格',
      commonSubmissionRows: [
        { file: '线上展示用作品图像', spec: 'JPG / PNG、A4・竖版、150dpi、10MB 以内' },
        { file: '实体展示用作品图像', spec: 'JPG / PNG、A2・竖版、350dpi、10MB 以内' },
        { file: '制作过程照片或截图', spec: '能体现制作过程的图像资料' },
      ],
      winnerSubmissionNote: '※最优秀奖获奖者后续需要另行提交 A1・竖版・350dpi 的会场展示用作品图像，主办方将另行联系。',
    },
    categories: [
      {
        id: 'guideline-2d',
        eyebrow: '2D Character Category',
        parent: '个人部门',
        title: '2D角色部门',
        awardLabel: '最优秀奖',
        award: '1名',
        prize: '奖金：JPY 100,000',
        themeLabel: '主题',
        theme: '自然',
        requirements: [
          '正面图・背面图::必须包含角色正面图与背面图。',
          '纯色背景::为了突出角色，背景请使用纯色。',
          '自由补充::可自由加入角色设定、名称、表情变化等信息。',
        ],
      },
      {
        id: 'guideline-3dcg',
        eyebrow: '3DCG Character Category',
        parent: '个人部门',
        title: '3DCG角色部门',
        awardLabel: '最优秀奖',
        award: '1名',
        prize: '奖金：JPY 100,000',
        themeLabel: '主题',
        theme: '自然',
        requirements: [
          '正面图・背面图::必须包含角色正面图与背面图。',
          '纯色背景::为了突出角色，背景请使用纯色。',
          '自由补充::可自由加入角色设定、名称、表情变化等信息。',
        ],
      },
      {
        id: 'guideline-ai',
        eyebrow: 'AI Art Character Category',
        parent: '个人部门',
        title: 'AI艺术角色部门',
        awardLabel: '最优秀奖',
        award: '1名',
        prize: '奖金：JPY 100,000',
        themeLabel: '主题',
        theme: '自然',
        requirements: [
          '正面图・背面图::必须包含角色正面图与背面图。',
          '纯色背景::为了突出角色，背景请使用纯色。',
          '自由补充::可自由加入角色设定、名称、表情变化等信息。',
        ],
        extraSubmissionRows: [
          { file: 'AI 部门：prompt 截图', spec: '可确认生成时输入关键词（prompt）的 t2i 最终画面截图' },
        ],
      },
      {
        id: 'guideline-corporation',
        eyebrow: 'Corporation Category',
        parent: '法人部门',
        title: '法人部门',
        awardLabel: '最优秀奖',
        award: '1名',
        prize: '奖金：JPY 300,000',
        themeLabel: '主题',
        theme: '自由',
        requirements: [
          '正面图・背面图::必须包含角色正面图与背面图。',
          '纯色背景::为了突出角色，背景请使用纯色。',
          '自由补充::可自由加入角色设定、名称、表情变化等信息。',
        ],
      },
    ],
    faq: {
      title: '常见问题',
      groups: [
        {
          title: '关于报名内容',
          items: [
            { question: 'Q：中国国外居住的中国人可以参加吗？', answer: 'A：只要拥有亚洲地区国籍或地区身份，即可参加。' },
            { question: 'Q：可以邮寄作品吗？', answer: 'A：不接受邮寄报名。请务必通过报名表提交。' },
            { question: 'Q：手绘作品可以报名吗？', answer: 'A：可以，但请务必扫描为图像数据后提交。' },
            { question: 'Q：参赛费为日元，可以用人民币支付吗？', answer: 'A：可以。支付时将自动换算为日元。' },
            { question: 'Q：关于退款', answer: 'A：若因主办方原因导致比赛中止，将全额退款。但违反报名规则的作品不予退款。' },
          ],
        },
        {
          title: '关于展示',
          items: [
            { question: 'Q：实体会场展示是否面向所有参赛者？', answer: 'A：由于空间有限，实体会场预计展示上位作品。其他作品将在在线会场展示。' },
            { question: 'Q：入选实体展示后，展板之后可以领取吗？', answer: 'A：展示结束后的领取方式将另行通知。原则上不安排配送。' },
          ],
        },
        {
          title: '关于获奖',
          items: [
            { question: 'Q：获奖后会有颁奖仪式吗？', answer: 'A：预计举办颁奖仪式及相关发布，详细信息将另行公布。' },
            { question: 'Q：奖金如何领取？', answer: 'A：获奖确定后，主办方将通过报名时填写的邮箱联系并安排汇款。' },
            { question: 'Q：实体会场展示只在日本吗？', answer: 'A：本届预计在东京都内会场展示。未来也会讨论在其他国家和地区展示的可能性。' },
          ],
        },
      ],
    },
  },
  ja: {
    nav: {
      label: 'ページ内ナビゲーション',
      titleEyebrow: 'GUIDELINES',
      title: '募集要項',
      items: navItemsByLanguage.ja,
    },
    categoryGroups: [
      {
        id: 'guideline-individual',
        eyebrow: 'Individual',
        title: '個人部門',
        body: '2D、3DCG、AI関連部門に、オリジナルキャラクターで応募できます。企業クリエイターの場合でも個人名義で参加でき、掲示は個人名のみとなります。',
        categoryIds: ['guideline-2d', 'guideline-3dcg', 'guideline-ai'],
      },
      {
        id: 'guideline-corporate',
        eyebrow: 'Corporate',
        title: '法人部門',
        body: '自社オリジナルキャラクターで応募できます。新規、既存問わず応募可能で、自社をアピールする場になります。',
        categoryIds: ['guideline-corporation'],
      },
    ],
    common: {
      requirementsTitle: '作品の構成について（重要）',
      sampleTitle: '作品構成の見本',
      applyLabel: '応募する',
      submissionFileHeader: '提出ファイル',
      submissionSpecHeader: '仕様',
      commonSubmissionRows: [
        { file: 'オンライン展示用作品画像', spec: 'JPG / PNG、A4・縦、150dpi、10MB以内' },
        { file: 'リアル展示用作品画像', spec: 'JPG / PNG、A2・縦、350dpi、10MB以内' },
        { file: '制作途中の写真・スクリーンショット', spec: '制作の途中経過を映した画像' },
      ],
      winnerSubmissionNote: '※最優秀賞受賞者は、後日改めて会場展示用にA1・縦・解像度350dpiの作品画像が必要となりますので、ご連絡いたします。',
    },
    categories: [
      {
        id: 'guideline-2d',
        eyebrow: '2D Character Category',
        parent: '個人部門',
        title: '2Dキャラクター部門',
        awardLabel: '最優秀賞',
        award: '1名',
        prize: '賞金：JPY 100,000',
        themeLabel: 'テーマ',
        theme: '自然',
        requirements: [
          '正面図・背面図::キャラクターの正面図・背面図を必ず入れてください。',
          '無地背景::キャラクターが目立つように、背景は必ず無地にしてください。',
          '自由掲載::作品画像にキャラクターの設定や名前、表情バリエーション等を掲載することは自由です。',
        ],
      },
      {
        id: 'guideline-3dcg',
        eyebrow: '3DCG Character Category',
        parent: '個人部門',
        title: '3DCGキャラクター部門',
        awardLabel: '最優秀賞',
        award: '1名',
        prize: '賞金：JPY 100,000',
        themeLabel: 'テーマ',
        theme: '自然',
        requirements: [
          '正面図・背面図::キャラクターの正面図・背面図を必ず入れてください。',
          '無地背景::キャラクターが目立つように、背景は必ず無地にしてください。',
          '自由掲載::作品画像にキャラクターの設定や名前、表情バリエーション等を掲載することは自由です。',
        ],
      },
      {
        id: 'guideline-ai',
        eyebrow: 'AI Art Character Category',
        parent: '個人部門',
        title: 'AIアートキャラクター部門',
        awardLabel: '最優秀賞',
        award: '1名',
        prize: '賞金：JPY 100,000',
        themeLabel: 'テーマ',
        theme: '自然',
        requirements: [
          '正面図・背面図::キャラクターの正面図・背面図を必ず入れてください。',
          '無地背景::キャラクターが目立つように、背景は必ず無地にしてください。',
          '自由掲載::作品画像にキャラクターの設定や名前、表情バリエーション等を掲載することは自由です。',
        ],
        extraSubmissionRows: [
          { file: 'AI部門：prompt確認スクリーンショット', spec: '画像生成のために入力したキーワード（prompt）が確認できるt2iの最終画面' },
        ],
      },
      {
        id: 'guideline-corporation',
        eyebrow: 'Corporation Category',
        parent: '法人部門',
        title: '法人部門',
        awardLabel: '最優秀賞',
        award: '1名',
        prize: '賞金：JPY 300,000',
        themeLabel: 'テーマ',
        theme: '自由',
        requirements: [
          '正面図・背面図::キャラクターの正面図・背面図を必ず入れてください。',
          '無地背景::キャラクターが目立つように、背景は必ず無地にしてください。',
          '自由掲載::作品画像にキャラクターの設定や名前、表情バリエーション等を掲載することは自由です。',
        ],
      },
    ],
    faq: {
      title: 'よくある質問',
      groups: [
        {
          title: '応募内容について',
          items: [
            { question: 'Q：中国国外在住の中国人ですが、参加できますか？', answer: 'A：アジア圏の国籍（地区）をお持ちであればご参加いただけます。' },
            { question: 'Q：作品は郵送でも受け付けていますか？', answer: 'A：郵送での応募は受け付けておりません。必ず応募フォームからご応募ください。' },
            { question: 'Q：手描き作品でも応募は可能ですか？', answer: 'A：可能ですが、必ずスキャンした画像データで送付してください。' },
            { question: 'Q：参加費用は日本円ですが、中国元でも支払えますか？', answer: 'A：中国元でもお支払いいただけます。お支払い時に自動で日本円に換算されます。' },
            { question: 'Q：返金について', answer: 'A：主催者の事情でコンテストを中止した場合は全額返金いたします。ただし、応募規約に違反した作品の出品者には返金いたしません。' },
          ],
        },
        {
          title: '展示について',
          items: [
            { question: 'Q：リアル展示会場での作品展示は応募者全員ができますか？', answer: 'A：スペースに限りがあるため、リアル会場では上位作品の展示を予定しています。その他の作品はオンライン展示会場に展示いたします。' },
            { question: 'Q：リアル展示に選ばれた場合、展示された作品パネルは後日受け取れますか？', answer: 'A：展示終了後の受け渡し方法は別途ご案内します。配送は行っておりませんのでご了承ください。' },
          ],
        },
        {
          title: '入賞について',
          items: [
            { question: 'Q：入賞した場合、表彰式はありますか？', answer: 'A：表彰式および関連発表を予定しています。詳細は決定次第お知らせします。' },
            { question: 'Q：賞金はどのように受け取れますか？', answer: 'A：入賞確定後、応募時に記載いただいたメールアドレスへご連絡の上、主催者より送金いたします。' },
            { question: 'Q：リアル展示会場での作品展示は日本だけですか？', answer: 'A：本届では東京都内の会場で展示予定です。次回以降の開催では、他国や地域での展示も検討しております。' },
          ],
        },
      ],
    },
  },
  en: {
    nav: {
      label: 'On this page',
      titleEyebrow: 'GUIDELINES',
      title: 'Guidelines',
      items: navItemsByLanguage.en,
    },
    categoryGroups: [
      {
        id: 'guideline-individual',
        eyebrow: 'Individual',
        title: 'Individual Category',
        body: 'Creators may submit original characters to the 2D, 3DCG, and AI-related categories. Corporate creators may also participate under an individual name.',
        categoryIds: ['guideline-2d', 'guideline-3dcg', 'guideline-ai'],
      },
      {
        id: 'guideline-corporate',
        eyebrow: 'Corporate',
        title: 'Corporate Category',
        body: 'Companies may submit their own original characters. Both new and existing characters are accepted as an opportunity to present corporate character assets.',
        categoryIds: ['guideline-corporation'],
      },
    ],
    common: {
      requirementsTitle: 'Work Requirements (Important)',
      sampleTitle: 'Work Composition Sample',
      applyLabel: 'Apply Now',
      submissionFileHeader: 'File',
      submissionSpecHeader: 'Specs',
      commonSubmissionRows: [
        { file: 'Work image for online exhibition', spec: 'JPG / PNG, A4 portrait, 150dpi, within 10MB' },
        { file: 'Work image for physical exhibition', spec: 'JPG / PNG, A2 portrait, 350dpi, within 10MB' },
        { file: 'Production photos or screenshots', spec: 'Images showing the production process' },
      ],
      winnerSubmissionNote: 'Grand prize winners will be contacted later to provide an A1 portrait image at 350dpi for venue display.',
    },
    categories: [
      {
        id: 'guideline-2d',
        eyebrow: '2D Character Category',
        parent: 'Individual Category',
        title: '2D Character Category',
        awardLabel: 'Grand Prize',
        award: '1 winner',
        prize: 'Prize money: JPY 100,000',
        themeLabel: 'Theme',
        theme: 'Nature',
        requirements: [
          'Front and back views::Front and back views of the character are required.',
          'Plain background::Use a plain background so the character stands out.',
          'Optional details::Character settings, name, and expression variations may be included freely.',
        ],
      },
      {
        id: 'guideline-3dcg',
        eyebrow: '3DCG Character Category',
        parent: 'Individual Category',
        title: '3DCG Character Category',
        awardLabel: 'Grand Prize',
        award: '1 winner',
        prize: 'Prize money: JPY 100,000',
        themeLabel: 'Theme',
        theme: 'Nature',
        requirements: [
          'Front and back views::Front and back views of the character are required.',
          'Plain background::Use a plain background so the character stands out.',
          'Optional details::Character settings, name, and expression variations may be included freely.',
        ],
      },
      {
        id: 'guideline-ai',
        eyebrow: 'AI Art Character Category',
        parent: 'Individual Category',
        title: 'AI Art Character Category',
        awardLabel: 'Grand Prize',
        award: '1 winner',
        prize: 'Prize money: JPY 100,000',
        themeLabel: 'Theme',
        theme: 'Nature',
        requirements: [
          'Front and back views::Front and back views of the character are required.',
          'Plain background::Use a plain background so the character stands out.',
          'Optional details::Character settings, name, and expression variations may be included freely.',
        ],
        extraSubmissionRows: [
          { file: 'AI Category: prompt screenshot', spec: 'Final t2i screen showing the prompt keywords used for image generation' },
        ],
      },
      {
        id: 'guideline-corporation',
        eyebrow: 'Corporation Category',
        parent: 'Corporate Category',
        title: 'Corporate Category',
        awardLabel: 'Grand Prize',
        award: '1 winner',
        prize: 'Prize money: JPY 300,000',
        themeLabel: 'Theme',
        theme: 'Free theme',
        requirements: [
          'Front and back views::Front and back views of the character are required.',
          'Plain background::Use a plain background so the character stands out.',
          'Optional details::Character settings, name, and expression variations may be included freely.',
        ],
      },
    ],
    faq: {
      title: 'Frequently Asked Questions',
      groups: [
        {
          title: 'Entries',
          items: [
            { question: 'Q: Can Chinese nationals living outside China participate?', answer: 'A: Yes. Participants with nationality or regional identity in Asia may participate.' },
            { question: 'Q: Are mailed submissions accepted?', answer: 'A: No. Please submit through the entry form.' },
            { question: 'Q: Can hand-drawn works be submitted?', answer: 'A: Yes, but they must be scanned and submitted as image data.' },
            { question: 'Q: The entry fee is in Japanese yen. Can I pay in Chinese yuan?', answer: 'A: Yes. The payment will be automatically converted into Japanese yen during payment.' },
            { question: 'Q: What is the refund policy?', answer: 'A: If the contest is cancelled due to organizer circumstances, the full amount will be refunded. Works that violate the entry rules are not eligible for refund.' },
          ],
        },
        {
          title: 'Exhibition',
          items: [
            { question: 'Q: Can every applicant exhibit at the physical venue?', answer: 'A: Due to limited space, the physical venue is planned for selected top works. Other works will be shown in the online venue.' },
            { question: 'Q: Can I receive the displayed panel after the exhibition?', answer: 'A: Pickup details will be announced separately after the exhibition. Delivery is not available.' },
          ],
        },
        {
          title: 'Awards',
          items: [
            { question: 'Q: Will there be an award ceremony?', answer: 'A: An award ceremony and related announcements are planned. Details will be announced once confirmed.' },
            { question: 'Q: How will prize money be paid?', answer: 'A: After awards are confirmed, the organizer will contact winners via the email address submitted with the entry and arrange payment.' },
            { question: 'Q: Will physical exhibitions only take place in Japan?', answer: 'A: This edition is planned for a venue in Tokyo. Future editions may consider exhibitions in other countries or regions.' },
          ],
        },
      ],
    },
  },
}

const activeHref = ref('#guideline-individual')
const navProgress = ref(0)
const navProgressStyle = computed(() => ({ '--event-nav-progress': String(navProgress.value) }))
const observedSectionIds = ['guideline-individual', 'guideline-2d', 'guideline-3dcg', 'guideline-ai', 'guideline-corporate', 'guideline-corporation', 'guideline-faq']

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

const copy = computed(() => pageCopy[props.currentLanguage])
const categoriesForGroup = (group: GuidelineCopy['categoryGroups'][number]) => (
  copy.value.categories.filter((category) => group.categoryIds.includes(category.id))
)
const submissionRowsForCategory = (category: GuidelineCopy['categories'][number]) => [
  ...copy.value.common.commonSubmissionRows,
  ...(category.extraSubmissionRows ?? []),
]
const requirementLabel = (requirement: string) => requirement.split('::')[0] ?? requirement
const requirementBody = (requirement: string) => {
  const [, body] = requirement.split('::')
  return body ?? ''
}
</script>
