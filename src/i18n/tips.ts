import type { Phase } from '../components/Cycle';
import { defineCopy, useCopy } from '.';

// Home's daily tip (above the ring): general wellbeing ideas for the estimated phase, never
// medical advice. One tip a day, rotating, so the card changes without feeling random.
type TipPhase = Extract<Phase, 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Neutral'>;

const TIPS = defineCopy<{ heading: (phase: string) => string } & Record<TipPhase, string[]>>({
  en: {
    heading: (phase) => `${phase} · tip for today`,
    Menstrual: [
      'Warmth can ease cramps. A heat pack or a warm shower may help.',
      'Go easy on yourself. Gentle stretching or a short walk often feels better than a hard workout.',
      'Iron-rich foods like lentils, spinach and eggs help replace what you lose.',
    ],
    Follicular: [
      'Energy often rises now. A good time to try something new or a livelier workout.',
      'Many people find it easier to focus in this phase. Plan the week ahead.',
      'Vegetables and protein help keep your energy steady.',
    ],
    Ovulation: [
      'You may feel more social and confident. A nice day to meet friends.',
      'Drink plenty of water. It helps your energy and your skin.',
      'A light, one-sided twinge around now is common. Note it in your daily log if you feel it.',
    ],
    Luteal: [
      'Cravings are common now. Whole grains and a little dark chocolate can help.',
      'It’s fine to slow down. Put sleep and a calm evening first.',
      'Less salt and caffeine can ease bloating and tender breasts.',
    ],
    Neutral: [
      'Logging how you feel each day helps you spot your own patterns.',
      'Regular sleep and meals can help your body find its rhythm.',
      'Cycles vary for many reasons. If yours change a lot, it’s worth mentioning to a doctor.',
    ],
  },
  tr: {
    heading: (phase) => `${phase} · bugün için öneri`,
    Menstrual: [
      'Sıcaklık krampları hafifletebilir. Sıcak su torbası ya da ılık bir duş iyi gelebilir.',
      'Kendine nazik davran. Hafif esneme ya da kısa bir yürüyüş, yoğun egzersizden daha iyi gelebilir.',
      'Mercimek, ıspanak, yumurta gibi demirden zengin besinler kaybettiğini yerine koymana yardım eder.',
    ],
    Follicular: [
      'Enerjin bu dönemde genelde yükselir. Yeni bir şey ya da daha tempolu bir antrenman denemek için güzel bir zaman.',
      'Birçok kişi bu evrede daha kolay odaklanır. Haftanı planlamak için iyi bir gün.',
      'Sebze ve protein enerjini dengede tutmana yardım eder.',
    ],
    Ovulation: [
      'Daha sosyal ve kendinden emin hissedebilirsin. Arkadaşlarınla buluşmak için güzel bir gün.',
      'Bol su içmeyi unutma. Enerjine de cildine de iyi gelir.',
      'Bu günlerde tek taraflı hafif bir sızı yaygındır. Hissedersen günlük kaydına not edebilirsin.',
    ],
    Luteal: [
      'Bu dönemde aşerme yaygındır. Tam tahıllar ve biraz bitter çikolata iyi gelebilir.',
      'Yavaşlamak sorun değil. Uykuna ve sakin bir akşama öncelik ver.',
      'Tuzu ve kafeini azaltmak şişkinliği ve göğüs hassasiyetini hafifletebilir.',
    ],
    Neutral: [
      'Her gün nasıl hissettiğini kaydetmek kendi örüntülerini fark etmeni sağlar.',
      'Düzenli uyku ve öğünler vücudunun ritmini bulmasına yardım edebilir.',
      'Döngüler birçok nedenle değişebilir. Seninki çok değişiyorsa bir doktora söylemeye değer.',
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
