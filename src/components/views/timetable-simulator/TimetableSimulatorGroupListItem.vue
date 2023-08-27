<script lang="ts" setup>
import {
    Frequency,
    useClassGroupSchedule,
} from "@/composables/views/timetable-simulator/class-group-schedule"
import { useTermId } from "@/composables/views/timetable-simulator/term-id"
import { useUnitGroupNumber } from "@/composables/views/timetable-simulator/unit-group-number"
import { useUsosStore } from "@/stores/usos"
import type {
    Activity,
    BaseClassGroupActivity,
    CourseEdition,
} from "@/stores/usos"
import type { ClassGroup2Activity, ClassGroupActivity } from "@/stores/usos"
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
const schedule = useClassGroupSchedule(unitId, groupNumber)

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
    const components: string[] = []

    if (lecturer.value !== undefined) {
        components.push(
            `${lecturer.value.first_name} ${lecturer.value.last_name}`,
        )
    }

    if (schedule.value !== null) {
        components.push(
            `${dayNames[schedule.value.day]}, ${
                schedule.value.startHour
            }:${schedule.value.startMinute.toString().padStart(2, "0")}-${
                schedule.value.endHour
            }:${schedule.value.endMinute.toString().padStart(2, "0")}, ${
                frequencyNames[schedule.value.frequency]
            }`,
        )
    }

    return components.join(" — ")
})

const subtitle = computed(() => {
    const components: string[] = [`Grupa ${props.groupNumber}`]

    if (firstActivity.value?.building_id != null) {
        components.push(firstActivity.value.building_id.toString())
    }

    if (firstActivity.value?.room_number != null) {
        components.push(firstActivity.value.room_number)
    }

    return components.join(" — ")
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
        :active="unitGroupNumber === props.groupNumber"
        @click="unitGroupNumber = props.groupNumber"
    />
</template>
