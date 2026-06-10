import { watchEffect, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { LanguageCode } from '../i18n/translations'

type SeoCopy = {
  title: string
  description: string
}

const siteName = 'ASIA IP CONTEST in Tokyo 2026'
const defaultSeo: Record<LanguageCode, SeoCopy> = {
  zh: {
    title: 'ASIA IP CONTEST in Tokyo 2026 | 亚洲IP大赛',
    description: 'ASIA IP CONTEST in Tokyo 2026 ~Art Festa~ 面向亚洲创作者征集角色作品，通过线上展示、东京线下展示与专业评审，拓展角色 IP 的商业可能。',
  },
  ja: {
    title: 'ASIA IP CONTEST in Tokyo 2026 | アジアIPコンテスト',
    description: 'ASIA IP CONTEST in Tokyo 2026 ~Art Festa~ は、アジアのクリエイターによるキャラクター作品を募集し、オンライン展示・東京でのリアル展示・審査を通じて新しいIPの可能性を広げるコンテストです。',
  },
  en: {
    title: 'ASIA IP CONTEST in Tokyo 2026 | Art Festa',
    description: 'ASIA IP CONTEST in Tokyo 2026 ~Art Festa~ invites character works from Asian creators and expands new IP opportunities through online exhibition, Tokyo venue exhibition, and professional review.',
  },
}

const pageSeo: Record<string, Record<LanguageCode, SeoCopy>> = {
  about: {
    zh: {
      title: 'About Us | ASIA IP CONTEST in Tokyo 2026',
      description: '了解 ASIA IP CONTEST 的举办目的、主办方、共同主办方，以及连接亚洲创作者与角色 IP 市场的理念。',
    },
    ja: {
      title: 'About Us / について | ASIA IP CONTEST in Tokyo 2026',
      description: 'ASIA IP CONTEST の目的、主催・共催紹介、アジアのクリエイターとキャラクターIP市場をつなぐ理念を紹介します。',
    },
    en: {
      title: 'About Us | ASIA IP CONTEST in Tokyo 2026',
      description: 'Learn about the purpose, organizers, co-organizers, and vision behind ASIA IP CONTEST connecting Asian creators with the character IP market.',
    },
  },
  'event-info': {
    zh: {
      title: 'Event Info | ASIA IP CONTEST in Tokyo 2026',
      description: '查看 ASIA IP CONTEST in Tokyo 2026 的赛事概要、募集部门、日程、参赛特典、展示信息与审查员信息。',
    },
    ja: {
      title: 'Event Info / 開催情報 | ASIA IP CONTEST in Tokyo 2026',
      description: 'ASIA IP CONTEST in Tokyo 2026 の開催概要、募集部門、スケジュール、応募特典、展示情報、審査員情報をまとめています。',
    },
    en: {
      title: 'Event Info | ASIA IP CONTEST in Tokyo 2026',
      description: 'Find event details, categories, schedule, applicant benefits, exhibition information, and jury information for ASIA IP CONTEST in Tokyo 2026.',
    },
  },
  guidelines: {
    zh: {
      title: 'Guidelines | ASIA IP CONTEST in Tokyo 2026',
      description: '确认 ASIA IP CONTEST in Tokyo 2026 的个人部门、法人部门、作品构成、提交文件规格与常见问题。',
    },
    ja: {
      title: 'Guidelines / 募集要項 | ASIA IP CONTEST in Tokyo 2026',
      description: 'ASIA IP CONTEST in Tokyo 2026 の個人部門・法人部門、作品構成、提出ファイル仕様、FAQを確認できます。',
    },
    en: {
      title: 'Guidelines | ASIA IP CONTEST in Tokyo 2026',
      description: 'Review individual and corporate categories, artwork composition requirements, file specifications, and FAQ for ASIA IP CONTEST in Tokyo 2026.',
    },
  },
  'past-events': {
    zh: {
      title: 'Past Events | ASIA IP CONTEST in Tokyo 2026',
      description: '查看 ASIA IP CONTEST 过往大会信息、线上会场与往届活动记录。',
    },
    ja: {
      title: 'Past Events / 過去大会 | ASIA IP CONTEST in Tokyo 2026',
      description: 'ASIA IP CONTEST の過去大会情報、オンライン会場、これまでの開催記録を紹介します。',
    },
    en: {
      title: 'Past Events | ASIA IP CONTEST in Tokyo 2026',
      description: 'Explore past ASIA IP CONTEST events, online venues, and previous contest records.',
    },
  },
}

const localeByLanguage: Record<LanguageCode, string> = {
  zh: 'zh_CN',
  ja: 'ja_JP',
  en: 'en_US',
}

function setMetaAttribute(selector: string, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    if (selector.includes('property=')) {
      element.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] ?? '')
    } else {
      element.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] ?? '')
    }
    document.head.appendChild(element)
  }
  element.setAttribute(attribute, value)
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

export function useSeoMetadata(currentLanguage: Ref<LanguageCode>) {
  const route = useRoute()

  watchEffect(() => {
    const routeName = typeof route.name === 'string' ? route.name : ''
    const language = currentLanguage.value
    const copy = pageSeo[routeName]?.[language] ?? defaultSeo[language]
    const isPublicPage = ['home', 'about', 'event-info', 'guidelines', 'past-events'].includes(routeName)
    const canonicalPath = route.path === '/' ? '/' : route.path.replace(/\/$/, '')
    const canonicalUrl = new URL(canonicalPath, window.location.origin).toString()

    document.title = copy.title
    setMetaAttribute('meta[name="description"]', 'content', copy.description)
    setMetaAttribute('meta[name="robots"]', 'content', isPublicPage ? 'index,follow' : 'noindex,nofollow')
    setMetaAttribute('meta[property="og:type"]', 'content', 'website')
    setMetaAttribute('meta[property="og:site_name"]', 'content', siteName)
    setMetaAttribute('meta[property="og:title"]', 'content', copy.title)
    setMetaAttribute('meta[property="og:description"]', 'content', copy.description)
    setMetaAttribute('meta[property="og:url"]', 'content', canonicalUrl)
    setMetaAttribute('meta[property="og:locale"]', 'content', localeByLanguage[language])
    setMetaAttribute('meta[name="twitter:card"]', 'content', 'summary')
    setMetaAttribute('meta[name="twitter:title"]', 'content', copy.title)
    setMetaAttribute('meta[name="twitter:description"]', 'content', copy.description)
    setLink('canonical', canonicalUrl)
  })
}
