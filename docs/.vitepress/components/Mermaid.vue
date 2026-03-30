<template>
  <div class="mermaid-wrapper">
    <div ref="mermaidContainer" class="mermaid-container" @click="openModal">
      <div v-show="isLoading" class="mermaid-loading">
        <div class="spinner"></div>
        <span>正在渲染图表...</span>
      </div>
    </div>
    <div v-if="showModal" class="mermaid-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">✕</button>
        <div class="zoom-controls">
          <button @click="zoomIn" class="zoom-btn">+</button>
          <button @click="resetZoom" class="zoom-btn">重置</button>
          <button @click="zoomOut" class="zoom-btn">-</button>
        </div>
        <div 
          ref="modalMermaidContainer" 
          class="modal-mermaid-container"
          @wheel="handleWheel"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        >
          <div v-show="isLoadingModal" class="mermaid-loading">
            <div class="spinner"></div>
            <span>正在渲染图表...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps<{
  code: string
}>()

const mermaidContainer = ref<HTMLElement>()
const modalMermaidContainer = ref<HTMLElement>()
const showModal = ref(false)
const isLoading = ref(true)
const isLoadingModal = ref(false)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

let renderedSvg = ''
let mermaidInstance: any = null

const renderMermaid = async (container: HTMLElement, id: string, isModal = false) => {
  if (!container) return ''
  
  try {
    const decodedCode = decodeURIComponent(props.code)
    
    // 获取或初始化 mermaid
    if (!mermaidInstance) {
      mermaidInstance = (await import('mermaid')).default
    }
    
    const config = {
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#60a5fa',
        primaryTextColor: '#1e293b',
        primaryBorderColor: '#3b82f6',
        lineColor: '#94a3b8',
        secondaryColor: '#a5b4fc',
        tertiaryColor: '#c7d2fe',
        background: '#ffffff',
        mainBkg: '#eff6ff',
        secondBkg: '#dbeafe',
        tertiaryBkg: '#bfdbfe',
        textColor: '#1e293b',
        border1: '#3b82f6',
        border2: '#60a5fa',
        arrowheadColor: '#3b82f6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: isModal ? '16px' : '15px',
        nodeBorder: '#3b82f6',
        clusterBkg: '#f8fafc',
        clusterBorder: '#e2e8f0',
        defaultLinkColor: '#94a3b8',
        titleColor: '#0f172a',
        edgeLabelBackground: 'transparent',
        labelBackground: 'transparent',
        labelColor: '#1e293b',
        nodeTextColor: '#1e293b',
        nodePadding: 15,
        lineHeight: 1.5
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 25,
        nodeSpacing: 60,
        rankSpacing: 60,
        diagramPadding: 20,
        wrappingWidth: 200
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 20,
        messageMargin: 40,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageAlign: 'center',
        mirrorActors: true,
        wrap: true,
        wrapPadding: 10
      },
      gantt: {
        useMaxWidth: true,
        titleTopMargin: 25,
        barHeight: 20,
        barGap: 4,
        topPadding: 50,
        leftPadding: 75
      },
      journey: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10
      },
      class: {
        useMaxWidth: true,
        padding: 20,
        textHeight: 16
      },
      state: {
        useMaxWidth: true,
        padding: 20
      },
      er: {
        useMaxWidth: true,
        padding: 20,
        layoutDirection: 'TB'
      },
      pie: {
        useMaxWidth: true,
        textPosition: 0.75
      },
      securityLevel: 'loose',
      logLevel: 'error',
      suppressErrorRendering: false,
      wrap: true,
      fontSize: isModal ? 16 : 15
    }
    
    // 每次渲染前重新初始化
    mermaidInstance.initialize(config)
    
    // 生成唯一 ID
    const uniqueId = `mermaid-${id}-${Math.random().toString(36).substr(2, 9)}`
    
    // 渲染图表
    const { svg } = await mermaidInstance.render(uniqueId, decodedCode)
    
    // 清空容器并插入 SVG
    container.innerHTML = svg
    
    // 优化 SVG 显示
    await nextTick()
    const svgElement = container.querySelector('svg')
    if (svgElement) {
      svgElement.style.display = 'block'
      svgElement.style.visibility = 'visible'
      svgElement.style.width = '100%'
      svgElement.style.height = 'auto'
      svgElement.style.maxWidth = 'none'
      
      // 确保文字完整显示
      const textElements = svgElement.querySelectorAll('text')
      textElements.forEach((text: Element) => {
        const textEl = text as SVGTextElement
        textEl.style.fontSize = isModal ? '16px' : '15px'
        textEl.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      })
      
      // 给矩形节点增加内边距
      const rectElements = svgElement.querySelectorAll('.node rect, rect.nodeLabel')
      rectElements.forEach((rect: Element) => {
        const rectEl = rect as SVGRectElement
        const currentWidth = parseFloat(rectEl.getAttribute('width') || '0')
        const currentHeight = parseFloat(rectEl.getAttribute('height') || '0')
        if (currentWidth > 0) {
          rectEl.setAttribute('width', String(currentWidth + 20))
          const x = parseFloat(rectEl.getAttribute('x') || '0')
          rectEl.setAttribute('x', String(x - 10))
        }
        if (currentHeight > 0) {
          rectEl.setAttribute('height', String(currentHeight + 10))
          const y = parseFloat(rectEl.getAttribute('y') || '0')
          rectEl.setAttribute('y', String(y - 5))
        }
      })
    }
    
    if (isModal) {
      updateTransform()
    }
    
    return svg
  } catch (error) {
    console.error('Mermaid rendering error:', error, 'Code:', props.code)
    const decodedCode = decodeURIComponent(props.code)
    container.innerHTML = `
      <div class="mermaid-error">
        <div class="error-title">⚠️ 图表渲染失败</div>
        <details>
          <summary>查看详情</summary>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
          <pre>${decodedCode}</pre>
        </details>
      </div>
    `
    return ''
  }
}

