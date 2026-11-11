// IndexedDB 저장소 — 일기와 달력 꾸미기는 폰 안에만 저장된다.
const DB_NAME = 'diary'
const STORE = 'entries'
const DAYS = 'days' // 달력 꾸미기: { date, sticker, color, memo, updatedAt }
let dbPromise

const wrap = (req) =>
  new Promise((ok, no) => {
    req.onsuccess = () => ok(req.result)
    req.onerror = () => no(req.error)
  })

function open() {
  if (!dbPromise) {
    const req = indexedDB.open(DB_NAME, 2)
    // 버전 1(일기만 있던 때)에서 올라오면 꾸미기 저장소만 새로 만든다
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' }).createIndex('date', 'date')
      if (!db.objectStoreNames.contains(DAYS)) db.createObjectStore(DAYS, { keyPath: 'date' })
    }
    dbPromise = wrap(req)
  }
  return dbPromise
}

const store = async (mode, name = STORE) => (await open()).transaction(name, mode).objectStore(name)

export const getAll = async () => wrap((await store('readonly')).getAll())
export const putEntry = async (e) => wrap((await store('readwrite')).put(e))
export const deleteEntry = async (id) => wrap((await store('readwrite')).delete(id))

export const getDays = async () => wrap((await store('readonly', DAYS)).getAll())
export const putDay = async (d) => wrap((await store('readwrite', DAYS)).put(d))
export const deleteDay = async (date) => wrap((await store('readwrite', DAYS)).delete(date))

export const clearAll = async () => {
  await wrap((await store('readwrite')).clear())
  await wrap((await store('readwrite', DAYS)).clear())
}
