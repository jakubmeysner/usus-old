<script lang="ts" setup>
import TimetableSimulatorUnitListItem from "@/components/views/timetable-simulator/TimetableSimulatorUnitListItem.vue"
import { useCourseIds } from "@/composables/views/timetable-simulator/course-ids"
import { useTermId } from "@/composables/views/timetable-simulator/term-id"
import type { Course, CourseEdition } from "@/stores/usos"
import { useUsosStore } from "@/stores/usos"
import { computed, onMounted, watch } from "vue"

const usosStore = useUsosStore()
const termId = useTermId()
const courseIds = useCourseIds()

const props = defineProps<{
    courseId: string
}>()

const course = computed<Course | undefined>(() => {
    return usosStore.courses[props.courseId]
})

const courseEdition = computed<CourseEdition | null | undefined>(() => {
    return usosStore.courseEditions[props.courseId]?.[termId.value ?? ""]
})

onMounted(async () => {
    if (course.value === undefined) {
        await usosStore.loadCourse(props.courseId)
    }
})

watch(
    () => [props.courseId, termId.value],
    async () => {
        if (termId.value === null) {
            return
        }

        await usosStore.loadCourseEdition(props.courseId, termId.value)
        const courseEdition =
            usosStore.courseEditions[props.courseId][termId.value]

        if (courseEdition === null) {
            return
        }

        await Promise.all(
            courseEdition.course_units_ids.map(async (unitId) => {
                await usosStore.loadCourseUnit(unitId)
                const courseUnit = usosStore.courseUnits[unitId]

                await Promise.all(
                    courseUnit.class_groups.map(async (group) => {
                        await usosStore.loadClassGroupDates(
                            unitId,
                            group.number,
                        )
                    }),
                )
            }),
        )
    },
    {
        immediate: true,
    },
)

function deleteCourse(): void {
    courseIds.value = courseIds.value
        .filter((courseId) => courseId !== props.courseId)
}
</script>

<template>
    <v-list-item
        v-if="course === undefined"
        title="..."
        :subtitle="props.courseId"
    />

    <v-list-group v-else>
        <template #activator="{ props }">
            <v-list-item
                :title="course.name.pl"
                :subtitle="course.id"
                v-bind="props"
            />
        </template>

        <template v-if="courseEdition?.course_units_ids !== undefined">
            <timetable-simulator-unit-list-item
                v-for="unitId in courseEdition.course_units_ids"
                :key="unitId"
                :course-id="props.courseId"
                :unit-id="unitId"
            />

            <v-list-item
                title="Usuń kurs"
                prepend-icon="mdi-minus"
                @click="deleteCourse()"
            />
        </template>
    </v-list-group>
</template>
