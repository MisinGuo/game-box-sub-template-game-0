/**
 * 模板引擎
 * 管理和渲染提示词模板
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TemplateVariables {
  gameName: string;
  category?: string;
  keywords?: string[];
  gameType?: string;
  features?: string[];
  [key: string]: unknown;
}

interface Template {
  name: string;
  description: string;
  prompt: string;
  variables: string[];
}

/**
 * 内置模板定义
 */
const BUILT_IN_TEMPLATES: Record<string, Template> = {
  'game-intro': {
    name: '游戏介绍',
    description: '生成游戏破解版介绍文章',
    variables: ['gameName', 'category', 'gameType', 'features'],
    prompt: `你是一个专业的游戏内容编辑，请为以下游戏生成一篇高质量的破解版介绍文章。

## 游戏信息
- 游戏名称：{{gameName}}
- 游戏分类：{{category}}
- 游戏类型：{{gameType}}
- 游戏特色：{{features}}

## 文章要求
1. 文章格式为 Markdown
2. 包含以下部分：
   - 游戏简介（约200字）
   - 游戏特色（3-5个要点）
   - 破解版特性（无限元宝/VIP等）
   - 游戏攻略（新手指南）
   - 下载说明
3. 语言风格：专业、有趣、吸引玩家
4. 适当使用 emoji 增加可读性
5. 标题使用 H2/H3 层级

## 输出格式
请直接输出 Markdown 内容，开头需要包含 frontmatter：

\`\`\`
---
title: "{{gameName}}破解版下载"
description: "简短描述"
keywords: ["关键词1", "关键词2"]
category: "{{category}}"
date: "当前日期"
---
\`\`\`

请开始生成：`
  },

  'strategy': {
    name: '游戏攻略',
    description: '生成游戏攻略文章',
    variables: ['gameName', 'category', 'topic'],
    prompt: `你是一个资深游戏玩家和攻略作者，请为以下游戏生成一篇详细的攻略文章。

## 游戏信息
- 游戏名称：{{gameName}}
- 游戏分类：{{category}}
- 攻略主题：{{topic}}

## 文章要求
1. 文章格式为 Markdown
2. 包含以下部分：
   - 攻略概述
   - 详细步骤（配图说明占位符）
   - 注意事项
   - 常见问题
   - 进阶技巧
3. 语言风格：清晰、实用、易懂
4. 使用列表、表格等格式增强可读性
5. 适当使用 emoji

## 输出格式
请直接输出 Markdown 内容，开头需要包含 frontmatter。

请开始生成：`
  },

  'review': {
    name: '游戏评测',
    description: '生成游戏评测文章',
    variables: ['gameName', 'category', 'rating'],
    prompt: `你是一个专业的游戏评测员，请为以下游戏生成一篇客观、专业的评测文章。

## 游戏信息
- 游戏名称：{{gameName}}
- 游戏分类：{{category}}
- 综合评分：{{rating}}/10

## 文章要求
1. 文章格式为 Markdown
2. 包含以下部分：
   - 游戏概览
   - 画面表现（评分）
   - 玩法系统（评分）
   - 音效配乐（评分）
   - 氪金程度（评分）
   - 优缺点总结
   - 最终推荐
3. 语言风格：客观、专业、有深度
4. 使用表格展示评分

请开始生成：`
  },

  'drama-intro': {
    name: '短剧介绍',
    description: '生成短剧介绍文章',
    variables: ['dramaName', 'genre', 'episodes', 'actors'],
    prompt: `你是一个专业的短剧内容编辑，请为以下短剧生成一篇吸引人的介绍文章。

## 短剧信息
- 短剧名称：{{dramaName}}
- 类型：{{genre}}
- 集数：{{episodes}}
- 主演：{{actors}}

## 文章要求
1. 文章格式为 Markdown
2. 包含以下部分：
   - 剧情简介（不剧透）
   - 主角介绍
   - 精彩看点
   - 观看推荐
3. 语言风格：轻松、吸引人、制造悬念
4. 适当使用 emoji

请开始生成：`
  }
};

export class TemplateEngine {
  private customTemplatesPath: string;

  constructor(customTemplatesPath?: string) {
    this.customTemplatesPath = customTemplatesPath || 
      path.join(__dirname, '..', 'templates');
  }

  /**
   * 获取模板
   */
  getTemplate(templateName: string): Template | null {
    // 首先检查内置模板
    if (BUILT_IN_TEMPLATES[templateName]) {
      return BUILT_IN_TEMPLATES[templateName];
    }

    // 检查自定义模板文件
    const customTemplatePath = path.join(this.customTemplatesPath, `${templateName}.json`);
    if (fs.existsSync(customTemplatePath)) {
      return JSON.parse(fs.readFileSync(customTemplatePath, 'utf-8'));
    }

    return null;
  }

  /**
   * 渲染模板
   */
  render(templateName: string, variables: TemplateVariables): string {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`模板不存在: ${templateName}`);
    }

    let prompt = template.prompt;

    // 替换变量
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const stringValue = Array.isArray(value) ? value.join('、') : String(value || '');
      prompt = prompt.replace(placeholder, stringValue);
    }

    // 处理未替换的变量（设置为空）
    prompt = prompt.replace(/\{\{[^}]+\}\}/g, '');

    return prompt;
  }

  /**
   * 获取所有可用模板列表
   */
  listTemplates(): string[] {
    const templates = Object.keys(BUILT_IN_TEMPLATES);
    
    // 添加自定义模板
    if (fs.existsSync(this.customTemplatesPath)) {
      const customFiles = fs.readdirSync(this.customTemplatesPath)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
      templates.push(...customFiles);
    }

    return [...new Set(templates)];
  }
}
