let started = false
let canvas = null
let context = null
const fireworks = []

const PALETTE = ['#ffd27a', '#ff6fae', '#b18cff', '#7fe3ff', '#ffffff', '#ff9a6b']

class Particle {
  constructor(x, y, color, angle, speed) {
    this.x = x
    this.y = y
    this.color = color
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.size = Math.random() * 2 + 1.2
    this.alpha = 1
    this.decay = Math.random() * 0.01 + 0.012
  }

  update() {
    this.vx *= 0.97
    this.vy = this.vy * 0.97 + 0.05 // a touch of gravity
    this.x += this.vx
    this.y += this.vy
    this.alpha -= this.decay
  }

  draw() {
    context.globalAlpha = Math.max(this.alpha, 0)
    context.fillStyle = this.color
    context.shadowColor = this.color
    context.shadowBlur = 8
    context.beginPath()
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    context.fill()
  }
}

class Firework {
  constructor(x, y, count = 40) {
    const mainColor = PALETTE[Math.floor(Math.random() * PALETTE.length)]
    this.particles = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 4 + 1.5
      const color = Math.random() < 0.6 ? mainColor : PALETTE[Math.floor(Math.random() * PALETTE.length)]
      return new Particle(x, y, color, angle, speed)
    })
  }

  update() {
    this.particles.forEach((particle) => particle.update())
    this.particles = this.particles.filter((particle) => particle.alpha > 0)
  }

  draw() {
    this.particles.forEach((particle) => particle.draw())
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  fireworks.forEach((firework) => {
    firework.update()
    firework.draw()
  })
  context.globalAlpha = 1
  context.shadowBlur = 0
  for (let index = fireworks.length - 1; index >= 0; index -= 1) {
    if (fireworks[index].particles.length === 0) fireworks.splice(index, 1)
  }
  window.requestAnimationFrame(animate)
}

/** Launch a single burst at the given viewport coordinates. */
export function burst(x, y, count) {
  if (!context) return
  fireworks.push(new Firework(x, y, count))
}

/** A short show of bursts across the upper part of the screen. */
export function celebrate(total = 10, interval = 260) {
  if (!context) return
  for (let index = 0; index < total; index += 1) {
    window.setTimeout(() => {
      const x = window.innerWidth * (0.1 + Math.random() * 0.8)
      const y = window.innerHeight * (0.1 + Math.random() * 0.45)
      burst(x, y, 55)
    }, index * interval)
  }
}

export function startFireworks() {
  if (started) return
  started = true

  canvas = document.getElementById('fireworksCanvas')
  context = canvas?.getContext('2d') || null
  if (!canvas || !context) return

  window.addEventListener('resize', resizeCanvas)
  let lastTrail = 0
  document.addEventListener('pointermove', (event) => {
    const now = performance.now()
    if (now - lastTrail < 55) return
    lastTrail = now
    const rectangle = canvas.getBoundingClientRect()
    burst(event.clientX - rectangle.left, event.clientY - rectangle.top, 4)
  })
  document.addEventListener('click', (event) => {
    const rectangle = canvas.getBoundingClientRect()
    burst(event.clientX - rectangle.left, event.clientY - rectangle.top)
  })

  resizeCanvas()
  animate()
}
