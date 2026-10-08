import type { Phase } from '../components/Cycle';
import { defineCopy, useCopy } from '.';

// Home's daily tip (under the ring): general wellbeing ideas for the estimated phase, never
// medical advice. One tip a day, rotating. Each tip fits two lines of the fixed-height card.
type TipPhase = Extract<Phase, 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Neutral'>;

const TIPS = defineCopy<{ heading: (phase: string) => string } & Record<TipPhase, string[]>>({
  en: {
    heading: (phase) => `${phase} · tip for today`,
    Menstrual: [
      'Warmth can ease cramps. Try a heat pack or a warm shower.',
      'Go easy today. A gentle stretch or short walk can feel good.',
      'Lentils, spinach and eggs help replace the iron you lose.',
    ],
    Follicular: [
      'Energy often rises now. A good day to try something new.',
      'Focus tends to come easier now. Plan the week ahead.',
      'Vegetables and protein help keep your energy steady.',
    ],
    Ovulation: [
      'You may feel more social today. A nice day to see friends.',
      'Drink plenty of water. It helps your energy and your skin.',
      'A light one-sided twinge is common now. Log it if you feel it.',
    ],
    Luteal: [
      'Cravings are common now. Whole grains and dark chocolate help.',
      'It’s fine to slow down. Put sleep and a calm evening first.',
      'Less salt and caffeine can ease bloating and tenderness.',
    ],
    Neutral: [
      'Logging how you feel each day helps you spot your patterns.',
      'Regular sleep and meals help your body find its rhythm.',
      'If your cycles change a lot, mention it to a doctor.',
    ],
  },
  tr: {
    heading: (phase) => `${phase} · bugün için öneri`,
    Menstrual: [
      'Sıcaklık krampları hafifletebilir. Sıcak su torbası dene.',
      'Kendine nazik davran. Hafif esneme ya da kısa bir yürüyüş iyi gelir.',
      'Mercimek, ıspanak ve yumurta kaybettiğin demiri yerine koyar.',
    ],
    Follicular: [
      'Enerjin genelde yükselir. Yeni bir şey denemek için güzel bir gün.',
      'Bu evrede odaklanmak kolaylaşır. Haftanı planlayabilirsin.',
      'Sebze ve protein enerjini dengede tutmana yardım eder.',
    ],
    Ovulation: [
      'Daha sosyal hissedebilirsin. Sevdiklerinle buluşmaya ne dersin?',
      'Bol su içmeyi unutma. Enerjine de cildine de iyi gelir.',
      'Tek taraflı hafif bir sızı bu günlerde yaygındır. Not edebilirsin.',
    ],
    Luteal: [
      'Aşerme bu dönemde yaygın. Tam tahıl ve bitter çikolata iyi gelir.',
      'Yavaşlamak sorun değil. Uykuna ve sakin bir akşama öncelik ver.',
      'Tuzu ve kafeini azaltmak şişkinliği hafifletebilir.',
    ],
    Neutral: [
      'Her gün nasıl hissettiğini kaydetmek örüntülerini gösterir.',
      'Düzenli uyku ve öğünler vücudunun ritmini bulmasına yardım eder.',
      'Döngülerin çok değişiyorsa bunu bir doktora söyleyebilirsin.',
    ],
  },
});

const DAY = 24 * 60 * 60 * 1000;

/** Today's tip for a phase, or null for phases without tips (late, empty). */
export function useTip(phase: Phase, today: Date) {
  const t = useCopy(TIPS);
  if (!(phase in t) || phase === 'Late' || phase === 'Empty') return null;
  const list = t[phase as TipPhase];
  const day = Math.floor((today.getTime() - today.getTimezoneOffset() * 60000) / DAY);
  return { heading: t.heading, text: list[day % list.length] };
}
