/**
 * 文章生成器
 * 调用 AI 生成文章并保存到文件
 */

import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { AIClient } from './ai-providers';
import { TemplateEngine, TemplateVariables } from './template-engine';
import { ImageService } from './image-service';

interface GenerationTask {
  gameName: string;
  category: string;
  template: string;
  outputPath?: string;
  variables?: Record<string, unknown>;
}

interface GenerationResult {
  success: boolean;
  gameName: string;
  filePath: string;
  tokensUsed: number;
  imagesProcessed?: number;
  error?: string;
}

/**
 * 分类名称映射
 */
const CATEGORY_MAP: Record<string, string> = {
  xianxia: '仙侠',
  chuanqi: '传奇',
  sanguo: '三国',
  xiuxian: '修仙',
  xiyou: '西游',
  wuxia: '武侠',
  mohuan: '魔幻',
  qban: 'Q版',
  huihe: '回合',
  kapai: '卡牌',
  maoxian: '冒险',
  xiuxian2: '休闲',
  fangzhi: '放置',
  gecao: '割草',
  dongman: '动漫',
  erciyuan: '二次元',
  kaix: '开箱',
  wangyou: '网游',
  celue: '策略'
};

export class ArticleGenerator {
  private aiClient: AIClient;
  private templateEngine: TemplateEngine;
  private imageService: ImageService;

  constructor(aiClient: AIClient, templateEngine: TemplateEngine, imageService: ImageService) {
    this.aiClient = aiClient;
    this.templateEngine = templateEngine;
    this.imageService = imageService;
  }

  /**
   * 生成单篇文章
   */
  async generate(
    task: GenerationTask, 
    baseOutputPath: string,
    extraVariables?: Record<string, string>
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    core.info(`\n📝 开始生成: ${task.gameName}`);

    try {
      // 准备模板变量
      const variables: TemplateVariables = {
        gameName: task.gameName,
        category: CATEGORY_MAP[task.category] || task.category,
        date: new Date().toISOString().split('T')[0],
        ...extraVariables,
        ...task.variables
      };

      // 渲染提示词
      const prompt = this.templateEngine.render(task.template, variables);
      core.debug(`提示词: ${prompt.substring(0, 200)}...`);

      // 调用 AI 生成
      core.info(`   🤖 调用 AI 生成中...`);
      const result = await this.aiClient.generate(prompt);

      // 处理生成的内容
      let content = result.content;
      
      // 如果内容被包裹在代码块中，提取内容
      const codeBlockMatch = content.match(/```(?:markdown)?\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        content = codeBlockMatch[1];
      }

      // 确保 frontmatter 格式正确
      if (!content.startsWith('---')) {
        content = this.addFrontmatter(content, task);
      }

      // 处理图片占位符
      core.info(`   🖼️ 处理图片占位符...`);
      const imageResult = await this.imageService.processImagePlaceholders(content, {
        gameName: task.gameName,
        category: variables.category as string
      });
      content = imageResult.content;
      const imagesProcessed = imageResult.imagesProcessed;

      if (imagesProcessed > 0) {
        core.info(`   ✅ 处理了 ${imagesProcessed} 张图片`);
      }

      // 确定输出路径
      const outputDir = task.outputPath || path.join(baseOutputPath, task.category || 'general');
      const fileName = this.generateFileName(task.gameName);
      const filePath = path.join(process.env.GITHUB_WORKSPACE || '', outputDir, fileName);

      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 写入文件
      fs.writeFileSync(filePath, content, 'utf-8');
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      core.info(`   ✅ 生成成功! Token: ${result.tokensUsed}, 耗时: ${elapsed}s`);
      core.info(`   📄 文件: ${filePath}`);

      return {
        success: true,
        gameName: task.gameName,
        filePath,
        tokensUsed: result.tokensUsed,
        imagesProcessed
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      core.warning(`   ❌ 生成失败: ${errorMessage}`);
      
      return {
        success: false,
        gameName: task.gameName,
        filePath: '',
        tokensUsed: 0,
        imagesProcessed: 0,
        error: errorMessage
      };
    }
  }

  /**
   * 批量生成文章
   */
  async generateBatch(tasks: GenerationTask[], baseOutputPath: string): Promise<GenerationResult[]> {
    core.info(`\n🚀 开始批量生成，共 ${tasks.length} 个任务\n`);
    
    const results: GenerationResult[] = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      core.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      core.info(`[${i + 1}/${tasks.length}] ${task.gameName}`);
      
      const result = await this.generate(task, baseOutputPath);
      results.push(result);
      
      // 添加延迟避免 API 限流
      if (i < tasks.length - 1) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * 生成文件名
   */
  private generateFileName(gameName: string): string {
    // 将中文转为拼音或使用安全的文件名
    const safeName = gameName
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    
    return `${safeName}.md`;
  }

  /**
   * 添加 frontmatter
   */
  private addFrontmatter(content: string, task: GenerationTask): string {
    const date = new Date().toISOString().split('T')[0];
    const frontmatter = `---
title: "${task.gameName}破解版下载"
description: "${task.gameName}破解版，无限元宝，满VIP特权"
keywords: ["${task.gameName}", "破解版", "无限元宝", "${CATEGORY_MAP[task.category] || task.category}"]
category: "${CATEGORY_MAP[task.category] || task.category}"
date: "${date}"
---

`;
    return frontmatter + content;
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
