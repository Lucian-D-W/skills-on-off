import type { SkillItem } from '../../shared/types'

export function getSyncableGroupSkills(skills: SkillItem[], toggling: ReadonlySet<string>): SkillItem[] {
  return skills.filter((skill) => !skill.enabled && !skill.orphan && !toggling.has(skill.name))
}

export function getDesyncableGroupSkills(skills: SkillItem[], toggling: ReadonlySet<string>): SkillItem[] {
  return skills.filter((skill) => skill.enabled && !skill.orphan && !toggling.has(skill.name))
}
