import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface UseInactivityMonitorReturn {
    inactiveMinutes: Ref<number>
    inactiveSeconds: Ref<number>
    isUserActive: Ref<boolean>
    resetInactivity: () => void
    lastActivityTime: Ref<Date | null>
}

export function useInactivityMonitor(
    updateInterval: number = 1000, activityThreshold: number = 10
): UseInactivityMonitorReturn {
    const inactiveSeconds = ref<number>(0)
    const inactiveMinutes = ref<number>(0)
    const isUserActive = ref<boolean>(true)
    const lastActivityTime = ref<Date | null>(new Date())

    let updateTimer: NodeJS.Timeout | null = null

    const ACTIVITY_EVENTS = [
        'mousemove', 'mousedown', 'keypress', 'scroll',
        'focus', 'touchstart', 'click', 'input'
    ] as const

    function updateInactivityTime() {
        if (lastActivityTime.value) {
            const now = new Date()
            const diffInSeconds = Math.floor((now.getTime() - lastActivityTime.value.getTime()) / 1000)

            inactiveSeconds.value = diffInSeconds
            inactiveMinutes.value = Math.floor(diffInSeconds / 60)
            isUserActive.value = diffInSeconds < activityThreshold
        }
    }

    function handleUserActivity() {
        lastActivityTime.value = new Date()
        inactiveSeconds.value = 0
        inactiveMinutes.value = 0
        isUserActive.value = true
    }

    function resetInactivity() {
        handleUserActivity()
    }

    function setupEventListeners() {
        ACTIVITY_EVENTS.forEach(eventName => {
            window.addEventListener(eventName, handleUserActivity, { passive: true })
        })
    }

    function removeEventListeners() {
        ACTIVITY_EVENTS.forEach(eventName => {
            window.removeEventListener(eventName, handleUserActivity)
        })
    }

    function startMonitoring() {
        // Inicia o timer que atualiza o tempo de inatividade periodicamente
        updateTimer = setInterval(updateInactivityTime, updateInterval)
    }

    function stopMonitoring() {
        if (updateTimer) {
            clearInterval(updateTimer)
            updateTimer = null
        }
    }

    function cleanup() {
        stopMonitoring()
        removeEventListeners()
    }

    // Inicialização
    onMounted(() => {
        setupEventListeners()
        startMonitoring()
    })

    onUnmounted(cleanup)

    return {
        inactiveMinutes,
        inactiveSeconds,
        isUserActive,
        resetInactivity,
        lastActivityTime
    }
}