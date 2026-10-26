import type { Pair } from '../shared/types'
import type { TargetRecord, TargetKind } from '../shared/importTypes'
import { listTargetsByPairId, upsertTarget } from './targetRepository'

export function defaultTargetKindForPair(_pair: Pair): TargetKind {
  return 'codex'
}

export function ensureDefaultTarget(pair: Pair): TargetRecord {
  const existing = listTargetsByPairId(pair.id)[0]
  if (existing) return existing

  return upsertTarget({
    pairId: pair.id,
    kind: defaultTargetKindForPair(pair),
    rootPath: pair.targetPath,
    layoutVersion: '1',
    agentName: 'codex',
    metadataJson: JSON.stringify({
      pairName: pair.name,
      sourcePath: pair.sourcePath,
    }),
  })
}

export function listPairTargets(pair: Pair): TargetRecord[] {
  const targets = listTargetsByPairId(pair.id)
  if (targets.length > 0) return targets
  return [ensureDefaultTarget(pair)]
}
