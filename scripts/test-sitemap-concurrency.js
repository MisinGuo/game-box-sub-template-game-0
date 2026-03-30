#!/usr/bin/env node

/**
 * 测试 sitemap API 性能
 * 用于验证分类分页探测并发优化的效果
 * 
 * 使用方法：
 *   node scripts/test-sitemap-concurrency.js [baseUrl] [locale] [type] [chunk]
 * 
 * 示例：
 *   node scripts/test-sitemap-concurrency.js http://localhost:3000 zh-CN games 1
 */

const http = require('http');
const https = require('https');

async function testSitemapApi(baseUrl, locale, type, chunk) {
  return new Promise((resolve, reject) => {
    const url = typeof baseUrl === 'string' 
      ? `${baseUrl}/api/sitemap/${locale}-${type}` + (chunk ? `-${chunk}` : '')
      : baseUrl;

    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;

    console.log(`\n📊 Testing: ${url}`);
    console.log(`⏱️  Start time: ${new Date().toISOString()}\n`);

    protocol.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`✅ Response received`);
        console.log(`📈 Status: ${res.statusCode}`);
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log(`📏 Response size: ${data.length} bytes`);

        // 计算统计信息
        const urlCount = (data.match(/<loc>/g) || []).length;
        console.log(`🎯 URLs in response: ${urlCount}`);
        console.log(`⚡ Time per URL: ${(duration / urlCount).toFixed(2)}ms`);

        resolve({ duration, urlCount, statusCode: res.statusCode });
      });
    }).on('error', reject);
  });
}

async function runMultipleTests(baseUrl, locale, type, chunks = [1, 2]) {
  console.log('🚀 Sitemap API Concurrency Test Suite\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Locale: ${locale}`);
  console.log(`Type: ${type}`);
  console.log(`Testing chunks: ${chunks.join(', ')}\n`);

  const results = [];

  for (const chunk of chunks) {
    try {
      const result = await testSitemapApi(baseUrl, locale, type, chunk);
      results.push({ chunk, ...result });
      console.log(''); // 空行分隔
    } catch (error) {
      console.error(`❌ Error testing chunk ${chunk}:`, error.message);
    }

    // 两次请求之间间隔 1 秒，避免过度并发
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 总结
  console.log('\n📊 Summary:');
  console.log('='.repeat(60));

  let totalDuration = 0;
  let totalUrls = 0;

  for (const result of results) {
    console.log(
      `Chunk ${result.chunk}: ${result.duration}ms | ${result.urlCount} URLs | ` +
      `${(result.duration / result.urlCount).toFixed(2)}ms/URL`
    );
    totalDuration += result.duration;
    totalUrls += result.urlCount;
  }

  console.log('='.repeat(60));
  console.log(`Total: ${totalDuration}ms | ${totalUrls} URLs | Avg: ${(totalDuration / totalUrls).toFixed(2)}ms/URL`);
  console.log('\n✨ Test completed!\n');

  // 性能建议
  console.log('💡 Performance Notes:');
  console.log('   - Concurrency limit: 4 (category page detection)');
  console.log('   - Expected reduction: ~60-70% faster than sequential');
  console.log('   - Tail latency: category detection now parallelized\n');
}

// 主程序
const baseUrl = process.argv[2] || 'http://localhost:3000';
const locale = process.argv[3] || 'zh-CN';
const type = process.argv[4] || 'games';
const chunk = process.argv[5];

if (chunk) {
  // 单个块测试
  testSitemapApi(baseUrl, locale, type, chunk)
    .then((result) => {
      console.log('\n✨ Test completed!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
} else {
  // 多块测试
  runMultipleTests(baseUrl, locale, type, [1, 2])
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    });
}
