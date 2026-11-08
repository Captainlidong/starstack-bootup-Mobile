<template>
	<view class="blog-card card" :class="'macaron-' + (index % 3)" @click="emit('click')">
		<view class="blog-main">
			<view class="blog-title line1">
				<text v-if="blog.top === 1" class="mini-tag top-tag">置顶</text>
				<text v-if="privateTag" class="mini-tag pv-tag">{{ privateTag }}</text>
				<text v-if="statusText" class="mini-tag" :class="'st-' + blog.status">{{ statusText }}</text>
				{{ blog.title }}
			</view>
			<view class="blog-descr line2" v-if="blog.descr">{{ blog.descr }}</view>
			<view class="blog-meta">
				<view class="author" @click.stop="emit('author')">
					<image class="avatar" :src="absUrl(blog.userAvatar)" mode="aspectFill" v-if="blog.userAvatar" />
					<view class="avatar avatar-ph" v-else><text>👤</text></view>
					<text class="author-name line1">{{ blog.userName || '佚名' }}</text>
				</view>
				<view class="meta-nums">
					<text class="meta-item">👁 {{ blog.readCount || 0 }}</text>
					<text class="meta-item">👍 {{ blog.likesCount || 0 }}</text>
				</view>
			</view>
			<view class="tag-row" v-if="tags.length">
				<text class="tag" v-for="(t, i) in tags" :key="i">{{ t }}</text>
			</view>
			<view class="reject-line" v-if="blog.status === 'REJECTED' && blog.rejectReason">
				驳回原因:{{ blog.rejectReason }}
			</view>
		</view>
		<image class="blog-cover" :src="coverSrc" mode="aspectFill" v-if="blog.cover" lazy-load />
	</view>
</template>

<script setup>
	import { computed } from 'vue'
	import { absUrl, thumbUrl, parseTags } from '../../utils/format.js'

	const props = defineProps({
		blog: { type: Object, required: true },
		index: { type: Number, default: 0 },
		showStatus: { type: Boolean, default: false }
	})

	const emit = defineEmits(['click', 'author'])

	const tags = computed(() => parseTags(props.blog.tags))
	const coverSrc = computed(() => thumbUrl(props.blog.cover))
	const statusText = computed(() => {
		if (!props.showStatus) return ''
		return ({ DRAFT: '草稿', PENDING: '待审核', REJECTED: '已驳回' })[props.blog.status] || ''
	})
	const privateTag = computed(() => props.showStatus && props.blog.visibility === 'PRIVATE' ? '私人' : '')
</script>

<style>
	.blog-card {
		display: flex;
		justify-content: space-between;
		gap: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		transition: transform 0.15s;
	}

	.blog-card:active {
		transform: scale(0.985);
	}

	/* 马卡龙三色交替 */
	.blog-card.macaron-0 {
		background: rgba(255, 255, 255, 0.82);
	}

	.blog-card.macaron-1 {
		background: rgba(255, 240, 248, 0.88);
	}

	.blog-card.macaron-2 {
		background: rgba(233, 250, 243, 0.88);
	}

	.blog-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.blog-title {
		font-size: 30rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.mini-tag {
		display: inline-block;
		vertical-align: middle;
		padding: 0 12rpx;
		border-radius: 8rpx;
		font-size: 20rpx;
		margin-right: 8rpx;
		line-height: 1.7;
		font-weight: normal;
	}

	.top-tag {
		background: linear-gradient(135deg, #ff9ecf, #e8619c);
		color: #ffffff;
	}

	.pv-tag {
		background: #e0f2fe;
		color: #0284c7;
	}

	.st-DRAFT {
		background: #f1f5f9;
		color: #64748b;
	}

	.st-PENDING {
		background: #fef9c3;
		color: #ca8a04;
	}

	.st-REJECTED {
		background: #fee2e2;
		color: #dc2626;
	}

	.blog-descr {
		font-size: 25rpx;
		color: #8d82a3;
		line-height: 1.5;
	}

	.blog-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
	}

	.author {
		display: flex;
		align-items: center;
		gap: 10rpx;
		min-width: 0;
		flex-shrink: 1;
		overflow: hidden;
	}

	.avatar {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		flex-shrink: 0;
		font-size: 24rpx;
	}

	.author-name {
		font-size: 24rpx;
		color: var(--purple);
		max-width: 180rpx;
	}

	.meta-nums {
		display: flex;
		gap: 16rpx;
		flex-shrink: 0;
	}

	.meta-item {
		font-size: 22rpx;
		color: var(--text-sub);
	}

	.tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.reject-line {
		font-size: 22rpx;
		color: #dc2626;
		background: rgba(254, 226, 226, 0.7);
		border-radius: 10rpx;
		padding: 8rpx 14rpx;
	}

	.blog-cover {
		width: 200rpx;
		height: 140rpx;
		border-radius: 14rpx;
		flex-shrink: 0;
		background: #f1e9fb;
	}
</style>
