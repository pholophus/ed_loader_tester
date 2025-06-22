<template>
    <div class="workflow-progress">
        <div class="progress-step" :class="getStepClass('preparation')">
            <div class="step-content">
                <div class="step-icon">
                    <svg v-if="isCompleted('preparation')" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div v-else class="step-number" :class="{ inactive: !isActive('preparation') }">1</div>
                </div>
                <span class="step-label">Preparation</span>
            </div>
            <div class="step-connector" v-if="currentStage !== 'preparation'"></div>
        </div>
        
        <div class="progress-step" :class="getStepClass('loading')">
            <div class="step-content">
                <div class="step-icon">
                    <svg v-if="isCompleted('loading')" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div v-else class="step-number" :class="{ inactive: !isActive('loading') }">2</div>
                </div>
                <span class="step-label">Loading</span>
            </div>
            <div class="step-connector"></div>
        </div>
        
        <div class="progress-step" :class="getStepClass('quality-check')">
            <div class="step-content">
                <div class="step-icon">
                    <svg v-if="isCompleted('quality-check')" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div v-else class="step-number" :class="{ inactive: !isActive('quality-check') }">3</div>
                </div>
                <span class="step-label">Quality Check</span>
            </div>
            <div class="step-connector"></div>
        </div>
        
        <div class="progress-step" :class="getStepClass('approval')">
            <div class="step-content">
                <div class="step-icon">
                    <svg v-if="isCompleted('approval')" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div v-else class="step-number" :class="{ inactive: !isActive('approval') }">4</div>
                </div>
                <span class="step-label">Approval</span>
            </div>
            <div class="step-connector"></div>
        </div>
        
        <div class="progress-step" :class="getStepClass('publication')">
            <div class="step-content">
                <div class="step-icon">
                    <svg v-if="isCompleted('publication')" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div v-else class="step-number" :class="{ inactive: !isActive('publication') }">5</div>
                </div>
                <span class="step-label">Publication</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    currentStage: 'preparation' | 'loading' | 'quality-check' | 'approval' | 'publication';
    completedStages?: string[];
}>();

const stageOrder = ['preparation', 'loading', 'quality-check', 'approval', 'publication'];

const isCompleted = (stage: string) => {
    return props.completedStages?.includes(stage) || false;
};

const isActive = (stage: string) => {
    return props.currentStage === stage;
};

const isNext = (stage: string) => {
    return false;
};

const getStepClass = (stage: string) => {
    return {
        active: isActive(stage),
        completed: isCompleted(stage),
        next: isNext(stage),
        inactive: !isCompleted(stage) && !isActive(stage) && !isNext(stage)
    };
};
</script>

<style scoped>
.workflow-progress {
    display: flex;
    align-items: center;
    gap: 0;
    background: #f8fafc;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
}

.progress-step {
    display: flex;
    align-items: center;
    position: relative;
    flex: 1;
}

.step-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 24px;
    transition: all 0.3s ease;
    background: white;
    border: 2px solid #e2e8f0;
    position: relative;
    z-index: 2;
    min-width: 140px;
    justify-content: flex-start;
}

.progress-step.completed .step-content {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-color: #10b981;
    color: white;
}

.progress-step.active .step-content {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-color: #f59e0b;
    color: white;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.progress-step.next .step-content {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #94a3b8;
}

.progress-step.inactive .step-content {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #94a3b8;
}

.step-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.step-number {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: currentColor;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
}

.step-number.inactive {
    background: #e2e8f0;
    color: #94a3b8;
}

.progress-step.completed .step-number {
    background: #10b981;
    color: white;
}

.progress-step.active .step-number {
    background: #f59e0b;
    color: white;
}

.progress-step.next .step-number {
    background: #e2e8f0;
    color: #94a3b8;
}

.step-label {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
}

.step-connector {
    position: absolute;
    top: 50%;
    right: -12px;
    width: 24px;
    height: 2px;
    background: #e2e8f0;
    z-index: 1;
    transform: translateY(-50%);
}

.progress-step.completed ~ .progress-step .step-connector,
.progress-step.active ~ .progress-step .step-connector {
    background: #e2e8f0;
}

.progress-step.completed .step-connector {
    background: #10b981;
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
    .workflow-progress {
        padding: 0.75rem 1rem;
        overflow-x: auto;
    }
    
    .step-content {
        min-width: 120px;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
    }
    
    .step-label {
        font-size: 0.75rem;
    }
}

@media (max-width: 640px) {
    .step-content {
        min-width: 100px;
        flex-direction: column;
        gap: 0.25rem;
        text-align: center;
    }
    
    .step-label {
        font-size: 0.7rem;
        line-height: 1.2;
    }
}
</style> 