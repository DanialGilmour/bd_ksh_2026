import { gsap } from 'gsap'
import { burst, celebrate, startFireworks } from './firework.js'

const SAFE_THEME_NAMES = new Set(['classic', 'warm', 'minimal'])
const THEME_CYCLE = ['classic', 'warm', 'minimal']
const THEME_ICONS = { classic: '🌙', warm: '🌸', minimal: '✨' }
const textFields = new Set([
  'startTitle',
  'startHint',
  'startButtonLabel',
  'photoCaption',
  'galleryHint',
  'continueButtonLabel',
  'cakePrompt',
  'cakeWishGranted',
  'letterButtonLabel',
  'letterTitle',
  'letterBody',
  'letterSignoff',
  'greeting',
  'name',
  'greetingText',
  'wishText',
  'text1',
  'textInChatBox',
  'sendButtonLabel',
  'text2',
  'text3',
  'text4',
  'text4Adjective',
  'text5Entry',
  'text5Content',
  'smiley',
  'bigTextPart1',
  'bigTextPart2',
  'wishHeading',
  'outroText',
  'replayText',
  'outroSmiley'
])

let audio = null
let isPlaying = false
let animation = null
let charactersPrepared = false
let poppedBalloons = 0
let soundContext = null
let wishGrantedText = '🤲 Aamiin Ya Rabbal \'Alamin! Here is your secret Du\'a letter…'

function isSafeResourceUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false

  try {
    const parsed = new URL(value, window.location.href)
    return parsed.protocol === 'https:' || parsed.origin === window.location.origin
  } catch {
    return false
  }
}

function setStatus(message) {
  const status = document.querySelector('[data-status]')
  if (status) status.textContent = message
}

function setText(nodeName, value) {
  const node = document.querySelector(`[data-node-name="${nodeName}"]`)
  if (!node) {
    console.warn(`HappyBirthday: missing node for ${nodeName}`)
    return
  }
  node.textContent = String(value)
}

function setImage(value) {
  const image = document.querySelector('[data-node-name="imagePath"]')
  if (!image || !isSafeResourceUrl(value)) {
    console.warn('HappyBirthday: ignored unsafe image URL')
    return
  }
  image.setAttribute('src', value)
}

function isBinaryFont(value) {
  try {
    const pathname = new URL(value, window.location.href).pathname.toLowerCase()
    return ['.ttf', '.otf', '.woff', '.woff2'].some((extension) => pathname.endsWith(extension))
  } catch {
    return false
  }
}

async function setFonts(fonts) {
  if (!Array.isArray(fonts)) return

  for (const font of fonts) {
    if (!font || typeof font.name !== 'string' || !isSafeResourceUrl(font.path)) {
      console.warn('HappyBirthday: ignored unsafe font configuration')
      continue
    }

    if (isBinaryFont(font.path)) {
      try {
        const face = new FontFace(font.name, `url(${JSON.stringify(font.path)})`)
        await face.load()
        document.fonts.add(face)
      } catch (error) {
        console.warn(`HappyBirthday: could not load font ${font.name}`, error)
        continue
      }
    } else {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = font.path
      document.head.appendChild(link)
    }

    document.body.style.fontFamily = `${JSON.stringify(font.name)}, var(--font-body)`
  }
}

function setAudio(value) {
  if (!isSafeResourceUrl(value)) {
    console.warn('HappyBirthday: ignored unsafe audio URL')
    return
  }

  audio = new Audio(value)
  audio.preload = 'auto'
  audio.addEventListener('error', () => {
    isPlaying = false
    document.getElementById('playPauseButton')?.classList.remove('playing')
    setStatus('The music could not be loaded, but the surprise will still play.')
  })
}

