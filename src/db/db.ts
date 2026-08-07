import type { QuestionType } from '@/types/question'
import { questionBank } from '@/data/questionBank'

const DB_NAME = 'gaoshu_db'
const DB_VERSION = 1

export interface StudyRecord {
  /** autoIncrement 主键，写入时省略 */
  id?: number
  questionId: string
  correct: boolean
  userAnswer: string
  ts: number
}

export interface WrongItem {
  questionId: string
  wrongCount: number
  lastWrongTs: number
  wrongType?: QuestionType
}

export interface ProgressInfo {
  key: string
  doneCount: number
  wrongCount: number
  lastTs: number
}

/** 是否支持 IndexedDB（用全局 indexedDB，兼容 node + fake-indexeddb） */
export function isDbSupported(): boolean {
  return typeof indexedDB !== 'undefined'
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('study_record')) {
        const store = db.createObjectStore('study_record', { keyPath: 'id', autoIncrement: true })
        store.createIndex('questionId', 'questionId', { unique: false })
      }
      if (!db.objectStoreNames.contains('wrong_book')) {
        db.createObjectStore('wrong_book', { keyPath: 'questionId' })
      }
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'key' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('IndexedDB 打开被阻塞'))
  })
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

function getAllFromStore<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

/** 由题目 id 推导所在节 key，如 "c1-s1-001" → "c1-s1" */
function sectionKeyOf(questionId: string): string {
  return questionId.split('-').slice(0, 2).join('-')
}

function lookupType(questionId: string): QuestionType | undefined {
  return questionBank.find((q) => q.id === questionId)?.type
}

/**
 * 重算某节 progress 冗余缓存并写回。
 * 需在包含 study_record / wrong_book / progress 的读写事务内调用，
 * 通过 onsuccess 链式串行保证读到的是本事务已写入的最新数据。
 */
function recomputeProgressForSection(tx: IDBTransaction, questionId: string): void {
  const key = sectionKeyOf(questionId)
  const prefix = `${key}-`
  const studyReq = tx.objectStore('study_record').getAll()
  studyReq.onsuccess = () => {
    const records = studyReq.result as StudyRecord[]
    const wrongReq = tx.objectStore('wrong_book').getAll()
    wrongReq.onsuccess = () => {
      const wrongs = wrongReq.result as WrongItem[]
      const doneIds = new Set<string>()
      let lastTs = 0
      for (const r of records) {
        if (r.questionId.startsWith(prefix)) {
          doneIds.add(r.questionId)
          if (r.ts > lastTs) lastTs = r.ts
        }
      }
      const wrongCount = wrongs.filter((w) => w.questionId.startsWith(prefix)).length
      tx.objectStore('progress').put({ key, doneCount: doneIds.size, wrongCount, lastTs })
    }
  }
}

/** 初始化（打开/建库），幂等 */
export async function initDb(): Promise<void> {
  if (!isDbSupported()) {
    console.warn('[db] IndexedDB 不可用，跳过初始化')
    return
  }
  let db: IDBDatabase | null = null
  try {
    db = await openDb()
  } catch (e) {
    console.warn('[db] initDb 失败', e)
  } finally {
    db?.close()
  }
}

/**
 * 记录一次作答。
 * - 追加写 study_record
 * - 答错 → wrong_book upsert（wrongCount +1）；答对 → 移出错题本
 * - 重算并写该节 progress
 */
