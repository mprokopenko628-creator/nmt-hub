import { useMemo, useState } from 'react'
import { secondQuestions } from './historyPracticeVariantTwoData'

type Choice = { kind: 'choice'; prompt: string; options: string[]; answer: number; why: string; image?: { src: string; alt: string } }
type Match = { kind: 'match'; prompt: string; left: string[]; right: string[]; answer: number[] }
type Order = { kind: 'order'; prompt: string; events: string[]; answer: number[] }
type Pick = { kind: 'pick'; prompt: string; options: string[]; answer: number[] }
export type Question = Choice | Match | Order | Pick
const letters = ['А', 'Б', 'В', 'Г', 'Д']

const firstQuestions: Question[] = [
  { kind:'choice', prompt:'Яка археологічна культура пов’язана з трипільськими протомістами?', options:['Зарубинецька','Трипільська','Черняхівська','Скіфська'], answer:1, why:'Великі поселення з характерною мальованою керамікою належали трипільській культурі.' },
  { kind:'choice', prompt:'Який князь запровадив християнство як державну релігію Русі?', options:['Олег','Святослав','Володимир Великий','Ярослав Мудрий'], answer:2, why:'Хрещення Русі відбулося за князювання Володимира Великого наприкінці X століття.' },
  { kind:'choice', prompt:'Який документ закріпив принцип вотчинного володіння князівськими землями Русі?', options:['«Руська правда»','Люблінська унія','Березневі статті','Литовський статут'], answer:0, why:'«Руська правда» — збірник правових норм Київської Русі.' },
  { kind:'choice', prompt:'Хто був коронований як король Русі у 1253 році?', options:['Роман Мстиславич','Данило Романович','Лев Данилович','Юрій I Львович'], answer:1, why:'Папський легат коронував Данила Романовича в Дорогичині.' },
  { kind:'choice', prompt:'Яка унія 1569 року утворила Річ Посполиту?', options:['Берестейська','Кревська','Люблінська','Городельська'], answer:2, why:'Люблінська унія об’єднала Корону Польську й Велике князівство Литовське.' },
  { kind:'choice', prompt:'Який навчальний заклад заснував Петро Могила в Києві?', options:['Острозьку академію','Києво-Могилянський колегіум','Львівський університет','Братську школу у Львові'], answer:1, why:'Київський колегіум, заснований Петром Могилою, згодом став академією.' },
  { kind:'choice', prompt:'Який договір 1649 року визначив козацький реєстр у 40 тисяч?', options:['Зборівський','Білоцерківський','Андрусівський','Бахчисарайський'], answer:0, why:'Зборівський договір установлював 40-тисячний реєстр і автономію трьох воєводств.' },
  { kind:'choice', prompt:'Хто очолив козацьке повстання 1590-х років?', options:['Петро Конашевич-Сагайдачний','Криштоф Косинський','Іван Сулима','Іван Богун'], answer:1, why:'Повстання 1591–1593 років очолив Криштоф Косинський.' },
  { kind:'choice', prompt:'Яка подія стала приводом до початку Національно-визвольної війни 1648 року?', options:['Обрання Хмельницького гетьманом','Напад на Січ і конфлікт Хмельницького з Чаплинським','Підписання Зборівського договору','Похід на Молдавію'], answer:1, why:'Особистий конфлікт із Даніелем Чаплинським і напад на хутір Суботів загострили протистояння.' },
  { kind:'choice', prompt:'У якому році укладено Андрусівське перемир’я?', options:['1654','1667','1686','1709'], answer:1, why:'Андрусівське перемир’я між Московською державою та Річчю Посполитою укладено 1667 року.' },
  { kind:'choice', prompt:'Який гетьман зображений на портреті?', options:['Іван Мазепа','Пилип Орлик','Іван Скоропадський','Данило Апостол'], answer:0, why:'На портреті зображений Іван Мазепа, гетьман Лівобережної України у 1687–1709 роках.', image:{ src:'/images/ivan-mazepa.jpg', alt:'Портрет Івана Мазепи з літопису Самійла Величка' } },
  { kind:'choice', prompt:'Яка подія відбулася 1764 року?', options:['Ліквідація гетьманства','Зруйнування Запорозької Січі','Закріпачення селян Лівобережжя','Приєднання Криму до Російської імперії'], answer:0, why:'Катерина II ліквідувала гетьманську посаду й створила Другу Малоросійську колегію.' },
  { kind:'choice', prompt:'Який документ започаткував діяльність Кирило-Мефодіївського братства?', options:['«Книга буття українського народу»','«Історія Русів»','«Русалка Дністровая»','«Енеїда»'], answer:0, why:'Програмним твором братства була «Книга буття українського народу».' },
  { kind:'choice', prompt:'Яка подія відбулася у Львові в 1848 році?', options:['Заснування «Просвіти»','Скасування панщини в Галичині','Відкриття університету','Створення ЗУНР'], answer:1, why:'Революційні події 1848 року спричинили скасування панщини в Галичині.' },
  { kind:'choice', prompt:'Який акт забороняв друкувати українською значну частину книжок у Російській імперії?', options:['Емський указ','Маніфест 17 жовтня','Валуєвський циркуляр','Столипінський указ'], answer:0, why:'Емський указ 1876 року суттєво обмежив українське книгодрукування й публічне використання мови.' },
  { kind:'choice', prompt:'Яка організація діяла в Наддніпрянській Україні на початку XX століття?', options:['Руська трійця','«Просвіта» в Галичині','Революційна українська партія','Головна руська рада'], answer:2, why:'Революційна українська партія виникла в Харкові 1900 року.' },
  { kind:'choice', prompt:'Коли Українська Центральна Рада проголосила незалежність УНР?', options:['I Універсалом','III Універсалом','IV Універсалом','Актом Злуки'], answer:2, why:'IV Універсал у січні 1918 року проголосив УНР самостійною державою.' },
  { kind:'choice', prompt:'Який договір визнав УНР суб’єктом міжнародних відносин у 1918 році?', options:['Ризький','Брест-Литовський','Варшавський','Рапалльський'], answer:1, why:'Брест-Литовський мирний договір УНР із Центральними державами підписано в лютому 1918 року.' },
  { kind:'choice', prompt:'Яка політика більшовиків передувала НЕПу?', options:['Колективізація','Воєнний комунізм','Коренізація','Індустріалізація'], answer:1, why:'НЕП запровадили 1921 року після кризи політики воєнного комунізму.' },
  { kind:'choice', prompt:'Який документ проголосив незалежність України 24 серпня 1991 року?', options:['Декларація про державний суверенітет','Акт проголошення незалежності','Конституція України','Універсал національної єдності'], answer:1, why:'Акт проголошення незалежності ухвалила Верховна Рада 24 серпня 1991 року.' },
  { kind:'match', prompt:'Установи відповідність між датами та подіями.', left:['988 р.','1569 р.','1648 р.','1991 р.'], right:['Початок повстання Хмельницького','Проголошення незалежності України','Хрещення Русі','Люблінська унія','Акт Злуки УНР і ЗУНР'], answer:[2,3,0,1] },
  { kind:'match', prompt:'Установи відповідність між діячами та їхніми ролями.', left:['Ярослав Мудрий','Петро Могила','Іван Мазепа','Михайло Грушевський'], right:['Гетьман Лівобережжя 1687–1709 рр.','Голова Української Центральної Ради','Митрополит і реформатор освіти','Князь Русі, укладач законодавчих норм','Автор «Енеїди»'], answer:[3,2,0,1] },
  { kind:'match', prompt:'Установи відповідність між документами та періодами.', left:['«Руська правда»','Березневі статті','Емський указ','IV Універсал'], right:['Українська революція 1917–1921 рр.','Російська імперія XIX ст.','Київська Русь','Гетьманщина середини XVII ст.','Річ Посполита після Люблінської унії'], answer:[2,3,1,0] },
  { kind:'match', prompt:'Установи відповідність між термінами та визначеннями.', left:['Полюддя','Магдебурзьке право','Займанщина','Шістдесятники'], right:['Покоління митців і правозахисників 1960-х','Зайняття вільної землі для господарювання','Міське самоврядування','Збирання данини князем','Військова рада козацького війська'], answer:[3,2,1,0] },
  { kind:'order', prompt:'Розташуй події від найдавнішої до найпізнішої.', events:['Проголошення незалежності України','Люблінська унія','Початок повстання Хмельницького','Хрещення Русі'], answer:[3,1,2,0] },
  { kind:'order', prompt:'Розташуй події Української революції в хронологічному порядку.', events:['Акт Злуки УНР і ЗУНР','Утворення Української Центральної Ради','Проголошення незалежності IV Універсалом','Проголошення УНР III Універсалом'], answer:[3,0,2,1] },
  { kind:'order', prompt:'Розташуй події від найдавнішої до найпізнішої.', events:['Зруйнування Запорозької Січі','Андрусівське перемир’я','Зборівський договір','Ліквідація гетьманства'], answer:[3,1,0,2] },
  { kind:'pick', prompt:'Обери три поняття, пов’язані з Київською Руссю.', options:['Полюддя','Віче','Дружина','Фільварок','Колегія','Індустріалізація','Займанщина'], answer:[0,1,2] },
  { kind:'pick', prompt:'Обери три події, що відбулися під час Української революції 1917–1921 років.', options:['Утворення Центральної Ради','Брест-Литовський мир УНР','Акт Злуки','Люблінська унія','Зборівський договір','Ліквідація гетьманства','Кримська операція Сагайдачного'], answer:[0,1,2] },
  { kind:'pick', prompt:'Обери три риси політики коренізації в УСРР.', options:['Розширення використання української мови в освіті','Залучення українців до державного апарату','Підтримка національних культур у 1920-х роках','Масова приватизація промисловості','Ліквідація колгоспів','Відновлення Гетьманщини','Запровадження кріпацтва'], answer:[0,1,2] },
]

