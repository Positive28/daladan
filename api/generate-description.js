const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '')

const getDeepseekApiSecret = () =>
  toTrimmedString(process.env.DEEPSEEK_API_SECRET) || toTrimmedString(process.env.API_SECRET)

const parseRequestBody = (body) => {
  if (!body) return {}
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'))
    } catch {
      return {}
    }
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  if (typeof body === 'object' && body !== null) return body
  return {}
}

const sanitizeDescription = (value) => {
  const stripped = value.replace(/^["'`]+|["'`]+$/g, '').trim()
  return stripped
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

/**
 * Turns a single wall of text into readable blocks (double newlines). Keeps existing
 * multi-line structure when the model already broke lines sensibly.
 */
const formatDescriptionLayout = (value) => {
  let t = sanitizeDescription(value)
  if (!t) return ''
  const blocks = t.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  if (blocks.length === 0) return ''
  if (blocks.length === 1 && blocks[0].length > 90) {
    const oneLine = blocks[0].replace(/\s+/g, ' ').trim()
    return oneLine
      .replace(/([.!?])(\s+)(?=\S)/g, '$1\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }
  return blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** Deterministic pick for fallback variety (no Math.random in handler). */
const pickVariant = (seed, variants) => {
  if (!variants.length) return ''
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const idx = Math.abs(h) % variants.length
  return variants[idx]
}

const blob = (categoryName, subcategoryName, title) =>
  `${categoryName} ${subcategoryName} ${title}`.toLowerCase()

const formatContextBlock = ({ priceText, unit, deliveryAvailable, regionName, districtName }) => {
  const lines = []
  const loc = [toTrimmedString(regionName), toTrimmedString(districtName)].filter(Boolean).join(', ')
  if (loc) lines.push(`Joylashuv: ${loc}.`)
  const p = toTrimmedString(priceText)
  const u = toTrimmedString(unit)
  if (p) {
    lines.push(u ? `Narx: ${p} so'm / ${u}.` : `Narx: ${p} so'm.`)
  } else {
    lines.push(`Narx bo'yicha telefon orqali kelishamiz.`)
  }
  if (typeof deliveryAvailable === 'boolean') {
    lines.push(deliveryAvailable ? 'Yetkazib berish mavjud.' : "Yetkazib berish mavjud emas.")
  }
  return lines.join('\n')
}

const buildCommercialPromptLines = ({ priceText, unit, deliveryAvailable, regionName, districtName }) => {
  const loc = [toTrimmedString(regionName), toTrimmedString(districtName)].filter(Boolean).join(', ')
  const p = toTrimmedString(priceText)
  const u = toTrimmedString(unit)
  return [
    "Formadan kelgan ma'lumotlarni tavsifga qo'shing (raqamlarni o'zgartirmang):",
    loc ? `Joylashuv: ${loc}` : 'Joylashuv: kiritilmagan',
    p ? `Narx (so'mda, forma bo'yicha): ${p}` : 'Narx: kiritilmagan',
    u ? `Birlik: ${u}` : 'Birlik: kiritilmagan',
    typeof deliveryAvailable === 'boolean'
      ? `Yetkazib berish: ${deliveryAvailable ? 'ha' : "yo'q"}`
      : 'Yetkazib berish: noma\'lum',
  ].join('\n')
}

/**
 * @returns {'wanted' | 'rent' | 'service' | 'sale'}
 */
const inferIntent = (categoryName, subcategoryName, title) => {
  const b = blob(categoryName, subcategoryName, title)
  if (/\b(qidiray|qidirayapman|qidiramiz|kerak|olaman|olmoqchi|xarid qil|olib qol)\b/.test(b)) return 'wanted'
  if (/\b(ijaraga|ijara|ijaraga beriladi|arenda)\b/.test(b)) return 'rent'
  if (
    /\bxizmat\b/.test(b) ||
    /xizmatlar/i.test(categoryName) ||
    /\b(transport|ta'mirlash|yuk tashish)\b/.test(b)
  ) {
    return 'service'
  }
  return 'sale'
}

/**
 * Sale body lines: vary by what is sold (hayvon, sabzavot, boshqalar).
 * @returns {string[]}
 */
const saleBodyLines = (categoryName, subcategoryName, title) => {
  const b = blob(categoryName, subcategoryName, title)
  const name = title.trim() || subcategoryName
  const nameLc = name.toLowerCase()

  if (/otlar/i.test(b)) {
    return [
      `Sog'lom otlar, mashq va ishlatishga mos. Ko'rib chiqish va shartlar bo'yicha kelishamiz.`,
      "📞 Qo'ng'iroq qiling — ko'rish va narxni gaplashamiz.",
    ]
  }
  if (/(tuya|qatir|xach|sigir|buqa|\bot\b)/i.test(b)) {
    return [
      `Sog'lom holatda, hujjatlari tartibda. Ko'rib chiqish, narxi va yetkazib berish bo'yicha muzokara qilamiz.`,
      "📞 Avvalo qo'ng'iroq qiling — shartlarni aniq aytamiz.",
    ]
  }
  if (/(qo'y|qo'zi|echki)/i.test(b)) {
    return [
      `Sog'lom va parvarishlangan ${nameLc}. Chobonchilik va fermalar uchun mos; ulgurji yoki chakana. Holat va narx bo'yicha kelishamiz.`,
      "📞 Qo'ng'iroq qiling — surat yoki ko'rishni rejalashtiramiz.",
    ]
  }
  if (/(xo'roz|tovuq|bedana|cho'chqa|quyon|kurka)/i.test(b)) {
    const poultryDetail = pickVariant(`${categoryName}|${subcategoryName}|${title}`, [
      `Jonivorlar veterinor ko'rigidan o'tgan, yemish va parvarish bir xil tartibda. Soni cheklangan — avvali kelgan oladi.`,
      `Ovqatlanishi tabiiy asosda; qafas va hovli sharoitida bo'lib o'sgan. Yetkazib berishda qutquloq va sovuq zanjirni hisobga olamiz.`,
      `Turli yosh oralig'ida mavjud; ulkan partiya uchun alohida chegirma mumkin. Namunani ko'rib keyin qaror qilish mumkin.`,
      `Mahalliy fermadan; rang va sog'liq jihatidan tanlov keng. Dam olish kunlari ko'rish rejalashtirilishi mumkin.`,
    ])
    const poultryClose = pickVariant(`close|${title}`, [
      "📞 Oldindan qo'ng'iroq qiling — qaysi kunga nechta kerakligini ayting.",
      "📞 Telegram orqali yozing yoki qo'ng'iroq qiling — mavjud sonni aniqlab beramiz.",
      '📞 Band bo\'lsangiz, qisqa SMS qoldiring — sizga qayta aloqaga chiqamiz.',
    ])
    return [
      `Sog'lom va parvarishlangan ${nameLc}. Fermalar va uy xo'jaligi uchun mos; dona yoki partiya. ${poultryDetail}`,
      poultryClose,
    ]
  }
  if (/(sabzavot|meva|piyoz|sabzi|uzum|olma|bodring|pamidor)/i.test(b)) {
    return [
      `Yangi yig'ilgan, toza va sifatli ${nameLc}. Mahalliy yetishtirilgan; do'konlar, oshxonalar va uy uchun qulay. Ulgurji va chakana savdo bor. Narx va yetkazib berish bo'yicha kelishamiz.`,
      "📞 Qo'ng'iroq qiling — miqdor va narxni telefonda kelishamiz.",
    ]
  }
  if (/(asal|don|bug'doy|sholi|yog'|un|guruch|loviya)/i.test(b)) {
    return [
      `Sifatli ${nameLc}, saqlash sharoiti yaxshi. Partiya va miqdor bo'yicha kelishamiz; yetkazib berishni ham muhokama qilamiz.`,
      "📞 Hoziroq qo'ng'iroq qiling — partiya va narx bo'yicha gaplashamiz.",
    ]
  }
  if (/hayvon/i.test(b)) {
    return [
      `Sog'lom holatda, tafsilot va hujjatlar bo'yicha kelishamiz. Ko'rib chiqish va narxi bo'yicha muzokara qilamiz.`,
      "📞 Qo'ng'iroq qiling — tur va narxni aniq aytamiz.",
    ]
  }
  const genericBody = pickVariant(`${categoryName}|${subcategoryName}|${title}|body`, [
    `Mahsulot namunasi bilan tanishib ko'rishingiz mumkin. Shartlar aniq — ortiqcha o'ralashuvsiz narxi va muddatni kelishamiz.`,
    `Partiya yoki dona bo'yicha kelishuv ochiq. Hudud ichida yetkazib berish vaqtini telefonda aniqlaymiz.`,
    `Sifat va miqdor bo'yicha savollaringizni bemalol bering. Tezkor aloqa — band bo'lsangiz, keyinroq qayta qo'ng'iroq qilamiz.`,
    `Yangi kelgan partiya; rang va holat bo'yicha surat yuborish mumkin. Oldindan buyurtma qabul qilinadi.`,
    `Oilaviy iste'mol yoki savdo uchun mos. Tanlov va narxlash aniq — batafsil ma'lumot uchun aloqa.`,
  ])
  const genericClose = pickVariant(`${categoryName}|${subcategoryName}|${title}|close`, [
    "📞 Qo'ng'iroq qiling — qaysi miqdor va qachon kerakligini ayting.",
    '📞 Xabar qoldiring, qisqa vaqt ichida javob beramiz.',
    "📞 Qo'ng'iroq yoki SMS — qulay usulingiz bo'yicha javob beramiz.",
  ])
  return [genericBody, genericClose]
}

const openingLine = (intent, subcategoryName, title, categoryName) => {
  const subject = title.trim() || subcategoryName
  const seed = `${categoryName ?? ''}|${subcategoryName ?? ''}|${subject}`
  if (intent === 'wanted') {
    return pickVariant(seed, [`${subject} kerak!`, `Qidiruv: ${subject}`, `${subject} bo'yicha taklif kutaman.`])
  }
  if (intent === 'rent') {
    return pickVariant(seed, [`${subject} ijaraga!`, `Ijara: ${subject}`, `${subject} — ijara uchun ko'rib chiqing.`])
  }
  if (intent === 'service') {
    if (/xizmat/i.test(subject)) {
      return pickVariant(seed, [`${subject}!`, `${subject} — buyurtma qabul qilamiz.`, `${subject} bo'yicha yordam.`])
    }
    return pickVariant(seed, [`${subject} xizmati!`, `Professional ${subject}`, `${subject} — vaqt va hudud bo'yicha.`])
  }
  return pickVariant(seed, [
    `${subject} sotiladi!`,
    `Yangi kelish: ${subject}`,
    `${subject} — sifat va narx mos.`,
    `Diqqat: ${subject}. Cheklangan miqdor.`,
  ])
}

const createFallbackDescription = ({ categoryName, subcategoryName, title, commercial }) => {
  const intent = inferIntent(categoryName, subcategoryName, title)
  const ctx = commercial ? formatContextBlock(commercial) : ''

  if (intent === 'wanted') {
    const s = title.trim() || subcategoryName
    return [
      openingLine(intent, subcategoryName, title),
      ctx,
      `Agar taklif bo'lsa, tafsilot va narxni yozing. ${s} bo'yicha qidiruv davom etmoqda.`,
      "📞 Qo'ng'iroq qiling — shartlarni tezda kelishamiz.",
    ]
      .filter(Boolean)
      .join('\n')
  }
  if (intent === 'rent') {
    return [
      openingLine(intent, subcategoryName, title, categoryName),
      ctx,
      `Muddat va shartlar bo'yicha muzokara qilamiz. Ko'rib chiqish mumkin.`,
      "📞 Qo'ng'iroq qiling — vaqt va narxni aniqlaymiz.",
    ]
      .filter(Boolean)
      .join('\n')
  }
  if (intent === 'service') {
    return [
      openingLine(intent, subcategoryName, title),
      ctx,
      `Tajriba va sifat kafolati. Vaqt va hudud bo'yicha kelishamiz; narxni obyektga qarab belgilaymiz.`,
      "📞 Qo'ng'iroq qiling — buyurtma va bahoni aniqlaymiz.",
    ]
      .filter(Boolean)
      .join('\n')
  }

  const body = saleBodyLines(categoryName, subcategoryName, title)
  return [openingLine(intent, subcategoryName, title, categoryName), ctx, ...body].filter(Boolean).join('\n')
}

const sendFallbackDescription = (res, description, warning) =>
  res.status(200).json({
    description,
    source: 'fallback',
    warning,
  })

const buildPrompt = ({ categoryName, subcategoryName, title, commercial }) => {
  const titleLine = title ? `Sarlavha: ${title}` : 'Sarlavha: berilmagan'
  const intent = inferIntent(categoryName, subcategoryName, title)
  const intentHint =
    intent === 'wanted'
      ? "Bu e'lon sotuv emas — xaridor qidiruvi (kerak/olaman) bo'lishi mumkin. Birinchi qator va matn shunga mos bo'lsin."
      : intent === 'rent'
        ? "Bu ijara e'lon bo'lishi mumkin — 'ijaraga', muddat, ko'rish."
        : intent === 'service'
          ? "Bu xizmat e'lon — ish hajmi, hudud, vaqt; 'sotiladi' o'rniga xizmatga mos ibora."
          : "Bu sotuv e'lon — mahsulotning o'ziga xos jihatlari (hayvon/sabzavot/jihoz va hokazo) bo'yicha alohida yozing."

  const lines = [
    "Daladan uchun BO'LSHA E'LON TAVSIFI yozing. Bir nechta band: boshlovchi qator(lar), asosiy matn (batafsil), oxirida aloqa. Har bir generatsiya boshqa e'longa o'xshamasin — takroriy andozalardan qoching.",
    `Kategoriya: ${categoryName}`,
    `Subkategoriya: ${subcategoryName}`,
    titleLine,
  ]
  if (commercial) {
    lines.push('', buildCommercialPromptLines(commercial))
  }
  lines.push(
    '',
    `E'lon turi (taxminiy): ${intent}. ${intentHint}`,
    '',
    "TAXMINIY VA BATAFSIL MATN (majburiy jihat): Formadan kelgan narx, so'm, birlik, joy — faqat FORMA bo'yicha, raqamlarni o'zgartirmang. SHUNING O'RNIGA mahsulot/xizmatga mos TAXMINIY (o'ylab topilgan bo'lishi mumkin) tafsilotlar qo'shing: hayvon uchun — taxminiy yosh oralig'i, vazn, zot yoki rang, parvarish joyi, veterinor/eslatma; o'simlik uchun — hosil mavsumi, saqlash, sort; jihoz uchun — holat, razmer, komplektatsiya va hokazo. Bu ma'lumotlar namunaviy — sotuvchi keyin tahrirlashi mumkin, shuning uchun ilhom beruvchi va sinxron bo'lsin.",
    '',
    "QAYTA TAKRORLASH TA'QIQLANADI: 'Holati yaxshi', 'muzokaraga ochiqmiz', 'batafsil ma'lumot beramiz' kabi har e'londa bir xil ishlatiladigan sukut jumlalar yozmang. Har safar boshqacha birinchi qator, boshqa kesim va boshqa yakuniy gap ishlating.",
    '',
    "Uslub (ixtiyoriy): Savdo/jihoz/variantlar bo'lsa — qisqa bloklar, qavsda narx, emoji yoki ✅ faqat mos bo'lsa. Oddiy hayvon/meva e'lonida ham kamida 5-7 ta to'liq jumla (tarkibiyroq) yozing — juda qisqa bo'lib qolmasin.",
    '',
    "FORMAT (majburiy): Bitta uzun paragraf TUSHIRMANG. Har bir mantiqiy bo'lakdan keyin bo'sh qator (\\n\\n) qoldiring — jumlalarni bir-ikki martaba keyin pastga tushing. Birinchi blokda qisqa tuzilish: joy/mahsulot; mos bo'lsa 📍 🐔 💰 🚚 📞 kabi 0-4 ta emoji (mazmunga xizmat qilsin). Narx va yetkazib berish alohida qator yoki blokda. Oxirida aloqa. Markdown va # ishlatmang.",
    '',
    'Muhim:',
    '- Formadagi narx, birlik, yetkazib berish va joylashuvni tavsifda aniq qayd eting (narx forma bo\'sh bo\'lsa, "narx bo\'yicha kelishamiz" deb yozing).',
    '- Hayvon uchun "do\'kon/oshxona" kabi noto\'g\'ri bog\'lanishlardan qoching; sabzavot uchun yetishtirish konteksti mos bo\'lsin.',
    '- Xizmat/ijara/qidiruvda "sotiladi" majburiy emas.',
    '- Oxirida aloqa chaqiriq (har gal boshqacha formulirovka — faqat "qo\'ng\'iroq qiling — batafsil" emas).',
    '',
    'Qoidalar:',
    '- Faqat o\'zbek (lotin) tilida.',
    '- Hashtag (#) va * ishlatmang; `-` bilan boshlanuvchi markdown ro\'yxatlardan foydalanmang. Bitta qatorda `✅` bilan qisqa afzallik ruxsat.',
    '- Ko\'p qator va bloklar: 8-15+ qator; har 1-3 jumladan keyin yangi qator (bo\'sh qator bilan) — mobil o\'qish uchun.',
    '- Rasmiy katalog uslubidan qoching.',
  )
  return lines.join('\n')
}

const toProviderError = (data) => {
  if (!data || typeof data !== 'object') return ''
  const source = data
  const nestedMessage = source.error && typeof source.error === 'object' ? toTrimmedString(source.error.message) : ''
  return nestedMessage || toTrimmedString(source.message)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: "Faqat POST so'rovi qo'llab-quvvatlanadi" })
  }

  const body = parseRequestBody(req.body)
  const categoryName = toTrimmedString(body.categoryName)
  const subcategoryName = toTrimmedString(body.subcategoryName)
  const title = toTrimmedString(body.title)
  const commercial = {
    priceText: toTrimmedString(body.priceText),
    unit: toTrimmedString(body.unit),
    deliveryAvailable: typeof body.deliveryAvailable === 'boolean' ? body.deliveryAvailable : undefined,
    regionName: toTrimmedString(body.regionName),
    districtName: toTrimmedString(body.districtName),
  }

  if (!categoryName || !subcategoryName) {
    return res.status(400).json({ error: 'Kategoriya va subkategoriya nomi majburiy' })
  }

  const fallbackDescription = createFallbackDescription({ categoryName, subcategoryName, title, commercial })
  const apiSecret = getDeepseekApiSecret()
  if (!apiSecret) {
    return sendFallbackDescription(
      res,
      fallbackDescription,
      "AI xizmati sozlanmagan. DEEPSEEK_API_SECRET yoki API_SECRET muhit o'zgaruvchisi topilmadi.",
    )
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiSecret}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 1,
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content:
              "Siz Daladan e'lonlari uchun professional yozuvchisiniz. HECH QACHON bitta uzun paragraf berilmaydi: har doim yangi qatorlar va bo'sh qatorlar bilan blok-blok, o'qish oson. Mos emoji ishlating. Har bir javob boshqacha bo'lsin. Taxminiy tafsilotlar mumkin. Umumiy sukut iboralardan qoching. O'zbek lotin.",
          },
          {
            role: 'user',
            content: buildPrompt({ categoryName, subcategoryName, title, commercial }),
          },
        ],
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const providerError = toProviderError(data)
      return sendFallbackDescription(
        res,
        fallbackDescription,
        providerError || "AI tavsifni yaratib bo'lmadi. Vaqtincha namunaviy tavsif qaytarildi.",
      )
    }

    const rawContent =
      data &&
      typeof data === 'object' &&
      Array.isArray(data.choices) &&
      data.choices[0] &&
      data.choices[0].message &&
      typeof data.choices[0].message.content === 'string'
        ? data.choices[0].message.content
        : ''

    const rawSanitized = sanitizeDescription(toTrimmedString(rawContent))
    const generatedDescription = formatDescriptionLayout(rawSanitized)
    const description =
      generatedDescription.length >= 10 ? generatedDescription : formatDescriptionLayout(fallbackDescription)

    return res.status(200).json({ description, source: generatedDescription.length >= 10 ? 'ai' : 'fallback' })
  } catch (error) {
    const warning =
      error instanceof Error && error.message.trim()
        ? error.message
        : "AI xizmatiga ulanishda muammo bo'ldi. Vaqtincha namunaviy tavsif qaytarildi."
    return sendFallbackDescription(res, fallbackDescription, warning)
  }
}
