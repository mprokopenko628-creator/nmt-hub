import { useEffect, useState } from 'react'
import HistoryPracticeVariant from './HistoryPracticeVariant'
import { HistoryTopicCatalog, HistoryTopicPage, HistoryTopicTestPage } from './HistoryTopicNavigation'

const subjects = [
  {
    name: 'Фізика', path: '/physics', number: '01',
    summary: 'Механіка · оптика · електрика',
    topics: [
      'Механіка',
      'Молекулярна фізика та термодинаміка',
      'Електродинаміка',
      'Коливання і хвилі. Оптика',
      'Елементи теорії відносності. Квантова фізика',
    ],
  },
  {
    name: 'Математика', path: '/mathematics', number: '02',
    summary: 'Алгебра · геометрія · ймовірність',
    topics: [
      'Числа і вирази',
      'Рівняння, нерівності і їх системи',
      'Функції',
      'Елементи комбінаторики, початки теорії ймовірностей та елементи математичної статистики',
      'Планіметрія',
      'Стереометрія',
    ],
  },
  {
    name: 'Українська мова', path: '/ukrainian-language', number: '03',
    summary: 'Мовні теми · правила · практика',
    topics: [
      'Фонетика. Графіка. Орфоепія. Орфографія',
      'Лексикологія. Фразеологія',
      'Будова слова. Словотвір',
      'Морфологія',
      'Синтаксис',
      'Стилістика',
      'Розвиток мовлення',
    ],
  },
  {
    name: 'Історія України', path: '/history-of-ukraine', number: '04',
    summary: 'Дати · карти · діячі · пам’ятки',
    topics: [
      'Вступ до історії України',
      'Стародавня історія України',
      'Русь-Україна (Київська держава)',
      'Королівство Руське (Галицько-Волинська держава). Монгольська навала',
      'Руські удільні князівства у складі іноземних держав у другій половині XIV – першій половині XVI ст.',
      'Українські землі у складі Речі Посполитої в другій половині XVI ст.',
      'Українські землі у складі Речі Посполитої в першій половині XVII ст.',
      'Національно-визвольна війна українського народу середини XVII ст.',
      'Козацька Україна наприкінці 50–80-х рр. XVII ст.',
      'Українські землі наприкінці XVII – у першій половині XVIII ст.',
      'Українські землі в другій половині XVIII ст.',
      'Українські землі у складі Російської імперії наприкінці XVIII – у першій половині XIX ст.',
      'Українські землі у складі Австрійської імперії наприкінці XVIII – у першій половині XIX ст.',
      'Культура України кінця XVIII – першої половини XIX ст.',
      'Українські землі у складі Російської імперії в другій половині XIX ст.',
      'Українські землі у складі Австро-Угорщини в другій половині XIX ст.',
      'Культура України в другій половині XIX – на початку XX ст.',
      'Українські землі у складі Російської імперії в 1900–1914 рр.',
      'Українські землі у складі Австро-Угорщини в 1900–1914 рр.',
      'Україна в роки Першої світової війни',
      'Початок Української революції',
      'Розгортання Української революції. Боротьба за відновлення державності',
      'Встановлення комуністичного тоталітарного режиму в Україні',
      'Утвердження більшовицького тоталітарного режиму в Україні',
      'Західноукраїнські землі в міжвоєнний період',
      'Україна в роки Другої світової війни',
      'Україна в перші повоєнні роки',
      'Україна в умовах десталінізації',
      'Україна в період загострення кризи радянської системи',
      'Відновлення незалежності України',
      'Становлення України як незалежної держави',
      'Творення нової України',
    ],
  },
] as const

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [subjectSection, setSubjectSection] = useState<'theory' | 'tests'>('theory')
  const [loveNoteOpen, setLoveNoteOpen] = useState(false)

  useEffect(() => {
    const handleNavigation = () => { setPath(window.location.pathname); setLoveNoteOpen(false) }
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  useEffect(() => {
    if (!loveNoteOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setLoveNoteOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [loveNoteOpen])

  const navigate = (nextPath: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    setLoveNoteOpen(false)
    window.scrollTo(0, 0)
  }

  const subject = subjects.find((item) => item.path === path)

  const topicRoute = path.match(/^\/history-of-ukraine\/topic-(\d+)(\/(?:test|mistakes))?$/)
  if (topicRoute) {
    const topicId = Number(topicRoute[1])
    const history = subjects.find((item) => item.path === '/history-of-ukraine')
    const title = history?.topics[topicId - 1]
    if (title) return topicRoute[2]
      ? <HistoryTopicTestPage topicId={topicId} title={title} mode={topicRoute[2] === '/mistakes' ? 'mistakes' : 'test'} />
      : <HistoryTopicPage topicId={topicId} title={title} />
  }

  if (path === '/history-of-ukraine/nmt-test-2026' || path === '/history-of-ukraine/nmt-test-2026-2') {
    const variant = path.endsWith('-2') ? 2 : 1
    const variantTitle = variant === 1 ? 'Для Артема Ситника' : 'Для Артема Мунтяна'
    return <main className="page subject-page"><header className="subject-header">
      <a className="back-link" href="/history-of-ukraine" onClick={navigate('/history-of-ukraine')}><span aria-hidden="true">←</span> До предмета</a>
      <span className="eyebrow">ІСТОРІЯ УКРАЇНИ</span>
    </header><section className="subject-content"><h1>{variantTitle}</h1><HistoryPracticeVariant key={variant} variant={variant} /></section></main>
  }

  if (subject) {
    const inAppTestPath = subject.path === '/history-of-ukraine' ? '/history-of-ukraine/nmt-test-2026' : `${subject.path}/nmt-test-2026`
    return (
      <main className="page subject-page">
        <header className="subject-header">
          <a className="back-link" href="/" onClick={navigate('/')}>
            <span aria-hidden="true">←</span> На головну
          </a>
          <span className="eyebrow">ПРЕДМЕТ {subject.number}</span>
        </header>
        <section className="subject-content" aria-labelledby="subject-title">
          <h1 id="subject-title">{subject.name}</h1>
          <div className="subject-tabs" role="tablist" aria-label="Розділи предмета">
            <button type="button" role="tab" aria-selected={subjectSection === 'theory'} className={subjectSection === 'theory' ? 'active' : ''} onClick={() => { setSubjectSection('theory'); setLoveNoteOpen(false) }}>Теорія + практика</button>
            <button type="button" role="tab" aria-selected={subjectSection === 'tests'} className={subjectSection === 'tests' ? 'active' : ''} onClick={() => setSubjectSection('tests')}>НМТ-тести</button>
          </div>
          {subjectSection === 'theory' ? <section className="topics-section" aria-labelledby="topics-title">
            <div className="topics-heading">
              <h2 id="topics-title">Теми за розділами програми</h2>
              <span>РОЗДІЛИ ПРОГРАМИ НМТ-2026</span>
            </div>
            {subject.path === '/history-of-ukraine' ? <HistoryTopicCatalog topics={subject.topics} /> : <ol className="topic-list">
              {subject.topics.map((topic) => <li className="topic-item" key={topic}><span>{topic}</span></li>)}
            </ol>}
          </section>
          : <section className="topics-section tests-section" aria-labelledby="tests-title">
            <div className="topics-heading"><h2 id="tests-title">Тренувальні тести</h2><span>У ЗАСТОСУНКУ</span></div>
            <div className="test-card-grid">
              {subject.path === '/history-of-ukraine' ? <a className="test-card test-card-practice" href={inAppTestPath} onClick={navigate(inAppTestPath)}>
                <span className="test-card-top"><span>АВТОРСЬКИЙ ТРЕНАЖЕР</span><span aria-hidden="true">→</span></span>
                <strong>Для Артема Ситника</strong><span>30 завдань · проходження в застосунку</span>
              </a> : <div className="test-card test-card-disabled" aria-disabled="true">
                <span className="test-card-top"><span>АВТОРСЬКИЙ ТРЕНАЖЕР</span></span>
                <strong>{subject.name}</strong><span>Тест готується</span>
              </div>}
              {subject.path === '/history-of-ukraine' && <a className="test-card test-card-practice" href="/history-of-ukraine/nmt-test-2026-2" onClick={navigate('/history-of-ukraine/nmt-test-2026-2')}>
                <span className="test-card-top"><span>АВТОРСЬКИЙ ТРЕНАЖЕР</span><span aria-hidden="true">→</span></span>
                <strong>Для Артема Мунтяна</strong><span>30 завдань · 20 нових тестових питань</span>
              </a>}
              {subject.path === '/history-of-ukraine' && <button type="button" className="test-card test-card-practice love-test-card" onClick={() => setLoveNoteOpen(true)}>
                <span className="test-card-top"><span>МАЛЕНЬКИЙ СЮРПРИЗ</span><span aria-hidden="true">♡</span></span>
                <strong>Для коханої</strong><span>Натисни, щоб відкрити</span>
              </button>}
            </div>
            {loveNoteOpen && <div className="love-note-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLoveNoteOpen(false) }}><section className="love-note-card" role="dialog" aria-modal="true" aria-labelledby="love-note-title"><button className="love-note-close" type="button" onClick={() => setLoveNoteOpen(false)} aria-label="Закрити">×</button><span className="love-note-heart" aria-hidden="true">♥</span><p className="love-note-for">Для коханої</p><h2 id="love-note-title">Я тебе люблю</h2><p className="love-note-sparkle" aria-hidden="true">✦ &nbsp; ✦ &nbsp; ✦</p></section></div>}
          </section>}
        </section>
      </main>
    )
  }

  return (
    <main className="page home-page">
      <header className="home-header">
        <a className="wordmark" href="/" aria-label="НМТ Hub — головна сторінка" onClick={navigate('/')}>
          <span className="wordmark-icon" aria-hidden="true">Н</span>
          <span>НМТ <span className="wordmark-light">Hub</span></span>
        </a>
        <span className="header-note">ПІДГОТОВКА ДО НМТ</span>
      </header>

      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">ТВІЙ НАВЧАЛЬНИЙ ПРОСТІР</p>
        <h1 id="home-title">НМТ <span>Hub</span></h1>
        <p className="hero-subtitle">Твій простір для підготовки до НМТ</p>
      </section>

      <section className="subjects-section" aria-labelledby="subjects-title">
        <div className="section-heading">
          <h2 id="subjects-title">Предмети</h2>
          <span>ОБЕРИ НАПРЯМ</span>
        </div>
        <div className="subject-grid">
          {subjects.map((item) => {
            const available = item.path === '/history-of-ukraine'
            const content = <>
              {available && <span className="card-topline"><span className="card-arrow" aria-hidden="true">↗</span></span>}
              <span className="card-title">{item.name}</span>
              <span className="card-summary">{item.summary}</span>
              <span className={`card-bottomline${available ? '' : ' card-bottomline-coming'}`}>
                <span>{available ? 'ВІДКРИТИ ПРЕДМЕТ' : 'РОЗРОБЛЯЄТЬСЯ'}</span>
                {available && <span aria-hidden="true">→</span>}
              </span>
            </>
            return available
              ? <a className="subject-card" href={item.path} onClick={navigate(item.path)} key={item.path}>{content}</a>
              : <article className="subject-card subject-card-coming" key={item.path} aria-label={`${item.name}: розробляється`}>{content}</article>
          })}
        </div>
      </section>

      <footer className="home-footer">
        <span>НМТ HUB</span>
        <span>ТВІЙ ШЛЯХ ПОЧИНАЄТЬСЯ ТУТ</span>
      </footer>
    </main>
  )
}

export default App