const historyScale: Record<number, number> = { 9:100,10:105,11:110,12:115,13:120,14:125,15:130,16:132,17:134,18:136,19:138,20:140,21:141,22:142,23:143,24:144,25:145,26:146,27:147,28:148,29:149,30:150,31:151,32:152,33:154,34:156,35:158,36:160,37:163,38:166,39:168,40:169,41:170,42:172,43:173,44:175,45:177,46:179,47:181,48:183,49:185,50:188,51:191,52:194,53:197,54:200 }

export default function HistoryPracticeVariant({ variant = 1 }: { variant?: 1 | 2 }) {
  const questions = variant === 2 ? secondQuestions : firstQuestions
  const [mode, setMode] = useState<'select' | 'exam' | 'practice'>('select')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [explanationOpen, setExplanationOpen] = useState<Record<number, boolean>>({})
  const [finished, setFinished] = useState(false)
  const total = 54
  const scoreQuestion = (question: Question, i: number) => {
    const answer = answers[i] ?? []
    if (question.kind === 'choice') return answer[0] === question.answer ? 1 : 0
    if (question.kind === 'match') return question.answer.reduce((n, value, j) => n + (answer[j] === value ? 1 : 0), 0)
    if (question.kind === 'order') {
      const first = answer[question.answer.indexOf(0)] === 0
      const last = answer[question.answer.indexOf(3)] === 3
      return first && last ? (question.answer.every((value, j) => answer[j] === value) ? 3 : 2) : first || last ? 1 : 0
    }
    return question.answer.reduce((n, value) => n + (answer.includes(value) ? 1 : 0), 0)
  }
  const questionScores = useMemo(() => questions.map((item, i) => scoreQuestion(item, i)), [answers])
  const raw = questionScores.reduce((sum, value) => sum + value, 0)
  const question = questions[index]
  const maxScore = (item: Question) => item.kind === 'choice' ? 1 : item.kind === 'match' ? 4 : 3
  const explanation = (item: Question) => {
    if (item.kind === 'choice') return `Правильна відповідь: ${item.options[item.answer]}. ${item.why}`
    if (item.kind === 'match') return `Правильні пари: ${item.left.map((label, i) => `${i + 1} — ${letters[item.answer[i]]}: ${label} — ${item.right[item.answer[i]]}`).join('; ')}.`
    if (item.kind === 'order') return `Правильна послідовність: ${item.answer.map((position, i) => ({ position, event: item.events[i], letter: letters[i] })).sort((a, b) => a.position - b.position).map((entry, i) => `${i + 1}. ${entry.letter} — ${entry.event}`).join('; ')}.`
    return `Правильні варіанти: ${item.answer.map((answerIndex) => `${letters[answerIndex]} — ${item.options[answerIndex]}`).join('; ')}.`
  }
  const isQuestionCorrect = (i: number) => questionScores[i] === maxScore(questions[i])
  const isAnswered = (i: number) => {
    const selected = answers[i] ?? []
    const item = questions[i]
    if (item.kind === 'choice' || item.kind === 'pick') return selected.length > 0
    return selected.length === 4 && selected.every((value) => value >= 0)
  }
  const setOne = (value: number) => setAnswers((current) => ({ ...current, [index]: [value] }))
  const setMany = (value: number, max: number) => setAnswers((current) => {
    const selected = current[index] ?? []
    const next = selected.includes(value) ? selected.filter((item) => item !== value) : selected.length < max ? [...selected, value] : selected
    return { ...current, [index]: next }
  })
  const setPair = (row: number, value: number) => setAnswers((current) => {
    const next = [...(current[index] ?? Array(4).fill(-1))]
    next.forEach((assigned, i) => { if (i !== row && assigned === value) next[i] = -1 })
    next[row] = value
    return { ...current, [index]: next }
  })
  const setOrderCell = (position: number, eventIndex: number) => setAnswers((current) => {
    const next = [...(current[index] ?? Array(4).fill(-1))]
    next.forEach((assignedPosition, i) => { if (i !== eventIndex && assignedPosition === position) next[i] = -1 })
    next[eventIndex] = position
    return { ...current, [index]: next }
  })
  const resetTest = () => { setAnswers({}); setChecked({}); setExplanationOpen({}); setIndex(0); setFinished(false) }
  const earned = Math.min(200, historyScale[raw] ?? 0)
  if (mode === 'select') return <section className="notes-section quiz-section" aria-label="Вибір режиму тесту">
    <p className="quiz-intro">Обери, як проходити тест «{variant === 1 ? 'Для Артема Ситника' : 'Для Артема Мунтяна'}» з історії України.</p>
    <div className="test-mode-grid">
      <button type="button" className="test-mode-card" onClick={() => { resetTest(); setMode('exam') }}><span>01 · ІСПИТ</span><strong>Перевірити себе</strong><small>Правильні відповіді та пояснення відкриються після завершення всіх 30 завдань.</small></button>
      <button type="button" className="test-mode-card" onClick={() => { resetTest(); setMode('practice') }}><span>02 · ТРЕНУВАННЯ</span><strong>Вчитися під час тесту</strong><small>Після фіксації кожної відповіді одразу побачиш результат і пояснення.</small></button>
    </div>
  </section>
  return <section className="notes-section quiz-section" aria-label="Авторський тренувальний варіант з історії України">
    <p className="quiz-intro">Авторський варіант у форматі НМТ: 20 завдань із вибором відповіді, 4 на відповідність, 3 на послідовність і 3 на вибір трьох відповідей. За правильну пару нараховується 1 бал.</p>
    <div className="quiz-topline"><span>{mode === 'exam' ? 'Іспит' : 'Тренування'} · Завдання {index + 1} із 30</span><strong>{mode === 'exam' ? 'Результат і відповіді відкриються після завершення' : `Набрано ${raw} із ${total} тестових балів`}</strong></div>
    {!finished ? <>
      <nav className="quiz-task-nav" aria-label="Перейти до завдання">{questions.map((_, i) => <button type="button" className={`quiz-task-number${i === index ? ' active' : ''}${isAnswered(i) ? ' answered' : ''}${mode === 'practice' && checked[i] ? (isQuestionCorrect(i) ? ' correct' : ' incorrect') : ''}`} aria-label={`Завдання ${i + 1}${checked[i] ? (isQuestionCorrect(i) ? ', правильна відповідь' : 'перевірено, є помилки') : isAnswered(i) ? ', є відповідь' : ', без відповіді'}`} onClick={() => setIndex(i)} key={i}>{i + 1}</button>)}</nav>
      <article className="quiz-current-task"><p className="quiz-task-type">Завдання {index + 1} · {question.kind === 'choice' ? 'одна відповідь' : question.kind === 'match' ? 'відповідність' : question.kind === 'order' ? 'послідовність' : 'обери три відповіді'}</p><h5>{question.prompt}</h5>
        {question.kind === 'choice' && <>{question.image && <img className="practice-question-image" src={question.image.src} alt={question.image.alt} />}<div className="quiz-answers">{question.options.map((option, i) => <label className={`quiz-answer${mode === 'practice' && checked[index] && i === question.answer ? ' answer-correct' : ''}${mode === 'practice' && checked[index] && answers[index]?.[0] === i && i !== question.answer ? ' answer-incorrect' : ''}`} key={option}><input type="radio" name={`q-${index}`} checked={answers[index]?.[0] === i} disabled={mode === 'practice' && checked[index]} onChange={() => setOne(i)} /><span>{option}</span></label>)}</div></>}
        {question.kind === 'pick' && <div className="quiz-answers">{question.options.map((option, i) => <label className={`quiz-answer${mode === 'practice' && checked[index] && question.answer.includes(i) ? ' answer-correct' : ''}${mode === 'practice' && checked[index] && (answers[index] ?? []).includes(i) && !question.answer.includes(i) ? ' answer-incorrect' : ''}`} key={option}><input type="checkbox" checked={(answers[index] ?? []).includes(i)} disabled={mode === 'practice' && checked[index]} onChange={() => setMany(i, 3)} /><span>{option}</span></label>)}</div>}
        {question.kind === 'match' && <div className="match-task-layout">
          <div className="match-pair-lists">
            <ol className="match-left-list">{question.left.map((label, row) => <li className={mode === 'practice' && checked[index] ? (answers[index]?.[row] === question.answer[row] ? 'answer-correct' : 'answer-incorrect') : ''} key={label}>{label}</li>)}</ol>
            <ol className="match-right-list">{question.right.map((label, i) => <li key={label}><span>{letters[i]}</span>{label}</li>)}</ol>
          </div>
          <div className="match-matrix-wrap"><table className="match-matrix" aria-label="Таблиця для позначення відповідностей"><thead><tr><th scope="col">№</th>{question.right.map((_, i) => <th scope="col" key={i}>{letters[i]}</th>)}</tr></thead><tbody>{question.left.map((label, row) => <tr key={label}><th scope="row">{row + 1}</th>{question.right.map((option, col) => {
            const selected = answers[index]?.[row] === col
            const isCorrect = question.answer[row] === col
            const feedback = mode === 'practice' && checked[index] ? isCorrect ? ' answer-correct' : selected ? ' answer-incorrect' : '' : ''
            return <td key={option}><button type="button" className={`answer-grid-cell${selected ? ' selected' : ''}${feedback}`} aria-label={`Завдання ${row + 1}, відповідь ${letters[col]}`} aria-pressed={selected} disabled={mode === 'practice' && checked[index]} onClick={() => setPair(row, col)}>{selected ? '●' : ''}</button></td>
          })}</tr>)}</tbody></table></div>
        </div>}
        {question.kind === 'order' && <div className="order-task-layout">
          <ol className="order-events-list">{question.events.map((event, i) => <li key={event}><span>{letters[i]}</span>{event}</li>)}</ol>
          <div className="match-matrix-wrap"><table className="match-matrix order-matrix" aria-label="Таблиця для встановлення послідовності"><thead><tr><th scope="col">Подія</th>{['1', '2', '3', '4'].map((place) => <th scope="col" key={place}>{place}</th>)}</tr></thead><tbody>{question.events.map((event, col) => <tr key={event}><th scope="row">{letters[col]}</th>{[0, 1, 2, 3].map((row) => {
            const selected = answers[index]?.[col] === row
            const isCorrect = question.answer[col] === row
            const feedback = mode === 'practice' && checked[index] ? isCorrect ? ' answer-correct' : selected ? ' answer-incorrect' : '' : ''
            return <td key={row}><button type="button" className={`answer-grid-cell${selected ? ' selected' : ''}${feedback}`} aria-label={`Подія ${letters[col]}, місце ${row + 1}`} aria-pressed={selected} disabled={mode === 'practice' && checked[index]} onClick={() => setOrderCell(row, col)}>{selected ? '●' : ''}</button></td>
          })}</tr>)}</tbody></table></div>
        </div>}
        {mode === 'practice' && checked[index] && <div className={`training-feedback${isQuestionCorrect(index) ? ' correct' : ' incorrect'}`} role="status"><strong>{isQuestionCorrect(index) ? `Правильно · ${questionScores[index]} із ${maxScore(question)} балів` : `Відповідь перевірено · ${questionScores[index]} із ${maxScore(question)} балів`}</strong><div className="training-feedback-actions"><button className="quiz-explanation-button" type="button" aria-expanded={Boolean(explanationOpen[index])} onClick={() => setExplanationOpen((current) => ({ ...current, [index]: !current[index] }))}>{explanationOpen[index] ? 'Сховати пояснення' : 'Пояснення'}</button></div>{explanationOpen[index] && <p>{explanation(question)}</p>}</div>}
      </article>
      <div className="quiz-actions">{mode === 'practice' && !checked[index] && isAnswered(index) && <button className="quiz-explanation-button" type="button" onClick={() => setChecked((current) => ({ ...current, [index]: true }))}>Перевірити відповідь</button>}</div>
      <div className="quiz-pager"><button type="button" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>← Попереднє питання</button><button className="quiz-submit" type="button" onClick={() => index === 29 ? setFinished(true) : setIndex((i) => Math.min(29, i + 1))}>{index === 29 ? (mode === 'exam' ? 'Завершити іспит' : 'Завершити тренування') : 'Наступне питання →'}</button></div>
    </> : <section className="quiz-final-result" aria-live="polite"><h5>{mode === 'exam' ? 'Іспит завершено' : 'Тренування завершено'}</h5><div className="quiz-final-stats"><p><strong>{raw} / 54</strong><span>тестових балів</span></p><p><strong>{earned >= 100 ? earned : '—'}</strong><span>за шкалою 100–200</span></p><p><strong>{Object.keys(answers).filter((key) => isAnswered(Number(key))).length} / 30</strong><span>завдань із відповідями</span></p></div><h5 className="question-score-heading">Розбір відповідей</h5><div className="exam-review-list">{questions.map((item, i) => <details className="exam-review-item" key={i}><summary>Завдання {i + 1} · {questionScores[i]} із {maxScore(item)} балів</summary><p className="exam-review-prompt">{item.prompt}</p>{item.kind === 'choice' && item.image && <img className="practice-question-image" src={item.image.src} alt={item.image.alt} />}<p className="exam-review-answer">{explanation(item)}</p></details>)}</div><div className="quiz-final-actions"><button className="quiz-submit" type="button" onClick={resetTest}>Пройти наново</button><button className="quiz-explanation-button" type="button" onClick={() => setMode('select')}>Змінити режим</button></div><p className="quiz-result-note">Невідповідані завдання зараховано як неправильні. Результат нижче 9 балів не переводиться в шкалу 100–200.</p></section>}
  </section>
}
