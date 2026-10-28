import { laterTopics } from './historyLaterData'

export default function HistoryTopicsLater({ topicId }: { topicId: number }) {
  const topic = laterTopics[topicId]
  if (!topic) return null

  return <article className="topic-notes" aria-labelledby={`later-topic-${topicId}`}>
    <header className="notes-header">
      <p className="eyebrow">ПОВНИЙ КОНСПЕКТ · ТЕМА {String(topicId).padStart(2, '0')}</p>
      <h3 id={`later-topic-${topicId}`}>{topic.title}</h3>
      <p>{topic.intro}</p>
    </header>
    <section className="notes-section">
      {topic.blocks.map(([heading, text]) => <div className="theory-block" key={heading}><h5>{heading}</h5><p>{text}</p></div>)}
      {topic.deepSections?.map(([heading, text]) => <div className="theory-block theory-block-expanded" key={`deep-${heading}`}><h5>{heading}</h5><p>{text}</p></div>)}
    </section>
    <section className="notes-section">
      <h4>Дати та події</h4>
      <ul className="fact-list">{topic.dates.map(([date, event]) => <li key={date}><strong>{date}</strong><span>{event}</span></li>)}</ul>
      {topic.programDates && <><h5>Повний програмний мінімум</h5><ul className="fact-list">{topic.programDates.map(([date, event]) => <li key={`program-${date}`}><strong>{date}</strong><span>{event}</span></li>)}</ul></>}
    </section>
    <section className="notes-section">
      <h4>Персоналії програми</h4>
      <div className="people-grid">{topic.people.map(([name, detail]) => <article className="person-card" key={name}><h5>{name}</h5><p>{detail}</p></article>)}</div>
    </section>
    <section className="notes-section">
      <h4>Поняття й терміни</h4>
      <dl className="terms-list">{topic.terms.map(([term, definition]) => <div className="term-row" key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl>
    </section>
    <section className="notes-section map-study-card">
      <h4>Карта й картографічна навичка НМТ</h4>
      <h5>{topic.map?.title}</h5>
      <p>{topic.map?.description}</p>
      <p className={topic.map?.status === 'available' ? 'source-note' : 'source-note source-note-warning'}>
        {topic.map?.status === 'available' ? `Джерело: ${topic.map.source}` : `Статус джерела: оригінальну карту не додано. ${topic.map?.source}`}
      </p>
      {topic.map?.src && <img className="topic-visual" src={topic.map.src} alt={topic.map.alt ?? topic.map.title} />}
    </section>
    {topic.visualSources?.length ? <section className="notes-section"><h4>Перевірені візуальні джерела</h4><div className="history-visual-grid">{topic.visualSources.map((visual) => <figure className="history-visual-card" key={visual.title}><img src={visual.src} alt={visual.alt} loading="lazy" /><figcaption><strong>{visual.title}</strong><span>{visual.description}<br />Джерело: {visual.source}</span></figcaption></figure>)}</div></section> : null}
    <section className="notes-section">
      <h4>Пам’ятки та візуальне розпізнавання</h4>
      {topic.landmarks?.length ? <div className="landmark-grid">{topic.landmarks.map(([name, place, period, style, clue]) => <article className="landmark-card" key={name}><h5>{name}</h5><p><strong>{place}</strong> · {period} · {style}</p><p>{clue}</p></article>)}</div> : <p className="source-note">У перевіреному переліку пам’яток для цієї теми окремі об’єкти не виділені; візуальний список належить темам 12–17 і перевіряється там.</p>}
    </section>
    <section className="notes-section">
      <h4>Зв’язки з курсом</h4>
      <ul className="check-list">{topic.connections?.map((connection) => <li key={connection}>{connection}</li>)}</ul>
    </section>
    <section className="notes-section">
      <h4>Що можуть перевірити на НМТ</h4>
      <ul className="check-list">
        <li>Розташувати ключові події теми в хронологічній послідовності.</li>
        <li>Пов’язати персоналії з їхньою діяльністю, організаціями та документами.</li>
        <li>Пояснити причини, перебіг і наслідки основних політичних та соціально-економічних процесів.</li>
        <li>Розрізнити поняття, політичні режими та форми національного руху.</li>
      </ul>
    </section>
    <section className="notes-section">
      <h4>Типові помилки й зв’язки</h4>
      <ul className="check-list">
        <li>Не плутай дату події з періодом її наслідків або діяльності діяча.</li>
        <li>Порівнюй політику імперської/радянської влади з українськими формами самоорганізації, а не лише запам’ятовуй назви.</li>
        <li>Пов’язуй цю тему з попередньою та наступною темами: зміни державного устрою, суспільства й національного руху утворюють єдиний процес.</li>
      </ul>
    </section>
  </article>
}
