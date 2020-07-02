const tasks = arr => arr.join(' && ')
const isOrta = process.env.USER.includes("orta")

// Everyone else gets a NO-OP
module.exports = !isOrta ? {} : {
  'hooks': {
    'pre-push': tasks([
      'yarn format',
      'yarn build',
      'yarn jest'
    ])
  }
}
