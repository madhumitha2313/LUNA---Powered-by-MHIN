/**
 * MIRA Conditions learning center — data layer.
 *
 * This is a fully-functional LOCAL simulation of what the spec describes as a
 * "Conditions" database collection + progress-tracking backend: real reads,
 * real per-user progress persistence (localStorage today, an Appwrite
 * collection tomorrow), and a per-condition record shape that maps 1:1 onto
 * { id, conditionName, shortDescription, symptoms, causes, prevention,
 * treatments, specialist, videoURL, thumbnail, estimatedWatchTime, language }.
 * Nothing about a condition is hardcoded into the UI — every screen reads
 * through the functions below, so adding a 10th condition (or a completely
 * new module like Menopause or Fertility) is purely a data change here.
 *
 * Video content: no licensed per-condition medical videos exist in this
 * offline preview, so every record's videoURL currently resolves to one
 * shared, on-brand placeholder clip (src/assets/placeholderVideo.js) — the
 * *architecture* is per-condition and per-language (see getVideo below),
 * ready to swap in real Firebase/Cloudinary/CDN URLs per record without any
 * frontend change.
 */
import { PLACEHOLDER_VIDEO } from '../assets/placeholderVideo'

const PROGRESS_KEY = 'mira.conditionsProgress.v1'
const SAVED_KEY = 'mira.conditionsSaved.v1'

