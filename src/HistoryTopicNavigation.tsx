import { useEffect, useState } from 'react'
import HistoryTopicTen from './HistoryTopicTen'
import HistoryTopicNine from './HistoryTopicNine'
import HistoryTopicEleven from './HistoryTopicEleven'
import HistoryTopicsOneToFive from './HistoryTopicsOneToFive'
import HistoryTopicsOneTwoFresh from './HistoryTopicsOneTwoFresh'
import HistoryTopicsSixToEight from './HistoryTopicsSixToEight'
import HistoryTopicsTwelveToFourteen from './HistoryTopicsTwelveToFourteen'
import HistoryTopicTwelve from './HistoryTopicTwelve'
import HistoryTopicTenQuiz, { historyTopicMistakesKey } from './HistoryTopicTenQuiz'
import HistoryTopicTwentyNine from './HistoryTopicTwentyNine'
import HistoryTopicsLater from './HistoryTopicsLater'
import HistoryTopicEighteen, { historyTopicEighteenSubtopics } from './HistoryTopicEighteen'

export const historyProgramSections = [
  { title: 'Вступ і стародавня історія України', topics: [1, 2] },
  { title: 'Русь-Україна та середньовічні держави', topics: [3, 4, 5] },
  { title: 'Українські землі у складі Речі Посполитої та козацька доба', topics: [6, 7, 8, 9, 10] },
  { title: 'Українські землі у другій половині XVIII — XIX ст.', topics: [11, 12, 13, 14, 15, 16, 17] },
  { title: 'Україна на початку XX ст. і Українська революція', topics: [18, 19, 20, 21, 22] },
  { title: 'Україна в радянський період і Друга світова війна', topics: [23, 24, 25, 26, 27, 28, 29] },
  { title: 'Відновлення незалежності й сучасна Україна', topics: [30, 31, 32] },
]

const readKey = (id: number) => `nmt-hub:history:topic:${id}:read`
const progressKey = (id: number) => `nmt-hub:history:topic:${id}:progress`

function ActionIcon({ name }: { name: 'list' | 'prev' | 'next' | 'test' | 'check' | 'circle' }) {
  const paths = {
    list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
    prev: <><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></>,
    next: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
    test: <><path d="M8 4h8l3 3v13H5V4h3Z" /><path d="M8 11h8M8 15h8" /><path d="M15 4v4h4" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    circle: <circle cx="12" cy="12" r="9" />,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function readTopicStatuses(count: number) {
  return Array.from({ length: count }, (_, index) => localStorage.getItem(readKey(index + 1)) === 'true')
}

function readTestProgress(count: number) {
  return Array.from({ length: count }, (_, index) => Number(localStorage.getItem(progressKey(index + 1)) || 0))
}

function readMastery(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const value = localStorage.getItem(`nmt-hub:history:topic:${index + 1}:mastery`)
    return value === null ? null : Number(value)
  })
}

function readTopicMistakeCount(topicId: number) {
  try {
    const saved = JSON.parse(localStorage.getItem(historyTopicMistakesKey(topicId)) || '[]')
    return Array.isArray(saved) ? saved.length : 0
  } catch {
    return 0
  }
}

