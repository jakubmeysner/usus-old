<script lang="ts" setup>
import TimetableSimulatorGroupListItem from "@/components/views/timetable-simulator/TimetableSimulatorGroupListItem.vue"
import type {
    Activity,
    ClassGroup2Activity,
    ClassGroupActivity,
    CourseUnit,
} from "@/stores/usos"
import { useUsosStore } from "@/stores/usos"
import { computed } from "vue"

const usosStore = useUsosStore()

const props = defineProps<{
    courseId: string
    unitId: string
}>()

const unit = computed<CourseUnit | undefined>(() => {
    return usosStore.courseUnits[props.unitId]
})

const firstActivity = computed<
    ClassGroupActivity | ClassGroup2Activity | undefined
>(() => {
    const activities: Activity[] | undefined =
        usosStore.classGroupDates[props.unitId]?.[1]

    if (activities === undefined) {
        return undefined
    }

    return activities.find(
        (activity) =>
            activity.type === "classgroup" || activity.type === "classgroup2",
    ) as ClassGroupActivity | ClassGroup2Activity | undefined
})

const type = computed<string | undefined>(() => {
    return firstActivity.value?.classtype_name?.pl
})

const icon = computed<string | undefined>(() => {
    if (firstActivity.value === undefined) {
        return undefined
    }

    return `mdi-alpha-${firstActivity.value.classtype_id.toLowerCase()}`
})
</script>

<template>
    <v-list-item
        v-if="unit === undefined"
        title="..."
        :subtitle="props.unitId"
    />

    <v-list-group v-else>
        <template #activator="{ props }">
            <v-list-item
                :title="type"
                :subtitle="unit.id"
                :prepend-icon="icon"
                v-bind="props"
            />
        </template>

        <timetable-simulator-group-list-item
            v-for="group in unit.class_groups"
            :key="group.number"
            :course-id="props.courseId"
            :unit-id="props.unitId"
            :group-number="group.number"
        />
    </v-list-group>
</template>
