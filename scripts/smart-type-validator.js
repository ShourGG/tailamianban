// scripts/smart-type-validator.js
import { SmartTypeValidator } from './smart-type-tools.js';

/**
 * 主执行函数
 */
const main = async () => {
  const args = process.argv.slice(2);

  try {
    const validator = new SmartTypeValidator({
      rootDir: process.cwd(),
      autoFix: args.includes('--auto-fix')
    });

    const result = await validator.validate();

    if (result.success && result.report) {
      const score = result.report.summary.validationScore;
      console.log(`\n🎉 类型验证通过！验证评分: ${score}/100`);

      const exitCode = score >= 70 ? 0 : 1;
      if (exitCode !== 0) {
        console.log(`\n⚠️ 验证评分 (${score}/100) 低于阈值，建议改进`);
      }

      process.exit(exitCode);
    } else {
      const errorCount = result.report ? result.report.summary.totalErrors : 0;
      const warningCount = result.report ? result.report.summary.totalWarnings : 0;

      console.log(`\n❌ 类型验证失败:`);
      console.log(`  • 错误: ${errorCount} 个`);
      console.log(`  • 警告: ${warningCount} 个`);

      if (result.error) {
        console.log(`  • 原因: ${result.error}`);
      }

      process.exit(1);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n💥 执行过程中发生错误: ${errorMessage}`);
    process.exit(1);
  }
};

main();
