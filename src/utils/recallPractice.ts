export function recallItems(value: string): string[] {
  return [...new Set(value.normalize('NFKC').toLowerCase().split(/[\s,，、;；]+/u).map((item) => item.trim()).filter(Boolean))]
}

export function checkRecall(material: string[], answer: string) {
  const targets = new Set(material)
  const responses = recallItems(answer)
  return { correct: responses.filter((item) => targets.has(item)), missing: material.filter((item) => !responses.includes(item)),
    extra: responses.filter((item) => !targets.has(item)) }
}
