<script lang="ts" setup>
import {
    Frequency,
    useClassGroupSchedules,
} from "@/composables/views/timetable-simulator/class-group-schedule"
import { useTermId } from "@/composables/views/timetable-simulator/term-id"
import { useUnitGroupNumber } from "@/composables/views/timetable-simulator/unit-group-number"
import type {
    Activity,
    BaseClassGroupActivity,
    ClassGroup2Activity,
    ClassGroupActivity,
    CourseEdition,
} from "@/stores/usos"
import { useUsosStore } from "@/stores/usos"
import { computed } from "vue"

const usosStore = useUsosStore()
const termId = useTermId()

const props = defineProps<{
    courseId: string
    unitId: string
    groupNumber: number
}>()

const courseEdition = computed<CourseEdition | undefined | null>(() => {
    return usosStore.courseEditions[props.courseId]?.[termId.value ?? ""]
})

const activities = computed<Activity[] | undefined>(() => {
    return usosStore.classGroupDates[props.unitId]?.[props.groupNumber]
})

const firstActivity = computed<BaseClassGroupActivity | undefined>(() => {
    return activities.value?.find(
        (activity) =>
            activity.type === "classgroup" || activity.type === "classgroup2",
    ) as ClassGroupActivity | ClassGroup2Activity | undefined
})

const lecturerId = computed(() => {
    return firstActivity.value?.lecturer_ids[0]
})

const lecturer = computed(() => {
    if (courseEdition.value == null || lecturerId.value === undefined) {
        return undefined
    }

    return courseEdition.value.lecturers.find(
        (lecturer) => lecturer.id === String(lecturerId.value),
    )
})

const unitId = computed(() => props.unitId)
const unitGroupNumber = useUnitGroupNumber(unitId)

const groupNumber = computed(() => props.groupNumber)
const schedules = useClassGroupSchedules(unitId, groupNumber)
const participantCount = computed(
    () =>
        usosStore.classGroupParticipantCount[unitId.value]?.[groupNumber.value],
)

const dayNames: Record<number, string> = {
    0: "niedziela",
    1: "poniedziałek",
    2: "wtorek",
    3: "środa",
    4: "czwartek",
    5: "piątek",
    6: "sobota",
}

const frequencyNames: Record<Frequency, string> = {
    [Frequency.WEEKLY]: "co tydzień",
    [Frequency.BIWEEKLY_A]: "co 2 tygodnie (A)",
    [Frequency.BIWEEKLY_B]: "co 2 tygodnie (B)",
}

const title = computed(() => {
    const components: string[] = [`Grupa ${props.groupNumber}`]

    if (lecturer.value !== undefined) {
        components.push(
            `${lecturer.value.first_name} ${lecturer.value.last_name}`,
        )
    }

    if (firstActivity.value?.building_id != null) {
        components.push(firstActivity.value.building_id.toString())
    }

    if (firstActivity.value?.room_number != null) {
        components.push(firstActivity.value.room_number)
    }

    if (participantCount.value !== undefined) {
        components.push(
            `${participantCount.value.count}/${participantCount.value.limit}`,
        )
    }

    return components.join(" — ")
})

const subtitle = computed(() => {
    const components: string[] = []

    if (schedules.value !== null) {
        components.push(
            schedules.value
                .map(
                    (schedule) =>
                        `${dayNames[schedule.day]}, ${
                            schedule.startHour
                        }:${schedule.startMinute.toString().padStart(2, "0")}-${
                            schedule.endHour
                        }:${schedule.endMinute.toString().padStart(2, "0")}, ${
                            frequencyNames[schedule.frequency]
                        }`,
                )
                .join("; "),
        )
    }

    return components.join(" — ")
})

const baseColor = computed(() => {
    if (participantCount.value === undefined) {
        return undefined
    }

    if (participantCount.value.count >= participantCount.value.limit) {
        return "red-accent-1"
    }

    if (participantCount.value.count / participantCount.value.limit >= 0.75) {
        return "orange-accent-1"
    }

    return undefined
})
</script>

<template>
    <v-list-item
        v-if="activities === undefined"
        title="..."
        :subtitle="props.groupNumber"
    />

    <v-list-item
        v-else
        :title="title"
        :subtitle="subtitle"
        :prepend-icon="
            unitGroupNumber === props.groupNumber
                ? 'mdi-radiobox-marked'
                : 'mdi-radiobox-blank'
        "
        :base-color="baseColor"
        :active="unitGroupNumber === props.groupNumber"
        @click="unitGroupNumber = props.groupNumber"
    />
</template>
