<script lang="ts" setup>
import { useCourseIds } from "@/composables/views/timetable-simulator/course-ids"
import { useTermId } from "@/composables/views/timetable-simulator/term-id"
import { useUsosStore } from "@/stores/usos"
import type { BaseClassGroupActivity, CourseEdition } from "@/stores/usos"
import type { CalendarOptions } from "@fullcalendar/core"
import plLocale from "@fullcalendar/core/locales/pl"
import timeGridPlugin from "@fullcalendar/timegrid"
import FullCalendar from "@fullcalendar/vue3"
import { computed } from "vue"
import { useRoute } from "vue-router"

const usosStore = useUsosStore()
const route = useRoute()
const courseIds = useCourseIds()
const termId = useTermId()

const activities = computed(() => {
    const activities: BaseClassGroupActivity[] = []

    for (const courseId of courseIds.value) {
        const courseEdition: CourseEdition | undefined | null =
            usosStore.courseEditions[courseId]?.[termId.value ?? ""]

        if (courseEdition == null) {
            continue
        }

        for (const unitId of courseEdition.course_units_ids) {
            const unit = usosStore.courseUnits[unitId]

            if (unit === undefined) {
                continue
            }

            const queryKey = `unitGroupNumber[${unitId}]`
            const queryValue = route.query[queryKey]

            const groupNumber = Array.isArray(queryValue)
                ? Number(queryValue[0])
                : Number(queryValue ?? 1)

            activities.push(
                ...((usosStore.classGroupDates[unitId]?.[groupNumber]?.filter(
                    (activity) =>
                        activity.type === "classgroup" ||
                        activity.type === "classgroup2",
                ) as BaseClassGroupActivity[]) ?? []),
            )
        }
    }

    return activities
})

const firstActivityDate = computed(() => {
    const firstActivity = [...activities.value].sort(
        (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )[0]

    if (firstActivity === undefined) {
        return null
    }

    return new Date(
        [...activities.value].sort(
            (a, b) =>
                new Date(a.start_time).getTime() -
                new Date(b.start_time).getTime(),
        )[0].start_time,
    )
})

const options = computed<CalendarOptions>(() => ({
    plugins: [timeGridPlugin],
    locale: plLocale,
    initialView: "timeGridWeek",
    editable: false,
    events: activities.value.map((activity) => ({
        start: new Date(activity.start_time),
        end: new Date(activity.end_time),
        title: `${activity.classtype_id} — ${activity.course_name.pl}`,
        backgroundColor:
            activity.classtype_id === "W"
                ? "#4CAF50"
                : activity.classtype_id === "C"
                ? "#9C27B0"
                : activity.classtype_id === "L"
                ? "#3F51B5"
                : "#FF5722",
    })),
    initialDate: firstActivityDate.value ?? new Date(),
    slotMinTime: "7:30:00",
    slotMaxTime: "20:35:00",
    expandRows: true,
    height: "80vh",
}))
</script>

<template>
    <v-card>
        <template #title>Plan</template>

        <template #text>
            <full-calendar
                v-if="firstActivityDate !== null"
                :options="options"
            />
        </template>
    </v-card>
</template>

<style>
:root {
    --fc-page-bg-color: none;
}
</style>
