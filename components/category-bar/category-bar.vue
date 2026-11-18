<template>
	<scroll-view class="cat-bar" scroll-x :show-scrollbar="false">
		<view class="cat-row">
			<view class="cat-pill" :class="{ active: modelValue === '' }" @click="pick('')">全部博客</view>
			<view class="cat-pill" :class="{ active: modelValue === c.name }" v-for="c in store.categories"
				:key="c.id" @click="pick(c.name)">{{ c.name }}</view>
		</view>
	</scroll-view>
</template>

<script setup>
	import { onMounted } from 'vue'
	import { store } from '../../utils/store.js'
	import { selectAllCategories } from '../../api/blog.js'

	const props = defineProps({
		modelValue: { type: String, default: '' }
	})
	const emit = defineEmits(['update:modelValue', 'change'])

	onMounted(() => {
		if (!store.categories.length) {
			selectAllCategories().then(list => {
				store.categories = list || []
			}).catch(() => { /* 分类加载失败不阻塞页面 */ })
		}
	})

	function pick(name) {
		emit('update:modelValue', name)
		emit('change', name)
	}
</script>

<style>
	.cat-bar {
		width: 100%;
		white-space: nowrap;
	}

	.cat-row {
		display: inline-flex;
		gap: 14rpx;
		padding: 6rpx 4rpx;
	}

	.cat-pill {
		display: inline-block;
		padding: 12rpx 30rpx;
		background: #ffffff;
		color: var(--title-c);
		border-radius: 999rpx;
		font-size: 26rpx;
		border: 1.5px solid #efe8da;
		flex-shrink: 0;
		transition: all 0.2s;
	}

	.cat-pill.active {
		background: var(--brand-grad);
		color: #ffffff;
		font-weight: bold;
		box-shadow: 0 6rpx 18rpx rgba(46, 107, 79, 0.5);
	}
</style>