export function HistoryTopicCatalog({ topics }: { topics: readonly string[] }) {
  const [read, setRead] = useState(() => readTopicStatuses(topics.length))
  const [progress, setProgress] = useState(() => readTestProgress(topics.length))
  const [mastery, setMastery] = useState(() => readMastery(topics.length))
  const [mistakeCounts, setMistakeCounts] = useState(() => topics.map((_, index) => readTopicMistakeCount(index + 1)))
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null)

  useEffect(() => {
    const refresh = () => {
      setRead(readTopicStatuses(topics.length))
      setProgress(readTestProgress(topics.length))
      setMastery(readMastery(topics.length))
      setMistakeCounts(topics.map((_, index) => readTopicMistakeCount(index + 1)))
    }
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [topics.length])

  return <div className="history-program-sections">
    {historyProgramSections.map((section) => {
      const allRead = section.topics.every((id) => read[id - 1])
      const scores = section.topics.map((id) => mastery[id - 1]).filter((score): score is number => score !== null)
      const average = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null
      return <details className={`history-program-section${allRead ? ' all-read' : ''}`} key={section.title}>
        <summary>
          <span className="history-section-title">{section.title}</span>
          <span className="history-section-mastery">Засвоєння тестів: {average === null ? '—' : `${average}%`}{scores.length ? ` · результатів: ${scores.length}` : ''}</span>
          <span className="history-section-count">{section.topics.length} тем</span>
        </summary>
        <ol className="history-section-topics">
          {section.topics.map((id) => {
            const testAvailable = id >= 1 && id <= 32
            const mistakes = mistakeCounts[id - 1]
            return <li key={id}>
              <div className="history-topic-row">
                {id === 18 ? <button type="button" className="history-topic-title history-topic-title-link history-topic-expand" aria-expanded={expandedTopicId === id} onClick={() => setExpandedTopicId((current) => current === id ? null : id)}>
                  <span className="history-topic-number">{String(id).padStart(2, '0')}</span><span>{topics[id - 1]}</span><span className="history-topic-expand-icon" aria-hidden="true">{expandedTopicId === id ? '−' : '+'}</span>
                </button> : <a className="history-topic-title history-topic-title-link" href={`/history-of-ukraine/topic-${id}`}>
                  <span className="history-topic-number">{String(id).padStart(2, '0')}</span>{topics[id - 1]}
                </a>}
                <span className="history-topic-meta">
                  <span className={read[id - 1] ? 'topic-status is-read' : 'topic-status'}>{read[id - 1] ? 'Прочитана' : 'Не прочитана'}</span>
                  {testAvailable && <span className="topic-test-progress">Пройдено: {progress[id - 1]}% · результат: {mastery[id - 1] === null ? '—' : `${mastery[id - 1]}%`}</span>}
                </span>
                <span className="history-topic-actions">
                  {testAvailable ? <a href={`/history-of-ukraine/topic-${id}/test`}>Тести</a> : <span className="topic-action-unavailable">Тести</span>}
                  {testAvailable && mistakes > 0 ? <a className="topic-mistake-link" href={`/history-of-ukraine/topic-${id}/mistakes`}>Помилки · {mistakes}</a> : <span className="topic-action-unavailable">Помилки · 0</span>}
                </span>
              </div>
              {id === 18 && expandedTopicId === id && <div className="history-subtopics" aria-label="Підтеми теми 18">
                {historyTopicEighteenSubtopics.map((subtopic) => <a className="history-subtopic-link" key={subtopic.id} href={`/history-of-ukraine/topic-18/${subtopic.id}`}>
                  <span className="history-subtopic-label">{subtopic.label}</span><strong>{subtopic.title}</strong><span>{subtopic.summary}</span><em>Відкрити підтему →</em>
                </a>)}
              </div>}
            </li>
          })}
        </ol>
      </details>
    })}
  </div>
}

