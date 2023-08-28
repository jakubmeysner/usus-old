<script lang="ts" setup>
import type { Schedule } from "@/composables/views/timetable-simulator/class-group-schedule"
import { Frequency, getClassGroupSchedule } from "@/composables/views/timetable-simulator/class-group-schedule"
import { useCourseIds } from "@/composables/views/timetable-simulator/course-ids"
import { useTermId } from "@/composables/views/timetable-simulator/term-id"
import type { BaseClassGroupActivity, ClassGroup2Activity, ClassGroupActivity, CourseEdition } from "@/stores/usos"
import { useUsosStore } from "@/stores/usos"
import type { CalendarOptions, EventInput } from "@fullcalendar/core"
import plLocale from "@fullcalendar/core/locales/pl"
import timeGridPlugin from "@fullcalendar/timegrid"
import FullCalendar from "@fullcalendar/vue3"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

const usosStore = useUsosStore()
const route = useRoute()
const courseIds = useCourseIds()
const termId = useTermId()

const groups = computed<[string, number][]>(() => {
    const groups: [string, number][] = []

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

            groups.push([unitId, groupNumber])
        }
    }

    return groups
})

const schedules = computed<Schedule[]>(() => {
    const schedules: Schedule[] = []

    for (const [unitId, groupNumber] of groups.value) {
        const activities = ((usosStore.classGroupDates[unitId]?.[groupNumber]?.filter(
            (activity) =>
                activity.type === "classgroup" ||
                activity.type === "classgroup2",
        ) as (ClassGroupActivity | ClassGroup2Activity)[]) ?? [])

        const schedule = getClassGroupSchedule(
            activities,
        )

        if (schedule !== null) {
            schedules.push(schedule)
        }
    }

    return schedules
})

const activities = computed(() => {
    const activities: BaseClassGroupActivity[] = []

    for (const [unitId, groupNumber] of groups.value) {
        activities.push(
            ...((usosStore.classGroupDates[unitId]?.[groupNumber]?.filter(
                (activity) =>
                    activity.type === "classgroup" ||
                    activity.type === "classgroup2",
            ) as BaseClassGroupActivity[]) ?? []),
        )
    }

    return activities
})

const termView = ref(true)

const events = computed<EventInput[]>(() => {
    if (termView.value) {
        return schedules.value.map((schedule) => {
            let title = `${schedule.secondActivity.classtype_id} — ${
                schedule.secondActivity.course_name.pl
            }`

            if (schedule.frequency === Frequency.BIWEEKLY_A) {
                title += " — co 2 tygodnie (A)"
            } else if (schedule.frequency === Frequency.BIWEEKLY_B) {
                title += " — co 2 tygodnie (B)"
            }

            return {
                start: new Date(
                    1973,
                    0,
                    schedule.day === 0 ? 7 : schedule.day,
                    schedule.startHour,
                    schedule.startMinute,
                ),
                end: new Date(
                    1973,
                    0,
                    schedule.day === 0 ? 7 : schedule.day,
                    schedule.endHour,
                    schedule.endMinute,
                ),
                title,
                backgroundColor:
                    schedule.secondActivity.classtype_id === "W"
                        ? "#4CAF50"
                        : schedule.secondActivity.classtype_id === "C"
                            ? "#9C27B0"
                            : schedule.secondActivity.classtype_id === "L"
                                ? "#3F51B5"
                                : "#FF5722",
            }
        })
    } else {
        return activities.value.map((activity) => ({
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
        }))
    }
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
    events: events.value,
    initialDate: termView.value
        ? new Date(1973, 0)
        : firstActivityDate.value ?? new Date(),
    slotMinTime: "7:30:00",
    slotMaxTime: "20:35:00",
    expandRows: true,
    height: "80vh",
    validRange: termView.value
        ? {
            start: new Date(1973, 0),
            end: new Date(1973, 0, 8),
        }
        : undefined,
    dayHeaderFormat: termView.value
        ? {
            weekday: "long",
        }
        : undefined,
    headerToolbar: termView.value ? false : undefined,
}))
</script>

<template>
    <v-card>
        <template #title>
            <div class="d-flex justify-space-between align-center">
                <div>
                    Plan
                </div>

                <div>
                    <v-switch
                        v-model="termView"
                        label="Widok semestralny"
                        hide-details
                        class="mt-0"
                        density="comfortable"
                        color="primary"
                    />
                </div>
            </div>
        </template>

        <template v-if="firstActivityDate !== null" #text>
            <full-calendar
                v-if="termView"
                :options="options"
            />

            <full-calendar
                v-else
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
