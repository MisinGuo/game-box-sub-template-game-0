/**
 * AI 文章生成器 - GitHub Action 入口
 * 
 * 功能：
 * 1. 支持多个 AI 平台（OpenAI、Claude、通义千问、DeepSeek）
 * 2. 支持多种文章模板（游戏介绍、攻略、评测等）
 * 3. 支持图片搜索引擎和自定义图片池
 * 4. 支持单篇生成和批量生成
 * 5. 自动提交生成的文章到仓库
 * 6. 支持 Webhook 回调通知后端系统
 */

import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { AIProviderFactory } from './ai-providers';
import { TemplateEngine } from './template-engine';
import { ArticleGenerator } from './article-generator';
import { ImageService, ImageServiceConfig } from './image-service';

interface GenerationTask {
  gameName: string;
  category: string;
  template: string;
  outputPath?: string;
}

async function run(): Promise<void> {
  const startTime = Date.now();
  
  try {
    // ========== 读取 AI 配置 ==========
    const aiProvider = core.getInput('ai-provider', { required: true });
    const apiKey = core.getInput('api-key', { required: true });
    const model = core.getInput('model');
    const maxTokens = parseInt(core.getInput('max-tokens') || '4096');
    const temperature = parseFloat(core.getInput('temperature') || '0.7');

    // ========== 读取模板配置 ==========
    const template = core.getInput('template', { required: true });
    const templateUrl = core.getInput('template-url');

    // ========== 读取游戏配置 ==========
    const gameName = core.getInput('game-name', { required: true });
    const category = core.getInput('category');
    const variablesJson = core.getInput('variables') || '{}';
    const variables = JSON.parse(variablesJson);

    // ========== 读取输出配置 ==========
    const outputPath = core.getInput('output-path');

    // ========== 读取图片配置 ==========
    const imageConfig: ImageServiceConfig = {
      searchEnabled: core.getInput('image-search-enabled') === 'true',
      searchEngine: core.getInput('image-search-engine') || 'unsplash',
      searchApiKey: core.getInput('image-search-api-key'),
      poolUrl: core.getInput('image-pool-url'),
      poolJson: core.getInput('image-pool-json'),
      uploadEnabled: core.getInput('image-upload-enabled') === 'true',
      storageType: core.getInput('storage-type'),
      storageConfig: core.getInput('storage-config'),
      fallbackUrl: core.getInput('image-fallback-url')
    };

    // ========== 读取 Webhook 配置 ==========
    const webhookUrl = core.getInput('webhook-url');
    const webhookSecret = core.getInput('webhook-secret');

    core.info('🚀 AI 文章生成器启动');
    core.info(`   AI 平台: ${aiProvider}`);
    core.info(`   游戏名称: ${gameName}`);
    core.info(`   模板: ${template}`);
    core.info(`   图片搜索: ${imageConfig.searchEnabled ? '启用' : '禁用'}`);

    // ========== 初始化服务 ==========
    
    // 初始化 AI 提供商
    const aiClient = AIProviderFactory.create(aiProvider, {
      apiKey,
      model,
      maxTokens,
      temperature
    });

    // 初始化模板引擎
    const templateEngine = new TemplateEngine();

    // 初始化图片服务
    const imageService = new ImageService(imageConfig);

    // 初始化文章生成器
    const generator = new ArticleGenerator(aiClient, templateEngine, imageService);

    // ========== 执行生成 ==========
    const task: GenerationTask = {
      gameName,
      category,
      template,
      outputPath
    };

    const result = await generator.generate(task, outputPath, variables);

    // ========== 设置输出 ==========
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    core.setOutput('generated-files', JSON.stringify(result.success ? [result.filePath] : []));
    core.setOutput('success-count', result.success ? '1' : '0');
    core.setOutput('failed-count', result.success ? '0' : '1');
    core.setOutput('total-tokens', result.tokensUsed.toString());
    core.setOutput('images-processed', (result.imagesProcessed || 0).toString());
    core.setOutput('execution-time', executionTime);

    // ========== 输出日志 ==========
    core.info(`\n✅ 生成完成！`);
    core.info(`   文件: ${result.filePath}`);
    core.info(`   Token 消耗: ${result.tokensUsed}`);
    core.info(`   图片处理: ${result.imagesProcessed || 0} 张`);
    core.info(`   耗时: ${executionTime} 秒`);

    if (!result.success) {
      core.setFailed(`❌ 生成失败: ${result.error}`);
    }

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`❌ 执行失败: ${error.message}`);
    } else {
      core.setFailed('❌ 执行失败: 未知错误');
    }
  }
}

run();
