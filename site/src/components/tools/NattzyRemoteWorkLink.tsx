/** One optional, context-specific discussion link; no tracking code or user data. */
const DISCUSSION_URL =
  "https://nattzy.com/t/working-from-home-how-do-you-stay-focused-when-nobody-is-watching/147?utm_source=toolify365&utm_medium=editorial&utm_campaign=remote_work_timezone";

const LABEL: Record<string, string> = {
  "en": "Working across time zones? Discuss remote-work focus routines on Nattzy",
  "ja": "海外チームで働く方へ：Nattzyで在宅勤務の集中方法を話し合う",
  "zh-CN": "跨时区远程工作？在 Nattzy 交流保持专注的方法",
  "zh-TW": "跨時區遠距工作？在 Nattzy 交流專注的方法",
  "ko": "다른 시간대에서 원격 근무하시나요? Nattzy에서 집중 방법을 나눠 보세요",
  "es": "¿Trabajas entre zonas horarias? Comparte hábitos de concentración en Nattzy",
  "pt-BR": "Trabalha em diferentes fusos? Converse sobre foco no Nattzy",
  "fr": "Travail à distance entre fuseaux horaires : échangez sur la concentration sur Nattzy",
  "de": "Remote-Arbeit über Zeitzonen hinweg? Tausche Fokus-Tipps auf Nattzy aus",
  "it": "Lavori da remoto tra fusi orari? Confrontati sulla concentrazione su Nattzy",
  "ru": "Работаете удалённо в разных часовых поясах? Обсудите концентрацию на Nattzy",
  "ar": "تعمل عن بُعد عبر مناطق زمنية؟ ناقش طرق التركيز على Nattzy",
  "hi": "अलग समय क्षेत्रों में रिमोट काम? Nattzy पर ध्यान बनाए रखने के तरीके साझा करें",
  "id": "Kerja jarak jauh lintas zona waktu? Diskusikan cara fokus di Nattzy",
  "th": "ทำงานระยะไกลข้ามเขตเวลา? พูดคุยเรื่องสมาธิใน Nattzy",
  "vi": "Làm việc từ xa qua nhiều múi giờ? Thảo luận cách tập trung trên Nattzy",
  "tr": "Farklı saat dilimlerinde uzaktan mı çalışıyorsunuz? Nattzy'de odaklanmayı konuşun"
};

export function NattzyRemoteWorkLink({ slug, locale }: { slug: string; locale: string }) {
  if (slug !== "timezone-converter") return null;
  return (
    <aside aria-label={LABEL[locale] ?? LABEL.en} className="mt-5 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
      <a
        href={DISCUSSION_URL}
        rel="noopener noreferrer"
        target="_blank"
        className="font-medium text-brand-600 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {LABEL[locale] ?? LABEL.en}
      </a>
    </aside>
  );
}