async function applyConfiguration(config) {
  const theme = SAFE_THEME_NAMES.has(config.theme) ? config.theme : 'classic'
  setTheme(theme)

  if (typeof config.cakeWishGranted === 'string' && config.cakeWishGranted.trim() !== '') {
    wishGrantedText = config.cakeWishGranted
  }

  Object.entries(config).forEach(([key, value]) => {
    if (textFields.has(key) && key !== 'cakeWishGranted' && (value !== '' || key === 'photoCaption')) setText(key, value)
  })

  if (config.imagePath) setImage(config.imagePath)
  buildPolaroidWall(config)
  if (config.music) setAudio(config.music)
  await setFonts(config.fonts)
}

const DEFAULT_POLAROID_MEMORIES = [
  { caption: 'Alhamdulillah for you 🤍', filter: 'warm', badge: '🤲', tilt: 5.5, offsetX: 18 },
  { caption: 'blessed moments & smiles 🌸', filter: 'vintage', badge: '🌸', tilt: -6, offsetX: -20 },
  { caption: 'noor & warmth wherever you go ✨', filter: 'golden', badge: '🌙', tilt: 4, offsetX: 14 },
  { caption: 'fi amanillah, always 🕊️', filter: 'dreamy', badge: '✨', tilt: -4.5, offsetX: -12 },
  { caption: 'grateful to Allah for you 💖', filter: 'rose', badge: '💌', tilt: 3.5, offsetX: 10 }
]

function buildPolaroidWall(config) {
  const wall = document.getElementById('polaroidWall')
  if (!wall) return

  wall.querySelectorAll('.extra-polaroid').forEach((node) => node.remove())
  const baseImage = isSafeResourceUrl(config.imagePath) ? config.imagePath : 'img/1.jpg'
  const items = Array.isArray(config.polaroids) && config.polaroids.length > 0
    ? config.polaroids
    : DEFAULT_POLAROID_MEMORIES

  items.forEach((entry, index) => {
    const preset = DEFAULT_POLAROID_MEMORIES[index % DEFAULT_POLAROID_MEMORIES.length]
    const card = document.createElement('article')
    const tilt = typeof entry?.tilt === 'number' ? entry.tilt : preset.tilt
    const offsetX = typeof entry?.offsetX === 'number' ? entry.offsetX : preset.offsetX
    const filter = typeof entry?.filter === 'string' ? entry.filter : preset.filter
    const captionText = typeof entry?.caption === 'string'
      ? entry.caption
      : (typeof preset?.caption === 'string' ? preset.caption : '')
    const badgeText = typeof entry?.badge === 'string' ? entry.badge : preset.badge
    const imageSrc = entry?.imagePath && isSafeResourceUrl(entry.imagePath) ? entry.imagePath : baseImage

    card.className = 'photo-frame polaroid-card extra-polaroid'
    card.dataset.filter = filter
    card.style.setProperty('--tilt', `${tilt}deg`)
    card.style.setProperty('--offset-x', `${offsetX}px`)

    const tape = document.createElement('span')
    tape.className = 'polaroid-tape'
    tape.setAttribute('aria-hidden', 'true')

    const img = document.createElement('img')
    img.src = imageSrc
    img.alt = captionText
    img.className = 'lydia-dp'

    const badge = document.createElement('span')
    badge.className = 'polaroid-sticker'
    badge.setAttribute('aria-hidden', 'true')
    badge.textContent = badgeText

    const caption = document.createElement('p')
    caption.className = 'photo-caption'
    caption.textContent = captionText

    card.append(tape, img, badge, caption)
    wall.appendChild(card)
  })
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme
  document.body.dataset.theme = theme
  const button = document.getElementById('themeToggleButton')
  if (button) button.textContent = THEME_ICONS[theme] || '🌙'
}

function splitIntoSpans(element) {
  if (!element) return
  const fragment = document.createDocumentFragment()

  for (const character of element.textContent || '') {
    const span = document.createElement('span')
    span.textContent = character
    fragment.appendChild(span)
  }

  element.replaceChildren(fragment)
}

