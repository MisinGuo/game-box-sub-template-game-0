/**
 * AI 提供商适配器工厂
 * 支持多个 AI 平台的统一接口
 */

export interface AIClientConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerationResult {
  content: string;
  tokensUsed: number;
  model: string;
}

export interface AIClient {
  generate(prompt: string): Promise<GenerationResult>;
}

/**
 * OpenAI 适配器
 */
class OpenAIClient implements AIClient {
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.config = config;
  }

  async generate(prompt: string): Promise<GenerationResult> {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl
    });

    const response = await client.chat.completions.create({
      model: this.config.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens || 4096,
      temperature: this.config.temperature || 0.7
    });

    return {
      content: response.choices[0]?.message?.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
      model: response.model
    };
  }
}

/**
 * Claude 适配器
 */
class ClaudeClient implements AIClient {
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.config = config;
  }

  async generate(prompt: string): Promise<GenerationResult> {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({
      apiKey: this.config.apiKey
    });

    const response = await client.messages.create({
      model: this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: this.config.maxTokens || 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = response.content.find(c => c.type === 'text');
    return {
      content: textContent?.type === 'text' ? textContent.text : '',
      tokensUsed: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      model: response.model
    };
  }
}

/**
 * 通义千问适配器（兼容 OpenAI API）
 */
class QwenClient implements AIClient {
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.config = config;
  }

  async generate(prompt: string): Promise<GenerationResult> {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });

    const response = await client.chat.completions.create({
      model: this.config.model || 'qwen-plus',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens || 4096,
      temperature: this.config.temperature || 0.7
    });

    return {
      content: response.choices[0]?.message?.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
      model: response.model
    };
  }
}

/**
 * DeepSeek 适配器（兼容 OpenAI API）
 */
class DeepSeekClient implements AIClient {
  private config: AIClientConfig;

  constructor(config: AIClientConfig) {
    this.config = config;
  }

  async generate(prompt: string): Promise<GenerationResult> {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl || 'https://api.deepseek.com'
    });

    const response = await client.chat.completions.create({
      model: this.config.model || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens || 4096,
      temperature: this.config.temperature || 0.7
    });

    return {
      content: response.choices[0]?.message?.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
      model: response.model
    };
  }
}

/**
 * AI 提供商工厂
 */
export class AIProviderFactory {
  static create(provider: string, config: AIClientConfig): AIClient {
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIClient(config);
      case 'claude':
        return new ClaudeClient(config);
      case 'qwen':
        return new QwenClient(config);
      case 'deepseek':
        return new DeepSeekClient(config);
      default:
        throw new Error(`不支持的 AI 提供商: ${provider}`);
    }
  }
}
