export const INCOME_DATA_CHANGED = 'income-data-changed'

export function notifyIncomeDataChanged() {
  window.dispatchEvent(new Event(INCOME_DATA_CHANGED))
}
