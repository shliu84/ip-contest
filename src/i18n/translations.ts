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
  | 'navEventInfo'
  | 'navGuidelines'
  | 'navPastEvents'
  | 'heroBadge'
  | 'heroTitle'
  | 'heroSubtitle'
  | 'heroLead'
  | 'heroMetaVenueLabel'
  | 'heroMetaVenueValue'
  | 'heroMetaEntryLabel'
  | 'heroMetaEntryValue'
  | 'heroMetaDeadlineLabel'
  | 'heroMetaDeadlineValue'
  | 'heroMetaCategoriesLabel'
  | 'heroMetaCategoriesValue'
  | 'ctaEntry'
  | 'headerEntry'
  | 'headerLogin'
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
  | 'timeline5'
  | 'tracksTitle'
  | 'track1Title'
  | 'track1Text'
  | 'track2Title'
  | 'track2Text'
  | 'track3Title'
  | 'track3Text'
  | 'track4Title'
  | 'track4Text'
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
  | 'omakeTitle'
  | 'omakeText'
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
  | 'submissionEditorKicker'
  | 'submissionEditorTitle'
  | 'submissionEditorLead'
  | 'submissionEditorLoading'
  | 'submissionLoadError'
  | 'submissionReadOnlyNotice'
  | 'submissionSave'
  | 'submissionSavePending'
  | 'submissionSaveSuccess'
  | 'submissionSaveError'
  | 'submissionProceedToPayment'
  | 'submissionProceedPending'
  | 'submissionProceedError'
  | 'paymentKicker'
  | 'paymentTitle'
  | 'paymentLead'
  | 'paymentLoading'
  | 'paymentLoadError'
  | 'paymentMockConfirm'
  | 'paymentMockConfirmPending'
  | 'paymentMockConfirmError'
  | 'paymentBackToEditor'
  | 'paymentAlreadySubmitted'
  | 'paymentUnavailable'
  | 'paymentSuccessTitle'
  | 'paymentSuccessLead'
  | 'paymentSuccessMissing'
  | 'paymentSubmittedAt'
  | 'paymentPaidAt'
  | 'paymentCancelTitle'
  | 'paymentCancelLead'
  | 'paymentReturnToPayment'
  | 'submissionBackToDashboard'
  | 'submissionDetailsTitle'
  | 'submissionDivisionLabel'
  | 'submissionNoLabel'
  | 'submissionProfileTitle'
  | 'profileLastNameLabel'
  | 'profileFirstNameLabel'
  | 'profilePenNameLabel'
  | 'profilePhoneLabel'
  | 'profileCountryRegionLabel'
  | 'profileCityLabel'
  | 'profilePostalCodeLabel'
  | 'profilePrefectureLabel'
  | 'profileOccupationLabel'
  | 'profileSchoolLabel'
  | 'profileAddressLabel'
  | 'profileWechatLabel'
  | 'certificateLanguageLabel'
  | 'certificateLanguageJa'
  | 'certificateLanguageEn'
  | 'certificateLanguageZh'
  | 'submissionWorkTitle'
  | 'workCharacterNameLabel'
  | 'workThemeAndSettingLabel'
  | 'workExhibitionInfoLabel'
  | 'workPayerNameLabel'
  | 'workUsagePermissionLabel'
  | 'workTermsAcceptedLabel'
  | 'submissionFilesTitle'
  | 'submissionFileOnlineA4Image'
  | 'submissionFilePhysicalA2Image'
  | 'submissionFileProcessScreenshot'
  | 'submissionFileUneditedOriginalAi'
  | 'submissionUploadFile'
  | 'submissionUploadPending'
  | 'submissionUploadError'
  | 'submissionUploadTypeError'
  | 'submissionUploadSizeError'
  | 'submissionNoFiles'
  | 'submissionFileNameLabel'
  | 'submissionFileSizeLabel'
  | 'submissionFileUploadedAtLabel'
  | 'submissionDeleteFile'
  | 'submissionDeletePending'
  | 'submissionDeleteError'
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
  | 'apiErrorInvalidSubmission'
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
    navEventInfo: '举办信息',
    navGuidelines: '募集要项',
    navPastEvents: '往届比赛',
    heroBadge: 'FOR ASIA CHARACTER CREATORS',
    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
    heroSubtitle: '~Art Festa~',
    heroLead: '支持以专业创作为目标的亚洲创作者勇敢挑战',
    heroMetaVenueLabel: 'VENUE',
    heroMetaVenueValue: 'Tokyo',
    heroMetaEntryLabel: 'ENTRY START',
    heroMetaEntryValue: '2026.07.01',
    heroMetaDeadlineLabel: 'DEADLINE',
    heroMetaDeadlineValue: '2026.10.07',
    heroMetaCategoriesLabel: 'CATEGORIES',
    heroMetaCategoriesValue: '2D / 3DCG / AI / Corporate',
    ctaEntry: '立即投稿',
    headerEntry: '投稿',
    headerLogin: '登录',
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
    timeline2: '线上展示',
    timeline3: '专业评委复审',
    timeline4: '颁奖典礼与公布',
    timeline5: '线下会场展示',
    tracksTitle: '募集部门',
    track1Title: '2D 角色部门',
    track1Text: '以插画、角色原画、设定图、漫画表现、世界观视觉等平面表现形式投稿原创角色。',
    track2Title: '3DCG 角色部门',
    track2Text: '以 3DCG 模型、立体视觉、手办企划、商品化想定资料等立体表现形式投稿原创角色。',
    track3Title: 'AI 角色部门',
    track3Text: '以 AI 生成或 AI 活用作品投稿原创角色，重视角色设定、世界观构成、编辑整合与权利意识。',
    track4Title: '企业角色部门',
    track4Text: '企业可使用自社原创角色投稿。新角色和既有角色均可报名，用于展示企业角色资产与商业展开潜力。',
    judgesTitle: '审查员',
    judgeNamePlaceholder: '审查员姓名',
    judgeRolePlaceholder: '所属机构 / 职务',
    judgeBioPlaceholder: '审查员简介将在确认后更新。',
    prizesTitle: '奖项设置',
    silverTitle: '个人部门最优秀奖',
    silverText: '2D / 3D / AI 各部门 1 名',
    goldTitle: '企业角色部门最优秀奖',
    goldText: '企业角色部门 1 名',
    popularTitle: 'ワクワク奖',
    popularText: '由投票选出的“我的推”角色奖项',
    omakeTitle: 'OMAKE 奖',
    omakeText: '入选作品可获得扭蛋商品化机会',
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
    submissionEditorKicker: '投稿',
    submissionEditorTitle: '投稿编辑',
    submissionEditorLead: '填写参赛者资料、作品信息，并上传投稿文件。',
    submissionEditorLoading: '正在读取投稿...',
    submissionLoadError: '无法读取该投稿，请稍后再试。',
    submissionReadOnlyNotice: '该投稿已不再是草稿，当前页面仅可查看。',
    submissionSave: '保存',
    submissionSavePending: '正在保存...',
    submissionSaveSuccess: '投稿已保存。',
    submissionSaveError: '无法保存投稿，请稍后再试。',
    submissionProceedToPayment: '进入付款',
    submissionProceedPending: '正在准备付款...',
    submissionProceedError: '无法进入付款，请检查投稿内容后重试。',
    paymentKicker: '付款',
    paymentTitle: '确认付款',
    paymentLead: '确认投稿金额，并在沙盒环境中模拟付款成功。',
    paymentLoading: '正在读取投稿...',
    paymentLoadError: '无法读取付款信息，请稍后再试。',
    paymentMockConfirm: '模拟付款成功',
    paymentMockConfirmPending: '正在确认...',
    paymentMockConfirmError: '无法确认付款，请稍后再试。',
    paymentBackToEditor: '返回投稿编辑',
    paymentAlreadySubmitted: '该投稿已完成提交。',
    paymentUnavailable: '当前状态无法付款。',
    paymentSuccessTitle: '投稿已完成',
    paymentSuccessLead: '付款已确认，投稿已正式提交。',
    paymentSuccessMissing: '无法确认投稿信息。',
    paymentSubmittedAt: '提交时间',
    paymentPaidAt: '付款时间',
    paymentCancelTitle: '付款已取消',
    paymentCancelLead: '投稿仍保留在待付款状态。你可以返回付款页继续。',
    paymentReturnToPayment: '返回付款页',
    submissionBackToDashboard: '返回控制台',
    submissionDetailsTitle: '投稿信息',
    submissionDivisionLabel: '赛道',
    submissionNoLabel: '投稿编号',
    submissionProfileTitle: '参赛者资料',
    profileLastNameLabel: '姓',
    profileFirstNameLabel: '名',
    profilePenNameLabel: '笔名',
    profilePhoneLabel: '电话号码',
    profileCountryRegionLabel: '国家 / 地区',
    profileCityLabel: '城市',
    profilePostalCodeLabel: '邮政编码',
    profilePrefectureLabel: '都道府县 / 省州',
    profileOccupationLabel: '职业',
    profileSchoolLabel: '学校',
    profileAddressLabel: '地址',
    profileWechatLabel: '微信号',
    certificateLanguageLabel: '证书语言',
    certificateLanguageJa: '日语',
    certificateLanguageEn: '英语',
    certificateLanguageZh: '中文',
    submissionWorkTitle: '作品信息',
    workCharacterNameLabel: '角色 / 作品名称',
    workThemeAndSettingLabel: '主题与设定',
    workExhibitionInfoLabel: '展示信息',
    workPayerNameLabel: '付款人姓名',
    workUsagePermissionLabel: '同意主办方在赛事宣传、展示和审查中使用投稿作品。',
    workTermsAcceptedLabel: '同意投稿条款。',
    submissionFilesTitle: '投稿文件',
    submissionFileOnlineA4Image: '线上审查用 A4 图像',
    submissionFilePhysicalA2Image: '线下展示用 A2 图像',
    submissionFileProcessScreenshot: '制作过程 / 提示词截图',
    submissionFileUneditedOriginalAi: '未编辑的 AI 原始文件',
    submissionUploadFile: '上传文件',
    submissionUploadPending: '正在上传...',
    submissionUploadError: '无法上传文件，请稍后再试。',
    submissionUploadTypeError: '请上传 JPG、PNG 或 WebP 文件。',
    submissionUploadSizeError: '文件大小不能超过 10MB。',
    submissionNoFiles: '尚未上传文件。',
    submissionFileNameLabel: '文件名',
    submissionFileSizeLabel: '大小',
    submissionFileUploadedAtLabel: '上传时间',
    submissionDeleteFile: '删除',
    submissionDeletePending: '正在删除...',
    submissionDeleteError: '无法删除文件，请稍后再试。',
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
    apiErrorInvalidSubmission: '该投稿当前状态无法执行此操作。',
    apiErrorRequestFailed: '请求失败，请稍后再试。',
  },
  ja: {
    lang: 'ja',
    title: 'ASIA IP CONTEST in TOKYO 2026 | アジアIPコンテスト',
    logoSub: 'アジアIPコンテスト',
    navHome: 'ホーム',
    navAbout: 'コンテスト概要',
    navNews: 'お知らせ',
    navTimeline: 'スケジュール',
    navTracks: '募集部門',
    navJudges: '審査員',
    navPrizes: '賞について',
    navEventInfo: '開催情報',
    navGuidelines: '募集要項',
    navPastEvents: '過去大会',
    heroBadge: 'FOR ASIA CHARACTER CREATORS',
    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
    heroSubtitle: '~Art Festa~',
    heroLead: 'プロを目指すアジアのクリエイターたちの挑戦を応援する',
    heroMetaVenueLabel: 'VENUE',
    heroMetaVenueValue: 'Tokyo',
    heroMetaEntryLabel: 'ENTRY START',
    heroMetaEntryValue: '2026.07.01',
    heroMetaDeadlineLabel: 'DEADLINE',
    heroMetaDeadlineValue: '2026.10.07',
    heroMetaCategoriesLabel: 'CATEGORIES',
    heroMetaCategoriesValue: '2D / 3DCG / AI / Corporate',
    ctaEntry: '今すぐ応募',
    headerEntry: '応募',
    headerLogin: 'ログイン',
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
    timeline2: 'オンライン展示',
    timeline3: '専門審査員による審査',
    timeline4: '授賞式・結果発表',
    timeline5: 'リアル会場展示',
    tracksTitle: '募集部門',
    track1Title: '2Dキャラクター部門',
    track1Text: 'イラスト、キャラクター原画、設定画、漫画表現、世界観ビジュアルなど、平面表現によってオリジナルキャラクターを提示する部門です。',
    track2Title: '3DCGキャラクター部門',
    track2Text: '3DCGモデル、立体ビジュアル、フィギュア企画、商品化を想定した資料など、立体表現によってオリジナルキャラクターを提示する部門です。',
    track3Title: 'AIキャラクター部門',
    track3Text: 'AI生成・AI活用を含むキャラクター表現を対象とし、キャラクター設定、世界観設計、編集力、権利意識も重視します。',
    track4Title: '企業キャラクター部門',
    track4Text: '自社オリジナルキャラクターで応募できます。新規、既存問わず応募可能で、自社キャラクターの魅力と展開可能性をアピールする部門です。',
    judgesTitle: '審査員',
    judgeNamePlaceholder: '審査員名',
    judgeRolePlaceholder: '所属 / 役職',
    judgeBioPlaceholder: '審査員プロフィールは決定次第更新します。',
    prizesTitle: '賞について',
    silverTitle: '個人部門 最優秀賞',
    silverText: '2D / 3D / AI 各部門1名',
    goldTitle: '企業キャラクター部門 最優秀賞',
    goldText: '企業キャラクター部門 1名',
    popularTitle: 'ワクワク賞',
    popularText: '投票で選ばれる「私の推し」キャラクター賞',
    omakeTitle: 'OMAKE賞',
    omakeText: '選ばれた作品はカプセルトイ商品化のチャンスを得られます',
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
    submissionEditorKicker: '応募',
    submissionEditorTitle: '応募作品編集',
    submissionEditorLead: '応募者情報、作品情報、提出ファイルを入力してください。',
    submissionEditorLoading: '応募作品を読み込み中...',
    submissionLoadError: '応募作品を読み込めませんでした。時間をおいて再度お試しください。',
    submissionReadOnlyNotice: 'この応募作品は下書きではないため、現在は表示のみ可能です。',
    submissionSave: '保存',
    submissionSavePending: '保存中...',
    submissionSaveSuccess: '応募作品を保存しました。',
    submissionSaveError: '応募作品を保存できませんでした。時間をおいて再度お試しください。',
    submissionProceedToPayment: '支払いへ進む',
    submissionProceedPending: '支払い準備中...',
    submissionProceedError: '支払いへ進めませんでした。応募内容を確認して再度お試しください。',
    paymentKicker: '支払い',
    paymentTitle: '支払い確認',
    paymentLead: '応募料を確認し、サンドボックス環境で支払い成功をシミュレートします。',
    paymentLoading: '応募作品を読み込み中...',
    paymentLoadError: '支払い情報を読み込めませんでした。時間をおいて再度お試しください。',
    paymentMockConfirm: '支払い成功をシミュレート',
    paymentMockConfirmPending: '確認中...',
    paymentMockConfirmError: '支払いを確認できませんでした。時間をおいて再度お試しください。',
    paymentBackToEditor: '応募作品編集に戻る',
    paymentAlreadySubmitted: 'この応募作品は提出済みです。',
    paymentUnavailable: '現在のステータスでは支払いできません。',
    paymentSuccessTitle: '応募が完了しました',
    paymentSuccessLead: '支払いが確認され、応募作品が正式に提出されました。',
    paymentSuccessMissing: '応募情報を確認できませんでした。',
    paymentSubmittedAt: '提出日時',
    paymentPaidAt: '支払い日時',
    paymentCancelTitle: '支払いがキャンセルされました',
    paymentCancelLead: '応募作品は支払い待ちの状態で保存されています。支払いページに戻って続行できます。',
    paymentReturnToPayment: '支払いページに戻る',
    submissionBackToDashboard: 'ダッシュボードに戻る',
    submissionDetailsTitle: '応募情報',
    submissionDivisionLabel: '部門',
    submissionNoLabel: '応募番号',
    submissionProfileTitle: '応募者情報',
    profileLastNameLabel: '姓',
    profileFirstNameLabel: '名',
    profilePenNameLabel: 'ペンネーム',
    profilePhoneLabel: '電話番号',
    profileCountryRegionLabel: '国 / 地域',
    profileCityLabel: '市区町村',
    profilePostalCodeLabel: '郵便番号',
    profilePrefectureLabel: '都道府県 / 州',
    profileOccupationLabel: '職業',
    profileSchoolLabel: '学校名',
    profileAddressLabel: '住所',
    profileWechatLabel: 'WeChat ID',
    certificateLanguageLabel: '証書言語',
    certificateLanguageJa: '日本語',
    certificateLanguageEn: '英語',
    certificateLanguageZh: '中国語',
    submissionWorkTitle: '作品情報',
    workCharacterNameLabel: 'キャラクター / 作品名',
    workThemeAndSettingLabel: 'テーマ・設定',
    workExhibitionInfoLabel: '展示情報',
    workPayerNameLabel: '支払者名',
    workUsagePermissionLabel: 'コンテストの広報、展示、審査で応募作品を使用することに同意します。',
    workTermsAcceptedLabel: '応募規約に同意します。',
    submissionFilesTitle: '提出ファイル',
    submissionFileOnlineA4Image: 'オンライン審査用 A4 画像',
    submissionFilePhysicalA2Image: '会場展示用 A2 画像',
    submissionFileProcessScreenshot: '制作過程 / プロンプトのスクリーンショット',
    submissionFileUneditedOriginalAi: '未編集のAIオリジナルファイル',
    submissionUploadFile: 'ファイルをアップロード',
    submissionUploadPending: 'アップロード中...',
    submissionUploadError: 'ファイルをアップロードできませんでした。時間をおいて再度お試しください。',
    submissionUploadTypeError: 'JPG、PNG、WebPのいずれかをアップロードしてください。',
    submissionUploadSizeError: 'ファイルサイズは10MB以下にしてください。',
    submissionNoFiles: 'ファイルはまだアップロードされていません。',
    submissionFileNameLabel: 'ファイル名',
    submissionFileSizeLabel: 'サイズ',
    submissionFileUploadedAtLabel: 'アップロード日時',
    submissionDeleteFile: '削除',
    submissionDeletePending: '削除中...',
    submissionDeleteError: 'ファイルを削除できませんでした。時間をおいて再度お試しください。',
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
    apiErrorInvalidSubmission: 'この応募作品の現在のステータスでは操作できません。',
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
    navEventInfo: 'Event Info',
    navGuidelines: 'Guidelines',
    navPastEvents: 'Past Events',
    heroBadge: 'FOR ASIA CHARACTER CREATORS',
    heroTitle: 'ASIA IP CONTEST<br>in TOKYO 2026',
    heroSubtitle: '~Art Festa~',
    heroLead: 'Supporting Asian creators who are challenging themselves to become professionals',
    heroMetaVenueLabel: 'VENUE',
    heroMetaVenueValue: 'Tokyo',
    heroMetaEntryLabel: 'ENTRY START',
    heroMetaEntryValue: '2026.07.01',
    heroMetaDeadlineLabel: 'DEADLINE',
    heroMetaDeadlineValue: '2026.10.07',
    heroMetaCategoriesLabel: 'CATEGORIES',
    heroMetaCategoriesValue: '2D / 3DCG / AI / Corporate',
    ctaEntry: 'Submit Now',
    headerEntry: 'Submit',
    headerLogin: 'Login',
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
    timeline2: 'Online Exhibition',
    timeline3: 'Jury Review',
    timeline4: 'Award Ceremony & Results',
    timeline5: 'Physical Venue Exhibition',
    tracksTitle: 'Categories',
    track1Title: '2D Character Category',
    track1Text: 'For original characters presented through illustration, character concept art, setting sheets, comic expression, worldbuilding visuals, and other 2D formats.',
    track2Title: '3DCG Character Category',
    track2Text: 'For original characters presented through 3DCG models, dimensional visuals, figure concepts, merchandising-oriented materials, and other 3D formats.',
    track3Title: 'AI Character Category',
    track3Text: 'For character works created with or supported by AI, with emphasis on character settings, worldbuilding, editing, integration, and rights awareness.',
    track4Title: 'Corporate Character Category',
    track4Text: 'For company-owned original characters, whether new or existing, highlighting the appeal and business potential of corporate character assets.',
    judgesTitle: 'Judge Board',
    judgeNamePlaceholder: 'Judge Name',
    judgeRolePlaceholder: 'Organization / Title',
    judgeBioPlaceholder: 'Judge profile will be updated once confirmed.',
    prizesTitle: 'Prizes',
    silverTitle: 'Individual Category Grand Prize',
    silverText: 'One winner each from 2D, 3D, and AI categories',
    goldTitle: 'Corporate Character Category Grand Prize',
    goldText: 'One winner from the corporate character category',
    popularTitle: 'Wakuwaku Award',
    popularText: 'A “my favorite” character award selected by voting',
    omakeTitle: 'OMAKE Award',
    omakeText: 'Selected works receive a chance for capsule toy merchandising',
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
    submissionEditorKicker: 'Submission',
    submissionEditorTitle: 'Submission Editor',
    submissionEditorLead: 'Enter applicant details, work details, and submission files.',
    submissionEditorLoading: 'Loading submission...',
    submissionLoadError: 'Submission could not be loaded. Please try again later.',
    submissionReadOnlyNotice: 'This submission is no longer a draft. The page is view-only.',
    submissionSave: 'Save',
    submissionSavePending: 'Saving...',
    submissionSaveSuccess: 'Submission saved.',
    submissionSaveError: 'Submission could not be saved. Please try again later.',
    submissionProceedToPayment: 'Proceed to Payment',
    submissionProceedPending: 'Preparing payment...',
    submissionProceedError: 'Payment could not be prepared. Please check the submission and try again.',
    paymentKicker: 'Payment',
    paymentTitle: 'Confirm Payment',
    paymentLead: 'Confirm the submission fee and simulate a successful payment in the sandbox.',
    paymentLoading: 'Loading submission...',
    paymentLoadError: 'Payment information could not be loaded. Please try again later.',
    paymentMockConfirm: 'Simulate Payment Success',
    paymentMockConfirmPending: 'Confirming...',
    paymentMockConfirmError: 'Payment could not be confirmed. Please try again later.',
    paymentBackToEditor: 'Back to Submission Editor',
    paymentAlreadySubmitted: 'This submission has already been submitted.',
    paymentUnavailable: 'Payment is unavailable for the current status.',
    paymentSuccessTitle: 'Submission Complete',
    paymentSuccessLead: 'Payment has been confirmed and the submission has been officially submitted.',
    paymentSuccessMissing: 'Submission information could not be confirmed.',
    paymentSubmittedAt: 'Submitted',
    paymentPaidAt: 'Paid',
    paymentCancelTitle: 'Payment Canceled',
    paymentCancelLead: 'The submission remains in payment pending status. You can return to the payment page to continue.',
    paymentReturnToPayment: 'Return to Payment',
    submissionBackToDashboard: 'Back to Dashboard',
    submissionDetailsTitle: 'Submission Details',
    submissionDivisionLabel: 'Division',
    submissionNoLabel: 'Submission No.',
    submissionProfileTitle: 'Applicant Profile',
    profileLastNameLabel: 'Last Name',
    profileFirstNameLabel: 'First Name',
    profilePenNameLabel: 'Pen Name',
    profilePhoneLabel: 'Phone',
    profileCountryRegionLabel: 'Country / Region',
    profileCityLabel: 'City',
    profilePostalCodeLabel: 'Postal Code',
    profilePrefectureLabel: 'Prefecture / State',
    profileOccupationLabel: 'Occupation',
    profileSchoolLabel: 'School',
    profileAddressLabel: 'Address',
    profileWechatLabel: 'WeChat ID',
    certificateLanguageLabel: 'Certificate Language',
    certificateLanguageJa: 'Japanese',
    certificateLanguageEn: 'English',
    certificateLanguageZh: 'Chinese',
    submissionWorkTitle: 'Work Details',
    workCharacterNameLabel: 'Character / Work Name',
    workThemeAndSettingLabel: 'Theme and Setting',
    workExhibitionInfoLabel: 'Exhibition Information',
    workPayerNameLabel: 'Payer Name',
    workUsagePermissionLabel: 'I allow the organizer to use this work for contest promotion, exhibition, and review.',
    workTermsAcceptedLabel: 'I accept the submission terms.',
    submissionFilesTitle: 'Submission Files',
    submissionFileOnlineA4Image: 'Online Review A4 Image',
    submissionFilePhysicalA2Image: 'Physical Exhibition A2 Image',
    submissionFileProcessScreenshot: 'Process / Prompt Screenshot',
    submissionFileUneditedOriginalAi: 'Unedited Original AI File',
    submissionUploadFile: 'Upload File',
    submissionUploadPending: 'Uploading...',
    submissionUploadError: 'File could not be uploaded. Please try again later.',
    submissionUploadTypeError: 'Upload a JPG, PNG, or WebP file.',
    submissionUploadSizeError: 'File size must be 10MB or less.',
    submissionNoFiles: 'No files uploaded yet.',
    submissionFileNameLabel: 'Filename',
    submissionFileSizeLabel: 'Size',
    submissionFileUploadedAtLabel: 'Uploaded',
    submissionDeleteFile: 'Delete',
    submissionDeletePending: 'Deleting...',
    submissionDeleteError: 'File could not be deleted. Please try again later.',
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
    apiErrorInvalidSubmission: 'This action is not available for the current submission status.',
    apiErrorRequestFailed: 'The request failed. Please try again later.',
  },
}
