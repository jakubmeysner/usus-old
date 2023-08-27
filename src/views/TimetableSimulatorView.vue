<script lang="ts" setup>
import TimetableSimulatorCourses from "@/components/views/timetable-simulator/TimetableSimulatorCourses.vue"
import TimetableSimulatorTermSelect from "@/components/views/timetable-simulator/TimetableSimulatorTermSelect.vue"
import TimetableSimulatorTimetable from "@/components/views/timetable-simulator/TimetableSimulatorTimetable.vue"
</script>

<template>
    <v-main>
        <v-container>
            <v-row>
                <v-col cols="12" xl="8">
                    <timetable-simulator-timetable />
                </v-col>

                <v-col cols="12" xl="4">
                    <timetable-simulator-term-select />
                    <timetable-simulator-courses class="mt-6" />
                </v-col>
            </v-row>
        </v-container>
    </v-main>
</template>
