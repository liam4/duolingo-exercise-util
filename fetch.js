'use strict'

require('dotenv').config()
const fsp = require('fs-promise')
const fetch = require('node-fetch')
const toMarkdown = require('to-markdown')

const ESC = '\x1b'

const l = n => `${ESC}[${n}D`
const d = n => `${ESC}[${n}B`
const u = n => `${ESC}[${n}A`

let blahLog = ''

let logLines = 0
function log(what) {

  logLines++
  const old = logLines

  blahLog += 'log: ' + what + '\n'

  process.stdout.write(
    what + l(what.length) + d(1)
  )

  return function(newWhat) {
    blahLog += 'new log: ' + newWhat
    blahLog += ' @ ' + old + ',' + (logLines - old)
    // blahLog += ' ... ' + (logLines - old)
    blahLog += '\n'

    process.stdout.write(
      u(logLines - old) + newWhat + l(newWhat.length) + d(logLines - old)
    )
  }
}

function doit(name) {
  throwIfUndefined(name, 'No name passed')
  const u = encodeURI(`https://www.duolingo.com/2016-04-13/skills?learningLanguage=fr&urlName=${name}`)
  const cookie = `auth_tkt="${process.env.TOKEN}"`

  const res = log(name + '..')

  return fetch(u, {headers: {cookie}})
    .then(res => res.json())
    .then(res => res.skills[0])
    .then(skill => throwIfUndefined(skill, 'Skill not found'))
    .then(skill => [skill.name, skill.explanation])
    .then(etc => (res('💾  ' + name), etc))
    .then(([name, explanation]) => `<meta charset='utf8'><h1>${name}</h1>\n${explanation}`)
    .then((htmlExplanation) => {
      return Promise.all([
        fsp.writeFile(`page/${name}.md`, toMarkdown(htmlExplanation)),
        fsp.writeFile(`page/${name}.html`, '<link rel="stylesheet" href="main.css">' + htmlExplanation),
      ])
    })
    .then(() => {
      res('🎉  ' + `${ESC}[32m` + name + `${ESC}[0m`)
    })
    .catch(e => {
      res('😿  ' + `${ESC}[31m` + name + ' - ' + e.message + `${ESC}[0m`)
    })

  // When hoisting is useful
  function throwIfUndefined(val, msg) {
    if (val === undefined) {
      throw new Error(msg)
    } else {
      return val
    }
  }
}

Promise.all([
  log('#######################'),
  doit('Basics-1'),
  doit('Basics-2'),
  doit('Animals'),
  doit('Common-Phrases'),
  doit('Food'),
  doit('Adjectives-1'),
  doit('Plurals'),
  doit('Verbs:-Être-_-Avoir'),
  doit('Clothing'),
  doit('Colors'),
  doit('Possessives'),
  doit('Verbs:-Present-1'),
  doit('Demonstratives-1'),
  doit('Conjunctions-1'),
  doit('Questions'),
  doit('Verbs:-Present-2'),
  doit('Adjectives-2'),
  doit('Pronouns'),
  doit('Prepositions-1'),
  doit('Numbers-1'),
  doit('Family'),
  doit('Possessifs-2'),
  doit('Demonstratives-2'),
  doit('Dates-and-time'),
  doit('Verbs:-Infinitive'),
  log('#######################'),
  (() => {
    logLines++
  })()
]).then(() => {
  // log(':tada:')
})
