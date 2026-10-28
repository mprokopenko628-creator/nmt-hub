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
import HistoryTopicNineteen, { historyTopicNineteenSubtopics } from './HistoryTopicNineteen'

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
  const [mistakeCounts, setMistakeCounts] = useState(() => topics.map((_, index) => readTopicMistakeCount(index + 1)))
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null)

  useEffect(() => {
    const refresh = () => {
      setRead(readTopicStatuses(topics.length))
      setMistakeCounts(topics.map((_, index) => readTopicMistakeCount(index + 1)))
    }
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('nmt-hub:history:refresh', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('nmt-hub:history:refresh', refresh)
    }
  }, [topics.length])

  return <div className="history-program-sections">
    {historyProgramSections.map((section) => {
      const allRead = section.topics.every((id) => read[id - 1])
      return <details className={`history-program-section${allRead ? ' all-read' : ''}`} key={section.title}>
        <summary>
          <span className="history-section-title">{section.title}</span>
          <span className="history-section-count">{section.topics.length} тем</span>
        </summary>
        <ol className="history-section-topics">
          {section.topics.map((id) => {
            const testAvailable = id >= 1 && id <= 32
            const mistakes = mistakeCounts[id - 1]
            return <li key={id}>
              <div className={`history-topic-card${(id === 18 || id === 19) && expandedTopicId === id ? ' is-expanded' : ''}`}>
              <div className="history-topic-row">
                {id === 18 || id === 19 ? <button type="button" className="history-topic-title history-topic-title-link history-topic-expand" aria-expanded={expandedTopicId === id} onClick={() => setExpandedTopicId((current) => current === id ? null : id)}>
                  <span className="history-topic-number">{String(id).padStart(2, '0')}</span><span>{topics[id - 1]}</span>
                </button> : <a className="history-topic-title history-topic-title-link" href={`/history-of-ukraine/topic-${id}`}>
                  <span className="history-topic-number">{String(id).padStart(2, '0')}</span>{topics[id - 1]}
                </a>}
                <span className="history-topic-actions">
                  {testAvailable ? <a href={`/history-of-ukraine/topic-${id}/test`}>Тести</a> : <span className="topic-action-unavailable">Тести</span>}
                  {testAvailable && mistakes > 0 ? <a className="topic-mistake-link" href={`/history-of-ukraine/topic-${id}/mistakes`}>Помилки · {mistakes}</a> : <span className="topic-action-unavailable">Помилки · 0</span>}
                </span>
              </div>
              {id === 18 && expandedTopicId === id && <div className="history-subtopics" aria-label="Теми всередині теми 18">
                {historyTopicEighteenSubtopics.map((subtopic) => <a className="history-subtopic-link" key={subtopic.id} href={`/history-of-ukraine/topic-18/${subtopic.id}`}>
                  <strong>{subtopic.title}</strong><span>{subtopic.summary}</span>
                </a>)}
              </div>}
              {id === 19 && expandedTopicId === id && <div className="history-subtopics" aria-label="Теми всередині теми 19">
                {historyTopicNineteenSubtopics.map((subtopic) => <a className="history-subtopic-link" key={subtopic.id} href={`/history-of-ukraine/topic-19/${subtopic.id}`}>
                  <strong>{subtopic.title}</strong><span>{subtopic.summary}</span>
                </a>)}
              </div>}
              </div>
            </li>
          })}
        </ol>
      </details>
    })}
  </div>
}

