/**
 * MIRA Nutrition Intelligence — a cycle-aware nutrition companion. Generates a
 * personalised daily meal plan from the user's menstrual phase, goal and any
 * condition (PCOS / low iron), scores the day from logged water + meals,
 * analyses foods against a local nutrition table, and suggests healthier
 * swaps. All on-device and offline.
 */
import { getCycleStats, getProfile, getLogs } from './localStore'

const DAY = 86400000
const iso = (d) => new Date(d).toISOString().slice(0, 10)

// ── Cycle-phase meal plans (curated, women's-health focused) ─────────────────
// Each meal: slot, emoji, name, whyKey (i18n), and macros. Two variants per
// phase, rotated by date so the plan feels fresh.
const PLANS = {
  menstrual: [
    [
      { slot: 'breakfast', emoji: '🍳', name: 'Warm spinach & egg toast', whyKey: 'nuWhyIron', kcal: 320, iron: 4.5, protein: 16 },
      { slot: 'snack1', emoji: '🌰', name: 'Dates & almonds', whyKey: 'nuWhyIron', kcal: 180, iron: 1.8, protein: 5 },
      { slot: 'lunch', emoji: '🥘', name: 'Lentil & beetroot bowl', whyKey: 'nuWhyIron', kcal: 420, iron: 6, protein: 18 },
      { slot: 'snack2', emoji: '🍫', name: 'Herbal tea & a square of dark chocolate', whyKey: 'nuWhyComfort', kcal: 120, iron: 2, protein: 2 },
      { slot: 'dinner', emoji: '🍲', name: 'Warm vegetable & lentil soup', whyKey: 'nuWhyWarm', kcal: 360, iron: 5, protein: 15 },
      { slot: 'hydration', emoji: '🫖', name: 'Warm water & ginger tea', whyKey: 'nuWhyHydrate', kcal: 10, iron: 0, protein: 0 },
      { slot: 'dessert', emoji: '🍮', name: 'Light beetroot halwa', whyKey: 'nuWhyComfort', kcal: 160, iron: 1.5, protein: 3 },
      { slot: 'night', emoji: '🥛', name: 'Turmeric milk', whyKey: 'nuWhyAnti', kcal: 120, iron: 0.5, protein: 6 },
    ],
  ],
  follicular: [
    [
      { slot: 'breakfast', emoji: '🥣', name: 'Greek yogurt, berries & seeds', whyKey: 'nuWhyProtein', kcal: 300, iron: 1.5, protein: 18 },
      { slot: 'snack1', emoji: '🍎', name: 'Apple & peanut butter', whyKey: 'nuWhyEnergy', kcal: 200, iron: 1, protein: 6 },
      { slot: 'lunch', emoji: '🥗', name: 'Grilled paneer/chicken & quinoa salad', whyKey: 'nuWhyProtein', kcal: 450, iron: 3, protein: 30 },
      { slot: 'snack2', emoji: '🥚', name: 'Boiled egg / roasted chana', whyKey: 'nuWhyProtein', kcal: 150, iron: 2, protein: 12 },
      { slot: 'dinner', emoji: '🍚', name: 'Stir-fried veg & brown rice', whyKey: 'nuWhyEnergy', kcal: 420, iron: 2.5, protein: 12 },
      { slot: 'hydration', emoji: '🍋', name: 'Infused water (lemon & mint)', whyKey: 'nuWhyHydrate', kcal: 5, iron: 0, protein: 0 },
      { slot: 'dessert', emoji: '🍓', name: 'Fresh fruit salad', whyKey: 'nuWhyFresh', kcal: 120, iron: 0.5, protein: 2 },
      { slot: 'night', emoji: '🥛', name: 'Warm milk', whyKey: 'nuWhyCalcium', kcal: 120, iron: 0, protein: 6 },
    ],
  ],
  ovulation: [
    [
      { slot: 'breakfast', emoji: '🥑', name: 'Avocado toast & egg', whyKey: 'nuWhyFats', kcal: 360, iron: 2.5, protein: 16 },
      { slot: 'snack1', emoji: '🫐', name: 'Mixed berries', whyKey: 'nuWhyAntiox', kcal: 90, iron: 0.5, protein: 1 },
      { slot: 'lunch', emoji: '🐟', name: 'Salmon/rajma & greens bowl', whyKey: 'nuWhyOmega', kcal: 470, iron: 4, protein: 28 },
      { slot: 'snack2', emoji: '🌰', name: 'A handful of walnuts', whyKey: 'nuWhyFats', kcal: 180, iron: 1, protein: 4 },
      { slot: 'dinner', emoji: '🥦', name: 'Colourful veg & tofu/paneer', whyKey: 'nuWhyAntiox', kcal: 400, iron: 3.5, protein: 22 },
      { slot: 'hydration', emoji: '🥥', name: 'Coconut water', whyKey: 'nuWhyHydrate', kcal: 45, iron: 0.5, protein: 1 },
      { slot: 'dessert', emoji: '🍓', name: 'Dark chocolate & strawberries', whyKey: 'nuWhyAntiox', kcal: 150, iron: 2, protein: 2 },
      { slot: 'night', emoji: '🍵', name: 'Chamomile tea', whyKey: 'nuWhyCalm', kcal: 5, iron: 0, protein: 0 },
    ],
  ],
  luteal: [
    [
      { slot: 'breakfast', emoji: '🥣', name: 'Oats with banana & pumpkin seeds', whyKey: 'nuWhyMagnesium', kcal: 340, iron: 3, protein: 12 },
      { slot: 'snack1', emoji: '🍌', name: 'Banana & nut butter', whyKey: 'nuWhyMagnesium', kcal: 210, iron: 1, protein: 6 },
      { slot: 'lunch', emoji: '🍠', name: 'Sweet potato & chickpea bowl', whyKey: 'nuWhyComplex', kcal: 440, iron: 4, protein: 16 },
      { slot: 'snack2', emoji: '🥜', name: 'Trail mix (nuts & seeds)', whyKey: 'nuWhyMagnesium', kcal: 200, iron: 1.5, protein: 6 },
      { slot: 'dinner', emoji: '🍝', name: 'Whole-grain pasta & veg', whyKey: 'nuWhyComplex', kcal: 430, iron: 3, protein: 14 },
      { slot: 'hydration', emoji: '💧', name: 'Water & chamomile tea', whyKey: 'nuWhyHydrate', kcal: 5, iron: 0, protein: 0 },
      { slot: 'dessert', emoji: '🍪', name: 'Oat & dark-chocolate cookie', whyKey: 'nuWhyComfort', kcal: 170, iron: 1.5, protein: 3 },
      { slot: 'night', emoji: '🍵', name: 'Chamomile tea', whyKey: 'nuWhyCalm', kcal: 5, iron: 0, protein: 0 },
    ],
  ],
}

