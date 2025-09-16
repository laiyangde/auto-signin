#!/usr/bin/env node

/**
 * AnyRouter.top 自动签到脚本 - Node.js 版
 */

import dotenv from 'dotenv';

// 必须先加载环境变量，再导入其他模块
dotenv.config();

import AnyRouterChecker from './checkin.js';
import NotificationKit from './notify.js';

// 创建通知实例
const notify = new NotificationKit();

/**
 * 主函数
 */
async function main() {
	try {
		console.log('[系统] AnyRouter.top 多账号自动签到脚本启动 (Node.js 版)');
		console.log(`[时间] 执行时间: ${new Date().toLocaleString('zh-CN')}`);

		// 创建签到实例
		const checker = new AnyRouterChecker();

		// 执行签到
		const checkResult = await checker.run();

		if (!checkResult.success && checkResult.results.length === 0) {
			console.log('[失败] 无法加载账号配置，程序退出');
			process.exit(1);
		}

		// 构建通知内容
		const notificationContent = [];
		const results = checkResult.results;

		// 添加每个账号的结果
		for (const result of results) {
			const status = result.success ? '[成功]' : '[失败]';
			let accountResult = `${status} ${result.account}`;
			if (result.userInfo) {
				accountResult += `\n${result.userInfo}`;
			}
			if (result.error) {
				accountResult += ` - ${result.error.substring(0, 50)}...`;
			}
			notificationContent.push(accountResult);
		}

		// 构建统计信息
		const summary = [
			'[统计] 签到结果统计:',
			`[成功] 成功: ${checkResult.successCount}/${checkResult.totalCount}`,
			`[失败] 失败: ${checkResult.totalCount - checkResult.successCount}/${checkResult.totalCount}`
		];

		if (checkResult.successCount === checkResult.totalCount) {
			summary.push('[成功] 所有账号签到成功!');
		} else if (checkResult.successCount > 0) {
			summary.push('[警告] 部分账号签到成功');
		} else {
			summary.push('[错误] 所有账号签到失败');
		}

		const timeInfo = `[时间] 执行时间: ${new Date().toLocaleString('zh-CN')}`;

		// 组合完整的通知内容
		const fullNotifyContent = [
			timeInfo,
			'',
			...notificationContent,
			'',
			...summary
		].join('\n');

		console.log('\n' + fullNotifyContent);

		// 发送通知
		await notify.pushMessage('AnyRouter 签到结果', fullNotifyContent, 'text');

		// 设置退出码
		process.exit(checkResult.successCount > 0 ? 0 : 1);

	} catch (error) {
		console.error('[失败] 程序执行过程中发生错误:', error.message);
		console.error(error.stack);

		// 尝试发送错误通知
		try {
			await notify.pushMessage(
				'AnyRouter 签到错误',
				`签到过程中发生错误:\n${error.message}`,
				'text'
			);
		} catch (notifyError) {
			console.error('[失败] 发送错误通知失败:', notifyError.message);
		}

		process.exit(1);
	}
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
	console.error('[致命错误] 未捕获的异常:', error);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('[致命错误] 未处理的 Promise 拒绝:', reason);
	process.exit(1);
});

// 处理中断信号
process.on('SIGINT', () => {
	console.log('\n[警告] 程序被用户中断');
	process.exit(1);
});

// 运行主函数
main();