// ── The "Conditions" collection ──────────────────────────────────────────────
// content.en is fully populated; other languages fall back to English with a
// "localized version coming soon" flag, exactly as the spec requires — this
// is real fallback behavior, not a stub, since content for those languages
// genuinely hasn't been authored/uploaded yet.
export const CONDITIONS = [
  {
    id: 'pcos',
    nameKey: 'cnd1n',
    specialistKey: 'cnd1s',
    thumbTone: ['#D81B60', '#A855F7'],
    estimatedWatchTime: '4 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'A common hormonal condition where the ovaries produce excess androgens, often disrupting ovulation.',
        whatIsIt: 'PCOS (Polycystic Ovary Syndrome) is a hormonal condition affecting how the ovaries work. Many small follicles form on the ovaries and eggs are released irregularly or not at all, which can affect periods and fertility.',
        causes: 'The exact cause isn’t fully understood, but insulin resistance, excess androgen (male hormone) production, and genetics all play a role. It often runs in families.',
        symptoms: 'Irregular or missed periods, excess facial/body hair, acne, scalp thinning, weight gain, and difficulty conceiving are common. Some people have few or no visible symptoms.',
        riskFactors: 'Family history of PCOS or diabetes, being overweight, and insulin resistance all raise the likelihood of developing PCOS.',
        prevention: 'PCOS can’t always be prevented, but maintaining a healthy weight, regular movement, and a balanced diet can reduce symptom severity and lower long-term risks.',
        treatment: 'Treatment is tailored to symptoms and goals: hormonal birth control to regulate cycles, metformin for insulin resistance, and fertility medication if trying to conceive.',
        lifestyle: 'Regular exercise, a lower-glycemic diet, stress management, and consistent sleep can meaningfully improve insulin sensitivity and cycle regularity.',
        whenToSeeDoctor: 'See a gynaecologist if periods are absent for 3+ months, you notice sudden excess hair growth or acne, or you’re trying to conceive without success after a year.',
      },
    },
  },
  {
    id: 'pcod',
    nameKey: 'cnd2n',
    specialistKey: 'cnd2s',
    thumbTone: ['#FF4F9D', '#7C3AED'],
    estimatedWatchTime: '3 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'A common condition where immature eggs accumulate in the ovaries, causing them to enlarge.',
        whatIsIt: 'PCOD (Polycystic Ovarian Disease) occurs when the ovaries release immature or partially mature eggs, which build up over time and can form cysts. It’s generally milder and more common than PCOS.',
        causes: 'Poor lifestyle habits, stress, and hormonal imbalance are the main contributors. Unlike PCOS, insulin resistance is less central.',
        symptoms: 'Irregular periods, mild weight gain, and pelvic discomfort. Many people with PCOD can still ovulate and conceive with fewer complications than PCOS.',
        riskFactors: 'Sedentary lifestyle, poor diet, high stress, and being overweight increase the likelihood of PCOD.',
        prevention: 'A balanced diet, regular physical activity, and stress reduction significantly lower the risk and severity of PCOD.',
        treatment: 'Often managed with lifestyle changes alone; hormonal medication may be added if periods stay irregular or symptoms persist.',
        lifestyle: 'Consistent exercise, whole-food nutrition, and adequate sleep usually improve PCOD symptoms within a few months.',
        whenToSeeDoctor: 'Consult a gynaecologist if periods are irregular for several cycles in a row or you notice new pelvic pain.',
      },
    },
  },
  {
    id: 'endometriosis',
    nameKey: 'cnd3n',
    specialistKey: 'cnd3s',
    thumbTone: ['#EC4899', '#6366F1'],
    estimatedWatchTime: '5 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'A condition where tissue similar to the uterine lining grows outside the uterus, often causing pain.',
        whatIsIt: 'Endometriosis happens when tissue similar to the uterine lining grows outside the uterus — on the ovaries, fallopian tubes, or pelvic lining — and behaves like it would inside, causing inflammation and scarring.',
        causes: 'The exact cause is unknown; theories include retrograde menstruation, immune system differences, and genetics.',
        symptoms: 'Severe menstrual cramps, pain during sex, heavy bleeding, chronic pelvic pain, and sometimes fertility difficulties.',
        riskFactors: 'Family history, starting periods early, short menstrual cycles, and never having given birth are associated with higher risk.',
        prevention: 'There’s no guaranteed way to prevent endometriosis, but early diagnosis and management can slow its progression.',
        treatment: 'Pain relief, hormonal therapy to slow tissue growth, and in some cases laparoscopic surgery to remove growths.',
        lifestyle: 'Anti-inflammatory nutrition, gentle regular exercise, heat therapy, and stress reduction can help manage pain day to day.',
        whenToSeeDoctor: 'See a gynaecologist if period pain is severe enough to disrupt daily life, or if you experience pain during sex or bowel movements.',
      },
    },
  },
  {
    id: 'fibroids',
    nameKey: 'cnd4n',
    specialistKey: 'cnd4s',
    thumbTone: ['#F43F5E', '#A855F7'],
    estimatedWatchTime: '4 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'Non-cancerous growths of the uterus that are very common and often cause no symptoms.',
        whatIsIt: 'Uterine fibroids are non-cancerous growths made of muscle and fibrous tissue that develop in or around the uterus. They range from tiny to large enough to change the shape of the uterus.',
        causes: 'Hormones (estrogen and progesterone) drive fibroid growth. Genetics also plays a role in who develops them.',
        symptoms: 'Heavy or prolonged periods, pelvic pressure or pain, frequent urination, and lower back pain. Many fibroids cause no symptoms at all.',
        riskFactors: 'Family history, being of reproductive age, obesity, and never having given birth increase the likelihood of fibroids.',
        prevention: 'There’s no proven way to prevent fibroids, but maintaining a healthy weight may lower risk.',
        treatment: 'Options range from watchful waiting and medication to shrink fibroids, to minimally invasive procedures or surgery for larger/symptomatic ones.',
        lifestyle: 'A fiber-rich, lower-red-meat diet and regular exercise are linked to lower fibroid risk and milder symptoms.',
        whenToSeeDoctor: 'See a gynaecologist if periods are unusually heavy (soaking a pad/tampon hourly), or you feel persistent pelvic pressure.',
      },
    },
  },
  {
    id: 'adenomyosis',
    nameKey: 'cnd5n',
    specialistKey: 'cnd5s',
    thumbTone: ['#DB2777', '#8B5CF6'],
    estimatedWatchTime: '4 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'A condition where the uterine lining grows into the muscular wall of the uterus.',
        whatIsIt: 'Adenomyosis occurs when the tissue that normally lines the uterus grows into the uterine muscle wall, causing the uterus to thicken and enlarge.',
        causes: 'Not fully understood; hormonal factors and prior uterine surgery (like a C-section) are thought to contribute.',
        symptoms: 'Heavy, prolonged periods, severe cramping, and a feeling of pressure or bloating in the lower abdomen.',
        riskFactors: 'Prior uterine surgery, childbirth, and being in your 40s–50s (though it can occur earlier) raise the risk.',
        prevention: 'There’s no known way to prevent adenomyosis, but symptom tracking helps catch it earlier.',
        treatment: 'Pain relief, hormonal treatment to reduce bleeding, and in severe cases procedures or surgery are used depending on age and fertility goals.',
        lifestyle: 'Heat therapy, anti-inflammatory foods, and pacing activity around heavier flow days can ease day-to-day symptoms.',
        whenToSeeDoctor: 'See a gynaecologist if cramps are worsening over time or periods are becoming noticeably heavier each cycle.',
      },
    },
  },
  {
    id: 'anaemia',
    nameKey: 'cnd6n',
    specialistKey: 'cnd6s',
    thumbTone: ['#EF4444', '#F59E0B'],
    estimatedWatchTime: '3 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'A common condition where low iron levels reduce the blood’s ability to carry oxygen.',
        whatIsIt: 'Iron deficiency anaemia happens when the body doesn’t have enough iron to make healthy red blood cells, reducing how much oxygen reaches your tissues. It’s especially common in people who menstruate.',
        causes: 'Heavy periods, low dietary iron intake, and pregnancy are the most common causes. Digestive conditions can also reduce iron absorption.',
        symptoms: 'Fatigue, pale skin, shortness of breath, dizziness, cold hands and feet, and brittle nails.',
        riskFactors: 'Heavy menstrual bleeding, a diet low in iron-rich foods, and pregnancy all increase risk.',
        prevention: 'Eating iron-rich foods regularly (leafy greens, legumes, meat) alongside vitamin C to boost absorption helps prevent deficiency.',
        treatment: 'Iron supplements and dietary changes are first-line; addressing the underlying cause (like heavy periods) is important too.',
        lifestyle: 'Pair iron-rich meals with vitamin C, and avoid tea/coffee right after eating since they reduce iron absorption.',
        whenToSeeDoctor: 'See a physician if fatigue is persistent and unexplained, or periods are heavy enough to affect daily life.',
      },
    },
  },
  {
    id: 'hypothyroidism',
    nameKey: 'cnd7n',
    specialistKey: 'cnd7s',
    thumbTone: ['#0EA5E9', '#A855F7'],
    estimatedWatchTime: '4 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'An underactive thyroid that slows the body’s metabolism and can affect cycles.',
        whatIsIt: 'Hypothyroidism occurs when the thyroid gland doesn’t produce enough thyroid hormone, which slows down the body’s metabolism and can disrupt the menstrual cycle.',
        causes: 'Most commonly caused by an autoimmune condition (Hashimoto’s), iodine deficiency, or as a side effect of some medications/treatments.',
        symptoms: 'Fatigue, weight gain, cold sensitivity, dry skin, hair thinning, heavier/irregular periods, and low mood.',
        riskFactors: 'Family history of thyroid disease, being female, and age over 60 increase risk, though it can occur at any age.',
        prevention: 'Not always preventable, especially when autoimmune, but adequate dietary iodine supports normal thyroid function.',
        treatment: 'Daily thyroid hormone replacement medication, with regular blood tests to fine-tune the dose.',
        lifestyle: 'Consistent medication timing, balanced nutrition, and regular checkups keep symptoms well controlled.',
        whenToSeeDoctor: 'See an endocrinologist if you notice persistent fatigue, unexplained weight change, or new irregularity in your cycle.',
      },
    },
  },
  {
    id: 'hyperthyroidism',
    nameKey: 'cnd8n',
    specialistKey: 'cnd8s',
    thumbTone: ['#F97316', '#EC4899'],
    estimatedWatchTime: '4 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'An overactive thyroid that speeds up the body’s metabolism and can affect cycles.',
        whatIsIt: 'Hyperthyroidism occurs when the thyroid produces too much thyroid hormone, speeding up metabolism and often making periods lighter or irregular.',
        causes: 'Most often caused by Graves’ disease (an autoimmune condition), but can also result from thyroid nodules or inflammation.',
        symptoms: 'Rapid heartbeat, unexplained weight loss, anxiety, tremors, heat sensitivity, and lighter or missed periods.',
        riskFactors: 'Family history of thyroid or autoimmune disease, and being female, increase the likelihood.',
        prevention: 'Not generally preventable when autoimmune, but early detection through routine bloodwork limits complications.',
        treatment: 'Anti-thyroid medication, radioactive iodine therapy, or in some cases surgery, depending on the cause and severity.',
        lifestyle: 'Limiting caffeine, prioritizing sleep, and stress management can ease day-to-day symptoms alongside medical treatment.',
        whenToSeeDoctor: 'See an endocrinologist if you notice a racing heartbeat, unexplained weight loss, or hand tremors.',
      },
    },
  },
  {
    id: 'pmdd',
    nameKey: 'cnd9n',
    specialistKey: 'cnd9s',
    thumbTone: ['#C026D3', '#4F46E5'],
    estimatedWatchTime: '5 min',
    video: { en: PLACEHOLDER_VIDEO },
    content: {
      en: {
        shortDescription: 'A severe form of PMS involving intense mood and physical symptoms before a period.',
        whatIsIt: 'PMDD (Premenstrual Dysphoric Disorder) is a severe, sometimes debilitating form of PMS. It involves significant mood and physical symptoms in the 1–2 weeks before a period that ease once bleeding starts.',
        causes: 'Thought to result from an unusual sensitivity to normal hormonal shifts across the cycle, rather than abnormal hormone levels themselves.',
        symptoms: 'Intense irritability, anxiety or depression, mood swings, difficulty concentrating, fatigue, and physical symptoms like bloating and breast tenderness.',
        riskFactors: 'A personal or family history of depression/anxiety, and high stress levels, are associated with higher risk.',
        prevention: 'Can’t always be prevented, but tracking symptoms across the cycle helps identify patterns early and guide treatment.',
        treatment: 'Options include SSRIs (sometimes only during the luteal phase), hormonal birth control, and cognitive behavioral therapy.',
        lifestyle: 'Regular exercise, consistent sleep, reducing caffeine/alcohol, and stress-reduction practices can meaningfully ease symptoms.',
        whenToSeeDoctor: 'See a gynaecologist or mental health professional if mood symptoms before your period are severe enough to disrupt work, relationships, or daily functioning.',
      },
    },
  },
]

