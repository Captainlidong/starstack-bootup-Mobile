<template>
	<view class="sort-bar">
		<text class="sort-label">排序</text>
		<view class="sort-pill" :class="{ active: modelValue === s.value }" v-for="s in sorts" :key="s.value"
			@click="pick(s.value)">{{ s.label }}</view>
	</view>
</template>

<script setup>
	const props = defineProps({
		modelValue: { type: String, default: 'composite' }
	})
	const emit = defineEmits(['update:modelValue', 'change'])

	const sorts = [
		{ value: 'composite', label: '综合' },
		{ value: 'date', label: '最新' },
		{ value: 'reads', label: '最热' },
		{ value: 'likes', label: '最多点赞' }
	]

	function pick(v) {
		emit('update:modelValue', v)
		emit('change', v)
	}
</script>

<style>
	.sort-bar {
		display: flex;
		align-items: center;
		gap: 14rpx;
		padding: 6rpx 0;
		flex-wrap: wrap;
	}

	.sort-label {
		font-size: 24rpx;
		color: var(--text-sub);
		font-weight: bold;
	}

	.sort-pill {
		padding: 10rpx 26rpx;
		background: rgba(255, 255, 255, 0.7);
		border-radius: 999rpx;
		font-size: 24rpx;
		color: var(--title-c);
		border: 1.5px solid rgba(255, 255, 255, 0.6);
		transition: all 0.2s;
	}

	.sort-pill.active {
		background: var(--brand-grad);
		color: #ffffff;
		font-weight: bold;
		box-shadow: 0 6rpx 16rpx rgba(183, 156, 255, 0.45);
	}
</style>
