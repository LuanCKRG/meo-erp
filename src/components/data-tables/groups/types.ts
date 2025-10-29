import type { GroupRuleEntity, GroupRuleType } from "@/lib/definitions/groups"

export type GroupMemberRow = {
	user_id: string
	name: string
	email: string
	role: string | null
	groupId: string
}

export type GroupRuleRow = {
	id: string
	entity: GroupRuleEntity
	rule_type: GroupRuleType
	target_id: string
	created_at: string
	groupId: string
}
