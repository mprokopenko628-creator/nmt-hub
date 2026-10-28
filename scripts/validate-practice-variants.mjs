import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = fs.readFileSync('src/historyPracticeVariantTwoData.ts', 'utf8')
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const module = { exports: {} }
vm.runInNewContext(output, { module, exports: module.exports })
const errors = []

const firstSource = fs.readFileSync('src/HistoryPracticeVariant.tsx', 'utf8')
const firstAst = ts.createSourceFile('HistoryPracticeVariant.tsx', firstSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const selectedNames = new Set(['Choice', 'Match', 'Order', 'Pick', 'Question'])
const typeDeclarations = firstAst.statements.filter((statement) => ts.isTypeAliasDeclaration(statement) && selectedNames.has(statement.name.text))
const firstQuestionsDeclaration = firstAst.statements.find((statement) => ts.isVariableStatement(statement) && statement.declarationList.declarations.some((declaration) => declaration.name.getText(firstAst) === 'firstQuestions'))
const seededOrderDeclaration = firstAst.statements.find((statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === 'seededOrder')
const firstChoiceCountsDeclaration = firstAst.statements.find((statement) => ts.isVariableStatement(statement) && statement.declarationList.declarations.some((declaration) => declaration.name.getText(firstAst) === 'firstChoicePositionCounts'))
const shuffledQuestionsDeclaration = firstAst.statements.find((statement) => ts.isVariableStatement(statement) && statement.declarationList.declarations.some((declaration) => declaration.name.getText(firstAst) === 'shuffledFirstQuestions'))
if (!firstQuestionsDeclaration || !seededOrderDeclaration || !firstChoiceCountsDeclaration || !shuffledQuestionsDeclaration || typeDeclarations.length !== selectedNames.size) {
  errors.push('Не вдалося завантажити дані першого авторського варіанта для перевірки')
}
const firstDataSource = [...typeDeclarations, firstQuestionsDeclaration, seededOrderDeclaration, firstChoiceCountsDeclaration, shuffledQuestionsDeclaration]
  .map((statement) => statement.getText(firstAst)).join('\n') + '\nmodule.exports = shuffledFirstQuestions'
const firstDataOutput = ts.transpileModule(firstDataSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const firstDataModule = { exports: {} }
vm.runInNewContext(firstDataOutput, { module: firstDataModule, exports: firstDataModule.exports })

const validateVariant = (name, questions) => {
  const counts = { choice: 0, match: 0, order: 0, pick: 0 }
  const correctLetterCounts = [0, 0, 0, 0]
  let visualCount = 0
  if (questions.length !== 30) errors.push(`${name}: очікується 30 завдань, знайдено ${questions.length}`)
  for (const [index, question] of questions.entries()) {
    counts[question.kind]++
    const number = index + 1
    if (question.kind === 'choice') {
      if (question.options.length !== 4 || new Set(question.options).size !== 4) errors.push(`${name}, завдання ${number}: потрібно 4 різні варіанти відповіді`)
      if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length) errors.push(`${name}, завдання ${number}: некоректний ключ`)
      else correctLetterCounts[question.answer]++
      if (!question.why?.trim()) errors.push(`${name}, завдання ${number}: немає пояснення`)
    } else if (question.kind === 'match') {
      if (question.left.length !== 4 || new Set(question.left).size !== 4) errors.push(`${name}, завдання ${number}: відповідність має містити 4 різні завдання`)
      if (question.right.length !== 5 || new Set(question.right).size !== 5) errors.push(`${name}, завдання ${number}: відповідність має містити 5 різних варіантів А–Д`)
      if (question.answer.length !== 4 || new Set(question.answer).size !== 4 || question.answer.some((answer) => answer < 0 || answer >= question.right.length)) errors.push(`${name}, завдання ${number}: ключі відповідності не утворюють чотири однозначні пари`)
    } else if (question.kind === 'order') {
      if (question.events.length !== 4 || new Set(question.events).size !== 4) errors.push(`${name}, завдання ${number}: хронологія має містити 4 різні події`)
      if (question.answer.length !== 4 || new Set(question.answer).size !== 4 || question.answer.some((rank) => rank < 0 || rank > 3)) errors.push(`${name}, завдання ${number}: ключ хронології має бути перестановкою 1–4`)
    } else if (question.kind === 'pick') {
      if (question.options.length !== 7 || new Set(question.options).size !== 7) errors.push(`${name}, завдання ${number}: потрібно 7 різних варіантів`)
      if (question.answer.length !== 3 || new Set(question.answer).size !== 3 || question.answer.some((answer) => answer < 0 || answer > 6)) errors.push(`${name}, завдання ${number}: ключ має містити рівно три різні відповіді`)
    }
    if (question.kind === 'choice' && question.image) {
      visualCount++
      const imagePath = `public${question.image.src}`
      if (!fs.existsSync(imagePath)) errors.push(`${name}, завдання ${number}: не знайдено зображення ${imagePath}`)
      if (!question.image.alt?.trim()) errors.push(`${name}, завдання ${number}: немає опису зображення`)
    }
  }
  for (const [kind, expected] of Object.entries({ choice: 20, match: 4, order: 3, pick: 3 })) {
    if (counts[kind] !== expected) errors.push(`${name}: очікується ${expected} завдань типу ${kind}, знайдено ${counts[kind]}`)
  }
  if (Math.max(...correctLetterCounts) - Math.min(...correctLetterCounts) > 6) errors.push(`${name}: ключі вибору однієї відповіді надто нерівномірні: ${correctLetterCounts.join('/')}`)
  if (visualCount < 2) errors.push(`${name}: потрібно щонайменше два візуальні завдання; знайдено ${visualCount}`)
  return { counts, correctLetterCounts, visualCount }
}

const firstStats = validateVariant('Перший авторський варіант', firstDataModule.exports)
const secondStats = validateVariant('Другий авторський варіант', module.exports.secondQuestions)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Перевірено обидва авторські варіанти: по 30 завдань формату 20/4/3/3 і 54 бали. Варіант 1: ${firstStats.visualCount} візуали, ключі А–Г ${firstStats.correctLetterCounts.join('/')}. Варіант 2: ${secondStats.visualCount} візуали, ключі А–Г ${secondStats.correctLetterCounts.join('/')}.`)
}
