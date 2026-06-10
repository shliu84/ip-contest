export type LanguageCode = 'zh' | 'ja' | 'en'

export type TranslationKey =
  | 'logoSub'
  | 'navHome'
  | 'navAbout'
  | 'navNews'
  | 'navTimeline'
  | 'navTracks'
  | 'navJudges'
  | 'navPrizes'
  | 'heroBadge'
  | 'heroTitle'
  | 'heroLead'
  | 'ctaEntry'
  | 'ctaAbout'
  | 'aboutKicker'
  | 'aboutTitle'
  | 'aboutText1'
  | 'aboutText2'
  | 'aboutText3'
  | 'newsTitle'
  | 'news1Title'
  | 'news1Text'
  | 'news2Title'
  | 'news2Text'
  | 'timelineTitle'
  | 'timeline1'
  | 'timeline2'
  | 'timeline3'
  | 'timeline4'
  | 'tracksTitle'
  | 'track1Title'
  | 'track1Text'
  | 'track2Title'
  | 'track2Text'
  | 'track3Title'
  | 'track3Text'
  | 'judgesTitle'
  | 'judgeNamePlaceholder'
  | 'judgeRolePlaceholder'
  | 'judgeBioPlaceholder'
  | 'prizesTitle'
  | 'silverTitle'
  | 'silverText'
  | 'goldTitle'
  | 'goldText'
  | 'popularTitle'
  | 'popularText'
  | 'footer'
  | 'authKicker'
  | 'registerTitle'
  | 'registerLead'
  | 'loginTitle'
  | 'loginLead'
  | 'verifyTitle'
  | 'verifyLead'
  | 'forgotTitle'
  | 'forgotLead'
  | 'resetTitle'
  | 'resetLead'
  | 'dashboardKicker'
  | 'dashboardTitle'
  | 'dashboardLead'
  | 'emailLabel'
  | 'passwordLabel'
  | 'confirmPasswordLabel'
  | 'submitRegister'
  | 'submitLogin'
  | 'submitForgot'
  | 'submitReset'
  | 'submitVerify'
  | 'pendingRegister'
  | 'pendingLogin'
  | 'pendingForgot'
  | 'pendingReset'
  | 'pendingVerify'
  | 'successRegisterTitle'
  | 'successRegisterText'
  | 'successForgotText'
  | 'successResetText'
  | 'successVerifyText'
  | 'errorVerifyText'
  | 'missingTokenError'
  | 'errorGeneric'
  | 'errorPasswordMismatch'
  | 'errorPasswordRequirements'
  | 'loginLink'
  | 'registerLink'
  | 'forgotPasswordLink'
  | 'backToLogin'
  | 'retryRegister'
  | 'dashboardEmailLabel'
  | 'dashboardRoleLabel'
  | 'dashboardLogout'
  | 'dashboardLogoutPending'
  | 'dashboardWelcome'
  | 'dashboardCreateDraft'
  | 'dashboardCreateDraftPending'
  | 'dashboardSubmissionsTitle'
  | 'dashboardSubmissionsLead'
  | 'dashboardSubmissionsUnavailableTitle'
  | 'dashboardSubmissionsUnavailableText'
  | 'dashboardLoadingSubmissions'
  | 'dashboardLoadError'
  | 'dashboardEmptyTitle'
  | 'dashboardEmptyText'
  | 'dashboardSubmissionNo'
  | 'dashboardSubmissionWork'
  | 'dashboardSubmissionDivision'
  | 'dashboardSubmissionStatus'
  | 'dashboardSubmissionFee'
  | 'dashboardSubmissionFiles'
  | 'dashboardSubmissionCreated'
  | 'dashboardSubmissionUpdated'
  | 'dashboardSubmissionAction'
  | 'dashboardUntitledSubmission'
  | 'dashboardEditSubmission'
  | 'dashboardViewSubmission'
  | 'submissionDivision2d'
  | 'submissionDivision3d'
  | 'submissionDivisionAi'
  | 'submissionDivisionCorporate'
  | 'submissionStatusDraft'
  | 'submissionStatusPaymentPending'
  | 'submissionStatusSubmitted'
  | 'submissionStatusScreening'
  | 'submissionStatusScreenedIn'
  | 'submissionStatusScreenedOut'
  | 'submissionStatusAssigned'
  | 'submissionStatusReviewed'
  | 'submissionStatusWithdrawn'
  | 'roleApplicant'
  | 'roleCommittee'
  | 'roleJudge'
  | 'roleSuperAdmin'
  | 'apiErrorBadRequest'
  | 'apiErrorConflict'
  | 'apiErrorEmailDeliveryFailed'
  | 'apiErrorUnauthorized'
  | 'apiErrorEmailNotVerified'
  | 'apiErrorRequestFailed'

