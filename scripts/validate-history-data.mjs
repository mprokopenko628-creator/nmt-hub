import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const transpileAndLoad = (file, requireImpl = () => ({})) => {
  const source = fs.readFileSync(file, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(output, { module, exports: module.exports, require: requireImpl })
  return module.exports
}

const early = transpileAndLoad('src/historyEarlyQuizData.ts')
const topic = transpileAndLoad('src/historyTopicQuizData.ts', () => early)
const tenSource = fs.readFileSync('src/HistoryTopicTenQuiz.tsx', 'utf8')
const tenGroupsSource = tenSource.slice(tenSource.indexOf('const groups:'), tenSource.indexOf('const matchingTasks:'))
const tenMatchesStart = tenSource.indexOf('const matchingTasks:')
const tenMatchesEnd = tenSource.indexOf('function makeChoiceTasks', tenMatchesStart)
const tenMatchesSource = tenSource.slice(tenMatchesStart, tenMatchesEnd)
const tenModuleSource = `${tenGroupsSource}\n${tenMatchesSource}\nmodule.exports = { groups, matchingTasks }`
const tenOutput = ts.transpileModule(tenModuleSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const tenModule = { exports: {} }
vm.runInNewContext(tenOutput, { module: tenModule, exports: tenModule.exports })
const banks = { ...early.earlyHistoryQuizData, ...topic.historyQuizData, 10: { groups: tenModule.exports.groups, matchingTasks: tenModule.exports.matchingTasks } }
const errors = []
let matchingCount = 0

for (const [topicId, data] of Object.entries(banks)) {
  if (data.groups.length !== 10) errors.push(`Тема ${topicId}: очікується 10 груп, знайдено ${data.groups.length}`)
  for (const [groupIndex, group] of data.groups.entries()) {
    if (group.links.length !== 4) errors.push(`Тема ${topicId}, група ${groupIndex + 1}: очікується 4 пари`)
    const left = group.links.map(([value]) => value)
    const right = group.links.map(([, value]) => value)
    if (new Set(left).size !== left.length) errors.push(`Тема ${topicId}, група ${groupIndex + 1}: дубльований лівий варіант`)
    if (new Set(right).size !== right.length) errors.push(`Тема ${topicId}, група ${groupIndex + 1}: дубльований правий варіант`)
    if (!group.title || !group.askLeft.includes('{value}') || !group.askRight.includes('{value}')) {
      errors.push(`Тема ${topicId}, група ${groupIndex + 1}: неповна умова групи`)
    }
    for (const [leftValue, rightValue] of group.links) {
      if (!leftValue.trim() || !rightValue.trim()) errors.push(`Тема ${topicId}, група ${groupIndex + 1}: порожня пара`)
    }
  }

  const authoredMatches = data.matchingTasks ?? data.groups.flatMap((group) => [group, group].map(() => ({ pairs: group.links })))
  for (const [taskIndex, task] of authoredMatches.entries()) {
    matchingCount++
    if (task.pairs.length !== 4) errors.push(`Тема ${topicId}, відповідність ${taskIndex + 1}: очікується 4 пари`)
    const left = task.pairs.map(([value]) => value)
    const right = task.pairs.map(([, value]) => value)
    if (new Set(left).size !== 4) errors.push(`Тема ${topicId}, відповідність ${taskIndex + 1}: повторюються завдання`)
    if (new Set(right).size !== 4) errors.push(`Тема ${topicId}, відповідність ${taskIndex + 1}: ключі не утворюють однозначні пари`)
    if (task.pairs.some(([a, b]) => !a?.trim() || !b?.trim())) errors.push(`Тема ${topicId}, відповідність ${taskIndex + 1}: порожній елемент`)

    const distractorPool = authoredMatches
      .filter((_, index) => index !== taskIndex)
      .flatMap((candidate) => candidate.pairs.map(([, answer]) => answer))
      .find((answer) => !right.includes(answer))
    const options = [...right, distractorPool ?? 'Жодна з наведених відповідей']
    if (new Set(options).size !== 5) errors.push(`Тема ${topicId}, відповідність ${taskIndex + 1}: немає п’яти різних варіантів А–Д`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(`Перевірено ${Object.keys(banks).length} тематичних банків, ${matchingCount} завдань на відповідність: по 4 однозначні пари й 5 різних варіантів у кожному.`)
}
