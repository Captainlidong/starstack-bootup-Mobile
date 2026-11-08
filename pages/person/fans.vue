<template>
	<view class="page pfans-page">
		<glass-navbar :title="tab === 'fans' ? '🙌 我的粉丝' : '🌟 我的关注'" />

		<guide-card v-if="!isLogin()" emoji="🎈" text="登录后可以查看你的粉丝与关注列表~" buttonText="去登录"
			@action="goLogin" />

		<template v-else>
			<view class="pfans-list">
				<user-row v-for="u in list" :key="u.id" :user="u" @click="goSpace(u.id)" />
				<empty-state v-if="!loading && !list.length" :emoji="tab === 'fans' ? '🛸' : '🔭'"
					:text="tab === 'fans' ? '还没有粉丝~ 多发表优质文章涨涨人气吧' : '还没有关注别人~ 去首页逛逛发现感兴趣的博主吧'" />
				<view class="load-more" v-if="list.length">{{ finished ? '— 到底啦 🌈 —' : (loading ? '加载中…' : '上拉加载更多') }}</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { spaceFans, spaceFollowing } from '../../api/space.js'
	import { isLogin, isSelf, store } from '../../utils/store.js'

	const tab = ref('fans') // fans | following
	const userId = ref('')
	const list = ref([])
	const pageNum = ref(0)
	const PAGE_SIZE = 10
	const loading = ref(false)
	const finished = ref(false)

	onLoad((q) => {
		tab.value = q.tab === 'following' ? 'following' : 'fans'
		userId.value = q.userId || (store.user && store.user.id) || ''
		loadMore()
	})

	async function loadMore() {
		if (!isLogin() || !userId.value || loading.value || finished.value) return
		loading.value = true
		try {
			const page = tab.value === 'fans'
				? await spaceFans(userId.value, { pageNum: pageNum.value + 1, pageSize: PAGE_SIZE })
				: await spaceFollowing(userId.value, { pageNum: pageNum.value + 1, pageSize: PAGE_SIZE })
			const rows = (page && page.list) || page || []
			list.value = list.value.concat(rows)
			pageNum.value += 1
			if (!Array.isArray(rows) || rows.length < PAGE_SIZE) finished.value = true
		} catch (e) { /* 忽略 */ } finally {
			loading.value = false
		}
	}

	onReachBottom(loadMore)

	function goSpace(id) {
		if (isSelf(id)) {
			uni.switchTab({ url: '/pages/mine/mine' })
		} else {
			uni.navigateTo({ url: '/pages/space/space?userId=' + id })
		}
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}
</script>

<style>
	.pfans-page {
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.pfans-list {
		padding: 20rpx 24rpx 0;
	}
</style>
