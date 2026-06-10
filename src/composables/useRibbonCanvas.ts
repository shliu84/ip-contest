import { onBeforeUnmount, onMounted, type Ref } from 'vue'

type RibbonNode = {
  x: number
  y: number
  baseY: number
  vx: number
  angle: number
  angleSpeed: number
}

export function useRibbonCanvas(canvasRef: Ref<HTMLCanvasElement | null>) {
  let width = 0
  let height = 0
  let stableMobileHeight = 0
  let nodes: RibbonNode[] = []
  let animationFrameId = 0

  const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches

  const getCanvasHeight = () => {
    if (!isMobileViewport()) return window.innerHeight

    stableMobileHeight = Math.max(
      stableMobileHeight,
      window.innerHeight,
      window.screen?.height || 0,
      window.screen?.availHeight || 0,
    )

    return stableMobileHeight
  }

  const init = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    width = canvas.width = window.innerWidth
    height = canvas.height = getCanvasHeight()
    nodes = []

    for (let i = 0; i < 12; i += 1) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseY: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: Math.random() * 0.01 + 0.005,
      })
    }
  }

  const handleResize = () => {
    const nextWidth = window.innerWidth

    if (isMobileViewport() && nextWidth === width) {
      return
    }

    if (!isMobileViewport()) {
      stableMobileHeight = 0
    }

    init()
  }

  const animate = () => {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    animationFrameId = requestAnimationFrame(animate)
    ctx.clearRect(0, 0, width, height)

    const time = Date.now() * 0.001

    for (const node of nodes) {
      node.x += node.vx
      node.angle += node.angleSpeed
      node.y = node.baseY + Math.sin(node.angle) * 120

      if (node.x < -100) node.x = width + 100
      if (node.x > width + 100) node.x = -100
    }

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const n1 = nodes[i]
        const n2 = nodes[j]
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y)

        if (dist < 600) {
          const midX = (n1.x + n2.x) / 2
          const cp1x = midX + Math.sin(time + i) * 150
          const cp1y = n1.y - 100
          const cp2x = midX - Math.cos(time + j) * 150
          const cp2y = n2.y + 100
          const opacity = (1 - dist / 600) * 0.35

          ctx.beginPath()
          ctx.moveTo(n1.x, n1.y)
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, n2.x, n2.y)
          ctx.strokeStyle = `rgba(237, 21, 102, ${opacity})`
          ctx.lineWidth = 1
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(n1.x, n1.y + 10)
          ctx.bezierCurveTo(cp1x, cp1y + 10, cp2x, cp2y + 10, n2.x, n2.y + 10)
          ctx.strokeStyle = `rgba(237, 21, 102, ${opacity * 0.5})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }
  }

  onMounted(() => {
    init()
    animationFrameId = requestAnimationFrame(animate)
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  })
}