// Splits text into per-letter spans grouped by word, so animated headings keep
// their spaces and can still wrap on narrow screens.
function splitIntoWordsAndCharacters(element) {
  if (!element) return
  const fragment = document.createDocumentFragment()
  const words = (element.textContent || '').trim().split(/\s+/)

  words.forEach((word, index) => {
    const wordSpan = document.createElement('span')
    wordSpan.className = 'word'
    for (const character of word) {
      const span = document.createElement('span')
      span.className = 'char'
      span.textContent = character
      wordSpan.appendChild(span)
    }
    fragment.appendChild(wordSpan)
    if (index < words.length - 1) fragment.appendChild(document.createTextNode(' '))
  })

  element.replaceChildren(fragment)
}

function prepareAnimationText() {
  if (charactersPrepared) return
  splitIntoSpans(document.querySelector('.hbd-chatbox'))
  splitIntoWordsAndCharacters(document.querySelector('.wish-hbd'))
  charactersPrepared = true
}

function createStars(count = 110) {
  const sky = document.querySelector('.sky')
  if (!sky || sky.querySelector('.star')) return
  const fragment = document.createDocumentFragment()

  for (let index = 0; index < count; index += 1) {
    const star = document.createElement('span')
    const size = Math.random() * 2 + 1
    star.className = 'star'
    star.style.width = `${size}px`
    star.style.height = `${size}px`
    star.style.top = `${Math.random() * 100}%`
    star.style.left = `${Math.random() * 100}%`
    star.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`
    star.style.animationDuration = `${(2.5 + Math.random() * 3).toFixed(2)}s`
    fragment.appendChild(star)
  }

  sky.appendChild(fragment)
}

function getSoundContext() {
  if (!soundContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (AudioCtx) soundContext = new AudioCtx()
  }
  if (soundContext?.state === 'suspended') void soundContext.resume()
  return soundContext
}

function playPopSound() {
  try {
    const ctx = getSoundContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.09)
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch {}
}

function playWishChime() {
  try {
    const ctx = getSoundContext()
    if (!ctx) return
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = ctx.currentTime + index * 0.09
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.12, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.6)
    })
  } catch {}
}

function resetBalloonsAndCake() {
  document.querySelectorAll('.baloons img').forEach((img) => {
    img.classList.remove('popped')
  })
  const six = document.querySelector('.six')
  if (six) six.scrollTop = 0
  toggleLetterModal(false)
  relightCandles(false)
}

function animationTimeline() {
  prepareAnimationText()
  resetBalloonsAndCake()
  if (animation) {
    animation.restart()
    return
  }

  const ideaTextTrans = { opacity: 0, y: -20, rotationX: 5, skewX: '15deg' }
  const ideaTextTransLeave = { opacity: 0, y: 20, rotationY: 5, skewX: '-15deg' }
  const themeStyles = getComputedStyle(document.documentElement)
  const accentColor = themeStyles.getPropertyValue('--accent-color').trim()
  const ideaHighlight = themeStyles.getPropertyValue('--idea-highlight').trim()
  const wishColor = themeStyles.getPropertyValue('--wish-color').trim()

  animation = gsap.timeline()
  window.__hbTimeline = animation
  gsap.set('.six', { autoAlpha: 0 })
  animation
    .to('.container', { duration: 0.1, autoAlpha: 1 })
    .from('.one', { duration: 0.7, opacity: 0, y: 10 })
    .from('.two', { duration: 0.4, opacity: 0, y: 10 })
    .to('.one', { duration: 0.7, opacity: 0, y: 10 }, '+=2.5')
    .to('.two', { duration: 0.7, opacity: 0, y: 10 }, '-=1')
    .from('.three', { duration: 0.7, opacity: 0, y: 10 })
    .to('.three', { duration: 0.7, opacity: 0, y: 10 }, '+=2')
    .from('.four', { duration: 0.7, scale: 0.2, opacity: 0 })
    .from('.fake-btn', { duration: 0.3, scale: 0.2, opacity: 0 })
    .to('.hbd-chatbox span', { duration: 0.5, visibility: 'visible', stagger: 0.05 })
    .to('.fake-btn', { duration: 0.1, backgroundColor: accentColor })
    .to('.four', { duration: 0.5, scale: 0.2, opacity: 0, y: -150 }, '+=0.7')
    .from('.idea-1', { duration: 0.7, ...ideaTextTrans })
    .to('.idea-1', { duration: 0.7, ...ideaTextTransLeave }, '+=1.5')
    .from('.idea-2', { duration: 0.7, ...ideaTextTrans })
    .to('.idea-2', { duration: 0.7, ...ideaTextTransLeave }, '+=1.5')
    .from('.idea-3', { duration: 0.7, ...ideaTextTrans })
    .to('.idea-3 strong', { duration: 0.5, scale: 1.2, x: 10, backgroundColor: ideaHighlight, color: '#fff' })
    .to('.idea-3', { duration: 0.7, ...ideaTextTransLeave }, '+=1.5')
    .from('.idea-4', { duration: 0.7, ...ideaTextTrans })
    .to('.idea-4', { duration: 0.7, ...ideaTextTransLeave }, '+=1.5')
    .from('.idea-5', { duration: 0.7, rotationX: 15, rotationZ: -10, skewY: '-5deg', y: 50, z: 10, opacity: 0 }, '+=0.5')
    .to('.idea-5 .smiley', { duration: 0.7, rotation: 90, x: 8 }, '+=0.4')
    .to('.idea-5', { duration: 0.7, scale: 0.2, opacity: 0 }, '+=2')
    .from('.idea-6 span', { duration: 0.8, scale: 3, opacity: 0, rotation: 15, ease: 'expo.out', stagger: 0.2 })
    .to('.idea-6 span', { duration: 0.8, scale: 3, opacity: 0, rotation: -15, ease: 'expo.out', stagger: 0.2 }, '+=1')
    .fromTo('.baloons img', { opacity: 0.9, y: 1400 }, { duration: 2.5, opacity: 1, y: -1000, stagger: 0.2 })
    .to('.six', { duration: 0.3, autoAlpha: 1 }, '-=2')
    .from('.wish-hbd .char', { duration: 0.7, opacity: 0, y: -50, rotation: 150, skewX: '30deg', ease: 'elastic.out(1, 0.5)', stagger: 0.1 }, '-=2')
    .fromTo('.wish-hbd .char', { scale: 1.4, rotationY: 150 }, { duration: 0.7, scale: 1, rotationY: 0, color: wishColor, ease: 'expo.out', stagger: 0.1 }, 'party')
    .call(() => celebrate(), null, 'party')
    .from('.wish h5', { duration: 0.5, opacity: 0, y: 10, skewX: '-15deg' }, 'party')
    .from('.polaroid-card', { duration: 0.65, scale: 0.6, opacity: 0, y: 60, stagger: 0.18, ease: 'back.out(1.4)' }, 'party-=0.3')
    .from('.scroll-hint', { duration: 0.5, opacity: 0, y: 10 }, 'party+=0.3')
    .from('.six-actions', { duration: 0.5, opacity: 0, y: 20 }, 'party+=0.6')
    .addPause('galleryBrowse', () => {
      gsap.fromTo('.eight svg', { visibility: 'visible', opacity: 1, scale: 1 }, { duration: 1.5, opacity: 0, scale: 80, repeat: 2, repeatDelay: 1.2, stagger: 0.3 })
    })
    .addLabel('cakeStage')
    .to('.six', { duration: 0.5, autoAlpha: 0, y: -30, zIndex: -1 })
    .from('.cake-stage', { duration: 0.9, opacity: 0, y: 35, scale: 0.85, ease: 'back.out(1.6)' })
    .from('.nine > p', { duration: 1, ...ideaTextTrans, stagger: 1.2 }, '-=0.3')
    .to('.last-smile', { duration: 0.5, rotation: 90 }, '+=1')
}

async function togglePlay(play) {
  if (!audio) return

  try {
    if (play) await audio.play()
    else audio.pause()
    isPlaying = play
    document.getElementById('playPauseButton')?.classList.toggle('playing', play)
  } catch {
    isPlaying = false
    document.getElementById('playPauseButton')?.classList.remove('playing')
    setStatus('Your browser blocked the music. Tap the music button to play it.')
  }
}

function openGift(onOpened) {
  const startSign = document.querySelector('.startSign')
  const gift = document.querySelector('.gift')
  if (!startSign || !gift) {
    if (startSign) startSign.style.display = 'none'
    onOpened()
    return
  }

  const rectangle = gift.getBoundingClientRect()
  const centerX = rectangle.left + rectangle.width / 2
  const centerY = rectangle.top + rectangle.height / 2
  gift.style.animation = 'none'

  gsap.timeline({
    onComplete: () => {
      startSign.style.display = 'none'
      onOpened()
    }
  })
    .to('.gift', { duration: 0.08, rotation: -7, repeat: 5, yoyo: true, ease: 'sine.inOut' })
    .to('.gift', { duration: 0.08, rotation: 0 })
    .to('.gift-lid', { duration: 0.6, y: -140, x: 40, rotation: 40, opacity: 0, ease: 'power2.out' })
    .call(() => {
      burst(centerX, centerY - 20, 90)
      window.setTimeout(() => burst(centerX - 60, centerY - 70, 60), 150)
      window.setTimeout(() => burst(centerX + 60, centerY - 70, 60), 300)
    }, null, '<')
    .to('.gift-box', { duration: 0.45, scale: 0.6, opacity: 0, ease: 'back.in(2)' }, '-=0.2')
    .to('.startSign > :not(.gift)', { duration: 0.5, opacity: 0, y: 20, stagger: 0.05 }, '<')
    .to({}, { duration: 0.4 })
}

function setupBalloonPopping() {
  const balloons = document.querySelectorAll('.baloons img')
  const scoreboard = document.getElementById('balloonScoreboard')
  const scoreNode = document.getElementById('balloonScore')

  balloons.forEach((balloon) => {
    balloon.addEventListener('click', (event) => {
      event.stopPropagation()
      if (balloon.classList.contains('popped')) return
      balloon.classList.add('popped')
      poppedBalloons += 1
      if (scoreNode) scoreNode.textContent = String(poppedBalloons)
      if (scoreboard) {
        scoreboard.hidden = false
        gsap.fromTo(scoreboard, { scale: 1.25 }, { duration: 0.35, scale: 1, ease: 'back.out(2)' })
      }
      playPopSound()
      burst(event.clientX, event.clientY, 45)
    })
  })
}

function setupPhotoTilt() {
  const frames = document.querySelectorAll('.polaroid-card')
  frames.forEach((frame) => {
    frame.addEventListener('pointermove', (event) => {
      const rect = frame.getBoundingClientRect()
      const relX = (event.clientX - rect.left) / rect.width - 0.5
      const relY = (event.clientY - rect.top) / rect.height - 0.5
      gsap.to(frame, {
        duration: 0.3,
        rotationY: relX * 18,
        rotationX: -relY * 18,
        scale: 1.04,
        transformPerspective: 750,
        ease: 'power2.out'
      })
    })

    frame.addEventListener('pointerleave', () => {
      gsap.to(frame, {
        duration: 0.55,
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        ease: 'elastic.out(1, 0.5)'
      })
    })
  })
}

function illuminateLantern() {
  const lantern = document.getElementById('duaLantern')
  if (!lantern || lantern.classList.contains('lit')) return

  lantern.classList.add('lit')
  playWishChime()
  celebrate(14, 200)

  const prompt = document.getElementById('cakePrompt')
  if (prompt) {
    prompt.dataset.originalPrompt = prompt.dataset.originalPrompt || prompt.textContent || ''
    prompt.textContent = wishGrantedText
    prompt.classList.add('wish-granted')
  }

  const openLetterButton = document.getElementById('openLetterButton')
  if (openLetterButton) openLetterButton.hidden = false
  const relightButton = document.getElementById('relightButton')
  if (relightButton) relightButton.hidden = false

  // Automatically reveal the secret Du'a letter after the lantern is illuminated!
  window.setTimeout(() => {
    toggleLetterModal(true)
  }, 650)
}

function relightCandles(withSound = true) {
  const lantern = document.getElementById('duaLantern')
  lantern?.classList.remove('lit')
  const prompt = document.getElementById('cakePrompt')
  if (prompt && prompt.dataset.originalPrompt) {
    prompt.textContent = prompt.dataset.originalPrompt
    prompt.classList.remove('wish-granted')
  }
  const openLetterButton = document.getElementById('openLetterButton')
  if (openLetterButton) openLetterButton.hidden = true
  const relightButton = document.getElementById('relightButton')
  if (relightButton) relightButton.hidden = true
  if (withSound) playPopSound()
}

function toggleLetterModal(open) {
  const modal = document.getElementById('letterModal')
  if (!modal) return
  if (open) {
    modal.hidden = false
    const card = modal.querySelector('.letter-card')
    if (card) {
      gsap.fromTo(card, { y: 40, scale: 0.88, opacity: 0 }, { duration: 0.45, y: 0, scale: 1, opacity: 1, ease: 'back.out(1.7)' })
    }
    const rect = modal.getBoundingClientRect()
    burst(rect.width / 2, rect.height / 2, 45)
  } else {
    modal.hidden = true
  }
}

function bindControls() {
  const startButton = document.getElementById('startButton')
  const playPauseButton = document.getElementById('playPauseButton')
  const themeToggleButton = document.getElementById('themeToggleButton')
  const replayButton = document.getElementById('replay')
  const duaLantern = document.getElementById('duaLantern')
  const relightButton = document.getElementById('relightButton')
  const openLetterButton = document.getElementById('openLetterButton')
  const continueToCakeButton = document.getElementById('continueToCakeButton')

  startButton?.addEventListener('click', () => {
    startButton.disabled = true
    // Start the music straight away so the browser treats it as user-initiated.
    void togglePlay(true)
    openGift(animationTimeline)
  })

  playPauseButton?.addEventListener('click', () => void togglePlay(!isPlaying))

  themeToggleButton?.addEventListener('click', (event) => {
    event.stopPropagation()
    const current = document.documentElement.dataset.theme || 'classic'
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length]
    setTheme(next)
    playPopSound()
  })

  duaLantern?.addEventListener('click', () => illuminateLantern())
  duaLantern?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      illuminateLantern()
    }
  })

  relightButton?.addEventListener('click', () => relightCandles(true))
  openLetterButton?.addEventListener('click', () => toggleLetterModal(true))
  continueToCakeButton?.addEventListener('click', () => {
    playPopSound()
    animation?.play('cakeStage')
  })

  document.querySelectorAll('[data-close-letter]').forEach((node) => {
    node.addEventListener('click', () => toggleLetterModal(false))
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') toggleLetterModal(false)
  })

  replayButton?.addEventListener('click', animationTimeline)
  replayButton?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      animationTimeline()
    }
  })

  setupBalloonPopping()
  setupPhotoTilt()
}

async function initialize() {
  createStars()
  try {
    const response = await fetch('./customize.json', { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const config = await response.json()
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      throw new Error('customize.json must contain an object')
    }

    await applyConfiguration(config)
    bindControls()
    startFireworks()
  } catch (error) {
    console.error('HappyBirthday initialization failed:', error)
    setStatus('Could not load the birthday settings. Please check customize.json.')
  }
}

void initialize()
