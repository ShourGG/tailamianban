#!/bin/bash
# 自动生成的类型清理脚本
# 执行前请备份您的代码！

echo "🛠️ TypeScript 类型清理工具"
echo "=========================="

echo "🗑️ 清理未使用的类型定义..."

echo "  - ObjectValues in src\lib\utils.ts:14"
echo "  - GlobalComponents in src\types\components.d.ts:10"
echo "  - ComponentCustomProperties in src\types\auto-imports.d.ts:116"
echo "  - ImportMeta in src\types\env.d.ts:25"
echo "  - AppConfig in src\types\global.d.ts:14"
echo "  - AppThemeConfig in src\types\global.d.ts:25"
echo "  - UploadEventPayload in src\types\modules\form.d.ts:321"
echo "  - LayoutComponent in src\types\modules\form.d.ts:375"
echo "  - FormRulesMap in src\types\modules\form.d.ts:387"
echo "  - FieldChangeCallback in src\types\modules\form.d.ts:392"
echo "  - AlignType in src\types\modules\form.d.ts:406"
echo "  - StepSize in src\types\modules\form.d.ts:411"
echo "  - TabsPlacement in src\types\modules\form.d.ts:416"
echo "  - MenuItemType in src\types\modules\menu.d.ts:21"
echo "  - MenuTag in src\types\modules\menu.d.ts:109"
echo "  - NAlertSlots in src\types\modules\plugin.d.ts:23"
echo "  - Theme in src\types\unocss.d.ts:15"
echo "  - UserShortcuts in src\types\unocss.d.ts:24"

echo "🔗 处理重复的类型定义..."

echo "  - 合并重复类型: Props"
echo "  - 合并重复类型: Emits"
echo "  - 合并重复类型: GroupConfig"
echo "  - 合并重复类型: GroupWithItems"
echo "  - 合并重复类型: RenderState"
echo "  - 合并重复类型: BadgeType"
echo "  - 合并重复类型: StepWithItems"
echo "  - 合并重复类型: TabConfig"
echo "  - 合并重复类型: TabWithItems"
echo "  - 合并重复类型: TabsLayoutConfig"

echo "✅ 清理分析完成！"
echo "📋 请查看详细指南: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md"