const updateTransform = () => {
  if (modalMermaidContainer.value) {
    const svg = modalMermaidContainer.value.querySelector('svg')
    if (svg) {
      svg.style.transform = `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
      svg.style.transformOrigin = 'center center'
      svg.style.transition = isDragging.value ? 'none' : 'transform 0.2s ease'
    }
  }
}

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.2, 5)
  updateTransform()
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.2, 0.5)
  updateTransform()
}

const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  updateTransform()
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.max(0.5, Math.min(5, scale.value + delta))
  updateTransform()
}

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  startX.value = e.clientX - translateX.value
  startY.value = e.clientY - translateY.value
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    translateX.value = e.clientX - startX.value
    translateY.value = e.clientY - startY.value
    updateTransform()
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const openModal = () => {
  showModal.value = true
  isLoadingModal.value = true
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
  
  setTimeout(async () => {
    if (modalMermaidContainer.value) {
      await renderMermaid(modalMermaidContainer.value, 'modal-' + Date.now(), true)
      isLoadingModal.value = false
    }
  }, 50)
}

const closeModal = () => {
  showModal.value = false
}

onMounted(async () => {
  if (mermaidContainer.value) {
    // 添加延迟确保 DOM 完全加载
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
      renderedSvg = await renderMermaid(mermaidContainer.value, 'main-' + Date.now(), false)
    } catch (error) {
      console.error('Failed to render mermaid on mount:', error)
    } finally {
      isLoading.value = false
    }
  }
})
</script>

<style scoped>
.mermaid-wrapper {
  position: relative;
  margin: 2rem 0;
}

.mermaid-container {
  background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
  padding: 2.5rem;
  border-radius: 12px;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.mermaid-container::after {
  content: '🔍 点击放大查看';
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.mermaid-container:hover {
  box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.15), 0 4px 8px -2px rgba(59, 130, 246, 0.08);
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.mermaid-container:hover::after {
  opacity: 1;
}

.mermaid-container :deep(svg) {
  max-width: 100%;
  height: auto;
  display: block !important;
  margin: 0 auto;
  visibility: visible !important;
}

.mermaid-container :deep(.node rect),
.mermaid-container :deep(.node circle),
.mermaid-container :deep(.node polygon) {
  stroke-width: 2px;
}

.mermaid-container :deep(.nodeLabel),
.mermaid-container :deep(.node text),
.mermaid-container :deep(text) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", sans-serif !important;
  fill: #1e293b !important;
  font-size: 15px !important;
  font-weight: 500 !important;
}

.mermaid-container :deep(.cluster text) {
  font-size: 14px !important;
  font-weight: 600 !important;
  fill: #475569 !important;
}

.mermaid-container :deep(.edgeLabel) {
  background-color: transparent !important;
  padding: 2px 6px !important;
  border-radius: 4px;
  font-size: 13px !important;
  box-shadow: none !important;
}

.mermaid-container :deep(.edgeLabel rect) {
  fill: transparent !important;
  stroke: none !important;
  opacity: 0 !important;
}

.mermaid-container :deep(.edgeLabel foreignObject) {
  overflow: visible !important;
}

.mermaid-container :deep(.edgeLabel foreignObject > div) {
  background: transparent !important;
}

.mermaid-container :deep(.label foreignObject) {
  overflow: visible !important;
}

.mermaid-container :deep(.label foreignObject > div) {
  background: transparent !important;
}

.mermaid-container :deep(.labelBox) {
  fill: transparent !important;
  stroke: none !important;
  opacity: 0 !important;
}

.mermaid-container :deep(g.label rect) {
  fill: transparent !important;
  stroke: none !important;
  opacity: 0 !important;
}

.mermaid-container :deep(.label) {
  color: #1e293b !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", sans-serif !important;
}

.mermaid-container :deep(foreignObject) {
  overflow: visible !important;
}

.mermaid-container :deep(.node rect) {
  rx: 8 !important;
  ry: 8 !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05)) !important;
}

.mermaid-container :deep(.node polygon),
.mermaid-container :deep(.node circle),
.mermaid-container :deep(.node ellipse) {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05)) !important;
}

.mermaid-container :deep(rect[fill="#666"]),
.mermaid-container :deep(rect[fill="#999"]),
.mermaid-container :deep(rect[fill="grey"]),
.mermaid-container :deep(rect[fill="gray"]),
.mermaid-container :deep(rect[style*="fill: rgb(102, 102, 102)"]),
.mermaid-container :deep(rect[style*="fill: rgb(153, 153, 153)"]) {
  fill: transparent !important;
  stroke: #cbd5e1 !important;
  stroke-width: 2px !important;
}

.mermaid-container :deep(.label-container rect) {
  fill: transparent !important;
}

.mermaid-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
  font-size: 14px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.mermaid-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #991b1b;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #fca5a5;
  text-align: left;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mermaid-error .error-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 0.75rem;
  color: #dc2626;
}

.mermaid-error details {
  margin-top: 0.5rem;
  cursor: pointer;
}

.mermaid-error summary {
  color: #b91c1c;
  font-weight: 600;
  user-select: none;
  padding: 0.25rem 0;
}

.mermaid-error summary:hover {
  color: #991b1b;
}

.mermaid-error pre {
  background: #fff1f2;
  border: 1px solid #fecaca;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow-x: auto;
  font-size: 12px;
  color: #7f1d1d;
}

.mermaid-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  width: 95vw;
  height: 95vh;
  overflow: hidden;
  position: relative;
  cursor: default;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #f43f5e;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  font-weight: bold;
}

.close-btn:hover {
  background: #e11d48;
  transform: scale(1.05);
}

.zoom-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.zoom-btn {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 50px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.zoom-btn:hover {
  background: linear-gradient(to bottom, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.zoom-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.modal-mermaid-container {
  padding: 1rem;
  flex: 1;
  overflow: auto;
  cursor: grab;
  position: relative;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.modal-mermaid-container:active {
  cursor: grabbing;
}

.modal-mermaid-container :deep(svg) {
  max-width: none !important;
  width: auto !important;
  height: auto !important;
  min-width: 100% !important;
  display: block !important;
  margin: 0 auto;
  visibility: visible !important;
  background: white;
  padding: 1rem;
  border-radius: 6px;
}

.modal-mermaid-container :deep(text) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", sans-serif !important;
  fill: #1e293b !important;
  font-size: 16px !important;
  font-weight: 500 !important;
}

.modal-mermaid-container :deep(.nodeLabel),
.modal-mermaid-container :deep(.node text) {
  font-size: 16px !important;
}

.modal-mermaid-container :deep(.edgeLabel) {
  background-color: transparent !important;
  padding: 3px 8px !important;
  font-size: 14px !important;
  box-shadow: none !important;
}

.modal-mermaid-container :deep(.edgeLabel rect) {
  fill: transparent !important;
  stroke: none !important;
  opacity: 0 !important;
}

.modal-mermaid-container :deep(.edgeLabel foreignObject) {
  overflow: visible !important;
}

.modal-mermaid-container :deep(.edgeLabel foreignObject > div) {
  background: transparent !important;
}

.modal-mermaid-container :deep(.label foreignObject) {
  overflow: visible !important;
}

.modal-mermaid-container :deep(.label foreignObject > div) {
  background: transparent !important;
}

.modal-mermaid-container :deep(.labelBox) {
  fill: transparent !important;
  stroke: none !important;
  opacity: 0 !important;
}

.modal-mermaid-container :deep(g.label rect) {
  fill: transparent !important;
  stroke: none !important;
  opacity: 0 !important;
}
</style>
