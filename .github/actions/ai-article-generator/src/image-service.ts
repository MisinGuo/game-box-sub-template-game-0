/**
 * 图片服务
 * 支持多个图片搜索引擎和自定义图片池
 */

import * as core from '@actions/core';

export interface ImageSearchResult {
  url: string;
  thumbnailUrl?: string;
  title?: string;
  source?: string;
}

export interface ImagePoolConfig {
  pools: {
    [key: string]: {
      description: string;
      images: string[];
    };
  };
  defaultPool?: string;
}

export interface ImageServiceConfig {
  searchEnabled: boolean;
  searchEngine: string;
  searchApiKey: string;
  poolUrl?: string;
  poolJson?: string;
  uploadEnabled: boolean;
  storageType: string;
  storageConfig?: string;
  fallbackUrl?: string;
}

/**
 * 图片搜索引擎基类
 */
abstract class ImageSearchEngine {
  protected apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  abstract search(query: string, count?: number): Promise<ImageSearchResult[]>;
}

/**
 * Bing 图片搜索
 */
class BingImageSearch extends ImageSearchEngine {
  async search(query: string, count: number = 5): Promise<ImageSearchResult[]> {
    const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(query)}&count=${count}`;
    
    const response = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Bing 搜索失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data.value.map((item: any) => ({
      url: item.contentUrl,
      thumbnailUrl: item.thumbnailUrl,
      title: item.name,
      source: 'bing'
    }));
  }
}

/**
 * Unsplash 图片搜索（免费）
 */
class UnsplashImageSearch extends ImageSearchEngine {
  async search(query: string, count: number = 5): Promise<ImageSearchResult[]> {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash 搜索失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.map((item: any) => ({
      url: item.urls.regular,
      thumbnailUrl: item.urls.thumb,
      title: item.alt_description || item.description,
      source: 'unsplash'
    }));
  }
}

/**
 * Pixabay 图片搜索（免费）
 */
class PixabayImageSearch extends ImageSearchEngine {
  async search(query: string, count: number = 5): Promise<ImageSearchResult[]> {
    const url = `https://pixabay.com/api/?key=${this.apiKey}&q=${encodeURIComponent(query)}&per_page=${count}&image_type=photo`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Pixabay 搜索失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data.hits.map((item: any) => ({
      url: item.largeImageURL,
      thumbnailUrl: item.previewURL,
      title: item.tags,
      source: 'pixabay'
    }));
  }
}

/**
 * Google 自定义搜索
 */
class GoogleImageSearch extends ImageSearchEngine {
  private cx: string;

  constructor(apiKey: string, cx?: string) {
    super(apiKey);
    this.cx = cx || '';
  }

