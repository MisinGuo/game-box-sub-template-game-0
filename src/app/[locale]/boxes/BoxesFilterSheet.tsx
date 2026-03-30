'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useLocale } from '@/contexts/LocaleContext'
import { boxesListConfig } from '@/config/pages/boxes'
import { filterSheetTranslations, filterTagOptionKeys, getT } from '@/i18n/page-translations'

export function BoxesFilterSheet() {
  const [open, setOpen] = useState(false)
  const { locale } = useLocale()
  const t = getT(filterSheetTranslations, locale)

  const discountOptions = boxesListConfig.filter.filters
    .find(f => f.key === 'discount')?.options
    .filter(o => o.value !== 'all') ?? []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-slate-800 bg-slate-900 hover:bg-slate-800">
          <Filter className="h-4 w-4 mr-2" />
          {t.filterBtn}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-slate-950 border-slate-800 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{t.filterTitle}</SheetTitle>
          <SheetDescription className="text-slate-400">
            {t.filterDesc}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* 折扣力度 */}
          <div>
            <Label className="text-white mb-3 block">{t.discountTitle}</Label>
            <div className="space-y-2">
              {discountOptions.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <Checkbox id={`discount-${opt.value}`} />
                  <label
                    htmlFor={`discount-${opt.value}`}
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {(opt.label as Record<string, string>)[locale] ?? (opt.label as Record<string, string>)['zh-CN']}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 特色标签 */}
          <div>
            <Label className="text-white mb-3 block">{t.tagTitle}</Label>
            <div className="space-y-2">
              {filterTagOptionKeys.map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox id={key} />
                  <label
                    htmlFor={key}
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {t[`tag_${key}`]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-slate-700 hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              {t.apply}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