export type Translation = {
  lang: string
  title: string
} & Record<TranslationKey, string>

export const translations: Record<LanguageCode, Translation> = {
  zh: {
    lang: 'zh-CN',
    title: 'ASIA IP CONTEST in TOKYO 2026 | 亚洲IP设计大赛',
    logoSub: '亚洲IP设计大赛',
    navHome: '首页',
    navAbout: '大赛介绍',
    navNews: '通知',
    navTimeline: '赛事日程',
    navTracks: '征集赛道',
    navJudges: '审查员',
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
    timeline1: '全球作品征集期',
    timeline2: '大众人气票选',
    timeline3: '专业评委复审',
    timeline4: '颁奖典礼与公布',
    tracksTitle: '征集赛道',
    track1Title: '角色设计',
    track1Text: '角色原画、吉祥物设计、虚拟角色设定、三视图等，重视可持续发展的角色IP潜力。',
    track2Title: '商品与立体企划',
    track2Text: '潮玩、手办、周边商品、包装和展示方案等，可提交3D渲染图或多角度资料。',
    track3Title: '插画与世界观',
    track3Text: '基于原创角色IP的场景插画、绘本故事、漫画分镜和世界观设定。',
    judgesTitle: '审查员',
    judgeNamePlaceholder: '审查员姓名',
    judgeRolePlaceholder: '所属机构 / 职务',
    judgeBioPlaceholder: '审查员简介将在确认后更新。',
    prizesTitle: '奖项设置',
    silverTitle: '银奖',
    silverText: '2名 / 颁发证书与定制奖杯',
    goldTitle: '金奖',
    goldText: '1名 / 商业化孵化特权 + 奖杯',
    popularTitle: '人气奖',
    popularText: '3名 / 颁发证书与限定周边',
    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.',
    authKicker: '账户',
    registerTitle: '创建账户',
    registerLead: '使用邮箱和密码创建参赛账户。提交后请前往邮箱完成验证。',
    loginTitle: '登录',
    loginLead: '登录后可以管理投稿、付款和账户信息。',
    verifyTitle: '验证邮箱',
    verifyLead: '请点击按钮完成邮箱验证。',
    forgotTitle: '忘记密码',
    forgotLead: '输入账户邮箱，我们会发送重置密码的链接。',
    resetTitle: '重置密码',
    resetLead: '设置新的账户密码。',
    dashboardKicker: '账户',
    dashboardTitle: '控制台',
    dashboardLead: '你已登录 ASIA IP CONTEST 账户。',
    emailLabel: '邮箱',
    passwordLabel: '密码',
    confirmPasswordLabel: '确认密码',
    submitRegister: '创建账户',
    submitLogin: '登录',
    submitForgot: '发送重置链接',
    submitReset: '更新密码',
    submitVerify: '验证邮箱',
    pendingRegister: '正在创建...',
    pendingLogin: '正在登录...',
    pendingForgot: '正在发送...',
    pendingReset: '正在更新...',
    pendingVerify: '正在确认...',
    successRegisterTitle: '请检查邮箱',
    successRegisterText: '验证链接已发送。完成邮箱验证后即可登录。',
    successForgotText: '如果该邮箱已注册并完成验证，我们会发送重置密码的链接。',
    successResetText: '密码已更新。你现在可以使用新密码登录。',
    successVerifyText: '邮箱验证完成。你现在可以登录。',
    errorVerifyText: '无法验证该链接，请确认链接是否完整或是否已过期。',
    missingTokenError: '链接缺少验证信息，请从邮件中重新打开。',
    errorGeneric: '请求未完成，请稍后再试。',
    errorPasswordMismatch: '两次输入的密码不一致。',
    errorPasswordRequirements: '密码至少需要 10 个字符。',
    loginLink: '前往登录',
    registerLink: '创建账户',
    forgotPasswordLink: '忘记密码？',
    backToLogin: '返回登录',
    retryRegister: '重新填写',
    dashboardEmailLabel: '邮箱',
    dashboardRoleLabel: '角色',
    dashboardLogout: '退出登录',
    dashboardLogoutPending: '正在退出...',
    dashboardWelcome: '账户状态',
    dashboardCreateDraft: '新建草稿',
    dashboardCreateDraftPending: '正在创建...',
    dashboardSubmissionsTitle: '投稿',
    dashboardSubmissionsLead: '查看并继续编辑你的投稿。',
    dashboardSubmissionsUnavailableTitle: '投稿功能不可用',
    dashboardSubmissionsUnavailableText: '评委、委员会和管理员账户不能在此控制台创建或编辑参赛投稿。',
    dashboardLoadingSubmissions: '正在读取投稿...',
    dashboardLoadError: '无法读取投稿，请稍后再试。',
    dashboardEmptyTitle: '还没有投稿',
    dashboardEmptyText: '创建草稿后即可填写作品信息。',
    dashboardSubmissionNo: '投稿编号',
    dashboardSubmissionWork: '作品名',
    dashboardSubmissionDivision: '赛道',
    dashboardSubmissionStatus: '状态',
    dashboardSubmissionFee: '报名费',
    dashboardSubmissionFiles: '文件',
    dashboardSubmissionCreated: '创建日',
    dashboardSubmissionUpdated: '更新日',
    dashboardSubmissionAction: '操作',
    dashboardUntitledSubmission: '未命名作品',
    dashboardEditSubmission: '编辑',
    dashboardViewSubmission: '查看',
    submissionDivision2d: '2D',
    submissionDivision3d: '3D',
    submissionDivisionAi: 'AI',
    submissionDivisionCorporate: '企业',
    submissionStatusDraft: '草稿',
    submissionStatusPaymentPending: '待付款',
    submissionStatusSubmitted: '已提交',
    submissionStatusScreening: '初审中',
    submissionStatusScreenedIn: '初审通过',
    submissionStatusScreenedOut: '初审未通过',
    submissionStatusAssigned: '已分配',
    submissionStatusReviewed: '已评审',
    submissionStatusWithdrawn: '已撤回',
    roleApplicant: '参赛者',
    roleCommittee: '委员会',
    roleJudge: '评委',
    roleSuperAdmin: '超级管理员',
    apiErrorBadRequest: '输入内容无效，请检查后重试。',
    apiErrorConflict: '该邮箱已注册。',
    apiErrorEmailDeliveryFailed: '验证邮件暂时无法发送，请稍后重试。',
    apiErrorUnauthorized: '邮箱或密码不正确。',
    apiErrorEmailNotVerified: '请先完成邮箱验证后再登录。',
    apiErrorRequestFailed: '请求失败，请稍后再试。',
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
    navJudges: '審査員',
    navPrizes: '賞について',
    heroBadge: 'FOR ASIA CHARACTER CREATORS',
    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
    heroLead: 'プロを目指すアジアのクリエイターたちの挑戦を応援する',
    ctaEntry: '今すぐ応募',
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
    timeline1: 'グローバル作品募集期間',
    timeline2: '一般人気投票',
    timeline3: '専門審査員による審査',
    timeline4: '授賞式・結果発表',
    tracksTitle: '募集部門',
    track1Title: 'キャラクターデザイン',
    track1Text: 'キャラクター原画、マスコットデザイン、バーチャルキャラクター設定、三面図など。継続的に展開できるキャラクターIPの可能性を重視します。',
    track2Title: '商品・立体企画',
    track2Text: 'デザイナーズトイ、フィギュア、グッズ、パッケージ、展示企画など。3Dレンダリングまたは多角度資料を提出できます。',
    track3Title: 'イラスト・世界観',
    track3Text: 'オリジナルキャラクターIPをもとにした背景イラスト、絵本、漫画ネーム、世界観設定など。',
    judgesTitle: '審査員',
    judgeNamePlaceholder: '審査員名',
    judgeRolePlaceholder: '所属 / 役職',
    judgeBioPlaceholder: '審査員プロフィールは決定次第更新します。',
    prizesTitle: '賞について',
    silverTitle: '銀賞',
    silverText: '2名 / 証書と特製トロフィーを授与',
    goldTitle: '金賞',
    goldText: '1名 / 商業化インキュベーション特典 + トロフィー',
    popularTitle: '人気賞',
    popularText: '3名 / 証書と限定グッズを授与',
    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.',
    authKicker: 'アカウント',
    registerTitle: 'アカウント作成',
    registerLead: 'メールアドレスとパスワードで応募用アカウントを作成します。送信後、メール認証を完了してください。',
    loginTitle: 'ログイン',
    loginLead: 'ログインすると、応募作品・支払い・アカウント情報を管理できます。',
    verifyTitle: 'メール認証',
    verifyLead: 'ボタンを押してメール認証を完了してください。',
    forgotTitle: 'パスワードを忘れた場合',
    forgotLead: 'アカウントのメールアドレスを入力してください。パスワード再設定リンクを送信します。',
    resetTitle: 'パスワード再設定',
    resetLead: '新しいアカウントパスワードを設定します。',
    dashboardKicker: 'アカウント',
    dashboardTitle: 'ダッシュボード',
    dashboardLead: 'ASIA IP CONTEST アカウントにログインしています。',
    emailLabel: 'メールアドレス',
    passwordLabel: 'パスワード',
    confirmPasswordLabel: 'パスワード確認',
    submitRegister: 'アカウントを作成',
    submitLogin: 'ログイン',
    submitForgot: '再設定リンクを送信',
    submitReset: 'パスワードを更新',
    submitVerify: 'メール認証',
    pendingRegister: '作成中...',
    pendingLogin: 'ログイン中...',
    pendingForgot: '送信中...',
    pendingReset: '更新中...',
    pendingVerify: '確認中...',
    successRegisterTitle: 'メールをご確認ください',
    successRegisterText: '認証リンクを送信しました。メール認証が完了するとログインできます。',
    successForgotText: 'このメールアドレスが登録済みで認証済みの場合、再設定リンクを送信します。',
    successResetText: 'パスワードを更新しました。新しいパスワードでログインできます。',
    successVerifyText: 'メール認証が完了しました。ログインできます。',
    errorVerifyText: 'このリンクを認証できません。リンクが完全か、期限切れでないかをご確認ください。',
    missingTokenError: 'リンクに必要な情報がありません。メールからもう一度開いてください。',
    errorGeneric: 'リクエストを完了できませんでした。時間をおいて再度お試しください。',
    errorPasswordMismatch: '入力したパスワードが一致しません。',
    errorPasswordRequirements: 'パスワードは10文字以上で入力してください。',
    loginLink: 'ログインへ',
    registerLink: 'アカウント作成',
    forgotPasswordLink: 'パスワードを忘れた場合',
    backToLogin: 'ログインに戻る',
    retryRegister: '入力し直す',
    dashboardEmailLabel: 'メールアドレス',
    dashboardRoleLabel: 'ロール',
    dashboardLogout: 'ログアウト',
    dashboardLogoutPending: 'ログアウト中...',
    dashboardWelcome: 'アカウント状態',
    dashboardCreateDraft: '下書きを作成',
    dashboardCreateDraftPending: '作成中...',
    dashboardSubmissionsTitle: '応募作品',
    dashboardSubmissionsLead: '応募作品の確認と編集を行えます。',
    dashboardSubmissionsUnavailableTitle: '応募機能は利用できません',
    dashboardSubmissionsUnavailableText: '審査員、委員会、管理者アカウントでは、このダッシュボードから応募作品の作成や編集はできません。',
    dashboardLoadingSubmissions: '応募作品を読み込み中...',
    dashboardLoadError: '応募作品を読み込めませんでした。時間をおいて再度お試しください。',
    dashboardEmptyTitle: '応募作品はまだありません',
    dashboardEmptyText: '下書きを作成すると作品情報を入力できます。',
    dashboardSubmissionNo: '応募番号',
    dashboardSubmissionWork: '作品名',
    dashboardSubmissionDivision: '部門',
    dashboardSubmissionStatus: 'ステータス',
    dashboardSubmissionFee: '応募料',
    dashboardSubmissionFiles: 'ファイル',
    dashboardSubmissionCreated: '作成日',
    dashboardSubmissionUpdated: '更新日',
    dashboardSubmissionAction: '操作',
    dashboardUntitledSubmission: '作品名未入力',
    dashboardEditSubmission: '編集',
    dashboardViewSubmission: '表示',
    submissionDivision2d: '2D',
    submissionDivision3d: '3D',
    submissionDivisionAi: 'AI',
    submissionDivisionCorporate: '法人',
    submissionStatusDraft: '下書き',
    submissionStatusPaymentPending: '支払い待ち',
    submissionStatusSubmitted: '提出済み',
    submissionStatusScreening: '一次審査中',
    submissionStatusScreenedIn: '一次通過',
    submissionStatusScreenedOut: '一次不通過',
    submissionStatusAssigned: '割り当て済み',
    submissionStatusReviewed: '審査済み',
    submissionStatusWithdrawn: '取り下げ',
    roleApplicant: '応募者',
    roleCommittee: '委員会',
    roleJudge: '審査員',
    roleSuperAdmin: 'スーパー管理者',
    apiErrorBadRequest: '入力内容が正しくありません。確認して再度お試しください。',
    apiErrorConflict: 'このメールアドレスはすでに登録されています。',
    apiErrorEmailDeliveryFailed: '認証メールを送信できませんでした。時間をおいて再度お試しください。',
    apiErrorUnauthorized: 'メールアドレスまたはパスワードが正しくありません。',
    apiErrorEmailNotVerified: 'ログインする前にメール認証を完了してください。',
    apiErrorRequestFailed: 'リクエストに失敗しました。時間をおいて再度お試しください。',
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
    navJudges: 'Judges',
    navPrizes: 'Prizes',
    heroBadge: 'FOR ASIA CHARACTER CREATORS',
    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
    heroLead: 'Supporting Asian creators who are challenging themselves to become professionals',
    ctaEntry: 'Submit Now',
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
    timeline1: 'Global Entry Period',
    timeline2: 'Public Voting',
    timeline3: 'Jury Review',
    timeline4: 'Award Ceremony & Results',
    tracksTitle: 'Categories',
    track1Title: 'Character Design',
    track1Text: 'Character concept art, mascot design, virtual character settings, three-view sheets, and other works with long-term IP potential.',
    track2Title: 'Products & 3D Planning',
    track2Text: 'Designer toys, figures, merchandise, packaging, and exhibition concepts. 3D renders or multi-angle materials may be submitted.',
    track3Title: 'Illustration & Worldbuilding',
    track3Text: 'Scene illustrations, picture books, comic storyboards, and worldbuilding based on original character IP concepts.',
    judgesTitle: 'Judge Board',
    judgeNamePlaceholder: 'Judge Name',
    judgeRolePlaceholder: 'Organization / Title',
    judgeBioPlaceholder: 'Judge profile will be updated once confirmed.',
    prizesTitle: 'Prizes',
    silverTitle: 'Silver Award',
    silverText: '2 winners / Certificate and custom trophy',
    goldTitle: 'Gold Award',
    goldText: '1 winner / Commercial incubation privileges + trophy',
    popularTitle: 'Popular Award',
    popularText: '3 winners / Certificate and limited merchandise',
    footer: 'ASIA IP CONTEST in TOKYO 2026. All rights reserved.',
    authKicker: 'Account',
    registerTitle: 'Create Account',
    registerLead: 'Create your applicant account with an email address and password. Please verify your email after submitting.',
    loginTitle: 'Login',
    loginLead: 'Log in to manage submissions, payments, and account details.',
    verifyTitle: 'Verify Email',
    verifyLead: 'Click the button to verify your email.',
    forgotTitle: 'Forgot Password',
    forgotLead: 'Enter your account email and we will send a password reset link.',
    resetTitle: 'Reset Password',
    resetLead: 'Set a new account password.',
    dashboardKicker: 'Account',
    dashboardTitle: 'Dashboard',
    dashboardLead: 'You are signed in to your ASIA IP CONTEST account.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    submitRegister: 'Create Account',
    submitLogin: 'Login',
    submitForgot: 'Send Reset Link',
    submitReset: 'Update Password',
    submitVerify: 'Verify Email',
    pendingRegister: 'Creating...',
    pendingLogin: 'Logging in...',
    pendingForgot: 'Sending...',
    pendingReset: 'Updating...',
    pendingVerify: 'Verifying...',
    successRegisterTitle: 'Check Your Email',
    successRegisterText: 'We sent a verification link. You can log in after verifying your email.',
    successForgotText: 'If that email is registered and verified, we will send a password reset link.',
    successResetText: 'Your password has been updated. You can now log in with the new password.',
    successVerifyText: 'Your email is verified. You can now log in.',
    errorVerifyText: 'We could not verify this link. Please check that the link is complete and has not expired.',
    missingTokenError: 'This link is missing verification details. Please reopen it from your email.',
    errorGeneric: 'The request could not be completed. Please try again later.',
    errorPasswordMismatch: 'The passwords do not match.',
    errorPasswordRequirements: 'Password must be at least 10 characters.',
    loginLink: 'Go to Login',
    registerLink: 'Create Account',
    forgotPasswordLink: 'Forgot password?',
    backToLogin: 'Back to Login',
    retryRegister: 'Edit Details',
    dashboardEmailLabel: 'Email',
    dashboardRoleLabel: 'Role',
    dashboardLogout: 'Log Out',
    dashboardLogoutPending: 'Logging out...',
    dashboardWelcome: 'Account Status',
    dashboardCreateDraft: 'Create Draft',
    dashboardCreateDraftPending: 'Creating...',
    dashboardSubmissionsTitle: 'Submissions',
    dashboardSubmissionsLead: 'Review your submissions and continue drafts.',
    dashboardSubmissionsUnavailableTitle: 'Submission tools unavailable',
    dashboardSubmissionsUnavailableText: 'Judge, committee, and administrator accounts cannot create or edit applicant submissions from this dashboard.',
    dashboardLoadingSubmissions: 'Loading submissions...',
    dashboardLoadError: 'Submissions could not be loaded. Please try again later.',
    dashboardEmptyTitle: 'No submissions yet',
    dashboardEmptyText: 'Create a draft to start entering your work details.',
    dashboardSubmissionNo: 'Submission No.',
    dashboardSubmissionWork: 'Work',
    dashboardSubmissionDivision: 'Division',
    dashboardSubmissionStatus: 'Status',
    dashboardSubmissionFee: 'Fee',
    dashboardSubmissionFiles: 'Files',
    dashboardSubmissionCreated: 'Created',
    dashboardSubmissionUpdated: 'Updated',
    dashboardSubmissionAction: 'Action',
    dashboardUntitledSubmission: 'Untitled work',
    dashboardEditSubmission: 'Edit',
    dashboardViewSubmission: 'View',
    submissionDivision2d: '2D',
    submissionDivision3d: '3D',
    submissionDivisionAi: 'AI',
    submissionDivisionCorporate: 'Corporate',
    submissionStatusDraft: 'Draft',
    submissionStatusPaymentPending: 'Payment pending',
    submissionStatusSubmitted: 'Submitted',
    submissionStatusScreening: 'Screening',
    submissionStatusScreenedIn: 'Screened in',
    submissionStatusScreenedOut: 'Screened out',
    submissionStatusAssigned: 'Assigned',
    submissionStatusReviewed: 'Reviewed',
    submissionStatusWithdrawn: 'Withdrawn',
    roleApplicant: 'Applicant',
    roleCommittee: 'Committee',
    roleJudge: 'Judge',
    roleSuperAdmin: 'Super Admin',
    apiErrorBadRequest: 'The information is invalid. Please check and try again.',
    apiErrorConflict: 'This email is already registered.',
    apiErrorEmailDeliveryFailed: 'Verification email could not be sent. Please try again later.',
    apiErrorUnauthorized: 'Email or password is incorrect.',
    apiErrorEmailNotVerified: 'Please verify your email before logging in.',
    apiErrorRequestFailed: 'The request failed. Please try again later.',
  },
}
