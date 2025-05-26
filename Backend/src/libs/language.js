const { languages: languagesRaw } = require('../seeder/seeder.js')

const languageProject = async (language = 'EN') => {
  // select response language in seeder
  const [filterLanguage] = languagesRaw[0].data.filter(v => v.code === language) || []
  if (!filterLanguage) return 'EN'
  return filterLanguage['code'] // set default project language = 'EN'
}

module.exports = { languageProject }