export function currentPhase() {
  return getCycleStats().phase || 'follicular'
}

/** The day's plan for the current phase (rotates variant by date). */
export function mealPlan() {
  const phase = currentPhase()
  const variants = PLANS[phase] || PLANS.follicular
  const idx = new Date().getDate() % variants.length
  return { phase, meals: variants[idx] }
}

/** Foods to emphasise this phase (for the "recommended foods" strip). */
const PHASE_FOODS = {
  menstrual: [['🥬', 'Spinach'], ['🌰', 'Dates'], ['🍠', 'Beetroot'], ['🫘', 'Lentils'], ['🍫', 'Dark chocolate'], ['🫖', 'Ginger tea']],
  follicular: [['🍓', 'Berries'], ['🥚', 'Eggs'], ['🥣', 'Greek yogurt'], ['🌱', 'Seeds'], ['🍗', 'Lean protein'], ['🍎', 'Fresh fruit']],
  ovulation: [['🫐', 'Blueberries'], ['🥑', 'Avocado'], ['🥦', 'Broccoli'], ['🐟', 'Salmon'], ['🌰', 'Walnuts'], ['🥥', 'Coconut water']],
  luteal: [['🍌', 'Banana'], ['🌾', 'Oats'], ['🎃', 'Pumpkin seeds'], ['🥜', 'Nuts'], ['🍠', 'Sweet potato'], ['🍵', 'Chamomile']],
}
export function phaseFoods() {
  return PHASE_FOODS[currentPhase()] || PHASE_FOODS.follicular
}

