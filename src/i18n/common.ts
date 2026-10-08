import type { FlowLevelName, Phase } from '../components/Cycle';
import type { Mood, Pain } from '../state/log';
import { defineCopy, getCopy, useCopy } from '.';

// Words used on many screens. Logged values are stored in English (`Heavy`, `Cramps`…) and
// translated only for display, so changing the language never touches saved data.
export const COMMON = defineCopy({
  en: {
    /** "1 day", "3 days" */
    days: (n: number) => (n === 1 ? '1 day' : `${n} days`),
    day: (n: number) => `Day ${n}`,
    flow: { None: 'None', Spotting: 'Spotting', Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' } as Record<FlowLevelName, string>,
    pain: { None: 'None', Mild: 'Mild', Moderate: 'Moderate', Severe: 'Severe' } as Record<Pain, string>,
    mood: { Good: 'Good', Okay: 'Okay', Low: 'Low', Irritable: 'Irritable', Anxious: 'Anxious' } as Record<Mood, string>,
    symptom: {
      Cramps: 'Cramps', Headache: 'Headache', 'Tender breasts': 'Tender breasts', Fatigue: 'Fatigue', 'Mood swings': 'Mood swings',
      Bloating: 'Bloating', Acne: 'Acne', Cravings: 'Cravings', 'Back pain': 'Back pain', 'Trouble sleeping': 'Trouble sleeping',
    } as Record<string, string>,
    /** Ring label for each phase. */
    phase: {
      Menstrual: 'Menstrual Phase', Follicular: 'Follicular Phase', Ovulation: 'Ovulation Phase', Luteal: 'Luteal Phase',
      Neutral: 'Irregular cycle', Late: 'Period expected', Empty: 'No cycle data yet',
    } as Record<Phase, string>,
    estimate: 'estimate',
    on: 'On',
    off: 'Off',
    back: 'Back',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    done: 'Done',
    continue: 'Continue',
    skip: 'Skip',
    tryAgain: 'Try again',
  },
  tr: {
    days: (n: number) => `${n} gün`,
    day: (n: number) => `${n}. gün`,
    flow: { None: 'Yok', Spotting: 'Lekelenme', Light: 'Hafif', Medium: 'Orta', Heavy: 'Yoğun' },
    pain: { None: 'Yok', Mild: 'Hafif', Moderate: 'Orta', Severe: 'Şiddetli' },
    mood: { Good: 'İyi', Okay: 'İdare eder', Low: 'Düşük', Irritable: 'Gergin', Anxious: 'Kaygılı' },
    symptom: {
      Cramps: 'Kramp', Headache: 'Baş ağrısı', 'Tender breasts': 'Göğüs hassasiyeti', Fatigue: 'Yorgunluk', 'Mood swings': 'Duygu dalgalanması',
      Bloating: 'Şişkinlik', Acne: 'Sivilce', Cravings: 'Aşerme', 'Back pain': 'Bel ağrısı', 'Trouble sleeping': 'Uyku sorunu',
    },
    phase: {
      Menstrual: 'Adet dönemi', Follicular: 'Foliküler dönem', Ovulation: 'Yumurtlama dönemi', Luteal: 'Luteal dönem',
      Neutral: 'Düzensiz döngü', Late: 'Adet bekleniyor', Empty: 'Henüz döngü verisi yok',
    },
    estimate: 'tahmini',
    on: 'Açık',
    off: 'Kapalı',
    back: 'Geri',
    close: 'Kapat',
    cancel: 'Vazgeç',
    save: 'Kaydet',
    done: 'Tamam',
    continue: 'Devam',
    skip: 'Atla',
    tryAgain: 'Tekrar dene',
  },
});

export const useCommon = () => useCopy(COMMON);
export const getCommon = () => getCopy(COMMON);
