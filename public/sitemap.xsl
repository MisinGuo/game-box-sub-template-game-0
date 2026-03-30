<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                exclude-result-prefixes="sitemap xhtml">

  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
          }

          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
          }

          .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 600;
          }

          .header p {
            font-size: 1.1em;
            opacity: 0.9;
          }

          .stats {
            display: flex;
            justify-content: space-around;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
          }

          .stat-item {
            text-align: center;
          }

          .stat-number {
            font-size: 2em;
            font-weight: 700;
            color: #667eea;
            display: block;
          }

          .stat-label {
            color: #666;
            margin-top: 5px;
            font-size: 0.9em;
          }

          .content {
            padding: 40px;
          }

          .table-wrapper {
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
          }

          thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          td {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
          }

          tbody tr {
            transition: background-color 0.2s ease;
          }

          tbody tr:hover {
            background-color: #f8f9fa;
          }

          tbody tr:last-child td {
            border-bottom: none;
          }

          .url-link {
            color: #667eea;
            text-decoration: none;
            word-break: break-all;
            transition: color 0.2s ease;
          }

          .url-link:hover {
            color: #764ba2;
            text-decoration: underline;
          }

          .priority {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
          }

          .priority-high {
            background: #d4edda;
            color: #155724;
          }

          .priority-medium {
            background: #fff3cd;
            color: #856404;
          }

          .priority-low {
            background: #f8d7da;
            color: #721c24;
          }

          .changefreq {
            color: #666;
            font-size: 0.9em;
          }

          .lastmod {
            color: #888;
            font-size: 0.85em;
          }

          .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #e0e0e0;
          }

          .footer a {
            color: #667eea;
            text-decoration: none;
          }

          .footer a:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .header h1 {
              font-size: 1.8em;
            }

            .stats {
              flex-direction: column;
              gap: 20px;
            }

            .content {
              padding: 20px;
            }

            table {
              font-size: 0.85em;
            }

            th, td {
              padding: 10px 5px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗺️ Sitemap</h1>
            <p>网站地图 - 所有页面索引</p>
          </div>

          <div class="stats">
            <div class="stat-item">
              <span class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
              </span>
              <span class="stat-label">总页面数</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">
                <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/>
              </span>
              <span class="stat-label">Sitemap 数</span>
            </div>
          </div>

          <div class="content">
            <div class="table-wrapper">
              <xsl:apply-templates/>
            </div>
          </div>

          <div class="footer">
            <p>本网站地图遵循 <a href="http://www.sitemaps.org/" target="_blank">Sitemaps.org</a> 标准</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- Sitemap Index Template -->
  <xsl:template match="sitemap:sitemapindex">
    <table>
      <thead>
        <tr>
          <th style="width: 60%">Sitemap URL</th>
          <th style="width: 40%">最后更新时间</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="sitemap:sitemap">
          <tr>
            <td>
              <a class="url-link" href="{sitemap:loc}">
                <xsl:value-of select="sitemap:loc"/>
              </a>
            </td>
            <td class="lastmod">
              <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
              <xsl:text> </xsl:text>
              <xsl:value-of select="substring(sitemap:lastmod, 12, 5)"/>
            </td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:template>

  <!-- URL Set Template -->
  <xsl:template match="sitemap:urlset">
    <table>
      <thead>
        <tr>
          <th style="width: 50%">URL</th>
          <th style="width: 15%">优先级</th>
          <th style="width: 15%">更新频率</th>
          <th style="width: 20%">最后更新</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="sitemap:url">
          <tr>
            <td>
              <a class="url-link" href="{sitemap:loc}">
                <xsl:value-of select="sitemap:loc"/>
              </a>
            </td>
            <td>
              <xsl:choose>
                <xsl:when test="sitemap:priority">
                  <xsl:variable name="priority" select="sitemap:priority"/>
                  <span>
                    <xsl:attribute name="class">
                      <xsl:text>priority </xsl:text>
                      <xsl:choose>
                        <xsl:when test="$priority &gt;= 0.7">priority-high</xsl:when>
                        <xsl:when test="$priority &gt;= 0.4">priority-medium</xsl:when>
                        <xsl:otherwise>priority-low</xsl:otherwise>
                      </xsl:choose>
                    </xsl:attribute>
                    <xsl:value-of select="sitemap:priority"/>
                  </span>
                </xsl:when>
                <xsl:otherwise>
                  <span class="priority priority-medium">0.5</span>
                </xsl:otherwise>
              </xsl:choose>
            </td>
            <td class="changefreq">
              <xsl:choose>
                <xsl:when test="sitemap:changefreq">
                  <xsl:value-of select="sitemap:changefreq"/>
                </xsl:when>
                <xsl:otherwise>-</xsl:otherwise>
              </xsl:choose>
            </td>
            <td class="lastmod">
              <xsl:choose>
                <xsl:when test="sitemap:lastmod">
                  <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                  <xsl:text> </xsl:text>
                  <xsl:value-of select="substring(sitemap:lastmod, 12, 5)"/>
                </xsl:when>
                <xsl:otherwise>-</xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:template>

</xsl:stylesheet>
