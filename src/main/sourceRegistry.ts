import type { SourceRecord } from '../shared/importTypes'
import {
  createSource,
  getSourceByCanonicalUrl,
  listSources,
  type SourceUpsertInput,
  upsertSourceByCanonicalUrl,
} from './sourceRepository'

export function listRegisteredSources(): SourceRecord[] {
  return listSources()
}

export function findRegisteredSource(canonicalUrl: string): SourceRecord | null {
  return getSourceByCanonicalUrl(canonicalUrl)
}

export function registerSource(input: SourceUpsertInput): SourceRecord {
  return createSource(input)
}

export function upsertRegisteredSource(input: SourceUpsertInput): SourceRecord {
  return upsertSourceByCanonicalUrl(input)
}
