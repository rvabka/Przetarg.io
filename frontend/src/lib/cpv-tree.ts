export interface CpvRawEntry {
  code: string
  description: string
}

export interface CpvNode {
  code: string
  description: string
  children: CpvNode[]
  level: number
}

/**
 * Returns the numeric part of a CPV code (before the dash).
 * e.g. "45210000-2" -> "45210000"
 */
function numericPart(code: string): string {
  return code.split('-')[0]
}

/**
 * Determines the hierarchy level based on trailing zeros.
 * XX000000 = 0 (Division)
 * XXXX0000 = 1 (Group)
 * XXXXXX00 = 2 (Class)
 * XXXXXXXX = 3 (Category / leaf)
 */
function getLevel(code: string): number {
  const num = numericPart(code)
  if (num.endsWith('000000')) return 0
  if (num.endsWith('0000')) return 1
  if (num.endsWith('00')) return 2
  return 3
}

/**
 * Finds the parent code by replacing trailing non-zero pairs with zeros.
 * e.g. 45210000-2 -> parent is 45200000-X (level 1)
 *      45200000-9 -> parent is 45000000-X (level 0)
 */
function getParentNumeric(code: string): string | null {
  const num = numericPart(code)
  const level = getLevel(code)
  if (level === 0) return null

  // Replace the relevant digits with zeros
  const chars = num.split('')
  if (level === 1) {
    // XXXX0000 -> XX000000
    chars[2] = '0'
    chars[3] = '0'
  } else if (level === 2) {
    // XXXXXX00 -> XXXX0000
    chars[4] = '0'
    chars[5] = '0'
  } else {
    // XXXXXXXX -> XXXXXX00
    chars[6] = '0'
    chars[7] = '0'
  }
  return chars.join('')
}

/**
 * Builds a tree structure from flat CPV data.
 * Returns only root nodes (level 0), with children nested.
 */
export function buildCpvTree(data: CpvRawEntry[]): CpvNode[] {
  // Index all entries by their numeric part for fast parent lookup
  const nodeMap = new Map<string, CpvNode>()

  // Create nodes
  for (const entry of data) {
    const num = numericPart(entry.code)
    nodeMap.set(num, {
      code: entry.code,
      description: entry.description,
      children: [],
      level: getLevel(entry.code),
    })
  }

  const roots: CpvNode[] = []

  // Build parent-child relationships
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
        // Orphan - push as root
        roots.push(node)
      }
    }
  }

  return roots
}

/**
 * Filters the tree to only include nodes matching the query.
 * A node is included if it matches OR any of its descendants match.
 * Returns a new tree (does not mutate original).
 */
export function filterTree(roots: CpvNode[], query: string): CpvNode[] {
  const q = query.toLowerCase().trim()
  if (!q) return roots

  function matches(node: CpvNode): boolean {
    return (
      node.code.toLowerCase().includes(q) ||
      node.description.toLowerCase().includes(q)
    )
  }

  function filterNode(node: CpvNode): CpvNode | null {
    const filteredChildren = node.children
      .map(filterNode)
      .filter((n): n is CpvNode => n !== null)

    if (matches(node) || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children.filter(matches).length > 0 ? filteredChildren : matches(node) ? node.children : filteredChildren,
      }
    }
    return null
  }

  // Simpler approach: if the node itself matches, show it with all children.
  // If only children match, show the path to them.
  function filterNodeSimple(node: CpvNode): CpvNode | null {
    if (matches(node)) {
      // Node matches - include it with all its children
      return node
    }

    // Check if any descendant matches
    const filteredChildren = node.children
      .map(filterNodeSimple)
      .filter((n): n is CpvNode => n !== null)

    if (filteredChildren.length > 0) {
      return { ...node, children: filteredChildren }
    }

    return null
  }

  return roots
    .map(filterNodeSimple)
    .filter((n): n is CpvNode => n !== null)
}

/**
 * Collects all codes that should be auto-expanded when showing search results.
 * Returns the set of codes for nodes that have matching descendants.
 */
export function getExpandedCodesForFilter(roots: CpvNode[], query: string): Set<string> {
  const q = query.toLowerCase().trim()
  if (!q) return new Set()

  const expanded = new Set<string>()

  function matches(node: CpvNode): boolean {
    return (
      node.code.toLowerCase().includes(q) ||
      node.description.toLowerCase().includes(q)
    )
  }

  function walk(node: CpvNode): boolean {
    let hasMatchingDescendant = false
    for (const child of node.children) {
      if (walk(child) || matches(child)) {
        hasMatchingDescendant = true
      }
    }
    if (hasMatchingDescendant) {
      expanded.add(node.code)
    }
    return hasMatchingDescendant
  }

  for (const root of roots) {
    walk(root)
  }

  return expanded
}
