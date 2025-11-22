async function loader() {
  const markdownFiles = import.meta.glob('./data/*.md', {
    query: '?raw',
    import: 'default',
  })
  const entries = Object.entries(markdownFiles)
  const files = await Promise.all(
    entries.map(async ([path, resolver]) => {
      const content = (await resolver()) as string
      const filename = path.split('/').pop() || ''
      return { filename, content }
    }),
  )
  return files
}
export default loader
