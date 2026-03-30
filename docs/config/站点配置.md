# 站点配置目录

## 📁 目录结构

```
config/site/
├── index.ts      # 统一导出
├── site.ts       # 站点基本信息配置
├── theme.ts      # 主题样式配置
├── locales.ts    # 多语言配置
└── modules.ts    # 模块功能配置
```

## 📝 文件说明

### site.ts - 站点基本信息

**包含内容：**
- 网站名称、描述、域名
- Logo、Favicon、OG图片
- 版权信息、作者信息
- 社交媒体链接
- 功能开关
- 导航菜单配置

**使用示例：**
```typescript
import { siteConfig } from '@/config/site'

console.log(siteConfig.name)  // 'GameBox'
```

### theme.ts - 主题样式配置

**包含内容：**
- 颜色方案（浅色/深色模式）
- 字体设置
- 布局尺寸
- 圆角、阴影
- 动画效果

**使用示例：**
```typescript
import { themeConfig, getThemeColor } from '@/config/site'

const primaryColor = getThemeColor('primary')
```

### locales.ts - 多语言配置

**包含内容：**
- 支持的语言列表
- 默认语言设置
- 语言切换逻辑
- 翻译文本映射

**使用示例：**
```typescript
import { locales, defaultLocale } from '@/config/site'

console.log(defaultLocale)  // 'zh-CN'
```

### modules.ts - 模块功能配置

**包含内容：**
- 文章模块配置
- 攻略模块配置
- 破解游戏模块配置
- 各模块的主题、布局等

**使用示例：**
```typescript
import { modules, getModuleConfig } from '@/config/site'

const strategyConfig = getModuleConfig('strategy')
```

## 🚀 使用指南

### 修改站点基本信息

```typescript
// config/site/site.ts
export const siteConfig: SiteConfig = {
  name: '你的网站名称',
  description: '你的网站描述',
  hostname: 'https://yourdomain.com',
  // ...
}
```

### 修改主题颜色

```typescript
// config/site/theme.ts
colors: {
  light: {
    primary: '#3b82f6',  // 修改主色
  }
}
```

### 添加新语言

```typescript
// config/site/locales.ts
export const locales: LocaleConfig[] = [
  // ...现有语言
  {
    code: 'ja',
    name: '日本語',
    routePrefix: '/ja',
    // ...
  }
]
```

## 📚 相关文档

- [配置系统总览](../README.md)
- [快速入门指南](../QUICKSTART.md)
