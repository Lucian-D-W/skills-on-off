// Thin wrapper so renderer code doesn't directly reference window.skillApi
import type { SkillApi } from '../main/preload'
import type { GithubImportMode, PairProjectionMode } from '../shared/importTypes'

function getSkillApi(): SkillApi {
  const skillApi = (window as unknown as { skillApi?: SkillApi }).skillApi
  if (!skillApi) {
    throw new Error('Electron preload not loaded, skillApi unavailable')
  }
  return skillApi
}

export const api: SkillApi = {
  listPairs: () => getSkillApi().listPairs(),
  createPair: (name, sourcePath, targetPath, projectionMode: PairProjectionMode) =>
    getSkillApi().createPair(name, sourcePath, targetPath, projectionMode),
  updatePair: (id, name, sourcePath, targetPath, projectionMode: PairProjectionMode) =>
    getSkillApi().updatePair(id, name, sourcePath, targetPath, projectionMode),
  deletePair: (id) => getSkillApi().deletePair(id),
  scanSkills: (pairId, sourcePath, targetPath) => getSkillApi().scanSkills(pairId, sourcePath, targetPath),
  enableSkill: (pairId, sourcePath, targetPath, skillName) => getSkillApi().enableSkill(pairId, sourcePath, targetPath, skillName),
  disableSkill: (pairId, targetPath, skillName) => getSkillApi().disableSkill(pairId, targetPath, skillName),
  getSkillTargetPromotionStatus: (pairId, skillName) => getSkillApi().getSkillTargetPromotionStatus(pairId, skillName),
  promoteSkillTargetToSource: (pairId, skillName) => getSkillApi().promoteSkillTargetToSource(pairId, skillName),
  saveMeta: (pairId, skillName, note, projectTags, funcTags, customTags) =>
    getSkillApi().saveMeta(pairId, skillName, note, projectTags, funcTags, customTags),
  getMeta: (pairId, skillName) => getSkillApi().getMeta(pairId, skillName),
  listSources: () => getSkillApi().listSources(),
  previewGithubImport: (url) => getSkillApi().previewGithubImport(url),
  importGithubProject: (name, githubUrl, targetPath, importMode: GithubImportMode, projectionMode: PairProjectionMode) =>
    getSkillApi().importGithubProject(name, githubUrl, targetPath, importMode, projectionMode),
  importGithubProjectToPair: (pairId, githubUrl, importMode: GithubImportMode) =>
    getSkillApi().importGithubProjectToPair(pairId, githubUrl, importMode),
  getProjectLink: (pairId) => getSkillApi().getProjectLink(pairId),
  listProjectLinks: (pairId) => getSkillApi().listProjectLinks(pairId),
  getProjectLinkByTag: (pairId, projectTag) => getSkillApi().getProjectLinkByTag(pairId, projectTag),
  linkProjectToGithub: (pairId, projectTag, githubUrl, skillNames) =>
    getSkillApi().linkProjectToGithub(pairId, projectTag, githubUrl, skillNames),
  getProjectSyncStatus: (pairId, projectTag) => getSkillApi().getProjectSyncStatus(pairId, projectTag),
  checkProjectSync: (pairId, projectTag) => getSkillApi().checkProjectSync(pairId, projectTag),
  updateProjectSync: (pairId, projectTag) => getSkillApi().updateProjectSync(pairId, projectTag),
  repairProjectSync: (pairId, projectTag) => getSkillApi().repairProjectSync(pairId, projectTag),
  listInstallRecords: (pairId) => getSkillApi().listInstallRecords(pairId),
  removeManagedSkill: (pairId, projectTag, skillName) => getSkillApi().removeManagedSkill(pairId, projectTag, skillName),
  removeManagedGroup: (pairId, projectTag) => getSkillApi().removeManagedGroup(pairId, projectTag),
  listTargets: (pairId) => getSkillApi().listTargets(pairId),
  upsertTarget: (pairId, kind, rootPath, layoutVersion, agentName, metadataJson) =>
    getSkillApi().upsertTarget(pairId, kind, rootPath, layoutVersion, agentName, metadataJson),
  pickFolder: () => getSkillApi().pickFolder(),
}
