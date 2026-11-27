# Bloom 第三期剩余功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在既有成就判定与照片压缩基础上，交付第三期徽章展示、完整心情流程和照片备份联动。

**Architecture:** 领域层负责限制和纯计算，仓储/服务负责事务与文件，features 只编排服务，沿用全局弹层队列。徽章和心情数据可以独立实现；主线程完成所有共享页面、导航与跨功能集成。

**Tech Stack:** Expo SDK 58、React Native 0.88、TypeScript、react-native-svg、Reanimated 4.7.1、Gesture Handler 3.3、SQLite、Jest。

设计：[2026-11-25-phase-3-remaining-design.md](../specs/2026-11-25-phase-3-remaining-design.md)
约束：全中文界面；中文文件头和导出 JSDoc；文案集中；所有图标 SVG；主题 token；先失败测试后实现。

---

### Task 1: 徽章视觉引擎

**Files:**
- Create: `src/ui/badges/tokens.ts`、`src/ui/badges/BadgeBase.tsx`、`src/ui/badges/BadgeMotif.tsx`、`src/ui/badges/BadgeDigits.tsx`、`src/ui/badges/Badge.tsx`
- Modify: `src/ui/badges/index.ts`
- Test: `tests/ui/badgeVisuals.test.ts`

- [ ] 写失败测试：72 枚均有唯一非空图案；12 底座、4 配色、0–9 路径完整；神秘未获得不出现真实图案。
- [ ] 运行 `npm test -- --runInBand tests/ui/badgeVisuals.test.ts`，确认因实现缺失失败。
- [ ] 实现 200×200 组合式 SVG 和 `Badge({id,size,mode,locked,hidden})`，以路径数字和每枚图案表达内容。
- [ ] 静态无循环，idle 仅在前台轻微光芒/星星，celebrate 弹入；减弱动态只淡入淡出。
- [ ] 重跑定向测试、`npm run typecheck`、`npm run lint`。

### Task 2: 心情领域、仓储与服务

**Files:**
- Create: `src/domain/mood/edit.ts`、`src/data/repositories/moodRepo.ts`、`src/services/moodService.ts`
- Modify: `src/domain/mood/index.ts`、`src/stores/prefsStore.ts`（仅已有 KV 接口不足时）
- Test: `tests/domain/moodEdit.test.ts`

- [ ] 写失败测试：Unicode 500 字截断与提示、空内容不可保存、5 张上限、同一天同一项目键、当天心情空项目键、放弃清草稿。
- [ ] 运行 `npm test -- --runInBand tests/domain/moodEdit.test.ts` 并确认缺失实现失败。
- [ ] 实现领域纯函数、唯一 UPSERT、照片替换事务、按日期/项目查询和照片筛选。
- [ ] 服务保存后发出 `moodChanged`，删除保留历史徽章并清除孤立文件，撤销/项目删除不级联删除心情。
- [ ] 草稿复用 KV，保存或明确放弃才清除，后台与 2 秒自动保存由编辑器调用。

### Task 3: 带照片的备份

**Files:**
- Modify: `src/platform/files.ts`、`src/services/backupService.ts`
- Create: `src/data/backup/media.ts`
- Test: `tests/data/backupMedia.test.ts`

- [ ] 写失败测试：白名单拒绝 `../` 和绝对路径；ZIP 原图/缩略图条目；导入哈希不一致拒绝；缺失文件明确报错。
- [ ] 运行 `npm test -- --runInBand tests/data/backupMedia.test.ts`。
- [ ] 导出 media/mood 原图和缩略图，读取 preview.achievements。
- [ ] 恢复先校验全部照片，再写新目录，DB 成功后替换旧媒体，失败不删除旧文件。
- [ ] 运行备份与迁移全套测试。

### Task 4: 成就馆、弹窗与详情

**Files:**
- Create: `src/features/achievement/AchievementPresenter.tsx`、`AchievementGallery.tsx`、`BadgeDetailSheet.tsx`、`UnlockCelebration.tsx`
- Modify: `src/app/(tabs)/achievements.tsx`、`src/app/(tabs)/_layout.tsx`、`src/app/_layout.tsx`、`src/ui/components/TabBar.tsx`
- Create: `src/app/dev/badges.tsx`、`src/copy/phase3.ts`
- Test: `tests/domain/achievementPresentation.test.ts`

- [ ] 写失败测试：补发/普通展示路由、隐藏未获得文案、未看状态在收下后清除。
- [ ] 接入 `achievementService.onUnlocked`，重启读取 unseen，完美日和毕业典礼优先。
- [ ] 成就馆三列、筛选、花藤、最近获得与新圆点；详情同系列切换和进度。
- [ ] 弹窗进度点、一次收下、跳馆定位、Android 返回、减弱动态。
- [ ] 开发陈列 72 枚 × static/idle/celebrate。

### Task 5: 心情编辑、手账和详情

**Files:**
- Create: `src/features/mood/MoodFace.tsx`、`MoodEditor.tsx`、`MoodJournal.tsx`、`MoodDetail.tsx`、`PhotoViewer.tsx`、`MoodDraft.ts`
- Create: `src/app/mood/editor.tsx`、`src/app/mood/index.tsx`、`src/app/mood/[id].tsx`
- Modify: `src/app/_layout.tsx`、`src/app/(tabs)/me.tsx`、`src/copy/phase3.ts`
- Test: `tests/domain/moodEdit.test.ts`

- [ ] 完成五种 SVG 表情 M30、500 字输入、照片处理中/失败/删除/排序。
- [ ] 离开确认；保存返回 toast；已有心情编辑/删除。
- [ ] 手账月份吸顶、照片筛选、便签旋转、空状态；详情响应式照片网格。
- [ ] 图片查看切换、索引、缩放和下滑关闭。

### Task 6: 入口、跨页面联动与验证

**Files:**
- Modify: `src/app/(tabs)/index.tsx`、`src/features/today/TodayCard.tsx`、`src/features/today/PerfectDay.tsx`、`src/app/history.tsx`、`src/app/project/[id]/review.tsx`、`src/features/stats/StatsView.tsx`、`src/app/settings/import.tsx`、`src/services/queries.ts`
- Test: `tests/domain/phase3Integration.test.ts`

- [ ] 先写入口纯规则失败测试：未完成且无心情不显示；未来不显示；已完成或已有心情显示。
- [ ] 接项目卡片/菜单、列表标题、完美日、历史迷你表情、回顾节点、年度徽章数、备份预览。
- [ ] 运行 `npm run check` 全量校验。
- [ ] 启动可用开发环境核查关键路由；报告无法覆盖的真机、权限和 fps 验证。

**不自动提交。** 用户仅要求继续实现，没有授权 commit/push。