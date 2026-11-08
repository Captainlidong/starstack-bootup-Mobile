<template>
	<view class="page edit-page">
		<glass-navbar :title="blogId ? '编辑博客' : '写博客'">
			<template #right>
				<text class="pub-act" v-if="!isAdmin" @click="submit('PENDING')">发布</text>
			</template>
		</glass-navbar>

		<!-- 未登录/管理员引导 -->
		<guide-card v-if="!isLogin()" emoji="✍️" text="写博客需要先登录哦~ 登录后即可创作并提交审核" buttonText="去登录"
			@action="goLogin" />
		<guide-card v-else-if="isAdmin" emoji="🛠️" text="管理员请在网页端后台发表与管理博客" buttonText="回首页"
			@action="goHome" />

		<view class="edit-body" v-else>
			<!-- 标题/简介 -->
			<view class="card edit-card">
				<input class="title-input" v-model="form.title" :maxlength="100" placeholder="输入文章标题(必填)"
					placeholder-class="ph" />
				<textarea class="descr-input" v-model="form.descr" :maxlength="200" auto-height
					placeholder="简介:一句话介绍这篇文章,会显示在列表卡片上" placeholder-class="ph" />
			</view>

			<!-- 封面 -->
			<view class="card edit-card cover-card">
				<view class="row-label">🖼️ 封面图</view>
				<view class="cover-row">
					<image class="cover-preview" :src="absUrl(form.cover)" mode="aspectFill" v-if="form.cover"
						@click="chooseCover" />
					<view class="cover-add" v-else @click="chooseCover">
						<text class="cover-add-icon">＋</text>
						<text class="cover-add-text">上传封面</text>
					</view>
					<view class="cover-remove" v-if="form.cover" @click="form.cover = ''">移除</view>
				</view>
			</view>

			<!-- 分类 -->
			<view class="card edit-card">
				<view class="row-label">📁 分类(必选)</view>
				<view class="chip-wrap">
					<view class="chip" :class="{ active: form.categoryId === c.id }" v-for="c in store.categories"
						:key="c.id" @click="form.categoryId = c.id">{{ c.name }}</view>
				</view>
			</view>

			<!-- 标签 -->
			<view class="card edit-card">
				<view class="row-label">🏷️ 标签(可多选)</view>
				<view class="chip-wrap">
					<view class="chip" :class="{ active: tagSet.has(t) }" v-for="t in allTags" :key="t"
						@click="toggleTag(t)">{{ t }}</view>
				</view>
				<view class="custom-tag-row">
					<input class="custom-tag-input" v-model="customTag" placeholder="自定义标签" placeholder-class="ph"
						:maxlength="12" confirm-type="done" @confirm="addCustomTag" />
					<view class="chip add-chip" @click="addCustomTag">＋ 添加</view>
				</view>
			</view>

			<!-- 可见性 -->
			<view class="card edit-card vis-card">
				<view class="row-label">👁️ 可见性</view>
				<view class="vis-row">
					<view class="chip" :class="{ active: form.visibility === 'PUBLIC' }"
						@click="form.visibility = 'PUBLIC'">🌐 公开</view>
					<view class="chip" :class="{ active: form.visibility === 'PRIVATE' }"
						@click="form.visibility = 'PRIVATE'">🔒 仅自己可见</view>
				</view>
			</view>

			<!-- 正文编辑器 -->
			<view class="card edit-card editor-card">
				<view class="row-label">📝 正文</view>
				<view class="toolbar">
					<scroll-view scroll-x :show-scrollbar="false" class="toolbar-scroll">
						<view class="toolbar-row">
							<text class="tb-btn" @click="format('bold')">B</text>
							<text class="tb-btn italic" @click="format('italic')">I</text>
							<text class="tb-btn underline" @click="format('underline')">U</text>
							<text class="tb-btn" @click="format('header', 'H2')">H2</text>
							<text class="tb-btn" @click="format('header', 'H3')">H3</text>
							<text class="tb-btn" @click="format('list', 'unordered')">•≡</text>
							<text class="tb-btn" @click="format('list', 'ordered')">1≡</text>
							<text class="tb-btn" @click="format('blockquote')">❝</text>
							<text class="tb-btn" @click="format('code-block')">{ }</text>
							<text class="tb-btn" @click="insertDivider">—</text>
							<text class="tb-btn" @click="chooseContentImage">🖼️</text>
							<text class="tb-btn" @click="undo">↩</text>
						</view>
					</scroll-view>
				</view>
				<editor id="editor" class="content-editor" :placeholder="'开始创作吧,支持图文排版~'" @ready="onEditorReady"
					@input="onEditorInput" />
			</view>

			<!-- 提交按钮 -->
			<view class="submit-row">
				<view class="pill-btn mint submit-half" @click="submit('DRAFT')">存草稿</view>
				<view class="pill-btn submit-half" @click="submit('PENDING')">提交审核</view>
			</view>
			<view class="audit-tip">💡 发布需管理员审核通过后展示;草稿保存在「我的-草稿箱」</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { selectById, addBlog, updateBlog, selectAllCategories } from '../../api/blog.js'
	import { uploadFile, uploadEditorImage } from '../../api/file.js'
	import { absUrl } from '../../utils/format.js'
	import { store, isLogin } from '../../utils/store.js'

	const PRESET_TAGS = ['后端', 'Java', '面试', 'Vue', '前端', '大数据', '算法', '程序员', '小白', 'AI', 'Agent', '数据库', '开发工具', '移动开发', 'AIGC', '前沿科技', '职场经验']

	const blogId = ref('')
	const editorCtx = ref(null)
	const customTag = ref('')
	const submitting = ref(false)

	const form = reactive({
		id: '',
		title: '',
		descr: '',
		cover: '',
		categoryId: '',
		tags: [], // 字符串数组
		visibility: 'PUBLIC',
		content: ''
	})

	const initialHtml = ref('')

	const isAdmin = computed(() => isLogin() && store.user.role === 'ADMIN')
	const tagSet = computed(() => new Set(form.tags))
	const allTags = computed(() => {
		// 自定义过的标签保持在最前
		const custom = form.tags.filter(t => !PRESET_TAGS.includes(t))
		return [...custom, ...PRESET_TAGS]
	})

	// 加载分类
	if (!store.categories.length) {
		selectAllCategories().then(list => {
			store.categories = list || []
		}).catch(() => { /* 忽略 */ })
	}

	onLoad((q) => {
		if (q.blogId) {
			blogId.value = q.blogId
			loadBlog(q.blogId)
		}
	})

	function loadBlog(id) {
		selectById(id).then(data => {
			if (!data) return
			form.id = data.id
			form.title = data.title
			form.descr = data.descr
			form.cover = data.cover
			form.categoryId = data.categoryId
			form.visibility = data.visibility || 'PUBLIC'
			form.content = data.content
			initialHtml.value = data.content
			try {
				const arr = JSON.parse(data.tags)
				if (Array.isArray(arr)) form.tags = arr.filter(Boolean)
			} catch (e) { /* 兼容非 JSON */ }
			// 编辑器可能已就绪
			if (editorCtx.value) {
				editorCtx.value.setContents({ html: initialHtml.value })
			}
		})
	}

	function onEditorReady() {
		uni.createSelectorQuery()
			.select('#editor')
			.context(res => {
				if (res && res.context) {
					editorCtx.value = res.context
					if (initialHtml.value) {
						editorCtx.value.setContents({ html: initialHtml.value })
					}
				}
			})
			.exec()
	}

	function onEditorInput(e) {
		form.content = e.detail.html
	}

	function format(name, value) {
		if (!editorCtx.value) return
		editorCtx.value.format(name, value)
	}

	function insertDivider() {
		if (editorCtx.value) editorCtx.value.insertDivider()
	}

	function undo() {
		if (editorCtx.value) editorCtx.value.undo()
	}

	function chooseCover() {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				const path = res.tempFilePaths && res.tempFilePaths[0]
				if (!path) return
				uni.showLoading({ title: '上传中…' })
				uploadFile(path).then(url => {
					form.cover = url
				}).finally(() => uni.hideLoading())
			}
		})
	}

	function chooseContentImage() {
		if (!editorCtx.value) return
		uni.chooseImage({
			count: 1,
			success: (res) => {
				const path = res.tempFilePaths && res.tempFilePaths[0]
				if (!path) return
				uni.showLoading({ title: '上传中…' })
				uploadEditorImage(path).then(url => {
					editorCtx.value.insertImage({ src: url, width: '100%' })
				}).finally(() => uni.hideLoading())
			}
		})
	}

	function toggleTag(t) {
		const i = form.tags.indexOf(t)
		if (i > -1) form.tags.splice(i, 1)
		else form.tags.push(t)
	}

	function addCustomTag() {
		const t = customTag.value.trim()
		if (!t) return
		if (!tagSet.value.has(t)) form.tags.push(t)
		customTag.value = ''
	}

	function goLogin() {
		uni.navigateTo({ url: '/pages/login/login' })
	}

	function goHome() {
		uni.switchTab({ url: '/pages/home/home' })
	}

	function submit(status) {
		if (submitting.value) return
		if (!form.title.trim()) {
			uni.showToast({ title: '请输入标题', icon: 'none' })
			return
		}
		if (!form.categoryId) {
			uni.showToast({ title: '请选择分类', icon: 'none' })
			return
		}
		const doSubmit = (html) => {
			const content = (html || '').trim()
			if (!content || content === '<p><br></p>') {
				uni.showToast({ title: '请输入正文内容', icon: 'none' })
				return
			}
			submitting.value = true
			const payload = {
				id: form.id || undefined,
				title: form.title.trim(),
				descr: form.descr.trim(),
				cover: form.cover,
				categoryId: form.categoryId,
				tags: JSON.stringify(form.tags),
				visibility: form.visibility,
				content,
				status
			}
			const req = form.id ? updateBlog(payload) : addBlog(payload)
			req.then(() => {
				uni.showToast({ title: status === 'DRAFT' ? '已保存草稿 📋' : '已提交审核 ✨', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 800)
			}).catch(() => { /* 错误已提示 */ }).finally(() => {
				submitting.value = false
			})
		}
		// 从编辑器取最新 HTML
		if (editorCtx.value) {
			editorCtx.value.getContents({
				success: (res) => doSubmit(res.html),
				fail: () => doSubmit(form.content)
			})
		} else {
			doSubmit(form.content)
		}
	}
</script>

<style>
	.edit-page {
		min-height: 100vh;
	}

	.pub-act {
		color: #ffffff;
		font-size: 28rpx;
		font-weight: bold;
		padding: 8rpx 26rpx;
		background: rgba(255, 255, 255, 0.25);
		border-radius: 999rpx;
		border: 1.5px solid rgba(255, 255, 255, 0.6);
	}

	.edit-body {
		padding: 20rpx 24rpx 60rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.edit-card {
		padding: 26rpx 28rpx;
		display: flex;
		flex-direction: column;
		gap: 18rpx;
	}

	.title-input {
		width: 100%;
		height: 100rpx;
		box-sizing: border-box;
		font-size: 36rpx;
		font-weight: bold;
		color: var(--title-c);
		padding: 0;
		border-bottom: 1.5px dashed rgba(183, 156, 255, 0.4);
	}

	.descr-input {
		width: 100%;
		font-size: 26rpx;
		color: var(--text-main);
		line-height: 1.6;
		min-height: 60rpx;
	}

	.row-label {
		font-size: 27rpx;
		font-weight: bold;
		color: var(--title-c);
	}

	.cover-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.cover-preview {
		width: 320rpx;
		height: 190rpx;
		border-radius: 16rpx;
		background: #f1e9fb;
	}

	.cover-add {
		width: 320rpx;
		height: 190rpx;
		border: 2.5px dashed rgba(183, 156, 255, 0.5);
		border-radius: 16rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		background: rgba(243, 232, 255, 0.4);
	}

	.cover-add-icon {
		font-size: 60rpx;
		color: var(--purple-light);
		line-height: 1;
	}

	.cover-add-text {
		font-size: 24rpx;
		color: var(--text-sub);
	}

	.cover-remove {
		padding: 10rpx 24rpx;
		background: rgba(254, 226, 226, 0.8);
		color: #dc2626;
		border-radius: 999rpx;
		font-size: 23rpx;
	}

	.chip-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 14rpx;
	}

	.chip {
		padding: 10rpx 26rpx;
		background: rgba(255, 255, 255, 0.85);
		border: 1.5px solid rgba(183, 156, 255, 0.35);
		border-radius: 999rpx;
		font-size: 24rpx;
		color: var(--title-c);
		transition: all 0.15s;
	}

	.chip.active {
		background: var(--brand-grad);
		color: #ffffff;
		border-color: transparent;
		font-weight: bold;
		box-shadow: 0 6rpx 14rpx rgba(183, 156, 255, 0.4);
	}

	.custom-tag-row {
		display: flex;
		align-items: center;
		gap: 14rpx;
		margin-top: 6rpx;
	}

	.custom-tag-input {
		flex: 1;
		height: 72rpx;
		box-sizing: border-box;
		background: rgba(255, 255, 255, 0.85);
		border: 1.5px solid rgba(183, 156, 255, 0.35);
		border-radius: 999rpx;
		padding: 0 26rpx;
		font-size: 25rpx;
	}

	.add-chip {
		flex-shrink: 0;
	}

	.vis-row {
		display: flex;
		gap: 16rpx;
	}

	.vis-card {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.editor-card {
		gap: 14rpx;
	}

	.toolbar {
		background: rgba(243, 232, 255, 0.55);
		border-radius: 14rpx;
		padding: 8rpx;
		width: 100%;
		white-space: nowrap;
	}

	.toolbar-scroll {
		width: 100%;
		white-space: nowrap;
	}

	.toolbar-row {
		display: inline-flex;
		gap: 10rpx;
		padding: 4rpx 6rpx;
	}

	.tb-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 64rpx;
		height: 64rpx;
		padding: 0 14rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 12rpx;
		font-size: 27rpx;
		font-weight: bold;
		color: var(--title-c);
		box-sizing: border-box;
	}

	.tb-btn:active {
		background: var(--brand-grad);
		color: #ffffff;
	}

	.tb-btn.italic {
		font-style: italic;
	}

	.tb-btn.underline {
		text-decoration: underline;
	}

	.content-editor {
		width: 100%;
		height: 600rpx;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 14rpx;
		padding: 20rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.submit-row {
		display: flex;
		gap: 20rpx;
		margin-top: 10rpx;
	}

	.submit-half {
		flex: 1;
	}

	.audit-tip {
		text-align: center;
		font-size: 22rpx;
		color: var(--text-sub);
		padding-bottom: 20rpx;
	}
</style>