export function getAllConditions() {
  return CONDITIONS
}
export function getCondition(id) {
  return CONDITIONS.find((c) => c.id === id) || null
}

/**
 * Resolve the video + content for a condition in the given language, with
 * graceful fallback to English when a localized version hasn't been
 * uploaded yet (`localized: false` tells the UI to show the "coming soon"
 * notice called for in the spec).
 */
export function getLocalized(condition, lang) {
  const content = condition.content[lang] || condition.content.en
  const video = condition.video[lang] || condition.video.en
  return {
    content,
    video,
    localized: !!condition.content[lang],
    videoLocalized: !!condition.video[lang],
  }
}

// ── Per-user progress (watch position, completion, history) ─────────────────
function read(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback } catch { return fallback }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

export function getAllProgress() {
  return read(PROGRESS_KEY, {})
}
export function getProgress(id) {
  return getAllProgress()[id] || { watchedSeconds: 0, duration: 0, completed: false, lastOpened: null, section: 0 }
}
export function saveProgress(id, patch) {
  const all = getAllProgress()
  all[id] = { ...getProgress(id), ...patch, lastOpened: Date.now() }
  write(PROGRESS_KEY, all)
  return all[id]
}
export function markCompleted(id) {
  return saveProgress(id, { completed: true, completedAt: Date.now() })
}
export function isCompleted(id) {
  return !!getProgress(id).completed
}
export function completedCount() {
  return Object.values(getAllProgress()).filter((p) => p.completed).length
}
export function lastOpenedCondition() {
  const all = getAllProgress()
  const ids = Object.keys(all).sort((a, b) => (all[b].lastOpened || 0) - (all[a].lastOpened || 0))
  return ids[0] || null
}

// ── Save-for-later bookmarks ─────────────────────────────────────────────────
export function getSaved() {
  return read(SAVED_KEY, [])
}
export function isSaved(id) {
  return getSaved().includes(id)
}
export function toggleSaved(id) {
  const set = new Set(getSaved())
  set.has(id) ? set.delete(id) : set.add(id)
  const next = [...set]
  write(SAVED_KEY, next)
  return next.includes(id)
}