export function HistoryTopicPage({ topicId, title, subtopicId }: { topicId: number; title: string; subtopicId?: string }) {
  const [read, setRead] = useState(() => localStorage.getItem(readKey(topicId)) === 'true')
  const previousId = Math.max(topicId - 1, 1)
  const nextId = Math.min(topicId + 1, 32)
  const previousHref = topicId === 18 && subtopicId === 'reaction'
    ? '/history-of-ukraine/topic-18/modernization'
    : topicId === 18 && subtopicId === 'modernization'
      ? '/history-of-ukraine/topic-17'
      : topicId === 19 && subtopicId === 'economy'
        ? '/history-of-ukraine/topic-18/reaction'
        : topicId === 19 && subtopicId === 'politics'
          ? '/history-of-ukraine/topic-19/economy'
          : topicId === 19 && subtopicId === 'culture'
            ? '/history-of-ukraine/topic-19/politics'
            : topicId === 19
              ? '/history-of-ukraine/topic-18/reaction'
        : topicId === 1 ? '/history-of-ukraine' : `/history-of-ukraine/topic-${previousId}`
  const nextHref = topicId === 17
    ? '/history-of-ukraine/topic-18/modernization'
    : topicId === 18 && subtopicId === 'modernization'
      ? '/history-of-ukraine/topic-18/reaction'
      : topicId === 18 && subtopicId === 'reaction'
        ? '/history-of-ukraine/topic-19/economy'
        : topicId === 19 && subtopicId === 'economy'
          ? '/history-of-ukraine/topic-19/politics'
          : topicId === 19 && subtopicId === 'politics'
            ? '/history-of-ukraine/topic-19/culture'
            : topicId === 19 && subtopicId === 'culture'
              ? '/history-of-ukraine/topic-20'
              : topicId === 19
                ? '/history-of-ukraine/topic-19/economy'
        : nextId === topicId ? '/history-of-ukraine' : `/history-of-ukraine/topic-${nextId}`
  const previousLabel = topicId === 1 ? 'Розділи' : topicId === 18 && subtopicId ? 'Попередня' : 'Попередня'
  const nextLabel = nextId === topicId ? 'Розділи' : 'Наступна'
  const previousAria = topicId === 1 ? 'Повернутися до всіх тем' : 'Перейти до попередньої теми'
  const nextAria = 'Перейти до наступної теми'

  useEffect(() => {
    const refresh = () => setRead(localStorage.getItem(readKey(topicId)) === 'true')
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('nmt-hub:history:refresh', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('nmt-hub:history:refresh', refresh)
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
      {topicId >= 1 && topicId <= 2 ? <HistoryTopicsOneTwoFresh topicId={topicId} /> : topicId >= 3 && topicId <= 5 ? <HistoryTopicsOneToFive topicId={topicId} /> : topicId >= 6 && topicId <= 8 ? <HistoryTopicsSixToEight topicId={topicId} /> : topicId === 12 ? <HistoryTopicTwelve /> : topicId >= 13 && topicId <= 14 ? <HistoryTopicsTwelveToFourteen topicId={topicId} /> : topicId === 9 ? <HistoryTopicNine /> : topicId === 10 ? <HistoryTopicTen /> : topicId === 11 ? <HistoryTopicEleven /> : topicId === 18 ? <HistoryTopicEighteen subtopicId={subtopicId} /> : topicId === 19 ? <HistoryTopicNineteen subtopicId={subtopicId} /> : topicId === 29 ? <HistoryTopicTwentyNine /> : topicId >= 15 && topicId <= 28 ? <HistoryTopicsLater topicId={topicId} /> : topicId >= 30 && topicId <= 32 ? <HistoryTopicsLater topicId={topicId} /> : <section className="topic-notes topic-placeholder"><h2>Матеріали теми</h2><p>Матеріали цієї теми ще не додані.</p></section>}
    </section>
    <nav className="topic-action-bar" aria-label="Навігація та дії з темою">
      <a href="/history-of-ukraine" aria-label="Повернутися до всіх тем"><ActionIcon name="list" /><span>Всі теми</span></a>
      <a href={previousHref} aria-label={previousAria}><ActionIcon name="prev" /><span>{previousLabel}</span></a>
      <a href={nextHref} aria-label={nextAria}><ActionIcon name="next" /><span>{nextLabel}</span></a>
      <a href={`/history-of-ukraine/topic-${topicId}/test`} aria-label="Перейти до тестів цієї теми"><ActionIcon name="test" /><span>Тести</span></a>
      <button type="button" className={read ? 'marked-read' : ''} onClick={toggleRead} aria-label="Позначити тему прочитаною"><ActionIcon name={read ? 'check' : 'circle'} /><span>Прочитано</span></button>
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
