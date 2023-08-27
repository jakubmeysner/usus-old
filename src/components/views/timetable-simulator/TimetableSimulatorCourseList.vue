<script lang="ts" setup>
import TimetableSimulatorCourseListItem from "@/components/views/timetable-simulator/TimetableSimulatorCourseListItem.vue"
import { useCourseIds } from "@/composables/views/timetable-simulator/course-ids"

const courseIds = useCourseIds()
</script>

<template>
    <v-list>
        <timetable-simulator-course-list-item
            v-for="courseId in courseIds"
            :key="courseId"
            :course-id="courseId"
        />
    </v-list>
</template>
