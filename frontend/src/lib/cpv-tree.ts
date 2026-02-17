export interface CpvRawEntry {
  code: string
  description: string
}

export interface CpvNode {
  code: string
  description: string
  children: CpvNode[]
  level: number
  /** Pre-lowercased code + description for fast filtering */
  _searchText: string
}

function numericPart(code: string): string {
  return code.split('-')[0]
}

function getLevel(code: string): number {
  const num = numericPart(code)
  let trailingZeros = 0
  for (let i = num.length - 1; i >= 0; i--) {
    if (num[i] === '0') trailingZeros++
    else break
  }
  return 6 - trailingZeros
}

function getParentNumeric(code: string): string | null {
  const num = numericPart(code)
  let trailingZeros = 0
  for (let i = num.length - 1; i >= 0; i--) {
    if (num[i] === '0') trailingZeros++
    else break
  }
  if (trailingZeros >= 6) return null
  const lastSigPos = num.length - 1 - trailingZeros
  const chars = num.split('')
  chars[lastSigPos] = '0'
  return chars.join('')
}

export function buildCpvTree(data: CpvRawEntry[]): CpvNode[] {
  const nodeMap = new Map<string, CpvNode>()

  for (const entry of data) {
    const num = numericPart(entry.code)
    nodeMap.set(num, {
      code: entry.code,
      description: entry.description,
      children: [],
      level: getLevel(entry.code),
      _searchText: (entry.code + ' ' + entry.description).toLowerCase(),
    })
  }

  const roots: CpvNode[] = []

  for (const entry of data) {
    const num = numericPart(entry.code)
    const node = nodeMap.get(num)!
    const parentNum = getParentNumeric(entry.code)

    if (parentNum === null) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(parentNum)
      if (parent) {
        parent.children.push(node)
      } else {
        let ancestorNum = parentNum
        let found = false
        while (ancestorNum) {
          let tz = 0
          for (let i = ancestorNum.length - 1; i >= 0; i--) {
            if (ancestorNum[i] === '0') tz++
            else break
          }
          if (tz >= 6) break
          const pos = ancestorNum.length - 1 - tz
          const chars = ancestorNum.split('')
          chars[pos] = '0'
          ancestorNum = chars.join('')
          const ancestor = nodeMap.get(ancestorNum)
          if (ancestor) {
            ancestor.children.push(node)
            found = true
            break
          }
        }
        if (!found) {
          roots.push(node)
        }
      }
    }
  }

  return roots
}

/**
 * Combined filter + expand in a single tree walk.
 * Returns { tree: filtered tree, expanded: set of codes to auto-expand }.
 */
export function filterTreeWithExpanded(
  roots: CpvNode[],
  query: string
): { tree: CpvNode[]; expanded: Set<string> } {
  const q = query.toLowerCase().trim()
  if (!q) return { tree: roots, expanded: new Set() }

  const expanded = new Set<string>()

  function walkNode(node: CpvNode): CpvNode | null {
    const selfMatches = node._searchText.includes(q)

    if (selfMatches) {
      // Node matches — include it with ALL children (no further filtering needed)
      return node
    }

    // Check descendants
    const filteredChildren: CpvNode[] = []
    for (const child of node.children) {
      const result = walkNode(child)
      if (result) filteredChildren.push(result)
    }

    if (filteredChildren.length > 0) {
      // Has matching descendants — auto-expand this node
      expanded.add(node.code)
      return { ...node, children: filteredChildren }
    }

    return null
  }

  const tree: CpvNode[] = []
  for (const root of roots) {
    const result = walkNode(root)
    if (result) tree.push(result)
  }

  return { tree, expanded }
}
