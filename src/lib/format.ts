/**
 * 数字格式化工具函数
 */

/**
 * 格式化计数显示
 * 50 -> "50+"
 * 1000 -> "1K+"
 * 100000 -> "10W+"
 */
export function formatCount(count: number | null | undefined): string {
  if (count == null) {
    return '0'
  }
  
  if (count >= 100000) {
    // 大于等于10万，显示为 "10W+"
    const wan = Math.floor(count / 10000)
    return `${wan}W+`
  } else if (count >= 1000) {
    // 大于等于1000，显示为 "1K+"
    const k = Math.floor(count / 1000)
    return `${k}K+`
  } else if (count >= 50) {
    // 大于等于50，显示为 "50+"
    return `${count}+`
  } else {
    // 小于50，直接显示数字
    return count.toString()
  }
}

/**
 * 格式化金额显示
 * 50000000 -> "¥5000W"
 */
export function formatMoney(amount: number | null | undefined, currency = '¥'): string {
  if (amount == null) {
    return `${currency}0`
  }
  
  if (amount >= 100000000) {
    // 大于等于1亿
    const yi = Math.floor(amount / 100000000)
    return `${currency}${yi}亿`
  } else if (amount >= 10000) {
    // 大于等于1万
    const wan = Math.floor(amount / 10000)
    return `${currency}${wan}W`
  } else {
    return `${currency}${amount}`
  }
}

/**
 * 格式化数字（带千分位）
 * 1234567 -> "1,234,567"
 */
export function formatNumber(num: number | null | undefined): string {
  if (num == null) {
    return '0'
  }
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