// ── Local food table for the analyzer / "AI food camera" ─────────────────────
// name is matched loosely; healthScore 0–100; sub = healthier swap.
export const FOOD_DB = [
  { id: 'burger', emoji: '🍔', name: 'Burger', kcal: 550, protein: 25, carbs: 45, fat: 30, iron: 3, fiber: 2, sugar: 8, health: 35, sub: 'Grilled chicken/veg wrap' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza slice', kcal: 285, protein: 12, carbs: 36, fat: 10, iron: 2, fiber: 2, sugar: 4, health: 45, sub: 'Whole-wheat veggie pizza (2 slices, side salad)' },
  { id: 'fries', emoji: '🍟', name: 'French fries', kcal: 365, protein: 4, carbs: 48, fat: 17, iron: 1, fiber: 4, sugar: 1, health: 30, sub: 'Baked sweet-potato fries' },
  { id: 'soda', emoji: '🥤', name: 'Soft drink', kcal: 150, protein: 0, carbs: 39, fat: 0, iron: 0, fiber: 0, sugar: 39, health: 15, sub: 'Lemon water or coconut water' },
  { id: 'whitebread', emoji: '🍞', name: 'White bread', kcal: 265, protein: 9, carbs: 49, fat: 3, iron: 3, fiber: 2, sugar: 5, health: 45, sub: 'Whole-grain bread' },
  { id: 'samosa', emoji: '🥟', name: 'Samosa', kcal: 260, protein: 4, carbs: 30, fat: 14, iron: 1.5, fiber: 3, sugar: 2, health: 35, sub: 'Baked veg cutlet' },
  { id: 'salad', emoji: '🥗', name: 'Green salad', kcal: 150, protein: 6, carbs: 12, fat: 8, iron: 3, fiber: 5, sugar: 4, health: 90, sub: null },
  { id: 'dal', emoji: '🍲', name: 'Dal / lentils', kcal: 230, protein: 15, carbs: 30, fat: 4, iron: 6, fiber: 8, sugar: 3, health: 92, sub: null },
  { id: 'spinach', emoji: '🥬', name: 'Spinach', kcal: 40, protein: 5, carbs: 4, fat: 0, iron: 6, fiber: 4, sugar: 0, health: 96, sub: null },
  { id: 'oats', emoji: '🥣', name: 'Oats bowl', kcal: 300, protein: 11, carbs: 51, fat: 6, iron: 3, fiber: 8, sugar: 6, health: 88, sub: null },
  { id: 'eggs', emoji: '🥚', name: 'Eggs', kcal: 155, protein: 13, carbs: 1, fat: 11, iron: 2, fiber: 0, sugar: 0, health: 82, sub: null },
  { id: 'banana', emoji: '🍌', name: 'Banana', kcal: 105, protein: 1, carbs: 27, fat: 0, iron: 0.5, fiber: 3, sugar: 14, health: 85, sub: null },
  { id: 'yogurt', emoji: '🥛', name: 'Greek yogurt', kcal: 130, protein: 17, carbs: 8, fat: 4, iron: 0, fiber: 0, sugar: 6, health: 84, sub: null },
  { id: 'chocolate', emoji: '🍫', name: 'Dark chocolate', kcal: 170, protein: 2, carbs: 13, fat: 12, iron: 3.3, fiber: 3, sugar: 7, health: 60, sub: null },
]

export function analyzeFood(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return null
  let f = FOOD_DB.find((x) => x.name.toLowerCase() === q) ||
    FOOD_DB.find((x) => x.name.toLowerCase().includes(q) || q.includes(x.id))
  if (!f) f = FOOD_DB.find((x) => q.split(/\s+/).some((w) => x.name.toLowerCase().includes(w)))
  if (!f) return { unknown: true, name: query }
  const phase = currentPhase()
  // cycle suitability: iron-rich favoured in menstrual, low-sugar in luteal, etc.
  let suit = 'ok'
  if (f.health >= 80) suit = 'great'
  else if (f.health < 45) suit = 'low'
  if (phase === 'menstrual' && f.iron >= 4) suit = 'great'
  return { ...f, phase, suit }
}

// ── Daily water + meal log (own store, keyed by day) ─────────────────────────
const KEY = 'mira.nutrition.v1'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ } }

