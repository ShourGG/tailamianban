// scripts/smart-type-manager.js
import { SmartTypeManager } from './smart-type-tools.js';

/**
 * 主执行函数
 */
const main = async () => {
  try {
    const manager = new SmartTypeManager({
      rootDir: process.cwd()
    });

    const result = await manager.run();

    if (result.success && result.report) {
      const score = result.report.summary.healthScore;
      const exitCode = score >= 80 ? 0 : 1;

      if (exitCode !== 0) {
        console.log(`\n⚠️ 类型系统健康分数 (${score}/100) 低于阈值，建议改进`);
      }

      process.exit(exitCode);
    } else {
      console.error(`\n❌ 分析失败: ${result.error || '未知错误'}`);
      process.exit(1);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n💥 执行过程中发生错误: ${errorMessage}`);
    process.exit(1);
  }
};

main();
