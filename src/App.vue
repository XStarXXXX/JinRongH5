<template>
  <div class="app-container">
    <canvas id="particle-canvas"></canvas>
    
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <div :key="route.path" v-if="Component">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
    
    <!-- Tab Bar -->
    <nav class="tab-bar">
      <router-link to="/" class="tab-item" active-class="active">
        <div class="icon-wrapper">
          <LayoutDashboard :size="24" />
        </div>
        <span>总览</span>
      </router-link>
      <router-link to="/tracking" class="tab-item" active-class="active">
        <div class="icon-wrapper">
          <PenTool :size="24" />
        </div>
        <span>流水</span>
      </router-link>
      <router-link to="/allocation" class="tab-item" active-class="active">
        <div class="icon-wrapper">
          <Gem :size="24" />
        </div>
        <span>资产</span>
      </router-link>
      <router-link to="/simulation" class="tab-item" active-class="active">
        <div class="icon-wrapper">
          <Sparkles :size="24" />
        </div>
        <span>先知</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { LayoutDashboard, PenTool, Gem, Sparkles } from 'lucide-vue-next'

onMounted(() => {
  const canvas = document.getElementById('particle-canvas')
  const ctx = canvas.getContext('2d')
  let particles = []

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  class Particle {
    constructor() {
      this.reset()
    }
    reset() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.size = Math.random() * 2 + 0.5
      this.speedX = Math.random() * 0.2 - 0.1
      this.speedY = Math.random() * 0.2 - 0.1
      this.opacity = Math.random() * 0.5 + 0.2
    }
    update() {
      this.x += this.speedX
      this.y += this.speedY
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset()
      }
    }
    draw() {
      ctx.fillStyle = `rgba(197, 160, 89, ${this.opacity})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const init = () => {
    particles = Array.from({ length: 50 }, () => new Particle())
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => {
      p.update()
      p.draw()
    })
    requestAnimationFrame(animate)
  }

  window.addEventListener('resize', resize)
  resize()
  init()
  animate()
})
</script>

<style>
:root {
  --primary-color: #C5A059; /* Champagne Gold */
  --secondary-color: #FFFFFF; /* Pure White */
  --accent-color: #E5D1B0; /* Soft Sand Gold */
  --text-color: #2C2C2C; /* Deep Charcoal for readability */
  --bg-color: #F8F9FA; /* Off-white / Light Marble */
  --card-bg: rgba(255, 255, 255, 0.95);
  --border-radius: 16px;
  --gold-gradient: linear-gradient(135deg, #D4AF37 0%, #E5D1B0 50%, #C5A059 100%);
  --light-gradient: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
  --shadow-elegant: 0 10px 30px rgba(197, 160, 89, 0.08);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: 'Inter', 'Noto Serif SC', 'PingFang SC', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
  line-height: 1.6;
  overflow-x: hidden;
  letter-spacing: 0.02em;
}

.app-container {
  min-height: 100vh;
  padding-bottom: 100px;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  background: var(--light-gradient);
}

#particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.tab-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 450px;
  height: 72px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 36px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  border: 1px solid rgba(197, 160, 89, 0.15);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #A0A0A0;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  flex: 1;
}

.tab-item span {
  font-size: 11px;
  margin-top: 4px;
  font-weight: 600;
}

.tab-item.active {
  color: var(--primary-color);
}

.tab-item.active .icon-wrapper {
  transform: translateY(-2px);
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.6));
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
