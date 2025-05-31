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
echo "  - Config in src\types\global.d.ts:17"
echo "  - ThemeConfig in src\types\global.d.ts:26"
echo "  - Size in src\types\global.d.ts:37"
echo "  - Status in src\types\global.d.ts:40"
echo "  - Variant in src\types\global.d.ts:43"
echo "  - BaseProps in src\types\global.d.ts:46"
echo "  - Optional in src\types\global.d.ts:58"
echo "  - RequiredKeys in src\types\global.d.ts:61"
echo "  - ValueOf in src\types\global.d.ts:74"
echo "  - KeyOf in src\types\global.d.ts:77"
echo "  - RecordType in src\types\global.d.ts:80"
echo "  - Fn in src\types\global.d.ts:86"
echo "  - AsyncFn in src\types\global.d.ts:89"
echo "  - Nullable in src\types\global.d.ts:92"
echo "  - Undefinable in src\types\global.d.ts:95"
echo "  - Maybe in src\types\global.d.ts:98"

echo "🔗 处理重复的类型定义..."

echo "  - 合并重复类型: Props"
echo "  - 合并重复类型: Emits"
echo "  - 合并重复类型: FormOption"
echo "  - 合并重复类型: LayoutConfig"
echo "  - 合并重复类型: GroupConfig"
echo "  - 合并重复类型: GroupWithItems"
echo "  - 合并重复类型: GlobalThemeOverrides"
echo "  - 合并重复类型: ThemeMode"
echo "  - 合并重复类型: GlobalComponents"
echo "  - 合并重复类型: LayoutType"

echo "✅ 清理分析完成！"
echo "📋 请查看详细指南: scripts/_look-file_/TYPE_CLEANUP_GUIDE.md"