import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./dist/lambda.js'],
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: 'node',
  target: 'node20',
  outfile: './bundle/lambda.js',
  external: ['pg-native'],
  format: 'cjs',
})

console.log('✓ Bundle created successfully')
