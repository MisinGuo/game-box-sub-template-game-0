import { useLocale } from '@/contexts/LocaleContext'

/**
 * 简化的翻译 Hook
 * 使用示例: const t = useTranslation()
 * 然后: t('home')
 */
export function useTranslation() {
  const { t } = useLocale()
  return t
}
