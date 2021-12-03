/* eslint-disable no-console */
import {Application, ProjectReflection, TSConfigReader, TypeDocReader} from 'typedoc'

const parser = async (project: ProjectReflection) => {
  console.log(project.getChildByName('<internal>').getChildByName('LocalizedString'))
}

(async function () {
  const app = new Application()

  // If you want TypeDoc to load tsconfig.json / typedoc.json files
  app.options.addReader(new TSConfigReader())
  app.options.addReader(new TypeDocReader())

  app.bootstrap()

  const project = app.convert()

  if (project) {
    await parser(project)
  }
})().catch(console.error)