  async search(query: string, count: number = 5): Promise<ImageSearchResult[]> {
    const url = `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.cx}&q=${encodeURIComponent(query)}&searchType=image&num=${count}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google 搜索失败: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
      url: item.link,
      thumbnailUrl: item.image?.thumbnailLink,
      title: item.title,
      source: 'google'
    }));
  }
}

/**
 * 图片服务主类
 */
export class ImageService {
  private config: ImageServiceConfig;
  private searchEngine: ImageSearchEngine | null = null;
  private imagePool: ImagePoolConfig | null = null;

  constructor(config: ImageServiceConfig) {
    this.config = config;
    this.initSearchEngine();
    this.initImagePool();
  }

  private initSearchEngine(): void {
    if (!this.config.searchEnabled || !this.config.searchApiKey) {
      return;
    }

    switch (this.config.searchEngine.toLowerCase()) {
      case 'bing':
        this.searchEngine = new BingImageSearch(this.config.searchApiKey);
        break;
      case 'unsplash':
        this.searchEngine = new UnsplashImageSearch(this.config.searchApiKey);
        break;
      case 'pixabay':
        this.searchEngine = new PixabayImageSearch(this.config.searchApiKey);
        break;
      case 'google':
        this.searchEngine = new GoogleImageSearch(this.config.searchApiKey);
        break;
      default:
        core.warning(`未知的图片搜索引擎: ${this.config.searchEngine}`);
    }
  }

  private async initImagePool(): Promise<void> {
    // 从 URL 加载图片池配置
    if (this.config.poolUrl) {
      try {
        const response = await fetch(this.config.poolUrl);
        if (response.ok) {
          this.imagePool = await response.json();
        }
      } catch (error) {
        core.warning(`加载图片池配置失败: ${error}`);
      }
    }

    // 从 Base64 JSON 加载
    if (this.config.poolJson) {
      try {
        const decoded = Buffer.from(this.config.poolJson, 'base64').toString('utf-8');
        this.imagePool = JSON.parse(decoded);
      } catch (error) {
        core.warning(`解析图片池 JSON 失败: ${error}`);
      }
    }
  }

  /**
   * 处理模板中的图片占位符
   */
  async processImagePlaceholders(content: string, variables: Record<string, string>): Promise<{ content: string; imagesProcessed: number }> {
    let imagesProcessed = 0;
    let processedContent = content;

    // 处理 IMAGE_SEARCH 占位符
    const searchPattern = /\{\{IMAGE_SEARCH:([^}:]+)(?::(\d+))?\}\}/g;
    let searchMatch;
    
    while ((searchMatch = searchPattern.exec(content)) !== null) {
      const [fullMatch, query, countStr] = searchMatch;
      const count = countStr ? parseInt(countStr) : 1;
      
      // 替换变量
      let resolvedQuery = query;
      for (const [key, value] of Object.entries(variables)) {
        resolvedQuery = resolvedQuery.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }

      try {
        const images = await this.searchImages(resolvedQuery, count);
        const imageMarkdown = images
          .map(img => `![${img.title || resolvedQuery}](${img.url})`)
          .join('\n\n');
        
        processedContent = processedContent.replace(fullMatch, imageMarkdown);
        imagesProcessed += images.length;
      } catch (error) {
        core.warning(`图片搜索失败 [${resolvedQuery}]: ${error}`);
        processedContent = processedContent.replace(fullMatch, this.getFallbackImage(resolvedQuery));
      }
    }

    // 处理 IMAGE_POOL 占位符
    const poolPattern = /\{\{IMAGE_POOL:([^}:]+)(?::(\d+))?\}\}/g;
    let poolMatch;
    
    while ((poolMatch = poolPattern.exec(content)) !== null) {
      const [fullMatch, poolName, countStr] = poolMatch;
      const count = countStr ? parseInt(countStr) : 1;

      try {
        const images = this.getFromPool(poolName, count);
        const imageMarkdown = images
          .map(url => `![${poolName}](${url})`)
          .join('\n\n');
        
        processedContent = processedContent.replace(fullMatch, imageMarkdown);
        imagesProcessed += images.length;
      } catch (error) {
        core.warning(`从图片池获取失败 [${poolName}]: ${error}`);
        processedContent = processedContent.replace(fullMatch, this.getFallbackImage(poolName));
      }
    }

    // 处理固定 IMAGE 占位符
    const imagePattern = /\{\{IMAGE:([^}]+)\}\}/g;
    let imageMatch;
    
    while ((imageMatch = imagePattern.exec(content)) !== null) {
      const [fullMatch, url] = imageMatch;
      processedContent = processedContent.replace(fullMatch, `![image](${url})`);
      imagesProcessed++;
    }

    return { content: processedContent, imagesProcessed };
  }

  /**
   * 搜索图片
   */
  async searchImages(query: string, count: number = 1): Promise<ImageSearchResult[]> {
    if (!this.searchEngine) {
      throw new Error('图片搜索引擎未初始化');
    }

    const results = await this.searchEngine.search(query, count);
    
    // 随机选取
    if (results.length > count) {
      return this.randomSelect(results, count);
    }
    
    return results;
  }

  /**
   * 从图片池获取图片
   */
  getFromPool(poolName: string, count: number = 1): string[] {
    if (!this.imagePool) {
      throw new Error('图片池未初始化');
    }

    const pool = this.imagePool.pools[poolName];
    if (!pool) {
      // 尝试使用默认图片池
      const defaultPool = this.imagePool.pools[this.imagePool.defaultPool || ''];
      if (!defaultPool) {
        throw new Error(`图片池不存在: ${poolName}`);
      }
      return this.randomSelect(defaultPool.images, count);
    }

    return this.randomSelect(pool.images, count);
  }

  /**
   * 随机选取
   */
  private randomSelect<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, items.length));
  }

  /**
   * 获取备用图片
   */
  private getFallbackImage(alt: string): string {
    if (this.config.fallbackUrl) {
      return `![${alt}](${this.config.fallbackUrl})`;
    }
    return `<!-- 图片加载失败: ${alt} -->`;
  }

  /**
   * 下载并上传图片到自有存储（可选）
   */
  async uploadImage(imageUrl: string): Promise<string> {
    if (!this.config.uploadEnabled || !this.config.storageConfig) {
      return imageUrl;
    }

    // TODO: 实现图片下载和上传逻辑
    // 根据 storageType 使用不同的存储适配器
    
    return imageUrl;
  }
}
