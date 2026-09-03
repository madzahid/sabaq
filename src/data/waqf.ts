/**
 * رموزِ اوقاف — the pause marks, as the printed Mushaf explains them on its
 * page 551.
 *
 * These signs are scattered through every page of the text and nothing in the
 * app explained any of them. A student who does not know that ۘ means he MUST
 * stop, or that لا means he must not, is reciting past the sense of the ayah.
 *
 * The translations live here rather than in strings.ts because this is
 * reference CONTENT, not UI chrome — fifteen rows that belong together, and
 * splitting the sign from its meaning across two files would make both
 * unreadable. The sign and the Arabic name are never translated.
 *
 * Ordered as the print orders them, which is roughly "must stop" down to "must
 * not", with the special marks last.
 */
export interface WaqfSign {
  /** As printed in the margin of the text. */
  sign: string
  /** The rule's name. Arabic, in every UI language. */
  name: string
  ur: string
  en: string
  ar: string
}

export const WAQF: WaqfSign[] = [
  {
    sign: 'ۘ', name: 'وَقْف لَازِم',
    ur: 'یہاں ٹھہرنا لازم ہے۔ نہ ٹھہریں تو مطلب بدل جانے کا اندیشہ ہے۔',
    en: 'You must stop. Reading on can change the meaning.',
    ar: 'الوقف واجب هنا؛ ووصله قد يقلب المعنى.',
  },
  {
    sign: 'ط', name: 'وَقْف مُطْلَق',
    ur: 'یہاں ٹھہرنا چاہیئے۔ بات مکمل ہے، اگرچہ کہنے والا آگے اور بھی کہتا ہے۔',
    en: 'You should stop. The sense is complete, though more follows.',
    ar: 'يُستحسن الوقف؛ تمّ المعنى وإن بقي كلام.',
  },
  {
    sign: 'ج', name: 'وَقْف جَائِز',
    ur: 'ٹھہرنا اور نہ ٹھہرنا دونوں جائز ہیں، ٹھہرنا بہتر ہے۔',
    en: 'Stopping and continuing are both allowed; stopping is better.',
    ar: 'يجوز الوقف والوصل، والوقف أولى.',
  },
  {
    sign: 'ز', name: 'وَقْف مُجَوَّز',
    ur: 'ٹھہرنا جائز ہے، مگر نہ ٹھہرنا بہتر ہے۔',
    en: 'Stopping is permitted, but continuing is better.',
    ar: 'يجوز الوقف والوصل أولى.',
  },
  {
    sign: 'ص', name: 'وَقْف مُرَخَّص',
    ur: 'ملا کر پڑھنا چاہیئے، لیکن سانس ٹوٹ جائے تو ٹھہرنے کی رخصت ہے۔',
    en: 'Read on — but you may stop if you run out of breath.',
    ar: 'الوصل أولى، ورُخّص الوقف عند انقطاع النفس.',
  },
  {
    sign: 'صلے', name: 'اَلْوَصْلُ اَوْلٰی',
    ur: 'ملا کر پڑھنا بہتر ہے۔',
    en: 'Continuing is better.',
    ar: 'الوصل أولى.',
  },
  {
    sign: 'صلی', name: 'قَدْ يُوصَل',
    ur: 'کبھی یہاں ٹھہرا بھی جاتا ہے، لیکن نہ ٹھہرنا بہتر ہے۔',
    en: 'Some do stop here, but continuing is better.',
    ar: 'قد يُوصل، وتركُ الوقف أولى.',
  },
  {
    sign: 'ق', name: 'قِيلَ عَلَيْهِ الْوَقْف',
    ur: 'یہاں ٹھہرنا نہیں چاہیئے۔',
    en: 'Do not stop here.',
    ar: 'لا يُوقف هنا.',
  },
  {
    sign: 'قف', name: 'قِف',
    ur: 'ٹھہر جاؤ۔ یہ وہاں لکھا جاتا ہے جہاں پڑھنے والے کے ملا کر پڑھ لینے کا اندیشہ ہو۔',
    en: 'Stop — marked where a reader would otherwise read straight on.',
    ar: 'قف؛ تُوضع حيث يُتوقّع أن يصل القارئ.',
  },
  {
    sign: 'س', name: 'سَكْتَة',
    ur: 'تھوڑی دیر ٹھہریں، مگر سانس نہ توڑیں۔',
    en: 'Pause briefly — without breaking your breath.',
    ar: 'سكتةٌ يسيرة من غير قطع النَّفَس.',
  },
  {
    sign: 'وقفة', name: 'وَقْفَة',
    ur: 'سکتے سے کچھ زیادہ ٹھہریں، سانس پھر بھی نہ توڑیں۔',
    en: 'Pause a little longer than a sakta — still without breathing.',
    ar: 'وقفةٌ أطول من السكتة، ومن غير قطع النَّفَس.',
  },
  {
    sign: 'لا', name: 'لَا وَقْف',
    ur: 'یہاں نہ ٹھہریں۔ آیت کے آخر پر ہو تو ٹھہرنے میں حرج نہیں۔',
    en: 'Do not stop. At the end of an ayah, stopping does no harm.',
    ar: 'لا تقف؛ فإن كان رأس آية فلا حرج في الوقف.',
  },
  {
    sign: 'ك', name: 'كَذٰلِك',
    ur: 'پچھلی علامت جیسا، یعنی جو حکم پہلے تھا وہی یہاں ہے۔',
    en: 'The same as the sign before it.',
    ar: 'كذلك؛ حكمه حكم العلامة قبله.',
  },
  {
    sign: '∴ … ∴', name: 'مُعَانَقَہ',
    ur: 'دو میں سے کسی ایک جگہ ٹھہریں — دونوں پر نہیں۔',
    en: 'Stop at one of the two places — never at both.',
    ar: 'قف عند أحد الموضعين لا عندهما معًا.',
  },
  {
    sign: '۝', name: 'اٰیَت',
    ur: 'آیت کا اختتام۔ بات پوری ہو چکی، یہاں ٹھہرنا چاہیئے۔',
    en: 'End of an ayah. The sense is complete; stop here.',
    ar: 'نهاية الآية؛ تمّ المعنى فقف.',
  },
]
