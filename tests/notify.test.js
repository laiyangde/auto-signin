/**
 * 通知模块测试
 */

import { jest } from '@jest/globals';
import axios from 'axios';
import nodemailer from 'nodemailer';

// Mock 外部依赖
jest.mock('axios');
jest.mock('nodemailer');

describe('NotificationKit', () => {
	let NotificationKit;
	let notify;

	beforeEach(async () => {
		// 清除环境变量
		delete process.env.EMAIL_USER;
		delete process.env.EMAIL_PASS;
		delete process.env.EMAIL_TO;
		delete process.env.PUSHPLUS_TOKEN;
		delete process.env.SERVERPUSHKEY;
		delete process.env.DINGDING_WEBHOOK;
		delete process.env.FEISHU_WEBHOOK;
		delete process.env.WEIXIN_WEBHOOK;

		// 重新导入模块以获取干净的实例
		jest.resetModules();
		const module = await import('../src/notify.js');
		notify = module.default;
	});

	describe('邮件通知', () => {
		test('应该在配置缺失时抛出错误', async () => {
			await expect(notify.sendEmail('测试', '内容')).rejects.toThrow('邮箱配置未设置');
		});

		test('应该成功发送邮件', async () => {
			// 设置环境变量
			process.env.EMAIL_USER = 'test@example.com';
			process.env.EMAIL_PASS = 'password';
			process.env.EMAIL_TO = 'recipient@example.com';

			// 重新创建实例
			jest.resetModules();
			const module = await import('../src/notify.js');
			const notifyWithEmail = module.default;

			// Mock nodemailer
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
			const mockTransporter = {
				sendMail: mockSendMail
			};
			nodemailer.createTransport.mockReturnValue(mockTransporter);

			await notifyWithEmail.sendEmail('测试标题', '测试内容');

			expect(nodemailer.createTransport).toHaveBeenCalled();
			expect(mockSendMail).toHaveBeenCalledWith(
				expect.objectContaining({
					subject: '测试标题',
					text: '测试内容'
				})
			);
		});
	});

	describe('钉钉通知', () => {
		test('应该在未配置时抛出错误', async () => {
			await expect(notify.sendDingtalk('测试', '内容')).rejects.toThrow('钉钉 Webhook 未配置');
		});

		test('应该成功发送钉钉消息', async () => {
			process.env.DINGDING_WEBHOOK = 'https://oapi.dingtalk.com/robot/send?access_token=test';

			// 重新创建实例
			jest.resetModules();
			const module = await import('../src/notify.js');
			const notifyWithDingding = module.default;

			// Mock axios
			axios.post.mockResolvedValue({ data: { errcode: 0 } });

			await notifyWithDingding.sendDingtalk('测试标题', '测试内容');

			expect(axios.post).toHaveBeenCalledWith(
				'https://oapi.dingtalk.com/robot/send?access_token=test',
				{
					msgtype: 'text',
					text: { content: '测试标题\n测试内容' }
				},
				{ timeout: 30000 }
			);
		});
	});

	describe('飞书通知', () => {
		test('应该在未配置时抛出错误', async () => {
			await expect(notify.sendFeishu('测试', '内容')).rejects.toThrow('飞书 Webhook 未配置');
		});

		test('应该成功发送飞书消息', async () => {
			process.env.FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/test';

			// 重新创建实例
			jest.resetModules();
			const module = await import('../src/notify.js');
			const notifyWithFeishu = module.default;

			// Mock axios
			axios.post.mockResolvedValue({ data: { code: 0 } });

			await notifyWithFeishu.sendFeishu('测试标题', '测试内容');

			expect(axios.post).toHaveBeenCalledWith(
				'https://open.feishu.cn/open-apis/bot/v2/hook/test',
				expect.objectContaining({
					msg_type: 'interactive',
					card: expect.objectContaining({
						header: expect.objectContaining({
							title: expect.objectContaining({
								content: '测试标题'
							})
						})
					})
				}),
				{ timeout: 30000 }
			);
		});
	});

	describe('批量推送', () => {
		test('应该跳过未配置的通知方式', async () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			await notify.pushMessage('测试', '内容');

			// 不应该有成功的消息
			expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('推送成功'));

			consoleSpy.mockRestore();
		});

		test('应该发送所有配置的通知', async () => {
			// 配置所有通知方式
			process.env.EMAIL_USER = 'test@example.com';
			process.env.EMAIL_PASS = 'password';
			process.env.EMAIL_TO = 'recipient@example.com';
			process.env.DINGDING_WEBHOOK = 'https://dingtalk.webhook';
			process.env.FEISHU_WEBHOOK = 'https://feishu.webhook';

			// 重新创建实例
			jest.resetModules();
			const module = await import('../src/notify.js');
			const notifyAll = module.default;

			// Mock 所有发送方法
			const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
			nodemailer.createTransport.mockReturnValue({
				sendMail: mockSendMail
			});
			axios.post.mockResolvedValue({ data: { success: true } });

			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

			await notifyAll.pushMessage('测试标题', '测试内容');

			// 检查邮件发送
			expect(mockSendMail).toHaveBeenCalled();

			// 检查 axios 调用（钉钉和飞书）
			expect(axios.post).toHaveBeenCalledTimes(2);

			// 检查成功日志
			expect(consoleSpy).toHaveBeenCalledWith('[邮件]: 消息推送成功!');
			expect(consoleSpy).toHaveBeenCalledWith('[钉钉]: 消息推送成功!');
			expect(consoleSpy).toHaveBeenCalledWith('[飞书]: 消息推送成功!');

			consoleSpy.mockRestore();
		});
	});
});