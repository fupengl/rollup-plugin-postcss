import pify from 'pify'
import LessNpmImport from 'less-plugin-npm-import'
import humanlizePath from './utils/humanlize-path'
import { loadModule } from './utils/load-module'

/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
  name: 'less',
  test: /\.less$/,
  async process({ code }) {
    const less = loadModule('less')
    if (!less) {
      throw new Error('You need to install "less" packages in order to process Less files')
    }

    let { css, map, imports } = await pify(less.render.bind(less))(code, {
      ...this.options,
      sourceMap: this.sourceMap && {},
      filename: this.id,
      plugins: [new LessNpmImport({ prefix: '~' })]
    })

    for (const dep of imports) {
      this.dependencies.add(dep)
    }

    if (map) {
      map = JSON.parse(map)
      map.sources = map.sources.map(source => humanlizePath(source))
    }

    return {
      code: css,
      map
    }
  }
}
