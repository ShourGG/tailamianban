#!/bin/bash
# 自动生成的类型清理脚本
# 执行前请备份您的代码！

echo "🛠️ TypeScript 类型清理工具"
echo "=========================="

echo "🗑️ 清理未使用的类型定义..."

echo "  - ObjectValues in src\lib\utils.ts:23"
echo "  - Window in src\plugins\highlight.ts:212"
echo "  - ComponentCustomProperties in src\types\auto-imports.d.ts:123"
echo "  - GraphEvents in src\types\antv.d.ts:171"
echo "  - LayoutOptions in src\types\antv.d.ts:181"
echo "  - ThemeConfig in src\types\antv.d.ts:190"
echo "  - ExportOptions in src\types\antv.d.ts:213"
echo "  - GraphConfig in src\types\antv.d.ts:310"
echo "  - GlobalComponents in src\types\components.d.ts:10"
echo "  - ImportMeta in src\types\env.d.ts:25"
echo "  - AppConfig in src\types\global.d.ts:14"
echo "  - AppThemeConfig in src\types\global.d.ts:25"
echo "  - UploadEventPayload in src\types\modules\form.d.ts:328"
echo "  - LayoutComponent in src\types\modules\form.d.ts:382"
echo "  - FormRulesMap in src\types\modules\form.d.ts:394"
echo "  - FieldChangeCallback in src\types\modules\form.d.ts:399"
echo "  - AlignType in src\types\modules\form.d.ts:413"
echo "  - StepSize in src\types\modules\form.d.ts:418"
echo "  - TabsPlacement in src\types\modules\form.d.ts:423"
echo "  - MenuItemType in src\types\modules\menu.d.ts:21"

echo "🔗 处理重复的类型定义..."

echo "  - 合并重复类型: Props"
echo "  - 合并重复类型: Node"
echo "  - 合并重复类型: Emits"
echo "  - 合并重复类型: DraggableItem"
echo "  - 合并重复类型: DragEvent"
echo "  - 合并重复类型: GroupOptions"
echo "  - 合并重复类型: LayoutMode"
echo "  - 合并重复类型: CustomArea"
echo "  - 合并重复类型: TablePresetConfig"
echo "  - 合并重复类型: PermissionData"

echo "✅ 清理分析完成！"
echo "📋 请查看详细指南: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md"