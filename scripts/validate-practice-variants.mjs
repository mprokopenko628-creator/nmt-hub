import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = fs.readFileSync('src/historyPracticeVariantTwoData.ts', 'utf8')
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const module = { exports: {} }
vm.runInNewContext(output, { module, exports: module.exports })
const questions = module.exports.secondQuestions
const errors = []
const counts = { choice: 0, match: 0, order: 0, pick: 0 }
const correctLetterCounts = [0, 0, 0, 0]

if (questions.length !== 30) errors.push(`Очікується 30 завдань, знайдено ${questions.length}`)
for (const [index, question] of questions.entries()) {
  counts[question.kind]++
  const number = index + 1
  if (question.kind === 'choice') {
    if (question.options.length !== 4 || new Set(question.options).size !== 4) errors.push(`Завдання ${number}: потрібно 4 різні варіанти відповіді`)
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length) errors.push(`Завдання ${number}: некоректний ключ`)
    else correctLetterCounts[question.answer]++
    if (!question.why?.trim()) errors.push(`Завдання ${number}: немає пояснення`)
  } else if (question.kind === 'match') {
    if (question.left.length !== 4 || new Set(question.left).size !== 4) errors.push(`Завдання ${number}: відповідність має містити 4 різні завдання`)
    if (question.right.length !== 5 || new Set(question.right).size !== 5) errors.push(`Завдання ${number}: відповідність має містити 5 різних варіантів А–Д`)
    if (question.answer.length !== 4 || new Set(question.answer).size !== 4 || question.answer.some((answer) => answer < 0 || answer >= question.right.length)) errors.push(`Завдання ${number}: ключі відповідності не утворюють чотири однозначні пари`)
  } else if (question.kind === 'order') {
    if (question.events.length !== 4 || new Set(question.events).size !== 4) errors.push(`Завдання ${number}: хронологія має містити 4 різні події`)
    if (question.answer.length !== 4 || new Set(question.answer).size !== 4 || question.answer.some((rank) => rank < 0 || rank > 3)) errors.push(`Завдання ${number}: ключ хронології має бути перестановкою 1–4`)
  } else if (question.kind === 'pick') {
    if (question.options.length !== 7 || new Set(question.options).size !== 7) errors.push(`Завдання ${number}: потрібно 7 різних варіантів`)
    if (question.answer.length !== 3 || new Set(question.answer).size !== 3 || question.answer.some((answer) => answer < 0 || answer > 6)) errors.push(`Завдання ${number}: ключ має містити рівно три різні відповіді`)
  }
  if (question.kind === 'choice' && question.image) {
    const imagePath = `public${question.image.src}`
    if (!fs.existsSync(imagePath)) errors.push(`Завдання ${number}: не знайдено зображення ${imagePath}`)
    if (!question.image.alt?.trim()) errors.push(`Завдання ${number}: немає опису зображення`)
  }
}

for (const [kind, expected] of Object.entries({ choice: 20, match: 4, order: 3, pick: 3 })) {
  if (counts[kind] !== expected) errors.push(`Очікується ${expected} завдань типу ${kind}, знайдено ${counts[kind]}`)
}
if (Math.max(...correctLetterCounts) - Math.min(...correctLetterCounts) > 6) errors.push(`Ключі одиничного вибору надто нерівномірні за позиціями: ${correctLetterCounts.join('/')}`)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Другий авторський варіант: 30 завдань перевірено (20/4/3/3), 54 бали; розподіл ключів А–Г: ${correctLetterCounts.join('/')}.`)
}