export const WATER_GOAL = 8
export function getWaterToday() {
  const d = read()
  return (d.water && d.water[iso(Date.now())]) || 0
}
export function addWater(n = 1) {
  const d = read()
  d.water = d.water || {}
  const k = iso(Date.now())
  d.water[k] = Math.max(0, Math.min(WATER_GOAL + 4, (d.water[k] || 0) + n))
  write(d)
  return d.water[k]
}
export function getMealsToday() {
  const d = read()
  return (d.meals || []).filter((m) => iso(m.date) === iso(Date.now()))
}
export function logMeal(meal) {
  const d = read()
  d.meals = d.meals || []
  d.meals.unshift({ date: new Date().toISOString(), ...meal })
  d.meals = d.meals.slice(0, 200)
  write(d)
  return getMealsToday()
}

/** Nutrition score 0–100 from hydration + healthy meals logged today. */
export function nutritionScore() {
  const water = getWaterToday()
  const meals = getMealsToday()
  const healthy = meals.filter((m) => m.healthy !== false).length
  const hydrationPart = Math.min(1, water / WATER_GOAL) // 0..1
  const mealPart = Math.min(1, healthy / 3) // aim ~3 logged healthy meals
  const logged = water > 0 || meals.length > 0
  const score = Math.round(55 + hydrationPart * 25 + mealPart * 20)
  return { score: logged ? score : null, water, healthy, meals: meals.length }
}

/** Grocery list derived from today's plan (deduped ingredients). */
export function groceryList() {
  const { meals } = mealPlan()
  const items = new Map()
  meals.forEach((m) => {
    // split the meal name into shoppable words, keep the emoji with the meal
    m.name.replace(/\([^)]*\)/g, '').split(/[&,]| and /i).forEach((part) => {
      const t = part.trim().replace(/^(a |light |warm |fresh |grilled |boiled |mixed |whole-grain |whole-wheat )/i, '')
      if (t.length > 2 && !/tea|water|milk/i.test(t)) items.set(t.toLowerCase(), t)
    })
  })
  return [...items.values()].slice(0, 14)
}

/** One meaningful nutrition insight per day. */
export function nutritionInsight() {
  const phase = currentPhase()
  const logs = getLogs()
  // pattern: breakfast often skipped in luteal
  const luteal = logs.filter((l) => l.phase === 'luteal')
  if (phase === 'luteal' && luteal.length >= 3) return { key: 'nuInsBreakfastLuteal' }
  const mealsToday = getMealsToday()
  if (getWaterToday() < 3 && new Date().getHours() >= 14) return { key: 'nuInsHydrate' }
  if (!mealsToday.length) return { key: `nuInsPhase_${phase}` }
  return { key: `nuInsPhase_${phase}` }
}

export const SUBSTITUTES = [
  { from: '🍟 French fries', to: '🍠 Sweet-potato fries' },
  { from: '🥤 Soft drinks', to: '🍋 Lemon / coconut water' },
  { from: '🍞 White bread', to: '🌾 Whole-grain bread' },
  { from: '🍫 Milk chocolate', to: '🍫 Dark chocolate (70%+)' },
  { from: '🍚 White rice', to: '🍚 Brown rice / millets' },
]