export function HistoryTopicPage({ topicId, title, subtopicId }: { topicId: number; title: string; subtopicId?: string }) {
  const [read, setRead] = useState(() => localStorage.getItem(readKey(topicId)) === 'true')
  const [progress, setProgress] = useState(() => Number(localStorage.getItem(progressKey(topicId)) || 0))
  const [actionsVisible, setActionsVisible] = useState(true)
  const previousId = Math.max(topicId - 1, 1)
  const nextId = Math.min(topicId + 1, 32)
  const previousTitle = topicId === 1 ? 'Всі теми' : 'Попередня тема'
  const nextTitle = nextId === topicId ? 'Всі теми' : 'Наступна тема'

  useEffect(() => {
    let hideTimer = 0
    const scheduleHide = () => {
      window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => setActionsVisible(false), 2800)
    }
    const revealOnScroll = () => {
      setActionsVisible(true)
      scheduleHide()
    }
    scheduleHide()
    window.addEventListener('scroll', revealOnScroll, { passive: true })
    return () => {
      window.clearTimeout(hideTimer)
      window.removeEventListener('scroll', revealOnScroll)
    }
  }, [])

  useEffect(() => {
    const refresh = () => setProgress(Number(localStorage.getItem(progressKey(topicId)) || 0))
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [topicId])

  const toggleRead = () => {
    const next = !read
    localStorage.setItem(readKey(topicId), String(next))
    setRead(next)
  }

  return <main className="page subject-page history-topic-page">
    <header className="subject-header">
      <a className="back-link" href="/history-of-ukraine"><span aria-hidden="true">←</span> До всіх тем</a>
      <span className="eyebrow">ТЕМА {String(topicId).padStart(2, '0')} · ІСТОРІЯ УКРАЇНИ</span>
    </header>
    <section className="subject-content">
      <h1>{title}</h1>
      <div className="topic-progress-strip"><span className={read ? 'topic-status is-read' : 'topic-status'}>{read ? 'Прочитана' : 'Не прочитана'}</span><span>Тест пройдено: <strong>{progress}%</strong></span></div>
      {topicId >= 1 && topicId <= 2 ? <HistoryTopicsOneTwoFresh topicId={topicId} /> : topicId >= 3 && topicId <= 5 ? <HistoryTopicsOneToFive topicId={topicId} /> : topicId >= 6 && topicId <= 8 ? <HistoryTopicsSixToEight topicId={topicId} /> : topicId === 12 ? <HistoryTopicTwelve /> : topicId >= 13 && topicId <= 14 ? <HistoryTopicsTwelveToFourteen topicId={topicId} /> : topicId === 9 ? <HistoryTopicNine /> : topicId === 10 ? <HistoryTopicTen /> : topicId === 11 ? <HistoryTopicEleven /> : topicId === 18 ? <HistoryTopicEighteen subtopicId={subtopicId} /> : topicId === 29 ? <HistoryTopicTwentyNine /> : topicId >= 15 && topicId <= 28 ? <HistoryTopicsLater topicId={topicId} /> : topicId >= 30 && topicId <= 32 ? <HistoryTopicsLater topicId={topicId} /> : <section className="topic-notes topic-placeholder"><h2>Матеріали теми</h2><p>Матеріали цієї теми ще не додані.</p></section>}
    </section>
    <nav className={`topic-action-bar${actionsVisible ? '' : ' is-hidden'}`} aria-label="Дії з темою">
      <a href="/history-of-ukraine" aria-label="Повернутися до всіх тем" title="До всіх тем"><ActionIcon name="list" /></a>
      <a href={topicId === 1 ? '/history-of-ukraine' : `/history-of-ukraine/topic-${previousId}`} aria-label={topicId === 1 ? 'Повернутися до всіх тем' : `Перейти до теми ${previousId}`} title={previousTitle}><ActionIcon name="prev" /></a>
      <a href={nextId === topicId ? '/history-of-ukraine' : `/history-of-ukraine/topic-${nextId}`} aria-label={nextId === topicId ? 'Повернутися до всіх тем' : `Перейти до теми ${nextId}`} title={nextTitle}><ActionIcon name="next" /></a>
      <a href={`/history-of-ukraine/topic-${topicId}/test`} aria-label="Перейти до тестів цієї теми" title="Тести"><ActionIcon name="test" /></a>
      <button type="button" className={read ? 'marked-read' : ''} onClick={toggleRead} aria-label={read ? 'Зняти позначку прочитаної теми' : 'Позначити тему прочитаною'} title={read ? 'Тему позначено прочитаною' : 'Позначити прочитаною'}><ActionIcon name={read ? 'check' : 'circle'} /></button>
    </nav>
  </main>
}

export function HistoryTopicTestPage({ topicId, title, mode = 'test' }: { topicId: number; title: string; mode?: 'test' | 'mistakes' }) {
  return <main className="page subject-page">
    <header className="subject-header">
      <a className="back-link" href={`/history-of-ukraine/topic-${topicId}`}><span aria-hidden="true">←</span> Повернутися до теми</a>
      <span className="eyebrow">{mode === 'mistakes' ? 'РОБОТА НАД ПОМИЛКАМИ' : 'ТЕСТ'} · ТЕМА {String(topicId).padStart(2, '0')}</span>
    </header>
    <section className="subject-content"><h1>Тест: {title}</h1>
      {((topicId >= 1 && topicId <= 14) || (topicId >= 15 && topicId <= 28) || (topicId >= 29 && topicId <= 32)) ? <HistoryTopicTenQuiz key={`${topicId}-${mode}`} topicId={topicId} mode={mode} /> : <section className="topic-notes topic-placeholder"><p>Тест для цієї теми ще не додано.</p></section>}
    </section>
  </main>
}
