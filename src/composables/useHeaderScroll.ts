import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useHeaderScroll(headerRef: Ref<HTMLElement | null>) {
  const updateHeader = () => {
    const header = headerRef.value
    if (!header) return

    if (window.scrollY > 50) {
      header.style.background = 'rgba(255, 255, 255, 0.85)'
      header.style.boxShadow = '0 4px 20px rgba(237, 21, 102, 0.05)'
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.5)'
      header.style.boxShadow = 'none'
    }
  }

  onMounted(() => {
    updateHeader()
    window.addEventListener('scroll', updateHeader)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', updateHeader)
  })
}
