<script lang="ts" setup>
import { useCourseIds } from "@/composables/views/timetable-simulator/course-ids"
import { useUsosStore } from "@/stores/usos"
import type { Course } from "@/stores/usos"
import { computed, ref, watch } from "vue"

const usosStore = useUsosStore()
const dialog = ref(false)
const courseId = ref("")
const loading = ref(false)

watch(dialog, (value) => {
    if (!value) {
        courseId.value = ""
    }
})

const courseIds = useCourseIds()

async function addCourse() {
    try {
        error.value = null
        loading.value = true

        if (courseId.value in usosStore.courses) {
            if (!courseIds.value.includes(courseId.value)) {
                courseIds.value = [...courseIds.value, courseId.value]
            }

            dialog.value = false
        } else {
            await usosStore.loadCourse(courseId.value)
            dialog.value = false

            const courseResponse = await fetch(
                `https://apps.usos.pwr.edu.pl/services/courses/course?course_id=${courseId.value}&fields=id|name|homepage_url|profile_url|is_currently_conducted|terms|fac_id|lang_id|ects_credits_simplified`,
            )

            if (courseResponse.status === 200) {
                const course = (await courseResponse.json()) as Course
                usosStore.courses[course.id] = course

                if (!courseIds.value.includes(course.id)) {
                    courseIds.value = [...courseIds.value, course.id]
                }

                dialog.value = false
            } else if (courseResponse.status === 400) {
                error.value = AddCourseError.COURSE_ID_DOES_NOT_EXIST
            } else {
                throw new Error(
                    `Response was unsuccessful, status: ${courseResponse.status}`,
                )
            }
        }
    } catch (e: any) {
        console.error(e)

        if (e.message === "Course with given ID does not exist") {
            error.value = AddCourseError.COURSE_ID_DOES_NOT_EXIST
        } else {
            error.value = AddCourseError.UNEXPECTED_ERROR
        }
    } finally {
        loading.value = false
    }
}

enum AddCourseError {
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
    COURSE_ID_DOES_NOT_EXIST = "COURSE_ID_DOES_NOT_EXIST",
}

const error = ref<AddCourseError | null>(null)

const errorMessage = computed(() => {
    switch (error.value) {
        case AddCourseError.COURSE_ID_DOES_NOT_EXIST:
            return "Nie istnieje kurs o takim kodzie!"
    }

    return null
})
</script>

<template>
    <v-dialog v-model="dialog" max-width="600">
        <template #activator="{ props }">
            <v-btn text="Dodaj kurs" v-bind="props" />
        </template>

        <v-card title="Dodawanie kursu" :loading="loading">
            <template #text>
                <v-text-field
                    v-model="courseId"
                    label="Kod kursu"
                    hint="Np. W04IST-SI0019G"
                    persistent-hint
                    @keydown.enter="addCourse()"
                />
            </template>

            <template #actions>
                <v-btn text="Dodaj kurs" @click="addCourse()" />
            </template>
        </v-card>

        <v-snackbar
            :model-value="error !== null"
            :timeout="-1"
            color="error"
            @update:model-value="error = null"
        >
            {{ errorMessage }}
        </v-snackbar>
    </v-dialog>
</template>
