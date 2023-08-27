<script lang="ts" setup>
import TimetableSimulatorAddCourse from "@/components/views/timetable-simulator/TimetableSimulatorAddCourse.vue"
import TimetableSimulatorCourseList from "@/components/views/timetable-simulator/TimetableSimulatorCourseList.vue"
</script>

<template>
    <v-card>
        <template #title>Kursy</template>

        <template #text>
            <timetable-simulator-course-list
                class="overflow-y-auto"
                style="max-height: 70vh"
            />
        </template>

        <template #actions>
            <timetable-simulator-add-course />
        </template>
    </v-card>
</template>