export async function recordAnswer(
  questionId: string,
  correct: boolean,
  userAnswer: string,
): Promise<void> {
  if (!isDbSupported()) {
    console.warn('[db] IndexedDB 不可用，跳过记录')
    return
  }
  let db: IDBDatabase | null = null
  try {
    db = await openDb()
    const tx = db.transaction(['study_record', 'wrong_book', 'progress'], 'readwrite')
    tx.objectStore('study_record').add({ questionId, correct, userAnswer, ts: Date.now() })
    const wrongStore = tx.objectStore('wrong_book')
    const getReq = wrongStore.get(questionId)
    getReq.onsuccess = () => {
      const existing = getReq.result as WrongItem | undefined
      if (correct) {
        if (existing) wrongStore.delete(questionId)
      } else {
        wrongStore.put({
          questionId,
          wrongCount: (existing?.wrongCount ?? 0) + 1,
          lastWrongTs: Date.now(),
          wrongType: existing?.wrongType ?? lookupType(questionId),
        })
      }
      recomputeProgressForSection(tx, questionId)
    }
    await txDone(tx)
  } catch (e) {
    console.warn('[db] recordAnswer 失败', e)
  } finally {
    db?.close()
  }
}

/** 手动标记错题（answer 题「标记错题」用），同样 upsert 累加 */
export async function addToWrongBook(questionId: string, wrongType: QuestionType): Promise<void> {
  if (!isDbSupported()) {
    console.warn('[db] IndexedDB 不可用，跳过标记')
    return
  }
  let db: IDBDatabase | null = null
  try {
    db = await openDb()
    const tx = db.transaction(['wrong_book', 'study_record', 'progress'], 'readwrite')
    const wrongStore = tx.objectStore('wrong_book')
    const getReq = wrongStore.get(questionId)
    getReq.onsuccess = () => {
      const existing = getReq.result as WrongItem | undefined
      wrongStore.put({
        questionId,
        wrongCount: (existing?.wrongCount ?? 0) + 1,
        lastWrongTs: Date.now(),
        wrongType: wrongType ?? existing?.wrongType,
      })
      recomputeProgressForSection(tx, questionId)
    }
    await txDone(tx)
  } catch (e) {
    console.warn('[db] addToWrongBook 失败', e)
  } finally {
    db?.close()
  }
}

/** 全部错题，按 lastWrongTs 降序；无 IndexedDB 返回 [] */
export async function getWrongBook(): Promise<WrongItem[]> {
  if (!isDbSupported()) {
    console.warn('[db] IndexedDB 不可用，返回空错题本')
    return []
  }
  let db: IDBDatabase | null = null
  try {
    db = await openDb()
    const tx = db.transaction('wrong_book', 'readonly')
    const all = await getAllFromStore<WrongItem>(tx.objectStore('wrong_book'))
    return all.sort((a, b) => b.lastWrongTs - a.lastWrongTs)
  } catch (e) {
    console.warn('[db] getWrongBook 失败', e)
    return []
  } finally {
    db?.close()
  }
}

/** 读某节进度缓存，无记录返回全 0 */
export async function getProgress(
  cid: string,
  sid: string,
): Promise<{ doneCount: number; wrongCount: number; lastTs: number }> {
  const empty = { doneCount: 0, wrongCount: 0, lastTs: 0 }
  if (!isDbSupported()) {
    console.warn('[db] IndexedDB 不可用，返回零进度')
    return empty
  }
  let db: IDBDatabase | null = null
  try {
    db = await openDb()
    const tx = db.transaction('progress', 'readonly')
    const getReq = tx.objectStore('progress').get(`${cid}-${sid}`)
    const result = await new Promise<ProgressInfo | undefined>((resolve, reject) => {
      getReq.onsuccess = () => resolve(getReq.result as ProgressInfo | undefined)
      getReq.onerror = () => reject(getReq.error)
    })
    if (!result) return empty
    return {
      doneCount: result.doneCount ?? 0,
      wrongCount: result.wrongCount ?? 0,
      lastTs: result.lastTs ?? 0,
    }
  } catch (e) {
    console.warn('[db] getProgress 失败', e)
    return empty
  } finally {
    db?.close()
  }
}

export type SectionState = 'todo' | 'doing' | 'done'

/** 章节三色状态判定（纯函数，便于单测） */
export function deriveSectionState(done: number, wrong: number, total: number): SectionState {
  if (done === 0) return 'todo'
  if (done === total && wrong === 0) return 'done'
  return 'doing'
}
